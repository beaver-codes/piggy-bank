export interface Account {
    id?: string
    name: string
    currency: string,
    ownerId: string,

    balance: number,
    accruedInterest: number,

    allowence: number
    interestRate: number

    createdAt: Date
    nextAllowenceAt?: Date
    nextInterestAccrualAt?: Date
}
