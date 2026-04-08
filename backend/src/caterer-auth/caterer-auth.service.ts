import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CatererAuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async login(username: string, pass: string) {
    const caterer = await this.prisma.caterer.findUnique({ where: { username } });
    if (!caterer) throw new UnauthorizedException('Invalid username or password');
    const isMatch = await bcrypt.compare(pass, caterer.password);
    if (!isMatch) throw new UnauthorizedException('Invalid username or password');
    if (!caterer.isActive) throw new UnauthorizedException('Account deactivated. Contact support.');
    const payload = { sub: caterer.id, username: caterer.username, role: 'CATERER' };
    return {
      access_token: await this.jwtService.signAsync(payload),
      caterer: { id: caterer.id, name: caterer.name },
    };
  }

  async updatePassword(catererId: string, dto: { currentPassword: string; newPassword: string }) {
    const caterer = await this.prisma.caterer.findUnique({ where: { id: catererId } });
    if (!caterer) throw new NotFoundException('Caterer not found');
    const isMatch = await bcrypt.compare(dto.currentPassword, caterer.password);
    if (!isMatch) throw new BadRequestException('Current password is incorrect');
    const hashed = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.caterer.update({ where: { id: catererId }, data: { password: hashed } });
    return { message: 'Password updated successfully' };
  }
}
