import {
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';
import string from '../strings/exception';

@Catch()
export class DefaultExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger('Error');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    let status = 520;
    let title = string.unknown;
    const url = request.url;
    const headers = JSON.stringify(request.headers, null, 2);
    const body = JSON.stringify(request.body, null, 2);
    let data: any;
    let error = '';
    let stack = '';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      title = exception.message;
      stack = exception.stack.replace(/ {4}/g, '  ');
      let res = exception.getResponse();
      data = res;

      if (typeof res === 'object') {
        res = JSON.stringify(res, null, 2);
      }

      error = res;
    } else if (exception instanceof QueryFailedError) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      title = exception.name;
      stack = exception.stack.replace(/ {4}/g, '  ');
      data = exception;
      error = JSON.stringify(exception, null, 2);
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      title = exception.name;
      stack = exception.stack.replace(/ {4}/g, '  ');
      let res = exception.message;
      data = res;

      if (typeof res === 'object') {
        res = JSON.stringify(res, null, 2);
      }

      error = res;
    } else {
      data = exception;
      error = JSON.stringify(exception, null, 2);
    }

    const message = `${title} [${status}]\n\n[URL]:\n${url}\n\n[HEADERS]:\n${headers}\n\n[BODY]:\n${body}\n\n[ERROR]:\n${error}\n\n[STACK]:\n${stack}\n\n`;

    this.logger.error(message);

    response.status(status).json({
      succsess: false,
      message: title,
      data: process.env.NODE_ENV === 'development' ? data : null,
    });
  }
}
