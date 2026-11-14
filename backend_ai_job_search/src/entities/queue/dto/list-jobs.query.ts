import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { JobStatus } from '../queue.entity.js';

/**
 * Filters for `GET /jobs` (query string) and `POST /jobs/list` (JSON body).
 * Both filters are optional and can be combined, e.g. `?status=processing`.
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
}
