import { Injectable, Logger } from '@nestjs/common';
import { Tool } from '@nestjs/mcp';
import { z } from 'zod';

import {
  type UserDataMutationResult,
  UserDataService,
} from '@/entities/user_data/ud.service.js';
import {
  type MarkdownDocumentChange,
  type MarkdownDocumentField,
  type MarkdownDocumentState,
  getMarkdownDocument,
  toMarkdownDocumentChange,
  toMarkdownDocumentState,
  toMarkdownPatch,
} from './utils/user-data-markdown.util.js';

const CONTEXT = 'McpUserDataDocumentsWorker';

/**
 * Focused MCP tools for the four build-output documents of the job search
 * framework: CV templates, cover letter templates, application forms and web
 * research.
 *
 * Every tool requires `user_id` (the UUID of the `user_data` record) and only
 * reads or writes that row, so a call always operates on one explicitly
 * selected user. The tools are thin wrappers around `UserDataService`; the
 * field metadata and response shapes are shared with `McpUserDataWorker` via
 * `utils/user-data-markdown.util.js`.
 */

/** UUID of the selected user data record, required by every tool. */
const userIdSchema = z
  .uuid()
  .describe(
    'UUID of the user_data record (the selected user). All reads and writes are scoped to this record.',
  );

const getDocumentSchema = z.object({
  user_id: userIdSchema,
});

const updateDocumentSchema = (fileName: string) =>
  z.object({
    user_id: userIdSchema,
    content: z
      .string()
      .describe(
        `Complete new markdown content of ${fileName}. It replaces the stored document; it is not appended. Pass an empty string to clear the document.`,
      ),
  });

type GetDocumentInput = z.infer<typeof getDocumentSchema>;
type UpdateDocumentInput = z.infer<ReturnType<typeof updateDocumentSchema>>;

type MarkdownDocumentUpdateResult = UserDataMutationResult &
  MarkdownDocumentChange;

/** Tool annotation sets shared by every read and every update below. */
const READ_ANNOTATIONS = { readOnlyHint: true, idempotentHint: true } as const;
const UPDATE_ANNOTATIONS = {
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: true,
} as const;

@Injectable()
export class McpUserDataDocumentsWorker {
  constructor(private readonly userDataService: UserDataService) {}

  // ------------------------------------------------------------------- read

  @Tool({
    name: 'user_data_get_cv_templates',
    description:
      'Reads the CV templates document (05-cv-templates_md) of the user data record selected by its UUID. Returns null when the document was never stored.',
    inputSchema: getDocumentSchema,
    annotations: READ_ANNOTATIONS,
  })
  async userDataGetCvTemplates({
    user_id,
  }: GetDocumentInput): Promise<MarkdownDocumentState> {
    Logger.log(`user_data_get_cv_templates user=${user_id}`, CONTEXT);

    return this.readDocument(user_id, '05-cv-templates_md');
  }

  @Tool({
    name: 'user_data_get_cover_letter_templates',
    description:
      'Reads the cover letter templates document (06-cover-letter-templates_md) of the user data record selected by its UUID. Returns null when the document was never stored.',
    inputSchema: getDocumentSchema,
    annotations: READ_ANNOTATIONS,
  })
  async userDataGetCoverLetterTemplates({
    user_id,
  }: GetDocumentInput): Promise<MarkdownDocumentState> {
    Logger.log(`user_data_get_cover_letter_templates user=${user_id}`, CONTEXT);

    return this.readDocument(user_id, '06-cover-letter-templates_md');
  }

  @Tool({
    name: 'user_data_get_application_forms',
    description:
      'Reads the application forms document (08-application-forms_md) of the user data record selected by its UUID. Returns null when the document was never stored.',
    inputSchema: getDocumentSchema,
    annotations: READ_ANNOTATIONS,
  })
  async userDataGetApplicationForms({
    user_id,
  }: GetDocumentInput): Promise<MarkdownDocumentState> {
    Logger.log(`user_data_get_application_forms user=${user_id}`, CONTEXT);

    return this.readDocument(user_id, '08-application-forms_md');
  }

