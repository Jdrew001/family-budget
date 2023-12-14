import { BudgetService, CategoryService, DateUtils, TransactionService } from '@family-budget/family-budget.service';
import { Controller, Get, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AccountService } from 'libs/family-budget.service/src/lib/account/account.service';
import { AccessTokenGuard } from '../../guards/access-token.guard';
import { CreateTransactionDto, TransactionAction, Transaction, CategoryType, TransactionGroupRequest, ManageTransactionDto } from '@family-budget/family-budget.model';
import { BalanceService } from 'libs/family-budget.service/src/lib/balance/balance.service';

@UseGuards(AccessTokenGuard)
@Controller('transaction')
export class TransactionController {

    constructor(
        private readonly categoryService: CategoryService,
        private readonly accountService: AccountService,
        private readonly transactionService: TransactionService,
        private readonly balanceService: BalanceService,
        private readonly budgetService: BudgetService
    ) {}

    @Get('getTransaction/:id')
    async getTransaction(@Param('id') id: string): Promise<ManageTransactionDto> {
        const transaction = await this.transactionService.getTransactionById(id);

        const dto = {
            id: transaction.id,
            account: transaction.account.id,
            description: transaction.description,
            category: transaction.category.id,
            amount: transaction.amount.toString(),
            date: DateUtils.getShortDate(transaction.createdAt.toDateString())
        }

        return dto;
    }

    @Get('getTransactionRefData')
    async getTransactionRefData(@Req() req: Request) {
        const userId = req.user['sub'];
        const accounts = (await this.accountService.getAccountsUserUser(userId)).map((account, index: number) => {
            return {
                id: account.id,
                name: account.name,
                icon: account.icon,
                type: account.accountType,
            }
        });
        const categories = await this.categoryService.fetchCategoriesForUser(userId);

        return {
            accounts: accounts,
            categories: categories,
        }
    }

    @Post('saveTransaction')
    async confirmTransaction(@Req() req: Request, @Res() res: Response) {
        const data = req.body?.data as CreateTransactionDto;
        const action = req.body?.action as TransactionAction
        const category = await this.categoryService.findCategoryById(data.category);
        const userId = req.user['sub'];
        let result = null;
        data.amount = data.amount.replace(/[$,]/g, "");

        if (action == TransactionAction.Add) {
            result = await this.transactionService.createTransaction(
                req.body.data, 
                data.account,
                category,
                userId) as Transaction;
        } else {
            // TODO: Add update logic
        }

        if (result) {
            const amount = category.type == CategoryType.Income ? +(data.amount) : +(data.amount) * -1;
            await this.balanceService.updateAddLatestBalance(result.account, +amount);
            return res.status(200).json({ success: true, data: result });
        }

        return res.status(200).json({ success: false, data: null });
    }

    @Post('getGroupedTransactions')
    async getGroupedTransactions(@Req() req: Request) {
        const userId = req.user['sub'];
        const dto = req.body as TransactionGroupRequest;
        dto.userId = userId;
        const transactions = await this.transactionService.getGroupedTransactions(dto);
        if (transactions.length == 0) {
            return {page: dto.page - 1, pageSize: dto.size, transactions: []};
        }

        const transactionsWithCircleGuage = await Promise.all(
            transactions.map(async group => {
                const transactionsWithCircleGuage = await Promise.all(
                    group.transactions.map(async transaction => {
                        const categoryBudgetAmount = await this.budgetService.getCategoryBudgetAmount(transaction.budget.id, transaction.category.id);
                        const categorySpentAmount = await this.budgetService.getSpentAmountForCategory(transaction.category, transaction.budget.id);
                        const currentValue = categoryBudgetAmount > 0 ? (categorySpentAmount / categoryBudgetAmount) * 100 : 0;
                        return {
                            ...transaction,
                            circleGuage: {
                                minValue: 0,
                                maxValue: 100,
                                currentValue: currentValue > 100 ? 100 : currentValue,
                                showRed: currentValue > 100,
                                icon: transaction?.category?.icon
                            }
                        }
                    })
                );
                return {
                    ...group,
                    transactions: transactionsWithCircleGuage
                };
            })
        );

        return {page: dto.page, pageSize: dto.size, transactions: transactionsWithCircleGuage};
    }
}
