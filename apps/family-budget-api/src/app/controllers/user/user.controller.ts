import { BadRequestException, Controller, ForbiddenException, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from 'libs/family-budget.service/src/lib/user/user.service';
import { AccessTokenGuard } from '../../guards/access-token.guard';
import { CreateAccountDto, CreateCategoryDto, GenericResponse, GenericResponseModel, OnboardingDto, User, UserInfoDto, UserInviteDto } from '@family-budget/family-budget.model';
import { AccountService } from 'libs/family-budget.service/src/lib/account/account.service';
import { CategoryService, FamilyService } from '@family-budget/family-budget.service';
import { OnboardingConstant } from '../../constants/onboarding-steps.constant';

@UseGuards(AccessTokenGuard)
@Controller('user')
export class UserController {

    constructor(
        private readonly userService: UserService,
        private readonly accountService: AccountService,
        private readonly familyService: FamilyService,
        private readonly categoryService: CategoryService
    ) {}

    @Get('getUserEmail')
    async getUserEmail(@Req() req): Promise<GenericResponseModel<string>> {
        const userId = req.user['sub'];
        if (!userId) throw new ForbiddenException('User not found');
        const user = await this.userService.findById(userId);
        if (!user) throw new BadRequestException('User not found');
        return new GenericResponseModel(true, '', 200, user.email);
    }

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

    @Get('checkOnboardStatus')
    async getUserOnboarded(@Req() req) {
        const userId = req.user['sub'];
        const user = await this.userService.findById(userId);
        if (!user) throw new BadRequestException('User not found');

        return new GenericResponseModel(true, '', 200, 
            {
                requiredSections: await this.getOnboardedRequiredSections(user)
            });
    }

    @Post('handleOnboarding')
    async handleOnboarding(@Req() req) {
        const userId = req.user['sub'];
        const user = await this.userService.findById(userId);
        if (!user) throw new BadRequestException('User not found');

        const onboardDto = req.body as OnboardingDto;
        if (!onboardDto) throw new BadRequestException('Invalid request');

        const result = await this.userService.onboardUser(user, onboardDto);

        if (!result) {
            return new GenericResponseModel(false, 'Unable to save user information', 500);
        }

        // if partial -> user invited, so lets just save profile information
        if (onboardDto.requiredSections.length === 1 && onboardDto.requiredSections[0] === OnboardingConstant.profile) {
            return new GenericResponseModel(true, 'User information saved', 200);
        }

        // create new family for user
        const family = await this.familyService.createFamily(userId);
        await this.userService.updateUserFamily(user, family);

        // save accounts
        const accounts: CreateAccountDto[] = onboardDto.accounts;
        
        accounts.forEach(async account => {
            await this.accountService.createAccountForUser(userId, account);
        });

        // save categories
        const categories: CreateCategoryDto[] = onboardDto.categories;
        categories.forEach(async category => {
            await this.categoryService.createCategory(userId, category);
        });

        // save family invites
        const invites = onboardDto.familyInvites;

        invites.forEach(async invite => {
            await this.userService.inviteUser({
                email: invite.email, 
                familyId: family.id,
                userId: user.id,
            });
        });

        return new GenericResponseModel(true, 'User successfully onboarded', 200);
    }

    private async getOnboardedRequiredSections(user: User) {
        let result = [];
        const invitation = await this.userService.findInvitationForEmail(user.email);
        const family = user.family;
        const onboarded = user.onboarded;
        const hasFirstNameLastName = user.firstname && user.lastname;

        if (!hasFirstNameLastName) {
            result.push(OnboardingConstant.profile);
        }

        if (!invitation && !family && !onboarded) {
            result.push(OnboardingConstant.account);
            result.push(OnboardingConstant.category);
            result.push(OnboardingConstant.inviteFamily);
        }

        return result;
    }
}
