import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { UserDataIdDto } from './user-data-id.dto.js';
import { SocialMediaDto } from './social-media.dto.js';

/**
 * Body for the bulk update endpoint. `id` selects the user data record, every
 * other field is optional: only the fields that are sent are changed.
 */
export class UpdateUserDataDto extends UserDataIdDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  user_name?: string; // Name of the user the data belongs to

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  resume_template_url?: string; // URL of the resume template

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  cover_template_url?: string; // URL of the cover letter template

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  email?: string; // Contact email address

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  phone?: string; // Contact phone number

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  address?: string; // Contact address

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SocialMediaDto)
  social_media?: SocialMediaDto[]; // Social media profiles

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  img_url?: string; // URL of the user's image
}
