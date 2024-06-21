#! /home/pavel/.nvm/versions/node/v18.17.1/bin/node

const admin = require('firebase-admin');
const { Command } = require('commander');

const program = new Command();
program
    .parse();

const PROJECT_ID = 'tiny-piggy-bank';

const USERS = {
    'schoffer.pavel@gmail.com': { superAdmin: true },
}

const CONFIG_PRIVATE = {
    frontendUrl: 'http://localhost:3000',
}

const initAuth = async () => {
    const auth = admin.auth();
    const allusers = (await auth.listUsers()).users;

    for (const email of Object.keys(USERS)) {
        if (!allusers.find(userObj => userObj.email === email)) {
            console.log('creating user', email);
            const newUser = await auth.createUser({ email, password: 'testtest' });
            auth.setCustomUserClaims(newUser.uid, USERS[email]);
        }
    }
}

const initDB = async () => {
    const firestore = admin.firestore();

    await firestore.doc('config/private').set(CONFIG_PRIVATE, { merge: true });
}

const main = async () => {

    process.env['FIRESTORE_EMULATOR_HOST'] = 'localhost:8080';
    process.env['FIREBASE_AUTH_EMULATOR_HOST'] = 'localhost:9099';

    admin.initializeApp({ projectId: PROJECT_ID });

    await initDB()

    await initAuth();
}

main();
