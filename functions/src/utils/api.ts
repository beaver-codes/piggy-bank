import * as functions from "firebase-functions";

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
