import { IsNotEmpty, IsUUID } from 'class-validator';

/**
 * Base body for endpoints that target a single job by its primary key.
 * Ids are sent in the request body, matching the rest of the project.
 */
export class JobIdDto {
  @IsUUID()
  @IsNotEmpty()
  id: string; // Primary key (uuid) of the job
}
