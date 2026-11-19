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

  @IsOptional()
  @IsString()
  claude_md?: string; // Markdown content of CLAUDE.md

  @IsOptional()
  @IsString()
  candidate_profile_md?: string; // Markdown content of 01-candidate-profile.md

  @IsOptional()
  @IsString()
  behavioral_profile_md?: string; // Markdown content of 02-behavioral-profile.md

  @IsOptional()
  @IsString()
  writing_style_md?: string; // Markdown content of 03-writing-style.md

  @IsOptional()
  @IsString()
  job_evaluation_md?: string; // Markdown content of 04-job-evaluation.md

  @IsOptional()
  @IsString()
  cv_templates_md?: string; // Markdown content of 05-cv-templates.md

  @IsOptional()
  @IsString()
  cover_letter_templates_md?: string; // Markdown content of 06-cover-letter-templates.md

  @IsOptional()
  @IsString()
  interview_prep_md?: string; // Markdown content of 07-interview-prep.md

  @IsOptional()
  @IsString()
  application_forms_md?: string; // Markdown content of 08-application-forms.md

  @IsOptional()
  @IsString()
  web_research_md?: string; // Markdown content of 09-web-research.md

  @IsOptional()
  @IsString()
  search_queries_md?: string; // Markdown content of search-queries.md
}
