import { Injectable } from '@nestjs/common';
import userConfig from '../config/user';

@Injectable()
export class UserService {
  async generatePhoneCode(min: number, max: number): Promise<string> {
    const code = Math.floor(Math.random() * (max - min + 1)) + min;

    return code.toString();
  }

  async generateAuthToken(): Promise<string> {
    let result = '';

    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < userConfig.authTokenLength; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
  }
}
