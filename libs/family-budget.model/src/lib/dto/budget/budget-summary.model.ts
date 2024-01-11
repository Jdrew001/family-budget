export class BudgetSummaryDto {
    whatsLeft: number;
    totalBudget: number;
    totalSpent: number;

    constructor(
        whatsLeft: number | string,
        totalBudget: number | string,
        totalSpent: number | string
    ) {
        this.whatsLeft = whatsLeft ? parseFloat(whatsLeft.toString()): 0;
        this.totalBudget = totalBudget ? parseFloat(totalBudget.toString()): 0;
        this.totalSpent = totalSpent ? parseFloat(totalSpent.toString()): 0;
    } 
}