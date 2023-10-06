import { Account, Budget, Category, CreateTransactionDto, GroupTransaction, Transaction, TransactionGroupRequest } from '@family-budget/family-budget.model';
import { Inject, Injectable } from '@nestjs/common';
import { Between, Repository } from 'typeorm';
import { AccountService } from '../account/account.service';
import { BalanceService } from '../balance/balance.service';
import moment from 'moment';
import { group } from 'console';
import { DateUtils } from '../util/date-util';

@Injectable()
export class TransactionService {

    constructor(
        @Inject('TransactionRepository') private readonly transactionRepository: Repository<Transaction>,
        private readonly balanceService: BalanceService,
        private readonly accountService: AccountService
    ) {}

    async getTransactionById(transactionId: string) {
        return await this.transactionRepository.findOne({ where: { id: transactionId } });
    } 

    async getTransactionsForAccount(accountId: string) {
        const account = await this.accountService.getAccountById(accountId) as Account;
        return this.transactionRepository.find({ where: { account: account }, order: { createdAt: 'DESC' } });
    }

    async createTransaction(
        transaction: CreateTransactionDto, 
        accountId: string,
        category: Category,
        userId: string) {
        const account = await this.accountService.getAccountById(accountId) as Account;
        const transactionToCreate: Transaction = {
            description: transaction.description,
            account: account,
            budget: (account.budgets as Budget[])[0],
            amount: +transaction.amount,
            createdAt: new Date(transaction.date),
            createdBy: userId,
            category: category
        }

        // update the latest balance
        return await this.transactionRepository.save(transactionToCreate);
    }

    async updateTransaction(transaction: Transaction) {
        const transactionToUpdate = await this.getTransactionById(transaction.id || '') as Transaction;
        transactionToUpdate.amount = transaction.amount;
        transactionToUpdate.description = transaction.description;
        transactionToUpdate.category = transaction.category;
        transactionToUpdate.updatedAt = new Date();

        // update the balance
        this.balanceService.updateAddLatestBalance(transaction.account, transaction.amount - transactionToUpdate.amount);
        return await this.transactionRepository.save(transactionToUpdate);
    }

    async deleteTransaction(transactionId: string) {
        return await this.transactionRepository.delete({ id: transactionId });
    }

    // get the five most recent transactions for an account order by date descending
    async getRecentTransactionsForAccount(accountId: string, count: number) {
        const account = await this.accountService.getAccountById(accountId) as Account;
        // sort by date descending with account.transactions
        const transactions = account?.transactions as Transaction[];
        
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

    private async getTransactionsByAccountIdPaging(dto: TransactionGroupRequest) {
        const accountId = dto.accountId
        const query = this.transactionRepository.createQueryBuilder('transaction')
            .leftJoinAndSelect('transaction.category', 'category')
            .where('transaction.account.id = :accountId', { accountId: accountId })
            .orderBy('transaction.createdAt', 'DESC')
            .skip((dto.page - 1) * dto.size)
            .take(dto.size);

        return await query.getMany();
    }

    async getGroupedTransactions(dto: TransactionGroupRequest) {
        const transactions = await this.getTransactionsByAccountIdPaging(dto);
        const groups: Array<GroupTransaction> = [];
        transactions?.forEach((transaction) => {
          const groupName = this.getGroupName(transaction.createdAt as Date);
          let group = groups.find((group) => group.groupName === groupName);
      
          // group doesn't exist, add it
          if (!group) {
            groups.push(new GroupTransaction(groupName, []));
          }
      
          group = groups.find((group) => group.groupName === groupName);
          const date = (transaction.createdAt as Date).toDateString();
          const transactionId = transaction.id as string;
          group?.transactions.push({
            id: transactionId,
            description: transaction.description,
            date: DateUtils.getShortDate(date),
            showRed: transaction.category.type === 1,
            amount: transaction.amount,

          });

        });

        let sortedGroups = this.sortByGroupName(groups);
        let finalSortedGroups = this.sortByDate(sortedGroups);
      
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
