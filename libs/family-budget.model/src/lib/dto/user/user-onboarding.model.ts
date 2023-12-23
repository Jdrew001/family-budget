import { CategoryType, Frequency } from "@family-budget/family-budget.model";

export interface OnboardingDto {
    profile: ProfileDto;
    accounts: AccountDto[];
    categories: CategoryDto[];
    familyInvites: FamilyInviteDto[];
    requiredSections: 'profile' | 'account' | 'category' | 'inviteFamily' ;
}

export interface ProfileDto {
    firstname: string;
    lastname: string;
    phone: string;
    timezone: string;
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

