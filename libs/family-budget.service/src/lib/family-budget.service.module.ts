import { Module } from '@nestjs/common';
import { PlaidService } from './plaid/plaid.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [],
  providers: [
    PlaidService
  ],
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    HttpModule,
  ],
  exports: [PlaidService],
})
export class FamilyBudgetServiceModule {
}
