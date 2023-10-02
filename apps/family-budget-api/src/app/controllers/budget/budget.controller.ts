import { BudgetService, DateUtils, TransactionService } from '@family-budget/family-budget.service';
import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('budget')
export class BudgetController {

    constructor(
        private readonly budgetService: BudgetService,
        private readonly transactionService: TransactionService
    ) { }

    @Get('getSummaryBudget/:budgetId')
    async getBudgetSummary(@Req() request: Request) {
        const budgetId = request.params.budgetId;
        const budget = await this.budgetService.getBudgetById(budgetId);
        const transactionsForBudget = await this.transactionService.getTransactionsForBudget(budget);
        const expenseTransactions = transactionsForBudget.filter(transaction => transaction.category.type === 1);
        const startDate = new Date(budget.startDate)
        const endDate = new Date(budget.endDate);
        const timeDiff = endDate.getTime() - startDate.getTime();
        const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
        const leftSpendingAmount = await this.budgetService.getWhatsLeftToSpend(budget.account, budget)
        const expenseBudgetAmount = budget.budgetCategories.filter(o => o.category.type == 1).reduce((total, category) => {
            return total + category.amount;
        }, 0)

        const response = {
            id: budgetId,
            displayDate: DateUtils.getShortDateString(budget.startDate.toDateString(), budget.endDate.toDateString()),
            leftSpendingAmount: leftSpendingAmount.toString(),
            leftSpendingDays: daysLeft,
            percentageSpent: expenseBudgetAmount > 0 ? Math.round(leftSpendingAmount / expenseBudgetAmount): 0,
            totalSpent: expenseTransactions.reduce((total, transaction) => {
                return total + transaction.amount;
            }, 0).toString(),
            totalBudget: expenseBudgetAmount.toString()
        }

        return response;
    }
}
