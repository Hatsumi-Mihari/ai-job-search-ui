import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelemetryEntity } from './tel.entity.js'
import { TelSetupService } from './tel_setup.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature(
        [TelemetryEntity]
    ),
  ],
  controllers: [],
  providers: [TelSetupService],
  exports: [TelSetupService],
})
export class TelemetryModule {}