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
  controllers: [AppController, SummaryController, AccountController],
  providers: [AppService],
})
export class AppModule {}
