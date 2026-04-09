import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CatererService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    try {
      const { password, ...rest } = data;
      const hashedPassword = await bcrypt.hash(password, 12);
      return await this.prisma.caterer.create({ data: { ...rest, password: hashedPassword } });
    } catch (error: any) {
      if (error.code === 'P2002') throw new BadRequestException('Username already exists.');
      throw new InternalServerErrorException('Failed to create caterer');
    }
  }

  async findAll(skip?: number, take?: number) {
    const [data, total] = await this.prisma.$transaction([
      this.prisma.caterer.findMany({
        ...(skip !== undefined ? { skip } : {}),
        ...(take !== undefined ? { take } : {}),
        select: {
          id: true, name: true, username: true, phone: true,
          city: true, address: true, isActive: true, createdAt: true,
          _count: { select: { menus: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.caterer.count(),
    ]);

    return { data, total };
  }

  async findOne(id: string) {
    const caterer = await this.prisma.caterer.findUnique({
      where: { id },
      select: {
        id: true, name: true, username: true, phone: true,
        city: true, address: true, isActive: true, createdAt: true,
        menus: true,
      },
    });
    if (!caterer) throw new NotFoundException(`Caterer ${id} not found`);
    return caterer;
  }

  async update(id: string, data: any) {
    try {
      const updateData: any = { ...data };
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 12);
      }
      delete updateData.plainPassword;
      return await this.prisma.caterer.update({ where: { id }, data: updateData });
    } catch {
      throw new InternalServerErrorException('Failed to update caterer');
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.caterer.delete({ where: { id } });
    } catch {
      throw new InternalServerErrorException('Failed to delete caterer');
    }
  }
}
