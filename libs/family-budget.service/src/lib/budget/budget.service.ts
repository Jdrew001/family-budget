import { Account, Budget, BudgetCategoryAmount, BudgetPeriod, BudgetReportModel, BudgetSummaryDto, Category, CreateAccountDto, Frequency } from '@family-budget/family-budget.model';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as moment from 'moment-timezone';
import { DateUtils } from '../util/date-util';
import * as _ from 'lodash';
import { CoreService } from '../core/core.service';

@Injectable()
export class BudgetService {

    get currentUser() { return this.coreService.currentUser; }

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
        const currentDate = moment.tz(new Date(), user.timezone as string).startOf('day'); // Use startOf('day') to set the time to midnight
        const budgets = account?.budgets?.filter(budget => {
            const startDate = moment.tz(budget.startDate, user.family?.timezone as string).startOf('day');
            const endDate = moment.tz(budget.endDate, user.family?.timezone as string).endOf('day');
            return currentDate.isSameOrAfter(startDate) && currentDate.isSameOrBefore(endDate);
        }) as Budget[];
        if (account.budgetPeriod && budgets.length === 0) {
            return await this.createNewBudget(account);
        }
        return budgets[0] || null;
    }

    async getWhatsLeftToSpend(account: Account, budget?: Budget) {
        const userAccount = account;
        if (budget === undefined) {
            budget = await this.getCurrentBudget(userAccount as Account);
        }
        const budgetSummary = await this.getBudgetSummary(budget?.id as string);
        
        return budgetSummary;
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

    async updateStartAndEndDate(budget: Budget, account: CreateAccountDto) {
        const startDate = moment.tz(new Date(account.startDate), this.currentUser.family?.timezone as string).startOf('day').toDate();
        const endDate = DateUtils.calculateEndDate(
            new Date(account.startDate), 
            account.frequency,
            this.currentUser.family?.timezone as string).toDate();
        budget.startDate = startDate;
        budget.endDate = endDate;

        return await this.budgetRepository.save(budget);
    }
    
    async activateBudget(budget: Budget) {
        budget.activeInd = true;
        return await this.budgetRepository.save(budget);
    }

    async getSpendAmountForCategoryQuery(category: Category, budgetId: string) {
        if (!category || !budgetId) return [];
        const result = this.budgetRepository.query(`
            SELECT * FROM CALCULATE_CATEGORY_BUDGET($1, $2);
        `, [category.id, budgetId]);

        return result as Promise<Array<BudgetCategoryAmount>>;
    }

    async getBudgetSummary(budgetId: string): Promise<BudgetSummaryDto> {
        if (!budgetId) return new BudgetSummaryDto(0, 0, 0);
        const result = await this.budgetRepository.query(`
            SELECT * FROM CALCULATE_BUDGET_SUMMARY($1);
        `, [budgetId]);

        return new BudgetSummaryDto(
            result[0]['remainingBudget'],
            result[0]['totalBudget'],
            result[0]['totalSpent']
        );
    }

    async getBudgetReports(budgetIds: Array<string>): Promise<{ [x: string]: BudgetReportModel[] }> {
        if (!budgetIds || budgetIds.length === 0) return {};
        
        const nonDuplicates = [...new Set(budgetIds)];
        const reports: { [x: string]: BudgetReportModel[] } = {};
      
        const promises = nonDuplicates.map(async (id) => {
          const result = (await this.budgetRepository.query(`
            SELECT * FROM generate_budget_report($1);
          `, [id])).map((item: any) => {
            return new BudgetReportModel(
                item['categoryId'],
                item['amountBudgeted'],
                item['amountSpent'],
                item['categoryName'],
                item['difference']
                );
            });
      
          reports[id] = result;
        });
      
        await Promise.all(promises);
      
        return reports;
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
