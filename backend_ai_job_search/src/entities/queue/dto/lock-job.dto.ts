import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Body for the worker endpoints `POST /jobs/lock` and `PATCH /jobs/next`.
 * `type` is an optional filter, so a worker can only claim jobs it handles.
 */
export class LockJobDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  type?: string; // Only claim jobs of this task / chain type
}
