import * as admin from 'firebase-admin';
import { setGlobalOptions } from "firebase-functions/v2/options";
import * as v1Functions from "firebase-functions/v1";
import { COLLECTIONS } from './utils/shared/constants';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { fromFirebaseDoc } from './utils/shared/firebase';
import { processAllAccounts, processTransaction } from './logic';
import { Transaction } from './models/shared/Transaction';
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { onRequest } from 'firebase-functions/v2/https';
import { apiWrapper } from './utils/api';

admin.initializeApp();

const region = 'europe-west1';

setGlobalOptions({ region });

// SCHEDULED TRIGGERS

export const dailyAccountProcessing = onSchedule('every day 04:00', async () => {
    return processAllAccounts();
})

export const mockDailyAccountProcessing = onRequest(async (req, res) => {
    return apiWrapper(req, res, async () => {
        await processAllAccounts();
        res.send('ok')
    });
});


// / AUTH TRIGGERS

export const setupNewUser = v1Functions.region(region).auth.user().onCreate(async user => {
    const { uid, email } = user;
    await admin.firestore().collection(COLLECTIONS.USERS).doc(uid).set({ uid, email, createdAt: new Date() });
    v1Functions.logger.info(`New user: ${email} (${uid})`);
});

// DOCS TRIGGERS

export const onNewTransaction = onDocumentCreated(`${COLLECTIONS.ACCOUNTS}/{accountId}/${COLLECTIONS.TRANSACTIONS}/{transactionId}`, async event => {
    const { accountId } = event.params;
    const transaction = fromFirebaseDoc<Transaction>(event.data);

    return processTransaction(transaction, accountId);
});

