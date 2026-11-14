import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { JobStatus } from '../queue.entity.js';
import { JobIdDto } from './job-id.dto.js';

/**
 * Body for `PATCH /jobs/update`. `id` selects the job, every other field is
 * optional: only the fields that are sent are changed. This is how a worker
 * advances a chain (step, result) without releasing the job.
 */
export class UpdateJobDto extends JobIdDto {
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus; // pending | processing | completed | failed

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  step?: string; // Current step in the chain

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>; // Input data / metadata for the task

  @IsOptional()
  @IsObject()
  result?: Record<string, unknown>; // Output data or file links

  @IsOptional()
  @IsString()
  error?: string; // Error message, use an empty string to clear it

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  max_attempts?: number; // Retry budget

  @IsOptional()
  @IsDateString()
  available_at?: string; // ISO timestamp at which a worker may claim the job
}
