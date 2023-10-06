import { Budget } from "../../entities/budget.model";
import { Category } from "../../entities/category.model";
import { Transaction } from "../../entities/transaction.model";

export class GroupTransaction {
    groupName: string = '';
    transactions: Array<TransactionDto> = [];

    constructor(groupName: string, transactions: Array<TransactionDto>) {
        this.groupName = groupName;
        this.transactions = transactions;
    }
}

export interface TransactionDto {
    id: string;
    description: string;
    date: string;
    showRed: boolean;
    amount: number;
    budget: Budget,
    category: Category
}

export interface TransactionGroupRequest {
    page: number;
    size: number;
    accountId: string;
    userId: string;
}