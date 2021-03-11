import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserPayload } from '../app/createUser.payload';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() payload: CreateUserPayload) {
    const user = await this.userService.createUser(
      payload.username,
      payload.role,
    );

    return user;
  }
}
