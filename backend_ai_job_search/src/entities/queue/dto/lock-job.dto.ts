import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

/**
 * Body for the worker endpoints `POST /jobs/lock` and `PATCH /jobs/next`.
 *
 * Both fields are optional filters: `id` selects a precise task, `type` (the
 * task name, e.g. 'vacancy_processing_chain') selects the first task of that
 * kind. Without filters the first pending task of the whole queue is claimed.
 */
export class LockJobDto {
  @IsOptional()
  @IsUUID()
  id?: string; // Claim exactly this task (must still be awaiting execution)

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  type?: string; // Task / chain name the worker is able to handle
}
