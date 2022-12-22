import { parseResolution, getNextBarTime, BE_API_KEY } from './helpers.js'

let subscriptionItem = {}

// Create WebSocket connection.
const socket = new WebSocket(
  `wss://public-api.birdeye.so/socket?x-api-key=${BE_API_KEY}`,
  'echo-protocol'
)

// Connection opened
socket.addEventListener('open', (event) => {
  console.log('[socket] Connected')
})

// Listen for messages
socket.addEventListener('message', (msg) => {
  const data = JSON.parse(msg.data)

  if (data.type !== 'PRICE_DATA') return console.log(data)

  const currTime = data.data.unixTime * 1000
  const lastBar = subscriptionItem.lastBar
  const resolution = subscriptionItem.resolution
  const nextBarTime = getNextBarTime(lastBar, resolution)

  let bar

  if (currTime >= nextBarTime) {
    bar = {
      time: nextBarTime,
      open: data.data.o,
      high: data.data.h,
      low: data.data.l,
      close: data.data.c,
      volume: data.data.v,
    }
    console.log('[socket] Generate new bar')
  } else {
    bar = {
      ...lastBar,
      high: Math.max(lastBar.high, data.data.h),
      low: Math.min(lastBar.low, data.data.l),
      close: data.data.c,
      volume: data.data.v,
    }
    console.log('[socket] Update the latest bar by price')
  }

  subscriptionItem.lastBar = bar
  subscriptionItem.callback(bar)
})

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
  }

  const msg = {
    type: 'SUBSCRIBE_PRICE',
    data: {
      chartType: parseResolution(resolution),
      address: symbolInfo.address,
      currency: 'usd',
    },
  }

  socket.send(JSON.stringify(msg))
}

export function unsubscribeFromStream() {
  const msg = {
    type: 'UNSUBSCRIBE_PRICE',
  }

  socket.send(JSON.stringify(msg))
}
