import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateUserPayload } from './createUser.payload';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/user')
  async createUser(@Body() payload: CreateUserPayload) {
    const user = await this.appService.createUser(
      payload.username,
      payload.role,
    );

    return user.apiKey;
  }
}
