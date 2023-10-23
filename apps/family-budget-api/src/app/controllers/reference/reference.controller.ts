import { Controller, Get, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../../guards/access-token.guard';
import { ReferenceService } from '@family-budget/family-budget.service';

@UseGuards(AccessTokenGuard)
@Controller('reference')
export class ReferenceController {

    constructor(
        private referenceService: ReferenceService
    ) {}

    @Get('masterRefData')
    async getMasterRefData() {
        return await this.referenceService.getMasterRefData();
    }
}
