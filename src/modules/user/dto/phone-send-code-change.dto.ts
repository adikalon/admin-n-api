import { IsDate } from 'class-validator';

export class PhoneSendCodeChangeDto {
  @IsDate()
  readonly repeat: Date;
}
