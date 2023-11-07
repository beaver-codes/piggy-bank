#!/home/pavel/.nvm/versions/node/v18.17.1/bin/node

const { program } = require('commander');
var admin = require('firebase-admin');

program.version('0.0.1');
program.arguments('<userEmail>')
program.option('--prod', 'Run against prod')
program.option('--admin', 'Set super admin')
program.option('--exerciseLeader', 'Set exercise leader')
program.option('--rm', 'remove')
program.option('--check', 'only list claims')
program.parse(process.argv)

const opts = program.opts();

if (!program.args.length) {
    program.help();
}

if (!opts.prod) {
    process.env['FIREBASE_AUTH_EMULATOR_HOST'] = 'localhost:9099';
}

const keyName = 'admin-key.json';

var key = require(`${__dirname}/${keyName}`);
const email = program.args[0];

admin.initializeApp({
    credential: admin.credential.cert(key)
});

var auth = admin.auth();

const listClaims = async () => {
    const user = await auth.getUserByEmail(email);

    console.log(user.email, user.customClaims)

}

const updateClaims = async () => {
    try {
        const user = await auth.getUserByEmail(email);

        const newClaims = { ...user.customClaims };

        const claimsToChange = []
        if (opts.admin) {
            claimsToChange.push('superAdmin')
        }
        if (opts.exerciseLeader) {
            claimsToChange.push('exerciseLeader');
        }


        for (const claim of claimsToChange) {
            newClaims[claim] = true;
            if (opts.rm) {
                delete newClaims[claim];
            }
        }

        await auth.setCustomUserClaims(user.uid, newClaims)
        console.log(`Claims updated for user: '${email}'`)

        await listClaims();
    } catch (e) {
        console.error(`Failed to set admin for '${email}'`, e)
    }
}

if (opts.check) {
    listClaims()
} else {
    updateClaims();
}
