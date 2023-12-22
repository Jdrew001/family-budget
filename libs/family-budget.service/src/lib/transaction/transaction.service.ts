import { Account, Budget, Category, CreateTransactionDto, GroupTransaction, Transaction, TransactionDto, TransactionGroupRequest, TransactionQueryDto } from '@family-budget/family-budget.model';
import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AccountService } from '../account/account.service';
import moment from 'moment';
import { DateUtils } from '../util/date-util';

@Injectable()
export class TransactionService {

    constructor(
        @Inject('TransactionRepository') private readonly transactionRepository: Repository<Transaction>,
        private readonly accountService: AccountService
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
            budget: this.getBudgetByDate(account, new Date(transaction.date)),
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

    private async getTransactionsByAccountIdPagingQuery(dto: TransactionGroupRequest) {
        const result = this.transactionRepository.query(`
            SELECT * FROM FETCH_GROUP_TRANSACTION($1, $2, $3, $4, $5);
        `, [dto.accountId, null, null, dto.size, dto.page]);

        return result as Promise<Array<TransactionQueryDto>>;
    }

    async getGroupedTransaction(transaction: Transaction): Promise<TransactionDto> {
        const groupName = this.getGroupName(transaction.createdAt as Date);
        const date = (transaction.createdAt as Date).toDateString();
        const transactionId = transaction.id as string;
        return {
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
            groupName: groupName
        };
    }

    async getGroupedTransactions(dto: TransactionGroupRequest) {
        if (dto.page === 0) {
            dto.page = 1;
        }
    
        const transactions = await this.getTransactionsByAccountIdPagingQuery(dto);
        //const transactions = await this.getTransactionsByAccountIdPaging(dto);
        const groupsMap = new Map<string, GroupTransaction>();
    
        for (const transaction of transactions) {
    
            // Get or create the group
            let group = groupsMap.get(transaction.transactionGroup);
    
            if (!group) {
                group = new GroupTransaction(transaction.transactionGroup, []);
                groupsMap.set(transaction.transactionGroup, group);
            }
    
            const date = (transaction.createdAt as Date).toDateString();
            const transactionId = transaction.id as string;
    
            group.transactions.push({
                id: transactionId,
                description: transaction.description,
                date: DateUtils.getShortDate(date),
                showRed: transaction.categoryType === 1,
                amount: transaction.categoryType === 1 ? transaction.amount * -1 : transaction.amount,
                budgetId: transaction.budgetId,
                budgetStartDate: transaction.budgetStartDate,
                budgetEndDate: transaction.budgetEndDate,
                budgetActiveInd: transaction.budgetActiveInd,
                categoryId: transaction.categoryId,
                categoryType: transaction.categoryType,
                categoryName: transaction.categoryName,
                addedBy: ``,
                icon: transaction.categoryIcon,
            });
        }
    
        return [...groupsMap.values()];
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
