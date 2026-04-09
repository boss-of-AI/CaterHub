import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { CatererService } from './caterer.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('caterers')
export class CatererController {
  constructor(private readonly catererService: CatererService) {}

  // Public: customer site and caterer-site read caterers
  @Get()
  findAll(
    @Query('_start') _start?: string,
    @Query('_end') _end?: string,
  ) {
    const skip = _start ? parseInt(_start, 10) : undefined;
    const take = _start && _end ? parseInt(_end, 10) - skip! : undefined;

    return this.catererService.findAll(skip, take);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.catererService.findOne(id);
  }

  // Admin only: CRUD
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() body: any) {
    return this.catererService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.catererService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.catererService.remove(id);
  }
}
