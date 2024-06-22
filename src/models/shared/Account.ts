export interface Account {
    id?: string
    name: string
    currency: string,
    ownerId: string,

    balance: number,
    accruedInterest: number,

    createdAt: Date
}
