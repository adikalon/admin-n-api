import { IsObject } from 'class-validator';
import { User } from '../entities/user.entity';

export class PhoneConfirmCodeChangeDto {
  @IsObject()
  readonly user: User;
}
