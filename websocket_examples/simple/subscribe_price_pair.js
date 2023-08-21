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
            //       "o": 0.00023282633722989724,
            //       "h": 0.0002328322272468132,
            //       "l": 0.00023165913298840073,
            //       "c": 0.0002316642553576273,
            //       "eventType": "ohlcv",
            //       "type": "15m",
            //       "unixTime": 1692633600,
            //       "v": 2317.616010000001,
            //       "symbol": "SLOW-mSOL",
            //       "address": "FmKAfMMnxRMaqG1c4emgA4AhaThi4LQ4m2A12hwoTibb"
            //     }
            // }
        }
    });

    //subscribe ohlcv pair
    msg = {
        type: "SUBSCRIBE_PRICE",
        data: {
            chartType: "15m",
            currency: "pair",
            address: "FmKAfMMnxRMaqG1c4emgA4AhaThi4LQ4m2A12hwoTibb"
        }
    }

    connection.send(JSON.stringify(msg))
});

client.connect(util.format(`wss://public-api.birdeye.so/socket/${CHAIN}?x-api-key=${TOKEN}`), 'echo-protocol', "https://birdeye.so");