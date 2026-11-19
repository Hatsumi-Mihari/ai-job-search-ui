# Storage Files MCP Tools

MCP entry points for the files recorded in `storage_files` and for the object
store that holds them. They are generated from the existing
`StorageFileService` (`src/entities/storage_files/sf.service.ts`); no duplicate
persistence or HTTP client is introduced.

The object-store target link is never hardcoded. It is resolved from the
environment (`.env`, loaded by `ConfigModule.forRoot`) through the
configuration definition in `config/storage.config.ts`, and the property
returned to callers is named after its key: `S3_ENDPOINT`.

## Tools

| MCP tool                         | Purpose                                        | Service call                               | Equivalent HTTP endpoint            |
| -------------------------------- | ---------------------------------------------- | ------------------------------------------ | ----------------------------------- |
| `storage_file_get_endpoint`      | Return the configured `S3_ENDPOINT` (no input) | `getStorageConfig(ConfigService)`          | none (configuration read)           |
| `storage_file_list`              | List saved files newest first, with paging     | `StorageFileService.findAll`               | `GET /storage-files`                |
| `storage_file_get`               | Read one saved file by UUID                    | `StorageFileService.findOneById`           | `POST /storage-files/find`          |
| `storage_file_get_download_link` | Build the download link for a file name        | `StorageFileService.getDownloadLinkByName` | `POST /storage-files/download-link` |
| `storage_file_upload`            | Upload base64 content and record it            | `StorageFileService.createStorageFile`     | `POST /storage-files` (multipart)   |

All five tools are registered by `McpStorageFilesModule`, which is imported by
`McpServerModule`. The MCP endpoint is the one configured by `McpModule`
(`/mcp` in `src/mcp/mcp.module.ts`).

## Response fields

`storage_file_list` returns `total` (number of stored records), `limit`,
`offset` and `items`. Each item contains:

| Field        | Entity property | Meaning                                            |
| ------------ | --------------- | -------------------------------------------------- |
| `id`         | `id`            | UUID primary key of the `storage_files` row        |
| `file_name`  | `file_name`     | Stored file name, also the S3 object key           |
| `size_bytes` | `size`          | File size in bytes                                 |
| `sources3`   | `sources3`      | S3 key/path, or an absolute URL for uploaded files |
| `date_add`   | `date_add`      | Insertion timestamp as an ISO-8601 string          |

`storage_file_get` returns one item of the same shape.

`storage_file_get_download_link` returns `success`, `file_name`, `size_bytes`,
`download_url` and `S3_ENDPOINT`. `S3_ENDPOINT` is the configured endpoint, or
`null` when the key is unset. `download_url` is produced by the existing
service: an absolute `sources3` value is returned unchanged, otherwise the
stored path is appended to `STORAGE_DOWNLOAD_BASE_URL` (or
`STORAGE_BASE_URL`). Uploads made through `StorageService` already store an
absolute `S3_ENDPOINT`-based path.

`storage_file_get_endpoint` returns only `S3_ENDPOINT`.

`storage_file_upload` returns `success`, `message`, `id`, `file` (the new
record in the same shape as a list item) and `S3_ENDPOINT`. The stored
`file_name` is `${Date.now()}-${originalname}`, so it differs from the requested
name; use the returned value for later calls.

## Configuration

