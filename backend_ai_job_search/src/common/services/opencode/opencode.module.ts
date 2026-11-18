import { Module } from '@nestjs/common';
import { OpenCodeService } from './opencode.service.js';

@Module({
  controllers: [],
  providers: [OpenCodeService],
  exports: [OpenCodeService],
})
export class OpenCodeModule {}
