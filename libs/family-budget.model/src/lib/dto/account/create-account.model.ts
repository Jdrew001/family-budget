import { Frequency } from "@family-budget/family-budget.model";

export interface CreateAccountDto {
    id?: string;
    name: string;
    description: string;
    beginningBalance: string;
    accountType: string;
    createBudget: boolean;
    frequency: Frequency;
    startDate: string;
    icon: string;
}