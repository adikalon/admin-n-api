import { HttpService } from '@nestjs/common';
import { SMSAbstract } from './sms.abstract';

export class SMSRu implements SMSAbstract {
  constructor(private readonly httpService: HttpService) {}

  async send(phone: number, message: string) {
    const url = `https://sms.ru/sms/send?api_id=${
      process.env.SMS_API
    }&to=${phone}&msg=${encodeURI(message)}&json=1`;

    const resp = await this.httpService.get(url).toPromise();

    if (resp.data?.status_code !== 100) {
      throw new Error(JSON.stringify(resp.data, null, 2));
    }
  }
}
