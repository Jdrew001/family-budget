import { Family } from '@family-budget/family-budget.model';
import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class FamilyService {

    constructor(
        @Inject('FamilyRepository') private readonly familyRepository: Repository<Family>
    ) {}

    async createFamily() {
        return await this.familyRepository.create();
    }
}
