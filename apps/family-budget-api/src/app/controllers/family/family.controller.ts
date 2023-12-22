import { AlertBoxDto, AlertDialogType, AlertType, FamilyStatusDto, GenericResponseModel, User, UserInviteDto } from '@family-budget/family-budget.model';
import { BadRequestException, Controller, ForbiddenException, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../../guards/access-token.guard';
import { CoreService, FamilyService, UserService } from '@family-budget/family-budget.service';
import { AlertKeyConstants } from '../../constants/alert-key.constant';

@UseGuards(AccessTokenGuard)
@Controller('family')
export class FamilyController {

    get currentUser() { return this.coreService.currentUser; }

    constructor(
        private readonly userService: UserService,
        private readonly familyService: FamilyService,
        private readonly coreService: CoreService
    ) {}

    @Get('getFamilyMembers')
    async getFamilyMembers(@Req() req) {
        if (!this.currentUser.id) throw new ForbiddenException('User not found');

        const user = await this.userService.findById(this.currentUser.id);
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

    @Get('confirmFamilySwitch/:familyId')
    async confirmFamilySwitch(@Req() req) {
        if (!this.currentUser.id) throw new ForbiddenException('User not found');
        const user = await this.userService.findById(this.currentUser.id);
        const userFamily = user.family;
        if (!user) throw new BadRequestException('User not found');
        
        const invitation = await this.userService.findInvitationForEmail(user.email);

        //get param
        const familyId = req.params.familyId;
        if (!familyId) throw new BadRequestException('Invalid Family Id');

        // get the family
        const family = await this.familyService.findById(familyId);
        if (!family) throw new BadRequestException('Family not found');

        if (invitation) {
            // remove the invitation
            await this.userService.markInactive(invitation.id);
        }

        // check if user is already in the family and is owner
        if (userFamily && userFamily.owner === this.currentUser.id) {
            // mark family inactive
            await this.familyService.markFamilyInactive(userFamily);

            // update user with new family
            const newFamily = await this.userService.updateUserFamily(user, family);
            return new GenericResponseModel(true, 'Family Switched', 200, { familyId: newFamily.id });
        }

        // check if user is already in the family and is not owner
        if (userFamily && userFamily.owner !== this.currentUser.id) {

            // update user with new family
            const newFamily = await this.userService.updateUserFamily(user, family);
            return new GenericResponseModel(true, 'Family Switched', 200, { familyId: newFamily.id });
        }

        throw new BadRequestException('User not in family');
    }

    @Get('checkFamilyStatus')
    async checkFamilyStatus(@Req() req): Promise<GenericResponseModel<FamilyStatusDto>> {
        if (!this.currentUser.id) throw new ForbiddenException('User not found');

        const user = await this.userService.findById(this.currentUser.id);
        if (!user) throw new BadRequestException('User not found');

        const invitation = await this.userService.findInvitationForEmail(user.email);
        const userInFamily = !!user.family;

        // if (!invitation && !userInFamily) {
        //     // create new family for user
        //     const family = await this.familyService.createFamily(userId);
        //     await this.userService.updateUserFamily(user, family);
        //     return new GenericResponseModel(true, 'Family Created for new User', 200, { familyId: family.id, dialogConfig: null  });
        // }

        // if they have been invited and they have not been in a family, add them to the family they are invited to
        if (invitation && !userInFamily) {
            // add them to the family they are invited to
            const family = await this.familyService.addFamilyMember(invitation.family.id, user);
            await this.userService.updateUserFamily(user, family);
            await this.userService.markInactive(invitation.id);
            return new GenericResponseModel(true, 'User added to family', 200, { familyId: family.id, dialogConfig: null });
        }

        // if user has been invited and they are currently in a family, ask them if they want to join the new family
        if (invitation && userInFamily) { 
            const alertBoxDto = new AlertBoxDto();
            alertBoxDto.title = 'Pending Invite';
            alertBoxDto.message = `You have been invited to join another family. Would you like to join ${user?.firstname} ${user?.lastname}'s Family?`;
            alertBoxDto.cancelText = 'No';
            alertBoxDto.confirmText = 'Yes';
            alertBoxDto.dialogType = AlertDialogType.CONFIRM;
            alertBoxDto.type = AlertType.INFO;
            alertBoxDto.canDismiss = false;
            alertBoxDto.key = AlertKeyConstants.FAMILY_SWITCH_CONFIRMATION;
            alertBoxDto.data = { familyId: invitation.family.id };
            return new GenericResponseModel(true, ``, 200, { familyId: invitation.family.id, dialogConfig: alertBoxDto });
        }
    
        return new GenericResponseModel(true, 'No Changes Needed', 200, { familyId: user.family.id, dialogConfig: null });
    }

    @Get('leaveFamily')
    async leaveFamily(@Req() req) {
        if (!this.currentUser.id) throw new ForbiddenException('User not found');
        const user = await this.userService.findById(this.currentUser.id);
        if (!user) throw new BadRequestException('User not found');

        // check if user is owner of family
        if (user.family.owner === this.currentUser.id) {
            throw new BadRequestException('Owner cannot leave family');
        }

        // check if the user is an owner of any families
        const ownedFamily = await this.familyService.isUserOwnerOfAnyFamily(user.id);
        if (!ownedFamily) {
            //TODO: return that the user needs to onboard
            const family = await this.familyService.createFamily(this.currentUser.id);
            await this.userService.updateUserFamily(user, family);
            return new GenericResponseModel(true, 'Family Created for new User', 200, { familyId: family.id });
        }

        await this.userService.updateUserFamily(user, ownedFamily);

        // mark family active
        const nFamily = await this.familyService.markFamilyActive(ownedFamily);
        return new GenericResponseModel(true, 'User removed from family and added to new', 200, { familyId: nFamily.id });
    }

    // this should get called when the user wants to create a new family after they have been in a family before 
    // --> they have activated their account after being removed from previous family
    @Get('createNewFamily')
    async createNewFamily(@Req() req): Promise<GenericResponseModel<{familyId: string}>> {
        if (!this.currentUser.id) throw new ForbiddenException('User not found');
        const user = await this.userService.findById(this.currentUser.id);
        if (!user) throw new BadRequestException('User not found');
        let result = await this.familyService.createFamily(user.id);

        // update the user with the new family
        const family = await this.userService.updateUserFamily(user, result);
        return new GenericResponseModel(true, '', 200, { familyId: family.id });
    }

    @Post('manageInviteUser')
    async manageInviteUser(@Req() req): Promise<GenericResponseModel<any>> {
        if (!this.currentUser.id) throw new ForbiddenException('User not found');

        const userInviteDto = req.body as UserInviteDto;
        userInviteDto.userId = this.currentUser.id;

        if (!userInviteDto.action) throw new BadRequestException('Invalid action');

        if (userInviteDto.action === 'INVITE') {
            return await this.userService.inviteUser(userInviteDto);
        } else {
            return await this.userService.removeInvite(userInviteDto);
        }
    }

    @Post('removeFamilyMember')
    async removeFamilyMember(@Req() req): Promise<GenericResponseModel<any>> {
        if (!this.currentUser.id) throw new ForbiddenException('User not found');

        const userInviteDto = req.body as UserInviteDto;
        userInviteDto.userId = this.currentUser.id;
        return await this.userService.removeFamilyMember(userInviteDto);
    }
}
