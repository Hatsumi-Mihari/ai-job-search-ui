import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { SeenJobIdDto } from './seen-job-id.dto.js';

/**
 * Request bodies for the single-field update endpoints.
 * Each DTO carries the target `job_key` plus exactly one column, so a request
 * can only change that column of the selected seen job.
 */

export class UpdateSeenJobTitleDto extends SeenJobIdDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string; // Job title
}

export class UpdateSeenJobCompanyDto extends SeenJobIdDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  company: string; // Hiring company
}

export class UpdateSeenJobUrlDto extends SeenJobIdDto {
  @IsString()
  @IsNotEmpty()
  url: string; // Original offer URL
}

export class UpdateSeenJobLocationDto extends SeenJobIdDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location: string | null; // Offer location (null clears it)
}

export class UpdateSeenJobFirstSeenDto extends SeenJobIdDto {
  @IsDateString()
  @IsNotEmpty()
  first_seen: string; // Date the offer was first discovered
}

export class UpdateSeenJobPostedDateDto extends SeenJobIdDto {
  @IsOptional()
  @IsDateString()
  posted_date: string | null; // Publication date (null clears it)
}

export class UpdateSeenJobDeadlineDto extends SeenJobIdDto {
  @IsOptional()
  @IsDateString()
  deadline: string | null; // Application deadline (null clears it)
}

export class UpdateSeenJobFitDto extends SeenJobIdDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fit: string | null; // Fit label (null clears it)
}

export class UpdateSeenJobStatusDto extends SeenJobIdDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  status: string; // Processing / application status
}

export class UpdateSeenJobPortalDto extends SeenJobIdDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  portal: string; // Portal the offer was found on
}

export class UpdateSeenJobSourceDto extends SeenJobIdDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  source: string; // Source channel / feed of the offer
}

export class UpdateSeenJobRankScoreDto extends SeenJobIdDto {
  @IsOptional()
  @IsInt()
  rank_score: number | null; // Numeric ranking score (null clears it)
}

export class UpdateSeenJobRankVerdictDto extends SeenJobIdDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  rank_verdict: string | null; // Ranking verdict text (null clears it)
}

export class UpdateSeenJobRankDateDto extends SeenJobIdDto {
  @IsOptional()
  @IsDateString()
  rank_date: string | null; // Date the offer was ranked (null clears it)
}

export class UpdateSeenJobLocationVerdictDto extends SeenJobIdDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location_verdict: string | null; // Location verdict (null clears it)
}

export class UpdateSeenJobLanguageGateDto extends SeenJobIdDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  language_gate: string | null; // Language gate result (null clears it)
}

export class UpdateSeenJobLanguageNoteDto extends SeenJobIdDto {
  @IsOptional()
  @IsString()
  language_note: string | null; // Language notes (null clears them)
}

export class UpdateSeenJobStrengthsDto extends SeenJobIdDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  strengths: string[] | null; // Strengths (null clears them)
}

export class UpdateSeenJobGapsDto extends SeenJobIdDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gaps: string[] | null; // Gaps (null clears them)
}
