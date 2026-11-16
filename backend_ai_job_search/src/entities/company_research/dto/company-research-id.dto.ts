import { IsNotEmpty, IsUUID } from 'class-validator';

/**
 * Base body for endpoints that target a single company research record by its
 * primary key. The id is sent in the request body instead of the URL path.
 */
export class CompanyResearchIdDto {
  @IsUUID()
  @IsNotEmpty()
  id: string; // Primary key of the company research record
}
