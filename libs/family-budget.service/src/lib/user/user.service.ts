import { CreateUserDto, UpdateUserDto, User } from '@family-budget/family-budget.model';
import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { FamilyService } from '../family/family.service';

@Injectable()
export class UserService {

    constructor(
        @Inject('UserRepository') private readonly userRepository: Repository<User>,
        private readonly familyService: FamilyService
    ) {}

    async create(createUserDto: CreateUserDto) {
        const user = new User();
        user.email = createUserDto.email;
        user.firstname = createUserDto.firstname;
        user.lastname = createUserDto.lastname;
        user.lastLogin = new Date();
        user.confirmed = false;
        user.password = createUserDto.password;
        user.locked = false;
        user.family = await this.familyService.createFamily();
        return this.userRepository.save(user)
    }

    async findAll(): Promise<User[]> {
        return this.userRepository.find();
    }

    async findById(id: string): Promise<User> {
        return await this.userRepository.findOne({where: {id: id}}) as User;
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
}
