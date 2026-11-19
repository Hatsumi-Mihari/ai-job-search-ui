import { Module } from '@nestjs/common';
import { UserDataModule } from '@/entities/user_data/ud.module.js';
import { McpUserDataWorker } from './mcpUserData.service.js';
import { McpUserDataDocumentsWorker } from './mcpUserDataDocuments.service.js';

/**
 * Registers the user data markdown tools. Importing `UserDataModule` gives the
 * tools access to `UserDataService`; the root `McpModule` discovers the
 * decorated methods.
 *
 * `McpUserDataWorker` exposes the generic per-field/batch tools for every
 * document, `McpUserDataDocumentsWorker` exposes dedicated tools for the CV
 * templates, cover letter templates, application forms and web research.
 */
@Module({
  imports: [UserDataModule],
  providers: [McpUserDataWorker, McpUserDataDocumentsWorker],
  exports: [McpUserDataWorker, McpUserDataDocumentsWorker],
})
export class McpUserDataModule {}
