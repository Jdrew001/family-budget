import { CreateLinkToken, GenericResponse } from '@family-budget/family-budget.model';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EMPTY, catchError, lastValueFrom, map } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { Configuration, CountryCode, LinkTokenCreateRequest, PlaidApi, PlaidEnvironments, Products } from 'plaid';


@Injectable()
export class PlaidService {

    get clientId() { return this.configService.get<string>('PLAID_CLIENT_ID'); }
    get secret() { return this.configService.get<string>('PLAID_SECRET'); }
    plaidClient: PlaidApi;

    constructor(
        private configService: ConfigService,
        private httpService: HttpService) {
            const configuration = new Configuration({
                basePath: this.configService.get('PLAID_API'),
                baseOptions: {
                  headers: {
                    'PLAID-CLIENT-ID': this.clientId as string,
                    'PLAID-SECRET': this.clientId as string,
                  },
                },
              });
              
            this.plaidClient = new PlaidApi(configuration);
        }

    async getLinkToken(): Promise<GenericResponse<any>> {
        const request = this.generateLinkTokenRequest();
        let response = await this.plaidClient.linkTokenCreate(request)
        return {error: null, message: 'Success', data: response };

        // try {
            
        // } catch (err) {
        //     Logger.error('getLinkToken ERROR OUTSIDE BLOCK:', err);
        //     return {error: err, message: 'Error getting link token', data: null}
        // }
    }

    private generateLinkTokenRequest() {
        const request: LinkTokenCreateRequest = {
            user: {
                client_user_id: this.clientId as string,
                phone_number: '+16824140386',
            },
            client_name: 'Famil Budget',
            products: [Products.Auth, Products.Transactions],
            country_codes: [CountryCode.Us],
            language: 'en',
            webhook: 'https://sample-web-hook.com', // set later
            required_if_supported_products: [Products.Transactions],
            redirect_uri: 'https://sample-redirect-uri.com', // set later
        };


        return request;
    }
}
