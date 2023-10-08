export interface AccountBalance {
    accountId: string;
    accountName: string;
    accountOrder: number;
    icon?: string
    balance: {
        id?: string;
        amount: number;
        dateTime: Date;
    }
}