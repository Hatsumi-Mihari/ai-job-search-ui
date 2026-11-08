import { IsInt, IsNotEmpty, Min } from 'class-validator';

/**
 * Base body for endpoints that target a single vacancy by its primary key.
 * The id is sent in the request body instead of the URL path.
 */
export class VacancyIdDto {
    @IsInt()
    @IsNotEmpty()
    @Min(1)
    id: number; // Primary key of the vacancy
}
