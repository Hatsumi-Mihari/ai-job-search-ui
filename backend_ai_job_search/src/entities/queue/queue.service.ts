import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { Measure } from '@/common/services/index.js';
import { JobEntity, JobStatus } from './queue.entity.js';
import { CreateJobDto } from './dto/create-job.dto.js';
import { CompleteJobDto } from './dto/complete-job.dto.js';
import { FailJobDto } from './dto/fail-job.dto.js';
import { ListJobsQueryDto } from './dto/list-jobs.query.js';
import { LockJobDto } from './dto/lock-job.dto.js';
import { UpdateJobDto } from './dto/update-job.dto.js';
import { computeRetryDelayMs, isJsonObject, isUuid } from './utils/job.util.js';

/** Result returned by every mutating operation that does not return the job. */
export type JobMutationResult = {
  success: boolean;
  message: string;
  id: string;
};

/** Result returned when a job is released back to the queue or given up. */
export type JobFailureResult = {
  success: boolean;
  message: string;
  id: string;
  status: JobStatus;
  attempts: number;
  available_at: Date | null;
};

@Injectable()
export class QueueService {
  /** Columns a client is allowed to write through `PATCH /jobs/update`. */
  private static readonly EDITABLE_FIELDS: ReadonlyArray<keyof UpdateJobDto> = [
    'status',
    'step',
    'payload',
    'result',
    'error',
    'max_attempts',
    'available_at',
  ];

  constructor(
    @InjectRepository(JobEntity)
    private readonly jobRepository: Repository<JobEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  // ---------------------------------------------------------------- create

  @Measure('QueueService')
  async createJob(dto: CreateJobDto): Promise<JobMutationResult> {
    const job = this.jobRepository.create({
      type: dto.type,
      status: JobStatus.PENDING,
      step: dto.step ?? null,
      payload: isJsonObject(dto.payload) ? dto.payload : null,
      max_attempts: dto.max_attempts ?? 3,
      attempts: 0,
      available_at: dto.available_at ? new Date(dto.available_at) : new Date(),
    });

    Logger.log(`createJob type=${dto.type}`, 'QueueService');

    const saved = await this.jobRepository.save(job);

    return {
      success: true,
      message: 'Job successfully queued',
      id: saved.id,
    };
  }

  // ------------------------------------------------------------------ read

  /**
   * Returns every job matching the query-string filters, with all entity
   * fields serialised as JSON:
   * `{ filters, total, results: [{ id, type, status, step, payload, ... }] }`.
   */
  async findAll(filters: ListJobsQueryDto = {}): Promise<JobEntity[]> {
    const where: FindOptionsWhere<JobEntity> = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.step) {
      where.step = filters.step;
    }

    return await this.jobRepository.find({
      where,
      order: { created_at: 'DESC' },
    });
  }

  @Measure('QueueService')
  async findOneById(id: string): Promise<JobEntity> {
    this.assertValidId(id);

    const job = await this.jobRepository.findOneBy({ id });

    if (!job) {
      throw new NotFoundException(`Job with id ${id} not found`);
    }

    return job;
  }

  // ------------------------------------------------------------------ lock

  /**
   * Atomically claims the next available pending job for a worker.
   *
   * The row is locked with `FOR UPDATE SKIP LOCKED` inside a transaction, so
   * concurrent workers skip rows that another worker is already locking
   * instead of blocking on them. The status transition and the attempt
   * counter are committed together with the lock.
   *
   * @returns the claimed job, or `null` when the queue has no work left.
   */
  @Measure('QueueService')
  async lockNextJob(dto: LockJobDto = {}): Promise<JobEntity | null> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const query = queryRunner.manager
        .createQueryBuilder(JobEntity, 'job')
        .setLock('pessimistic_write')
        .setOnLocked('skip_locked')
        .where('job.status = :status', { status: JobStatus.PENDING })
        .andWhere('job.available_at <= CURRENT_TIMESTAMP')
        .orderBy('job.available_at', 'ASC')
        .addOrderBy('job.created_at', 'ASC')
        .limit(1);

      if (dto.type) {
        query.andWhere('job.type = :type', { type: dto.type });
      }

