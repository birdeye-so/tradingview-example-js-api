#!/usr/bin/env node
var WebSocketClient = require('websocket').client;
const util = require("util")

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

    // //subscribe ohlcv token
    // msg = {
    //     type: "SUBSCRIBE_PRICE",
    //     data: {
    //         chartType: "1m",
    //         currency: "usd",
    //         address: "So11111111111111111111111111111111111111112"
    //     }
    // }

    //subscribe ohlcv pair
    msg = {
        type: "SUBSCRIBE_PRICE",
        data: {
            chartType: "1m",
            currency: "pair",
            address: "FmKAfMMnxRMaqG1c4emgA4AhaThi4LQ4m2A12hwoTibb"
        }
    }

    // //subscribe txs token
    // msg = {
    //     type: "SUBSCRIBE_TXS",
    //     data: {
    //         address: "So11111111111111111111111111111111111111112"
    //     }
    // }

    // //subscribe txs token of pair
    // msg = {
    //     type: "SUBSCRIBE_TXS",
    //     data: {
    //         pairAddress: "7qbRF6YsyGuLUVs6Y1q64bdVrfe4ZcUUz1JRdoVNUJnm",
    //         address: "So11111111111111111111111111111111111111112"
    //     }
    // }

    // //unsubscribe txs 
    // msg = {
    //     type: "UNSUBSCRIBE_TXS"
    // }

    // //unsubscribe txs 
    // msg = {
    //     type: "UNSUBSCRIBE_PRICE"
    // }

    connection.send(JSON.stringify(msg))
});

client.connect(util.format('wss://public-api.birdeye.so/socket/<chain>?x-api-key=<api key>'), 'echo-protocol', "https://birdeye.so");