import type { CompanySources, CompanySourceEntry } from '../cr.entity.js';

/**
 * Input shape accepted for the `sources` column. Every key is optional because
 * missing keys are filled with an empty entry before the record is stored.
 */
export type CompanySourcesInput = Partial<
  Record<keyof CompanySources, Partial<CompanySourceEntry> | null>
>;

/** Normalizes a partial sources object into the full shape stored in jsonb. */
export function normalizeCompanySources(
  sources?: CompanySourcesInput | null,
): CompanySources {
  return {
    website: normalizeSourceEntry(sources?.website),
    about: normalizeSourceEntry(sources?.about),
    linkedin: normalizeSourceEntry(sources?.linkedin),
    reviews: normalizeSourceEntry(sources?.reviews),
  };
}

/** Trims text and converts empty strings to null so the DB stays clean. */
export function normalizeOptionalText(value?: string | null): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length === 0 ? null : trimmed;
}

function normalizeSourceEntry(
  entry?: Partial<CompanySourceEntry> | null,
): CompanySourceEntry {
  return {
    url: normalizeOptionalText(entry?.url),
    notes: normalizeOptionalText(entry?.notes),
  };
}
