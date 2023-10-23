import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AccountService } from 'libs/family-budget.service/src/lib/account/account.service';
import { AccessTokenGuard } from '../../guards/access-token.guard';
import { Request } from 'express';
import { CreateAccountDto, SummaryAccountBalance } from '@family-budget/family-budget.model';

@UseGuards(AccessTokenGuard)
@Controller('account')
export class AccountController {

    constructor(
        private readonly accountService: AccountService
    ) {}

    @Get('accountBalances')
    async getAccountBalances(@Req() req: Request): Promise<SummaryAccountBalance[]> {
        const user = req.user['sub'];
        const accountBalances = await this.accountService.getAccountBalancesForUser(user);
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
        const user = req.user['sub'];
        const accounts = await this.accountService.getAccountsUserUser(user);
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
        const user = req.user['sub'];
        const nAccounts = req.body as CreateAccountDto[];
        const accounts = [];
        nAccounts.forEach(async item => {
            accounts.push(await this.accountService.createAccountForUser(user, item));
        });
        return accounts;
    }
}
