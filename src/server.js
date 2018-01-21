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

const io = socket(server);

io.on('connection', (socket) => {
    console.log('a user has connected');

    let tbitData = [];

    let fetchTbitData = Tbit.find({}, function(error, data) {
        
        for (let item of data) {
            tbitData.push({
                t: item.timestamp,
                y: item.tbit100
            });
         }
         socket.emit('tbit-data', tbitData);
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
        console.log('array length, should be 100 ?= ', data.length);
        let dataCopy = data;
        let newTimestamp = new Date().getTime();
        let theTotalMarketCap = data.reduce(function(totalMarketCap, coin) {
            return totalMarketCap + coin.marketCap;
        }, 0);
        

        let theAverage = dataCopy.map(function(coin) {
            return (coin.marketCap / theTotalMarketCap) * coin.price;
        })
        .reduce(function(prevVal, currVal) {
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
saveCoinData();
setInterval(saveCoinData, 1800000);
