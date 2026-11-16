import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyResearchEntity } from './cr.entity.js';
import { CompanyResearchService } from './cr.service.js';
import { CompanyResearchController } from './cr.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyResearchEntity])],
  controllers: [CompanyResearchController],
  providers: [CompanyResearchService],
  exports: [CompanyResearchService],
})
export class CompanyResearchModule {}
