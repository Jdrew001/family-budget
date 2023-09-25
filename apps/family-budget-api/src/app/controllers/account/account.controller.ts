import { Controller, Get } from '@nestjs/common';
import { AccountService } from 'libs/family-budget.service/src/lib/account/account.service';

@Controller('account')
export class AccountController {

    private mockUser = '9c23865d-acc0-41fd-b6ed-9da51d3184b5';

    constructor(
        private readonly accountService: AccountService
    ) {}

    @Get()
    async getAccounts() {
        // TODO: User id from token, mocked for now
        return await this.accountService.getAccountsUserUser(this.mockUser);
    }
}
