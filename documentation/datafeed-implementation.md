# Datafeed Implementation

## Why you need an external data source

The Charting Library is used to display financial data, but it doesn't contain any data itself. Whatever you have, a web API, a database or a CSV file, you can display your data in the Charting Library.

In this example, we'll use a web API integration of [Birdeye][birdeye-website-url] (also [Birdeye API][birdeye-api-url]).

## How the datafeed works

Datafeed is an Object you supply to the TradingView Widget. It has a set of methods like `getBars` or `resolveSymbol` that are called by the Charting Library in certain cases. The datafeed returns results using callback functions.

## onReady

[Link to the doc][onready-docs-url].

This method is used by the Charting Library to get a configuration of your datafeed (e.g. supported resolutions, exchanges and so on).

This is the first method of the datafeed that is called.

We'll use the following configuration for our datafeed sample:

```javascript
const configurationData = {
  supported_resolutions: [
    '1',
    '3',
    '5',
    '15',
    '30',
    '60',
    '120',
    '240',
    '1D',
    '1W',
  ],
  intraday_multipliers: ['1', '3', '5', '15', '30', '60', '120', '240'],
  exchanges: [],
};
```

Our datafeed should return this configuration to the Charting Library.
Note, that the callback must be called asynchronously.

[datafeed.js][datafeed-file-url]:

```javascript
const configurationData = {
  // ...
};

export default {
  onReady: (callback) => {
    console.log('[onReady]: Method call');
    setTimeout(() => callback(configurationData));
  },
};
```

## resolveSymbol

[Link to the doc][resolve-symbol-docs-url].

This method is used by the library to retrieve information about a specific symbol (exchange, price scale, full symbol etc.).

These functions are specific to Birdeye and you most likely won't need most of them for implementing your own datafeed.

[helpers.js][helpers-file-url]:

```javascript
// Make requests to Birdeye API
export async function makeApiRequest(path) {
  try {
    const response = await fetch(`https://public-api.birdeye.so/${path}`, {
      headers: {
        'X-API-KEY': BE_API_KEY,
      },
    });
    return response.json();
  } catch (error) {
    throw new Error(`Birdeye request error: ${error.status}`);
  }
}
```

In [datafeed.js][datafeed-file-url] we are going to add a helper function that is used to load all symbols for all supported exchanges (see [Birdeye API][load-all-birdeye-api-url]):

```javascript
import { makeApiRequest, generateSymbol } from './helpers.js';
// ...
async function getAllSymbols() {
  const data = await makeApiRequest(
    'public/tokenlist?sort_by=v24hUSD&sort_type=desc&offset=0&limit=-1'
  );

  return data.data.tokens;
}
```

And we can use this function in `resolveSymbol`.

Please note, that the library can build weekly and monthly resolutions from 1D if we add these resolutions to the supported ones, but we need to directly specify that the datafeed doesn't have these resolutions by setting `has_weekly_and_monthly` to `false`:

```javascript
export default {
  // ...
  resolveSymbol: async (
    symbolAddress,
    onSymbolResolvedCallback,
    onResolveErrorCallback,
    extension
  ) => {
    console.log('[resolveSymbol]: Method call', symbolAddress);
    const symbols = await getAllSymbols();
    const symbolItem = symbols.find((item) => item.address === symbolAddress);

    if (!symbolItem) {
      console.log('[resolveSymbol]: Cannot resolve symbol', symbolAddress);
      onResolveErrorCallback('cannot resolve symbol');
      return;
    }

    const symbolInfo = {
      address: symbolItem.address,
      ticker: symbolItem.address,
      name: symbolItem.symbol,
      description: symbolItem.symbol + '/USD',
      type: symbolItem.type,
      session: '24x7',
      timezone: 'Etc/UTC',
      minmov: 1,
      pricescale: 10 ** 16,
      has_intraday: true,
      has_no_volume: true,
      has_weekly_and_monthly: false,
      supported_resolutions: configurationData.supported_resolutions,
      intraday_multipliers: configurationData.intraday_multipliers,
      volume_precision: 2,
      data_status: 'streaming',
    };

    console.log('[resolveSymbol]: Symbol resolved', symbolAddress);
    onSymbolResolvedCallback(symbolInfo);
  },
  // ...
};
```

## getBars

[Link to the doc][get-bars-docs-url].

This method is used by the Charting Library to get historical data for the symbol.

Add `parseResolution` function to [helpers.js][helpers-file-url] and do not forget to import it in `datafeed.js`. It parses TradingView's resolutions to Birdeye's resolutions:

```javascript
// ...
const RESOLUTION_MAPPING = {
  1: '1m',
  3: '3m',
  5: '5m',
  15: '15m',
  30: '30m',
  60: '1H',
  120: '2H',
  240: '4H',
  '1D': '1D',
  '1W': '1W',
};

