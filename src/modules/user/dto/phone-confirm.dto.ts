import { IsString } from 'class-validator';

export class PhoneConfirmDto {
  @IsString()
  readonly code: string;
}
