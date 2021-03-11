import { Injectable } from '@nestjs/common';
import { CreateAuctionPayload } from './createAuction.payload';
import { Repository } from 'typeorm';
import { Auction } from '../database/entities/auction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';

@Injectable()
export class AuctionService {
  constructor(
    @InjectRepository(Auction)
    private readonly auctionRepository: Repository<Auction>,
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
}
