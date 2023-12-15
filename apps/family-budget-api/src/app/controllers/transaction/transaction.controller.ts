import { BudgetService, CategoryService, DateUtils, TransactionService } from '@family-budget/family-budget.service';
import { Controller, Get, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AccountService } from 'libs/family-budget.service/src/lib/account/account.service';
import { AccessTokenGuard } from '../../guards/access-token.guard';
import { CreateTransactionDto, TransactionAction, Transaction, CategoryType, TransactionGroupRequest, ManageTransactionDto } from '@family-budget/family-budget.model';
import { BalanceService } from 'libs/family-budget.service/src/lib/balance/balance.service';
import * as _ from 'lodash';

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
        const dto = req.body?.data as CreateTransactionDto;
        const action = req.body?.action as TransactionAction;
        const newAccount = await this.accountService.getAccountById(dto.account);
        const newCategory = await this.categoryService.findCategoryById(dto.category);
        const userId = req.user['sub'];
        const transaction = (await this.transactionService.getTransactionById(dto.id));
        const clonedTransaction = _.clone(transaction);
        let result = null;
        dto.amount = dto.amount.replace(/[$,]/g, "");

        if (action == TransactionAction.Add) {
            result = await this.transactionService.createTransaction(
                dto, 
                newAccount,
                newCategory,
                userId) as Transaction;
        } else {
            result = await this.transactionService.updateTransaction(
                transaction,
                dto, 
                newAccount,
                newCategory,
                userId) as Transaction;
        }

        if (result) {
            const newTranAmount = parseFloat(dto.amount);
            let amount = newCategory.type == CategoryType.Income ? newTranAmount : newTranAmount * -1;
            const isActionEdit = action == TransactionAction.Edit;
            const isCategoryUpdated = clonedTransaction.category.id != newCategory.id;
            const isCategoryTypesDifferent = clonedTransaction.category.type != newCategory.type;

            // we are updating the transaction and we are updating its account
            if (isActionEdit && clonedTransaction.account.id != newAccount.id) {
                const amountRemoval = clonedTransaction.category.type == CategoryType.Income ? clonedTransaction.amount * -1 : clonedTransaction.amount;
                await this.balanceService.updateAddLatestBalance(clonedTransaction.account, +amountRemoval);
                await this.balanceService.updateAddLatestBalance(newAccount, +amount);

                return res.status(200).json({ success: true, data: result });
            }

            // user has updated the category of the transaction
            if (isActionEdit && isCategoryUpdated && isCategoryTypesDifferent) {
                await this.balanceService.updateAddLatestBalance(clonedTransaction.account, +amount);
                return res.status(200).json({ success: true, data: result });
            }

            if (action == TransactionAction.Edit) {
                amount = newCategory.type == CategoryType.Income ? (clonedTransaction.amount - newTranAmount) * -1: (clonedTransaction.amount - newTranAmount);
            } else {
                amount = newCategory.type == CategoryType.Income ? newTranAmount : newTranAmount * -1;
            }

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

        if (transactions.length === 0) {
            return { page: dto.page - 1, pageSize: dto.size, transactions: [] };
        }

        const transactionsWithCircleGuage = await Promise.all(
            transactions.map(async (group) => {
                const transactionsWithCircleGuage = await Promise.all(
                    group.transactions.map(async (transaction) => {
                        const [categoryBudgetAmount, categorySpentAmount] = await Promise.all([
                            this.budgetService.getCategoryBudgetAmount(transaction?.budget?.id, transaction?.category?.id),
                            this.budgetService.getSpentAmountForCategory(transaction?.category, transaction?.budget?.id),
                        ]);

                        const currentValue = categoryBudgetAmount > 0 ? (categorySpentAmount / categoryBudgetAmount) * 100 : 0;

                        return {
                            ...transaction,
                            circleGuage: {
                                minValue: 0,
                                maxValue: 100,
                                currentValue: currentValue > 100 ? 100 : currentValue,
                                showRed: currentValue > 100,
                                icon: transaction?.category?.icon,
                            },
                        };
                    })
                );

                return {
                    ...group,
                    transactions: transactionsWithCircleGuage,
                };
            })
        );
        return { page: dto.page, pageSize: dto.size, transactions: transactionsWithCircleGuage };
    }
}
