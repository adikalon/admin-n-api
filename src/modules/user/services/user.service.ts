import { Injectable } from '@nestjs/common';
import phoneConfig from '../config/phone';

@Injectable()
export class UserService {
  async phoneAuthGenerateCode(): Promise<string> {
    const max = phoneConfig.confirmCodeLengthMax;
    const min = phoneConfig.confirmCodeLengthMin;

    const code = Math.floor(Math.random() * (max - min + 1)) + min;

    return code.toString();
  }

  async phoneAuthGenerateToken(): Promise<string> {
    let result = '';

    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < phoneConfig.authTokenLength; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
  }
}
