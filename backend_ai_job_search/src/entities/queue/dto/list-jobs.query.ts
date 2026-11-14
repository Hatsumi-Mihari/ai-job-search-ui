import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { JobStatus } from '../queue.entity.js';

/**
 * Query parameters for `GET /jobs`. Both filters are optional and can be
 * combined, e.g. `?status=processing&type=vacancy_processing_chain`.
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
