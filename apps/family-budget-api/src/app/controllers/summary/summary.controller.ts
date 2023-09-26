import { CurrentBudgetSummary, SummaryAccountBalance, SummaryTransactions } from '@family-budget/family-budget.model';
import { BudgetService, DateUtils, TransactionService } from '@family-budget/family-budget.service';
import { Controller, Get, Param } from '@nestjs/common';
import { AccountService } from 'libs/family-budget.service/src/lib/account/account.service';

@Controller('summary')
export class SummaryController {

    mockUser = 'aac96db3-0e26-479f-a7e0-1832aef1b6a8';

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
        const startDate = new Date(budget.startDate)
        const endDate = new Date(budget.endDate);
        const timeDiff = endDate.getTime() - startDate.getTime();
        const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        return {
            id: budget.id,
            displayDate: displayDate,
            leftSpendingAmount: whatsLeftToSpend.toString(),
            leftSpendingDays: daysLeft,
            income: {
                amount: totalIncomeExpense.totalIncome.toString(),
                icon: 'fa fa-plus'
            },
            expense: {
                amount: totalIncomeExpense.totalExpense.toString(),
                icon: 'fa fa-minus'
            }
        }
    }

    @Get('accountBalances')
    async getAccountBalances(): Promise<SummaryAccountBalance[]> {
        const accountBalances = await this.accountService.getAccountBalancesForUser(this.mockUser);
        return accountBalances.map(account => {
            return {
                id: account.accountId,
                name: account.accountName,
                icon: 'fa fa-university',
                amount: account.balance.amount.toString()
            }
        });
    }

    @Get('transactions/:accountId')
    async getAccountTransactions(@Param('accountId') accountId: string): Promise<SummaryTransactions[]> {
        const transactions = await this.transactionService.getRecentTransactionsForAccount(accountId, 7);
        return transactions.map(transaction => {
            return {
                id: transaction.id,
                date: DateUtils.getShortDate(transaction.createdAt.toDateString()),
                amount: transaction.amount.toString(),
                description: transaction.description,
                category: transaction.category.name,
                categoryIcon: '',
                transactionType: transaction.category.type == 0 ? 0 : 1
            } as SummaryTransactions;
        });
    }
}
