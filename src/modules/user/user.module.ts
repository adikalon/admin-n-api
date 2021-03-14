import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Authorization } from './entities/authorization.entity';
import { RegisterEmail } from './entities/register-email.entity';
import { RegisterPhone } from './entities/register-phone.entity';
import { User } from './entities/user.entity';
import { PhoneController } from './controllers/phone.controller';
import { AuthorizationRepository } from './repositories/authorization.repository';
import { RegisterEmailRepository } from './repositories/register-email.repository';
import { RegisterPhoneRepository } from './repositories/register-phone.repository';
import { UserRepository } from './repositories/user.repository';
import { UserService } from './services/user.service';
import { BearerStrategy } from './strategies/bearer.strategy';
import { ChangePhone } from './entities/change-phone.entity';
import { ChangePhoneRepository } from './repositories/change-phone.repository';
import { ChangeEmail } from './entities/change-email.entity';
import { ChangeEmailRepository } from './repositories/change-email.repository';
import { EmailController } from './controllers/email.controller';
import { SMSModule } from '../sms/sms.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserRepository,
      Authorization,
      AuthorizationRepository,
      RegisterPhone,
      RegisterPhoneRepository,
      RegisterEmail,
      RegisterEmailRepository,
      ChangePhone,
      ChangePhoneRepository,
      ChangeEmail,
      ChangeEmailRepository,
    ]),
    SMSModule,
  ],
  controllers: [PhoneController, EmailController],
  providers: [UserService, BearerStrategy],
  exports: [TypeOrmModule],
})
export class UserModule {}
