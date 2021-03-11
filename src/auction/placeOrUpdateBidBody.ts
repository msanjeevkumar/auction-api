import { IsNumberString } from 'class-validator';

export class PlaceOrUpdateBidBody {
  @IsNumberString({ no_symbols: true })
  amount: string;
}
