import { Test, TestingModule } from '@nestjs/testing';
import { CatererAuthService } from './caterer-auth.service';

describe('CatererAuthService', () => {
  let service: CatererAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CatererAuthService],
    }).compile();

    service = module.get<CatererAuthService>(CatererAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
