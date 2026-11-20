/**
 * Helpers for the `tex_template_processing` task payload. They are kept
 * outside the worker so the worker stays focused on orchestration.
 */

/** Document kind carried by the payload. */
export type TexTemplateType = 'cv' | 'cover';

/** Payload accepted by the `tex_template_processing` task. */
export type TexTemplatePayload = {
  type: TexTemplateType;
  tex_data: string;
};

const SUPPORTED_TYPES: ReadonlyArray<TexTemplateType> = ['cv', 'cover'];

/** Returns true for JSON objects (not arrays, not null). */
function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isTexTemplateType(value: unknown): value is TexTemplateType {
  return (
    typeof value === 'string' &&
    SUPPORTED_TYPES.includes(value as TexTemplateType)
  );
}

/** Turns an unknown thrown value into a message safe to log. */
export function normalizeErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Validates the raw JSON payload of a `tex_template_processing` job.
 *
 * Throws with a message that includes the task id, so a malformed payload is
 * reported by the task orchestrator with enough context to find the row.
 */
export function parseTexTemplatePayload(
  taskId: string,
  payload: unknown,
): TexTemplatePayload {
  if (!isJsonObject(payload)) {
    throw new Error(
      `Task ${taskId} has no payload; expected { type, tex_data }`,
    );
  }

  const { type, tex_data: texData } = payload;

  if (!isTexTemplateType(type)) {
    throw new Error(
      `Task ${taskId} has an invalid payload.type; expected "cv" or "cover"`,
    );
  }

  if (typeof texData !== 'string' || texData.trim().length === 0) {
    throw new Error(
      `Task ${taskId} has an invalid payload.tex_data; expected a non-empty string`,
    );
  }

  return { type, tex_data: texData };
}
