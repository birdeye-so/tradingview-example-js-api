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
        }
    });

    //subscribe ohlcv pair
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