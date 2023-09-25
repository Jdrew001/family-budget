import { Account, AccountType, Balance, BudgetPeriod, Family, Frequency, User } from '@family-budget/family-budget.model';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SeedConstant } from './seed.constant';

@Injectable()
export class SeedService {

    accountNames = ['Checking', 'Savings', 'Credit Card'];
    
    constructor(
        @Inject('UserRepository') private userRepository: Repository<User>,
        @Inject('FamilyRepository') private familyRepository: Repository<Family>,
        @Inject('AccountRepository') private accountRepository: Repository<Account>,
        @Inject('BalanceRepository') private balanceRepository: Repository<Balance>,
        @Inject('AccountTypeRepository') private accountTypeRepository: Repository<AccountType>,
        @Inject('BudgetPeriodRepository') private budgetPeriodRepository: Repository<BudgetPeriod>
    ) { }

    public async seed() {
        await this.seedMockUser();
    }

    private async seedMockFamily(userId: string | undefined) {
        Logger.log('Seeding mock family...');
        const result = await this.familyRepository.findOneBy({ users: [{ id: userId }] });
        if (result) return result;
        const newFamily = new Family();
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
        await this.seedAccounts(family);
        this.familyRepository.update((family.id as string), family);
        this.userRepository.update((savedItem.id as string), {...savedItem, family: family});
        Logger.log('Mock user seeded.', savedItem.email);
    }

    private async seedAccounts(family: Family) {
        const newAccounts: Array<Account> = [];
        const accountType = await this.accountTypeRepository.findOneBy({ name: 'Checking' }) as AccountType;
        const budgetPeriod = await this.budgetPeriodRepository.findOneBy({ frequency: Frequency.BiWeekly }) as BudgetPeriod;
        this.accountNames.forEach(async item => {
            const account: Account = {
                id: undefined,
                name: item,
                description: 'some description',
                accountType: accountType,
                budgets: [],
                balances: [await this.createDefaultBalance()],
                transactions: [],
                budgetPeriod: budgetPeriod,
                family: family
            };
            account.name = item;
            newAccounts.push(await this.accountRepository.save(account));
        })
        return newAccounts;
    }

    private async createDefaultBalance() {
        const newBalance: Balance = {
            amount: 0,
            activeInd: true,
            dateTime: new Date()
        }
        return await this.balanceRepository.save(newBalance);
    }
}
