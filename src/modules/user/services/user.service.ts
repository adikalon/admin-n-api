import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  async generateCodePhone(min: number, max: number): Promise<string> {
    const code = Math.floor(Math.random() * (max - min + 1)) + min;

    return code.toString();
  }

  async generateCodeEmail(length: number): Promise<string> {
    let result = '';

    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
  }

  async generateAuthToken(length: number): Promise<string> {
    let result = '';

    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
  }
}
