import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  MaxLength,
} from 'class-validator';
import { StorageFileIdDto } from './storage-file-id.dto.js';

/**
 * Body for the bulk update endpoint. `id` selects the file, every other
 * field is optional: only the fields that are sent are changed.
 */
export class UpdateStorageFileDto extends StorageFileIdDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  file_name?: string; // Name of the stored file

  @IsNumber()
  @IsNotEmpty()
  size: number; // size of the stored file

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  sources3?: string; // S3 key/path of the stored file
}
