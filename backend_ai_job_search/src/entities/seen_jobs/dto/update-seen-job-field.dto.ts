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
 * Request bodies for the single-field update endpoints.
 * Each DTO carries the target `id` + `u_id` plus exactly one column, so a
 * request can only change that column of the selected seen job, and only when
 * the record belongs to the user that sent it.
 */

export class UpdateSeenJobTitleDto extends SeenJobRefDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string; // Job title
}

export class UpdateSeenJobCompanyDto extends SeenJobRefDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  company: string; // Hiring company
}

export class UpdateSeenJobUrlDto extends SeenJobRefDto {
  @IsString()
  @IsNotEmpty()
  url: string; // Original offer URL
}

export class UpdateSeenJobLocationDto extends SeenJobRefDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location: string | null; // Offer location (null clears it)
}

export class UpdateSeenJobFirstSeenDto extends SeenJobRefDto {
  @IsDateString()
  @IsNotEmpty()
  first_seen: string; // Date the offer was first discovered
}

export class UpdateSeenJobPostedDateDto extends SeenJobRefDto {
  @IsOptional()
  @IsDateString()
  posted_date: string | null; // Publication date (null clears it)
}

export class UpdateSeenJobDeadlineDto extends SeenJobRefDto {
  @IsOptional()
  @IsDateString()
  deadline: string | null; // Application deadline (null clears it)
}

export class UpdateSeenJobFitDto extends SeenJobRefDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fit: string | null; // Fit label (null clears it)
}

export class UpdateSeenJobStatusDto extends SeenJobRefDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  status: string; // Processing / application status
}

export class UpdateSeenJobPortalDto extends SeenJobRefDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  portal: string; // Portal the offer was found on
}

export class UpdateSeenJobSourceDto extends SeenJobRefDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  source: string; // Source channel / feed of the offer
}

export class UpdateSeenJobRankScoreDto extends SeenJobRefDto {
  @IsOptional()
  @IsInt()
  rank_score: number | null; // Numeric ranking score (null clears it)
}

export class UpdateSeenJobRankVerdictDto extends SeenJobRefDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  rank_verdict: string | null; // Ranking verdict text (null clears it)
}

export class UpdateSeenJobRankDateDto extends SeenJobRefDto {
  @IsOptional()
  @IsDateString()
  rank_date: string | null; // Date the offer was ranked (null clears it)
}

export class UpdateSeenJobLocationVerdictDto extends SeenJobRefDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location_verdict: string | null; // Location verdict (null clears it)
}

export class UpdateSeenJobLanguageGateDto extends SeenJobRefDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  language_gate: string | null; // Language gate result (null clears it)
}

export class UpdateSeenJobLanguageNoteDto extends SeenJobRefDto {
  @IsOptional()
  @IsString()
  language_note: string | null; // Language notes (null clears them)
}

export class UpdateSeenJobStrengthsDto extends SeenJobRefDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  strengths: string[] | null; // Strengths (null clears them)
}

export class UpdateSeenJobGapsDto extends SeenJobRefDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gaps: string[] | null; // Gaps (null clears them)
}
