/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const path = require('path');

let ccpPath = '';
let adminName = '';
let aff = '';
let walletName = '';

async function createUser(eid, msp) {
    try {

        if(msp === 'Org1MSP'){
            ccpPath = path.resolve(__dirname, '..', '..', 'first-network', 'connection-org1.json');
            adminName = 'admin';
            aff = 'org1.department1';
            walletName = 'wallet1';
        } else {
            ccpPath = path.resolve(__dirname, '..', '..', 'first-network', 'connection-org2.json');
            adminName = 'admin';
            aff = 'org2.department1';
            walletName = 'wallet2';
        }
        console.log('walletName: '+walletName);
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), walletName);
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists(eid);
        if (userExists) {
            console.log(`An identity for the user ${eid} already exists in the wallet`);
            return;
        }

        // Check to see if we've already enrolled the admin user.
        const adminExists = await wallet.exists(adminName);
        if (!adminExists) {
            console.log('An identity for the admin user "admin" does not exist in the wallet');
            console.log('Run the enrollAdmin.js application before retrying');
            return;
        }


        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: adminName, discovery: { enabled: true, asLocalhost: true } });

        // Get the CA client object from the gateway for interacting with the CA.
        const ca = gateway.getClient().getCertificateAuthority();
        const adminIdentity = gateway.getCurrentIdentity();

        // Register the user, enroll the user, and import the new identity into the wallet.
        const secret = await ca.register({ affiliation: aff, enrollmentID: eid, role: 'client' }, adminIdentity);
        const enrollment = await ca.enroll({ enrollmentID: eid, enrollmentSecret: secret });
        const userIdentity = X509WalletMixin.createIdentity(msp, enrollment.certificate, enrollment.key.toBytes());
        await wallet.import(eid, userIdentity);
        console.log(`Successfully registered and enrolled admin user "${eid}" and imported it into the wallet`);

    } catch (error) {
        console.error(`Failed to register user "${eid}": ${error}`);
    }
}


async function main(){
    await createUser('pushkar','Org1MSP');
    await createUser('shahid','Org1MSP');
    await createUser('sree','Org1MSP');
    await createUser('alex','Org2MSP');
    await createUser('marian','Org2MSP');
    await createUser('james','Org2MSP');
}

main();