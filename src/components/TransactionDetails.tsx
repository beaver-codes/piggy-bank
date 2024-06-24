import React, { useEffect } from 'react'
import { Transaction } from '../models/shared/Transaction'
import { Button } from 'react-bootstrap';
import TransactionTypeRender from './TransactionTypeRender';
import { formatAmount } from '../utils/formats';

interface Props {
    transaction: Transaction | null
    currency: string
    onHide: () => void
}

const WITDTH = 400;

function TransactionDetails(props: Props) {

    const { transaction } = props;

    useEffect(() => {
        if (!transaction) {
            return
        }

        setTimeout(() => {
            document.onclick = props.onHide
        }, 300)

        return () => {
            document.onclick = null
        }

    }, [transaction, props.onHide])

    const renderContent = () => {
        if (!transaction) {
            return null;
        }
        const after = transaction.balanceAfter || 0
        const before = after - transaction.amount

        return <div className='d-flex flex-column gap'>
            <div >
                <label className='fs-7'>Date</label>
                <div>{transaction.createdAt.toLocaleString()}</div>
            </div>
            <div >
                <label className='fs-7'>Type</label>
                <div><TransactionTypeRender transaction={transaction} /></div>
            </div>

            <div>
                <label className='fs-7'>Amounts</label>
                <div className='row fs-7'>
                    <div className='col'>
                        <label>Before</label>
                    </div>
                    <div className='col text-end'>
                        <label>{formatAmount(before, props.currency)}</label>
                    </div>
                </div>
                <div className='row fw-bold'>
                    <div className='col'>
                        <label>Amount</label>
                    </div>
                    <div className='col text-end'>
                        <label>{formatAmount(transaction.amount, props.currency)}</label>
                    </div>
                </div>
                <div className='row fs-7'>
                    <div className='col'>
                        <label>After</label>
                    </div>
                    <div className='col text-end'>
                        <label>{formatAmount(after, props.currency)}</label>
                    </div>
                </div>
            </div>

            <div>
                <label className='fs-7'>Description</label>
                <div>{transaction.description}</div>
            </div>
        </div>
    }

    return <div className='position-fixed h-100v border bg-light p-3'
        onClick={e => e.stopPropagation()}
        style={{
            top: 0,
            right: transaction ? 0 : -WITDTH,
            height: '100vh',
            width: WITDTH,
            transition: 'right 0.3s',
        }}
    >
        <div className="d-flex justify-content-between">
            <h4>Transaction Details</h4>
            <Button onClick={props.onHide} size='sm'><i className='bi bi-x ' /></Button>
        </div>

        {renderContent()}

    </div>
}

export default TransactionDetails
