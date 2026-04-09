import {
  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query
} from '@nestjs/common';
import { EventCategoryService } from './event-category.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('event-categories')
export class EventCategoryController {
  constructor(private readonly service: EventCategoryService) {}

  // ─── PUBLIC ───────────────────────────────────────────────────────────────

  @Get()
  findAll(
    @Query('active') active?: string,
    @Query('_start') _start?: string,
    @Query('_end') _end?: string,
  ) {
    const isActive = active === 'true' ? true : undefined;
    const skip = _start ? parseInt(_start, 10) : undefined;
    const take = _start && _end ? parseInt(_end, 10) - skip! : undefined;

    return this.service.findAll(isActive, skip, take);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // ─── ADMIN ONLY ───────────────────────────────────────────────────────────



  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() data: any) {
    return this.service.create(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/toggle')
  toggleActive(@Param('id') id: string) {
    return this.service.toggleActive(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
