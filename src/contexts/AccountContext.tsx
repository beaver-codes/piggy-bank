import React, { createContext, useEffect, useState } from "react";
import { Account } from "../models/shared/Account";
import { useFirebaseQueryOptions } from "../hooks/firebaseHooks";
import { COLLECTIONS } from "../utils/shared/constants";
import { useAuth } from "reactfire";
import { where } from "firebase/firestore";
import { Spinner } from "react-bootstrap";

interface AccountContext {
    account: Account | null
    allAccounts: Account[]
    setSelectedAccount: (accountId: string) => void
}

const accountContext = createContext<AccountContext>({
    account: null,
    allAccounts: [],
    setSelectedAccount: () => { }
})

export const useAccount = () => React.useContext(accountContext);

interface Props {
    children: React.ReactNode
}
export const AccountProvider = (props: Props) => {
    const { currentUser } = useAuth()
    const [accounts, , accountsLoaded] = useFirebaseQueryOptions<Account>(COLLECTIONS.ACCOUNTS, {
        queryConstraints: [where('ownerId', '==', currentUser?.uid)],
        skip: !currentUser
    })
    const [accountId, setAccountId] = useState<string>('')

    useEffect(() => {
        if (accountsLoaded && accounts.length > 0 && !accountId) {
            setAccountId(accounts[0].id || '')
        }
    }, [accountsLoaded, accounts, accountId, setAccountId])

    const account = accounts.find(a => a.id === accountId) || null
    if (!accountsLoaded || (accounts.length > 0 && !account)) {
        return <div className="center"><Spinner /></div>
    }

    return (
        <accountContext.Provider value={{ account: account, allAccounts: accounts, setSelectedAccount: setAccountId }}>
            {props.children}
        </accountContext.Provider>
    )
}