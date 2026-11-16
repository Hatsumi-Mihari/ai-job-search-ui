import { Logger } from '@nestjs/common';

/**
    * Decorator for measuring function execution time.
    * @param context - Context name (usually the name of a service or class)
*/
export function Measure(context = 'Performance') {
  const logger = new Logger(context);

  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const start = performance.now();
      
      try {
        const result = await originalMethod.apply(this, args);
        
        const duration = (performance.now() - start).toFixed(2);
        logger.log(`[${propertyKey}] ${duration}ms`);
        
        return result;
      } catch (error) {
        const duration = (performance.now() - start).toFixed(2);
        logger.error(`[${propertyKey}] ${duration}ms`);
        throw error;
      }
    };

    return descriptor;
  };
}