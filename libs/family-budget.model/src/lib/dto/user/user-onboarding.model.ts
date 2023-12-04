import { CategoryType, Frequency } from "@family-budget/family-budget.model";

export interface OnboardingDto {
    profile: ProfileDto;
    accounts: AccountDto[];
    categories: CategoryDto[];
    familyInvites: FamilyInviteDto[];
    partial?: boolean;
}

export interface ProfileDto {
    firstname: string;
    lastname: string;
    phone: string;
}

export interface AccountDto {
    name: string;
    description: string;
    beginningBalance: string;
    accountType: string;
    createBudget: boolean;
    frequency: Frequency;
    startDate: string;
}

export interface CategoryDto {
    id: string;
    categoryName: string;
    categoryType: CategoryType;
    icon: string;
}

export interface FamilyInviteDto {
    email: string;
}

