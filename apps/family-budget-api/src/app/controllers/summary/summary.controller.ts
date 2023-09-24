import { CurrentBudgetSummary, SummaryAccountBalance, SummaryTransactions } from '@family-budget/family-budget.model';
import { Controller, Get, Param } from '@nestjs/common';

@Controller('summary')
export class SummaryController {


    @Get('currentBudget')
    getCurrentBudgetSummary(): CurrentBudgetSummary {
        return {
            displayDate: 'Sep 23 - Sep 28',
            leftSpendingAmount: '1000.00',
            leftSpendingDays: 10,
            income: {
                amount: '2000.00',
                icon: 'fa fa-plus'
            },
            expense: {
                amount: '1000.00',
                icon: 'fa fa-minus'
            }
        }
    }

    @Get('accountBalances')
    getAccountBalances(): SummaryAccountBalance[] {
        return [
            {
                name: 'Checking',
                icon: 'fa fa-university',
                amount: '1000.00'
            },
            {
                name: 'Savings',
                icon: 'fa fa-piggy-bank',
                amount: '2000.00'
            },
            {
                name: 'Credit Card',
                icon: 'fa fa-credit-card',
                amount: '3000.00'
            }
        ]
    }

    @Get('transactions/:accountId')
    getAccountTransactions(@Param('accountId') accountId: string): SummaryTransactions[] {
        return [
            {
                date: 'Sep 23',
                amount: '100.00',
                description: 'Walmart',
                category: 'Groceries',
                categoryIcon: 'fa fa-shopping-cart',
                transactionType: 1
            },
            {
                date: 'Sep 23',
                amount: '100.00',
                description: 'Walmart',
                category: 'Groceries',
                categoryIcon: 'fa fa-shopping-cart',
                transactionType: 1
            },
            {
                date: 'Sep 23',
                amount: '100.00',
                description: 'Walmart',
                category: 'Groceries',
                categoryIcon: 'fa fa-shopping-cart',
                transactionType: 1
            },
            {
                date: 'Sep 23',
                amount: '100.00',
                description: 'Walmart',
                category: 'Groceries',
                categoryIcon: 'fa fa-shopping-cart',
                transactionType: 1
            },
            {
                date: 'Sep 23',
                amount: '100.00',
                description: 'Walmart',
                category: 'Groceries',
                categoryIcon: 'fa fa-shopping-cart',
                transactionType: 1
            },
            {
                date: 'Sep 23',
                amount: '100.00',
                description: 'Walmart',
                category: 'Groceries',
                categoryIcon: 'fa fa-shopping-cart',
                transactionType: 1
            },
            {
                date: 'Sep 23',
                amount: '100.00',
                description: 'Walmart',
                category: 'Groceries',
                categoryIcon: 'fa fa-shopping-cart',
                transactionType: 1
            }
        ]
    }
}
