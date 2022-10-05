'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const network = require('./query.js');

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.use(bodyParser.json());



//******************************************** Post Method endpoints ******************************/

app.post('/OrderCars', (req, res) => {
    console.log(req.body);
    let user = req.headers.user || 'user1';
    if (typeof user === 'undefined') {
        res.status(400).send({
            error: 'user in header not given'
        });
    }

    network.OrderCars(
        user,
        req.body.orderNumber,
        req.body.carNumber,
        req.body.quantity,
        req.body.buyer)
        .then((response) => {
            res.send(response);
        });
});

app.post('/AddCar', (req, res) => {
    console.log(req.body);
    let user = req.headers.user;
    if (typeof user === 'undefined') {
        res.status(400).send({
            error: 'user in header not given'
        });
    }
    network.AddCar(
        user,
        req.body.carNumber,
        req.body.make,
        req.body.model,
        req.body.color,
        req.body.owner)
        .then((response) => {
            res.send(response);
        });
});

//******************************************** Put Method endpoints ******************************/

app.put('/ChangeOrderStatus', (req, res) => {
    console.log(req.body);
    let user = req.headers.user;
    if (typeof user === 'undefined') {
        res.status(400).send({
            error: 'user in header not given'
        });
    }
    network.ChangeOrderStatus(
        user,
        req.body.orderNumber,
        req.body.status)
        .then((response) => {
            res.send(response);
        });
});

//******************************************** Get Method endpoints ******************************/

app.get('/AllOrders',(req,res) => {
    let user = req.headers.user || 'user1';
    if (typeof user === 'undefined') {
        res.status(400).send({
            error: 'user in header not given'
        });
    }
    network.AllOrders(user)
        .then((response) => {
            res.send(response);
        });
});


app.get('/AllCars',(req,res) => {
    let user = req.headers.user;
    if (typeof user === 'undefined') {
        res.status(400).send({
            error: 'user in header not given'
        });
    }
    network.AllCars(user)
        .then((response) => {
            res.send(response);
        });
});

app.get('/OrderHistoryByNumber',(req,res) => {
    let user = req.headers.user;
    if (typeof user === 'undefined') {
        res.status(400).send({
            error: 'user in header not given'
        });
    }
    network.OrderHistoryByNumber(
        user,
        req.body.orderNumber)
        .then((response) => {
            res.send(response);
        });
});


app.listen(process.env.PORT || 8081);