const express = require('express');
const mongoose = require('mongoose');
const socket = require('socket.io');
const axios = require('axios');

const url = 'https://api.coinmarketcap.com/v1/ticker/?limit=100';
const db = 'mongodb://user1:aVM9QcGtrrJUKEvt@test-project-shard-00-01-3o7r5.mongodb.net:27017/test?ssl=true&replicaSet=test-project-shard-0&authSource=admin'

const app = express();
const server = app.listen(process.env.PORT || 3030, () => {
    console.log(`tbit running`);
});

let connection = mongoose.createConnection(db);

let TbitSchema = new mongoose.Schema({
    timestamp: Number,
    tbit100: Number,
    totalMarketCap: Number
});

let Tbit = connection.model('Tbit', TbitSchema); 

app.use(express.static(__dirname));

app.get('/api', function(req, res) {
    let tbitData = [];
    let fetchTbitData = Tbit.find({}, function(error, data) {
        for (let item of data) {
            tbitData.push({
                t: item.timestamp,
                y: item.tbit100
            })
        }
        res.json(tbitData);
    }
    );
});


const io = socket(server);

io.on('connection', (socket) => {

    let fetchTbitData = Tbit.find({}, function(error, data) {
        let tbitData = [];
        for (let item of data) {
            tbitData.push({
                t: item.timestamp,
                y: item.tbit100
            })
        }
        tbitData = tbitData.filter((item) => item.t);
        socket.emit('fullData', tbitData);
        socket.on('getFullData', function() {
            let fullData = tbitData.filter((item) => item.t);
            socket.emit('fullData', fullData);
        });
        socket.on('get-last-week', function() {
            let lastWeek = tbitData.filter((item) => item.t > Date.now() - 604800000);
            socket.emit('lastWeek', lastWeek);
        });
        socket.on('get-24h', function() {
            let last24h = tbitData.filter((item) => item.t > Date.now() - 86400000);
            socket.emit('data24h', last24h);
        });
        socket.on('get-6h', function() {
            let last6h = tbitData.filter((item) => item.t > Date.now() - 21600000);
            socket.emit('data6h', last6h);
        });
    });
});

const saveCoinData = function() {
    console.log(connection.readyState)
    let dataArr = [];
    axios
    .get(url)
    .then(response => response.data)
    .then(function(data) {
        for (let item of data) {
            dataArr.push({
                id: item.id,
                marketCap: parseInt(item.market_cap_usd),
                price: parseInt(item.price_usd),
                timestamp: parseInt(item.last_updated)
            });
        }
        return dataArr;
    })
    .then(function(data) {
        const dataCopy = data;
        const newTimestamp = new Date().getTime();
        let theTotalMarketCap = data.reduce((totalMarketCap, coin) => {
            return totalMarketCap + coin.marketCap;
        }, 0);
        

        let theAverage = dataCopy.map((coin) => {
            return (coin.marketCap / theTotalMarketCap) * coin.price;
        })
        .reduce((prevVal, currVal) => {
            return prevVal + currVal
        });
        console.log('theAverage: ', theAverage);
        let tbit = new Tbit({
            timestamp: newTimestamp,
            tbit100: theAverage,
            totalMarketCap: theTotalMarketCap
        });

        console.log('object to be saved: ' + tbit);
        console.log(new Date());
        tbit.save().then(() => console.log('data saved!'));
    })
    .catch(err => console.log(err));
}

setInterval(saveCoinData, 360000);
