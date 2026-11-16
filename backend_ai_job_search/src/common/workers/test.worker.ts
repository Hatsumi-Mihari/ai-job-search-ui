import { ModuleRef } from '@nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { TestService } from '@/entities/vacances/vac.service.js';

@Injectable()
export class Workers {
  constructor(private readonly moduleRef: ModuleRef) {}

  async test(taskId: string) {
    Logger.log(`Processing vacancy task ${taskId}`, 'VacancyWorker');
    const vacancyService = this.moduleRef.get(TestService, { strict: false });
    await vacancyService.createVac({
      chanel: 'LinkedIn',
      date_pub: '10/11/2026',
      company: 'Pia.Inc',
      status: 'finded',
      role: 'Full_stack ai',
      fit_rating: 90,
      source: 'https://google.com',
      note: 'null',
    });
  }
}
