import { Module } from '@nestjs/common';
import { PlaidService } from './plaid/plaid.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { SeedService } from './seed/seed.service';
import { BudgetService } from './budget/budget.service';
import { AccountService } from './account/account.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
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
import { AuthenticationService } from './authentication/authentication.service';
import { AccessTokenStrategy } from './authentication/strategies/access-token.strategy';
import { RefreshTokenStrategy } from './authentication/strategies/refresh-token.strategy';
import { FamilyService } from './family/family.service';

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
    AuthenticationService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    FamilyService,
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
    JwtModule.register({}),
  ],
  exports: [
    PlaidService,
    UserService,
    SeedService,
    BudgetService,
    AccountService,
    TransactionService,
    AuthenticationService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    FamilyService
  ],
})
export class FamilyBudgetServiceModule {}
