import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let errorMessage: any = 'Internal server error';

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();
            errorMessage = typeof res === 'object' && res !== null ? (res as any).message : res;
        }
        else if (
            exception instanceof SyntaxError &&
            'body' in exception &&
            (exception as any).status === 400
        ) {
            status = HttpStatus.BAD_REQUEST;
            errorMessage = 'Invalid JSON (syntax error)';
        }
        else if (exception instanceof Error) {
            errorMessage = exception.message;
        }

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            error: errorMessage,
        });
    }

}