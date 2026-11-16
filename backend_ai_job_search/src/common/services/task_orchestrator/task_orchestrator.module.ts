import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobEntity } from '@/entities/queue/queue.entity.js';
import { QueueModule } from '@/entities/queue/queue.module.js';
import { TaskOrchestratorService } from './task_orchestrator.service.js';
import { WorkerRegistry } from './worker_reg.service.js'
import { WorkersModule } from '@/common/workers/worker.module.js';
/**
 * Exposes the database-driven task orchestrator application-wide, so any
 * feature can trigger a persisted task through DI without importing the queue
 * module again.
 */
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([JobEntity]), QueueModule, WorkersModule],
  providers: [TaskOrchestratorService, WorkerRegistry],
  exports: [TaskOrchestratorService],
})
export class TaskOrchestratorModule {}
