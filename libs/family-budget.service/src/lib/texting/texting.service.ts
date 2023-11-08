import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import twilio from 'twilio';

@Injectable()
export class TextingService {

    get accountSID() { return this.configService.get<string>('TWILIO_ACCOUNTSID'); }
    get auth() { return this.configService.get<string>('TWILIO_AUTH'); }
    get number() { return this.configService.get<string>('TWILIO_NUMBER'); }

    constructor(
        private readonly configService: ConfigService
    ) {}

    async sendText(to: string, body: string) {
        const client = twilio(this.accountSID, this.auth);
        try {
            let result = await client.messages.create({
                to: to,
                body: body,
                from: this.number
            });
    
            if (result.errorMessage) {
                //Sentry.captureException(`Texting to: ${to} have failed: ${result.errorMessage}; code: ${result.errorCode}`);
            }
        } catch(error) {
            //Sentry.captureException(`Texting to: ${to} have failed: ${error}`);
        }
    }
}
