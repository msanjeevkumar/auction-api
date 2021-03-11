import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { CreateAuctionPayload } from './createAuction.payload';
import { AuctionService } from './auction.service';
import { Roles } from '../common/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { RolesGuard } from '../common/roles.guard';
import { User as UserEntity } from '../database/entities/user.entity';
import { User } from '../common/user.decorator';
import { PlaceBidParams } from './placeBidParams';
import { PlaceBidBody } from './placeBidBody';

@UseGuards(RolesGuard)
@Controller('auction')
export class AuctionController {
  constructor(private readonly auctionService: AuctionService) {}

  @Post()
  @Roles(Role.SELLER)
  async createAuction(
    @Body() payload: CreateAuctionPayload,
    @User() user: UserEntity,
  ) {
    return await this.auctionService.createAuction(payload, user);
  }

  @Post(':auctionId/bid')
  @Roles(Role.BUYER)
  async placeBid(
    @Param() params: PlaceBidParams,
    @Body() body: PlaceBidBody,
    @User() user: UserEntity,
  ) {
    await this.auctionService.placeBid(
      parseInt(params.auctionId, 10),
      parseInt(body.amount, 10),
      user,
    );
  }
}
