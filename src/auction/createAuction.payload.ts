import { IsNumber, Min, MinLength } from 'class-validator';
import { IsGreaterThan } from '../common/isGreaterThan.decorator';

export class CreateAuctionPayload {
  @MinLength(6)
  name: string;

  @MinLength(6)
  description: string;

  @IsNumber()
  @Min(1)
  minimumBid: number;

  @IsGreaterThan('minimumBid', {
    message: `highest bid must be greater than the minimum bid`,
  })
  @IsNumber()
  @Min(1)
  highestBid: number;
}