  @Tool({
    name: 'user_data_get_web_research',
    description:
      'Reads the web research document (09-web-research_md) of the user data record selected by its UUID. Returns null when the document was never stored.',
    inputSchema: getDocumentSchema,
    annotations: READ_ANNOTATIONS,
  })
  async userDataGetWebResearch({
    user_id,
  }: GetDocumentInput): Promise<MarkdownDocumentState> {
    Logger.log(`user_data_get_web_research user=${user_id}`, CONTEXT);

    return this.readDocument(user_id, '09-web-research_md');
  }

  // ----------------------------------------------------------------- update

  @Tool({
    name: 'user_data_update_cv_templates',
    description:
      'Overwrites the CV templates document (05-cv-templates_md) of the user data record selected by its UUID. The content replaces the stored document; an empty string clears it. Other fields of the user are untouched.',
    inputSchema: updateDocumentSchema('05-cv-templates.md'),
    annotations: UPDATE_ANNOTATIONS,
  })
  async userDataUpdateCvTemplates({
    user_id,
    content,
  }: UpdateDocumentInput): Promise<MarkdownDocumentUpdateResult> {
    Logger.log(`user_data_update_cv_templates user=${user_id}`, CONTEXT);

    return this.writeDocument(user_id, '05-cv-templates_md', content);
  }

  @Tool({
    name: 'user_data_update_cover_letter_templates',
    description:
      'Overwrites the cover letter templates document (06-cover-letter-templates_md) of the user data record selected by its UUID. The content replaces the stored document; an empty string clears it. Other fields of the user are untouched.',
    inputSchema: updateDocumentSchema('06-cover-letter-templates.md'),
    annotations: UPDATE_ANNOTATIONS,
  })
  async userDataUpdateCoverLetterTemplates({
    user_id,
    content,
  }: UpdateDocumentInput): Promise<MarkdownDocumentUpdateResult> {
    Logger.log(
      `user_data_update_cover_letter_templates user=${user_id}`,
      CONTEXT,
    );

    return this.writeDocument(user_id, '06-cover-letter-templates_md', content);
  }

  @Tool({
    name: 'user_data_update_application_forms',
    description:
      'Overwrites the application forms document (08-application-forms_md) of the user data record selected by its UUID. The content replaces the stored document; an empty string clears it. Other fields of the user are untouched.',
    inputSchema: updateDocumentSchema('08-application-forms.md'),
    annotations: UPDATE_ANNOTATIONS,
  })
  async userDataUpdateApplicationForms({
    user_id,
    content,
  }: UpdateDocumentInput): Promise<MarkdownDocumentUpdateResult> {
    Logger.log(`user_data_update_application_forms user=${user_id}`, CONTEXT);

    return this.writeDocument(user_id, '08-application-forms_md', content);
  }

  @Tool({
    name: 'user_data_update_web_research',
    description:
      'Overwrites the web research document (09-web-research_md) of the user data record selected by its UUID. The content replaces the stored document; an empty string clears it. Other fields of the user are untouched.',
    inputSchema: updateDocumentSchema('09-web-research.md'),
    annotations: UPDATE_ANNOTATIONS,
  })
  async userDataUpdateWebResearch({
    user_id,
    content,
  }: UpdateDocumentInput): Promise<MarkdownDocumentUpdateResult> {
    Logger.log(`user_data_update_web_research user=${user_id}`, CONTEXT);

    return this.writeDocument(user_id, '09-web-research_md', content);
  }

  // ---------------------------------------------------------------- helpers

  /** Reads one document of the selected user; fails if the UUID is unknown. */
  private async readDocument(
    userId: string,
    field: MarkdownDocumentField,
  ): Promise<MarkdownDocumentState> {
    const document = getMarkdownDocument(field);
    const userData = await this.userDataService.findOneById(userId);

    return toMarkdownDocumentState(userData, document);
  }

  /**
   * Overwrites one document of the selected user. Goes through
   * `UserDataService.updateUserData`, so id validation, `@Measure` tracking and
   * the "record must exist" check are the same as for the HTTP endpoints.
   */
  private async writeDocument(
    userId: string,
    field: MarkdownDocumentField,
    content: string,
  ): Promise<MarkdownDocumentUpdateResult> {
    const document = getMarkdownDocument(field);
    const result = await this.userDataService.updateUserData(
      userId,
      toMarkdownPatch([{ field, content }]),
    );

    return {
      ...result,
      ...toMarkdownDocumentChange(document, content),
    };
  }
}
