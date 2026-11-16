import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';

/**
 * Converts the client's request body into a JSON object before it reaches any
 * `@Body()` parameter or validation pipe.
 *
 * Express already parses `application/json` requests, but a client may also
 * send the payload as a raw JSON string (double-encoded JSON, a Buffer, ...).
 * In that case the body is parsed here so every endpoint always validates a
 * JSON object. Malformed payloads are rejected with a 400.
 *
 * This is the shared version of the interceptor first introduced in the
 * vacancies controller, so queue (and future) modules can reuse it without
 * importing from another entity module.
 */
@Injectable()
export class JsonBodyInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    try {
      const request = context.switchToHttp().getRequest<{ body?: unknown }>();
      request.body = JsonBodyInterceptor.toJsonObject(request.body);

      return next.handle();
    } catch (error) {
      // Surface parsing errors through the Nest exception filters (HTTP 400).
      return throwError(() => error);
    }
  }

  private static toJsonObject(body: unknown): Record<string, unknown> {
    if (body === undefined || body === null) {
      return {};
    }

    let value: unknown = body;

    if (typeof value === 'string') {
      value = JsonBodyInterceptor.parseJson(value);
    } else if (Buffer.isBuffer(value)) {
      value = JsonBodyInterceptor.parseJson(value.toString('utf8'));
    }

    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw new BadRequestException('Request body must be a JSON object');
    }

    return value as Record<string, unknown>;
  }

  private static parseJson(raw: string): unknown {
    const trimmed = raw.trim();

    // An empty body is treated as "no fields provided".
    if (trimmed.length === 0) {
      return {};
    }

    try {
      return JSON.parse(trimmed);
    } catch {
      throw new BadRequestException('Request body must be valid JSON');
    }
  }
}
