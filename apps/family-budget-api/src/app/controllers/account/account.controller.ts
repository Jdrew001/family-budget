import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AccountService } from 'libs/family-budget.service/src/lib/account/account.service';
import { AccessTokenGuard } from '../../guards/access-token.guard';
import { Request } from 'express';
import { CreateAccountDto } from '@family-budget/family-budget.model';

@UseGuards(AccessTokenGuard)
@Controller('account')
export class AccountController {

    constructor(
        private readonly accountService: AccountService
    ) {}

    @Get('getUserAccounts')
    async getAccounts(@Req() req: Request) {
        const user = req.user['sub'];
        const accounts = await this.accountService.getAccountsUserUser(user);
        return accounts.map((account, index: number) => {
            return {
                id: account.id,
                name: account.name,
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
