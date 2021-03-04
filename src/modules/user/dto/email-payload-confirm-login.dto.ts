import { IsString } from 'class-validator';

export class EmailPayloadConfirmLoginDto {
  @IsString()
  readonly code: string;
}
