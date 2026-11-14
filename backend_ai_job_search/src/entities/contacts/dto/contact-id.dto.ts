import { IsInt, IsNotEmpty, Min } from 'class-validator';

/**
 * Base body for endpoints that target a single contact by its primary key.
 * The id is sent in the request body instead of the URL path.
 */
export class ContactIdDto {
    @IsInt()
    @IsNotEmpty()
    @Min(1)
    id: number; // Primary key of the contact
}
