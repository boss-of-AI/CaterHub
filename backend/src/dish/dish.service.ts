import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DishService {
  constructor(private prisma: PrismaService) {}

  async findAll(category?: string, isNonVeg?: boolean) {
    return this.prisma.dish.findMany({
      where: {
        ...(category ? { category } : {}),
        ...(isNonVeg !== undefined ? { isNonVeg } : {}),
        isActive: true,
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  async findAllAdmin() {
    // Admin sees ALL dishes including inactive ones
    return this.prisma.dish.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string) {
    const dish = await this.prisma.dish.findUnique({ where: { id } });
    if (!dish) throw new NotFoundException(`Dish ${id} not found`);
    return dish;
  }

  async create(data: any) {
    return this.prisma.dish.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.dish.update({ where: { id }, data });
  }

  async remove(id: string) {
    // Soft delete - just mark inactive
    return this.prisma.dish.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async toggleActive(id: string) {
    const dish = await this.findOne(id);
    return this.prisma.dish.update({
      where: { id },
      data: { isActive: !dish.isActive },
    });
  }
}
