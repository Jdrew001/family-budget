export interface CreateTransactionDto {
    account: string;
    description: string;
    category: string;
    amount: string;
    date: string;
}

export enum TransactionAction {
    Add,
    Edit
}