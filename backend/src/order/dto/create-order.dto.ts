import { IsString, IsNotEmpty, IsNumber, IsDateString, IsOptional, MaxLength, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class DishSelectionDto {
  @IsString()
  @IsNotEmpty()
  dishId: string;

  @IsString()
  @IsNotEmpty()
  slotId: string;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  eventLocation: string;

  @IsDateString()
  @IsNotEmpty()
  eventDate: string;

  @IsString()
  @IsNotEmpty()
  eventType: string;

  @IsString()
  @IsOptional()
  @MaxLength(25)
  otherEventDetails?: string;

  @IsNumber()
  @IsNotEmpty()
  headcount: number;

  @IsNumber()
  @IsNotEmpty()
  totalAmount: number;

  // Legacy menu-based order (optional)
  @IsString()
  @IsOptional()
  catererId?: string;

  @IsString()
  @IsOptional()
  menuId?: string;

  // NEW: Skeleton-based order (optional)
  @IsString()
  @IsOptional()
  skeletonId?: string;

  // NEW: Customer dish selections for skeleton-based orders
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DishSelectionDto)
  dishSelections?: DishSelectionDto[];

  // Customer identification
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsString()
  @IsOptional()
  customerEmail?: string;
}