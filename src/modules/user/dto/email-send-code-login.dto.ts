import { IsDate } from 'class-validator';

export class EmailSendCodeLoginDto {
  @IsDate()
  readonly repeat: Date;
}
