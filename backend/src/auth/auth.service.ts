import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async login(email: string, pass: string) {
        const admin = await this.prisma.admin.findUnique({
            where: { email },
        });

        if (admin && (await bcrypt.compare(pass, admin.password))) {
            // Added 'role' to the payload
            const payload = {
                sub: admin.id,
                email: admin.email,
                role: 'ADMIN'
            };

            return {
                accessToken: await this.jwtService.signAsync(payload),
                user: {
                    id: admin.id,
                    name: admin.name,
                    email: admin.email,
                },
            };
        }

        throw new UnauthorizedException('Invalid email or password');
    }
}