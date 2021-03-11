import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CreateAuctionPayload } from './createAuction.payload';
import { AuctionService } from './auction.service';
import { Roles } from '../common/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { RolesGuard } from '../common/roles.guard';
import { User as UserEntity } from '../database/entities/user.entity';
import { User } from '../common/user.decorator';
import { AuctionParams } from './auctionParams';
import { PlaceOrUpdateBidBody } from './placeOrUpdateBidBody';

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
    @Param() params: AuctionParams,
    @Body() body: PlaceOrUpdateBidBody,
    @User() user: UserEntity,
  ) {
    await this.auctionService.placeOrUpdateBid(
      parseInt(params.auctionId, 10),
      parseInt(body.amount, 10),
      user,
    );
  }

  @Put(':auctionId/bid')
  @Roles(Role.BUYER)
  async updateBid(
    @Param() params: AuctionParams,
    @Body() body: PlaceOrUpdateBidBody,
    @User() user: UserEntity,
  ) {
    await this.auctionService.placeOrUpdateBid(
      parseInt(params.auctionId, 10),
      parseInt(body.amount, 10),
      user,
      true,
    );
  }

  @Delete(':auctionId/bid')
  @Roles(Role.BUYER)
  async withdrawBid(@Param() params: AuctionParams, @User() user: UserEntity) {
    await this.auctionService.withdrawBid(parseInt(params.auctionId), user);
  }

  @Post(':auctionId/close')
  @Roles(Role.SELLER)
  async closeAuction(@Param() params: AuctionParams) {
    return this.auctionService.closeAuction(parseInt(params.auctionId));
  }

  @Post(':auctionId/statement')
  @Roles(Role.SELLER)
  async getAuctionDetails(@Param() params: AuctionParams) {
    return this.auctionService.getAuctionDetails(parseInt(params.auctionId));
  }
}
