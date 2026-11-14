import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { VacancyIdDto } from './vacancy-id.dto.js';

/**
 * Body for the bulk update endpoint. `id` selects the vacancy, every other
 * field is optional: only the fields that are sent are changed.
 */
export class UpdateVacancyDto extends VacancyIdDto {
    @IsOptional()
    @IsDateString()
    date_pub?: string; // Publication date

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    company?: string; // Company name

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    status?: string; // Application status

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    role?: string; // Role title

    @IsOptional()
    @IsInt()
    fit_rating?: number; // Fit rating score

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    source?: string; // Source URL or link

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    note?: string; // Additional notes

    @IsOptional()
    @IsString()
    @MaxLength(500)
    source_cover_latter_s3?: string; // S3 path for cover letter

    @IsOptional()
    @IsString()
    @MaxLength(500)
    source_resume_s3?: string; // S3 path for resume

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    chanel?: string; // Communication or application channel
}