      const job = await query.getOne();

      if (!job) {
        await queryRunner.commitTransaction();
        Logger.log(`lockNextJob empty type=${dto.type ?? '*'}`, 'QueueService');
        return null;
      }

      job.status = JobStatus.PROCESSING;
      job.attempts += 1;

      const claimed = await queryRunner.manager.save(job);

      await queryRunner.commitTransaction();

      Logger.log(
        `lockNextJob id=${claimed.id} attempts=${claimed.attempts}`,
        'QueueService',
      );

      return claimed;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ---------------------------------------------------------------- update

  /**
   * Partial update used by workers to advance a chain (step, result, status).
   * Only the fields present in the payload are changed.
   */
  @Measure('QueueService')
  async updateJob(dto: UpdateJobDto): Promise<JobMutationResult> {
    const job = await this.findOneById(dto.id);

    const changes: Partial<JobEntity> = {};
    const writableChanges = changes as Record<string, unknown>;

    for (const field of QueueService.EDITABLE_FIELDS) {
      const value = dto[field];

      if (value === undefined) {
        continue;
      }

      writableChanges[field] =
        field === 'available_at' ? new Date(value as string) : value;
    }

    if (Object.keys(changes).length === 0) {
      throw new BadRequestException('No editable fields were provided');
    }

    this.jobRepository.merge(job, changes);

    await this.jobRepository.save(job);

    Logger.log(`updateJob id=${dto.id}`, 'QueueService');

    return {
      success: true,
      message: 'Job successfully updated',
      id: dto.id,
    };
  }

  /**
   * Reports a failed execution. While the retry budget lasts the job goes back
   * to `pending` with an exponential backoff on `available_at`; otherwise it is
   * marked as `failed` and stays in the queue for inspection.
   */
  @Measure('QueueService')
  async failJob(dto: FailJobDto): Promise<JobFailureResult> {
    const job = await this.findOneById(dto.id);

    job.error = dto.error;

    const canRetry = job.attempts < job.max_attempts;

    if (canRetry) {
      job.status = JobStatus.PENDING;
      job.available_at = new Date(Date.now() + computeRetryDelayMs(job.attempts));
    } else {
      job.status = JobStatus.FAILED;
    }

    await this.jobRepository.save(job);

    Logger.log(
      `failJob id=${job.id} status=${job.status} attempts=${job.attempts}`,
      'QueueService',
    );

    return {
      success: true,
      message: canRetry
        ? 'Job released for retry'
        : 'Job marked as failed, retry budget exhausted',
      id: job.id,
      status: job.status,
      attempts: job.attempts,
      available_at: canRetry ? job.available_at : null,
    };
  }

  // -------------------------------------------------------------- complete

  /**
   * Final step of a successful chain: stores the optional result and removes
   * the row, so completed work never accumulates in the queue table.
   */
  @Measure('QueueService')
  async completeJobAndDelete(dto: CompleteJobDto): Promise<JobMutationResult> {
    const job = await this.findOneById(dto.id);

    if (isJsonObject(dto.result)) {
      job.result = dto.result;
      job.status = JobStatus.COMPLETED;
      await this.jobRepository.save(job);
    }

    await this.jobRepository.delete({ id: job.id });

    Logger.log(`completeJobAndDelete id=${job.id}`, 'QueueService');

    return {
      success: true,
      message: 'Job successfully completed and removed from the queue',
      id: job.id,
    };
  }

  // ---------------------------------------------------------------- delete

  /** Deletes a job by its primary key (cleanup / manual removal). */
  @Measure('QueueService')
  async deleteJobById(id: string): Promise<JobMutationResult> {
    const job = await this.findOneById(id);

    await this.jobRepository.delete({ id: job.id });

    Logger.log(`deleteJobById id=${id}`, 'QueueService');

    return {
      success: true,
      message: 'Job successfully deleted',
      id,
    };
  }

  // --------------------------------------------------------------- helpers

  private assertValidId(id: string): void {
    if (!isUuid(id)) {
      throw new BadRequestException('Job id must be a valid uuid');
    }
  }
}
