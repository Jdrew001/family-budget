import { CreateUserDto, Family, GenericResponse, GenericResponseModel, UpdateUserDto, User, UserInvite, UserInviteDto } from '@family-budget/family-budget.model';
import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { FamilyService } from '../family/family.service';
import { ErrorConstants } from '../constants/error.constants';

@Injectable()
export class UserService {

    constructor(
        @Inject('UserRepository') private readonly userRepository: Repository<User>,
        @Inject('UserInviteRepository') private readonly userInviteRepo: Repository<UserInvite>,
        private readonly familyService: FamilyService
    ) {}

    async create(createUserDto: CreateUserDto, userInvite?: UserInvite) {
        const user = new User();
        user.email = createUserDto.email;
        user.firstname = createUserDto.firstname;
        user.lastname = createUserDto.lastname;
        user.lastLogin = new Date();
        user.confirmed = false;
        user.password = createUserDto.password;
        user.locked = false;
        user.family = userInvite ? userInvite?.family: await this.familyService.createFamily();
        user.onboarded = !!userInvite; // if the user has been invited, then we want to skip the onboarding process
        return this.userRepository.save(user)
    }

    async findAll(): Promise<User[]> {
        return this.userRepository.find();
    }

    async findById(id: string): Promise<User> {
        return await this.userRepository.findOne({where: {id: id}, 
            relations: ['family', 'family.categories', 'family.accounts', 'family.users']}) as User;
    }

    async findByEmail(email: string): Promise<User> {
        return await this.userRepository.findOne({where: {email: email}}) as User;
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        let userToUpdate = await this.findById(id);
        userToUpdate = {
            ...userToUpdate,
            ...updateUserDto
        };
        return await this.userRepository.update(id, userToUpdate);
    }

    async updateUserFamily(user: User, family: Family) {
        user.family = family;
        return await this.userRepository.save(user);
    }

    async findFamilyForUser(userId: string) {
        const user = await this.findById(userId);
        return user.family;
    }

    async findAllInvitesForFamily(familyId: string) {
        return this.userInviteRepo.find({where: {family: {id: familyId}, activeInd: true}});
    }

    async inviteUser(userInviteDto: UserInviteDto): Promise<GenericResponseModel> {
        // check if user exists
        const invitedUser = await this.findByEmail(userInviteDto.email);
        const user = await this.findById(userInviteDto.userId);

        // if found
        if (invitedUser) {
            return new GenericResponseModel(false, ErrorConstants.USER_CANNOT_BE_INVITED, 400);
        }

        // check if user is already invited
        const userInvite = await this.userInviteRepo.findOne({where: {email: userInviteDto.email}});
        if (userInvite && userInvite.activeInd) {
            return new GenericResponseModel(false, ErrorConstants.USER_ALREADY_INVITED, 400)
        }

        // create invite
        const newUserInvite = new UserInvite();
        newUserInvite.email = userInviteDto.email;
        newUserInvite.family = user.family;
        newUserInvite.updateBy = user;
        return new GenericResponseModel(true, '', 200, await this.userInviteRepo.save(newUserInvite));
    }

    async removeInvite(userInviteDto: UserInviteDto): Promise<GenericResponseModel> {
        const userInvite = await this.userInviteRepo.findOne({where: {email: userInviteDto.email}});
        if (!userInvite) {
            return new GenericResponseModel(false, ErrorConstants.USER_NOT_INVITED, 400);
        }

        const invite = this.deleteInvite(userInvite.id as string);
        return new GenericResponseModel(true, '', 200, invite)
    }

    async findInvitationForEmail(email: string): Promise<UserInvite> {
        return await this.userInviteRepo.findOne({where: {email: email}, relations: ['family']}) as UserInvite;
    }

    async markInactive(id: string): Promise<any> {
        const invite = await this.userInviteRepo.update(id, {activeInd: false});
        return invite;
    }

    async deleteInvite(id: string) {
        const invite = await this.userInviteRepo.delete(id);
        return invite;
    }

    async removeFamilyMember(data: UserInviteDto) {
        if (!data.email) return new GenericResponseModel(false, ErrorConstants.USER_NOT_FOUND, 400);
        if (!data.familyId) return new GenericResponseModel(false, ErrorConstants.FAMILY_NOT_FOUND, 400);

        const user = await this.findByEmail(data.email) as User;

        if (!user) return new GenericResponseModel(false, ErrorConstants.USER_NOT_FOUND, 400);
        (user.family as any) = null;
        user.activeInd = false;

        let result = await this.userRepository.save(user);
        return new GenericResponseModel(true, '', 200, result);
    }

    async checkFamilyStatus(user: User) {
        if (!user.family) {
            const family = await this.familyService.createFamily();
            user.family = family;
            user.activeInd = true;
            await this.userRepository.save(user);
        }
    }
}
