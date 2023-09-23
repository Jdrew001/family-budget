import { Account, AccountBalance, Family, User } from '@family-budget/family-budget.model';
import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { BalanceService } from '../balance/balance.service';

@Injectable()
export class AccountService {

    constructor(
        @Inject('AccountRepository') private readonly accountRepository: Repository<Account>,
        @Inject('UserRepository') private readonly userRepository: Repository<User>,
        private readonly balanceService: BalanceService
    ) { }

    //#region CRUD Account Methods
    async createAccountForUser(userId: string, account: Account) {
        const user = await this.userRepository.findOne({ where: { id: userId } }) as User;
        account.family = user.family as Family;
        return await this.accountRepository.save(account);
    }

    async updateAccount(account: Account) {
        return await this.accountRepository.save(account);
    }

    async getAccountById(accountId: string) {
        return await this.accountRepository.findOne({ where: { id: accountId } });
    }

    async deleteAccountById(accountId: string) {
        return await this.accountRepository.delete({ id: accountId });
    }

    async updateAccountBalance(accountId: string, amount: number) {
        const account = await this.getAccountById(accountId);
        account?.balances.push(await this.balanceService.createBalance(account, amount));

        return account;
    }

    //#endregion

    async getAccountsUserUser(userId: string) {
        // using the userId, get the family id and get all accounts for that family;
        const user = await this.userRepository.findOne({ where: { id: userId } }) as User;
        const accounts = await this.accountRepository.find({ where: { family: user.family } });

        return accounts;
    }

    async getAccountBalancesForUser(userId: string): Promise<AccountBalance[]> {
        const accounts = await this.getAccountsUserUser(userId);

        //get the latest by date balance for each account
        const balances = accounts.map(account => {
            return {
                accountId: account.id,
                accountName: account.name,
                balance: account.balances.reduce((prev, current) => {
                    return (prev.dateTime > current.dateTime) ? prev : current
                })
            };
        });

        return balances;
    }
}
