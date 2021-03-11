import { IsNumber, Min } from 'class-validator';

export class PlaceOrUpdateBidBody {
  @IsNumber()
  @Min(1)
  amount: string;
}
