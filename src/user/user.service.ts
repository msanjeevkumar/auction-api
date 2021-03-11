import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { Repository } from 'typeorm';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async createUser(username: string, role: Role) {
    const [user] = await this.userRepository.save([{ username, role }]);
    return user;
  }

  async findUser(apiKey: string) {
    return await this.userRepository.findOne({ where: { apiKey } });
  }
}
