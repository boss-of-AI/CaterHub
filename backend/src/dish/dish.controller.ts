import {
  Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards,
} from '@nestjs/common';
import { DishService } from './dish.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('dishes')
export class DishController {
  constructor(private readonly dishService: DishService) {}

  // Public: customer site reads active dishes for selection
  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('isNonVeg') isNonVeg?: string,
    @Query('active') active?: string,
    @Query('_start') _start?: string,
    @Query('_end') _end?: string,
  ) {
    const isNonVegBool = isNonVeg !== undefined ? isNonVeg === 'true' : undefined;
    const isActive = active === 'true' ? true : undefined;
    const skip = _start ? parseInt(_start, 10) : undefined;
    const take = _start && _end ? parseInt(_end, 10) - skip! : undefined;
    
    return this.dishService.findAll(category, isNonVegBool, isActive, skip, take);
  }

  // Admin only: sees all including inactive


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dishService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() data: any) {
    return this.dishService.create(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.dishService.update(id, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/toggle')
  toggleActive(@Param('id') id: string) {
    return this.dishService.toggleActive(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dishService.remove(id);
  }
}
