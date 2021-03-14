import { HttpService } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { SMSRu } from './sms-ru.service';
import { SMSAbstract } from './sms.abstract';

@Injectable()
export class SMSService {
  private readonly service: SMSAbstract;

  constructor(private readonly httpService: HttpService) {
    switch (process.env.SMS_SERVICE) {
      case 'sms.ru':
        this.service = new SMSRu(httpService);
        break;
    }
  }

  getService(): SMSAbstract {
    return this.service;
  }
}
