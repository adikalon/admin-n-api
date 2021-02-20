import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { RegisterPhoneRepository } from '../repositories/register-phone.repository';
import { User } from '../entities/user.entity';
import phoneConfig from '../config/phone';
import { RegisterPhone } from '../entities/register-phone.entity';
import { InsertResult } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly registerPhoneRepository: RegisterPhoneRepository,
  ) {}

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
