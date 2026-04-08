import { IsString, IsNumber, IsBoolean, IsNotEmpty, IsOptional, IsArray, ArrayMaxSize, MaxLength } from 'class-validator';

export class CreateMenuDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MaxLength(25, { each: true })
  items: string[];
  @IsNotEmpty()
  @IsNumber()
  pricePerHead: number;

  @IsNotEmpty()
  @IsNumber()
  minHeadcount: number;

  @IsNotEmpty()
  @IsBoolean()
  isNonVeg: boolean;

  @IsNotEmpty()
  @IsString()
  catererId: string;
}