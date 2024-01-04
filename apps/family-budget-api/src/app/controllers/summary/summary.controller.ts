import { CategoryType, CurrentBudgetSummary, SummaryAccountBalance, SummaryTransactions, SummaryWrapperDto } from '@family-budget/family-budget.model';
import { BudgetService, CoreService, DateUtils, TransactionService, UserService } from '@family-budget/family-budget.service';
import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { AccountService } from 'libs/family-budget.service/src/lib/account/account.service';
import { AccessTokenGuard } from '../../guards/access-token.guard';
import moment from 'moment';

@UseGuards(AccessTokenGuard)
@Controller('summary')
export class SummaryController {

    get currentUser() { return this.coreService.currentUser; }

    constructor(
        private readonly budgetService: BudgetService,
        private readonly accountService: AccountService,
        private readonly transactionService: TransactionService,
        private readonly userService: UserService,
        private readonly coreService: CoreService
    ) { }

    @Get('currentBudget/:accountId')
    async getCurrentBudgetSummary(@Param('accountId') accountId: string): Promise<SummaryWrapperDto> {
        const account = await this.accountService.getAccountById(accountId);
        const budget = await this.budgetService.getCurrentBudget(account);

        // TODO: Improve this logic
        if (budget === null) {
            const accountTotal = await this.accountService.getAccountTotal(accountId);
            return {
                currentBudgetSummary: {
                    income: {
                        amount: accountTotal?.income.toString(),
                        icon: 'profit'
                    },
                    expense: {
                        amount: accountTotal?.expense.toString(),
                        icon: 'expense'
                    }
                },
                accountType: account.accountType.name
            } as SummaryWrapperDto;
        } 

        const whatsLeftToSpend = await this.budgetService.getWhatsLeftToSpend(account, budget);
        const totalIncomeExpense = await this.budgetService.getTotalIncomeExpenseForBudget(account, budget);
        
        const displayDate = DateUtils.getShortDateString(
            budget.startDate, 
            budget.endDate,
            this.currentUser.family.timezone as string);
        const endDate = new Date(budget.endDate);
        const daysLeft = DateUtils.daysLeftCalculation(endDate, this.currentUser.family.timezone as string);

        const currentValue = whatsLeftToSpend.totalSpent / whatsLeftToSpend.totalBudget * 100;
        const summaryData = {
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
        } as CurrentBudgetSummary;
        return {
            currentBudgetSummary: summaryData,
            accountType: account.accountType.name
        } as SummaryWrapperDto;
    }

    @Get('transactions/:accountId')
    async getAccountTransactions(@Param('accountId') accountId: string): Promise<SummaryTransactions[]> {
        const transactions = await this.transactionService.getRecentTransactionsForAccount(accountId, 5);

        return await Promise.all(
            transactions.map(async transaction => {
                const multiplyBy = transaction.category.type == CategoryType.Expense ? -1 : 1;
                const amount = (transaction.amount * multiplyBy).toString();
                const categoryBudgetAmount = await this.budgetService.getCategoryBudgetAmount(transaction?.budget?.id, transaction?.category?.id);
                const categorySpentAmount = (await this.budgetService.getSpendAmountForCategoryQuery(transaction.category, transaction?.budget?.id))[0];
                const currentValue = categoryBudgetAmount > 0 ? (categorySpentAmount?.amount / categoryBudgetAmount) * 100 : 0;
                const user = await this.userService.findById(transaction.createdBy);
                return {
                    id: transaction.id,
                    date: DateUtils.getShortDate(
                        transaction.createdAt,
                        this.currentUser.family.timezone as string),
                    amount: amount,
                    description: transaction.description,
                    categoryName: transaction.category.name,
                    categoryIcon: transaction.category.icon,
                    showRed: transaction.category.type == CategoryType.Expense,
                    transactionType: transaction.category.type == 0 ? 0 : 1,
                    addedBy: `${user.firstname} ${user.lastname}`,
                    circleGuage: {
                        minValue: 0,
                        maxValue: 100,
                        currentValue: currentValue > 100 ? 100 : currentValue,
                        showRed: transaction.category.type == CategoryType.Expense ? currentValue > 100: false,
                        icon: transaction.category.icon
                    }
                } as SummaryTransactions;
            })
        );
    }
}
