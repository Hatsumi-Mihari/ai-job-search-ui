import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserDataEntity } from './ud.entity.js';
import { UserDataService } from './ud.service.js';
import { UserDataController } from './ud.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([UserDataEntity])],
  controllers: [UserDataController],
  providers: [UserDataService],
  exports: [UserDataService],
})
export class UserDataModule {}
