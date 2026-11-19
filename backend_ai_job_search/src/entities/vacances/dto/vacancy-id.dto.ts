import { IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator';

/**
 * Base body for endpoints that target a single vacancy by its primary key.
 * The id and the owning user's `uid` are sent in the request body instead of
 * the URL path. `uid` scopes the operation to that user's vacancy, so a
 * mismatching owner is treated as "not found".
 */
export class VacancyIdDto {
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  id: number; // Primary key of the vacancy

  @IsUUID()
  @IsNotEmpty()
  uid: string; // Owner of the vacancy (user_data.id)
}
