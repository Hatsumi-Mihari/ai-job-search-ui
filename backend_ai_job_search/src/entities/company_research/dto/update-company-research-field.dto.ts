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
 * Request bodies for the single-field update endpoints.
 * Each DTO carries the target id plus exactly one column, so a request can
 * only change that column of the selected company research record.
 */

export class UpdateCompanyResearchCompanyDto extends CompanyResearchIdDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  company: string; // Company name
}

export class UpdateCompanyResearchFetchedDateDto extends CompanyResearchIdDto {
  @IsDateString()
  @IsNotEmpty()
  fetched_date: string; // Date the research was fetched (ISO date string)
}

export class UpdateCompanyResearchSourcesDto extends CompanyResearchIdDto {
  @IsObject()
  @ValidateNested()
  @Type(() => CompanySourcesDto)
  sources: CompanySourcesDto; // Research sources with url and notes per channel
}

export class UpdateCompanyResearchNetworkContactsNoteDto extends CompanyResearchIdDto {
  @IsOptional()
  @IsString()
  network_contacts_note: string | null; // Notes about network contacts (null clears it)
}
