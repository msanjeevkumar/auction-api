import { Module } from '@nestjs/common';
import { configProvider } from './config/config.provider';

@Module({
  providers: [configProvider],
  exports: [configProvider],
})
export class CommonModule {}
