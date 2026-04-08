import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SkeletonService {
  constructor(private prisma: PrismaService) {}

  // ─── SKELETON CRUD ──────────────────────────────────────────────────────────

  async findAll() {
    return this.prisma.menuSkeleton.findMany({
      include: {
        category: true,
        slots: {
          orderBy: { sortOrder: 'asc' },
          include: {
            dishes: { include: { dish: true } },
          },
        },
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByCategory(categoryId: string) {
    return this.prisma.menuSkeleton.findMany({
      where: { categoryId, isActive: true },
      include: {
        category: true,
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
    });
  }

  async findOne(id: string) {
    const skeleton = await this.prisma.menuSkeleton.findUnique({
      where: { id },
      include: {
        category: true,
        slots: {
          orderBy: { sortOrder: 'asc' },
          include: {
            dishes: {
              include: { dish: true },
            },
          },
        },
        _count: { select: { orders: true } },
      },
    });
    if (!skeleton) throw new NotFoundException(`Skeleton ${id} not found`);
    return skeleton;
  }

  async create(data: {
    name: string;
    occasion: string;
    description?: string;
    basePrice: number;
    minHeadcount: number;
    maxHeadcount?: number;
    categoryId?: string;
  }) {
    return this.prisma.menuSkeleton.create({ data });
  }

  async update(id: string, data: Partial<{
    name: string;
    occasion: string;
    description: string;
    basePrice: number;
    minHeadcount: number;
    maxHeadcount: number;
    isActive: boolean;
    categoryId: string;
  }>) {
    return this.prisma.menuSkeleton.update({ where: { id }, data });
  }

  async remove(id: string) {
    // Check if any orders use this skeleton
    const ordersCount = await this.prisma.order.count({
      where: { skeletonId: id },
    });
    if (ordersCount > 0) {
      // Soft delete — just deactivate
      return this.prisma.menuSkeleton.update({
        where: { id },
        data: { isActive: false },
      });
    }
    return this.prisma.menuSkeleton.delete({ where: { id } });
  }

  async toggleActive(id: string) {
    const skeleton = await this.findOne(id);
    return this.prisma.menuSkeleton.update({
      where: { id },
      data: { isActive: !skeleton.isActive },
    });
  }

  async clone(id: string) {
    const original = await this.findOne(id);
    const cloned = await this.prisma.menuSkeleton.create({
      data: {
        name: `${original.name} (Copy)`,
        occasion: original.occasion,
        description: original.description,
        basePrice: original.basePrice,
        minHeadcount: original.minHeadcount,
        maxHeadcount: original.maxHeadcount,
        categoryId: original.categoryId,
        isActive: false, // Start inactive so admin can configure
        slots: {
          create: original.slots.map((slot, index) => ({
            category: slot.category,
            label: slot.label,
            minChoices: slot.minChoices,
            maxChoices: slot.maxChoices,
            isRequired: slot.isRequired,
            sortOrder: slot.sortOrder ?? index,
            dishes: {
              create: slot.dishes.map((sd) => ({ dishId: sd.dishId })),
            },
          })),
        },
      },
      include: {
        slots: {
          include: { dishes: { include: { dish: true } } },
        },
      },
    });
    return cloned;
  }

  // ─── SLOT CRUD ───────────────────────────────────────────────────────────────

  async addSlot(skeletonId: string, data: {
    category: string;
    label: string;
    minChoices: number;
    maxChoices: number;
    isRequired?: boolean;
  }) {
    const maxOrder = await this.prisma.skeletonSlot.aggregate({
      where: { skeletonId },
      _max: { sortOrder: true },
    });
    const nextOrder = (maxOrder._max.sortOrder ?? -1) + 1;

    return this.prisma.skeletonSlot.create({
      data: { skeletonId, ...data, sortOrder: nextOrder },
      include: { dishes: { include: { dish: true } } },
    });
  }

  async updateSlot(slotId: string, data: Partial<{
    label: string;
    category: string;
    minChoices: number;
    maxChoices: number;
    isRequired: boolean;
    sortOrder: number;
  }>) {
    return this.prisma.skeletonSlot.update({
      where: { id: slotId },
      data,
      include: { dishes: { include: { dish: true } } },
    });
  }

  async deleteSlot(slotId: string) {
    return this.prisma.skeletonSlot.delete({ where: { id: slotId } });
  }

  async reorderSlots(skeletonId: string, orderedSlotIds: string[]) {
    const updates = orderedSlotIds.map((slotId, index) =>
      this.prisma.skeletonSlot.update({
        where: { id: slotId },
        data: { sortOrder: index },
      }),
    );
    return this.prisma.$transaction(updates);
  }

  // ─── DISH ASSIGNMENT ─────────────────────────────────────────────────────────

  async setSlotDishes(slotId: string, dishIds: string[]) {
    const slot = await this.prisma.skeletonSlot.findUnique({ where: { id: slotId } });
    if (!slot) throw new NotFoundException(`Slot ${slotId} not found`);

    if (dishIds.length < slot.minChoices) {
      throw new BadRequestException(
        `Cannot have fewer than ${slot.minChoices} dishes available for a slot requiring at least ${slot.minChoices} choices`,
      );
    }

    await this.prisma.skeletonSlotDish.deleteMany({ where: { slotId } });

    if (dishIds.length > 0) {
      await this.prisma.skeletonSlotDish.createMany({
        data: dishIds.map((dishId) => ({ slotId, dishId })),
        skipDuplicates: true,
      });
    }

    return this.prisma.skeletonSlot.findUnique({
      where: { id: slotId },
      include: { dishes: { include: { dish: true } } },
    });
  }

  async addDishToSlot(slotId: string, dishId: string) {
    return this.prisma.skeletonSlotDish.upsert({
      where: { slotId_dishId: { slotId, dishId } },
      create: { slotId, dishId },
      update: {},
    });
  }

  async removeDishFromSlot(slotId: string, dishId: string) {
    return this.prisma.skeletonSlotDish.delete({
      where: { slotId_dishId: { slotId, dishId } },
    });
  }
}
