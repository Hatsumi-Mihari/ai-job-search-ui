import { forwardRef, Module } from '@nestjs/common';
import { Workers } from './test.worker.js';
import { VacModule } from '@/entities/vacances/vac.module.js';

@Module({
  imports: [forwardRef(() => VacModule)],
  providers: [Workers],
  exports: [Workers],
})
export class WorkersModule {}