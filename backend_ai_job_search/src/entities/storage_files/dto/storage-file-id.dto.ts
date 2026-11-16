import { IsInt, IsNotEmpty, Min } from 'class-validator';

/**
 * Base body for endpoints that target a single stored file by its primary key.
 * The id is sent in the request body instead of the URL path.
 */
export class StorageFileIdDto {
    @IsInt()
    @IsNotEmpty()
    @Min(1)
    id: number; // Primary key of the stored file
}
