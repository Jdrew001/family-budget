import { Account, AccountBalance, AccountType, Balance, Budget, BudgetPeriod, CreateAccountDto, Family, NewAccountBudget, User } from '@family-budget/family-budget.model';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { DateUtils } from '../util/date-util';
import { BudgetService } from '../budget/budget.service';
import { ConversionUtils } from '../util/conversions.utils';
import { CoreService } from '../core/core.service';
import moment from 'moment-timezone';

@Injectable()
export class AccountService {

    get currentUser() { return this.coreService.currentUser; }

    constructor(
        @Inject('AccountRepository') private readonly accountRepository: Repository<Account>,
        @Inject('AccountTypeRepository') private readonly accountTypeRepository: Repository<AccountType>,
        private readonly budgetService: BudgetService,
        private readonly coreService: CoreService
    ) { }

    async createAccountForUser(nAccount: CreateAccountDto) {
        const accountType = await this.getAccountTypeById(nAccount.accountType);
        const account = new Account();
        account.name = nAccount.name;
        account.description = nAccount.description;
        account.accountType = accountType as AccountType;
        account.family = this.currentUser.family as Family;
        account.activeInd = true;
        account.icon = nAccount.icon;

        if (nAccount?.frequency !== null) {
            account.budgetPeriod = await this.budgetService.getBudgetPeriodByFrequency(nAccount.frequency) as BudgetPeriod;
        }

        const balance = new Balance();
        balance.amount = ConversionUtils.convertFormatUSDToNumber(nAccount.beginningBalance);
        balance.dateTime = moment.utc(new Date()).toDate();

        account.balance = balance;

        if (nAccount.createBudget) {
            const budget = new Budget();
            budget.startDate = moment.utc(new Date(nAccount.startDate)).toDate();
            budget.endDate = DateUtils.calculateEndDate(
                new Date(nAccount.startDate), 
                nAccount.frequency,
                this.currentUser.family?.timezone as string).toDate();
            budget.budgetCategories = [];
            account.budgets = [budget];
        }
        
        let savedAccount = await this.accountRepository.save(account);
        return savedAccount;
    }

    async getAccountTotal(accountId: string) {
        if (!accountId) {
            throw new BadRequestException('Account Id is required');
        }

        const result = await this.accountRepository.query(
            `SELECT * FROM CALCULATE_INCOME_EXPENSE($1);`,
            [accountId]
        ) ?? [];

        return result[0];
    }

    async updateAccount(account: Account) {
        return await this.accountRepository.save(account);
    }

    async getAccountById(accountId: string) {
        return await this.accountRepository.findOne({ where: { id: accountId }, 
            relations: [
                'balance',
                'accountType',
                'transactions',
                'transactions.category',
                'transactions.budget',
                'budgetPeriod',
                'family',
                'budgets', 
                'budgets.budgetCategories',
                'budgets.budgetCategories.category'] });
    }

    async deleteAccountById(accountId: string) {
        return await this.accountRepository.delete({ id: accountId });
    }

    async getAccountsUserUser() {
        // using the userId, get the family id and get all accounts for that family;
        const accounts = await this.accountRepository.find({ where: { family: {id: this.currentUser.family?.id}, activeInd: true },
        relations: [
            'transactions',
            'transactions.category',
            'accountType',
            'balance'
        ] });

        return accounts;
    }

    async getAccountBalancesForUser(): Promise<AccountBalance[]> {
        const accounts = await this.getAccountsUserUser() as Account[];

        //get the latest by date balance for each account
        const balances: Array<AccountBalance> = accounts.map(account => {
        const latestBalance = account.balance as Balance;

            return {
                accountId: account.id as string,
                accountName: account.name,
                accountOrder: account.accountType.sortOrder,
                icon: account.icon,
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

    async getAccountTypes() {
        return await this.accountTypeRepository.find({ where: {activeInd: true}, order: { sortOrder: 'ASC' } });
    }

    async getAccountTypeById(id: string) {
        return await this.accountTypeRepository.findOne({ where: {id: id} });
    }

    async markAccountInactive(accountId: string) {
        const account = await this.getAccountById(accountId) as Account;
        if (!account) {
            throw new BadRequestException('The account you are trying to mark inactive does not exist.');
        }
        account.activeInd = false;
        return await this.accountRepository.save(account);
    }
}
