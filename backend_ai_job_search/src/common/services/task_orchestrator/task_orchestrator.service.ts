import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { Measure } from '@/common/services/logger/logger.decorator.js';
import { JobEntity, JobStatus } from '@/entities/queue/queue.entity.js';
import { QueueService } from '@/entities/queue/queue.service.js';
import { normalizeErrorMessage } from './utils/task-orchestrator.util.js';
import { OnEvent } from '@nestjs/event-emitter';
import { WorkerRegistry } from './worker_reg.service.js';

const CONTEXT = 'TaskOrchestratorService';

/**
 * Database-driven background task orchestrator.
 *
 * The queue itself lives entirely in the `jobs` table: no task id or task
 * object is kept in memory. A worker slot is reserved in memory only while a
 * task is being executed, so a restart never loses pending work and the app
 * never holds a copy of the whole queue in RAM.
 *
 * Concurrency is capped at {@link TaskOrchestratorService.maxConcurrent}
 * workers. Each finished task is deleted from the database, then the table is
 * immediately re-scanned so a freed slot is handed to the next pending task.
 */
@Injectable()
export class TaskOrchestratorService implements OnModuleDestroy {
  /** Number of tasks currently executing (never more than `maxConcurrent`). */
  private activeWorkersCount = 0;

  /** Maximum number of tasks this instance may execute at the same time. */
  private readonly maxConcurrent = 3;


  /** Prevents two concurrent scans from claiming the same pending rows. */
  private isDispatching = false;

  /** Set on shutdown so no new work is claimed during teardown. */
  private isShuttingDown = false;

  constructor(
    @InjectRepository(JobEntity)
    private readonly jobRepository: Repository<JobEntity>,
    private readonly queueService: QueueService,
    private readonly workerRegistry: WorkerRegistry,
  ) {}

  // --------------------------------------------------------------- trigger

  /**
   * Triggers the execution of a task that was already saved in the database.
   *
   * The call is non-blocking: the task is claimed atomically from the `jobs`
   * table and handed to a worker slot. When all slots are busy the task is
   * simply left `pending` in the database; it will be picked up as soon as a
   * worker finishes, instead of being buffered in memory.
   *
   * Other modules receive this service through DI (the module is `@Global()`)
   * and call `triggerTask(job.id)` after persisting a job.
   */
  @OnEvent('task.created', { async: true })
  async triggerTask(payload: { taskId: string }): Promise<void> {
    Logger.log(`Task ${payload.taskId} triggered`, CONTEXT);

    void this.processTask(payload.taskId);
    //void this.drain();
  }

  // --------------------------------------------------------------- process

  /**
   * Processes one persisted task.
   *
   * The only argument is the task id: the row is read from the database, so a
   * task can also be recovered after a restart. A slot is reserved before the
   * first `await`, which keeps `activeWorkersCount` exact even when several
   * triggers arrive at the same time. The task is claimed with
   * `FOR UPDATE SKIP LOCKED` by the queue service, so two instances can never
   * execute the same row.
   *
   * On success the row is deleted from the database. On failure the queue
   * service applies the retry/backoff policy. In both cases the slot is
   * released and the table is immediately scanned for new pending tasks.
   */
  @Measure('TaskOrchestratorService')
  async processTask(taskId: string): Promise<void> {
    if (this.isShuttingDown) {
      Logger.log(`Shutdown in progress, task ${taskId} left pending`, CONTEXT);
      return;
    }

    if (this.activeWorkersCount >= this.maxConcurrent) {
      Logger.log(
        `No free worker slot (${this.activeWorkersCount}/${this.maxConcurrent}), task ${taskId} deferred`,
        CONTEXT,
      );
      return;
    }

    // Reserved synchronously, before the claim, so parallel triggers cannot
    // exceed `maxConcurrent`.
    this.activeWorkersCount += 1;

    let claimedType: string | null = null;

    Logger.log(
      `Picked up task ${taskId} (active ${this.activeWorkersCount}/${this.maxConcurrent})`,
      CONTEXT,
    );

    try {
      const claim = await this.queueService.lockNextJob({ id: taskId });

      if (!claim.found || !claim.task) {
        Logger.log(
          `Task ${taskId} is not awaiting execution, skipped`,
          CONTEXT,
        );
        return;
      }

      claimedType = claim.task.type;

      const processor = this.workerRegistry.get(claimedType);

      if (!processor) {
        throw new Error(
          `No processor registered for job type '${claimedType}'`,
        );
      }

      await processor(taskId);

      await this.queueService.completeJobAndDelete({ id: taskId });

      Logger.log(
        `Task ${taskId} completed and removed from the database`,
        CONTEXT,
      );
    } catch (error) {
      await this.reportFailure(taskId, claimedType, error);
    } finally {
      this.activeWorkersCount -= 1;

      Logger.log(
        `Worker slot released for task ${taskId} (active ${this.activeWorkersCount}/${this.maxConcurrent})`,
        CONTEXT,
      );

      // The task is gone from the table: look for the next pending rows now
      // rather than waiting for an external trigger.
      void this.drain();
    }
  }

