export interface CurrentBudgetSummary {
    displayDate: string;
    leftSpendingAmount: string;
    leftSpendingDays: number;
    income: TypeAmount;
    expense: TypeAmount
}

export interface TypeAmount {
    amount: string;
    icon: string;
}