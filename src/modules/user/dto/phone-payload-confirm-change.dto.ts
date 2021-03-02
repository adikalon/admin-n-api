import { IsString } from 'class-validator';

export class PhonePayloadConfirmChangeDto {
  @IsString()
  readonly code: string;
}
