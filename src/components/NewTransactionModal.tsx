import React from 'react'
import { Account } from '../models/shared/Account';
import { Modal } from 'react-bootstrap';
import { TransactionType } from '../models/shared/Transaction';

interface Props {
    account: Account
    operation: TransactionType;
    onHide: () => void
}

// interface Input {
//     amount: number;
//     description: string
// }

function NewTransactionModal(props: Props) {

    return <Modal show={true} onHide={props.onHide}>
        <Modal.Header>
            {props.operation === 'withdraw' ? 'Take money out' : 'Add more money'}
        </Modal.Header>
    </Modal>
}

export default NewTransactionModal
