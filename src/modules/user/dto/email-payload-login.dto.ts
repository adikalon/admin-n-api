import { IsEmail } from 'class-validator';

export class EmailPayloadLoginDto {
  @IsEmail()
  readonly email: string;
}
