import React, { useEffect } from 'react'
import { useAccount } from '../contexts/AccountContext';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '../utils/shared/constants';
import { Card } from 'react-bootstrap';
import { formatAmount } from '../utils/formats';
import { AdvancedButton } from '../components/AdvancedButton';


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

    return <div>
        <h2>{account?.name}</h2>

        <Card>
            <Card.Body>
                <div className='d-flex'>
                    <div className='center mx-5'>

                        <i className="bi bi-piggy-bank fs-1" />
                    </div>
                    <div>
                        <label >Balance</label>
                        <div className='fs-4'>{formatAmount(account?.balance || 0, account?.currency)}</div>
                    </div>
                </div>
            </Card.Body>
        </Card>

        <div className='d-flex gap my-3'>

            <AdvancedButton variant='outline-primary' icon='bi-box-arrow-in-up'>Add money</AdvancedButton>
            <AdvancedButton variant='outline-primary' icon='bi-box-arrow-down'>Take money out</AdvancedButton>
        </div>
    </div>
}
export default AccountPage;
