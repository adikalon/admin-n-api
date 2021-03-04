import { IsDate } from 'class-validator';

export class EmailSendCodeChangeDto {
  @IsDate()
  readonly repeat: Date;
}
