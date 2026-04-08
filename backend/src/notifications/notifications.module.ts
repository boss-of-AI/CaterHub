import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway'; // <-- Fixed path!
import { PrismaModule } from '../prisma/prisma.module'; // Added Prisma

@Module({
  imports: [PrismaModule], // Need this for the database
  providers: [NotificationsGateway, NotificationsService],
  exports: [NotificationsService, NotificationsGateway], // Exported so other modules can use them
})
export class NotificationsModule { }