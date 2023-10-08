export interface CurrentBudgetSummary {
    id: string;
    displayDate: string;
    leftSpendingAmount: string;
    leftSpendingDays: number;
    income: TypeAmount;
    expense: TypeAmount;
    showBudgetError: boolean;
    circleGuage: any;
}

export interface TypeAmount {
    amount: string;
    icon: string;
}