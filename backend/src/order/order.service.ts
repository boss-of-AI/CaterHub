import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { NotificationsService } from '../notifications/notifications.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  // ─── CATERER ENDPOINTS ──────────────────────────────────────────────────────

  async getMyInvitations(catererId: string) {
    const orders = await this.prisma.order.findMany({
      where: {
        status: { in: ['BROADCASTED', 'ASSIGNED'] },
        possibleCaterers: {
          some: {
            catererId: catererId,
            status: { in: ['PENDING', 'ACCEPTED', 'REJECTED'] },
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

  async assignFinalCaterer(orderId: string, catererId: string) {
    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'ASSIGNED', finalCatererId: catererId },
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
      'Caterer Confirmed! ✅',
      `${order.finalCaterer?.name || 'A caterer'} has been assigned to your event and will contact you soon.`,
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

  async findAll(status?: string) {
    try {
      return await this.prisma.order.findMany({
        where: { ...(status ? { status } : {}) },
        include: {
          customer: true,
          finalCaterer: true,
          menu: true,
          skeleton: true,
          dishSelections: { include: { dish: true } },
          possibleCaterers: { include: { caterer: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      console.error('PRISMA ERROR:', error);
      return [];
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
    const { menuId, ...rest } = updateOrderDto;
    return await this.prisma.order.update({
      where: { id },
      data: {
        ...rest,
        ...(menuId && { menu: { connect: { id: menuId } } }),
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