import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CustomerAuthService } from './customer-auth.service';

@Controller('customer-auth') // 👈 Matches the baseURL in your frontend api.ts
export class CustomerAuthController {
    constructor(private customerAuthService: CustomerAuthService) { }

    @Post('signup')
    async signup(@Body() dto: any) {
        return this.customerAuthService.signUp(dto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() dto: any) {
        return this.customerAuthService.login(dto.email, dto.password);
    }
}