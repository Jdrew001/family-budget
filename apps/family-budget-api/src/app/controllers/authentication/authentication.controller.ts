import { CreateUserDto, LoginUserDto } from '@family-budget/family-budget.model';
import { Body, Controller, Get, Logger, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthenticationService } from 'libs/family-budget.service/src/lib/authentication/authentication.service';
import { RefreshTokenGuard } from '../../guards/refresh-token.guard';
import { AccessTokenGuard } from '../../guards/access-token.guard';
import { WebSocketService } from 'libs/family-budget.service/src/lib/web-socket/web-socket.service';
import { EVENT_DEFINITION } from '@family-budget/family-budget.service';

@Controller('authentication')
export class AuthenticationController {

    constructor(
        private authenticationService: AuthenticationService,
        private readonly webSocketService: WebSocketService,
    ) {}

    @Get('health')
    healthCheck() {
        return 'App is running!!!!';
    }

    @Get('socketTest')
    socketTest() {
        this.webSocketService.sendEventToClients(EVENT_DEFINITION.TRANSACTION.CREATED, {test: 'test'});
        return 'socket test';
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
        Logger.log(`Sign in attempt for ${loginDto}`)
        const data = await this.authenticationService.signIn(loginDto);
        return res.status(200).json({
            accessToken: data.tokens.accessToken,
            refreshToken: data.tokens.refreshToken
        });
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
        return this.authenticationService.logout(userId);
    }
}
