import { IsObject } from 'class-validator';
import { Authorization } from '../entities/authorization.entity';

export class PhoneConfirmCodeDto {
  @IsObject()
  readonly authorization: Authorization;
}
