import { Config } from "../models/Config";
import { COLLECTIONS } from "./shared/constants";
import * as admin from 'firebase-admin';

export const getConfig = async (): Promise<Config> => {
    const config = await admin.firestore().collection(COLLECTIONS.CONFIG).doc('private').get();
    return config.data() as Config;
}
