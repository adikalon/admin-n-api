import { IsBoolean, IsObject, IsString } from 'class-validator';

export class ApiResDefaultDto<T> {
  @IsBoolean()
  readonly success: boolean;

  @IsString()
  readonly message: string;

  @IsObject()
  readonly data: T;
}
