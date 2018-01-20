const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');

const url = 'https://api.coinmarketcap.com/v1/ticker/?limit=100';
const db = 'mongodb://user1:aVM9QcGtrrJUKEvt@test-project-shard-00-01-3o7r5.mongodb.net:27017/test?ssl=true&replicaSet=test-project-shard-0&authSource=admin'

let connection = mongoose.createConnection(db);

let TbitSchema = new mongoose.Schema({
    timestamp: Number,
    average: Number
});

let Tbit = connection.model('Tbit', TbitSchema); 

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
        console.log(data.length)
        let newTimestamp = data[0].timestamp;
        let theTotalMarketCap = data.reduce(function(totalMarketCap, coin) {
            return totalMarketCap + coin.marketCap;
        }, 0)

        let theAverage = data.reduce(function(average, coin) {
            return (coin.marketCap / theTotalMarketCap) * coin.price;
        }, 0);

        let tbit = new Tbit({
            timestamp: newTimestamp,
            average: theAverage
        });
        console.log(tbit);
        tbit.save().then(() => console.log('saved!'));
    })
    .catch(err => console.log(err));
}
saveCoinData();
setInterval(saveCoinData, 900000);

