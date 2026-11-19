import { IsUUID } from 'class-validator';

/**
 * Base body for endpoints that target a single seen job by its UUID primary
 * key. The key is sent in the request body instead of the URL path.
 *
 * Read and delete operations use this body only: deleting a record never
 * touches the owning `user_data` row.
 */
export class SeenJobIdDto {
  @IsUUID()
  job_key: string; // UUID primary key of the seen job record
}

/**
 * Base body for the update endpoints. A seen job can only be modified by the
 * user that owns it, so the owner UUID must be sent together with the key.
 */
export class SeenJobRefDto extends SeenJobIdDto {
  @IsUUID()
  u_id: string; // Owner of the record (user_data.id)
}
