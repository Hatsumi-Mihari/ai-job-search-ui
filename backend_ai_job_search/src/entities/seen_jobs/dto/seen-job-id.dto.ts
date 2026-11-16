import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * Base body for endpoints that target a single seen job by its natural primary
 * key. The key is sent in the request body instead of the URL path.
 */
export class SeenJobIdDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  job_key: string; // Primary key of the seen job record
}
