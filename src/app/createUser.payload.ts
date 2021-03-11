import { Role } from '../common/enums/role.enum';
import { IsIn, MinLength } from 'class-validator';

export class CreateUserPayload {
  @MinLength(6)
  username: string;

  @IsIn([Role.SELLER, Role.BUYER])
  role: Role;
}
