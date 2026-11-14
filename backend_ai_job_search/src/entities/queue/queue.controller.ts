import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { JsonBodyInterceptor } from '@/common/interceptors/index.js';
import { QueueService } from './queue.service.js';
import { CreateJobDto } from './dto/create-job.dto.js';
import { JobIdDto } from './dto/job-id.dto.js';
import { LockJobDto } from './dto/lock-job.dto.js';
import { UpdateJobDto } from './dto/update-job.dto.js';
import { FailJobDto } from './dto/fail-job.dto.js';
import { CompleteJobDto } from './dto/complete-job.dto.js';
import { ListJobsQueryDto } from './dto/list-jobs.query.js';

/**
 * HTTP surface of the background job queue.
 *
 * Every endpoint reads its input from the request body: `JsonBodyInterceptor`
 * normalises raw/double-encoded JSON into an object and the DTO of each route
 * validates it (the global `ValidationPipe` rejects missing, unknown or
 * malformed fields). No route declares a `:param` segment.
 */
@Controller('jobs')
@UseInterceptors(JsonBodyInterceptor)
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  // ------------------------------------------------------------------ read

  @Get()
  async getAll(@Query() query: ListJobsQueryDto) {
    return await this.queueService.findAll(query);
  }

  /** Same filters as `GET /jobs`, sent as a validated JSON body. */
  @Post('list')
  @HttpCode(HttpStatus.OK)
  async list(@Body() query: ListJobsQueryDto) {
    Logger.log('POST', '/jobs/list');
    return await this.queueService.findAll(query);
  }

  @Post('find')
  @HttpCode(HttpStatus.OK)
  async getOne(@Body() dto: JobIdDto) {
    Logger.log('POST', '/jobs/find');
    return await this.queueService.findOneById(dto.id);
  }

  // ---------------------------------------------------------------- create

  @Post()
  async create(@Body() createJobDto: CreateJobDto) {
    Logger.log('POST', '/jobs');
    return await this.queueService.createJob(createJobDto);
  }

  // ------------------------------------------------------------------ lock

  /**
   * Claims the next available job. Returns `null` when the queue is empty.
   * `FOR UPDATE SKIP LOCKED` guarantees that two workers never receive the
   * same job.
   */
  @Post('lock')
  @HttpCode(HttpStatus.OK)
  async lock(@Body() dto: LockJobDto) {
    Logger.log('POST', '/jobs/lock');
    return await this.queueService.lockNextJob(dto);
  }

  /** Alias of `POST /jobs/lock` for workers that prefer a PATCH verb. */
  @Patch('next')
  @HttpCode(HttpStatus.OK)
  async next(@Body() dto: LockJobDto) {
    Logger.log('PATCH', '/jobs/next');
    return await this.queueService.lockNextJob(dto);
  }

  // ---------------------------------------------------------------- update

  /** Partial update: `id` selects the job, only the columns sent are changed. */
  @Patch('update')
  async update(@Body() updateJobDto: UpdateJobDto) {
    Logger.log('PATCH', '/jobs/update');
    return await this.queueService.updateJob(updateJobDto);
  }

  /** Releases a job for a retry (exponential backoff) or marks it as failed. */
  @Post('fail')
  @HttpCode(HttpStatus.OK)
  async fail(@Body() dto: FailJobDto) {
    Logger.log('POST', '/jobs/fail');
    return await this.queueService.failJob(dto);
  }

  // -------------------------------------------------------------- complete

  /** Stores the optional result, then removes the job from the queue. */
  @Post('complete')
  @HttpCode(HttpStatus.OK)
  async complete(@Body() dto: CompleteJobDto) {
    Logger.log('POST', '/jobs/complete');
    return await this.queueService.completeJobAndDelete(dto);
  }

  // ---------------------------------------------------------------- delete

  /**
   * Deletes a job selected by the uuid in the JSON body. This is the canonical
   * delete endpoint: like every other route, it validates a JSON payload
   * instead of a `:id` path segment.
   */
  @Delete()
  async remove(@Body() dto: JobIdDto) {
    Logger.log('DELETE', '/jobs');
    return await this.queueService.deleteJobById(dto.id);
  }

  /** Backwards-compatible alias of `DELETE /jobs` with the same JSON body. */
  @Delete('delete')
  async removeAlias(@Body() dto: JobIdDto) {
    Logger.log('DELETE', '/jobs/delete');
    return await this.queueService.deleteJobById(dto.id);
  }
}
