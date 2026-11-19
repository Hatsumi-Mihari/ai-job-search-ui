import { Module } from '@nestjs/common';
import { UserDataModule } from '@/entities/user_data/ud.module.js';
import { McpUserDataWorker } from './mcpUserData.service.js';

/**
 * Registers the user data markdown tools. Importing `UserDataModule` gives the
 * tools access to `UserDataService`; the root `McpModule` discovers the
 * decorated methods.
 */
@Module({
  imports: [UserDataModule],
  providers: [McpUserDataWorker],
  exports: [McpUserDataWorker],
})
export class McpUserDataModule {}
