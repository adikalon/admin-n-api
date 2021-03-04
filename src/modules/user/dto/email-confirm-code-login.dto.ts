import { IsObject } from 'class-validator';
import { Authorization } from '../entities/authorization.entity';

export class EmailConfirmCodeLoginDto {
  @IsObject()
  readonly authorization: Authorization;
}
