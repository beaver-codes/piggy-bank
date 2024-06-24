import React, { FC, useEffect } from 'react'
import { Form } from 'react-bootstrap';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useAuth, useFirestore } from 'reactfire';
import { Account } from '../models/shared/Account';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import { COLLECTIONS } from '../utils/shared/constants';
import { toast } from 'react-toastify';
import { AdvancedButton } from '../components/AdvancedButton';
import { useNavigate, useParams } from 'react-router-dom';
import { useFirebaseDoc } from '../hooks/firebaseHooks';

interface IProps { }

/**
* @author
* @function @TestPage
**/
type Inputs = {
    name: string,
    currency: string,
    allowence: number
    interestRate: number
};

export const AccountSettingsPage: FC<IProps> = (props) => {
    const { accountId } = useParams<{ accountId: string }>()
    const { register, handleSubmit, formState: { errors }, setValue } = useForm<Inputs>({
        defaultValues: {
            name: '',
            currency: 'kr',
            allowence: 0,
            interestRate: 0
        }
    });
    const [account] = useFirebaseDoc<Account>(`${COLLECTIONS.ACCOUNTS}/${accountId}`)
    const { currentUser } = useAuth();
    const firestore = useFirestore();
    const [processing, setProcessing] = React.useState(false)
    const navigate = useNavigate();

    useEffect(() => {
        if (!account) {
            return
        }

        setValue('name', account.name)
        setValue('currency', account.currency)
        setValue('allowence', account.allowence || 0)
        setValue('interestRate', account.interestRate || 0)
    }, [account, setValue])



    const onSubmit: SubmitHandler<Inputs> = async data => {
        setProcessing(true)
        const accountUpdate = {
            ...data,
        }

        try {
            if (accountId) {
                await setDoc(doc(firestore, `${COLLECTIONS.ACCOUNTS}/${accountId}`), accountUpdate, { merge: true });
                toast.success('Account updated')
            } else {
                const newAccount: Account = {
                    ...accountUpdate,
                    createdAt: new Date(),
                    ownerId: currentUser?.uid || '',
                    balance: 0,
                    accruedInterest: 0,
                }

                await addDoc(collection(firestore, COLLECTIONS.ACCOUNTS), newAccount)
                toast.success('Account created')
                navigate('/')
            }

        } catch (error) {
            console.error(error)
            toast.error('Failed to create account')
        }

        setProcessing(false)

    }



    return (
        <div>
            <h2>{account ? 'Update account' : 'New account'}</h2>

            <Form onSubmit={handleSubmit(onSubmit)}>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Name</Form.Label>
                    <Form.Control type="text" placeholder="Enter account name" {...register("name", { required: true })} isInvalid={!!errors.name} />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Currency</Form.Label>
                    <Form.Control type="text" {...register("currency", { required: true })} isInvalid={!!errors.currency} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Monthly allowence</Form.Label>
                    <Form.Control type="number" placeholder="Enter amount" {...register("allowence", { valueAsNumber: true })} min={0} step={0.01} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Interest rate (%)</Form.Label>
                    <Form.Control type="number" placeholder="Enter rate" {...register("interestRate", { valueAsNumber: true })}
                        min={0}
                        step={0.01}
                        max={300}
                    />
                </Form.Group>

                <div className="d-flex gap">

                    {accountId && <AdvancedButton icon='bi-arrow-left' variant='secondary'
                        onClick={() => navigate('/')}
                    >Back</AdvancedButton>}
                    <AdvancedButton processing={processing} icon='bi-floppy' type='submit'>Save</AdvancedButton>
                </div>
            </Form>
        </div>
    )
}
