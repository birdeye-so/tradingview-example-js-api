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
            //     "type": "TXS_DATA",
            //     "data": {
            //       "blockUnixTime": 1692634269,
            //       "owner": "EkZStqj9BSwLS19uLDEsErCW6N1HHzvoGg92Ei3YYBNt",
            //       "source": "raydium",
            //       "txHash": "2Pp9wqVfLhs6G8n2544NTnAB3ZrQJi1xrGddrJvf3jxUrCcCjRQs5AGUA9SfX39UowhkaNy4K8RihPj94nTFjme6",
            //       "platform": "slowprotocol",
            //       "volumeUSD": 0.019101565156457452,
            //       "from": {
            //         "symbol": "SLOW",
            //         "decimals": 5,
            //         "address": "2KE2UNJKB6RGgb78DxJbi2HXSfCs1EocHj4FDMZPr4HA",
            //         "amount": 351630,
            //         "uiAmount": 3.5163,
            //         "changeAmount": -351630,
            //         "uiChangeAmount": -3.5163,
            //         "icon": "https://img.fotofolio.xyz/?w=30&h=30&url=https%3A%2F%2Ft3wsqd23o7n5d2pjgvspqafxi3jcznjfrdgwkh6acmgf3zjpnsgq.arweave.net%2Fnu0oD1t329Hp6TVk-AC3RtIstSWIzWUfwBMMXeUvbI0"
            //       },
            //       "to": {
            //         "symbol": "mSOL",
            //         "decimals": 9,
            //         "address": "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
            //         "amount": 814588,
            //         "uiAmount": 0.000814588,
            //         "changeAmount": 814588,
            //         "uiChangeAmount": 0.000814588,
            //         "icon": "https://img.fotofolio.xyz/?w=30&h=30&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolana-labs%2Ftoken-list%2Fmain%2Fassets%2Fmainnet%2FmSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So%2Flogo.png"
            //       }
            //     }
            // }
        }
    });

    msg = {
        type: "SUBSCRIBE_TXS",
        data: {
            pairAddress: "FmKAfMMnxRMaqG1c4emgA4AhaThi4LQ4m2A12hwoTibb"
        }
    }

    connection.send(JSON.stringify(msg))
});

client.connect(util.format(`wss://public-api.birdeye.so/socket/${CHAIN}?x-api-key=${TOKEN}`), 'echo-protocol', "https://birdeye.so");