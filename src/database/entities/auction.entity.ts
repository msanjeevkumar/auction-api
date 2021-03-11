import { Column, Entity, ManyToOne, OneToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { AuctionStatus } from '../../auction/auctionStatus.enum';
import { Bid } from './bid.entity';

@Entity()
export class Auction extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column()
  description: string;

  @Column()
  minimumBid: number;

  @Column()
  highestBid: number;

  @Column('character varying', { default: AuctionStatus.OPEN })
  status: AuctionStatus;

  @ManyToOne(() => User)
  seller: User;

  @ManyToOne(() => User, { nullable: true })
  winner: User;

  @Column({ nullable: true })
  platformCharge: number;

  @Column({ nullable: true })
  sellerWinnings: number;
}
