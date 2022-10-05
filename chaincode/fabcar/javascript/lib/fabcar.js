/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class FabCar extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        const cars = [
            {
                color: 'blue',
                make: 'Toyota',
                model: 'Prius',
                owner: '',
                qantity: 10,
                
            },
            {
                color: 'red',
                make: 'Ford',
                model: 'Mustang',
                owner: '',
                qantity: 10,
            },
            {
                color: 'green',
                make: 'Hyundai',
                model: 'Tucson',
                owner: '',
                qantity: 10,
            },
            {
                color: 'yellow',
                make: 'Volkswagen',
                model: 'Passat',
                owner: '',
                qantity: 10,
            },
            {
                color: 'black',
                make: 'Tesla',
                model: 'S',
                owner: '',
                qantity: 10,
            },
            {
                color: 'purple',
                make: 'Peugeot',
                model: '205',
                owner: '',
                qantity: 10,
            },
            {
                color: 'white',
                make: 'Chery',
                model: 'S22L',
                owner: '',
                qantity: 10,
                
            },
            {
                color: 'violet',
                make: 'Fiat',
                model: 'Punto',
                owner: '',
                qantity: 10,
                
            },
            {
                color: 'indigo',
                make: 'Tata',
                model: 'Nano',
                owner: '',
                qantity: 10,
                
            },
            {
                color: 'brown',
                make: 'Holden',
                model: 'Barina',
                owner: '',
                qantity: 10,
                
            },
        ];

        for (let i = 0; i < cars.length; i++) {
            cars[i].docType = 'car';
            await ctx.stub.putState('CAR' + i, Buffer.from(JSON.stringify(cars[i])));
            console.info('Added <--> ', cars[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    async CarByNumber(ctx, carNumber) {
        const carAsBytes = await ctx.stub.getState(carNumber); // get the car from chaincode state
        if (!carAsBytes || carAsBytes.length === 0) {
            throw new Error(`${carNumber} does not exist`);
        }
        console.log(carAsBytes.toString());
        return carAsBytes.toString();
    }

    async AddCar(ctx, carNumber, make, model, color, owner) {
        console.info('============= START : Create Car ===========');

        const car = {
            color,
            docType: 'car',
            make,
            model,
            owner,
        };

        await ctx.stub.putState(carNumber, Buffer.from(JSON.stringify(car)));
        //await ctx.stub.putState('LAST_CAR', getLastIndex(2)+1);
        console.info('============= END : Create Car ===========');
    }

    async AllCars(ctx) {
        const startKey = 'CAR0';
        const endKey = 'CAR999';

        const iterator = await ctx.stub.getStateByRange(startKey, endKey);

        const allResults = [];
        while (true) {
            const res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }

    async ChangeCarOwner(ctx, carNumber, newOwner) {
        console.info('============= START : changeCarOwner ===========');

        const carAsBytes = await ctx.stub.getState(carNumber); // get the car from chaincode state
        if (!carAsBytes || carAsBytes.length === 0) {
            throw new Error(`${carNumber} does not exist`);
        }
        const car = JSON.parse(carAsBytes.toString());
        car.owner = newOwner;

        await ctx.stub.putState(carNumber, Buffer.from(JSON.stringify(car)));
        console.info('============= END : changeCarOwner ===========');
    }

    async ChangeOrderStatus(ctx, orderNumber, status, txId, userName, mspId) {
        console.info('============= START : changeOrderStatus ===========');
        console.log(ctx)
        const orderAsBytes = await ctx.stub.getState(orderNumber); // get the car from chaincode state
        if (!orderAsBytes || orderAsBytes.length === 0) {
            throw new Error(`${orderNumber} does not exist`);
        }
        let order = JSON.parse(orderAsBytes.toString());

        if (order.latestStatus === status) {
            throw new Error(`${orderNumber} has already has ${status} `);
        }

        order.latestStatus = status;

        let reqMetadata = {}
        reqMetadata.org = mspId;
        reqMetadata.user = userName;
        reqMetadata.status = status;
        reqMetadata.txId = txId;

        console.log(order)
        order.history.push(reqMetadata)

        await ctx.stub.putState(orderNumber, Buffer.from(JSON.stringify(order)));
        console.info('============= END : changeOrderStatus ===========');
    } 

    async OrderCars(ctx, orderNumber, carNumber, quantity, buyer) {
        console.info('============= START : CreateOrder ===========');

        const carAsBytes = await ctx.stub.getState(carNumber); // get the car from chaincode state
        if (!carAsBytes || carAsBytes.length === 0) {
            throw new Error(`${carNumber} does not exist`);
        }

        if (carAsBytes.length < quantity) {
            throw new Error(`${carNumber} with ${quantity} does not exist`);
        }

        //orderNumber =  'NEW_CAR_BUY_REQ'+getLastIndex(2)

        const order = {
            orderNumber:orderNumber,
            carNumber,
            docType: 'Order',
            buyer,
            latestStatus:'initiated',
            history:[]
        };

        await ctx.stub.putState(orderNumber, Buffer.from(JSON.stringify(order)));
        //await ctx.stub.putState('LAST_NEW_CAR_BUY_REQ', getLastIndex(2)+1);
        console.info('============= END : CreateOrder ===========');
    }

    async AllOrders(ctx) {
        const startKey = 'ORDER0';
        const endKey = 'ORDER99';

        const iterator = await ctx.stub.getStateByRange(startKey, endKey);

        const allResults = [];
        while (true) {
            const res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }

    async OrderHistoryByNumber(ctx, orderNumber) {
        const orderAsBytes = await ctx.stub.getState(orderNumber); 
        if (!orderAsBytes || orderAsBytes.length === 0) {
            throw new Error(`${orderNumber} does not exist`);
        }
        console.log(orderAsBytes.toString());
        return orderAsBytes.toString();
    }

    /*async getLastIndex(typeOfReq) {
        switch(typeOfReq) {
            case 1:
                const lastCarId = await ctx.stub.getState('LAST_CAR');
                if (!lastCarId || lastCarId.length === 0) {
                    return 0;
                }
                return parseInt(lastCarId)
            case 2:
                const lastNewCarByReqId = await ctx.stub.getState('LAST_NEW_CAR_BUY_REQ');
                if (!lastNewCarByReqId || lastNewCarByReqId.length === 0) {
                    return 0;
                }
                return parseInt(lastNewCarByReqId)
            default: return null
        }
    }

    genRand = (len) => {
        return Math.random().toString(36).substring(2,len+2).toUpperCase();
    }*/

}


module.exports = FabCar;
