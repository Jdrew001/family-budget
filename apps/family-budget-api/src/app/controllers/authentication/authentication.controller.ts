import { CreateUserDto, LoginUserDto } from '@family-budget/family-budget.model';
import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { create } from 'domain';
import { AuthenticationService } from 'libs/family-budget.service/src/lib/authentication/authentication.service';

@Controller('authentication')
export class AuthenticationController {

    constructor(
        private authenticationService: AuthenticationService
    ) {}

    @Post('signup')
    signUp(@Body() createUserDto: CreateUserDto) {
        return this.authenticationService.signUp(createUserDto);
    }

    @Post('signin')
    signIn(@Body() loginDto: LoginUserDto) {
        return this.authenticationService.signIn(loginDto);
    }

    @Get('logout/:userId')
    logout(@Param() userId: string) {
        return this.authenticationService.logout(userId);
    }
}
