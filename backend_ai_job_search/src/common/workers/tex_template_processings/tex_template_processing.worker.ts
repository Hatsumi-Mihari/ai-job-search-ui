import { Injectable, Logger } from '@nestjs/common';

import { QueueService } from '@/entities/queue/queue.service.js';
import {
  normalizeErrorMessage,
  parseTexTemplatePayload,
  type TexTemplatePayload,
} from './utils/tex-template-payload.util.js';

/**
 * Processes `tex_template_processing` tasks.
 *
 * The task payload is read from the persisted queue row so the worker only
 * needs the task id, matching the task orchestrator contract. Expected payload:
 *
 * ```json
 * { "type": "cv" | "cover", "tex_data": "<LaTeX source>" }
 * ```
 */
@Injectable()
export class TexTemplateProcessingWorker {
  private readonly logger = new Logger(TexTemplateProcessingWorker.name);

  constructor(private readonly queueService: QueueService) {}

  async process(taskId: string): Promise<void> {
    try {
      const job = await this.queueService.findOneById(taskId);
      const payload = parseTexTemplatePayload(taskId, job.payload);

      this.logger.log(
        `Processing tex template task ${taskId} (type=${payload.type}, ${payload.tex_data.length} chars)`,
      );

      await this.processTexTemplate(taskId, payload);
    } catch (error) {
      this.logger.error(
        `Failed tex template task ${taskId}: ${normalizeErrorMessage(error)}`,
      );
      throw error;
    }
  }

  /**
   * TODO: implement the tex template processing pipeline (compile/convert the
   * LaTeX source and persist the generated document).
   */
  private async processTexTemplate(
    taskId: string,
    payload: TexTemplatePayload,
  ): Promise<void> {
    this.logger.log(
      `No tex template processing pipeline configured yet for task ${taskId} (type=${payload.type})`,
    );
  }
}
