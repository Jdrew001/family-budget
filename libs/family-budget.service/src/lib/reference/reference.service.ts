import { Injectable } from '@nestjs/common';
import { AccountService } from '../account/account.service';
import { MasterRefdata } from '@family-budget/family-budget.model';
import { FrequencyReferenceService } from '../frequency-reference/frequency-reference.service';

@Injectable()
export class ReferenceService {

    constructor(
        private accountService: AccountService,
        private frequencyReferenceService: FrequencyReferenceService
    ) {}

    async getMasterRefData(): Promise<MasterRefdata> {
        const accountTypes = await this.accountService.getAccountTypes();
        const frequencies = await this.frequencyReferenceService.getFrequencyRefData();
        return {
            frequencies: frequencies.map(f => {
                return {
                    id: f.type,
                    label: f.name,
                    value: f.type,
                    type: f.type
                }
            }),
            accountTypes: accountTypes.map(at => {
                return {
                    id: at.id,
                    label: at.name,
                    value: at.id,
                    type: 'radio'
                }
            })
        }
    }
}
