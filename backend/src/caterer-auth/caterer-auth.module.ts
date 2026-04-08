import { Module } from '@nestjs/common';
import { CatererAuthService } from './caterer-auth.service';
import { CatererAuthController } from './caterer-auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      useFactory: () => {
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error('JWT_SECRET environment variable is not set.');
        return { secret, signOptions: { expiresIn: '24h' } };
      },
    }),
  ],
  providers: [CatererAuthService],
  controllers: [CatererAuthController],
})
export class CatererAuthModule {}