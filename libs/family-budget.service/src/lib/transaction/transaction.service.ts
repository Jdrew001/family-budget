import { Account, Transaction } from '@family-budget/family-budget.model';
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

    async createTransaction(transaction: Transaction, accountId: string) {
        const account = await this.accountService.getAccountById(accountId) as Account;
        transaction.account = account;

        // update the latest balance
        this.balanceService.updateAddLatestBalance(account, transaction.amount);
        return await this.transactionRepository.save(transaction);
    }

    async updateTransaction(transaction: Transaction) {
        const transactionToUpdate = await this.getTransactionById(transaction.id) as Transaction;
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
        return account.transactions;
    }
}
