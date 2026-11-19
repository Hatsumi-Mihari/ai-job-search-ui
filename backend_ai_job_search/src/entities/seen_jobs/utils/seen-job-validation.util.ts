import { BadRequestException } from '@nestjs/common';

/** Postgres `uuid` textual representation, case-insensitive. */
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Ensures a value is a UUID string, used for `id` and `u_id`. */
export function assertValidUuid(value: string, field: string): void {
  if (typeof value !== 'string' || !UUID_REGEX.test(value.trim())) {
    throw new BadRequestException(`${field} must be a valid UUID`);
  }
}

/**
 * Ensures the natural key is a non-blank string that fits into the
 * `job_key` varchar column.
 */
export function assertValidSeenJobKey(jobKey: string): void {
  if (typeof jobKey !== 'string' || jobKey.trim().length === 0) {
    throw new BadRequestException('job_key must be a non-empty string');
  }

  if (jobKey.length > 255) {
    throw new BadRequestException(
      'job_key must be at most 255 characters long',
    );
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
