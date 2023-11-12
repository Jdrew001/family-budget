import { Family } from '@family-budget/family-budget.model';
import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';

@Injectable()
export class FamilyService {

    constructor(
        @Inject('FamilyRepository') private readonly familyRepository: Repository<Family>,
    ) {}

    async createFamily(id?: string) {
        return await this.familyRepository.create({ owner: id });
    }

    addFamilyOwner(familyId: string, userId: string) {
        return this.familyRepository.update(familyId, { owner: userId });
    }
}
