import { CircleGuageModel } from "../shared/circle-guage.model";

export interface SummaryTransactions {
    id: string;
    date: string;
    amount: string;
    description: string;
    category: string;
    categoryIcon: string;
    transactionType: number;
    showRed: boolean;
    circleGuage: CircleGuageModel;
}