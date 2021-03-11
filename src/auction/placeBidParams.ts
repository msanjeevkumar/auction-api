import { IsNumberString } from 'class-validator';

export class PlaceBidParams {
  @IsNumberString(
    { no_symbols: true },
    { message: `$value is not a valid auction id` },
  )
  auctionId: string;
}
