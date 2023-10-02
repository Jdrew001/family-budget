export interface LeftSpendingManage {
    id: string;
    displayDate: string;
    leftSpendingAmount: string;
    leftSpendingDays: number;
    percentageSpent: number;
    totalSpent: string;
    totalBudget: string;
}

export interface BudgetCategory {
    id: string;
    icon: string;
    percentageSpent: number;
    name: string;
    remaining: string;
    budgeted: string;
    spent: string;
}