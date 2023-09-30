import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AccountService } from 'libs/family-budget.service/src/lib/account/account.service';
import { AccessTokenGuard } from '../../guards/access-token.guard';
import { Request } from 'express';

@UseGuards(AccessTokenGuard)
@Controller('account')
export class AccountController {

    private mockUser = '9c23865d-acc0-41fd-b6ed-9da51d3184b5';

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
}
