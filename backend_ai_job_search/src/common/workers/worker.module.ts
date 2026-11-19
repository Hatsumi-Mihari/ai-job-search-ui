import { forwardRef, Module } from '@nestjs/common';
import { Workers } from './test_worker/test.worker.js';
import { VacModule } from '@/entities/vacances/vac.module.js';
import {OpenCodeModule} from '../services/opencode/opencode.module.js'
import { StorageFilesModule } from '@/entities/index.js';
import { McpVacWorker } from '../../mcp/tools/mcpWorkers/vacancy/mcpVac.service.js';

@Module({
  imports: [
    forwardRef(() => VacModule),
    forwardRef(() => OpenCodeModule),
    forwardRef(() => StorageFilesModule),
  ],
  providers: [Workers, McpVacWorker],
  exports: [Workers, McpVacWorker],
})
export class WorkersModule {}