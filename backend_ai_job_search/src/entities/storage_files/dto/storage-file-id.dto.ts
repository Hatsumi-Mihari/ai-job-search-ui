import { IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator';

/**
 * Base body for endpoints that target a single stored file by its primary key.
 * The id is sent in the request body instead of the URL path.
 */
export class StorageFileIdDto {
    @IsUUID()
    @IsNotEmpty()
    id: string; // Primary key of the stored file
}
