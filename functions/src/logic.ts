import { logger } from "firebase-functions/v1"
import { Transaction } from "./models/shared/Transaction"
import * as admin from 'firebase-admin';
import { COLLECTIONS } from "./utils/shared/constants";
import { fromFirebaseDoc, fromFirebaseDocs } from "./utils/shared/firebase";
import { Account } from "./models/shared/Account";


export const processTransaction = async (transaction: Transaction, accountId: string) => {
    logger.info(`Processing transaction: ${transaction.id} in account ${accountId}`);

    const accountRef = admin.firestore().doc(`${COLLECTIONS.ACCOUNTS}/${accountId}`);
    const transactionRef = accountRef.collection(COLLECTIONS.TRANSACTIONS).doc(transaction.id || '');

    // Run as a Firestore transaction so concurrent triggers (e.g. allowance + interest
    // created in the same daily run) can't read the same balance and overwrite each other.
    await admin.firestore().runTransaction(async tx => {
        const transactionSnap = await tx.get(transactionRef);
        // Firestore triggers are at-least-once; don't apply the same transaction twice.
        if (transactionSnap.get('balanceAfter') !== undefined) {
            logger.info(`Transaction ${transaction.id} already processed, skipping`);
            return;
        }

        const accountSnap = await tx.get(accountRef);
        const account = fromFirebaseDoc<Account>(accountSnap);

        const updatedBalance = roundCents((account.balance || 0) + transaction.amount);

        tx.update(accountRef, { balance: updatedBalance });
        const transactionUpdate: Partial<Transaction> = {
            balanceAfter: updatedBalance,
        };
        tx.update(transactionRef, transactionUpdate);
    });
}


export const processAllAccounts = async () => {
    logger.info(`Processing all accounts`);

    const accountsSnap = await admin.firestore().collection(COLLECTIONS.ACCOUNTS).get();
    const accounts = fromFirebaseDocs<Account>(accountsSnap.docs);

    for (const account of accounts) {
        await processAccount(account);
    }
}

const processAccount = async (account: Account) => {
    const newBalance = await processAccountAllowence(account);

    const newAccrualBalance = await processAccountInterestAccrual(account, newBalance);

    await processAccountInterestPayout(account, newAccrualBalance);
}

// Money is stored as decimal numbers, so round to whole cents to avoid float drift
// (e.g. 0.1 + 0.2 = 0.30000000000000004).
const roundCents = (value: number) => Math.round(value * 100) / 100;

const processAccountInterestPayout = async (account: Account, currentAccruedInterest: number): Promise<void> => {
    const accountRef = admin.firestore().doc(`${COLLECTIONS.ACCOUNTS}/${account.id}`);
    const newPayoutDate = getFistDayOfNextMonth();

    if (!account.nextInterestPayoutAt) {
        logger.info(`Account ${account.id} has no next interest payout date, setting and skipping`);
        await accountRef.update({ nextInterestPayoutAt: newPayoutDate });
        return;
    }

    if (new Date() < account.nextInterestPayoutAt) {
        logger.info(`Account ${account.id} has not reached next interest payout date, skipping`);
        return;
    }

    // Pay out whole cents only; the fraction stays accrued for next month.
    // Work in integer cents (rounded to kill float noise like 28.999999999999996) before flooring.
    const accruedCents = Math.round((currentAccruedInterest || 0) * 1e6) / 1e4;
    const payoutAmount = Math.floor(accruedCents) / 100;
    const newAccrualBalance = Math.max(0, (currentAccruedInterest || 0) - payoutAmount);

    if (payoutAmount <= 0) {
        logger.info(`Account ${account.id} accrued interest is less than minimum payout, moving payout to next month`);
        await accountRef.update({ nextInterestPayoutAt: newPayoutDate });
        return;
    }

    logger.info(`Paying out interest ${payoutAmount} to account ${account.id}, new accrual balance: ${newAccrualBalance}`);
    const newTransaction: Transaction = {
        amount: payoutAmount,
        type: 'interest',
        description: 'Monthly interest payout',
        createdAt: new Date(),
    }
    await accountRef.collection(COLLECTIONS.TRANSACTIONS).add(newTransaction);
    await accountRef.update({
        accruedInterest: newAccrualBalance,
        nextInterestPayoutAt: newPayoutDate,
    });
}

