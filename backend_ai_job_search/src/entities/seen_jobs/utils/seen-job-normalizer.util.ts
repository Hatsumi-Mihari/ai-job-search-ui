/**
 * Trims an optional text value. Blank strings are stored as `null` so the
 * database keeps a single representation for "no value".
 */
export function normalizeOptionalText(
  value: string | null | undefined,
): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Trims every entry of an optional string array and drops empty entries.
 * An empty result is stored as `null`.
 */
export function normalizeOptionalStringArray(
  value: string[] | null | undefined,
): string[] | null {
  if (value === undefined || value === null) {
    return null;
  }

  const cleaned = value
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  return cleaned.length > 0 ? cleaned : null;
}
