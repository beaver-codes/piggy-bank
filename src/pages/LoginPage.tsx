import React, { FC, useState } from 'react'
import { Form } from 'react-bootstrap'
import { useForm } from 'react-hook-form';
import { LOCAL_STORAGE_KEYS, QUERY_PARAMS } from '../utils/shared/constants';
import { sendSignInLinkToEmail } from 'firebase/auth';
import { useAuth } from 'reactfire';
import { ButtonProcessing } from '../components/ButtonProcessing';
import { texts } from '../utils/texts';

interface IProps { }

/**
* @author
* @function @LoginPage
**/
type Inputs = {
    email: string
};

export const LoginPage: FC<IProps> = (props) => {
    const { register, handleSubmit, watch } = useForm<Inputs>();
    const [emailSent, setEmailSent] = useState(false);
    const auth = useAuth();
    const [processing, setProcessing] = useState(false);

    const hasEmail = !!watch('email');

    const handleLogin = async (data: Inputs) => {
        setProcessing(true);

        const url = window.location.href + `?${QUERY_PARAMS.EMAIL_SIGNIN_FINISHED}=true`;
        window.localStorage.setItem(LOCAL_STORAGE_KEYS.MAGIC_LINK_EMAIL, data.email);
        await sendSignInLinkToEmail(auth, data.email, {
            url,
            handleCodeInApp: true
        });
        setEmailSent(true);
        setProcessing(false);
    }


    const renderSigninForm = () => {
        if (emailSent) {
            return <div className='center flex-column'>
                <p>{texts.emailSentTo} <span className='text-bold'>{window.localStorage.getItem(LOCAL_STORAGE_KEYS.MAGIC_LINK_EMAIL)}</span>!</p>
                <p className='text-muted'>{texts.checkSpamFolder}</p>
            </div>
        }

        return <Form onSubmit={handleSubmit(handleLogin)}>
            <Form.Group className="mb-3">
                <Form.Label>{texts.emailAddress}</Form.Label>
                <Form.Control type="email" placeholder={texts.enterEmail} {...register('email')} />
                <div className='d-flex justify-content-end'>
                    <ButtonProcessing processing={processing} className='mt-3' variant="primary" type="submit" disabled={!hasEmail}>{texts.login}</ButtonProcessing>
                </div>
            </Form.Group>
        </Form>
    }
    return (
        <div className='h-100 center'>
            <div className='border'>
                <div className='bg-primary'>
                    <h4 className='text-center text-light p-4'>🎯 {texts.brand}</h4>
                </div>

                <div className='p-3'>
                    {renderSigninForm()}
                </div>
            </div>
        </div>
    )
}
