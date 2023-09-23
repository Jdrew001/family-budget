export interface AccountBalance {
    accountId: string;
    accountName: string;
    balance: {
        id: string;
        amount: number;
        dateTime: Date;
    }
}