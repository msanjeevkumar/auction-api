import { IsNumber, IsNumberString } from 'class-validator';

export class PlaceOrUpdateBidBody {
  @IsNumber()
  amount: string;
}
