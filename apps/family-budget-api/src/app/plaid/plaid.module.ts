import { FamilyBudgetServiceModule } from '@family-budget/family-budget.service';
import { Module } from '@nestjs/common';
import { PlaidController } from './plaid.controller';

@Module({
    imports: [
        FamilyBudgetServiceModule
    ],
    controllers: [
        PlaidController
    ],
    providers: []
})
export class PlaidModule {}
