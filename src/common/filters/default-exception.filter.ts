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

    if (exception instanceof HttpException) {
      let res = exception.getResponse();

      if (typeof res === 'object') {
        res = JSON.stringify(res, null, 2);
      }

      error = `${exception.message} [${exception.getStatus()}]\n${res}\n\n${
        exception.stack
      }`;
    } else if (exception instanceof Error) {
      let res = exception.message;

      if (typeof res === 'object') {
        res = JSON.stringify(res, null, 2);
      }

      error = `${exception.name}\n${res}\n\n${exception.stack}`;
    }

    this.logger.error(error);

    response.status(HttpStatus.OK).json({
      succsess: false,
      error: string.hidden,
    });
  }
}
