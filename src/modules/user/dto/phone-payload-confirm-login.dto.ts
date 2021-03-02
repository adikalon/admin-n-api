import { IsString } from 'class-validator';

export class PhonePayloadConfirmLoginDto {
  @IsString()
  readonly code: string;
}
