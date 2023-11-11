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
        const invitedUsersForFamily = await this.userService.findAllInvitesForFamily(user.family.id);
        const familyMembers = user.family.users.map(user => {
            return {
                id: user.id,
                label: `${user.firstname} ${user.lastname}`,
                email: user.email,
                invitePending: false
              }
        });
        const invitedFamilyMembers = invitedUsersForFamily.map(invite => {
            return {
                id: invite.id,
                label: `Invite Pending`,
                email: invite.email,
                invitePending: true
            }
        })
        const displayValues = [...familyMembers, ...invitedFamilyMembers];
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
            },
            invitedUsers: invitedUsersForFamily,
            displayValues: displayValues
        }
    }

    @Post('inviteUser')
    async inviteUser(@Req() req): Promise<GenericResponseModel> {
        const userId = req.user['sub'];
        if (!userId) throw new ForbiddenException('User not found');

        const userInviteDto = req.body as UserInviteDto;
        userInviteDto.userId = userId;
        
        return await this.userService.inviteUser(userInviteDto);
    }
}
