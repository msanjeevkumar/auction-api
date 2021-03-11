import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Auction } from './auction.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class Bid extends BaseEntity {
  @Column()
  amount: number;

  @ManyToOne(() => User)
  buyer: User;

  @ManyToOne(() => Auction)
  auction: Auction;
}
