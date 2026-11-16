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
import { CompanyResearchIdDto } from './company-research-id.dto.js';
import { CompanySourcesDto } from './company-source.dto.js';

/**
 * Body for the bulk update endpoint. `id` selects the record, every other
 * field is optional: only the fields that are sent are changed.
 */
export class UpdateCompanyResearchDto extends CompanyResearchIdDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  company?: string; // Company name

  @IsOptional()
  @IsDateString()
  fetched_date?: string; // Date the research was fetched (ISO date string)

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CompanySourcesDto)
  sources?: CompanySourcesDto; // Research sources with url and notes per channel

  @IsOptional()
  @IsString()
  network_contacts_note?: string | null; // Notes about network contacts
}
