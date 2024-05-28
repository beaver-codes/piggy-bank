import * as functions from "firebase-functions";
import * as admin from 'firebase-admin';
import { getConfig } from "./firebase";

export const apiWrapper = (request: functions.https.Request,
    response: functions.Response<any>,
    handler: (request: functions.https.Request, response: functions.Response<any>) => Promise<any>): Promise<void> => {
    return new Promise<void>(resolve => {
        handler(request, response).catch(error => {
            const msg = error?.message || '';
            if (msg) {
                if (msg.includes('auth:')) {
                    response.status(401).send(msg);
                    return;
                }
                if (msg.includes('client:')) {
                    response.status(400).send(msg);
                    return;
                }
            }
            functions.logger.error('Error:', error);
            response.status(500).send(error);
        }).finally(() => {
            resolve();
        });
    })
}


interface RequireAuthResult {
    uid: string,
    email: string,
}
export const requireAuth = async (request: functions.https.Request): Promise<RequireAuthResult> => {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
        throw new Error('auth: Missing auth header');
    }
    if (authHeader.startsWith('Bearer ')) {
        const auth = admin.auth();
        const token = authHeader.split('Bearer ')[1];
        try {
            const result = await auth.verifyIdToken(token);
            return { uid: result.uid, email: result.email + '' };
        } catch (error) {
            throw new Error('auth: Invalid token');
        }
    } else if (authHeader.startsWith('Master ')) {
        const config = await getConfig();
        const masterToken = authHeader.split('Master ')[1];
        if (masterToken && masterToken === config.masterKey) {
            return { uid: 'master', email: 'master' };
        }
        throw new Error('auth: Invalid master token');
    }


    throw new Error('auth: Invalid auth header');
}
