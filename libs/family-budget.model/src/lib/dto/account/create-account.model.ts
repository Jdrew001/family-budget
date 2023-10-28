import { Frequency } from "@family-budget/family-budget.model";

export interface CreateAccountDto {
    name: string;
    description: string;
    accountType: string;
    createBudget: boolean;
    startDate: Date;
    frequency: Frequency;
}