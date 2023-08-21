#!/usr/bin/env node


var WebSocketClient = require('websocket').client;
const util = require("util")
const config = require("../config")
const CHAIN= config.CHAIN
const TOKEN = config.TOKEN

var client = new WebSocketClient();

client.on('connectFailed', function (error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', async function (connection) {
    console.log('WebSocket Client Connected');
    connection.on('error', function (error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function () {
        console.log('echo-protocol Connection Closed');
    });
    connection.on('message', function (message) {
        if (message.type === 'utf8') {
            console.log("Received: '" + message.utf8Data + "'");

            //example
            // {
            //     "type": "PRICE_DATA",
            //     "data": {
            //       "o": 20.71224215173429,
            //       "h": 20.813397091796027,
            //       "l": 20.688902997542982,
            //       "c": 20.813397091796027,
            //       "eventType": "ohlcv",
            //       "type": "15m",
            //       "unixTime": 1692633600,
            //       "v": 4631.7664447870075,
            //       "symbol": "SOL",
            //       "address": "So11111111111111111111111111111111111111112"
            //     }
            // }
        }
    });

    msg = {
        type: "SUBSCRIBE_PRICE",
        data: {
            chartType: "15m",
            currency: "usd",
            address: "So11111111111111111111111111111111111111112"
        }
    }

    connection.send(JSON.stringify(msg))
});

client.connect(util.format(`wss://public-api.birdeye.so/socket/${CHAIN}?x-api-key=${TOKEN}`), 'echo-protocol', "https://birdeye.so");