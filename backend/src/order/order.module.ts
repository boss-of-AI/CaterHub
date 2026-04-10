import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

import { PdfService } from './pdf.service';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [OrderController],
  providers: [OrderService, PdfService],
})
export class OrderModule { }