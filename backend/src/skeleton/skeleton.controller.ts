import {
  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards,
} from '@nestjs/common';
import { SkeletonService } from './skeleton.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('skeletons')
export class SkeletonController {
  constructor(private readonly skeletonService: SkeletonService) {}

  // ─── PUBLIC (customer site reads active skeletons) ──────────────────────────

  @Get()
  findAll(
    @Query('_start') _start?: string,
    @Query('_end') _end?: string,
  ) {
    const skip = _start ? parseInt(_start, 10) : undefined;
    const take = _start && _end ? parseInt(_end, 10) - skip! : undefined;

    return this.skeletonService.findAll(skip, take);
  }

  @Get('by-category/:categoryId')
  findByCategory(@Param('categoryId') categoryId: string) {
    return this.skeletonService.findByCategory(categoryId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.skeletonService.findOne(id);
  }

  // ─── ADMIN ONLY ─────────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() data: any) {
    return this.skeletonService.create(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.skeletonService.update(id, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.skeletonService.remove(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/toggle')
  toggleActive(@Param('id') id: string) {
    return this.skeletonService.toggleActive(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post(':id/clone')
  clone(@Param('id') id: string) {
    return this.skeletonService.clone(id);
  }

  // ─── SLOT MANAGEMENT ────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post(':id/slots')
  addSlot(@Param('id') skeletonId: string, @Body() data: any) {
    return this.skeletonService.addSlot(skeletonId, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/slots/:slotId')
  updateSlot(@Param('slotId') slotId: string, @Body() data: any) {
    return this.skeletonService.updateSlot(slotId, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id/slots/:slotId')
  deleteSlot(@Param('slotId') slotId: string) {
    return this.skeletonService.deleteSlot(slotId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/slots/reorder')
  reorderSlots(
    @Param('id') skeletonId: string,
    @Body('orderedSlotIds') orderedSlotIds: string[],
  ) {
    return this.skeletonService.reorderSlots(skeletonId, orderedSlotIds);
  }

  // ─── DISH ASSIGNMENT ────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post(':id/slots/:slotId/dishes')
  addDishToSlot(@Param('slotId') slotId: string, @Body('dishId') dishId: string) {
    return this.skeletonService.addDishToSlot(slotId, dishId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/slots/:slotId/dishes')
  setSlotDishes(@Param('slotId') slotId: string, @Body('dishIds') dishIds: string[]) {
    return this.skeletonService.setSlotDishes(slotId, dishIds);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id/slots/:slotId/dishes/:dishId')
  removeDishFromSlot(
    @Param('slotId') slotId: string,
    @Param('dishId') dishId: string,
  ) {
    return this.skeletonService.removeDishFromSlot(slotId, dishId);
  }
}
