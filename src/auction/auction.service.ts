import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateAuctionPayload } from './createAuction.payload';
import { Repository } from 'typeorm';
import { Auction } from '../database/entities/auction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { Bid } from '../database/entities/bid.entity';
import { AuctionStatus } from './auctionStatus.enum';

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

  async placeOrUpdateBid(
    auctionId: number,
    amount: number,
    user: User,
    shouldUpdateBid = false,
  ) {
    const auction = await this.validateAuctionId(auctionId);
    this.validateBidAmount(amount, auction);
    const bid = await this.validateBid(auction, user, shouldUpdateBid);

    if (!shouldUpdateBid) {
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
      return;
    }

    bid.amount = amount;
    await this.bidRepository.save(bid);
    return;
  }

  private validateBidAmount(amount: number, auction: Auction) {
    if (amount < auction.minimumBid || amount > auction.highestBid) {
      throw new ForbiddenException(
        `Amount should be greater than or equal to ${auction.minimumBid} and less than or equal to ${auction.highestBid} `,
      );
    }
  }

  private async validateAuctionId(auctionId: number) {
    const auction = await this.auctionRepository.findOne({
      id: auctionId,
      status: AuctionStatus.OPEN,
    });
    if (!auction) {
      throw new ForbiddenException(
        `Open Auction with id ${auctionId} does not exist`,
      );
    }
    return auction;
  }

  async withdrawBid(auctionId: number, user: User) {
    const auction = await this.validateAuctionId(auctionId);
    const bid = await this.validateBid(auction, user);
    bid.isDeleted = true;
    await this.bidRepository.save(bid);
  }

  private async validateBid(
    auction: Auction,
    user: User,
    throwErrorIfNotExists = true,
  ) {
    const bid = await this.bidRepository.findOne({
      where: {
        auction,
        buyer: user,
        isDeleted: false,
      },
    });

    if (!bid && throwErrorIfNotExists) {
      throw new ForbiddenException(
        'No bid has been placed to update, please use place bid API',
      );
    }

    return bid;
  }

  async closeAuction(auctionId: number) {
    const auction = await this.validateAuctionId(auctionId);
    const bids: {
      amount: number;
    }[] = await this.bidRepository.manager.query(
      `select amount from bid where "auctionId" = $1 and "isDeleted" = false group by amount having count(amount) = 1 order by amount desc limit 1`,
      [auctionId],
    );

    const [
      { numOfBids },
    ] = await this.bidRepository.manager.query(
      `select count(id) as "numOfBids" from bid where "auctionId" = $1 and "isDeleted" = false`,
      [auctionId],
    );

    if (bids.length === 0) {
      if (parseInt(numOfBids, 10) === 0) {
        throw new ForbiddenException(
          'Cannot close auction, no bids have been placed yet',
        );
      } else {
        throw new ForbiddenException(
          'Unable to determine winning bid due to no unique bids placed',
        );
      }
    }

    const [{ amount }] = bids;
    const bid = await this.bidRepository.findOne({
      where: { amount, auction },
    });
    const platformCharge = 0.05 * amount;
    auction.winner = bid.buyer;
    auction.platformCharge = platformCharge;
    auction.sellerWinnings = amount - platformCharge;
    auction.status = AuctionStatus.CLOSED;
    await this.auctionRepository.save(auction);
    return bid;
  }

  getAuctionDetails(auctionId: number) {
    return this.auctionRepository.findOne(auctionId);
  }
}
