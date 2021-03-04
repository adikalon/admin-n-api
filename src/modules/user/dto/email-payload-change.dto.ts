import { IsEmail } from 'class-validator';

export class EmailPayloadChangeDto {
  @IsEmail()
  readonly email: string;
}