  // ----------------------------------------------------------------- drain

  /**
   * Scans the `jobs` table for tasks that are due and hands up to the number
   * of free worker slots to {@link processTask}. Only ids are read, and only
   * for the duration of the call: the queue never lives in memory.
   */
  private async drain(): Promise<void> {
    if (this.isShuttingDown || this.isDispatching) {
      return;
    }

    const freeSlots = this.maxConcurrent - this.activeWorkersCount;

    if (freeSlots <= 0) {
      Logger.log(
        `Worker pool saturated (${this.activeWorkersCount}/${this.maxConcurrent})`,
        CONTEXT,
      );
      return;
    }

    this.isDispatching = true;

    try {
      const pending = await this.jobRepository.find({
        select: { id: true },
        where: {
          status: JobStatus.PENDING,
          available_at: LessThanOrEqual(new Date()),
        },
        order: { available_at: 'ASC', created_at: 'ASC' },
        take: freeSlots,
      });

      if (pending.length === 0) {
        return;
      }

      Logger.log(`Dispatching ${pending.length} pending task(s)`, CONTEXT);

      for (const job of pending) {
        if (this.activeWorkersCount >= this.maxConcurrent) {
          break;
        }

        void this.processTask(job.id);
      }
    } catch (error) {
      Logger.error(
        `Queue scan failed: ${normalizeErrorMessage(error)}`,
        CONTEXT,
      );
    } finally {
      this.isDispatching = false;
    }
  }

  // --------------------------------------------------------------- failure

  /**
   * Sends a failed execution back to the queue service. A failure that
   * happened before the task was claimed (missing, already claimed elsewhere,
   * invalid id) is only logged: the row belongs to another worker or is gone,
   * so it must not be modified.
   */
  private async reportFailure(
    taskId: string,
    claimedType: string | null,
    error: unknown,
  ): Promise<void> {
    const message = normalizeErrorMessage(error);

    if (!claimedType) {
      Logger.warn(`Task ${taskId} could not be claimed: ${message}`, CONTEXT);
      return;
    }

    try {
      const outcome = await this.queueService.failJob({
        id: taskId,
        error: message,
      });

      Logger.warn(
        `Task ${taskId} failed (${outcome.message}): ${message}`,
        CONTEXT,
      );
    } catch (failureError) {
      Logger.error(
        `Could not report failure for task ${taskId}: ${normalizeErrorMessage(failureError)}`,
        CONTEXT,
      );
    }
  }

  // -------------------------------------------------------------- lifecycle

  /** Stops claiming new tasks while the current ones finish. */
  onModuleDestroy(): void {
    this.isShuttingDown = true;

    Logger.log(
      `Shutdown requested, ${this.activeWorkersCount} worker(s) still running`,
      CONTEXT,
    );
  }
}
