# Streaming Implementation

In this section we'll implement real-time updates via WebSocket.

Let's create a new file called [streaming.js][streaming-file-url], where we'll implement a connection to the WebSocket.

[streaming.js][streaming-file-url]:

```javascript
const socket = new WebSocket(
  `wss://public-api.birdeye.so/socket?x-api-key=${BE_API_KEY}`,
  'echo-protocol'
);

socket.on('connect', () => {
  console.log('[socket] Connected');
});

socket.on('disconnect', (reason) => {
  console.log('[socket] Disconnected:', reason);
});

socket.on('error', (error) => {
  console.log('[socket] Error:', error);
});

export function subscribeOnStream() {
  // todo
}

export function unsubscribeFromStream() {
  // todo
}
```

Now we can use these functions in our [datafeed.js][datafeed-file-url] file to make a subscription to real-time updates.

- [subscribeBars documentation][subscribe-bars-docs-url]
- [unsubscribeBars documentation][unsubscribe-bars-docs-url]

[datafeed.js][datafeed-file-url]:

```javascript
import { subscribeOnStream, unsubscribeFromStream } from './streaming.js';

const lastBarsCache = new Map();
// ...
export default {
  // ...
  subscribeBars: (
    symbolInfo,
    resolution,
    onRealtimeCallback,
    subscriberUID,
    onResetCacheNeededCallback
  ) => {
    console.log(
      '[subscribeBars]: Method call with subscriberUID:',
      subscriberUID
    );
    subscribeOnStream(
      symbolInfo,
      resolution,
      onRealtimeCallback,
      subscriberUID,
      onResetCacheNeededCallback,
      lastBarsCache.get(symbolInfo.address)
    );
  },

  unsubscribeBars: (subscriberUID) => {
    console.log(
      '[unsubscribeBars]: Method call with subscriberUID:',
      subscriberUID
    );
  },
};
```

## Subscribe

We've connected to the WebSocket, now we need to subscribe to the channels to receive updates:

[streaming.js][streaming-file-url]:

```javascript
import { parseFullSymbol } from './helpers.js';
// ...
const channelToSubscription = new Map();
// ...
export function subscribeOnStream(
  symbolInfo,
  resolution,
  onRealtimeCallback,
  subscriberUID,
  onResetCacheNeededCallback,
  lastBar
) {
  subscriptionItem = {
    resolution,
    lastBar,
    callback: onRealtimeCallback,
  };

  const msg = {
    type: 'SUBSCRIBE_PRICE',
    data: {
      chartType: parseResolution(resolution),
      address: symbolInfo.address,
      currency: 'usd',
    },
  };

  socket.send(JSON.stringify(msg));
}
```

Let's also implement the `unsubscribeFromStream` function:

```javascript
export function unsubscribeFromStream() {
  const msg = {
    type: 'UNSUBSCRIBE_PRICE',
  };

  socket.send(JSON.stringify(msg));
}
```

## Handle updates

Warning

Birdeye is now relying on an API key to request some of their stream data.

At the time of writing it's not mandatory to use it and the code provided still works.
In case you get an error message, please visit their WebSockets documentation [page](https://min-api.Birdeye.com/documentation/websockets)

Now we need to handle updates coming from the WebSocket.

At the time of writing the response looks like this:

```javascript
0~Bitfinex~BTC~USD~2~335394436~1548837377~0.36~3504.1~1261.4759999999999~1f
```

You can find the documentation for WebSockets [here](https://min-api.Birdeye.com/documentation/websockets).

[streaming.js][streaming-file-url]:

```javascript
// ...
socket.addEventListener('message', (msg) => {
  const data = JSON.parse(msg.data);

  if (data.type !== 'PRICE_DATA') return console.log(data);

  const currTime = data.data.unixTime * 1000;
  const lastBar = subscriptionItem.lastBar;
  const resolution = subscriptionItem.resolution;
  const nextBarTime = getNextBarTime(lastBar, resolution);

  let bar;

  if (currTime >= nextBarTime) {
    bar = {
      time: nextBarTime,
      open: data.data.o,
      high: data.data.h,
      low: data.data.l,
      close: data.data.c,
      volume: data.data.v,
    };
    console.log('[socket] Generate new bar');
  } else {
    bar = {
      ...lastBar,
      high: Math.max(lastBar.high, data.data.h),
      low: Math.min(lastBar.low, data.data.l),
      close: data.data.c,
      volume: data.data.v,
    };
    console.log('[socket] Update the latest bar by price');
  }

  subscriptionItem.lastBar = bar;
  subscriptionItem.callback(bar);
});
```

Before running the project, open your [datafeed.js][datafeed-file-url] file and adjust your `getBars` method to save the last bar data for the current symbol. We wouldn't need this if we had a more accurate way to check for the new bar or if we had a bars streaming API.

```javascript
//...
data.Data.forEach( ... );

