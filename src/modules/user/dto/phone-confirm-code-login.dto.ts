import { IsObject } from 'class-validator';
import { Authorization } from '../entities/authorization.entity';

export class PhoneConfirmCodeLoginDto {
  @IsObject()
  readonly authorization: Authorization;
}
