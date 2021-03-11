import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { Config } from './common/config/config';
import { Token } from './common/enums/token';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  const config = app.get<Config>(Token.CONFIG);
  await app.listen(config.apiPort);
}
bootstrap();
