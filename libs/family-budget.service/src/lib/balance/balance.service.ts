import { Account, Balance } from '@family-budget/family-budget.model';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import moment from 'moment-timezone';

@Injectable()
export class BalanceService {
    constructor(
        @Inject('BalanceRepository') private readonly balanceRepository: Repository<Balance>,
    ) { }

    async getBalanceById(balanceId: string) {
        return await this.balanceRepository.findOne({ where: { id: balanceId } });
    }

    /**
     * Creates a new balance record for the given account with the specified amount.
     * Function should be called each time a new transaction is added
     * @param account - The account for which the balance is being created.
     * @param amount - The amount to be added to the balance.
     * @returns A Promise that resolves to the newly created balance record.
     */
    async createBalance(account: Account, amount: number) {
        const balance = new Balance();
        balance.account = account;
        balance.amount = amount;
        balance.dateTime = moment.utc(new Date()).toDate();
        return await this.balanceRepository.save(balance);
    }
 
    async updateAddBalanceById(balanceId: string, amount: number) {
        const balance = await this.getBalanceById(balanceId) as Balance;
        if (balance.amount === undefined) balance.amount = 0;
        balance.amount += amount;
        return await this.balanceRepository.save(balance);
    }

    async updateAddLatestBalance(account: Account, amount: number) {
        const balance = await this.getLatestBalance(account) as Balance;
        if (!balance) throw new BadRequestException('No balance found for account');
        if (balance.amount === undefined) throw new BadRequestException('No balance available for account');
        balance.amount += amount;
        return await this.balanceRepository.save(balance);
    }

    async getLatestBalance(account: Account) {
        return await this.balanceRepository.findOne({ where: { account: {id: account.id} }, relations: ['account'], order: { dateTime: 'DESC' } });
    }

    async markBalanceAsInactive(balanceId: string) {
        const balance = await this.getBalanceById(balanceId) as Balance;
        balance.activeInd = false;
        return await this.balanceRepository.save(balance);
    }
}
