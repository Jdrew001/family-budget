import { Module } from '@nestjs/common';
import { PlaidService } from './plaid/plaid.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { SeedService } from './seed/seed.service';
import { BudgetService } from './budget/budget.service';
import { AccountService } from './account/account.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Account,
  AccountType,
  Balance,
  Budget,
  BudgetCategory,
  BudgetPeriod,
  Category,
  Family,
  Subscription,
  Transaction,
  User,
} from '@family-budget/family-budget.model';
import { TransactionService } from './transaction/transaction.service';
import { UserService } from './user/user.service';
import { BalanceService } from './balance/balance.service';

@Module({
  controllers: [],
  providers: [
    PlaidService,
    SeedService,
    BudgetService,
    AccountService,
    TransactionService,
    UserService,
    BalanceService,
  ],
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    HttpModule,
    TypeOrmModule.forFeature([
      User,
      AccountType,
      Account,
      Balance,
      BudgetCategory,
      BudgetPeriod,
      Budget,
      Category,
      Family,
      Subscription,
      Transaction,
    ]),
  ],
  exports: [PlaidService, SeedService, BudgetService, AccountService],
})
export class FamilyBudgetServiceModule {}
