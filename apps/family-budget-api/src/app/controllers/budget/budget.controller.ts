import { CategoryType, LeftSpendingManage } from '@family-budget/family-budget.model';
import { BudgetService, CategoryService, CoreService, DateUtils, UserService } from '@family-budget/family-budget.service';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AccessTokenGuard } from '../../guards/access-token.guard';
import { AccountService } from 'libs/family-budget.service/src/lib/account/account.service';

@UseGuards(AccessTokenGuard)
@Controller('budget')
export class BudgetController {

    get currentUser() { return this.coreService.currentUser; }

    constructor(
        private readonly budgetService: BudgetService,
        private readonly categoryservice: CategoryService,
        private readonly userService: UserService,
        private readonly coreService: CoreService,
        private readonly accountService: AccountService
    ) { }

    @Get('getAllBudgets')
    async getAllBudgets(@Req() req: Request) {
        const family = await this.userService.findFamilyForUser(this.currentUser.id);
        const accounts = family.accounts.filter(account => account.activeInd);
        const budgets = await this.budgetService.fetchBudgetsFromAccounts(accounts);
        const orderOfAccounts = await this.accountService.getUserAccountsOrder();
        const leftSpendingAmounts: Array<LeftSpendingManage> = [];

        await Promise.all(budgets.map(async data => {
            const endDate = new Date(data.budget.endDate);
            const daysLeft = DateUtils.daysLeftCalculation(endDate, this.currentUser.family?.timezone as string);
            const leftSpendingAmount = await this.budgetService.getWhatsLeftToSpend(data.account, data.budget)
            const percentageSpent = leftSpendingAmount.totalBudget > 0 ? leftSpendingAmount.totalSpent / leftSpendingAmount.totalBudget: 0;
            leftSpendingAmounts.push({
                accountId: data.account.id,
                accountName: data.account.name,
                id: data.budget.id,
                displayDate: DateUtils.getShortDateString(
                    data.budget.startDate, 
                    data.budget.endDate,
                    this.currentUser.family.timezone as string),
                leftSpendingAmount: leftSpendingAmount.whatsLeft.toString(),
                leftSpendingDays: daysLeft,
                percentageSpent: percentageSpent,
                totalSpent: leftSpendingAmount.totalSpent.toString(),
                totalBudget: leftSpendingAmount.totalBudget.toString(),
            })
        }));

        return leftSpendingAmounts.sort((a, b) => 
            orderOfAccounts.indexOf(a.accountId) - orderOfAccounts.indexOf(b.accountId));
    }

    @Get('getSummaryBudget/:budgetId')
    async getBudgetSummary(@Req() request: Request) {
        const budgetId = request.params.budgetId;
        const budget = await this.budgetService.getBudgetById(budgetId);
        const totalExpenses = (await this.budgetService.getTotalIncomeExpenseForBudget(budget.account, budget)).totalExpense;
        const endDate = new Date(budget.endDate);
        const daysLeft = DateUtils.daysLeftCalculation(endDate, this.currentUser.family?.timezone as string);
        const leftSpendingAmount = await this.budgetService.getWhatsLeftToSpend(budget.account, budget)
        const expenseBudgetAmount = budget.budgetCategories.filter(o => o.category.type == 1).reduce((total, category) => {
            return total + category.amount;
        }, 0);
        const percentageSpent = expenseBudgetAmount > 0 ? totalExpenses / expenseBudgetAmount: 0;

        const response: LeftSpendingManage = {
            id: budgetId,
            displayDate: DateUtils.getShortDateString(
                budget.startDate, 
                budget.endDate,
                this.currentUser.family.timezone as string),
            leftSpendingAmount: leftSpendingAmount.whatsLeft.toString(),
            leftSpendingDays: daysLeft,
            percentageSpent: percentageSpent,
            totalSpent: totalExpenses.toString(),
            totalBudget: expenseBudgetAmount.toString(),
            totalSpentIcon: 'money-5',
            totalBudgetIcon: 'budget'
        }

        return response;
    }

    // TODO: Refactor to improve performance!!
    @Get('getTransactionsForBudget/:budgetId')
    async getTransactionForBudget(@Req() req: Request) {
        const budgetId = req.params.budgetId;
        const budget = await this.budgetService.getBudgetById(budgetId);
        const budgetCategoryReports = await this.budgetService.getBudgetReports([budgetId]);
        const result = await Promise.all(budget.budgetCategories.map(async budgetCategory => {
            const categoryReport = budgetCategoryReports[budgetId]?.find(o => o.categoryId == budgetCategory?.category?.id) ?? null;
            const currentValue = categoryReport && categoryReport?.amountBudgeted > 0 ? (categoryReport?.amountSpent / categoryReport?.amountBudgeted) * 100 : 0; 
            return {
                id: budgetCategory.id,
                name: budgetCategory.category.name,
                budgetAmount: budgetCategory.amount,
                type: budgetCategory.category.type,
                spentAmount: categoryReport?.amountSpent || 0 ,
                remainingAmount: categoryReport?.difference,
                showRed: categoryReport?.difference < 0,
                circleGuage: {
                    minValue: 0,
                    maxValue: 100,
                    currentValue: !currentValue ? 0: currentValue > 100 ? 100 : currentValue,
                    showRed: budgetCategory.category.type == CategoryType.Expense ? currentValue > 100: false,
                    icon: budgetCategory?.category?.icon
                }
            }
        }));
        // sort by type income at the top and name aplhabetically
        return result.sort((a, b) => {
            return a.type - b.type || a.name.localeCompare(b.name);
        });
    }

    @Get('categoriesForBudgetUnselected/:budgetId')
    async getCategoriesForBudgetNotSelected(@Req() req: Request) {
        const userId = req.user['sub'];
        const budgetId = req.params.budgetId;
        const budget = await this.budgetService.getBudgetById(budgetId);
        const categories = await this.categoryservice.fetchCategoriesForUser(userId);

        // filter out categories that are already in the budget
        const result = categories.filter(category => {
            return budget.budgetCategories.filter(budgetCategory => budgetCategory.category.id === category.id).length == 0;
        });

        // sort by type and name aplhabetically
        return result.sort((a, b) => {
            return a.type - b.type || a.name.localeCompare(b.name);
        });
    }
}
