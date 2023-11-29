import { BadRequestException, Controller, ForbiddenException, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from 'libs/family-budget.service/src/lib/user/user.service';
import { AccessTokenGuard } from '../../guards/access-token.guard';
import { GenericResponse, GenericResponseModel, UserInfoDto, UserInviteDto } from '@family-budget/family-budget.model';

@UseGuards(AccessTokenGuard)
@Controller('user')
export class UserController {

    constructor(
        private readonly userService: UserService
    ) {}

    @Get('getUserInformation')
    async getUserInformation(@Req() req): Promise<UserInfoDto> {
        const userId = req.user['sub'];
        if (!userId) throw new ForbiddenException('User not found');
        const user = await this.userService.findById(userId);
        if (!user) throw new BadRequestException('User not found');
        return {
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            family: {
                id: user.family.id,
                users: user.family.users.map(user => {
                    return {
                        id: user.id,
                        firstname: user.firstname,
                        lastname: user.lastname,
                        email: user.email,
                    }
                })
            }
        }
    }

    @Get('checkRegistrationStatus')
    async getUserOnboarded(@Req() req) {
        const userId = req.user['sub'];
        const user = await this.userService.findById(userId);
        if (!user) throw new BadRequestException('User not found');
        const invitation = await this.userService.findInvitationForEmail(user.email);

        return new GenericResponseModel(true, '', 200, {userInvited: !!invitation, onboarded: user.onboarded});
    }
}
