import { Account, Budget, Category, CreateTransactionDto, GroupTransaction, Transaction, TransactionGroupRequest } from '@family-budget/family-budget.model';
import { Inject, Injectable } from '@nestjs/common';
import { Between, Repository } from 'typeorm';
import { AccountService } from '../account/account.service';
import { BalanceService } from '../balance/balance.service';
import moment from 'moment';
import { group } from 'console';
import { DateUtils } from '../util/date-util';
import { UserService } from '../user/user.service';

@Injectable()
export class TransactionService {

    constructor(
        @Inject('TransactionRepository') private readonly transactionRepository: Repository<Transaction>,
        private readonly balanceService: BalanceService,
        private readonly accountService: AccountService,
        private readonly userService: UserService
    ) {}

    async getTransactionById(transactionId: string) {
        return await this.transactionRepository.findOne({ where: { id: transactionId }, relations: ['account', 'category'] });
    } 

    async getTransactionsForAccount(accountId: string) {
        const account = await this.accountService.getAccountById(accountId) as Account;
        return this.transactionRepository.find({ where: { account: account }, order: { createdAt: 'DESC' } });
    }

    async createTransaction(
        transaction: CreateTransactionDto, 
        account: Account,
        category: Category,
        userId: string) {
        const transactionToCreate: Transaction = {
            description: transaction.description,
            account: account,
            budget: this.getLatestActiveBudget(account),
            amount: +transaction.amount,
            createdAt: new Date(transaction.date),
            createdBy: userId,
            category: category
        }

        // update the latest balance
        return await this.transactionRepository.save(transactionToCreate);
    }

    async updateTransaction(
        originalTransaction: Transaction,
        transaction: CreateTransactionDto, 
        account: Account,
        category: Category,
        userId: string) {
        originalTransaction.amount = parseFloat(transaction.amount);
        originalTransaction.description = transaction.description;
        originalTransaction.account = account;
        originalTransaction.category = category;
        const budget = this.getBudgetByDate(account, new Date(transaction.date));
        originalTransaction.budget = (budget ? budget: null) as any;
        originalTransaction.createdAt = new Date(transaction.date);
        originalTransaction.updatedAt = new Date();

        // update the balance
        return await this.transactionRepository.save(originalTransaction);
    }

    async deleteTransaction(transactionId: string) {
        return await this.transactionRepository.delete({ id: transactionId });
    }

    // get the five most recent transactions for an account order by date descending
    async getRecentTransactionsForAccount(accountId: string, count: number) {
        const transactions = await this.transactionRepository.find(
            { 
                where: { account: { id: accountId} }, 
                order: { createdAt: 'DESC' }, 
                take: count, 
                relations: [
                    'budget', 
                    'category',
                    'budget.budgetCategories'
                ] 
            });
        // sort by date descending with account.transactions
        return transactions.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
            const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
            return dateB.getTime() - dateA.getTime();
        })
    }

    async getTransactionsForBudget(budget: Budget) {
        // find all transactions in between budget start date and end date inclusive
        const transactions = await this.transactionRepository.find({ where:{budget: budget},relations: ['budget', 'category']});
        return transactions;
    }

    private getLatestActiveBudget(account: Account) {
        return account.budgets?.filter(o => o.activeInd)[0];
    }

    private getBudgetByDate(account: Account, date: Date) {
        return account.budgets?.filter(o => o.startDate <= date && o.endDate >= date)[0];
    }

    private async getTransactionsByAccountIdPaging(dto: TransactionGroupRequest) {
        const accountId = dto.accountId
        const query = this.transactionRepository.createQueryBuilder('transaction')
            .leftJoinAndSelect('transaction.category', 'category')
            .leftJoinAndSelect('transaction.budget', 'budget')
            .leftJoinAndSelect('budget.budgetCategories', 'BudgetCategory')
            .where('transaction.account.id = :accountId', { accountId: accountId })
            .orderBy('transaction.createdAt', 'DESC')
            .skip((dto.page - 1) * dto.size)
            .take(dto.size);

        return await query.getMany();
    }

    async getGroupedTransactions(dto: TransactionGroupRequest) {
        if (dto.page === 0) {
            dto.page = 1;
        }
    
        const transactions = await this.getTransactionsByAccountIdPaging(dto);
        const groupsMap = new Map<string, GroupTransaction>();
    
        for (const transaction of transactions) {
            const groupName = this.getGroupName(transaction.createdAt as Date);
    
            // Get or create the group
            let group = groupsMap.get(groupName);
    
            if (!group) {
                group = new GroupTransaction(groupName, []);
                groupsMap.set(groupName, group);
            }
    
            const date = (transaction.createdAt as Date).toDateString();
            const transactionId = transaction.id as string;
    
            group.transactions.push({
                id: transactionId,
                description: transaction.description,
                date: DateUtils.getShortDate(date),
                showRed: transaction.category.type === 1,
                amount: transaction.category.type === 1 ? transaction.amount * -1 : transaction.amount,
                budget: transaction.budget as Budget,
                category: transaction.category,
                categoryName: transaction.category.name,
                transactionType: transaction.category.type === 0 ? 0 : 1,
                addedBy: ``,
                icon: transaction.category.icon as string,
            });
        }
    
        const sortedGroups = this.sortByGroupName(Array.from(groupsMap.values()));
        const finalSortedGroups = this.sortByDate(sortedGroups);
    
        return finalSortedGroups;
    }

    private sortByDate(groups: Array<GroupTransaction>) {
        groups.forEach((group) => {
            group.transactions.sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateB.getTime() - dateA.getTime();
            });
        });

        return groups;
    }

    private sortByGroupName(groups: Array<GroupTransaction>) {

        // starting with zero
        const groupOrder: Record<string, number> = {
            'Today': 0,
            'Yesterday': 1,
            'This Week': 2,
            'Last Week': 3,
            'This Month': 4,
            'Last Month': 5,
            'Older': 6,
        };

        groups.sort((a, b) => {
            const aIndex = groupOrder[a.groupName];
            const bIndex = groupOrder[b.groupName];
            return aIndex - bIndex;
        });

        return groups
    }

    private getGroupName(transactionDate: Date) {
        let groupName = '';
        const date = moment(transactionDate);

        const today = moment();
        const yesterday = moment().subtract(1, 'days').endOf('day');

        //get last week - saturday being the end of the week
        const startOfTheWeek = moment().startOf('week');
        const lastWeek = moment().subtract(1, 'weeks').startOf('week');
        const endOfLastWeek = moment().subtract(1, 'weeks').endOf('week');

        //get last month - last day of the month
        const thisMonth = moment().startOf('month');
        const lastMonthStart = moment().subtract(1, 'months').startOf('month');
        const lastMonthEnd = moment().subtract(1, 'months').endOf('month');

        // if the date is today, groupName = 'Today'
        if (date.isSame(today, 'day')) {
            groupName = 'Today';
        } else if (date.isSame(yesterday, 'day')) {
            groupName = 'Yesterday';
        } else if (date.isSameOrAfter(startOfTheWeek) && date.isBefore(yesterday)) {
            groupName = 'This Week';
        } else if (date.isSameOrAfter(lastWeek) && date.isSameOrBefore(endOfLastWeek)) {
            groupName = 'Last Week';
        } else if (date.isSameOrAfter(thisMonth) && date.isBefore(lastWeek)) {
            groupName = 'This Month';
        } else if (date.isSameOrAfter(lastMonthStart) && date.isSameOrBefore(lastMonthEnd)) {
            groupName = 'Last Month';
        } else {
            groupName = 'Older';
        }

        return groupName;
    }
}
