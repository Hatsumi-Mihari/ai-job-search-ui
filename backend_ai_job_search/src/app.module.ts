import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { 
  VacModule, TelemetryModule, ContactsModule, StorageFilesModule, UserDataModule, QueueModule 
} from '@/entities/index.js'
import { TaskOrchestratorModule } from '@/common/services/task_orchestrator/task_orchestrator.module.js'
<<<<<<< HEAD
import { CompanyResearchModule } from './entities/company_research/cr.module.js'
=======
import { WorkersModule } from './common/workers/worker.module.js';
import { CompanyResearchModule } from './entities/company_research/cr.module.js';
>>>>>>> feature/task-orchestrator


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (config: ConfigService) => {
        Logger.log('Connect DB', 'TypeOrmModule_Init');
        return {
          type: 'postgres',
          host: config.get<string>('DB_HOST'),
          port: config.get<number>('DB_PORT', 5432),
          username: config.get<string>('DB_USER'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_NAME'),
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      maxListeners: 20,
      verboseMemoryLeak: true,
    }),
    VacModule,
    TelemetryModule,
    ContactsModule,
    StorageFilesModule,
    UserDataModule,
    QueueModule,
    TaskOrchestratorModule,
<<<<<<< HEAD
    CompanyResearchModule,
=======
    WorkersModule,
    CompanyResearchModule
>>>>>>> feature/task-orchestrator
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
