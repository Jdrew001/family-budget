import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AccountService } from 'libs/family-budget.service/src/lib/account/account.service';
import { AccessTokenGuard } from '../../guards/access-token.guard';
import { Request } from 'express';
import { Account, AccountFields, CreateAccountDto, DisabledField, GenericResponseModel, SummaryAccountBalance } from '@family-budget/family-budget.model';
import { ConversionUtils } from 'libs/family-budget.service/src/lib/util/conversions.utils';
import { BudgetService, CoreService } from '@family-budget/family-budget.service';

@UseGuards(AccessTokenGuard)
@Controller('account')
export class AccountController {

    get currentUser() { return this.coreService.currentUser; }

    constructor(
        private readonly accountService: AccountService,
        private readonly budgetService: BudgetService,
        private readonly coreService: CoreService
    ) {}

    @Get('accountBalances')
    async getAccountBalances(@Req() req: Request): Promise<SummaryAccountBalance[]> {
        const accountBalances = await this.accountService.getAccountBalancesForUser();
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
        const accounts = await this.accountService.getAccountsUserUser();
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
            accounts.push(await this.accountService.createAccountForUser(item));
        });
        return accounts;
    }

    @Post('updateAccount')
    async updateAccount(@Req() req: Request) {
        const accountDto = req.body as CreateAccountDto;
        const accountEntity = await this.accountService.getAccountById(accountDto.id);
        const latestBudget = await this.budgetService.getCurrentBudget(accountEntity);

        accountEntity.name = accountDto.name;
        accountEntity.description = accountDto.description;
        accountEntity.icon = accountDto.icon;
        accountEntity.balance.amount = ConversionUtils.convertFormatUSDToNumber(accountDto.beginningBalance);

        const accountType = await this.accountService.getAccountTypeById(accountDto.accountType);
        accountEntity.accountType = accountType;

        // this is when the user is updating the budget start date&frequency
        if (latestBudget && accountEntity.accountType.name == 'Checking') {
            accountEntity.budgetPeriod = await this.budgetService.getBudgetPeriodByFrequency(accountDto.frequency);
            this.budgetService.updateStartAndEndDate(latestBudget, accountDto);
            this.budgetService.activateBudget(latestBudget);
        }

        // if the account type has changed to something other than checking, remove the budget period
        if (accountEntity.accountType.name != 'Checking') {
            accountEntity.budgetPeriod = null;
            this.budgetService.markInactiveBudget(latestBudget);
        }
        
        return await this.accountService.updateAccount(accountEntity);
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
                frequency: data.budgetPeriod?.frequency ?? null,
                beginningBalance: ConversionUtils.convertFormatNumberToUSD(data.balance.amount),
                startDate: currentBudget?.startDate ?? null
            },
            disabledFields: this.getDisabledFields(data)
        }
    }

    @Get('markAccountInactive/:accountId')
    async markAccountInactive(@Req() request: Request) {
        const accountId = request.params.accountId;
        return await this.accountService.markAccountInactive(accountId);
    }

    private getDisabledFields(account: Account) {
        const fieldsToDisable: DisabledField[] = [];
        
        if (account.transactions?.length > 0) {
            fieldsToDisable.push({name: AccountFields.beginningBalance, message: 'Cannot update balance if transactions exist'});
            fieldsToDisable.push({name: AccountFields.accountType, message: 'Cannot update account type if transactions exist'});
        }

        if (account.accountType.name != 'Checking') {
            fieldsToDisable.push({name: AccountFields.createBudget, message: ''});
            fieldsToDisable.push({name: AccountFields.frequency, message: ''});
            fieldsToDisable.push({name: AccountFields.startDate, message: ''});
        }

        return fieldsToDisable;

    }
}
