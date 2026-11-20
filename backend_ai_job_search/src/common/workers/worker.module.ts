import { forwardRef, Module } from '@nestjs/common';
import { Workers } from './test_worker/test.worker.js';
import { TexTemplateProcessingWorker } from './tex_template_processings/tex_template_processing.worker.js';
import { VacModule } from '@/entities/vacances/vac.module.js';
import {OpenCodeModule} from '../services/opencode/opencode.module.js'
import { QueueModule, StorageFilesModule } from '@/entities/index.js';

@Module({
  imports: [
    forwardRef(() => VacModule),
    forwardRef(() => OpenCodeModule),
    forwardRef(() => StorageFilesModule),
    forwardRef(() => QueueModule),
  ],
  providers: [Workers, TexTemplateProcessingWorker],
  exports: [Workers, TexTemplateProcessingWorker],
})
export class WorkersModule {}