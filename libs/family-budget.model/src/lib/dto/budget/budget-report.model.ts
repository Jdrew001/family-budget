export class BudgetReportModel {
    categoryId: string;
    amountBudgeted: number;
    amountSpent: number;
    categoryName: string;
    difference: number;

    constructor(
        categoryId: string,
        amountBudgeted: number | string,
        amountSpent: number | string,
        categoryName: string,
        difference: number | string
    ) {
        this.categoryId = categoryId;
        this.amountBudgeted = parseFloat(amountBudgeted.toString());
        this.amountSpent = parseFloat(amountSpent.toString());
        this.categoryName = categoryName;
        this.difference = parseFloat(difference.toString());
    }
}