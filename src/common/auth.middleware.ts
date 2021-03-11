import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction } from 'express';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const apiKey: string = req.headers['x-api-key'];
    if (!apiKey) {
      throw new UnauthorizedException();
    } else {
      const user = await this.userService.findUser(apiKey);
      if (!user) {
        throw new UnauthorizedException();
      }

      (req as any).user = user;
      next();
    }
  }
}
