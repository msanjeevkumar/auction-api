import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateAuctionPayload } from './createAuction.payload';
import { Repository } from 'typeorm';
import { Auction } from '../database/entities/auction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { Bid } from '../database/entities/bid.entity';

@Injectable()
export class AuctionService {
  constructor(
    @InjectRepository(Auction)
    private readonly auctionRepository: Repository<Auction>,
    @InjectRepository(Bid)
    private readonly bidRepository: Repository<Bid>,
  ) {}

  async createAuction(payload: CreateAuctionPayload, user: User) {
    const [{ seller, ...auction }] = await this.auctionRepository.save([
      {
        name: payload.name,
        description: payload.description,
        minimumBid: payload.minimumBid,
        highestBid: payload.highestBid,
        seller: user,
      },
    ]);

    return auction;
  }

  async placeBid(auctionId: number, amount: number, user: User) {
    const auction = await this.auctionRepository.findOne({
      id: auctionId,
    });
    if (!auction) {
      throw new ForbiddenException(
        `Auction with id ${auctionId} does not exist`,
      );
    }

    if (amount < auction.minimumBid || amount > auction.highestBid) {
      throw new ForbiddenException(
        `Amount should be greater than or equal to ${auction.minimumBid} and less than or equal to ${auction.highestBid} `,
      );
    }

    const bid = await this.bidRepository.findOne({
      where: {
        auction,
        buyer: user,
      },
    });

    if (bid) {
      throw new ForbiddenException(
        'Bid already exists for the given auction, please use update bid API',
      );
    }

    await this.bidRepository.save([
      {
        amount,
        auction,
        buyer: user,
      },
    ]);
  }
}
