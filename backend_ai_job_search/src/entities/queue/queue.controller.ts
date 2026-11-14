import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
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
 * Identifiers are accepted in the request body (project convention) and, for
 * deletion, additionally as a `:id` path segment so REST clients can use
 * `DELETE /jobs/:id`.
 */
@Controller('jobs')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  // ------------------------------------------------------------------ read

  @Get()
  async getAll(@Query() query: ListJobsQueryDto) {
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

  /** Body-based deletion, matching the other entity controllers. */
  @Delete('delete')
  async removeByBody(@Body() dto: JobIdDto) {
    Logger.log('DELETE', '/jobs/delete');
    return await this.queueService.deleteJobById(dto.id);
  }

  /** REST-style deletion by primary key. */
  @Delete(':id')
  async remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    Logger.log('DELETE', `/jobs/${id}`);
    return await this.queueService.deleteJobById(id);
  }
}
