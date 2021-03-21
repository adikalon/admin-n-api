import { HttpService } from '@nestjs/common';
import { EmailAbstract } from './email.abstract';
import * as sendpulse from 'sendpulse-api';
import * as path from 'path';

export enum Book {
  login,
  change,
}

interface Data {
  book: Book;
  variables: { [key: string]: string };
}

export class SendPulse implements EmailAbstract {
  constructor(private readonly httpService: HttpService) {}

  async send(email: string, data: Data) {
    const temp = path.join(__dirname, '..', '..', '..', '..', 'temp');
    let book: string;

    switch (data.book) {
      case Book.login:
        book = process.env.EMAIL_SP_BOOK_LOGIN;
        break;
      case Book.change:
        book = process.env.EMAIL_SP_BOOK_CHANGE;
        break;
    }

    const sp: any = await new Promise((resolve) => {
      sendpulse.init(
        process.env.EMAIL_SP_USER_ID,
        process.env.EMAIL_SP_SECRET,
        temp,
        () => {
          sendpulse.addEmails(
            (data) => {
              resolve(data);
            },
            book,
            [{ email, variables: data.variables }],
          );
        },
      );
    });

    if (sp?.result !== true) {
      throw new Error(JSON.stringify(sp, null, 2));
    }
  }
}
