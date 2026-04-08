import { Module } from '@nestjs/common';
import { SkeletonService } from './skeleton.service';
import { SkeletonController } from './skeleton.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SkeletonController],
  providers: [SkeletonService],
  exports: [SkeletonService],
})
export class SkeletonModule {}
