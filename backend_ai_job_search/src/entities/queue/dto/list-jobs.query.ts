import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { JobStatus } from '../queue.entity.js';

/**
 * Filters for `GET /jobs`, read from the query string (never from the request
 * body). Every filter is optional and they can be combined, e.g.
 * `GET /jobs?status=pending&type=vacancy_processing_chain`.
 */
export class ListJobsQueryDto {
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus; // Filter by lifecycle state

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  type?: string; // Filter by task / chain type

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  step?: string; // Filter by current chain step, e.g. 'WAIT_AI'
}
