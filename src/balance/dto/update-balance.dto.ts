import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';


export class UpdateBalanceDto{
  @IsNotEmpty()
  @IsInt()
  receiverId: number;

  @IsPositive()
  @IsNotEmpty()
  amount: number;
}
