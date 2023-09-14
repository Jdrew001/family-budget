import { Body, Controller, Get, Post } from '@nestjs/common';
import { PlaidService } from 'libs/family-budget.service/src/lib/plaid/plaid.service';
import { ConfigService } from '@nestjs/config';


@Controller('plaid')
export class PlaidController {

    constructor(
        private plaidService: PlaidService
    ) {}

    @Get('getLinkToken')
    async getLinkToken(@Body() body: any) {
        return await this.plaidService.getLinkToken();
    }

}
