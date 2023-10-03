import { Account, Budget, BudgetPeriod, Category, CreateAccountDto, Frequency } from '@family-budget/family-budget.model';
import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import moment from 'moment';

@Injectable()
export class BudgetService {

    constructor(
        @Inject('BudgetRepository') private readonly budgetRepository: Repository<Budget>,
        @Inject('BudgetPeriodRepository') private readonly budgetPeriodRepository: Repository<BudgetPeriod>,
    ) { }

    async getBudgetById(id: string) {
        return await this.budgetRepository.findOne({ where: { id: id }, relations: ['budgetCategories', 'budgetCategories.category', 'account', 'account.transactions', 'account.transactions.budget', 'account.transactions.category'] });
    }

    async getCurrentBudget(account: Account) {
        const currentDate = new Date();
        const budgets = account?.budgets?.filter(budget => budget.startDate <= currentDate && budget.endDate >= currentDate) as Array<Budget>;
        if (budgets.length == 0) {
            return await this.createNewBudget(account);
        }
        return budgets[0] || null;
    }

    async getWhatsLeftToSpend(account: Account, budget?: Budget) {
        const userAccount = account;
        if (budget === undefined) {
            budget = await this.getCurrentBudget(userAccount as Account);
        }

        //Add up all the expense budget categories
        let totalBudget = 0;
        let categories = budget.budgetCategories.filter(item => item.category.type === 1);
        categories.forEach(category => {
            totalBudget += category.amount;
        });

        // add update all the expense type transactions
        let totalSpent = 0;
        let transactions = userAccount?.transactions?.filter(item => item.category.type === 1 && item.budget?.id === budget?.id);
        transactions?.forEach(transaction => {
            totalSpent += transaction.amount;
        });
        
        return totalBudget - totalSpent;
    }

    async getTotalIncomeExpenseForBudget(account: Account, budget?: Budget) {
        const userAccount = account;
        if (budget === undefined) {
            budget = await this.getCurrentBudget(userAccount as Account);
        }

        // add update all income transactions from account
        let totalIncome = 0;
        let incomeTransactions = userAccount?.transactions?.filter(item => item.category.type === 0 && item.budget?.id === budget?.id);
        incomeTransactions?.forEach(transaction => {
            totalIncome += transaction.amount;
        });

        let totalExpense = 0;
        let expenseTransactions = userAccount?.transactions?.filter(item => item.category.type === 1 && item.budget?.id === budget?.id);
        expenseTransactions?.forEach(transaction => {
            totalExpense += transaction.amount;
        });

        return {totalIncome, totalExpense};
    }

    async createNewBudget(account: Account) {
        // get the last budget end date and add 1 day. THen take the pay period for the account and add that to the start date
        
        //sort budget by end date -- get the last one
        const budget = account.budgets?.sort((a, b) => {
            return b.endDate.getTime() - a.endDate.getTime();
        })[0];

        //get the pay period for the account
        const budgetPeriod = account.budgetPeriod;
        const newBudget = this.handleFrequency(budgetPeriod.frequency, new Budget(), (budget as Budget));
        newBudget.account = account;
        newBudget.budgetCategories = budget?.budgetCategories || [];

        return await this.budgetRepository.save(newBudget);
    }

    async getBudgetPeriods() {
        return await this.budgetPeriodRepository.find();
    }

    async getBudgetPeriodById(id: string) {
        return await this.budgetPeriodRepository.findOne({ where: { id: id } });
    }

    async getBudgetPeriodByFrequency(frequency: Frequency) {
        return await this.budgetPeriodRepository.findOne({ where: { frequency: frequency } });
    }

    async getSpentAmountForCategory(category: Category, budgetId: string) {
        const budget = await this.getBudgetById(budgetId);
        const transactions = budget?.account?.transactions?.filter(transaction => transaction.category.id === category.id) || [];
        const spent = transactions.reduce((total, transaction) => {
            return total + transaction.amount;
        }, 0)
        return spent
    }

    private handleFrequency(budgetPeriod: Frequency, newBudget: Budget, prevBudget: Budget) {
        
        // using moment, using the frequency, add the appropriate amount of time to the prevBudget endDate and start date
        const endDate = moment(prevBudget.endDate);

        switch (budgetPeriod) {
            case Frequency.Weekly:
                newBudget.startDate = endDate.add(1, 'days').toDate();
                newBudget.endDate = endDate.add(1, 'weeks').toDate();
                break;
            case Frequency.BiWeekly:
                newBudget.startDate = endDate.add(1, 'days').toDate();
                newBudget.endDate = endDate.add(2, 'weeks').toDate();
                break;
            case Frequency.Monthly:
                newBudget.startDate = endDate.add(1, 'days').toDate();
                newBudget.endDate = endDate.add(1, 'month').toDate();
                break;
            case Frequency.Quarterly:
                newBudget.startDate = endDate.add(1, 'days').toDate();
                newBudget.endDate = endDate.add(3, 'month').toDate();
                break;
            default:
                break;
        }

        return newBudget;
    }
}
