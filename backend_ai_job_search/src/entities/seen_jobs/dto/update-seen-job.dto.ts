import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { SeenJobRefDto } from './seen-job-id.dto.js';

/**
 * Body for the bulk update endpoint. `job_key` + `u_id` select the record and
 * are not editable; every other field is optional, so only the fields that are
 * sent are changed.
 */
export class UpdateSeenJobDto extends SeenJobRefDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title?: string; // Job title

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  company?: string; // Hiring company

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  url?: string; // Original offer URL

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string | null; // Offer location, null clears it

  @IsOptional()
  @IsDateString()
  first_seen?: string; // Date the offer was first discovered

  @IsOptional()
  @IsDateString()
  posted_date?: string | null; // Date the offer was published, null clears it

  @IsOptional()
  @IsDateString()
  deadline?: string | null; // Application deadline, null clears it

  @IsOptional()
  @IsString()
  @MaxLength(100)
  fit?: string | null; // Fit label, null clears it

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  status?: string; // Processing / application status

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  portal?: string; // Portal the offer was found on

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  source?: string; // Source channel / feed of the offer

  @IsOptional()
  @IsInt()
  rank_score?: number | null; // Numeric ranking score, null clears it

  @IsOptional()
  @IsString()
  @MaxLength(255)
  rank_verdict?: string | null; // Ranking verdict text, null clears it

  @IsOptional()
  @IsDateString()
  rank_date?: string | null; // Date the offer was ranked, null clears it

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location_verdict?: string | null; // Location verdict, null clears it

  @IsOptional()
  @IsString()
  @MaxLength(100)
  language_gate?: string | null; // Language gate result, null clears it

  @IsOptional()
  @IsString()
  language_note?: string | null; // Language notes, null clears them

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  strengths?: string[] | null; // Strengths, null clears them

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gaps?: string[] | null; // Gaps, null clears them
}
