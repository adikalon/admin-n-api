import { IsString } from 'class-validator';

export class EmailPayloadConfirmChangeDto {
  @IsString()
  readonly code: string;
}
