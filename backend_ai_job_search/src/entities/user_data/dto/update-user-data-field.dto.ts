import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { UserDataIdDto } from './user-data-id.dto.js';
import { SocialMediaDto } from './social-media.dto.js';

/**
 * Request bodies for the single-field update endpoints.
 * Each DTO carries the target id plus exactly one column, so a request can
 * only change that column of the selected user data record.
 */

export class UpdateUserNameDto extends UserDataIdDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  user_name: string; // Name of the user the data belongs to
}

export class UpdateResumeTemplateUrlDto extends UserDataIdDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  resume_template_url: string; // URL of the resume template
}

export class UpdateCoverTemplateUrlDto extends UserDataIdDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  cover_template_url: string; // URL of the cover letter template
}

export class UpdateEmailDto extends UserDataIdDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  email: string; // Contact email address
}

export class UpdatePhoneDto extends UserDataIdDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  phone: string; // Contact phone number
}

export class UpdateAddressDto extends UserDataIdDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  address: string; // Contact address
}

export class UpdateSocialMediaDto extends UserDataIdDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SocialMediaDto)
  social_media: SocialMediaDto[]; // Social media profiles
}

export class UpdateImgUrlDto extends UserDataIdDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  img_url: string; // URL of the user's image
}

export class UpdateSourcesResearchDto extends UserDataIdDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  sources_research?: string[] | undefined; // Research source URLs
}
