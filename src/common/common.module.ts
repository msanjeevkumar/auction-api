import { Global, Module } from '@nestjs/common';
import { configProvider } from './config/config.provider';

@Global()
@Module({
  providers: [configProvider],
  exports: [configProvider],
})
export class CommonModule {}
