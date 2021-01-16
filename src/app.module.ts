import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from '@admin-bro/nestjs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    /**
     * Config
     */
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'debug'),
        PG_USER: Joi.string().required(),
        PG_PASSWORD: Joi.string().required(),
        PG_BASENAME: Joi.string().required(),
        CLI_POSTGRES_PORT: Joi.number().required(),
        CLI_POSTGRES_HOST: Joi.string().required(),
      }),
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
        synchronize: false,
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
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

    /**
     * Custom modules
     */
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
