export interface ManageTransactionDto {
    id: string;
    account: string;
    description: string;
    category: string;
    amount: string;
    date: Date
}