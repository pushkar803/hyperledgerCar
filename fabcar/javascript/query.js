'use strict';

const { Gateway, FileSystemWallet } = require('fabric-network');
const fs = require('fs');
const path = require('path');



const channelName = 'mychannel';
const contractName = 'fabcar';

/***************************************** CHAINCODES ***********************************************/

/****************************INVOKE CHAINCODE TO SCreate, Update and Delete notes ********************************/
exports.OrderCars = async function(user, orderNumber, carNumber, quantity, buyer) {

    let response = {};
    try {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet2');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists(user);
        if (!userExists) {
            response.error = 'only users from Org2MSP are allowed to order cars';
            return response;
        }

        const ccpPath = path.resolve(__dirname, '..', '..', 'first-network', 'connection-org2.json');
        let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: user, discovery: { enabled: true, asLocalhost: true } });

        let mspId = gateway.getCurrentIdentity()._mspId;
        if (mspId !== 'Org2MSP') {
            response.error = 'only users from Org2MSP are allowed to order cars';
            return response;
        }
        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork(channelName);
        // Get the contract from the network.
        const contract = network.getContract(contractName);

        const result = await contract.submitTransaction('OrderCars', orderNumber, carNumber, quantity, buyer);
        console.log(`Transaction has been submitted, result is: ${result.toString()}`);

        // Disconnect from the gateway.
        await gateway.disconnect();
        response.msg = 'Transaction has been submitted';
        return response;

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        response.error = error.message;
        return response;
    }
};

exports.AddCar = async function(user, carNumber, make, model, color, owner) {
    let response = {};
    try {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet1');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists(user);
        if (!userExists) {
            response.error = 'only users from Org1MSP are allowed to add new cars in db';
            return response;
        }

        const ccpPath = path.resolve(__dirname, '..', '..', 'first-network', 'connection-org1.json');
        let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: user, discovery: { enabled: true, asLocalhost: true } });

        let mspId = gateway.getCurrentIdentity()._mspId;

        if (mspId !== 'Org1MSP') {
            response.error = 'only users from Org1MSP are allowed to add new cars in db';
            return response;
        }
        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork(channelName);

        // Get the contract from the network.
        const contract = network.getContract(contractName);

        const result = await contract.submitTransaction('AddCar', carNumber, make, model, color, owner);
        console.log(`Transaction has been submitted, result is: ${result.toString()}`);

        // Disconnect from the gateway.
        await gateway.disconnect();
        response.msg = 'Transaction has been submitted';
        return response;

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        response.error = error.message;
        return response;
    }
};

exports.AllOrders = async function(user) {
    let response = {};
    try {
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet1');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists(user);
        if (!userExists) {
            response.error = 'only users from Org1MSP are allowed to see all orders';
            return response;
        }

        const ccpPath = path.resolve(__dirname, '..', '..', 'first-network', 'connection-org1.json');
        let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: user, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork(channelName);

        // Get the contract from the network.
        const contract = network.getContract(contractName);

        const result = await contract.evaluateTransaction('AllOrders');
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

        // Disconnect from the gateway.
        await gateway.disconnect();
        response.msg = 'Transaction has been evaluated';
        response.result = JSON.parse(result.toString());

        let rd = [];
        response.result.forEach(async (r) => {
            delete r.Record.history;
            rd.push(r.Record);
        });

        return rd;

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        response.error = error.message;
        return response;
    }
};

exports.AllCars = async function(user) {
    let response = {};
    let walletPath = '';
    let wallet, orgPath;
    try {
        // Create a new file system based wallet for managing identities.
        walletPath = path.join(process.cwd(), 'wallet1');
        wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
        orgPath = 'connection-org1.json';

        // Check to see if we've already enrolled the user.
        let userExists = await wallet.exists(user);
        if (!userExists) {
            console.log('user not exist in wallet 1');
            walletPath = path.join(process.cwd(), 'wallet2');
            wallet = new FileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);
            orgPath = 'connection-org2.json';

            // Check to see if we've already enrolled the user.
            userExists = await wallet.exists(user);
            if (!userExists) {
                console.log('user not exist in wallet 2');
                response.error = 'An identity for the user "user1" does not exist in the wallet';
                return response;
            }
        }

        const ccpPath = path.resolve(__dirname, '..', '..', 'first-network', orgPath);
        let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: user, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork(channelName);

        // Get the contract from the network.
        const contract = network.getContract(contractName);

        const result = await contract.evaluateTransaction('AllCars');
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

        // Disconnect from the gateway.
        await gateway.disconnect();
        response.msg = 'Transaction has been evaluated';
        response.result = JSON.parse(result.toString());

        let rd = [];
        response.result.forEach(async (r) => {
            rd.push(r.Record);
        });

        return response;

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        response.error = error.message;
        return response;
    }
};

exports.ChangeOrderStatus = async function(user, orderNumber, status) {
    let response = {};
    try {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet1');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists(user);
        if (!userExists) {
            response.error = 'only users from Org1MSP are allowed to change status';
            return response;
        }

        const ccpPath = path.resolve(__dirname, '..', '..', 'first-network', 'connection-org1.json');
        let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: user, discovery: { enabled: true, asLocalhost: true } });

        let userName = gateway.getCurrentIdentity()._name;
        let mspId = gateway.getCurrentIdentity()._mspId;

        if (mspId !== 'Org1MSP') {
            response.error = 'only users from Org1MSP are allowed to change status';
            return response;
        }

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork(channelName);

        // Get the contract from the network.
        const contract = network.getContract(contractName);

        const transaction = contract.createTransaction('ChangeOrderStatus');
        let txId = transaction.getTransactionID()._transaction_id;

        await transaction.submit(orderNumber, status, txId, userName, mspId);

        //const result = await contract.submitTransaction('ChangeOrderStatus', orderNumber, status);
        //console.log(`Transaction has been submitted, result is: ${result.toString()}`);

        // Disconnect from the gateway.
        await gateway.disconnect();
        response.msg = 'Transaction has been submitted';
        return response;

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        response.error = error.message;
        return response;
    }
};

exports.OrderHistoryByNumber = async function(user, orderNumber) {
    let response = {};
    let walletPath = '';
    let wallet, orgPath;
    try {
        // Create a new file system based wallet for managing identities.
        walletPath = path.join(process.cwd(), 'wallet1');
        wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
        orgPath = 'connection-org1.json';

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists(user);
        if (!userExists) {
            walletPath = path.join(process.cwd(), 'wallet2');
            wallet = new FileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);
            orgPath = 'connection-org2.json';

            // Check to see if we've already enrolled the user.
            const userExists = await wallet.exists(user);
            if (!userExists) {
                console.log('An identity for the user "user1" does not exist in the wallet');
                return;
            }
        }

        const ccpPath = path.resolve(__dirname, '..', '..', 'first-network', orgPath);
        let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: user, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork(channelName);

        // Get the contract from the network.
        const contract = network.getContract(contractName);

        const result = await contract.evaluateTransaction('OrderHistoryByNumber', orderNumber);
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

        // Disconnect from the gateway.
        await gateway.disconnect();
        response.msg = 'Transaction has been evaluated';
        response.result = JSON.parse(result.toString());

        return response;

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        response.error = error.message;
        return response;
    }
};