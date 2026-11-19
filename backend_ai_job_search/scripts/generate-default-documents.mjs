/**
 * Generates `src/entities/user_data/utils/default-documents.data.util.ts`
 * from the markdown files in `src/common/ai/defSkills/`.
 *
 * The `.md` files are not copied into `dist/` by `nest build`, so their content
 * is compiled into TypeScript instead of being read from disk at runtime.
 *
 * Usage (from the backend root):
 *   node scripts/generate-default-documents.mjs
 *
 * Rerun after editing any file in `src/common/ai/defSkills/`; the generated
 * module is committed, so no build step depends on this script.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = resolve(root, 'src/common/ai/defSkills');
const targetFile = resolve(
  root,
  'src/entities/user_data/utils/default-documents.data.util.ts',
);

/** Source markdown file -> `UserDataEntity` markdown property. */
const FIELD_SOURCES = [
  ['CLAUDE.md', 'claude_md'],
  ['01-candidate-profile.md', 'candidate_profile_md'],
  ['02-behavioral-profile.md', 'behavioral_profile_md'],
  ['03-writing-style.md', 'writing_style_md'],
  ['04-job-evaluation.md', 'job_evaluation_md'],
  ['05-cv-templates.md', 'cv_templates_md'],
  ['06-cover-letter-templates.md', 'cover_letter_templates_md'],
  ['07-interview-prep.md', 'interview_prep_md'],
  ['08-application-forms.md', 'application_forms_md'],
  ['09-web-research.md', 'web_research_md'],
];

const entries = FIELD_SOURCES.map(([fileName, field]) => {
  const content = readFileSync(resolve(sourceDir, fileName), 'utf8');

  // JSON.stringify keeps newlines, quotes, backticks and `${` sequences safe.
  return `  ${field}: ${JSON.stringify(content)},`;
}).join('\n');

const banner = `/**
 * AUTO-GENERATED FILE - DO NOT EDIT BY HAND.
 *
 * Source files: src/common/ai/defSkills/*.md
 * Regenerate with: node scripts/generate-default-documents.mjs
 */`;

const file = `${banner}
import type { MarkdownField } from '../ud.service.js';

/**
 * Default markdown documents that every new user data record starts with.
 *
 * \`search_queries_md\` has no source file in \`src/common/ai/defSkills/\`, so it
 * has no default and stays \`null\` until a caller writes it.
 */
export const DEFAULT_USER_DATA_DOCUMENTS: Readonly<
  Partial<Record<MarkdownField, string>>
> = {
${entries}
};
`;

mkdirSync(dirname(targetFile), { recursive: true });

// Format with the project's Prettier so regenerating never creates diff noise.
const prettier = await import('prettier');
const prettierConfig = (await prettier.resolveConfig(targetFile)) ?? {};
const formatted = await prettier.format(file, {
  ...prettierConfig,
  filepath: targetFile,
  parser: 'typescript',
});

writeFileSync(targetFile, formatted, 'utf8');

console.log(`Wrote ${FIELD_SOURCES.length} default documents to ${targetFile}`);
