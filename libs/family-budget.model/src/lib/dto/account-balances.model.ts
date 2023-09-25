export interface AccountBalance {
    accountId: string;
    accountName: string;
    accountOrder: number;
    balance: {
        id?: string;
        amount: number;
        dateTime: Date;
    }
}