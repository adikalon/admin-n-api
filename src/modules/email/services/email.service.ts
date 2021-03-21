import { HttpService } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { EmailAbstract } from './email.abstract';
import { SendPulse } from './sendpulse.service';

@Injectable()
export class EmailService {
  private readonly service: EmailAbstract;

  constructor(private readonly httpService: HttpService) {
    switch (process.env.EMAIL_SERVICE) {
      case 'sendpulse':
        this.service = new SendPulse(httpService);
        break;
    }
  }

  getService(): EmailAbstract {
    return this.service;
  }
}
