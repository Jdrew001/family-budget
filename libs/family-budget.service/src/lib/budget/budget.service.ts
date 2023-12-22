import { Account, Budget, BudgetCategoryAmount, BudgetPeriod, Category, Frequency } from '@family-budget/family-budget.model';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as moment from 'moment-timezone';
import { DateUtils } from '../util/date-util';
import * as _ from 'lodash';
import { CoreService } from '../core/core.service';

@Injectable()
export class BudgetService {

    constructor(
        @Inject('BudgetRepository') private readonly budgetRepository: Repository<Budget>,
        @Inject('BudgetPeriodRepository') private readonly budgetPeriodRepository: Repository<BudgetPeriod>,
        private readonly coreService: CoreService
    ) { }

    async fetchBudgetsFromAccounts(accounts: Array<Account>) {
        let budgets: Array<{account: Account, budget: Budget}> = [];
        await Promise.all(accounts.map(async account => {
          const latestBudget = await this.budgetRepository.findOne({
            where: { account: account },
            order: { endDate: 'DESC' },
            relations: [
                'budgetCategories', 
                'budgetCategories.category', 
                'account', 'account.transactions', 
                'account.transactions.budget', 
                'account.transactions.category']
          });
          if (latestBudget) {
            const nAccount = latestBudget.account as Account;
            budgets.push({account: nAccount, budget: latestBudget});
          }
        }));
        return budgets;
      }

    async getBudgetById(id: string) {
        return await this.budgetRepository.findOne({ where: { id: id }, relations: ['budgetCategories', 'budgetCategories.category', 'account', 'account.transactions', 'account.transactions.budget', 'account.transactions.category'] });
    }

    async getCurrentBudget(account: Account) {
        const user = await this.coreService.currentUser;
        const currentDate = moment.tz(new Date(), user.timezone as string);
        const budgets = account?.budgets?.filter(budget => {
            const startDate = DateUtils.getYYYYMMDD(budget.startDate.toDateString());
            const endDate = DateUtils.getYYYYMMDD(budget.endDate.toDateString());
            const mStartDate = moment.tz(startDate, user.timezone as string).startOf('day');
            const mEndDate = moment.tz(endDate, user.timezone as string).endOf('day');
            Logger.log(`Current Date: ${currentDate.format('YYYY-MM-DD HH:mm:ss')} Start Date: ${mStartDate.format('YYYY-MM-DD HH:mm:ss')} End Date: ${mEndDate.format('YYYY-MM-DD HH:mm:ss')}`);
            return currentDate.isSameOrAfter(mStartDate) && currentDate.isSameOrBefore(mEndDate);
        }) as Budget[];
        if (account.budgetPeriod && budgets.length == 0) {
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
            // Only consider the transaction if it's in a budgeted category
            if (categories.find(budgetCategory => budgetCategory.category.id === transaction.category.id)) {
                totalSpent += transaction.amount;
            }
        });
        
        return {whatsLeft: totalBudget - totalSpent, totalBudget, totalSpent};
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
        })[0] as Budget;

        this.markInactiveBudget(budget);

        //get the pay period for the account
        const budgetPeriod = account.budgetPeriod;
        const newBudget = await this.handleFrequency(budgetPeriod.frequency, new Budget(), (budget as Budget));
        newBudget.account = account;
        newBudget.budgetCategories = [];
        return await this.budgetRepository.save(newBudget);
    }

    async markInactiveBudget(budget: Budget) {
        if (budget) {
            budget.activeInd = false;
            await this.budgetRepository.save(budget);
        }
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

    async getCategoryBudgetAmount(budgetId: string, categoryId: string) {
        if (!budgetId || !categoryId) return 0;
        const budget = await this.getBudgetById(budgetId);
        const categoryBudget = budget?.budgetCategories?.find(category => category.category.id === categoryId);
        return categoryBudget?.amount || 0;
    }

    async getSpendAmountForCategoryQuery(category: Category, budgetId: string) {
        if (!category || !budgetId) return null;
        const result = this.budgetRepository.query(`
            SELECT * FROM CALCULATE_CATEGORY_BUDGET($1, $2);
        `, [category.id, budgetId]);

        return result as Promise<Array<BudgetCategoryAmount>>;
    }

    private async handleFrequency(budgetPeriod: Frequency, newBudget: Budget, prevBudget: Budget) {
        const user = await this.coreService.currentUser;
        
        // using moment, using the frequency add the appropriate amount of time to the prevBudget endDate and start date
        const startDate = moment.utc(prevBudget.startDate, user.timezone as string).startOf('day');
        const endDate = moment.utc(prevBudget.endDate, user.timezone as string).endOf('day');

        switch (budgetPeriod) {
            case Frequency.Weekly:
                newBudget.startDate = _.clone(startDate).startOf('day').add(1, 'weeks').toDate();
                newBudget.endDate = _.clone(endDate).add(1, 'weeks').toDate();
                break;
            case Frequency.BiWeekly:
                newBudget.startDate = _.clone(startDate).startOf('day').add(2, 'weeks').toDate();
                newBudget.endDate = _.clone(endDate).add(2, 'weeks').toDate();
                break;
            case Frequency.Monthly:
                newBudget.startDate = _.clone(startDate).startOf('day').add(1, 'month').toDate();
                newBudget.endDate = _.clone(endDate).add(1, 'month').toDate();
                break;
            case Frequency.Quarterly:
                newBudget.startDate = _.clone(startDate).startOf('day').add(3, 'month').toDate();
                newBudget.endDate = _.clone(endDate).add(3, 'month').toDate();
                break;
            default:
                break;
        }

        Logger.log(`Start Date: ${newBudget.startDate} End Date: ${newBudget.endDate}`);

        return newBudget;
    }
}
