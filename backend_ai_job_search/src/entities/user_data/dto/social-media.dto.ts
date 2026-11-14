import { IsNotEmpty, IsString } from 'class-validator';

/**
 * Shape of a single entry in the `social_media` jsonb array column.
 */
export class SocialMediaDto {
  @IsString()
  @IsNotEmpty()
  platform: string; // Social media platform name

  @IsString()
  @IsNotEmpty()
  url: string; // Profile URL on that platform
}
