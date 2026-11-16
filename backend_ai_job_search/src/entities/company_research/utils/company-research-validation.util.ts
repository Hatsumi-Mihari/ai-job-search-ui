import { BadRequestException } from '@nestjs/common';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Ensures the id is a syntactically valid UUID v1-v5 string. */
export function assertValidCompanyResearchId(id: string): void {
  if (typeof id !== 'string' || !UUID_PATTERN.test(id)) {
    throw new BadRequestException('Company research id must be a valid UUID');
  }
}

/** Ensures a string field is present and not blank. */
export function assertNonEmptyString(value: string, field: string): void {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new BadRequestException(`${field} must be a non-empty string`);
  }
}

/** Ensures a string field does not exceed the database column length. */
export function assertMaxLength(
  value: string,
  max: number,
  field: string,
): void {
  if (typeof value === 'string' && value.length > max) {
    throw new BadRequestException(
      `${field} must be at most ${max} characters long`,
    );
  }
}
