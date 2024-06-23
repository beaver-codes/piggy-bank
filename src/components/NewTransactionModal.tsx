import React from 'react'
import { Account } from '../models/shared/Account';
import { FormControl, FormGroup, FormLabel, Modal } from 'react-bootstrap';
import { Transaction, TransactionType } from '../models/shared/Transaction';
import { AdvancedButton } from './AdvancedButton';
import { useForm } from 'react-hook-form';
import { addDoc, collection } from 'firebase/firestore';
import { useFirestore } from 'reactfire';
import { COLLECTIONS } from '../utils/shared/constants';
import { toast } from 'react-toastify';

interface Props {
    account: Account
    operation: TransactionType;
    onHide: () => void
}

interface Inputs {
    amount: number;
    description: string
}

function NewTransactionModal(props: Props) {
    const { register, handleSubmit, formState: { errors } } = useForm<Inputs>();
    const [processing, setProcessing] = React.useState(false)
    const firestore = useFirestore();

    const onSubmit = async (data: Inputs) => {
        setProcessing(true)
        const newTransaction: Transaction = {
            ...data,
            type: props.operation,
            createdAt: new Date(),
        }

        try {
            await addDoc(collection(firestore, `${COLLECTIONS.ACCOUNTS}/${props.account.id}/${COLLECTIONS.TRANSACTIONS}`), newTransaction);
            toast.success('Transaction saved')
            props.onHide()
        } catch (error) {
            console.error(error)
            toast.error('Failed to save transaction')
        }
        setProcessing(false)
    }

    return <Modal show={true} onHide={props.onHide} >
        <Modal.Header closeButton>
            {props.operation === 'withdraw' ? 'Take money out' : 'Add more money'}
        </Modal.Header>
        <form onSubmit={handleSubmit(onSubmit)}>
            <Modal.Body className='d-flex flex-column gap'>

                <FormGroup>
                    <FormLabel>Amount</FormLabel>
                    <FormControl type='number' {...register('amount', {
                        validate: value => value > 0 || 'Amount must be greater than 0',
                        valueAsNumber: true
                    })} min={0}
                        step={0.01}
                        isInvalid={!!errors.amount}
                    />
                </FormGroup>
                <FormGroup>
                    <FormLabel>Description</FormLabel>
                    <FormControl type='text' {...register('description', { required: true })}
                        isInvalid={!!errors.description}
                    />
                </FormGroup>
            </Modal.Body>
            <Modal.Footer>
                <AdvancedButton variant='secondary' icon="bi-x" onClick={props.onHide}>Cancel</AdvancedButton>
                <AdvancedButton processing={processing} type='submit' icon='bi-floppy'>Confirm</AdvancedButton>
            </Modal.Footer>
        </form>
    </Modal>
}

export default NewTransactionModal
