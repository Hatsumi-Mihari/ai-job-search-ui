import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeenJobEntity } from './sj.entity.js';
import { SeenJobsService } from './sj.service.js';
import { SeenJobsController } from './sj.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([SeenJobEntity])],
  controllers: [SeenJobsController],
  providers: [SeenJobsService],
  exports: [SeenJobsService],
})
export class SeenJobsModule {}
