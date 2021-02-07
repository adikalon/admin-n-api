import { Body, Controller, Post } from '@nestjs/common';
import { LoginPhoneDto } from './dto/login-phone.dto';
import { UserService } from './services/user.service';

@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('login/phone')
  loginPhone(@Body() form: LoginPhoneDto): any {
    return form;
  }
}
