import { IsDate } from 'class-validator';

export class PhoneSendCodeDto {
  @IsDate()
  readonly repeat: Date;
}
