import { Injectable, Logger } from '@nestjs/common';
import { Tool } from '@nestjs/mcp';
import { z } from 'zod';

import {
  type UserDataMutationResult,
  UserDataService,
} from '@/entities/user_data/ud.service.js';
import {
  MARKDOWN_DOCUMENT_FIELDS,
  type MarkdownDocumentState,
  type MarkdownDocumentChange,
  getMarkdownDocument,
  getMarkdownDocuments,
  toMarkdownDocumentChange,
  toMarkdownDocumentState,
  toMarkdownPatch,
} from './utils/user-data-markdown.util.js';

const CONTEXT = 'McpUserDataWorker';

/**
 * MCP tools for the markdown documents stored on one selected user data row.
 *
 * `user_data_get_selected_user_uid` returns the uid of the user that was
 * selected through the HTTP endpoints; it is the only tool without input.
 *
 * Every other tool requires `user_id` (the UUID of the `user_data` record) and
 * only ever reads or writes that row. There is deliberately no lookup by
 * `user_name`: a caller must know the UUID of the selected user first.
 *
 * Reads use `UserDataService.findOneById`; writes use
 * `UserDataService.updateUserData`, which applies a partial patch and keeps the
 * id, validation and `@Measure` tracking in the service.
 */

/** UUID of the selected user data record, required by every tool. */
const userIdSchema = z
  .uuid()
  .describe(
    'UUID of the user_data record (the selected user). All reads and writes are scoped to this record.',
  );

/** One of the eleven markdown documents stored on the user data row. */
const markdownFieldSchema = z
  .enum(MARKDOWN_DOCUMENT_FIELDS)
  .describe(
    'Markdown document field, named like its database column: CLAUDE_md, 01-candidate-profile_md, 02-behavioral-profile_md, 03-writing-style_md, 04-job-evaluation_md, 05-cv-templates_md, 06-cover-letter-templates_md, 07-interview-prep_md, 08-application-forms_md, 09-web-research_md or search-queries_md.',
  );

const getMarkdownFieldSchema = z.object({
  user_id: userIdSchema,
  field: markdownFieldSchema,
});

const getMarkdownFieldsSchema = z.object({
  user_id: userIdSchema,
  fields: z
    .array(markdownFieldSchema)
    .min(1)
    .optional()
    .describe(
      'Document fields to read. Omit to read all eleven documents of the selected user.',
    ),
});

const updateMarkdownFieldSchema = z.object({
  user_id: userIdSchema,
  field: markdownFieldSchema,
  content: z
    .string()
    .describe(
      'Complete new markdown content. It replaces the stored document; it is not appended. Pass an empty string to clear the document.',
    ),
});

const updateMarkdownFieldsSchema = z.object({
  user_id: userIdSchema,
  documents: z
    .array(
      z.object({
        field: markdownFieldSchema,
        content: z
          .string()
          .describe(
            'Complete new markdown content. It replaces the stored document. Pass an empty string to clear it.',
          ),
      }),
    )
    .min(1)
    .describe(
      'Documents to write in one update. Each field may appear only once.',
    ),
});

type GetMarkdownFieldInput = z.infer<typeof getMarkdownFieldSchema>;
type GetMarkdownFieldsInput = z.infer<typeof getMarkdownFieldsSchema>;
type UpdateMarkdownFieldInput = z.infer<typeof updateMarkdownFieldSchema>;
type UpdateMarkdownFieldsInput = z.infer<typeof updateMarkdownFieldsSchema>;

type MarkdownDocumentListResult = {
  user_id: string;
  documents: MarkdownDocumentState[];
};

type MarkdownDocumentUpdateResult = UserDataMutationResult &
  MarkdownDocumentChange;

type MarkdownDocumentsUpdateResult = UserDataMutationResult & {
  documents: MarkdownDocumentChange[];
};

@Injectable()
export class McpUserDataWorker {
  constructor(private readonly userDataService: UserDataService) {}

  // ----------------------------------------------------------- selected user

