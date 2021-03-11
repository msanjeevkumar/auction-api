import { IsNumberString } from 'class-validator';

export class AuctionParams {
  @IsNumberString(
    { no_symbols: true },
    { message: `$value is not a valid auction id` },
  )
  auctionId: string;
}
