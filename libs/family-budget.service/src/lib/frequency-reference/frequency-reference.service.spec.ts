import { Test, TestingModule } from '@nestjs/testing';
import { FrequencyReferenceService } from './frequency-reference.service';

describe('FrequencyReferenceService', () => {
  let service: FrequencyReferenceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FrequencyReferenceService],
    }).compile();

    service = module.get<FrequencyReferenceService>(FrequencyReferenceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
