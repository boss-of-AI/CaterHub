import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    Patch,
    UseGuards,
    Request
} from '@nestjs/common';
import { CatererAuthService } from './caterer-auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Adjust path based on your folder structure

@Controller('caterer-auth')
export class CatererAuthController {
    constructor(private catererAuthService: CatererAuthService) { }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() loginDto: any) {
        return this.catererAuthService.login(loginDto.username, loginDto.password);
    }

    /**
     * PATCH /caterer-auth/update-password
     * Secured by JWT: Extracts the caterer ID from the token
     */
    @UseGuards(JwtAuthGuard)
    @Patch('update-password')
    async updatePassword(@Request() req, @Body() body: any) {
        // req.user is populated by the JwtStrategy from the token payload
        const catererId = req.user.sub;
        return this.catererAuthService.updatePassword(catererId, body);
    }
}