export function parseResolution(resolution) {
  if (!resolution || !RESOLUTION_MAPPING[resolution])
    return RESOLUTION_MAPPING[0];

  return RESOLUTION_MAPPING[resolution];
}
```

Use [Birdeye API][get-history-birdeye-api-url] and the newly created function `parseResolution` in `getBars` method in [datafeed.js][datafeed-file-url].

The API doesn't allow you to specify a `from` date, so you have to filter bars on the client-side:

```javascript
import { makeApiRequest, parseResolution } from './helpers.js';
// ...
export default {
  // ...
  getBars: async (
    symbolInfo,
    resolution,
    periodParams,
    onHistoryCallback,
    onErrorCallback
  ) => {
    const { from, to, firstDataRequest } = periodParams;
    console.log('[getBars]: Method call', symbolInfo, resolution, from, to);
    const urlParameters = {
      address: symbolInfo.address,
      type: parseResolution(resolution),
      time_from: from,
      time_to: to,
    };
    const query = Object.keys(urlParameters)
      .map((name) => `${name}=${encodeURIComponent(urlParameters[name])}`)
      .join('&');
    try {
      const data = await makeApiRequest(`defi/ohlcv?${query}`);
      if (!data.success || data.data.items.length === 0) {
        // "noData" should be set if there is no data in the requested period.
        onHistoryCallback([], {
          noData: true,
        });
        return;
      }
      let bars = [];
      data.data.items.forEach((bar) => {
        if (bar.unixTime >= from && bar.unixTime < to) {
          bars = [
            ...bars,
            {
              time: bar.unixTime * 1000,
              low: bar.l,
              high: bar.h,
              open: bar.o,
              close: bar.c,
            },
          ];
        }
      });
      if (firstDataRequest) {
        lastBarsCache.set(symbolInfo.address, {
          ...bars[bars.length - 1],
        });
      }
      console.log(`[getBars]: returned ${bars.length} bar(s)`);
      onHistoryCallback(bars, {
        noData: false,
      });
    } catch (error) {
      console.log('[getBars]: Get error', error);
      onErrorCallback(error);
    }
  },
  //...
};
```

At this point if you save all your changes and refresh your page, you should see a chart plotted and should now be able to search symbols and display historical data.

Let's [implement the streaming](streaming-implementation.md).
Also you can return to [Home Page](home.md).

[birdeye-website-url]: https://birdeye.so/
[birdeye-api-url]: https://public-api.birdeye.so/
[load-all-birdeye-api-url]: https://public-api.birdeye.so/#/Public/get_public_tokenlist
[get-history-birdeye-api-url]: https://public-api.birdeye.so/#/Private%20(requires%20API%20key)/get_defi_ohlcv_pair
[onready-docs-url]: https://github.com/tradingview/charting_library/wiki/JS-Api#onreadycallback
[resolve-symbol-docs-url]: https://github.com/tradingview/charting_library/wiki/JS-Api#resolvesymbolsymbolname-onsymbolresolvedcallback-onresolveerrorcallback
[get-bars-docs-url]: https://github.com/tradingview/charting_library/wiki/JS-Api#getbarssymbolinfo-resolution-from-to-onhistorycallback-onerrorcallback-firstdatarequest
[search-symbols-docs-url]: https://github.com/tradingview/charting_library/wiki/JS-Api#searchsymbolsuserinput-exchange-symboltype-onresultreadycallback
[datafeed-file-url]: ../src/datafeed.js
[helpers-file-url]: ../src/helpers.js
