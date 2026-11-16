import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactEntity } from './con.entity.js';
import { ContactService } from './con.service.js';
import { ContactController } from './con.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature(
        [ContactEntity]
    ),
  ],
  controllers: [ContactController],
  providers: [ContactService],
  exports: [ContactService],
})
export class ContactsModule { }
