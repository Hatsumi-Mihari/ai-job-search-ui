import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ContactIdDto } from './contact-id.dto.js';

/**
 * Body for the bulk update endpoint. `id` selects the contact, every other
 * field is optional: only the fields that are sent are changed.
 */
export class UpdateContactDto extends ContactIdDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(128)
    name?: string; // Contact name

    @IsOptional()
    @IsString()
    url?: string; // Contact URL or link

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(128)
    source?: string; // Where the contact comes from

    @IsOptional()
    @IsString()
    note?: string; // Additional notes

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(64)
    status?: string; // Contact status
}
