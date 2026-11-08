import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VacancyEntity } from './vac.entity.js'; 
import { TestService } from './vac.service.js';
import { VacController } from './vac.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature(
        [VacancyEntity]
    ),
  ],
  controllers: [VacController],
  providers: [TestService],
  exports: [TestService],
})
export class VacModule {}