import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { CompanySourcesDto } from './company-source.dto.js';

/**
 * Body for creating a company research record. `id`, `created_at` and
 * `updated_at` are managed by the database and must not be provided.
 */
export class CreateCompanyResearchDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  company: string; // Company name

  @IsDateString()
  @IsNotEmpty()
  fetched_date: string; // Date the research was fetched (ISO date string)

  @IsObject()
  @ValidateNested()
  @Type(() => CompanySourcesDto)
  sources: CompanySourcesDto; // Research sources with url and notes per channel

  @IsOptional()
  @IsString()
  network_contacts_note?: string | null; // Notes about network contacts
}
