import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Body for creating a contact. `id` and `date_add` are managed by the
 * database and must not be provided by the client.
 */
export class CreateContactDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(128)
    name: string; // Contact name

    @IsString()
    @IsOptional()
    url?: string; // Contact URL or link

    @IsString()
    @IsNotEmpty()
    @MaxLength(128)
    source: string; // Where the contact comes from

    @IsString()
    @IsOptional()
    note?: string; // Additional notes

    @IsString()
    @IsNotEmpty()
    @MaxLength(64)
    status: string; // Contact status
}
