import { Frequency } from "../entities/budget-period.model"

export interface NewAccountBudget {
    createBudget: true,
    startDate: Date
    frequency: Frequency
}