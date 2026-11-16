import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageFileEntity } from './sf.entity.js';
import { StorageFileService } from './sf.service.js';
import { StorageFileController } from './sf.controller.js';
import { StorageService } from '@/common/services/index.js';

@Module({
  imports: [TypeOrmModule.forFeature([StorageFileEntity])],
  controllers: [StorageFileController],
  providers: [StorageFileService, StorageService],
  exports: [StorageFileService, StorageService],
})
export class StorageFilesModule {}
