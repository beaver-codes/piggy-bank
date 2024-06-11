import { FC, ReactNode, useEffect } from 'react'
import { Container, Spinner } from 'react-bootstrap';
import { useAuth, useSigninCheck } from 'reactfire';
import { LoginPage } from '../pages/LoginPage';
import useQueryParam from '../hooks/useQueryParams';
import { LOCAL_STORAGE_KEYS } from '../utils/shared/constants';
import { signInWithEmailLink, signOut } from 'firebase/auth';
import { Header } from './Header';
import { LoginEmailLinkConfirmPage } from '../pages/LoginEmailLinkConfirmPage';
import { toast } from 'react-toastify';

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
        if (!emailSigningFinished || signInCheckResult?.signedIn) {
            return;
        }
        const email = window.localStorage.getItem(LOCAL_STORAGE_KEYS.MAGIC_LINK_EMAIL);
        if (!email) {
            return;
        }

        signInWithEmailLink(auth, email).catch(e => {
            console.error('Somthing brokne', e)
        });
    }, [emailSigningFinished, auth, signInCheckResult?.signedIn])

    const handleLinkEmailConfirm = async (email: string) => {
        signInWithEmailLink(auth, email).catch(e => {
            console.error('Somthing brokne', e)
            toast.error('Failed to match the email');
        });
    };

    if (status === 'loading') {
        return <div className='h-100 center'><Spinner /></div>
    }


    if (signInCheckResult?.signedIn === false) {
        if (emailSigningFinished) {
            return <LoginEmailLinkConfirmPage onSubmit={handleLinkEmailConfirm} />
        }
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
