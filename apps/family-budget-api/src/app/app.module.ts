import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlaidModule } from './plaid/plaid.module';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';


@Module({
  imports: [PlaidModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    HttpModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
