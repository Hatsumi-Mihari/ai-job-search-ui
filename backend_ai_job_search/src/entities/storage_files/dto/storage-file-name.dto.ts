import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * Base body for endpoints that target stored files by their name.
 * The name is sent in the request body instead of the URL path.
 */
export class StorageFileNameDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(256)
    file_name: string; // Name of the stored file
}
