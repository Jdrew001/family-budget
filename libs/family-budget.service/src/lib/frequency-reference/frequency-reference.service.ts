import { FrequencyRef } from '@family-budget/family-budget.model';
import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class FrequencyReferenceService {

    constructor(
        @Inject('FrequencyRefRepository') private readonly frequencyRefRepository: Repository<FrequencyRef>
    ) {}

    async getFrequencyRefData(): Promise<FrequencyRef[]> {
        return await this.frequencyRefRepository.find({ where: { activeInd: true }});
    }

}
