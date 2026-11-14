/**
 * Helper functions used by the queue service. They are kept outside the
 * entity/service files so the queue core stays free of incidental logic.
 */

/** Default delay before a failed job becomes available again. */
export const DEFAULT_RETRY_BASE_DELAY_MS = 5_000;

/** Upper bound for the exponential retry backoff. */
export const DEFAULT_RETRY_MAX_DELAY_MS = 5 * 60_000;

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Returns true when `value` is a canonical UUID string. */
export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_REGEX.test(value);
}

/** Returns true for JSON objects (not arrays, not null). */
export function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Exponential backoff for retries: base * 2^(attempts - 1), capped at `max`.
 * A job that was never attempted (attempts <= 0) becomes available again
 * immediately.
 */
export function computeRetryDelayMs(
  attempts: number,
  baseDelayMs: number = DEFAULT_RETRY_BASE_DELAY_MS,
  maxDelayMs: number = DEFAULT_RETRY_MAX_DELAY_MS,
): number {
  if (!Number.isFinite(attempts) || attempts <= 0) {
    return 0;
  }

  return Math.min(baseDelayMs * 2 ** (attempts - 1), maxDelayMs);
}
