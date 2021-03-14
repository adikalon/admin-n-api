import { HttpModule, Module } from '@nestjs/common';
import { SMSService } from './services/sms.service';
import configSMS from './config/sms';

@Module({
  imports: [HttpModule.register({ timeout: configSMS.timeout })],
  providers: [SMSService],
  exports: [SMSService],
})
export class SMSModule {}
