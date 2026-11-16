import { Type } from 'class-transformer';
import {
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

/** Shape of a single entry inside the `sources` jsonb column. */
export class CompanySourceDto {
  @IsOptional()
  @IsString()
  url?: string | null; // Source URL, null when unknown

  @IsOptional()
  @IsString()
  notes?: string | null; // Free-form notes about the source
}

/** Nested `sources` object stored for every company research record. */
export class CompanySourcesDto {
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CompanySourceDto)
  website?: CompanySourceDto; // Official company website

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CompanySourceDto)
  about?: CompanySourceDto; // About / company profile page

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CompanySourceDto)
  linkedin?: CompanySourceDto; // LinkedIn company page

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CompanySourceDto)
  reviews?: CompanySourceDto; // Employee / customer reviews
}
