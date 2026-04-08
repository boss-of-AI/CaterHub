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
  findAll() {
    return this.catererService.findAll();
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
