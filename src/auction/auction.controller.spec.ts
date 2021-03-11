import { Test, TestingModule } from '@nestjs/testing';
import { AuctionController } from './auction.controller';
import { UserController } from '../user/user.controller';
import { Role } from '../common/enums/role.enum';
import { AuctionService } from './auction.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction } from '../database/entities/auction.entity';
import { Bid } from '../database/entities/bid.entity';
import { DatabaseModule } from '../database/database.module';
import { UserModule } from '../user/user.module';
import { Token } from '../common/enums/token';
import { CommonModule } from '../common/common.module';

describe('AuctionController', () => {
  let controller: AuctionController;
  let userController: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuctionController, UserController],
      providers: [AuctionService],
      imports: [
        CommonModule,
        DatabaseModule,
        UserModule,
        TypeOrmModule.forFeature([Auction, Bid]),
      ],
    }).compile();

    controller = module.get<AuctionController>(AuctionController);
    userController = module.get<UserController>(UserController);
  });

  it('should be defined', async () => {
    const user = await userController.createUser({
      username: 'sanjeev',
      role: Role.SELLER,
    });

    const auction = await controller.createAuction(
      {
        minimumBid: 3000,
        description: 'sample description1',
        name: 'sample auction 1',
        highestBid: 4000,
      },
      user,
    );
    expect(auction).toBeDefined();
  });
});
