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
            //       "blockUnixTime": 1692634062,
            //       "owner": "EkZStqj9BSwLS19uLDEsErCW6N1HHzvoGg92Ei3YYBNt",
            //       "source": "marinade",
            //       "txHash": "3M2L5EpoNyLqe7cPjJMWzDaAaCPJ3jFeVQ4oAoTkd8sRmxTrfVG8AHa8prhV7Kd61CJZUuz3ajryck7nJBtos87",
            //       "side": "sell",
            //       "tokenAddress": "So11111111111111111111111111111111111111112",
            //       "platform": "slowprotocol",
            //       "volumeUSD": 0.019105869164218792,
            //       "from": {
            //         "symbol": "SOL",
            //         "decimals": 9,
            //         "address": "So11111111111111111111111111111111111111112",
            //         "amount": 920000,
            //         "uiAmount": 0.00092,
            //         "changeAmount": -920000,
            //         "uiChangeAmount": -0.00092,
            //         "icon": "https://img.fotofolio.xyz/?w=30&h=30&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolana-labs%2Ftoken-list%2Fmain%2Fassets%2Fmainnet%2FSo11111111111111111111111111111111111111112%2Flogo.png"
            //       },
            //       "to": {
            //         "symbol": "mSOL",
            //         "decimals": 9,
            //         "address": "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
            //         "amount": 813823,
            //         "uiAmount": 0.000813823,
            //         "changeAmount": 813823,
            //         "uiChangeAmount": 0.000813823,
            //         "icon": "https://img.fotofolio.xyz/?w=30&h=30&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolana-labs%2Ftoken-list%2Fmain%2Fassets%2Fmainnet%2FmSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So%2Flogo.png"
            //       },
            //       "tokenPrice": 20.767249091542165,
            //       "network": "solana",
            //       "poolId": "8szGkuLTAux9XMgZ2vtY39jVSowEcpBfFfD8hXSEqdGC"
            //     }
            // }
        }
    });

    msg = {
        type: "SUBSCRIBE_TXS",
        data: {
            address: "So11111111111111111111111111111111111111112"
        }
    }

    connection.send(JSON.stringify(msg))
});

client.connect(util.format(`wss://public-api.birdeye.so/socket/${CHAIN}?x-api-key=${TOKEN}`), 'echo-protocol', "https://birdeye.so");