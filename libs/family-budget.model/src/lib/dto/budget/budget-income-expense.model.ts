import { Logger } from "@nestjs/common";

export class BudgetIncomeExpenseDto {
    totalIncome: number;
    totalExpense: number;

    constructor(
        income: number | string,
        expense: number | string
    ) {
        this.totalIncome = income ? parseFloat(income?.toString()): 0;
        this.totalExpense = expense ? parseFloat(expense?.toString()): 0;
    }
}