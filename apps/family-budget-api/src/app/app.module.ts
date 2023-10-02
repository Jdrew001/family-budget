import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlaidModule } from './plaid/plaid.module';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { FamilyBudgetDataModule } from '@family-budget/family-budget.data';
import { FamilyBudgetServiceModule } from '@family-budget/family-budget.service';
import { SummaryController } from './controllers/summary/summary.controller';
import { AccountController } from './controllers/account/account.controller';
import { AuthenticationController } from './controllers/authentication/authentication.controller';
import { UserController } from './controllers/user/user.controller';
import { AccessTokenGuard } from './guards/access-token.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { TransactionController } from './controllers/transaction/transaction.controller';
import { CategoryController } from './controllers/category/category.controller';
import { BudgetController } from './controllers/budget/budget.controller';

@Module({
  imports: [
    PlaidModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    HttpModule,
    FamilyBudgetDataModule,
    FamilyBudgetServiceModule,
  ],
  controllers: [
    AppController,
    SummaryController,
    AccountController,
    AuthenticationController,
    UserController,
    TransactionController,
    CategoryController,
    BudgetController,
  ],
  providers: [AppService, AccessTokenGuard, RefreshTokenGuard],
})
export class AppModule {}
