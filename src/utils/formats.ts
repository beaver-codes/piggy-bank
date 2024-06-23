export const formatAmount = (input: string | number | null | undefined, currency?: string): string => {
    const value = input ? Number(input) : 0;
    return limitDecimals(value) + ' ' + currency;
}

export const decimalFormatter = new Intl.NumberFormat("en-us", {
    style: "decimal",
    minimumSignificantDigits: 1,
    maximumSignificantDigits: 4,
});

export const limitDecimals = (value: number) => decimalFormatter.format(value);
