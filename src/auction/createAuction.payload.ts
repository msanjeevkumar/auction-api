import { IsNumber, MinLength } from 'class-validator';
import { IsGreaterThan } from '../common/isGreaterThan.decorator';

export class CreateAuctionPayload {
  @MinLength(6)
  name: string;

  @MinLength(6)
  description: string;

  @IsNumber()
  minimumBid: number;

  @IsGreaterThan('minimumBid', {
    message: `highest bid must be greater than the minimum bid`,
  })
  @IsNumber()
  highestBid: number;
}
