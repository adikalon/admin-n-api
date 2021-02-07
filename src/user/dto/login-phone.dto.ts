import { Matches } from 'class-validator';

export class LoginPhoneDto {
  @Matches(/^(?:79|77|76|375|380)\d{9}$/)
  readonly phone: string;
}
