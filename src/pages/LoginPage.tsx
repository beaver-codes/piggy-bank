import React, { FC, useState } from 'react'
import { Form } from 'react-bootstrap'
import { useForm } from 'react-hook-form';
import { LOCAL_STORAGE_KEYS, QUERY_PARAMS } from '../utils/shared/constants';
import { sendSignInLinkToEmail } from 'firebase/auth';
import { useAuth } from 'reactfire';
import { AdvancedButton } from '../components/AdvancedButton';
import { texts } from '../utils/texts';
import { addQueryParam } from '../hooks/useQueryParams';

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

        const params = addQueryParam(QUERY_PARAMS.EMAIL_SIGNIN_FINISHED, 'true');
        const url = window.location.origin + window.location.pathname + '?' + params;
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
                    <AdvancedButton processing={processing} className='mt-3' variant="primary" type="submit" disabled={!hasEmail}>{texts.login}</AdvancedButton>
                </div>
            </Form.Group>
        </Form>
    }
    return (

        <div className='center flex-1'>
            <div className='d-flex border border-funky flex-1 m-3' style={{ minHeight: 600, maxWidth: 1200 }}>
                <div className='col-md-6 bg-primary text-white p-3 d-none d-md-flex justify-content-between border-funky'>
                    <h3 className='text-white'>{texts.brand}</h3>

                    <p className='text-white mt-auto mb-3'>{texts.description}</p>
                </div>

                <div className='col-md-6 flex-1 py-3 center'>
                    {renderSigninForm()}
                </div>
            </div>
        </div>
    )
}
