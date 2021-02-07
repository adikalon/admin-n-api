import {
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';
import string from '../strings/exception';

@Catch()
export class DefaultExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger('Error');

  catch(exception: Error | HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let error = string.unknown;
    let status = 520;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      let res = exception.getResponse();

      if (typeof res === 'object') {
        res = JSON.stringify(res, null, 2);
      }

      error = `${exception.message} [${exception.getStatus()}]\n${res}\n\n${
        exception.stack
      }`;
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      let res = exception.message;

      if (typeof res === 'object') {
        res = JSON.stringify(res, null, 2);
      }

      error = `${exception.name}\n${res}\n\n${exception.stack}`;
    }

    this.logger.error(error);

    response.status(status).json({
      succsess: false,
      error: string.hidden,
    });
  }
}
