import { User } from '@family-budget/family-budget.model';
import { Injectable, Scope } from '@nestjs/common';
import { UserService } from '../user/user.service';

@Injectable({ scope: Scope.REQUEST })
export class CoreService {

    private _currentUser: User;
    public get currentUser(): User {
        return this._currentUser;
    }
    public set currentUser(user: User) {
        this._currentUser = user;
    }

    constructor(private userService: UserService) {}

    async fetchUserInfo(id: string) {
        if (this.currentUser) {
            return this.currentUser;
        }

        this.currentUser = await this.userService.findById(id);
        return this.currentUser;
    }
}
