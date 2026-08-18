import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Normalizes every error to `{ message: string }`, which is the exact shape
 * `src/services/api.ts` on the frontend already knows how to read
 * (`getErrorMessage`). Unexpected (non-HttpException) errors are logged with
 * full detail server-side but never leak internals to the client.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const isHttp = exception instanceof HttpException;
    const status = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    if (!isHttp) {
      this.logger.error(
        exception instanceof Error ? exception.stack : exception,
      );
    }

    response
      .status(status)
      .json({ message: this.extractMessage(exception, isHttp) });
  }

  private extractMessage(exception: unknown, isHttp: boolean): string {
    if (!isHttp) return 'Erro interno do servidor.';

    const body = (exception as HttpException).getResponse();
    if (typeof body === 'string') return body;
    if (body && typeof body === 'object' && 'message' in body) {
      const message = body.message;
      return Array.isArray(message) ? message.join(' ') : String(message);
    }
    return 'Erro na requisição.';
  }
}
