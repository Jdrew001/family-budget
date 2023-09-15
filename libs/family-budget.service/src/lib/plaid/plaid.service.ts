import { CreateLinkToken, GenericResponse } from '@family-budget/family-budget.model';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EMPTY, catchError, lastValueFrom, map } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { Configuration, CountryCode, Products } from 'plaid';


@Injectable()
export class PlaidService {

    get clientId() { return this.configService.get<string>('PLAID_CLIENT_ID'); }
    get secret() { return this.configService.get<string>('PLAID_SECRET'); }
    get clientUserId() { return this.configService.get<string>('CLIENT_USER_ID'); }
    get baseUrl() { return this.configService.get<string>('PLAID_API'); }

    constructor(
        private configService: ConfigService,
        private httpService: HttpService) {}

    async getLinkToken(): Promise<GenericResponse<any>> {
        try {
            let url = `${this.baseUrl}/link/token/create`; // CONSTANT
            const request = this.generateLinkTokenRequest();
            let result = await lastValueFrom(
                this.httpService.post(url, request, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).pipe(catchError(err => this.handleError(err))));
            return {error: null, message: 'Success', data: result['data'] };
        } catch (err) {
            Logger.error('getLinkToken ERROR OUTSIDE BLOCK:', err);
            return {error: err, message: 'Error getting link token', data: null}
        }
    }

    private generateLinkTokenRequest() {
        const request: any = {
            client_id: this.clientId,
            secret: this.secret,
            user: {
                client_user_id: this.clientUserId
            },
            client_name: 'Family Budget',
            products: [Products.Transactions, Products.Auth],
            country_codes: [CountryCode.Us],
            language: 'en'
        };


        return request;
    }

    private handleError(err: any) {
        Logger.error('ERROR: ', err, new Date());
        //Sentry.captureException(`Email templates have failed: ${err}`);
        return EMPTY;
    }
}