if (firstDataRequest) {
    lastBarsCache.set(symbolInfo.full_name, { ...bars[bars.length - 1] });
}
console.log(`[getBars]: returned ${bars.length} bar(s)`);
//...
```

Birdeye provides a streaming of ticks, but not bars. So, let's roughly check that the new trade is related to the new daily bar.

Please note you may need a more comprehensive check here for the production version.

You can adjust your code in [streaming.js][streaming-file-url] by adding an utility function:

```javascript
export function getNextBarTime(lastBar, resolution = '1D') {
  if (!lastBar) return;

  const lastCharacter = resolution.slice(-1);
  let nextBarTime;

  switch (true) {
    case lastCharacter === 'W':
      nextBarTime = 7 * 24 * 60 * 60 * 1000 + lastBar.time;
      break;

    case lastCharacter === 'D':
      nextBarTime = 1 * 24 * 60 * 60 * 1000 + lastBar.time;
      break;

    default:
      nextBarTime = resolution * 60 * 1000 + lastBar.time;
      break;
  }

  return nextBarTime;
}
```

and adjust `socket.on` listener:

```javascript
socket.addEventListener('message', (msg) => {
  const data = JSON.parse(msg.data);

  if (data.type !== 'PRICE_DATA') return console.log(data);

  const currTime = data.data.unixTime * 1000;
  const lastBar = subscriptionItem.lastBar;
  const resolution = subscriptionItem.resolution;
  const nextBarTime = getNextBarTime(lastBar, resolution);

  let bar;

  if (currTime >= nextBarTime) {
    bar = {
      time: nextBarTime,
      open: data.data.o,
      high: data.data.h,
      low: data.data.l,
      close: data.data.c,
      volume: data.data.v,
    };
    console.log('[socket] Generate new bar');
  } else {
    bar = {
      ...lastBar,
      high: Math.max(lastBar.high, data.data.h),
      low: Math.min(lastBar.low, data.data.l),
      close: data.data.c,
      volume: data.data.v,
    };
    console.log('[socket] Update the latest bar by price');
  }

  subscriptionItem.lastBar = bar;
  subscriptionItem.callback(bar);
});
```

## Run

We've implemented datafeed with searching/resolving symbols, loading historical data and providing real-time updates via WebSocket.

Now you can go upper to the `chart` folder and run `npx serve` (if not already done before) and see how it works.

You can find the full code of this example in [Tutorial Repo][tutorial-repo-url].

:warning: Note: We cannot guarantee that Birdeye works in your region. If you see `ERR_CONNECTION_REFUSED` error, try to use a proxy/vpn.

Return to [Home Page](home.md).

[tutorial-repo-url]: https://github.com/tradingview/charting-library-tutorial
[subscribe-bars-docs-url]: https://github.com/tradingview/charting_library/wiki/JS-Api#subscribebarssymbolinfo-resolution-onrealtimecallback-subscriberuid-onresetcacheneededcallback
[unsubscribe-bars-docs-url]: https://github.com/tradingview/charting_library/wiki/JS-Api#unsubscribebarssubscriberuid
[streaming-file-url]: ../src/streaming.js
[datafeed-file-url]: ../src/datafeed.js
