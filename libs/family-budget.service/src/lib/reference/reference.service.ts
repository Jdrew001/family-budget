import { Injectable } from '@nestjs/common';
import { AccountService } from '../account/account.service';
import { MasterRefdata } from '@family-budget/family-budget.model';

@Injectable()
export class ReferenceService {

    constructor(
        private accountService: AccountService
    ) {}

    async getMasterRefData(): Promise<MasterRefdata> {
        const accountTypes = await this.accountService.getAccountTypes();
        return {
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
