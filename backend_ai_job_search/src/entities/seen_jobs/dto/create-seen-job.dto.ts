import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

/**
 * Body for creating a seen job record. The natural key `job_key` is supplied
 * by the client; the table has no generated identifier.
 */
export class CreateSeenJobDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  job_key: string; // Stable unique key of the offer

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string; // Job title

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  company: string; // Hiring company

  @IsString()
  @IsNotEmpty()
  url: string; // Original offer URL

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string | null; // Offer location, null when unknown

  @IsDateString()
  @IsNotEmpty()
  first_seen: string; // Date the offer was first discovered (ISO date string)

  @IsOptional()
  @IsDateString()
  posted_date?: string | null; // Date the offer was published (ISO date string)

  @IsOptional()
  @IsDateString()
  deadline?: string | null; // Application deadline (ISO date string)

  @IsOptional()
  @IsString()
  @MaxLength(100)
  fit?: string | null; // Fit label assigned to the offer

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  status: string; // Processing / application status

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  portal: string; // Portal the offer was found on

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  source: string; // Source channel / feed of the offer

  @IsOptional()
  @IsInt()
  rank_score?: number | null; // Numeric ranking score

  @IsOptional()
  @IsString()
  @MaxLength(255)
  rank_verdict?: string | null; // Ranking verdict text

  @IsOptional()
  @IsDateString()
  rank_date?: string | null; // Date the offer was ranked (ISO date string)

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location_verdict?: string | null; // Verdict about the offer location

  @IsOptional()
  @IsString()
  @MaxLength(100)
  language_gate?: string | null; // Language gate result

  @IsOptional()
  @IsString()
  language_note?: string | null; // Free-form language notes

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  strengths?: string[] | null; // Strengths found in the offer

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gaps?: string[] | null; // Gaps / missing requirements found in the offer
}
