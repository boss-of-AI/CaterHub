import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
    constructor(
        private prisma: PrismaService,
        private gateway: NotificationsGateway,
    ) { }

    // --- BROADCAST TRIGGERS ---

    async createCatererNotification(catererId: string, title: string, message: string, referenceId?: string) {
        const notification = await this.prisma.notification.create({
            data: {
                title,
                message,
                type: 'NEW_ORDER',
                targetRole: 'CATERER',
                targetUserId: catererId,
                referenceId,
            },
        });

        // Broadcast instantly
        this.gateway.notifyCaterer(catererId, notification);
        return notification;
    }

    async createAdminNotification(title: string, message: string, referenceId?: string) {
        const notification = await this.prisma.notification.create({
            data: {
                title,
                message,
                type: 'SYSTEM_ALERT',
                targetRole: 'ADMIN',
                referenceId, // Admin notifications usually don't have a specific targetUserId
            },
        });

        this.gateway.notifyAdmins(notification);
        return notification;
    }

    async createCustomerNotification(customerId: string, title: string, message: string, referenceId?: string) {
        const notification = await this.prisma.notification.create({
            data: {
                title,
                message,
                type: 'ORDER_UPDATE',
                targetRole: 'CUSTOMER',
                targetUserId: customerId,
                referenceId,
            },
        });

        this.gateway.notifyCustomer(customerId, notification);
        return notification;
    }

    // --- HELPER METHODS FOR THE FRONTEND ---

    /**
     * Fetches unread notifications when a user logs in
     */
    async getUnreadNotifications(userId: string, role: string) {
        return this.prisma.notification.findMany({
            where: {
                targetRole: role,
                OR: [
                    { targetUserId: userId },
                    { targetUserId: null } // Catches global admin broadcasts
                ],
                isRead: false,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Marks a notification as read when the user clicks the bell icon
     */
    async markAsRead(notificationId: string) {
        return this.prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true },
        });
    }
}