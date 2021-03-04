import { IsObject } from 'class-validator';
import { User } from '../entities/user.entity';

export class EmailConfirmCodeChangeDto {
  @IsObject()
  readonly user: User;
}
