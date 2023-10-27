import { CategoryType, CurrentBudgetSummary, SummaryAccountBalance, SummaryTransactions } from '@family-budget/family-budget.model';
import { BudgetService, DateUtils, TransactionService } from '@family-budget/family-budget.service';
import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { AccountService } from 'libs/family-budget.service/src/lib/account/account.service';
import { AccessTokenGuard } from '../../guards/access-token.guard';
import moment from 'moment';

@UseGuards(AccessTokenGuard)
@Controller('summary')
export class SummaryController {

    constructor(
        private readonly budgetService: BudgetService,
        private readonly accountService: AccountService,
        private readonly transactionService: TransactionService
    ) { }

    @Get('currentBudget/:accountId')
    async getCurrentBudgetSummary(@Param('accountId') accountId: string): Promise<CurrentBudgetSummary> {
        const account = await this.accountService.getAccountById(accountId);
        const budget = await this.budgetService.getCurrentBudget(account);

        // TODO: Improve this logic
        if (budget === null) return null;

        const whatsLeftToSpend = await this.budgetService.getWhatsLeftToSpend(account, budget);
        const totalIncomeExpense = await this.budgetService.getTotalIncomeExpenseForBudget(account, budget);
        
        const displayDate = DateUtils.getShortDateString(budget.startDate.toDateString(), budget.endDate.toDateString());
        const endDate = moment.utc(budget.endDate);
        const timeDiff = endDate.diff(moment(), 'milliseconds');
        const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

        const currentValue = whatsLeftToSpend.totalSpent / whatsLeftToSpend.totalBudget * 100;
        
        return {
            id: budget.id,
            displayDate: displayDate,
            leftSpendingAmount: whatsLeftToSpend.whatsLeft.toString(),
            leftSpendingDays: daysLeft,
            showBudgetError: budget.budgetCategories.length == 0,
            circleGuage: {
                minValue: 0,
                maxValue: 100,
                currentValue: currentValue > 100 ? 100 : currentValue,
                showRed: currentValue > 100,
                icon: 'money-6'
            },
            income: {
                amount: totalIncomeExpense.totalIncome.toString(),
                icon: 'profit'
            },
            expense: {
                amount: totalIncomeExpense.totalExpense.toString(),
                icon: 'expense'
            }
        }
    }

    @Get('transactions/:accountId')
    async getAccountTransactions(@Param('accountId') accountId: string): Promise<SummaryTransactions[]> {
        const transactions = await this.transactionService.getRecentTransactionsForAccount(accountId, 5);

        return await Promise.all(
            transactions.map(async transaction => {
                const multiplyBy = transaction.category.type == CategoryType.Expense ? -1 : 1;
                const amount = (transaction.amount * multiplyBy).toString();
                const categoryBudgetAmount = await this.budgetService.getCategoryBudgetAmount(transaction.budget.id, transaction.category.id);
                const categorySpentAmount = await this.budgetService.getSpentAmountForCategory(transaction.category, transaction.budget.id);
                const currentValue = categoryBudgetAmount > 0 ? (categorySpentAmount / categoryBudgetAmount) * 100 : 0;
                return {
                    id: transaction.id,
                    date: DateUtils.getShortDate(transaction.createdAt.toDateString()),
                    amount: amount,
                    description: transaction.description,
                    category: transaction.category.name,
                    categoryIcon: '',
                    showRed: transaction.category.type == CategoryType.Expense,
                    transactionType: transaction.category.type == 0 ? 0 : 1,
                    circleGuage: {
                        minValue: 0,
                        maxValue: 100,
                        currentValue: currentValue > 100 ? 100 : currentValue,
                        showRed: currentValue > 100,
                        icon: transaction.category.icon
                    }
                } as SummaryTransactions;
            })
        );
    }
}
