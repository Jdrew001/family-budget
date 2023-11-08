import { Test, TestingModule } from '@nestjs/testing';
import { TextingService } from './texting.service';

describe('TextingService', () => {
  let service: TextingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TextingService],
    }).compile();

    service = module.get<TextingService>(TextingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
