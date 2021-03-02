import { IsDate } from 'class-validator';

export class PhoneSendCodeLoginDto {
  @IsDate()
  readonly repeat: Date;
}
