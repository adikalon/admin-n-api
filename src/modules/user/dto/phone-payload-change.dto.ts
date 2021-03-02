import { Transform } from 'class-transformer';
import { Matches } from 'class-validator';

export class PhonePayloadChangeDto {
  @Transform((phone) => String(phone.value))
  @Matches(/^(?:79|77|76|375|380)\d{9}$/)
  readonly phone: number;
}
