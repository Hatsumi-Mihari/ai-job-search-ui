import { IsString, IsInt, IsNotEmpty, IsDateString, IsOptional, MaxLength } from 'class-validator';

export class CreateVacancyDto {
    // --- Fields for Table 1 (All required) ---
    @IsDateString()
    @IsNotEmpty()
    date_pub: string; // Publication date

    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    company: string; // Company name

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    status: string; // Application status

    @IsString()
    @IsNotEmpty()
    role: string; // Role title

    @IsInt()
    @IsNotEmpty()
    fit_rating: number; // Fit rating score

    @IsString()
    @IsNotEmpty()
    source: string; // Source URL or link

    // --- Fields for Table 2 (Some optional as requested) ---
    @IsString()
    @IsNotEmpty()
    note: string; // Additional notes (required)

    @IsString()
    @IsOptional()
    @MaxLength(500)
    source_cover_latter_s3?: string; // S3 path for cover letter (optional)

    @IsString()
    @IsOptional()
    @MaxLength(500)
    source_resume_s3?: string; // S3 path for resume (optional)

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    chanel: string; // Communication or application channel (required)
}