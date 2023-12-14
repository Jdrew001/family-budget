import { CircleGuageModel } from "../shared/circle-guage.model";

export interface SummaryTransactions {
    id: string;
    date: string;
    amount: string;
    description: string;
    categoryName: string;
    categoryIcon: string;
    transactionType: number;
    showRed: boolean;
    addedBy: string;
    circleGuage: CircleGuageModel;
}