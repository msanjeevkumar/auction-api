import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AuctionService } from './auction.service';
import { AuctionController } from './auction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction } from '../database/entities/auction.entity';
import { AuthMiddleware } from '../common/auth.middleware';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { User } from '../database/entities/user.entity';
import { Bid } from '../database/entities/bid.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Auction, User, Bid]), UserModule],
  providers: [AuctionService, UserService],
  controllers: [AuctionController],
})
export class AuctionModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(AuctionController);
  }
}
