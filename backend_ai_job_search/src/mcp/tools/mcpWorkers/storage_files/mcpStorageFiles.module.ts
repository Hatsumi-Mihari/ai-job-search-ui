import { Module } from '@nestjs/common';
import { StorageFilesModule } from '@/entities/storage_files/sf.module.js';
import { McpStorageFilesWorker } from './mcpStorageFiles.service.js';

/**
 * Registers the read-only storage_files MCP tools.
 *
 * Importing `StorageFilesModule` gives the worker access to
 * `StorageFileService` (and with it `StorageService`); `ConfigService` is
 * available because `ConfigModule.forRoot` is global. The root
 * `McpServerModule` discovers the decorated methods.
 */
@Module({
  imports: [StorageFilesModule],
  providers: [McpStorageFilesWorker],
  exports: [McpStorageFilesWorker],
})
export class McpStorageFilesModule {}
