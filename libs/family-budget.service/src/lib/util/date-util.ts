import { Frequency } from "@family-budget/family-budget.model";

export class DateUtils {
    // if payperiod is weekly, then the end date is 7 days - 1 from the start date
    // if payperiod is biweekly, then the end date is 14 days - 1 from the start date
    // if payperiod is monthly, then the end date is 30 days - 1 from the start date


    // code the first comment
    public static calculateEndDate(startDate: Date, payPeriod: Frequency) {
        let endDate = new Date(startDate);
        switch (payPeriod) {
            case Frequency.Weekly:
                endDate.setDate(startDate.getDate() + 6);
                break;
            case Frequency.BiWeekly:
                endDate.setDate(startDate.getDate() + 13);
                break;
            case Frequency.Monthly:
                endDate.setDate(startDate.getDate() + 29);
                break;
            case Frequency.Quarterly:
                endDate.setDate(startDate.getDate() + 89);
                break;
            case Frequency.Yearly:
                endDate.setDate(startDate.getDate() + 364);
                break;
            default:
                endDate.setDate(startDate.getDate() + 6);
                break;
        }
        return endDate;
    }
}