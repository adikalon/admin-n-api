import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from '@admin-bro/nestjs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { UserModule } from './modules/user/user.module';
import { User } from './modules/user/entities/user.entity';
import AdminBro from 'admin-bro';
import { Database, Resource } from '@admin-bro/typeorm';
import { Authorization } from './modules/user/entities/authorization.entity';
import { RegisterPhone } from './modules/user/entities/register-phone.entity';
import { RegisterEmail } from './modules/user/entities/register-email.entity';
import { validate } from './env.validation';

AdminBro.registerAdapter({ Database, Resource });

@Module({
  imports: [
    /**
     * Config
     */
    ConfigModule.forRoot({
      validate: validate,
      expandVariables: true,
      isGlobal: true,
    }),

    /**
     * TypeORM
     */
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        port: 5432,
        host: 'postgres',
        username: configService.get('PG_USER'),
        password: configService.get('PG_PASSWORD'),
        database: configService.get('PG_BASENAME'),
        synchronize: true,
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),

    /**
     * AdminBro
     */
    // AdminModule.createAdmin({
    //   adminBroOptions: {
    //     rootPath: '/admin',
    //     resources: [User, Authorization, RegisterPhone, RegisterEmail],
    //   },
    // }),

    /**
     * Custom modules
     */
    UserModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
