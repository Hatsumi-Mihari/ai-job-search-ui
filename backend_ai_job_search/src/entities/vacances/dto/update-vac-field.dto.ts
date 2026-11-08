import { IsDateString, IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { VacancyIdDto } from './vacancy-id.dto.js';

/**
 * Request bodies for the single-field update endpoints.
 * Each DTO carries the target id plus exactly one column, so a request can
 * only change that column of the selected vacancy.
 */

export class UpdateDatePubDto extends VacancyIdDto {
    @IsDateString()
    @IsNotEmpty()
    date_pub: string; // Publication date
}

export class UpdateCompanyDto extends VacancyIdDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    company: string; // Company name
}

export class UpdateStatusDto extends VacancyIdDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    status: string; // Application status
}

export class UpdateRoleDto extends VacancyIdDto {
    @IsString()
    @IsNotEmpty()
    role: string; // Role title
}

export class UpdateFitRatingDto extends VacancyIdDto {
    @IsInt()
    @IsNotEmpty()
    fit_rating: number; // Fit rating score
}

export class UpdateSourceDto extends VacancyIdDto {
    @IsString()
    @IsNotEmpty()
    source: string; // Source URL or link
}

export class UpdateNoteDto extends VacancyIdDto {
    @IsString()
    @IsNotEmpty()
    note: string; // Additional notes
}

export class UpdateChannelDto extends VacancyIdDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    chanel: string; // Communication or application channel
}

export class UpdateCoverLetterDto extends VacancyIdDto {
    @IsString()
    @MaxLength(500)
    source_cover_latter_s3: string; // S3 path for cover letter (empty string clears it)
}

export class UpdateResumeDto extends VacancyIdDto {
    @IsString()
    @MaxLength(500)
    source_resume_s3: string; // S3 path for resume (empty string clears it)
}
