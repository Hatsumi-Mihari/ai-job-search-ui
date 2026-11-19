import { BadRequestException } from '@nestjs/common';

/** Postgres `uuid` textual representation, case-insensitive. */
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Ensures a value is a UUID string, used for `job_key` and `u_id`. */
export function assertValidUuid(value: string, field: string): void {
  if (typeof value !== 'string' || !UUID_REGEX.test(value.trim())) {
    throw new BadRequestException(`${field} must be a valid UUID`);
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

/** Ensures a value is either absent or an array of strings. */
export function assertOptionalStringArray(
  value: string[] | null | undefined,
  field: string,
): void {
  if (value === undefined || value === null) {
    return;
  }

  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new BadRequestException(`${field} must be an array of strings`);
  }
}
