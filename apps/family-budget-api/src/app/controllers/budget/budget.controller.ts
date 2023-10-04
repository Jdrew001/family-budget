import { LeftSpendingManage } from '@family-budget/family-budget.model';
import { BudgetService, CategoryService, DateUtils, TransactionService } from '@family-budget/family-budget.service';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AccessTokenGuard } from '../../guards/access-token.guard';

@UseGuards(AccessTokenGuard)
@Controller('budget')
export class BudgetController {

    constructor(
        private readonly budgetService: BudgetService,
        private readonly categoryservice: CategoryService
    ) { }

    @Get('getSummaryBudget/:budgetId')
    async getBudgetSummary(@Req() request: Request) {
        const budgetId = request.params.budgetId;
        const budget = await this.budgetService.getBudgetById(budgetId);
        const totalExpenses = (await this.budgetService.getTotalIncomeExpenseForBudget(budget.account, budget)).totalExpense;
        const endDate = new Date(budget.endDate);
        const timeDiff = endDate.getTime() - new Date().getTime();
        const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
        const leftSpendingAmount = await this.budgetService.getWhatsLeftToSpend(budget.account, budget)
        const expenseBudgetAmount = budget.budgetCategories.filter(o => o.category.type == 1).reduce((total, category) => {
            return total + category.amount;
        }, 0);
        const percentageSpent = expenseBudgetAmount > 0 ? totalExpenses / expenseBudgetAmount: 0;

        const response: LeftSpendingManage = {
            id: budgetId,
            displayDate: DateUtils.getShortDateString(budget.startDate.toDateString(), budget.endDate.toDateString()),
            leftSpendingAmount: leftSpendingAmount.toString(),
            leftSpendingDays: daysLeft,
            percentageSpent: percentageSpent,
            totalSpent: totalExpenses.toString(),
            totalBudget: expenseBudgetAmount.toString()
        }

        return response;
    }

    @Get('getTransactionsForBudget/:budgetId')
    async getTransactionForBudget(@Req() req: Request) {
        const budgetId = req.params.budgetId;
        const budget = await this.budgetService.getBudgetById(budgetId);
        const result = await Promise.all(budget.budgetCategories.map(async budgetCategory => {
            const spent = await this.budgetService.getSpentAmountForCategory(budgetCategory.category, budget.id)
            return {
                id: budgetCategory.id,
                name: budgetCategory.category.name,
                budgetAmount: budgetCategory.amount,
                type: budgetCategory.category.type,
                spentAmount: spent,
                remainingAmount: budgetCategory.amount - spent,
                showRed: budgetCategory.amount - spent < 0
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
