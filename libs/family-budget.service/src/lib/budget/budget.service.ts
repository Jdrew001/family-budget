import { Account, Budget } from '@family-budget/family-budget.model';
import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class BudgetService {

    constructor(
        @Inject('BudgetRepository') private readonly budgetRepository: Repository<Budget>,
        @Inject('AccountRepository') private readonly accountRepository: Repository<Account>
    ) { }

    async getCurrentBudget(account: Account) {
        const currentDate = new Date();
        const budgets = account?.budgets.filter(budget => budget.startDate <= currentDate && budget.endDate >= currentDate) as Array<Budget>;
        return budgets[0];
    }

    async getWhatsLeftToSpend(accountId: string) {
        const userAccount = await this.accountRepository.findOneBy({ id: accountId });
        const budget = await this.getCurrentBudget(userAccount as Account);

        //Add up all the expense budget categories
        let totalBudget = 0;
        let categories = budget.budgetCategories.filter(item => item.category.type === 1);
        categories.forEach(category => {
            totalBudget += category.amount;
        });

        // add update all the expense type transactions
        let totalSpent = 0;
        let transactions = userAccount?.transactions.filter(item => item.category.type === 1 && item.budget?.id === budget.id);
        transactions?.forEach(transaction => {
            totalSpent += transaction.amount;
        });
        
        return totalBudget - totalSpent;
    }

    async getTotalIncomeExpenseForBudget(accountId: string) {
        const userAccount = await this.accountRepository.findOneBy({ id: accountId });
        const budget = await this.getCurrentBudget(userAccount as Account);

        // add update all income transactions from account
        let totalIncome = 0;
        let incomeTransactions = userAccount?.transactions.filter(item => item.category.type === 0 && item.budget?.id === budget.id);
        incomeTransactions?.forEach(transaction => {
            totalIncome += transaction.amount;
        });

        let totalExpense = 0;
        let expenseTransactions = userAccount?.transactions.filter(item => item.category.type === 1 && item.budget?.id === budget.id);
        expenseTransactions?.forEach(transaction => {
            totalExpense += transaction.amount;
        });

        return {totalIncome, totalExpense};
    }
}
