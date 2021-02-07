import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import string from '../strings/exception';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    let res = exception.getResponse();

    if (typeof res === 'object') {
      res = JSON.stringify(res, null, 2);
    }

    const error = `${exception.message} [${exception.getStatus()}]\n${res}\n\n${
      exception.stack
    }`;

    this.logger.error(error);

    response.status(status).json({
      succsess: false,
      error: string.unknown,
    });
  }
}
