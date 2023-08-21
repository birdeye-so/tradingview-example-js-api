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
            //     "type": "BASE_QUOTE_PRICE_DATA",
            //     "data": {
            //       "o": 20.712300146174698,
            //       "h": 20.81357129642205,
            //       "l": 20.686498192128145,
            //       "c": 20.767514381003995,
            //       "eventType": "ohlcv",
            //       "type": "15m",
            //       "unixTime": 1692633600,
            //       "v": 0,
            //       "baseAddress": "So11111111111111111111111111111111111111112",
            //       "quoteAddress": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
            //     }
            // }
        }
    });

    msg = {
        type: "SUBSCRIBE_BASE_QUOTE_PRICE",
        data: {
            chartType: "15m",
            baseAddress: "So11111111111111111111111111111111111111112",
            quoteAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
        }
    }

    connection.send(JSON.stringify(msg))
});

client.connect(util.format(`wss://public-api.birdeye.so/socket/${CHAIN}?x-api-key=${TOKEN}`), 'echo-protocol', "https://birdeye.so");