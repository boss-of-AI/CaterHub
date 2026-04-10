import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request, Res } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // ─── CUSTOMER ENDPOINTS ───────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  @Get('my-orders')
  getMyOrders(@Request() req: any) {
    return this.orderService.findByCustomer(req.user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  @Post(':id/checkout')
  createCheckoutSession(@Param('id') id: string, @Request() req: any) {
    return this.orderService.createRazorpayOrder(id, req.user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  @Post(':id/verify-payment')
  verifyPayment(@Param('id') id: string, @Body() body: any) {
    return this.orderService.verifyRazorpayPayment(
      body.razorpay_order_id,
      body.razorpay_payment_id,
      body.razorpay_signature,
      id
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  @Get(':id/pdf')
  async downloadPdf(@Param('id') id: string, @Request() req: any, @Res() res: any) {
    const buffer = await this.orderService.getOrderPdf(id, req.user.sub);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="booking-${id.split('-')[0]}.pdf"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  // ─── CATERER ENDPOINTS ────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CATERER')
  @Get('my-invitations')
  getMyInvitations(@Request() req: any, @Query('status') status?: string) {
    return this.orderService.getMyInvitations(req.user.sub, status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CATERER')
  @Patch(':id/accept')
  accept(@Param('id') id: string, @Request() req: any) {
    return this.orderService.acceptJob(id, req.user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CATERER')
  @Patch(':id/reject')
  reject(@Param('id') id: string, @Request() req: any) {
    return this.orderService.rejectJob(id, req.user.sub);
  }

  // ─── ADMIN ENDPOINTS ─────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/broadcast')
  broadcast(
    @Param('id') id: string,
    @Body('broadcasts') broadcasts: { catererId: string; adminSetPrice: number }[],
  ) {
    return this.orderService.broadcastOrder(id, broadcasts);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/assign')
  assign(
    @Param('id') id: string, 
    @Body('catererId') catererId: string,
    @Body('confirmationFee') confirmationFee: number
  ) {
    return this.orderService.assignFinalCaterer(id, catererId, confirmationFee);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/complete')
  complete(@Param('id') id: string) {
    return this.orderService.completeOrder(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('_start') _start?: string,
    @Query('_end') _end?: string,
  ) {
    const skip = _start ? parseInt(_start, 10) : undefined;
    const take = _start && _end ? parseInt(_end, 10) - skip! : undefined;

    return this.orderService.findAll(status, skip, take);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(id, updateOrderDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(id);
  }
}
