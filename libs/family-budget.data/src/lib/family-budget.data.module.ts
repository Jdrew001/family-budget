import { Account, AccountType, Balance, Budget, BudgetCategory, BudgetPeriod, Category, Family, FrequencyRef, Subscription, Transaction, User, UserInvite } from '@family-budget/family-budget.model';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env['DB_HOST'],
      port: Number(process.env['DB_PORT']),
      username: process.env['DB_USER'],
      password: process.env['DB_PASSWORD'],
      database: process.env['DB_NAME'],
      entities: [
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
        FrequencyRef,
        UserInvite
      ],
      synchronize: true
    })
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class FamilyBudgetDataModule {}
