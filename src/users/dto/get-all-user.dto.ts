import { IsInt, IsOptional, IsString, Min } from 'class-validator';
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

  @Min(1)
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  limit?: number;
}
