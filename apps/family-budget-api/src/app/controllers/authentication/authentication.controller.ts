import { CreateUserDto, LoginUserDto } from '@family-budget/family-budget.model';
import { Body, Controller, Get, Logger, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthenticationService } from 'libs/family-budget.service/src/lib/authentication/authentication.service';
import { RefreshTokenGuard } from '../../guards/refresh-token.guard';
import { AccessTokenGuard } from '../../guards/access-token.guard';
import * as moment from 'moment-timezone';
import { CoreService } from '@family-budget/family-budget.service';

@Controller('authentication')
export class AuthenticationController {

    get currentUser() { return this.coreService.currentUser; }

    constructor(
        private authenticationService: AuthenticationService,
        private coreService: CoreService
    ) {}

    @Get('health')
    healthCheck() {
        return 'App is running!!!!';
    }

    @Get('timezone')
    getTimeZone() {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return moment.tz(new Date(), tz).format('YYYY-MM-DD HH:mm:ss');;
    }

    @Post('signup')
    signUp(@Body() createUserDto: CreateUserDto) {
        try {
            return this.authenticationService.signUp(createUserDto);
        } catch (error) {
            Logger.error(error);
            return error;
        }
    }

    @Post('signin')
    async signIn(@Body() loginDto: LoginUserDto, @Res() res: Response) {
        const data = await this.authenticationService.signIn(loginDto);
        return res.status(200).json({
            accessToken: data.tokens.accessToken,
            refreshToken: data.tokens.refreshToken
        });
    }

    @UseGuards(RefreshTokenGuard)
    @Get('refreshToken')
    refreshTokens(@Req() req: Request) {
        const refreshToken = req.user['refreshToken'];
        return this.authenticationService.refreshTokens(this.currentUser?.id, refreshToken);
    }

    @UseGuards(AccessTokenGuard)
    @Get('logout')
    logout(@Req() req: Request) {
        return this.authenticationService.logout(this.currentUser?.id);
    }
}
