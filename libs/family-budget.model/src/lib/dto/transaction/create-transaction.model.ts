export interface CreateTransactionDto {
    account: string;
    description: string;
    category: string;
    amount: number;
    date: string;
}

export enum TransactionAction {
    Add,
    Edit
}