import { IsObject, IsOptional } from 'class-validator';
import { JobIdDto } from './job-id.dto.js';

/**
 * Body for `POST /jobs/complete`. The optional `result` is stored on the job
 * right before the row is deleted, so the final output is not lost when a
 * caller needs it for logging/audit purposes.
 */
export class CompleteJobDto extends JobIdDto {
  @IsOptional()
  @IsObject()
  result?: Record<string, unknown>; // Output data or file links
}
