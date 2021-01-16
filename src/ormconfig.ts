import { ConnectionOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();

const config: ConnectionOptions = {
  type: 'postgres',
  port: configService.get('CLI_POSTGRES_PORT'),
  host: configService.get('CLI_POSTGRES_HOST'),
  username: configService.get('PG_USER'),
  password: configService.get('PG_PASSWORD'),
  database: configService.get('PG_BASENAME'),
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: false,
  migrationsRun: false,

  migrations: [__dirname + '/db/migrations/**/*{.ts,.js}'],
  cli: {
    migrationsDir: 'src/db/migrations',
  },
};

export = config;
