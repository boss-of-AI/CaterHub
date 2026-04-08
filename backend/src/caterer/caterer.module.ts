import { Module } from '@nestjs/common';
import { CatererService } from './caterer.service';
import { CatererController } from './caterer.controller';

@Module({
  controllers: [CatererController],
  providers: [CatererService],
})
export class CatererModule {}
