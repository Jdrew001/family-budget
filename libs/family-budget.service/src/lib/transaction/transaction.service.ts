import { Account, Category, CreateTransactionDto, Transaction } from '@family-budget/family-budget.model';
import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AccountService } from '../account/account.service';
import { BalanceService } from '../balance/balance.service';

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
            budget: account.budgets[0],
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
        
        return account.transactions.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
            const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
            return dateB.getTime() - dateA.getTime();
        });
    }
}
