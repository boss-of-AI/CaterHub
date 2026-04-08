import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CustomerAuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    // 1. SIGNUP Logic
    async signUp(dto: any) {
        const existingUser = await this.prisma.customer.findFirst({
            where: {
                OR: [{ email: dto.email }, { phoneNumber: dto.phoneNumber }],
            },
        });

        if (existingUser) {
            throw new ConflictException('Email or Phone number already registered');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        return this.prisma.customer.create({
            data: {
                name: dto.name,
                email: dto.email,
                phoneNumber: dto.phoneNumber,
                password: hashedPassword,
            },
        });
    }

    // 2. LOGIN Logic (This fixes the error)
    async login(email: string, pass: string) {
        // Find the customer
        const customer = await this.prisma.customer.findUnique({
            where: { email },
        });

        // Check password
        if (customer && (await bcrypt.compare(pass, customer.password))) {
            const payload = { sub: customer.id, email: customer.email, role: 'customer' };

            return {
                accessToken: await this.jwtService.signAsync(payload),
                user: {
                    id: customer.id,
                    name: customer.name,
                    email: customer.email,
                    phoneNumber: customer.phoneNumber,
                },
            };
        }

        throw new UnauthorizedException('Invalid email or password');
    }
}