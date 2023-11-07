import * as admin from 'firebase-admin';
import { onRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2/options";
import { apiWrapper } from "./utils/api";

admin.initializeApp();

const region = 'europe-west1';

setGlobalOptions({ region });


export const testFunction = onRequest({ region, cors: true }, (_req, _res) => {
    return apiWrapper(_req, _res, async (req, res) => {

        res.send({ success: true });
    });
});
