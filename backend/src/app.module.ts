import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatererModule } from './caterer/caterer.module';
import { PrismaModule } from './prisma/prisma.module';
import { MenuModule } from './menu/menu.module';
import { AuthModule } from './auth/auth.module';
import { OrderModule } from './order/order.module';
import { CustomerAuthModule } from './customer-auth/customer-auth.module';
import { CatererAuthModule } from './caterer-auth/caterer-auth.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DishModule } from './dish/dish.module';
import { SkeletonModule } from './skeleton/skeleton.module';
import { EventCategoryModule } from './event-category/event-category.module';

@Module({
  imports: [
    CatererModule,
    PrismaModule,
    MenuModule,
    OrderModule,
    AuthModule,
    CustomerAuthModule,
    CatererAuthModule,
    NotificationsModule,
    DishModule,
    SkeletonModule,
    EventCategoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
