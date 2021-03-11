import { Injectable } from '@nestjs/common';
import { Role } from '../common/enums/role.enum';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async createUser(username: string, role: Role) {
    const [user] = await this.userRepository.save([{ username, role }]);
    return user;
  }
}
