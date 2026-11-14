import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobEntity } from './queue.entity.js';
import { QueueController } from './queue.controller.js';
import { QueueService } from './queue.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([JobEntity])],
  controllers: [QueueController],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
