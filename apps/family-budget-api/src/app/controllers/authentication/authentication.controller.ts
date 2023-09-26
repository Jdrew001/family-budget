import { CreateUserDto, LoginUserDto } from '@family-budget/family-budget.model';
import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthenticationService } from 'libs/family-budget.service/src/lib/authentication/authentication.service';
import { RefreshTokenGuard } from '../../guards/refresh-token.guard';
import { AccessTokenGuard } from '../../guards/access-token.guard';

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

    @UseGuards(RefreshTokenGuard)
    @Get('refreshToken')
    refreshTokens(@Req() req: Request) {
        const userId = req.user['sub'];
        const refreshToken = req.user['refreshToken'];
        return this.authenticationService.refreshTokens(userId, refreshToken);
    }

    @UseGuards(AccessTokenGuard)
    @Get('logout')
    logout(@Req() req: Request) {
        const userId = req.user['sub'];
        this.authenticationService.logout(userId);
    }
}
