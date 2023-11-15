import { Family, User } from '@family-budget/family-budget.model';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
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

    async addFamilyMember(familyId: string, user: User) {
        const family = await this.familyRepository.findOne({ where: { id: familyId }});
        if (family) {
            family.users.push(user);
            return this.familyRepository.save(family);
        }
        
        throw new BadRequestException('Family not found');
    }

    addFamilyOwner(familyId: string, userId: string) {
        return this.familyRepository.update(familyId, { owner: userId });
    }

    async findById(id: string): Promise<Family> {
        return await this.familyRepository.findOne({ where: { id: id }}) as Family;
    }

    async markFamilyActive(family: Family) {
        family.activeInd = true;
        return await this.familyRepository.save(family);
    }

    async markFamilyInactive(family: Family) {
        family.activeInd = false;
        return await this.familyRepository.save(family);
    }

    async isUserOwnerOfAnyFamily(userId: string) {
        const family = await this.familyRepository.findOne({ where: { owner: userId }});
        return family;
    }
}
