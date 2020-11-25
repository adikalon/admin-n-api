import { Module } from '@nestjs/common';
import { AdminModule } from '@admin-bro/nestjs';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    AdminModule.createAdmin({
      adminBroOptions: {
        rootPath: '/admin',
        resources: [],
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
