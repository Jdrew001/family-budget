import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AccountService } from 'libs/family-budget.service/src/lib/account/account.service';
import { AccessTokenGuard } from '../../guards/access-token.guard';
import { Request } from 'express';
import { CreateAccountDto, SummaryAccountBalance } from '@family-budget/family-budget.model';
import { ConversionUtils } from 'libs/family-budget.service/src/lib/util/conversions.utils';
import { CoreService } from '@family-budget/family-budget.service';

@UseGuards(AccessTokenGuard)
@Controller('account')
export class AccountController {

    get currentUser() { return this.coreService.currentUser; }

    constructor(
        private readonly accountService: AccountService,
        private readonly coreService: CoreService
    ) {}

    @Get('accountBalances')
    async getAccountBalances(@Req() req: Request): Promise<SummaryAccountBalance[]> {
        const accountBalances = await this.accountService.getAccountBalancesForUser(this.currentUser.id);
        return accountBalances.map((account, index: number) => {
            return {
                id: account.accountId,
                name: account.accountName,
                icon: account.icon,
                amount: account.balance.amount.toString(),
                active: index === 0
            }
        });
    }

    @Get('getUserAccounts')
    async getAccounts(@Req() req: Request) {
        const accounts = await this.accountService.getAccountsUserUser(this.currentUser.id);
        return accounts.map((account, index: number) => {
            return {
                id: account.id,
                name: account.name,
                icon: account.icon,
                type: `${account.accountType.name} Account`,
                typeId: account.accountType.id
            }
        })
    }

    @Post('createAccounts')
    async createAccount(@Req() req: Request) {
        const nAccounts = req.body as CreateAccountDto[];
        const accounts = [];
        nAccounts.forEach(async item => {
            accounts.push(await this.accountService.createAccountForUser(this.currentUser.id, item));
        });
        return accounts;
    }

    @Get('getAccountById/:accountId')
    async getAccountById(@Req() request: Request) {
        const accountId = request.params.accountId;
        const data = await this.accountService.getAccountById(accountId);
        const currentBudget = data.budgets?.find(budget => budget.activeInd);

        return {
            data: {
                id: data.id,
                name: data.name,
                description: data.description,
                icon: data.icon,
                accountType: data.accountType?.id,
                createBudget: data.budgets?.length > 0,
                frequency: data.budgetPeriod.frequency,
                beginningBalance: ConversionUtils.convertFormatNumberToUSD(data.balance.amount),
                startDate: currentBudget?.startDate
            },
            shouldDisable: data.budgets?.length > 0
        }
    }

    @Get('markAccountInactive/:accountId')
    async markAccountInactive(@Req() request: Request) {
        const accountId = request.params.accountId;
        return await this.accountService.markAccountInactive(accountId);
    }
}
