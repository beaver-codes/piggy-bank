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
    const [account, setAccount] = useState<Account | null>(null)

    useEffect(() => {
        if (accountsLoaded && accounts.length > 0 && !account) {
            setAccount(accounts[0])
        }
    }, [accountsLoaded, accounts, account, setAccount])

    const changeSelectedAccount = (accountId: string) => {
        const account = accounts.find(a => a.id === accountId)
        if (account) {
            setAccount(account)
        }
    }

    if (!accountsLoaded) {
        return <div className="center"><Spinner /></div>
    }

    return (
        <accountContext.Provider value={{ account: account, allAccounts: accounts, setSelectedAccount: changeSelectedAccount }}>
            {props.children}
        </accountContext.Provider>
    )
}