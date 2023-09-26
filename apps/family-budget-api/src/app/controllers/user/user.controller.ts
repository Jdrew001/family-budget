import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from 'libs/family-budget.service/src/lib/user/user.service';
import { AccessTokenGuard } from '../../guards/access-token.guard';

@Controller('user')
export class UserController {

    constructor(
        private readonly userService: UserService
    ) {}

    @UseGuards(AccessTokenGuard)
    @Get('testing')
    testing() {
        return 'testing';
    }
}
