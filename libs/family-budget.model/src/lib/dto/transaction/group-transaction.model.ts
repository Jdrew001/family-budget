import { Budget } from "../../entities/budget.model";
import { Category, CategoryType } from "../../entities/category.model";
import { Transaction } from "../../entities/transaction.model";

export class GroupTransaction {
    groupName: string = '';
    transactions: Array<TransactionDto> = [];

    constructor(groupName: string, transactions: Array<TransactionDto>) {
        this.groupName = groupName;
        this.transactions = transactions;
    }
}

export interface TransactionQueryDto {
    id: string;
    description: string;
    amount: number;
    createdAt: any,
    createdBt: string,
    categoryId: string,
    categoryType: CategoryType,
    categoryName: string,
    categoryIcon: string,
    budgetId: string,
    budgetStartDate: string,
    budgetEndDate: string,
    budgetActiveInd: boolean,
    transactionGroup: string
}

export interface TransactionDto {
    id: string;
    description: string;
    date: string;
    showRed: boolean;
    amount: number;
    categoryId?: string;
    categoryType?: CategoryType;
    categoryName?: string;
    icon: string;
    budget?: Budget;
    category?: Category;
    transactionType?: number;
    budgetId?: string;
    budgetStartDate?: string;
    budgetEndDate?: string;
    budgetActiveInd?: boolean;
    addedBy?: string;
    groupName?: string;
}

export interface TransactionGroupRequest {
    page: number;
    size: number;
    accountId: string;
    userId: string;
}