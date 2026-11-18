import { ModuleRef } from '@nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';

import { TestService } from '@/entities/vacances/vac.service.js';
import { OpenCodeService } from '@/common/services/opencode/opencode.service.js';
import { StorageFileService } from '@/entities/storage_files/sf.service.js';

@Injectable()
export class Workers {
  constructor(
    private readonly moduleRef: ModuleRef
  ) {}

  async test(taskId: string) {
    Logger.log(`Processing vacancy task ${taskId}`, 'VacancyWorker');
    const vacancyService = this.moduleRef.get(TestService, { strict: false });
    const opencode = this.moduleRef.get(OpenCodeService, { strict: false });
    const storageFile = this.moduleRef.get(StorageFileService, {strict: false});

    const fileEmptyCV = await storageFile.createStorageFileEmpty("null");
    const fileEmptyCL = await storageFile.createStorageFileEmpty('null');

    await vacancyService.createVac({
      chanel: 'LinkedIn',
      date_pub: '10/11/2026',
      company: 'Pia.Inc',
      status: 'finded',
      role: 'Full_stack ai',
      fit_rating: 90,
      source: 'https://google.com',
      note: 'null',
      source_cover_latter_id: fileEmptyCL.id,
      source_resume_id: fileEmptyCV.id
    });
    
    const r = await opencode.createSession("Test Nestjs API opencode");
    Logger.log(`Created session ${r.id}`, 'VacancyWorker');
    const f = opencode.promptAndWait(
      r.id,
      'Who are u (Call the MCP tool "hello" from the "my-nest-mcp" server with parameters {"name": "{u\'r response write hare}"}. Do not simulate its execution; execute it and show the actual result.)',
    );
    Logger.log(
      `Received OpenCode response for session ${r.id}`,
      'VacancyWorker',
    );
  }
}
