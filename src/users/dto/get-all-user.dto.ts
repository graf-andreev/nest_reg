import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetAllUsersDto {
  @IsString()
  @IsOptional()
  search?: string;

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
