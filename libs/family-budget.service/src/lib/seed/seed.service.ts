import { Family, User } from '@family-budget/family-budget.model';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SeedConstant } from './seed.constant';

@Injectable()
export class SeedService {
    
    constructor(
        @Inject('UserRepository') private userRepository: Repository<User>,
        @Inject('FamilyRepository') private familyRepository: Repository<Family>
    ) { }

    public async seed() {
        await this.seedMockUser();
    }

    private async seedMockFamily(userId: string | undefined) {
        Logger.log('Seeding mock family...');
        const result = await this.familyRepository.findOneBy({ users: [{ id: userId }] });
        if (result) return result;
        let savedItem = await this.familyRepository.save(new Family());
        Logger.log('Mock family seeded.', savedItem.id);
        return savedItem;
    }

    private async seedMockUser() {
        Logger.log('Seeding mock user...');
        const result = await this.userRepository.findOneBy({ email: SeedConstant.USER_MOCK.email });
        if (result) return;
        let savedItem = await this.userRepository.save(SeedConstant.USER_MOCK);
        let family = await this.seedMockFamily(savedItem.id);
        this.userRepository.update((savedItem.id as string), {...savedItem, family: family});
        Logger.log('Mock user seeded.', savedItem.email);
    }
}
