export interface Account {
    id?: string
    name: string
    currency: string,
    ownerId: string,

    balance: number,
    accruedInterest: number,

    allowence: number
    interstRate: number

    createdAt: Date
}
