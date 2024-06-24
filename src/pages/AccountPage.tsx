import React, { useEffect, useState } from 'react'
import { useAccount } from '../contexts/AccountContext';
import { useNavigate } from 'react-router-dom';
import { COLLECTIONS, PATHS } from '../utils/shared/constants';
import { Card } from 'react-bootstrap';
import { formatAmount } from '../utils/formats';
import { AdvancedButton } from '../components/AdvancedButton';
import NewTransactionModal from '../components/NewTransactionModal';
import { Transaction, TransactionType } from '../models/shared/Transaction';
import { useFirebaseQuery } from '../hooks/firebaseHooks';
import { orderBy } from 'firebase/firestore';
import { DataTable } from '../components/DataTable';


interface Props { }

function AccountPage(props: Props) {
    const { account } = useAccount()
    const navigate = useNavigate();
    const [showModalType, setShowModalType] = useState<TransactionType | null>(null);
    const [transactions] = useFirebaseQuery<Transaction>(`${COLLECTIONS.ACCOUNTS}/${account?.id}/${COLLECTIONS.TRANSACTIONS}`,
        orderBy('createdAt', 'desc')
    )

    useEffect(() => {
        if (account) {
            return
        }
        navigate(PATHS.accountSettings)
    }, [account, navigate])

    if (!account) {
        return null;
    }

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
                        <div className='fs-4'>{formatAmount(account?.balance || 0, account.currency)}</div>
                    </div>
                </div>
            </Card.Body>
        </Card>

        <div className='d-flex gap my-3'>

            <AdvancedButton variant='outline-primary' icon='bi-box-arrow-in-up'
                onClick={() => setShowModalType('deposit')}
            >
                Add money</AdvancedButton>
            <AdvancedButton variant='outline-primary' icon='bi-box-arrow-down'
                onClick={() => setShowModalType('withdraw')}>
                Take money out</AdvancedButton>
        </div>

        {showModalType && <NewTransactionModal
            account={account}
            operation={showModalType}
            onHide={() => setShowModalType(null)}
        />}


        <DataTable
            data={transactions}
            columns={[
                { label: 'Date', render: t => t.createdAt.toLocaleDateString() },
                {
                    label: 'Amount', align: 'right', render: t => <span className={t.amount > 0 ? 'text-success' : ''}>
                        {formatAmount(t.amount, account.currency)}
                    </span>
                },

            ]}
        />
    </div>
}
export default AccountPage;