  /**
   * Exposes the selection maintained by `UserDataService`. The selection is
   * set through `POST /user-data/select` and kept in memory, so this tool
   * reads the same state the HTTP endpoints use.
   */
  @Tool({
    name: 'user_data_get_selected_user_uid',
    description:
      'Returns the uid (UUID of the user_data row) of the user selected through POST /user-data/select, or null when no user is selected. The selection is in-memory state of the API process and is not stored in the database.',
    inputSchema: z.object({}),
    annotations: { readOnlyHint: true, idempotentHint: true },
  })
  async userDataGetSelectedUserUid(): Promise<{ uid: string | null }> {
    Logger.log('user_data_get_selected_user_uid', CONTEXT);

    const uid = await this.userDataService.findSelectedUser();

    return { uid: uid ?? null };
  }

  // ------------------------------------------------------------------- read

  @Tool({
    name: 'user_data_get_markdown_field',
    description:
      'Reads one markdown document field (CLAUDE_md, 01-candidate-profile_md, ...) of the user data record selected by its UUID. Returns null when the document was never stored.',
    inputSchema: getMarkdownFieldSchema,
    annotations: { readOnlyHint: true, idempotentHint: true },
  })
  async userDataGetMarkdownField({
    user_id,
    field,
  }: GetMarkdownFieldInput): Promise<MarkdownDocumentState> {
    Logger.log(
      `user_data_get_markdown_field user=${user_id} field=${field}`,
      CONTEXT,
    );

    const userData = await this.userDataService.findOneById(user_id);

    return toMarkdownDocumentState(userData, getMarkdownDocument(field));
  }

  @Tool({
    name: 'user_data_get_markdown_fields',
    description:
      'Reads the markdown document fields of the user data record selected by its UUID. Omit "fields" to read all eleven documents; an empty document is reported with value null or an empty string.',
    inputSchema: getMarkdownFieldsSchema,
    annotations: { readOnlyHint: true, idempotentHint: true },
  })
  async userDataGetMarkdownFields({
    user_id,
    fields,
  }: GetMarkdownFieldsInput): Promise<MarkdownDocumentListResult> {
    Logger.log(
      `user_data_get_markdown_fields user=${user_id} fields=${fields?.join(',') ?? 'all'}`,
      CONTEXT,
    );

    const userData = await this.userDataService.findOneById(user_id);
    const documents = getMarkdownDocuments(fields).map((document) =>
      toMarkdownDocumentState(userData, document),
    );

    return { user_id: userData.id, documents };
  }

  // ----------------------------------------------------------------- update

  @Tool({
    name: 'user_data_update_markdown_field',
    description:
      'Overwrites one markdown document field of the user data record selected by its UUID. The content replaces the stored document; an empty string clears it. Other fields of the user are untouched.',
    inputSchema: updateMarkdownFieldSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
    },
  })
  async userDataUpdateMarkdownField({
    user_id,
    field,
    content,
  }: UpdateMarkdownFieldInput): Promise<MarkdownDocumentUpdateResult> {
    Logger.log(
      `user_data_update_markdown_field user=${user_id} field=${field}`,
      CONTEXT,
    );

    const document = getMarkdownDocument(field);
    const result = await this.userDataService.updateUserData(
      user_id,
      toMarkdownPatch([{ field, content }]),
    );

    return {
      ...result,
      ...toMarkdownDocumentChange(document, content),
    };
  }

  @Tool({
    name: 'user_data_update_markdown_fields',
    description:
      'Overwrites several markdown document fields of the user data record selected by its UUID in one save. Each content replaces the stored document; an empty string clears it. Each field may appear only once.',
    inputSchema: updateMarkdownFieldsSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
    },
  })
  async userDataUpdateMarkdownFields({
    user_id,
    documents,
  }: UpdateMarkdownFieldsInput): Promise<MarkdownDocumentsUpdateResult> {
    Logger.log(
      `user_data_update_markdown_fields user=${user_id} fields=${documents
        .map((document) => document.field)
        .join(',')}`,
      CONTEXT,
    );

    // Rejects duplicate fields before anything is written.
    const patch = toMarkdownPatch(documents);

    const result = await this.userDataService.updateUserData(user_id, patch);

    return {
      ...result,
      documents: documents.map(({ field, content }) =>
        toMarkdownDocumentChange(getMarkdownDocument(field), content),
      ),
    };
  }
}
