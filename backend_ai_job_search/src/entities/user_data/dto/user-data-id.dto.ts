import { IsString, IsNotEmpty, Min } from 'class-validator';

/**
 * Base body for endpoints that target a single user data record by its
 * primary key. The id is sent in the request body instead of the URL path.
 */
export class UserDataIdDto {
  @IsString()
  @IsNotEmpty()
  id: string; // Primary key of the user data record
}
