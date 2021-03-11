import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [CommonModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
