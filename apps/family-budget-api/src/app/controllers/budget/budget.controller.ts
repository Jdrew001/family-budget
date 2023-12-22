import { LeftSpendingManage } from '@family-budget/family-budget.model';
import { BudgetService, CategoryService, CoreService, DateUtils, UserService } from '@family-budget/family-budget.service';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AccessTokenGuard } from '../../guards/access-token.guard';

@UseGuards(AccessTokenGuard)
@Controller('budget')
export class BudgetController {

    get currentUser() { return this.coreService.currentUser; }

    constructor(
        private readonly budgetService: BudgetService,
        private readonly categoryservice: CategoryService,
        private readonly userService: UserService,
        private readonly coreService: CoreService
    ) { }

    @Get('getAllBudgets')
    async getAllBudgets(@Req() req: Request) {
        const family = await this.userService.findFamilyForUser(this.currentUser.id);
        const accounts = family.accounts.filter(account => account.activeInd);
        const budgets = await this.budgetService.fetchBudgetsFromAccounts(accounts);
        const leftSpendingAmounts: Array<LeftSpendingManage> = [];

        await Promise.all(budgets.map(async data => {
            const endDate = new Date(data.budget.endDate);
            const daysLeft = DateUtils.daysLeftCalculation(endDate);
            const leftSpendingAmount = await this.budgetService.getWhatsLeftToSpend(data.account, data.budget)
            const percentageSpent = leftSpendingAmount.totalBudget > 0 ? leftSpendingAmount.totalSpent / leftSpendingAmount.totalBudget: 0;
            leftSpendingAmounts.push({
                accountId: data.account.id,
                accountName: data.account.name,
                id: data.budget.id,
                displayDate: DateUtils.getShortDateString(data.budget.startDate.toDateString(), data.budget.endDate.toDateString()),
                leftSpendingAmount: leftSpendingAmount.whatsLeft.toString(),
                leftSpendingDays: daysLeft,
                percentageSpent: percentageSpent,
                totalSpent: leftSpendingAmount.totalSpent.toString(),
                totalBudget: leftSpendingAmount.totalBudget.toString(),
            })
        }));

        return leftSpendingAmounts;
    }

    @Get('getSummaryBudget/:budgetId')
    async getBudgetSummary(@Req() request: Request) {
        const budgetId = request.params.budgetId;
        const budget = await this.budgetService.getBudgetById(budgetId);
        const totalExpenses = (await this.budgetService.getTotalIncomeExpenseForBudget(budget.account, budget)).totalExpense;
        const endDate = new Date(budget.endDate);
        const daysLeft = DateUtils.daysLeftCalculation(endDate);
        const leftSpendingAmount = await this.budgetService.getWhatsLeftToSpend(budget.account, budget)
        const expenseBudgetAmount = budget.budgetCategories.filter(o => o.category.type == 1).reduce((total, category) => {
            return total + category.amount;
        }, 0);
        const percentageSpent = expenseBudgetAmount > 0 ? totalExpenses / expenseBudgetAmount: 0;

        const response: LeftSpendingManage = {
            id: budgetId,
            displayDate: DateUtils.getShortDateString(budget.startDate.toDateString(), budget.endDate.toDateString()),
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

    @Get('getTransactionsForBudget/:budgetId')
    async getTransactionForBudget(@Req() req: Request) {
        const budgetId = req.params.budgetId;
        const budget = await this.budgetService.getBudgetById(budgetId);
        const result = await Promise.all(budget.budgetCategories.map(async budgetCategory => {
            const categoryBudgetAmount = await this.budgetService.getCategoryBudgetAmount(budget.id, budgetCategory.category.id);
            const categorySpentAmount = (await this.budgetService.getSpendAmountForCategoryQuery(budgetCategory.category, budget.id))[0];
            const currentValue = categoryBudgetAmount > 0 ? (categorySpentAmount?.amount / categoryBudgetAmount) * 100 : 0;
            return {
                id: budgetCategory.id,
                name: budgetCategory.category.name,
                budgetAmount: budgetCategory.amount,
                type: budgetCategory.category.type,
                spentAmount: categorySpentAmount?.amount || 0,
                remainingAmount: budgetCategory.amount - (categorySpentAmount?.amount || 0),
                showRed: budgetCategory.amount - categorySpentAmount?.amount < 0,
                circleGuage: {
                    minValue: 0,
                    maxValue: 100,
                    currentValue: !currentValue ? 0: currentValue > 100 ? 100 : currentValue,
                    showRed: currentValue > 100,
                    icon: budgetCategory?.category?.icon
                }
            }
        }));
        return result;
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
