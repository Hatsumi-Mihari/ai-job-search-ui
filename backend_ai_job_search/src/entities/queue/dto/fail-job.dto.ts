import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { JobIdDto } from './job-id.dto.js';

/**
 * Body for `POST /jobs/fail`. The service decides whether the job is retried
 * (exponential backoff via `available_at`) or permanently marked as failed,
 * based on `attempts` vs `max_attempts`.
 */
export class FailJobDto extends JobIdDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  error: string; // Error message describing the failure
}
