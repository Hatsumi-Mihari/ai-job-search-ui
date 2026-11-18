import { forwardRef, Module } from '@nestjs/common';
import { Workers } from './test_worker/test.worker.js';
import { VacModule } from '@/entities/vacances/vac.module.js';
import {OpenCodeModule} from '../services/opencode/opencode.module.js'

@Module({
  imports: [forwardRef(() => VacModule), forwardRef(() => OpenCodeModule)],
  providers: [Workers],
  exports: [Workers],
})
export class WorkersModule {}