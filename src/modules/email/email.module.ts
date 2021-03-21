import { HttpModule, Module } from '@nestjs/common';
import configEmail from './config/email';
import { EmailService } from './services/email.service';

@Module({
  imports: [HttpModule.register({ timeout: configEmail.timeout })],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
