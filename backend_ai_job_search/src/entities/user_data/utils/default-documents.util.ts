import type { MarkdownField } from '../ud.service.js';
import { DEFAULT_USER_DATA_DOCUMENTS } from './default-documents.data.util.js';

/**
 * Fills the markdown document fields that a caller left out of a create
 * payload with the framework defaults from `src/common/ai/defSkills/`.
 *
 * Only `undefined` counts as "not provided": an explicit `null` or empty
 * string is kept, so a caller can create a record with cleared documents.
 * Fields without a default (`search_queries_md`) are passed through untouched.
 */
export function withDefaultDocuments<T extends object>(
  payload: T,
): T & Partial<Record<MarkdownField, string>> {
  const merged: Record<string, unknown> = { ...DEFAULT_USER_DATA_DOCUMENTS };

  for (const [field, value] of Object.entries(payload)) {
    if (value !== undefined) {
      merged[field] = value;
    }
  }

  return merged as T & Partial<Record<MarkdownField, string>>;
}
