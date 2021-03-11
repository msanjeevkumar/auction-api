import { IsNumberString } from 'class-validator';

export class PlaceBidBody {
  @IsNumberString({ no_symbols: true })
  amount: string;
}
