import React from 'react'
import { Transaction, TransactionType } from '../models/shared/Transaction'

interface Props {
    transaction: Transaction
}


const ICON_NAME: Record<TransactionType, string> = {
    deposit: 'bi-box-arrow-in-up',
    withdraw: 'bi-box-arrow-down',
}

function TransactionTypeRender(props: Props) {
    const name = props.transaction.type.charAt(0).toUpperCase() + props.transaction.type.slice(1)
    return <span><i className={`bi me-2 ${ICON_NAME[props.transaction.type]}`} />{name}</span>
}

export default TransactionTypeRender
