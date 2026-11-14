import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ContactIdDto } from './contact-id.dto.js';

/**
 * Request bodies for the single-field update endpoints.
 * Each DTO carries the target id plus exactly one column, so a request can
 * only change that column of the selected contact.
 */

export class UpdateContactNameDto extends ContactIdDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(128)
    name: string; // Contact name
}

export class UpdateContactUrlDto extends ContactIdDto {
    @IsString()
    url: string; // Contact URL or link (empty string clears it)
}

export class UpdateContactSourceDto extends ContactIdDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(128)
    source: string; // Where the contact comes from
}

export class UpdateContactNoteDto extends ContactIdDto {
    @IsString()
    note: string; // Additional notes (empty string clears it)
}

export class UpdateContactStatusDto extends ContactIdDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(64)
    status: string; // Contact status
}
