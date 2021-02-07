import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { LoginPhoneDto } from './dto/login-phone.dto';
import { UserService } from './services/user.service';
import { SuccessInterceptor } from '../common/interceptors/success.interceptor';

@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('login/phone')
  @UseInterceptors(SuccessInterceptor)
  async loginPhone(@Body() form: LoginPhoneDto): Promise<void> {
    return;
  }
}
