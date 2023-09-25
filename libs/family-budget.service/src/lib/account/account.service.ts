import { Account, AccountBalance, Balance, Budget, Family, NewAccountBudget, User } from '@family-budget/family-budget.model';
import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { BalanceService } from '../balance/balance.service';
import { DateUtils } from '../util/date-util';

@Injectable()
export class AccountService {

    constructor(
        @Inject('AccountRepository') private readonly accountRepository: Repository<Account>,
        @Inject('UserRepository') private readonly userRepository: Repository<User>,
        @Inject('BudgetRepository') private readonly budgetRepository: Repository<Budget>,
        private readonly balanceService: BalanceService
    ) { }

    //#region CRUD Account Methods
    async createAccountForUser(userId: string, account: Account, newBudget?: NewAccountBudget) {
        const user = await this.userRepository.findOne({ where: { id: userId } }) as User;
        account.family = user.family as Family;

        if (newBudget) {
            const budget: Budget = {
                startDate: newBudget.startDate,
                endDate: DateUtils.calculateEndDate(newBudget.startDate, newBudget.frequency),
                budgetCategories: [],
                account: account
            };

            account.budgets = [budget];
        }

        return await this.accountRepository.save(account);
    }

    async updateAccount(account: Account) {
        return await this.accountRepository.save(account);
    }

    async getAccountById(accountId: string) {
        return await this.accountRepository.findOne({ where: { id: accountId }, 
            relations: [
                'transactions',
                'transactions.category',
                'transactions.budget',
                'budgets', 
                'budgets.budgetCategories',
                'budgets.budgetCategories.category'] });
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
        const accounts = await this.accountRepository.find({ where: { family: user.family },
        relations: [
            'transactions',
            'transactions.category',
            'balances',
            'accountType'
        ] });

        return accounts;
    }

    async getAccountBalancesForUser(userId: string): Promise<AccountBalance[]> {
        const accounts = await this.getAccountsUserUser(userId) as Account[];

        //get the latest by date balance for each account
        const balances: Array<AccountBalance> = accounts.map(account => {
            const latestBalance = account.balances.reduce((prev, current) => {
                return (prev.dateTime > current.dateTime) ? prev : current
            });

            return {
                accountId: account.id as string,
                accountName: account.name,
                accountOrder: account.accountType.sortOrder,
                balance: {
                    id: latestBalance.id,
                    amount: latestBalance.amount || 0,
                    dateTime: latestBalance.dateTime
                }
            };
        }).sort((a, b) => {
            if (a.accountOrder < b.accountOrder) {
                return -1;
            } else if (a.accountOrder > b.accountOrder) {
                return 1;
            } else {
                return 0;
            }
        });

        return balances;
    }
}
