import * as admin from 'firebase-admin';
import { setGlobalOptions } from "firebase-functions/v2/options";
import * as v1Functions from "firebase-functions/v1";
import { COLLECTIONS } from './utils/shared/constants';

admin.initializeApp();

const region = 'europe-west1';

setGlobalOptions({ region });


// / AUTH TRIGGERS

export const setupNewUser = v1Functions.region(region).auth.user().onCreate(async user => {
    const { uid, email } = user;
    await admin.firestore().collection(COLLECTIONS.USERS).doc(uid).set({ uid, email, createdAt: new Date() });
    v1Functions.logger.info(`New user: ${email} (${uid})`);
});

