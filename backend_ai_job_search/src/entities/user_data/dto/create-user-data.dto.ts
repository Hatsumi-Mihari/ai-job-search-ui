import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { SocialMediaDto } from './social-media.dto.js';

/**
 * Body for creating a user data record. `id` is managed by the database and
 * must not be provided by the client.
 */
export class CreateUserDataDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  user_name: string; // Name of the user the data belongs to

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sources_research?: string[]; // Research source URLs

  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  resume_template_url: string; // URL of the resume template

  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  cover_template_url: string; // URL of the cover letter template

  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  email: string; // Contact email address

  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  phone: string; // Contact phone number

  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  address: string; // Contact address

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SocialMediaDto)
  social_media: SocialMediaDto[]; // Social media profiles

  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  img_url: string; // URL of the user's image
}
