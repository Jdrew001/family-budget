export class ConversionUtils {
    
    /**
     * Converts a string formatted as USD currency to a number.
     * @param value The USD currency string to convert.
     * @returns The number representation of the USD currency string.
     */
    public static convertFormatUSDToNumber(value: string): number {
        return Number(value.replace(/[^0-9.-]+/g,""));
    }
}