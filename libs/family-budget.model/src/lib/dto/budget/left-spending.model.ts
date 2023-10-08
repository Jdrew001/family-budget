export interface LeftSpendingManage {
    accountId?: string;
    accountName?: string;
    id: string;
    displayDate: string;
    leftSpendingAmount: string;
    leftSpendingDays: number;
    percentageSpent: number;
    totalSpent: string;
    totalBudget: string;
    totalSpentIcon?: string;
    totalBudgetIcon?: string;
}

export interface BudgetCategoryManage {
    id: string;
    icon: string;
    percentageSpent: number;
    name: string;
    remaining: string;
    budgeted: string;
    spent: string;
}