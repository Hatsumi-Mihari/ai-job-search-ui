import { Injectable, Logger } from '@nestjs/common';
import { Workers } from '@/common/workers/index.js';

const CONTEXT = 'TaskOrchestratorService/WorkerRegistryService';

/**
 * Function that executes the business logic of a task. It only receives the
 * id of the task, which is already persisted in the database; the full row is
 * read back by the processor when it needs more context.
 */
export type TaskProcessor = (taskId: string) => Promise<void> | void;

@Injectable()
export class WorkerRegistry {
  private registry = new Map<string, TaskProcessor>();

  constructor(private readonly workers: Workers) {
    this.register('vacancy_processing', (taskId: string) =>
       this.workers.test(taskId),
    );
  }
  // -------------------------------------------------------------- register

  /**
   * Registers the processor for one job type. Features register their handler
   * during bootstrap (`onModuleInit`), so the processing logic is provided
   * through Dependency Injection instead of being hard-coded here.
   *
   * Jobs whose `type` has no registered processor are reported as failed
   * through the queue service, which applies the retry budget.
   */
  private register(type: string, handler: TaskProcessor) {
    if (type.length === 0) {
      throw new Error('Job type must be a non-empty string');
    }

    if (typeof handler !== 'function') {
      throw new Error('Task processor must be a function');
    }

    this.registry.set(type.trim(), handler);
    Logger.log(`Processor registered for job type '${type}'`, CONTEXT);
  }

  get(type: string): TaskProcessor | undefined {
    return this.registry.get(type);
  }
}
