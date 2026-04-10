import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { NotificationsService } from '../notifications/notifications.service';
import * as bcrypt from 'bcrypt';
import * as Razorpay from 'razorpay';
import * as crypto from 'crypto';
import { PdfService } from './pdf.service';

const razorpay = new (Razorpay as any)({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
});

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private pdfService: PdfService,
  ) {}

  // ─── CATERER ENDPOINTS ──────────────────────────────────────────────────────

  async getMyInvitations(catererId: string, filterStatus?: string) {
    let orderStatusFilter: any = { in: ['BROADCASTED', 'ASSIGNED'] };
    let assignmentStatusFilter: any = { in: ['PENDING', 'ACCEPTED', 'REJECTED'] };

    if (filterStatus === 'PENDING') {
      orderStatusFilter = 'BROADCASTED';
      assignmentStatusFilter = 'PENDING';
    } else if (filterStatus === 'ACCEPTED') {
      assignmentStatusFilter = 'ACCEPTED';
    } else if (filterStatus === 'WON') {
      orderStatusFilter = 'ASSIGNED';
      // Cannot easily filter finalCatererId in nested some, we will do it after or at top level
    }

    const orders = await this.prisma.order.findMany({
      where: {
        status: orderStatusFilter,
        ...(filterStatus === 'WON' ? { finalCatererId: catererId } : {}),
        possibleCaterers: {
          some: {
            catererId: catererId,
            status: assignmentStatusFilter,
          },
        },
      },
      include: {
        customer: true,
        menu: true,
        skeleton: { include: { slots: { include: { dishes: { include: { dish: true } } } } } },
        dishSelections: { include: { dish: true } },
        possibleCaterers: { where: { catererId: catererId } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((order) => {
      const myAssignment = order.possibleCaterers[0];
      const isWinner = order.status === 'ASSIGNED' && order.finalCatererId === catererId;

      return {
        ...order,
        customer: {
          name: order.customer.name,
          ...(isWinner ? { phoneNumber: order.customer.phoneNumber, email: order.customer.email } : {}),
        },
        adminSetPrice: myAssignment?.adminSetPrice || 0,
      };
    });
  }

  async acceptJob(orderId: string, catererId: string) {
    const updateResult = await this.prisma.orderAssignment.updateMany({
      where: { orderId, catererId, status: 'PENDING' },
      data: { status: 'ACCEPTED' },
    });

    if (updateResult.count === 0) {
      throw new BadRequestException('Assignment not found or already processed');
    }

    await this.notifications.createAdminNotification(
      'Caterer Accepted Job ✅',
      `A caterer has accepted the terms for order #${orderId.slice(-6)}`,
      orderId,
    );

    return { success: true, message: 'Job accepted' };
  }

  async rejectJob(orderId: string, catererId: string) {
    const updateResult = await this.prisma.orderAssignment.updateMany({
      where: { orderId, catererId, status: 'PENDING' },
      data: { status: 'REJECTED' },
    });

    if (updateResult.count === 0) {
      throw new BadRequestException('Assignment not found or already processed');
    }

    await this.notifications.createAdminNotification(
      'Caterer Declined Job ❌',
      `A caterer has declined the terms for order #${orderId.slice(-6)}`,
      orderId,
    );

    return { success: true, message: 'Job rejected' };
  }

  // ─── CUSTOMER ENDPOINTS ─────────────────────────────────────────────────────

  async findByCustomer(customerId: string) {
    try {
      return await this.prisma.order.findMany({
        where: { customerId },
        include: {
          finalCaterer: true,
          menu: true,
          skeleton: true,
          dishSelections: { include: { dish: true } },
          possibleCaterers: { include: { caterer: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      console.error('MY_ORDERS_FETCH_ERROR:', error);
      return [];
    }
  }

  async create(createOrderDto: CreateOrderDto) {
    const {
      catererId,
      menuId,
      skeletonId,
      dishSelections,
      phoneNumber,
      customerName,
      customerEmail,
      ...rest
    } = createOrderDto;

    if (!customerEmail) {
      throw new BadRequestException('Customer email is required to process an order.');
    }

    // Hash a temporary password for guest customers
    const hashedGuestPassword = await bcrypt.hash('caterme_guest_' + Date.now(), 10);

    // Determine order name for notification
    let orderLabel = 'a menu';
    if (menuId) {
      const menu = await this.prisma.menu.findUnique({ where: { id: menuId } });
      orderLabel = menu?.name || 'a menu';
    } else if (skeletonId) {
      const skeleton = await this.prisma.menuSkeleton.findUnique({ where: { id: skeletonId } });
      orderLabel = skeleton?.name || 'a menu package';
    }

    const newOrder = await this.prisma.order.create({
      data: {
        ...rest,
        customer: {
          connectOrCreate: {
            where: { phoneNumber },
            create: {
              phoneNumber,
              name: customerName,
              email: customerEmail,
              password: hashedGuestPassword,
            },
          },
        },
        // Connect to legacy menu if provided
        ...(menuId && { menu: { connect: { id: menuId } } }),
        // Connect to skeleton if provided
        ...(skeletonId && { skeleton: { connect: { id: skeletonId } } }),
        // Create dish selections if provided (skeleton-based orders)
        ...(dishSelections && dishSelections.length > 0 && {
          dishSelections: {
            create: dishSelections.map((ds: any) => ({
              dishId: ds.dishId,
              slotId: ds.slotId,
            })),
          },
        }),
        status: 'PENDING',
      },
      include: {
        customer: true,
        menu: true,
        skeleton: true,
        dishSelections: { include: { dish: true } },
      },
    });

    // Notify Admin of new booking request
    await this.notifications.createAdminNotification(
      'New Booking Request 🛎️',
      `${customerName} just requested ${orderLabel} for ${newOrder.headcount} guests.`,
      newOrder.id,
    );

    return newOrder;
  }

  async createRazorpayOrder(orderId: string, customerId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { menu: true, skeleton: true },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.customerId !== customerId) throw new BadRequestException('Unauthorized access to order');
    if (order.status !== 'AWAITING_PAYMENT') throw new BadRequestException('Order is not ready for payment');
    if (!order.confirmationFee) throw new BadRequestException('Confirmation fee is not set by Admin');

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.confirmationFee * 100), // paise
      currency: 'INR',
      receipt: `order_${orderId.split('-')[0]}`,
      notes: {
        orderId: order.id,
        eventDate: order.eventDate.toDateString(),
        menuName: order.menu?.name || order.skeleton?.name || 'Event Booking',
      },
    });

    return {
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      description: `Advance Booking: ${order.menu?.name || order.skeleton?.name || 'Event'}`,
      customerName: (await this.prisma.order.findUnique({ where: { id: orderId }, include: { customer: true } }))?.customer?.name || 'Customer',
      customerEmail: (await this.prisma.order.findUnique({ where: { id: orderId }, include: { customer: true } }))?.customer?.email || '',
      customerPhone: (await this.prisma.order.findUnique({ where: { id: orderId }, include: { customer: true } }))?.customer?.phoneNumber || '',
    };
  }

  async verifyRazorpayPayment(razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string, orderId: string) {
    // Verify signature
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret')
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      throw new BadRequestException('Payment verification failed: invalid signature');
    }

    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== 'AWAITING_PAYMENT') {
      return { success: true, message: 'Already confirmed', orderId };
    }

    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'CONFIRMED' }
    });

    await this.notifications.createCustomerNotification(
      order.customerId,
      'Booking Confirmed! 🎉',
      `We have received your advance payment. Your booking is now locked in!`,
      orderId
    );

    return { success: true, orderId };
  }

  async getOrderPdf(orderId: string, customerId: string): Promise<Buffer> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { 
        customer: true, 
        menu: true, 
        skeleton: true, 
        dishSelections: { include: { dish: true } } 
      },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.customerId !== customerId) throw new UnauthorizedException('Access denied');
    if (order.status !== 'CONFIRMED') throw new BadRequestException('Order is not fully confirmed yet');

    return this.pdfService.generateBookingInvoice(order);
  }

  // ─── ADMIN ENDPOINTS ────────────────────────────────────────────────────────

  async broadcastOrder(orderId: string, broadcasts: { catererId: string; adminSetPrice: number }[]) {
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'BROADCASTED',
        possibleCaterers: {
          create: broadcasts.map((b) => ({
            catererId: b.catererId,
            adminSetPrice: b.adminSetPrice,
            status: 'PENDING',
          })),
        },
      },
      include: {
        menu: true,
        skeleton: true,
        possibleCaterers: { include: { caterer: true } },
      },
    });

    const menuName = updatedOrder.menu?.name || updatedOrder.skeleton?.name || 'a menu';

    // Notify each caterer on the broadcast list
    for (const assignment of broadcasts) {
      await this.notifications.createCatererNotification(
        assignment.catererId,
        'New Job Opportunity! 🥘',
        `An event for ${updatedOrder.headcount} guests (${menuName}) is available in your area.`,
        orderId,
      );
    }

    return updatedOrder;
  }

  async assignFinalCaterer(orderId: string, catererId: string, confirmationFee?: number) {
    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'AWAITING_PAYMENT',
        finalCatererId: catererId,
        ...(confirmationFee !== undefined && { confirmationFee })
      },
      include: { finalCaterer: true, customer: true, menu: true, skeleton: true },
    });

    await this.prisma.orderAssignment.updateMany({
      where: { orderId, catererId },
      data: { status: 'ACCEPTED' },
    });

    await this.prisma.orderAssignment.updateMany({
      where: { orderId, catererId: { not: catererId } },
      data: { status: 'REJECTED' },
    });

    await this.notifications.createCatererNotification(
      catererId,
      'You got the job! 🏆',
      `You are officially confirmed for ${order.customer.name}'s event. Check your dashboard for contact details!`,
      orderId,
    );

    await this.notifications.createCustomerNotification(
      order.customerId,
      'Action Required: Pay Confirmation Fee 💳',
      `Your event request has been successfully coordinated! Please log in and pay the confirmation fee to lock in your date.`,
      orderId,
    );

    return order;
  }

  async completeOrder(orderId: string) {
    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'COMPLETED' },
      include: { customer: true, finalCaterer: true, menu: true, skeleton: true },
    });

    // Notify the customer
    await this.notifications.createCustomerNotification(
      order.customerId,
      'Event Completed! 🎉',
      `Your event has been marked as completed. Thank you for choosing CaterMe!`,
      orderId,
    );

    return order;
  }

  async findAll(status?: string, skip?: number, take?: number) {
    try {
      const where = { ...(status ? { status } : {}) };
      const [data, total] = await this.prisma.$transaction([
        this.prisma.order.findMany({
          where,
          ...(skip !== undefined ? { skip } : {}),
          ...(take !== undefined ? { take } : {}),
          include: {
            customer: true,
            finalCaterer: true,
            menu: true,
            skeleton: true,
            dishSelections: { include: { dish: true } },
            possibleCaterers: { include: { caterer: true } },
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.order.count({ where }),
      ]);
      return { data, total };
    } catch (error) {
      console.error('PRISMA ERROR:', error);
      return { data: [], total: 0 };
    }
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        finalCaterer: true,
        menu: true,
        skeleton: { include: { slots: { orderBy: { sortOrder: 'asc' }, include: { dishes: { include: { dish: true } } } } } },
        dishSelections: { include: { dish: true } },
        possibleCaterers: { include: { caterer: true } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const { menuId, skeletonId, dishSelections, phoneNumber, customerName, customerEmail, catererId, ...rest } = updateOrderDto;
    return await this.prisma.order.update({
      where: { id },
      data: {
        ...rest,
        ...(menuId && { menu: { connect: { id: menuId } } }),
        ...(skeletonId && { skeleton: { connect: { id: skeletonId } } }),
      },
    });
  }

  async remove(id: string) {
    // Delete dish selections first (cascade), then order assignments, then order
    await this.prisma.orderDishSelection.deleteMany({ where: { orderId: id } });
    await this.prisma.orderAssignment.deleteMany({ where: { orderId: id } });
    return await this.prisma.order.delete({ where: { id } });
  }
}