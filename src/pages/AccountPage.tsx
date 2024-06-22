import React, { useEffect } from 'react'
import { useAccount } from '../contexts/AccountContext';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '../utils/shared/constants';


interface Props { }

function AccountPage(props: Props) {
    const { account } = useAccount()
    const navigate = useNavigate();

    useEffect(() => {
        if (account) {
            return
        }
        navigate(PATHS.accountSettings)
    }, [account, navigate])

    return <div>Account</div>
}
export default AccountPage;
