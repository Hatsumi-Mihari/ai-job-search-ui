import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

/**
 * Body for adding a stored file. `id` and `date_add` are managed by the
 * database and must not be provided by the client.
 */
export class CreateStorageFileDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  file_name: string; // Name of the stored file

  @IsNumber()
  @IsNotEmpty()
  size: number; // size of the stored file

  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  sources3: string; // S3 key/path of the stored file
}
