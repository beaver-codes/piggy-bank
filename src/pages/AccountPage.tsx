import React, { useEffect, useState } from 'react'
import { useAccount } from '../contexts/AccountContext';
import { Link, useNavigate } from 'react-router-dom';
import { COLLECTIONS, PATHS } from '../utils/shared/constants';
import { Button, Card } from 'react-bootstrap';
import { formatAmount } from '../utils/formats';
import { AdvancedButton } from '../components/AdvancedButton';
import NewTransactionModal from '../components/NewTransactionModal';
import { Transaction, TransactionType } from '../models/shared/Transaction';
import { useFirebaseQuery } from '../hooks/firebaseHooks';
import { orderBy } from 'firebase/firestore';
import { DataTable } from '../components/DataTable';
import TransactionDetails from '../components/TransactionDetails';
import TransactionTypeRender from '../components/TransactionTypeRender';


interface Props { }

function AccountPage(props: Props) {
    const { account } = useAccount()
    const navigate = useNavigate();
    const [showModalType, setShowModalType] = useState<TransactionType | null>(null);
    const [transactions] = useFirebaseQuery<Transaction>(`${COLLECTIONS.ACCOUNTS}/${account?.id}/${COLLECTIONS.TRANSACTIONS}`,
        orderBy('createdAt', 'desc')
    )
    const [showDetailsFor, setShowDetailsFor] = useState<Transaction | null>(null)

    useEffect(() => {
        if (account) {
            return
        }
        navigate(PATHS.accountSettings)
    }, [account, navigate])

    if (!account) {
        return null;
    }

    const DAY_MS = 1000 * 60 * 60 * 24;
    const now = new Date();
    const daysUntil = (date: Date) => Math.max(0, Math.ceil((date.getTime() - now.getTime()) / DAY_MS));
    const firstOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const formatWhen = (date: Date) => {
        const days = daysUntil(date);
        const when = days === 0 ? 'today' : days === 1 ? 'tomorrow' : `in ${days} days`;
        return `${when} · ${date.toLocaleDateString()}`;
    };

    const showAllowence = !!account.allowence && !!account.nextAllowenceAt;

    // Interest accrues once per day on the balance and is paid out (whole cents) on the 1st.
    // Estimate = already accrued + daily interest for each accrual left up to and including payout day.
    const showInterest = !!account.interestRate;
    const nextInterestPayoutAt = account.nextInterestPayoutAt || firstOfNextMonth;
    const nextAccrualAt = account.nextInterestAccrualAt || new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const accrualsLeft = Math.max(0, Math.round((nextInterestPayoutAt.getTime() - nextAccrualAt.getTime()) / DAY_MS) + 1);
    const dailyInterest = account.balance > 0 ? account.balance * (account.interestRate / 100) / 365 : 0;
    const estimatedInterest = Math.floor(Math.round(((account.accruedInterest || 0) + dailyInterest * accrualsLeft) * 1e6) / 1e4) / 100;

    // Balance after each transaction. Uses the stored balanceAfter when present; for older
    // transactions without it, derive it by walking back from the current balance
    // (transactions are sorted newest first).
    let runningBalance = account.balance || 0;
    const transactionsWithBalance: Transaction[] = transactions.map(t => {
        const balanceAfter = t.balanceAfter ?? runningBalance;
        runningBalance = balanceAfter - t.amount;
        return { ...t, balanceAfter };
    });

    return <div>
        <div className='d-flex justify-content-between align-items-start'>

            <h2>{account?.name}</h2>
            <Link to={`${PATHS.accountSettings}/${account.id}`}>
                <Button variant='outline-secondary' size='sm'>
                    <i className="bi bi-gear" />
                </Button>
            </Link>
        </div>

        <Card>
            <Card.Body>
                <div className='d-flex'>
                    <div className='center mx-5'>

                        <i className="bi bi-piggy-bank fs-1 text-primary" />
                    </div>
                    <div className='flex-1 d-flex justify-content-between gap flex-wrap'>

                        <div>
                            <label className='fs-7'>Balance</label>
                            <div className='fs-4'>{formatAmount(account?.balance || 0, account.currency)}</div>
                        </div>
                        {showAllowence && <div>
                            <label className='fs-7'>Next allowence</label>
                            <div className='fs-4'>{formatAmount(account.allowence, account.currency)}</div>
                            <div className='fs-7'>{formatWhen(account.nextAllowenceAt!)}</div>
                        </div>}
                        {showInterest && <div>
                            <label className='fs-7'>Next interest ({account.interestRate}% p.a.)</label>
                            <div className='fs-4'>≈ {formatAmount(estimatedInterest, account.currency)}</div>
                            <div className='fs-7'>{formatWhen(nextInterestPayoutAt)}</div>
                            <div className='fs-7'>{formatAmount(account.accruedInterest || 0, account.currency)} earned so far</div>
                        </div>}
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
            data={transactionsWithBalance}
            onRowClick={t => setShowDetailsFor(t)}
            columns={[
                { label: 'Date', render: t => t.createdAt.toLocaleDateString() },
                {
                    label: 'Type',
                    render: t => <TransactionTypeRender transaction={t} />
                },
                {
                    label: 'Amount', align: 'right', render: t => <span className={t.amount > 0 ? 'text-success' : ''}>
                        {formatAmount(t.amount, account.currency)}
                    </span>
                },

            ]}
        />

        <TransactionDetails transaction={showDetailsFor} onHide={() => { setShowDetailsFor(null) }} currency={account.currency} />
    </div>
}

export default AccountPage;

