import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from '@admin-bro/nestjs';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    /**
     * TypeORM
     */
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'postgres',
      port: 5432,
      username: 'dev',
      password: 'dev',
      database: 'admin-n-api',
      entities: [],
      synchronize: true,
    }),

    /**
     * AdminBro
     */
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
