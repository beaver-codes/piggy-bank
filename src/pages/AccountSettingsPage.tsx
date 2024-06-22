import React, { FC } from 'react'
import { Form } from 'react-bootstrap';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useAuth, useFirestore } from 'reactfire';
import { Account } from '../models/shared/Account';
import { addDoc, collection } from 'firebase/firestore';
import { COLLECTIONS } from '../utils/shared/constants';
import { toast } from 'react-toastify';
import { AdvancedButton } from '../components/AdvancedButton';
import { useNavigate } from 'react-router-dom';

interface IProps { }

/**
* @author
* @function @TestPage
**/
type Inputs = {
    name: string,
    currency: string,
};

export const AccountSettingsPage: FC<IProps> = (props) => {
    const { register, handleSubmit, formState: { errors } } = useForm<Inputs>({
        defaultValues: {
            name: '',
            currency: 'kr'
        }
    });
    const { currentUser } = useAuth();
    const firestore = useFirestore();
    const [processing, setProcessing] = React.useState(false)
    const navigate = useNavigate();

    const onSubmit: SubmitHandler<Inputs> = async data => {
        setProcessing(true)
        const newAccount: Account = {
            ...data,
            createdAt: new Date(),
            ownerId: currentUser?.uid || '',
            balance: 0,
            accruedInterest: 0,
        }

        try {
            await addDoc(collection(firestore, COLLECTIONS.ACCOUNTS), newAccount)
            toast.success('Account created')
            navigate('/')
        } catch (error) {
            console.error(error)
            toast.error('Failed to create account')
        }

        setProcessing(false)

    }



    return (
        <div>
            <h2>New account</h2>

            <Form onSubmit={handleSubmit(onSubmit)}>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Name</Form.Label>
                    <Form.Control type="text" placeholder="Enter name" {...register("name", { required: true })} isInvalid={!!errors.name} />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Currency</Form.Label>
                    <Form.Control type="text" placeholder="Enter currency" {...register("currency", { required: true })} isInvalid={!!errors.currency} />
                </Form.Group>

                <AdvancedButton processing={processing} icon='bi-floppy' type='submit'>Save</AdvancedButton>
            </Form>
        </div>
    )
}
