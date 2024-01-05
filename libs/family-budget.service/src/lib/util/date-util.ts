import { Frequency } from "@family-budget/family-budget.model";
import * as moment from 'moment-timezone';

export class DateUtils {
    // if payperiod is weekly, then the end date is 7 days - 1 from the start date
    // if payperiod is biweekly, then the end date is 14 days - 1 from the start date
    // if payperiod is monthly, then the end date is 30 days - 1 from the start date

    public static daysLeftCalculation(endDate: Date, timezone: string) {
        const presentTime = moment.tz(new Date(), timezone).toDate().getTime();
        const endTime = endDate.getTime();

        const timeDiff = endTime - presentTime;
        const unformatedDaysLeft = timeDiff / (1000 * 3600 * 24);
        const daysLeft = Math.ceil(unformatedDaysLeft * 2) / 2;
        return daysLeft;
    }


    // code the first comment
    public static calculateEndDate(startDate: Date, payPeriod: Frequency, timezone: string) {
        let date;

        switch (payPeriod) {
            case Frequency.Weekly:
                date = moment.utc(startDate, timezone as string).add(1, 'weeks').subtract(1, 'day').endOf('day');
                break;
            case Frequency.BiWeekly:
                date = moment.utc(startDate, timezone as string).add(2, 'weeks').subtract(1, 'day').endOf('day');
                break;
            case Frequency.Monthly:
                date = moment.utc(startDate, timezone as string).add(1, 'month').subtract(1, 'day').endOf('day');
                break;
            case Frequency.Quarterly:
                date = moment.utc(startDate, timezone as string).add(3, 'month').subtract(1, 'day').endOf('day');
                break;
            case Frequency.Yearly:
                date = moment.utc(startDate, timezone as string).add(1, 'year').subtract(1, 'day').endOf('day');
                break;
            default:
                date = moment.utc(startDate, timezone as string).add(1, 'weeks').subtract(1, 'day').endOf('day');
                break;
        }
        return date;
    }

    public static getShortDateString(startDateParam: Date, endDateParam: Date, userTimezone: string) {
        const startDate = moment.tz(startDateParam, userTimezone);
        const endDate = moment.tz(endDateParam, userTimezone);
        const displayDate = `${startDate.format('MMM D')} - ${endDate.format('MMM D')}`;
        return displayDate;
    }

    public static getShortDate(dateParam: Date, timezone: string) {
        const date = moment.tz(dateParam, timezone);
        const displayDate = `${date.format('MMM D, YYYY')}`;
        return displayDate;
    }

    public static getDateTimezone(dateParam: Date, timezone: string) {
        return moment.tz(dateParam, timezone).toDate();
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