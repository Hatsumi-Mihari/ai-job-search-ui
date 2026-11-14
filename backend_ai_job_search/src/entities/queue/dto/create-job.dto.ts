import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * Body for `POST /jobs`. A newly created job always starts in the `pending`
 * state; only the input side of the task is configurable here.
 */
export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  type: string; // Task / chain type, e.g. 'vacancy_processing_chain'

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  step?: string; // Initial step in the chain, e.g. 'PREPARE_INDEX'

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>; // Input data / metadata for the task

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  max_attempts?: number; // Retry budget, defaults to the column default (3)

  @IsOptional()
  @IsDateString()
  available_at?: string; // ISO timestamp; defaults to now
}
