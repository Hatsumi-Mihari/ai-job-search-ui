/**
 * Helper functions used by the task orchestrator. They are kept outside the
 * service file so the orchestration core stays free of incidental logic.
 */

/**
 * Turns any thrown value into a readable message that can be stored in
 * `jobs.error`, without ever throwing itself.
 */
export function normalizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return stringifySafely(error) ?? 'Unknown task processing error';
}

/** `JSON.stringify` that returns `null` instead of throwing on cycles. */
function stringifySafely(value: unknown): string | null {
  try {
    return JSON.stringify(value) ?? null;
  } catch {
    return null;
  }
}
