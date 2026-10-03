import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetActiveUsersDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  ageFrom: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(150)
  ageTo: number;

  @Min(1)
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  page?: number;

  @Max(100)
  @Min(1)
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  limit?: number;
}
