import { PartialType } from '@nestjs/mapped-types';
import { CreateMenuDto } from './create-menu.dto';
import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class UpdateMenuDto extends PartialType(CreateMenuDto) {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    catererId?: string;

    @IsOptional()
    @IsNumber()
    pricePerHead?: number;

    @IsOptional()
    @IsBoolean()
    isNonVeg?: boolean;
}