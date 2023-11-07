import { FC, ReactNode, useEffect } from 'react'
import { Container, Spinner } from 'react-bootstrap';
import { useAuth, useSigninCheck } from 'reactfire';
import { LoginPage } from '../pages/LoginPage';
import useQueryParam from '../hooks/useQueryParams';
import { LOCAL_STORAGE_KEYS } from '../utils/shared/constants';
import { signInWithEmailLink, signOut } from 'firebase/auth';
import { Header } from './Header';

interface IProps {
    children: ReactNode
}

/**
* @author
* @function @PrivateRoute
**/

export const PrivateRoute: FC<IProps> = (props) => {
    const { status, data: signInCheckResult } = useSigninCheck();
    const { emailSigningFinished } = useQueryParam();
    const auth = useAuth();

    useEffect(() => {
        if (!emailSigningFinished) {
            return;
        }
        const email = window.localStorage.getItem(LOCAL_STORAGE_KEYS.MAGIC_LINK_EMAIL);
        console.log('email', email);

        if (!email) {
            throw Error("No email found");
        }

        signInWithEmailLink(auth, email).catch(e => console.error('Somthing brokne', e));
    }, [emailSigningFinished, auth])

    if (status === 'loading') {
        return <div className='h-100 center'><Spinner /></div>
    }

    if (signInCheckResult.signedIn === false) {
        return <LoginPage />
    }

    const handleLogout = () => {
        signOut(auth);
    }



    return (
        <div>
            <Header handleLogout={handleLogout} />
            <Container className='pt-4'>
                {props.children}
            </Container>
        </div>
    )
}
