import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateCatererDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsString()
    @IsNotEmpty()
    city: string;

    @IsString()
    @IsNotEmpty()
    address: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}