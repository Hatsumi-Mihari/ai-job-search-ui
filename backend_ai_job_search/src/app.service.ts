import { Injectable, Logger } from '@nestjs/common';
import { Measure } from './common/global/logger/logger.decorator.js';

@Injectable()
export class AppService {
  constructor() {}

  @Measure('AppService')
  getHello(): string {
    Logger.log("Get /", AppService.name);
    return 'Hello World!';
  }
}
