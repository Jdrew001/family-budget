import { GenericResponseModel, UserInviteDto } from '@family-budget/family-budget.model';
import { FamilyService, UserService } from '@family-budget/family-budget.service';
import { BadRequestException, Controller, ForbiddenException, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../../guards/access-token.guard';

@UseGuards(AccessTokenGuard)
@Controller('family')
export class FamilyController {

    constructor(
        private readonly userService: UserService,
        private readonly familyService: FamilyService
    ) {}

    @Get('getFamilyMembers')
    async getFamilyMembers(@Req() req) {
        const userId = req.user['sub'];
        if (!userId) throw new ForbiddenException('User not found');

        const user = await this.userService.findById(userId);
        if (!user) throw new BadRequestException('User not found');

        const invitedUsersForFamily = await this.userService.findAllInvitesForFamily(user.family.id);
        // i want to ensure that the owner is always at the top of the list
        const familyOwner = user.family.owner;
        const familyMembers = user.family.users.map(user => {
            return {
                id: user.id,
                label: `${user.firstname} ${user.lastname}`,
                email: user.email,
                invitePending: false,
                isOwner: familyOwner === user.id
              }
        });

        // sort the family members so that the owner is always at the top
        familyMembers.sort((a, b) => {
            if (a.isOwner) return -1;
            if (b.isOwner) return 1;
            return 0;
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
        return displayValues;
    }

    @Get('checkFamilyStatus')
    async checkFamilyStatus(@Req() req): Promise<GenericResponseModel> {
        const userId = req.user['sub'];
        if (!userId) throw new ForbiddenException('User not found');

        const user = await this.userService.findById(userId);
        if (!user) throw new BadRequestException('User not found');

        // user needs to be prompted to create a new family
        if (!user.family) {
            return new GenericResponseModel(false, '', 200)
        } else {
            return new GenericResponseModel(true, '', 200)
        }
    }

    // this should get called when the user wants to create a new family after they have been in a family before 
    // --> they have activated their account after being removed from previous family
    @Get('createNewFamily')
    async createNewFamily(@Req() req): Promise<GenericResponseModel> {
        const userId = req.user['sub'];
        if (!userId) throw new ForbiddenException('User not found');
        const user = await this.userService.findById(userId);
        if (!user) throw new BadRequestException('User not found');
        let result = await this.familyService.createFamily(user.id);

        // update the user with the new family
        await this.userService.updateUserFamily(user, result);
        return new GenericResponseModel(true, '', 200, result);
    }

    @Post('manageInviteUser')
    async manageInviteUser(@Req() req): Promise<GenericResponseModel> {
        const userId = req.user['sub'];
        if (!userId) throw new ForbiddenException('User not found');

        const userInviteDto = req.body as UserInviteDto;
        userInviteDto.userId = userId;

        if (!userInviteDto.action) throw new BadRequestException('Invalid action');

        if (userInviteDto.action === 'INVITE') {
            return await this.userService.inviteUser(userInviteDto);
        } else {
            return await this.userService.removeInvite(userInviteDto);
        }
    }

    @Post('removeFamilyMember')
    async removeFamilyMember(@Req() req): Promise<GenericResponseModel> {
        const userId = req.user['sub'];
        if (!userId) throw new ForbiddenException('User not found');

        const userInviteDto = req.body as UserInviteDto;
        userInviteDto.userId = userId;
        return await this.userService.removeFamilyMember(userInviteDto);
    }
}
