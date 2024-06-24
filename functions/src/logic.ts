import { logger } from "firebase-functions/v1"
import { Transaction } from "./models/shared/Transaction"
import * as admin from 'firebase-admin';
import { COLLECTIONS } from "./utils/shared/constants";
import { fromFirebaseDoc } from "./utils/shared/firebase";
import { Account } from "./models/shared/Account";


export const processTransaction = async (transaction: Transaction, accountId: string) => {
    logger.info(`Processing transaction: ${transaction.id} in account ${accountId}`);

    const accountRef = admin.firestore().doc(`${COLLECTIONS.ACCOUNTS}/${accountId}`);
    const accountSnap = await accountRef.get();
    const account = fromFirebaseDoc<Account>(accountSnap);

    const updatedBalance = account.balance + transaction.amount;

    await accountRef.update({ balance: updatedBalance });

    const transactionUpdate: Partial<Transaction> = {
        balanceAfter: updatedBalance,
    }
    await accountRef.collection(COLLECTIONS.TRANSACTIONS).doc(transaction.id || '').update(transactionUpdate);
}
