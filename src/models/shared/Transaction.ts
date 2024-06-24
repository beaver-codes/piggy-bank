export interface Transaction {
    id?: string
    amount: number
    balanceAfter?: number
    description: string
    type: TransactionType
    createdAt: Date
}

export type TransactionType = 'withdraw' | 'deposit';

