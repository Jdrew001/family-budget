import { Family, User } from "@family-budget/family-budget.model";

export class SeedConstant {
    public static USER_MOCK: any = {
        firstname: "John",
        lastname: "Doe",
        password: "password",
        email: "test@gmail.com",
        confirmed: true,
        lastLogin: new Date(),
        locked: false,
        refreshToken: ''
    }
}