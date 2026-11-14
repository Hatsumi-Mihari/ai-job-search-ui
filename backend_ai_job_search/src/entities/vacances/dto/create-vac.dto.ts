import {
  IsString,
  IsInt,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  MaxLength,
  IsUUID,
} from 'class-validator';

export class CreateVacancyDto {

  @IsDateString()
  @IsNotEmpty()
  date_pub: string;


  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  company: string;


  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  status: string;

  @IsString()
  @IsNotEmpty()
  role: string;

  @IsInt()
  @IsNotEmpty()
  fit_rating: number;


  @IsString()
  @IsNotEmpty()
  source: string;


  @IsString()
  @IsNotEmpty()
  note: string;


  @IsUUID()
  @IsOptional()
  source_cover_latter_id?: string | null;


  @IsUUID()
  @IsOptional()
  source_resume_id?: string | null;


  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  chanel: string;
}
