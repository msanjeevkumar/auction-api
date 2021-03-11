import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from '../common/enums/token';
import { Config } from '../common/config/config';
import { User } from './entities/user.entity';
import * as path from 'path';
import { Auction } from './entities/auction.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [Token.CONFIG],
      useFactory: (config: Config) => {
        const migrationsPath = `${path.resolve(__dirname, 'migration')}/*`;
        return {
          type: 'postgres',
          logging: 'all',
          url: config.dbConnectionString,
          synchronize: false,
          migrations: [migrationsPath],
          migrationsRun: true,
          entities: [User, Auction],
        };
      },
    }),
  ],
})
export class DatabaseModule {}
