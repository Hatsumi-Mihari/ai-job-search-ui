import { BadRequestException } from '@nestjs/common';

/** Postgres `uuid` textual representation, case-insensitive. */
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Ensures a value is a UUID string. Used for `uid`, which must reference an
 * existing `user_data` row even though the column has no foreign key.
 */
export function assertValidUuid(value: string, field: string): void {
  if (typeof value !== 'string' || !UUID_REGEX.test(value.trim())) {
    throw new BadRequestException(`${field} must be a valid UUID`);
  }
}
