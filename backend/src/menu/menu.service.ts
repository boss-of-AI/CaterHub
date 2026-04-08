import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) { }

  async create(createMenuDto: CreateMenuDto) {
    // Extract items along with catererId and description
    const { catererId, description, items, ...rest } = createMenuDto;

    return await this.prisma.menu.create({
      data: {
        ...rest,
        description: description || "",
        // Ensure items is always an array to satisfy Prisma String[]
        items: items || [],
        caterer: {
          connect: { id: catererId },
        },
      },
    });
  }

  async update(id: string, updateMenuDto: UpdateMenuDto) {
    const { catererId, description, items, ...rest } = updateMenuDto;

    return await this.prisma.menu.update({
      where: { id },
      data: {
        ...rest,
        ...(description !== undefined && { description }),
        // If items are provided in the update, replace the array
        ...(items !== undefined && { items }),
        ...(catererId && {
          caterer: {
            connect: { id: catererId },
          },
        }),
      },
    });
  }

  async findAll() {
    try {
      return await this.prisma.menu.findMany({
        include: { caterer: true }
      });
    }
    catch (error) {
      console.error("MENU_FIND_ALL_ERROR:", error);
      return [];
    }
  }

  async findOne(id: string) {
    return await this.prisma.menu.findUnique({
      where: { id },
      include: { caterer: true },
    });
  }

  async remove(id: string) {
    return await this.prisma.menu.delete({ where: { id } });
  }
}