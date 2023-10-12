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

    public static getShortDateString(startDateParam: string, endDateParam: string) {
        const startDate = new Date(startDateParam);
        const endDate = new Date(endDateParam);
        const displayDate = `${startDate.toLocaleString('default', { month: 'short' })} ${startDate.getDate()} - ${endDate.toLocaleString('default', { month: 'short' })} ${endDate.getDate()}`;
        return displayDate;
    }

    public static getShortDate(dateParam: string) {
        const startDate = new Date(dateParam);
        const displayDate = `${startDate.toLocaleString('default', { month: 'short' })} ${startDate.getDate()}, ${startDate.getFullYear()}`;
        return displayDate;
    }

    public static getYYYYMMDD(date: string) {
        // format YYYY-MM-DD - include leading zeros
        const startDate = new Date(date);
        const month = startDate.getMonth() + 1;
        const day = startDate.getDate();
        const year = startDate.getFullYear();
        const displayDate = `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
        return displayDate;
    }
}