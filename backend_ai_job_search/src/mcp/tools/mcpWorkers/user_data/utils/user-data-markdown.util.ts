import { BadRequestException } from '@nestjs/common';
import type { UserDataEntity } from '@/entities/user_data/ud.entity.js';
import type { MarkdownField } from '@/entities/user_data/ud.service.js';

/**
 * Public names of the markdown documents stored on a user data record.
 *
 * They match the database column names of `UserDataEntity` (`CLAUDE_md`,
 * `01-candidate-profile_md`, ...) so callers can use the same vocabulary as the
 * stored files. Internally each name is mapped to the matching entity property.
 */
export const MARKDOWN_DOCUMENT_FIELDS = [
  'CLAUDE_md',
  '01-candidate-profile_md',
  '02-behavioral-profile_md',
  '03-writing-style_md',
  '04-job-evaluation_md',
  '05-cv-templates_md',
  '06-cover-letter-templates_md',
  '07-interview-prep_md',
  '08-application-forms_md',
  '09-web-research_md',
  'search-queries_md',
] as const;

export type MarkdownDocumentField = (typeof MARKDOWN_DOCUMENT_FIELDS)[number];

/** Static description of one markdown document column. */
export type MarkdownDocumentMeta = {
  field: MarkdownDocumentField;
  /** Property name on `UserDataEntity` / `CreateUserDataDto`. */
  column: MarkdownField;
  /** Name of the markdown file the column stores. */
  fileName: string;
  description: string;
};

/** Current value of one markdown document for a selected user. */
export type MarkdownDocumentState = {
  field: MarkdownDocumentField;
  column: MarkdownField;
  file_name: string;
  value: string | null;
  is_empty: boolean;
};

/** Describes a markdown document written by an update tool. */
export type MarkdownDocumentChange = {
  field: MarkdownDocumentField;
  column: MarkdownField;
  file_name: string;
  cleared: boolean;
};

/** One document/value pair accepted by the batch update tool. */
export type MarkdownDocumentInput = {
  field: MarkdownDocumentField;
  content: string;
};

const MARKDOWN_DOCUMENTS: Record<MarkdownDocumentField, MarkdownDocumentMeta> =
  {
    CLAUDE_md: {
      field: 'CLAUDE_md',
      column: 'claude_md',
      fileName: 'CLAUDE.md',
      description: 'Project and agent instructions (CLAUDE.md)',
    },
    '01-candidate-profile_md': {
      field: '01-candidate-profile_md',
      column: 'candidate_profile_md',
      fileName: '01-candidate-profile.md',
      description: 'Candidate profile (01-candidate-profile.md)',
    },
    '02-behavioral-profile_md': {
      field: '02-behavioral-profile_md',
      column: 'behavioral_profile_md',
      fileName: '02-behavioral-profile.md',
      description: 'Behavioral profile (02-behavioral-profile.md)',
    },
    '03-writing-style_md': {
      field: '03-writing-style_md',
      column: 'writing_style_md',
      fileName: '03-writing-style.md',
      description: 'Writing style guide (03-writing-style.md)',
    },
    '04-job-evaluation_md': {
      field: '04-job-evaluation_md',
      column: 'job_evaluation_md',
      fileName: '04-job-evaluation.md',
      description: 'Job evaluation criteria (04-job-evaluation.md)',
    },
    '05-cv-templates_md': {
      field: '05-cv-templates_md',
      column: 'cv_templates_md',
      fileName: '05-cv-templates.md',
      description: 'CV / resume templates (05-cv-templates.md)',
    },
    '06-cover-letter-templates_md': {
      field: '06-cover-letter-templates_md',
      column: 'cover_letter_templates_md',
      fileName: '06-cover-letter-templates.md',
      description: 'Cover letter templates (06-cover-letter-templates.md)',
    },
    '07-interview-prep_md': {
      field: '07-interview-prep_md',
      column: 'interview_prep_md',
      fileName: '07-interview-prep.md',
      description: 'Interview preparation notes (07-interview-prep.md)',
    },
    '08-application-forms_md': {
      field: '08-application-forms_md',
      column: 'application_forms_md',
      fileName: '08-application-forms.md',
      description: 'Application form answers (08-application-forms.md)',
    },
    '09-web-research_md': {
      field: '09-web-research_md',
      column: 'web_research_md',
      fileName: '09-web-research.md',
      description: 'Web research and fetching rules (09-web-research.md)',
    },
    'search-queries_md': {
      field: 'search-queries_md',
      column: 'search_queries_md',
      fileName: 'search-queries.md',
      description: 'Job search queries (search-queries.md)',
    },
  };

/** Returns the metadata of one markdown document field. */
export function getMarkdownDocument(
  field: MarkdownDocumentField,
): MarkdownDocumentMeta {
  const document = MARKDOWN_DOCUMENTS[field];

  if (!document) {
    throw new BadRequestException(`Unknown markdown field: ${field}`);
  }

  return document;
}

/**
 * Resolves the requested fields, or every document when none were requested.
 * Read paths are de-duplicated so a repeated field is not returned twice.
 */
export function getMarkdownDocuments(
  fields?: readonly MarkdownDocumentField[],
): MarkdownDocumentMeta[] {
  const selected =
    fields && fields.length > 0 ? fields : MARKDOWN_DOCUMENT_FIELDS;

  return [...new Set(selected)].map((field) => getMarkdownDocument(field));
}

/** Maps a stored user data record to the MCP response shape of one document. */
export function toMarkdownDocumentState(
  userData: Pick<UserDataEntity, MarkdownField>,
  document: MarkdownDocumentMeta,
): MarkdownDocumentState {
  const value = userData[document.column] ?? null;

  return {
    field: document.field,
    column: document.column,
    file_name: document.fileName,
    value,
    is_empty: value === null || value.trim().length === 0,
  };
}

/**
 * Builds the partial update payload expected by `UserDataService.updateUserData`.
 * Duplicate fields are rejected instead of silently keeping the last value.
 */
export function toMarkdownPatch(
  documents: readonly MarkdownDocumentInput[],
): Partial<Record<MarkdownField, string>> {
  const patch: Partial<Record<MarkdownField, string>> = {};
  const seen = new Set<MarkdownDocumentField>();

  for (const { field, content } of documents) {
    if (seen.has(field)) {
      throw new BadRequestException(
        `Duplicate markdown field in one request: ${field}`,
      );
    }

    seen.add(field);
    patch[getMarkdownDocument(field).column] = content;
  }

  return patch;
}

/** Maps a written document to the MCP response shape of an update. */
export function toMarkdownDocumentChange(
  document: MarkdownDocumentMeta,
  content: string,
): MarkdownDocumentChange {
  return {
    field: document.field,
    column: document.column,
    file_name: document.fileName,
    cleared: content.length === 0,
  };
}
