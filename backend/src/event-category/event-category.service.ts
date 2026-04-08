import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventCategoryService {
  constructor(private prisma: PrismaService) {}

  // Public: returns active categories with skeleton counts
  async findAll() {
    return this.prisma.eventCategory.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { skeletons: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  // Admin: returns ALL categories including inactive
  async findAllAdmin() {
    return this.prisma.eventCategory.findMany({
      include: {
        _count: { select: { skeletons: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  // Public: returns a category with its active skeletons (for customer browsing)
  async findOne(id: string) {
    const category = await this.prisma.eventCategory.findUnique({
      where: { id },
      include: {
        skeletons: {
          where: { isActive: true },
          include: {
            slots: {
              orderBy: { sortOrder: 'asc' },
              include: {
                dishes: { include: { dish: true } },
                _count: { select: { dishes: true } },
              },
            },
            _count: { select: { orders: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!category) throw new NotFoundException(`Event category ${id} not found`);
    return category;
  }

  async create(data: {
    name: string;
    label: string;
    description?: string;
    icon?: string;
    imageUrl?: string;
    sortOrder?: number;
  }) {
    return this.prisma.eventCategory.create({ data });
  }

  async update(id: string, data: Partial<{
    name: string;
    label: string;
    description: string;
    icon: string;
    imageUrl: string;
    sortOrder: number;
    isActive: boolean;
  }>) {
    return this.prisma.eventCategory.update({ where: { id }, data });
  }

  async remove(id: string) {
    // Check if there are skeletons in this category
    const skeletonCount = await this.prisma.menuSkeleton.count({
      where: { categoryId: id },
    });

    if (skeletonCount > 0) {
      // Soft delete: just deactivate
      return this.prisma.eventCategory.update({
        where: { id },
        data: { isActive: false },
      });
    }

    return this.prisma.eventCategory.delete({ where: { id } });
  }

  async toggleActive(id: string) {
    const cat = await this.prisma.eventCategory.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException(`Event category ${id} not found`);
    return this.prisma.eventCategory.update({
      where: { id },
      data: { isActive: !cat.isActive },
    });
  }
}
