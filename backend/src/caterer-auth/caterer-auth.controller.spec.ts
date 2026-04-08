import { Test, TestingModule } from '@nestjs/testing';
import { CatererAuthController } from './caterer-auth.controller';

describe('CatererAuthController', () => {
  let controller: CatererAuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatererAuthController],
    }).compile();

    controller = module.get<CatererAuthController>(CatererAuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
