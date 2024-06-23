export interface Transaction {
    id?: string
    amount: number
    type: TransactionType
}

export type TransactionType = 'withdraw' | 'insert'

