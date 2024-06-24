import { logger } from "firebase-functions/v1"
import { Transaction } from "./models/shared/Transaction"
import * as admin from 'firebase-admin';
import { COLLECTIONS } from "./utils/shared/constants";
import { fromFirebaseDoc, fromFirebaseDocs } from "./utils/shared/firebase";
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

const MIN_INTEREST_ACCRUAL = 0.01;
const processAccountInterestPayout = async (account: Account, currentAccruedInterest: number): Promise<void> => {
    if (!currentAccruedInterest) {
        logger.info(`Account ${account.id} has no accrued interest, skipping`);
        return;
    }

    const payoutAmount = Math.floor(currentAccruedInterest / MIN_INTEREST_ACCRUAL) * MIN_INTEREST_ACCRUAL;
    if (payoutAmount < MIN_INTEREST_ACCRUAL) {
        logger.info(`Account ${account.id} accrued interest is less than minimum payout, skipping`);
        return;
    }

    const newBalance = account.balance + payoutAmount;
    const newAccrualBalance = currentAccruedInterest - payoutAmount;

    logger.info(`Paying out interest ${payoutAmount} to account ${account.id}, new balance: ${newBalance},
         new accrual balance: ${newAccrualBalance}`);
    const newTransaction: Transaction = {
        amount: payoutAmount,
        type: 'interest',
        description: 'Interest payout',
        createdAt: new Date(),
    }
    await admin.firestore().doc(`${COLLECTIONS.ACCOUNTS}/${account.id}`).collection(COLLECTIONS.TRANSACTIONS).add(newTransaction);
    await admin.firestore().doc(`${COLLECTIONS.ACCOUNTS}/${account.id}`).update({ accruedInterest: newAccrualBalance });
}

const processAccountInterestAccrual = async (account: Account, currentBalance: number): Promise<number> => {
    if (!account.interestRate) {
        logger.info(`Account ${account.id} has no interest rate, skipping`);
        return account.accruedInterest;
    }
    if (currentBalance <= 0) {
        logger.info(`Account ${account.id} has no balance, skipping`);
        return account.accruedInterest;
    }

    const newAccrualDate = new Date();
    newAccrualDate.setDate(newAccrualDate.getDate() + 1)
    newAccrualDate.setHours(0, 0, 0, 0);
    if (!account.nextInterestAccrualAt) {
        logger.info(`Account ${account.id} has no next interest accrual date, setting and skipping`);
        await admin.firestore().doc(`${COLLECTIONS.ACCOUNTS}/${account.id}`).update({ nextInterestAccrualAt: newAccrualDate });
        return account.accruedInterest;
    }

    if (new Date() < account.nextInterestAccrualAt) {
        logger.info(`Account ${account.id} has not reached next interest accrual date, skipping`);
        return account.accruedInterest;
    }

    const interestIncrementYearly = currentBalance * (account.interestRate / 100);
    const interestIncrementDaily = interestIncrementYearly / 365;
    const newAccrualBalance = account.accruedInterest + interestIncrementDaily;

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
    newDate.setMonth(newDate.getMonth() + 1);
    newDate.setDate(1);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
}
