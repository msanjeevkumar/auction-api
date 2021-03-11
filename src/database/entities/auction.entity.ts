import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

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

  @ManyToOne(() => User)
  seller: User;
}
