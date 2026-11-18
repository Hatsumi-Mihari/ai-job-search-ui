import { ModuleRef } from '@nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';

import { TestService } from '@/entities/vacances/vac.service.js';
import { OpenCodeService } from '@/common/services/opencode/opencode.service.js';
import { StorageFileService } from '@/entities/storage_files/sf.service.js';

@Injectable()
export class McpVacWorker {
  constructor(
    private readonly moduleRef: ModuleRef
  ) {}

  async test(taskId: string) {
    
  }
}