const processAccountInterestAccrual = async (account: Account, currentBalance: number): Promise<number> => {
    if (!account.interestRate) {
        logger.info(`Account ${account.id} has no interest rate, skipping`);
        return account.accruedInterest || 0;
    }
    if (currentBalance <= 0) {
        logger.info(`Account ${account.id} has no balance, skipping`);
        return account.accruedInterest || 0;
    }

    const newAccrualDate = new Date();
    newAccrualDate.setDate(newAccrualDate.getDate() + 1)
    newAccrualDate.setHours(0, 0, 0, 0);
    if (!account.nextInterestAccrualAt) {
        logger.info(`Account ${account.id} has no next interest accrual date, setting and skipping`);
        await admin.firestore().doc(`${COLLECTIONS.ACCOUNTS}/${account.id}`).update({ nextInterestAccrualAt: newAccrualDate });
        return account.accruedInterest || 0;
    }

    if (new Date() < account.nextInterestAccrualAt) {
        logger.info(`Account ${account.id} has not reached next interest accrual date, skipping`);
        return account.accruedInterest || 0;
    }

    const interestIncrementYearly = currentBalance * (account.interestRate / 100);
    const interestIncrementDaily = interestIncrementYearly / 365;
    const newAccrualBalance = (account.accruedInterest || 0) + interestIncrementDaily;

    logger.info(`Adding interest ${interestIncrementDaily} to account ${account.id}, new accrual balance: ${newAccrualBalance}`, {
        balance: currentBalance,
        interestRate: account.interestRate,
        interestIncrementYearly,
        interestIncrementDaily,
        newAccrualBalance: newAccrualBalance,
    });
    await admin.firestore().doc(`${COLLECTIONS.ACCOUNTS}/${account.id}`).update({
        nextInterestAccrualAt: newAccrualDate,
        accruedInterest: newAccrualBalance,
    });
    return newAccrualBalance;
}


const processAccountAllowence = async (account: Account): Promise<number> => {
    if (!account.allowence) {
        logger.info(`Account ${account.id} has no allowence, skipping`);
        return account.balance;
    }
    const newNextAllowenceAt = getFistDayOfNextMonth();
    if (!account.nextAllowenceAt) {
        logger.info(`Account ${account.id} has no next allowence date, setting and skipping`);
        await admin.firestore().doc(`${COLLECTIONS.ACCOUNTS}/${account.id}`).update({ nextAllowenceAt: newNextAllowenceAt });
        return account.balance;
    }

    if (new Date() < account.nextAllowenceAt) {
        logger.info(`Account ${account.id} has not reached next allowence date, skipping`);
        return account.balance;
    }


    const newBalance = account.balance + account.allowence;
    logger.info(`Adding allowence ${account.allowence} to account ${account.id}, new balance: ${newBalance}`);
    await admin.firestore().doc(`${COLLECTIONS.ACCOUNTS}/${account.id}`).update({ nextAllowenceAt: newNextAllowenceAt });
    const newTransaction: Transaction = {
        amount: account.allowence,
        type: 'allowence',
        description: 'Monthly allowence',
        createdAt: new Date(),
    }
    await admin.firestore().doc(`${COLLECTIONS.ACCOUNTS}/${account.id}`).collection(COLLECTIONS.TRANSACTIONS).add(newTransaction);

    return account.balance + account.allowence
}

const getFistDayOfNextMonth = () => {
    const newDate = new Date();
    // Set the day first: on Jan 31, setMonth(+1) would overflow to March.
    newDate.setDate(1);
    newDate.setMonth(newDate.getMonth() + 1);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
}
