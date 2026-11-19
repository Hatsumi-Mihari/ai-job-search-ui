import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Tool } from '@nestjs/mcp';
import { z } from 'zod';

import {
  StorageFileService,
  type StorageFileDownloadLink,
} from '@/entities/storage_files/sf.service.js';
import { getStorageConfig } from './config/storage.config.js';
import {
  DEFAULT_STORAGE_FILE_LIMIT,
  MAX_STORAGE_FILE_LIMIT,
  paginateStorageFiles,
  toStorageFileView,
  type StorageFilePage,
  type StorageFileView,
} from './utils/storage-file.util.js';

const CONTEXT = 'McpStorageFilesWorker';

/**
 * Read-only MCP tools for the files recorded in `storage_files`.
 *
 * Every tool delegates to `StorageFileService` (`entities/storage_files`), so
 * validation, error mapping and the database access stay in one place; the
 * tools add no persistence and no HTTP client.
 *
 * The object-store target link is not hardcoded: `storage_file_get_endpoint`
 * and `storage_file_get_download_link` read `S3_ENDPOINT` from the environment
 * through the configuration definition in `config/storage.config.ts`.
 *
 * Upload, metadata update and delete are intentionally not exposed: an MCP
 * call cannot supply a multipart file, and the other two mutate data.
 */

const listStorageFilesSchema = z.object({
  limit: z
    .number()
    .int()
    .min(1)
    .max(MAX_STORAGE_FILE_LIMIT)
    .optional()
    .describe(
      `Maximum number of records to return (1-${MAX_STORAGE_FILE_LIMIT}). Defaults to ${DEFAULT_STORAGE_FILE_LIMIT}.`,
    ),
  offset: z
    .number()
    .int()
    .min(0)
    .optional()
    .describe('Number of records to skip, for paging. Defaults to 0.'),
});

const getStorageFileSchema = z.object({
  id: z
    .uuid()
    .describe('UUID (primary key) of the storage_files record to read'),
});

const getStorageFileDownloadLinkSchema = z.object({
  file_name: z
    .string()
    .min(1)
    .max(256)
    .describe(
      'Stored file name (the storage_files.file_name value). When several records share the name, the most recent one is used.',
    ),
});

export type StorageFileDownloadLinkView = StorageFileDownloadLink & {
  /** Target link of the object store, read from the S3_ENDPOINT configuration key. */
  S3_ENDPOINT: string | null;
};

@Injectable()
export class McpStorageFilesWorker {
  constructor(
    private readonly storageFileService: StorageFileService,
    private readonly configService: ConfigService,
  ) {}

  // ---------------------------------------------------------------- endpoint

  @Tool({
    name: 'storage_file_get_endpoint',
    description:
      'Returns the configured S3 endpoint (S3_ENDPOINT) of the object store that holds the saved files. It is read from the environment configuration, not hardcoded, and is null when the key is unset. Use it to explain where download links point.',
    inputSchema: z.object({}),
    annotations: { readOnlyHint: true, idempotentHint: true },
  })
  async storageFileGetEndpoint(): Promise<{ S3_ENDPOINT: string | null }> {
    Logger.log('storage_file_get_endpoint', CONTEXT);

    const { S3_ENDPOINT } = getStorageConfig(this.configService);

    return { S3_ENDPOINT };
  }

  // ------------------------------------------------------------------- read

  @Tool({
    name: 'storage_file_list',
    description:
      'Lists saved files (storage_files records) newest first, with id, file_name, size_bytes, sources3 and date_add. Use limit/offset to page through large tables; total reports how many records exist.',
    inputSchema: listStorageFilesSchema,
    annotations: { readOnlyHint: true, idempotentHint: true },
  })
  async storageFileList({
    limit,
    offset,
  }: z.infer<typeof listStorageFilesSchema>): Promise<StorageFilePage> {
    Logger.log(
      `storage_file_list limit=${limit ?? DEFAULT_STORAGE_FILE_LIMIT} offset=${offset ?? 0}`,
      CONTEXT,
    );

    const files = await this.storageFileService.findAll();

    return paginateStorageFiles(
      files,
      limit ?? DEFAULT_STORAGE_FILE_LIMIT,
      offset ?? 0,
    );
  }

  @Tool({
    name: 'storage_file_get',
    description:
      'Reads one saved file by its UUID, returning file_name, size_bytes, sources3 and date_add. Raises a not-found error when the record does not exist.',
    inputSchema: getStorageFileSchema,
    annotations: { readOnlyHint: true, idempotentHint: true },
  })
  async storageFileGet({
    id,
  }: z.infer<typeof getStorageFileSchema>): Promise<StorageFileView> {
    Logger.log(`storage_file_get id=${id}`, CONTEXT);

    const file = await this.storageFileService.findOneById(id);

    return toStorageFileView(file);
  }

  @Tool({
    name: 'storage_file_get_download_link',
    description:
      'Returns the download link of the most recent saved file with the given file_name, together with its size and the configured S3_ENDPOINT. The URL is built from the stored sources3 path and the configured storage base; absolute paths are returned unchanged. Raises a not-found error when no file has that name.',
    inputSchema: getStorageFileDownloadLinkSchema,
    annotations: { readOnlyHint: true, idempotentHint: true },
  })
  async storageFileGetDownloadLink({
    file_name,
  }: z.infer<
    typeof getStorageFileDownloadLinkSchema
  >): Promise<StorageFileDownloadLinkView> {
    Logger.log(
      `storage_file_get_download_link file_name=${file_name}`,
      CONTEXT,
    );

    const link = await this.storageFileService.getDownloadLinkByName(file_name);
    const { S3_ENDPOINT } = getStorageConfig(this.configService);

    return { ...link, S3_ENDPOINT };
  }
}
