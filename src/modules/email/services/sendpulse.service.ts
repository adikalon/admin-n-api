import { HttpService } from '@nestjs/common';
import { EmailAbstract } from './email.abstract';

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
    console.log(`Email: ${email}, Data: ${data}`);
  }
}
