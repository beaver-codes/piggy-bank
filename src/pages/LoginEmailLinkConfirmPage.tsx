import { FC, useState } from 'react'
import { Form } from 'react-bootstrap'
import { useForm } from 'react-hook-form';
import { AdvancedButton } from '../components/AdvancedButton';
import { texts } from '../utils/texts';

interface IProps {
    onSubmit: (email: string) => Promise<void>
}

/**
* @author
* @function @LoginPage
**/
type Inputs = {
    email: string
};

export const LoginEmailLinkConfirmPage: FC<IProps> = (props) => {
    const { register, handleSubmit, watch } = useForm<Inputs>();
    const [processing, setProcessing] = useState(false);

    const hasEmail = !!watch('email');

    const handleLogin = async (data: Inputs) => {
        setProcessing(true);

        await props.onSubmit(data.email);

        setProcessing(false);
    }


    return (
        <div className='center flex-1'>
            <Form onSubmit={handleSubmit(handleLogin)}>
                <Form.Group className="mb-3">
                    <Form.Label>Confirm Email Address</Form.Label>
                    <p className='text-muted'>Please reenter the same email you used during sign in</p>
                    <Form.Control type="email" placeholder={texts.enterEmail} {...register('email')} />
                    <div className='d-flex justify-content-end'>
                        <AdvancedButton processing={processing} className='mt-3' variant="primary" type="submit" disabled={!hasEmail}>{texts.login}</AdvancedButton>
                    </div>
                </Form.Group>
            </Form>
        </div>
    )
}