| Variable                                                   | Required                                                                                          | Used by                                    |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `S3_ENDPOINT`                                              | For `storage_file_get_endpoint` and the `S3_ENDPOINT` field; uploads use it as the file path base | configuration definition, `StorageService` |
| `S3_BUCKET_NAME`                                           | For uploads and for the bucket segment of stored paths                                            | configuration definition, `StorageService` |
| `STORAGE_DOWNLOAD_BASE_URL` or `STORAGE_BASE_URL`          | When `sources3` is a relative path                                                                | `StorageFileService.buildDownloadUrl`      |
| `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | For S3 access through `StorageService`                                                            | `StorageService`                           |

No values are read from the `.env` file directly by these tools; the
`ConfigService` injected at runtime resolves them. A missing `S3_ENDPOINT` is
reported as `null`, never replaced by a hardcoded default, and it is not
logged.

Authentication is not added by these tools: the project's MCP server currently
has no authentication configured, so the endpoint should stay on a trusted
network or behind the deployment's normal access controls.

## Side effects and safety

- `storage_file_upload` is the only tool with side effects: it writes one S3
  object and inserts one `storage_files` row. It is marked
  `readOnlyHint: false` and `idempotentHint: false`; uploading the same name
  twice creates two objects and two rows.
- The other four tools are read-only; none updates or deletes a file.
- `storage_file_upload` refuses to run when `S3_ENDPOINT` is unset, so a
  misconfigured environment fails before anything is written.
- The file name is reduced to its last path segment and stripped of control
  characters, the content is validated as canonical base64, and the decoded
  size is capped before the upload starts.
- `storage_file_list` reads every row and returns one page locally, because
  `StorageFileService.findAll` has no server-side paging. Use `limit`/`offset`
  to keep responses small.
- Missing records raise the service's `NotFoundException`, which
  `@nestjs/mcp` reports as an error result; failures are not converted into
  successful responses.
- No file content, credentials, access keys or authorization headers are
  logged. Only the sanitized name and the decoded byte count are logged for an
  upload.

## Known limitations

- MCP calls cannot send multipart form data, so `storage_file_upload` accepts
  base64 JSON. The MCP HTTP endpoint reads at most 4 MiB per request and the
  tool caps decoded content at 2 MiB; larger files must use
  `POST /storage-files` as multipart form data.
- An `application/octet-stream` content type is used when `content_type` is
  omitted; the type is not inferred from the file extension.
- `StorageFileService.createStorageFile` trusts the result of the S3 upload. If
  S3 rejects the object, the service may still try to persist a row and the
  database then raises the error; the tool reports that error instead of
  claiming success. There is no automatic rollback of an uploaded object.
- Metadata update (`PATCH /storage-files/update`) and delete
  (`DELETE /storage-files/delete`) are not exposed because they mutate data.
- `storage_file_list` sorts in memory after loading all rows, so very large
  tables still cost a full read per call. There is no name or date filter.
- The download-link tool requires `STORAGE_DOWNLOAD_BASE_URL` (or
  `STORAGE_BASE_URL`) when the stored path is not absolute; without it the
  service raises `InternalServerErrorException`.
- `S3_ENDPOINT` is returned exactly as configured (trimmed). No trailing-slash
  normalisation is applied to the returned value.

## Usage

Read the configured endpoint (no input):

```json
{}
```

List the ten newest files:

```json
{ "limit": 10 }
```

Page past the first fifty:

```json
{ "limit": 50, "offset": 50 }
```

Read one file by UUID:

```json
{ "id": "3f1c2b9e-6d4a-4c1e-9f0a-1b2c3d4e5f60" }
```

Get a download link by file name:

```json
{ "file_name": "1730000000000-resume.pdf" }
```

Upload a small PDF (content abbreviated):

```json
{
  "file_name": "resume.pdf",
  "content_type": "application/pdf",
  "content_base64": "JVBERi0xLjQKJcfsj6IK..."
}
```

The response contains the new `id`, the stored `file` record and
`S3_ENDPOINT`. Use `file.file_name` (for example
`1730000000000-resume.pdf`) when calling `storage_file_get_download_link`.

## Verification

- Build: `npm run build` — passed.
- Type check: `npx tsc --noEmit -p tsconfig.json` — passed.
- Unit tests: `npx vitest run src/mcp/tools/mcpWorkers/storage_files/utils/storage-upload.util.spec.ts` — passed.
- Lint: `npx oxlint --type-aware src/mcp/tools/mcpWorkers/storage_files src/mcp/mcp.module.ts`
  — no findings in the new tool files. The command still exits non-zero because
  of pre-existing diagnostics (`tsconfig.json` options reported by tsgolint and
  the unused `McpVacWorker` import in `src/mcp/mcp.module.ts`).
- Formatting: `npx prettier --check "src/mcp/tools/mcpWorkers/storage_files/**/*.ts" "src/mcp/mcp.module.ts"` — passed.
