# User Data Markdown MCP Tools

MCP entry points for the markdown documents stored on a `user_data` record.
They are generated from the existing `UserDataService`
(`src/entities/user_data/ud.service.ts`); no duplicate persistence or HTTP
client is introduced.

Every tool requires the UUID of one `user_data` row (`user_id`). There is no
lookup by `user_name` or by any other field, so a tool call can only read or
write the explicitly selected user.

## Tools

| MCP tool | Purpose | Service call | Equivalent HTTP endpoint |
| --- | --- | --- | --- |
| `user_data_get_markdown_field` | Read one document | `UserDataService.findOneById` | `POST /user-data/find` |
| `user_data_get_markdown_fields` | Read all seven or a selected subset | `UserDataService.findOneById` | `POST /user-data/find` |
| `user_data_update_markdown_field` | Overwrite one document | `UserDataService.updateUserData` | `PATCH /user-data/<field>` |
| `user_data_update_markdown_fields` | Overwrite several documents in one save | `UserDataService.updateUserData` | `PATCH /user-data/update` |

All four tools are registered by `McpUserDataModule`, which is imported by
`McpServerModule`. The MCP endpoint is the one configured by `McpModule`
(`/mcp` in `src/mcp/mcp.module.ts`).

## Fields

| Tool field | Entity property | Stored file | Single-field HTTP route |
| --- | --- | --- | --- |
| `CLAUDE_md` | `claude_md` | `CLAUDE.md` | `PATCH /user-data/claude-md` |
| `01-candidate-profile_md` | `candidate_profile_md` | `01-candidate-profile.md` | `PATCH /user-data/candidate-profile-md` |
| `02-behavioral-profile_md` | `behavioral_profile_md` | `02-behavioral-profile.md` | `PATCH /user-data/behavioral-profile-md` |
| `03-writing-style_md` | `writing_style_md` | `03-writing-style.md` | `PATCH /user-data/writing-style-md` |
| `04-job-evaluation_md` | `job_evaluation_md` | `04-job-evaluation.md` | `PATCH /user-data/job-evaluation-md` |
| `07-interview-prep_md` | `interview_prep_md` | `07-interview-prep.md` | `PATCH /user-data/interview-prep-md` |
| `search-queries_md` | `search_queries_md` | `search-queries.md` | `PATCH /user-data/search-queries-md` |

The public field names match the database column names of `UserDataEntity`.

## Usage

Read all documents of the selected user:

```json
{
  "user_id": "3f1c2b9e-6d4a-4c1e-9f0a-1b2c3d4e5f60"
}
```

Read a subset:

```json
{
  "user_id": "3f1c2b9e-6d4a-4c1e-9f0a-1b2c3d4e5f60",
  "fields": ["CLAUDE_md", "search-queries_md"]
}
```

Overwrite one document:

```json
{
  "user_id": "3f1c2b9e-6d4a-4c1e-9f0a-1b2c3d4e5f60",
  "field": "03-writing-style_md",
  "content": "# Writing style\n\nShort sentences."
}
```

Overwrite several documents in one save:

```json
{
  "user_id": "3f1c2b9e-6d4a-4c1e-9f0a-1b2c3d4e5f60",
  "documents": [
    { "field": "03-writing-style_md", "content": "..." },
    { "field": "search-queries_md", "content": "..." }
  ]
}
```

Read results contain `field`, `column`, `file_name`, `value` and `is_empty`.
`value` is `null` when the document was never stored, and `is_empty` is also
`true` for empty or whitespace-only content.

## Configuration

No new environment variables are required. The tools use the existing
`UserDataModule` and the PostgreSQL connection configured in `AppModule`; no
credentials are read or logged by the tools.

Authentication is not added by these tools: the project's MCP server currently
has no authentication configured. Access control is limited to requiring the
target UUID, so the MCP endpoint should stay on a trusted network or be placed
behind the deployment's normal access controls.

## Side effects and safety

- Update tools overwrite the complete stored document; they never append.
- An empty string clears a document. `null` is not accepted as content.
- `user_data_update_markdown_fields` rejects duplicate fields before writing.
- Only the `user_data` row matching `user_id` is modified. If the UUID does not
  exist, the service raises `NotFoundException` and nothing is written.
- The tools do not create or delete user data records and do not touch any
  other column of the row.

## Known limitations

- The caller must know the target UUID; the tools cannot find a user by name.
- There is no revision history, optimistic locking or conflict detection: the
  last write wins.
- Markdown content is free-form text. Only the type is validated; there is no
  size limit beyond the PostgreSQL `text` column.
- Tool output is serialized by `@nestjs/mcp`; read tools return the full stored
  document, so very large documents are returned in full.

## Verification

- Build: `npm run build`
- Lint: `npm run lint`
