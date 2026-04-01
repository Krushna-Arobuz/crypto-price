const WebSocket = require("ws");

const BINANCE_WS_BASE = "wss://stream.binance.com:9443/ws";
const RECONNECT_DELAY = 5000;

// Connects to Binance ticker stream for a given pair and
// calls onUpdate with parsed price data on each message.
// Auto-reconnects if the connection drops.
function startBinanceListener(pair, onUpdate) {
  const url = `${BINANCE_WS_BASE}/${pair}@ticker`;

  function connect() {
    console.log(`[binance] connecting to ${pair.toUpperCase()}...`);
    const ws = new WebSocket(url);

    ws.on("open", () => {
      console.log(`[binance] connected to ${pair.toUpperCase()}`);
    });

    ws.on("message", (raw) => {
      try {
        const d = JSON.parse(raw.toString());

        const priceData = {
          symbol: d.s,                             // e.g. BTCUSDT
          lastPrice: parseFloat(d.c),              // current price
          change24h: parseFloat(d.P),              // 24h change %
          highPrice: parseFloat(d.h),              // 24h high
          lowPrice: parseFloat(d.l),               // 24h low
          volume: parseFloat(d.v),                 // 24h volume
          timestamp: new Date(d.E).toISOString(),  // event time
        };

        onUpdate(priceData);
      } catch (err) {
        console.error(`[binance] parse error (${pair}):`, err.message);
      }
    });

    ws.on("close", (code) => {
      console.warn(`[binance] ${pair.toUpperCase()} disconnected (code ${code}), reconnecting in ${RECONNECT_DELAY / 1000}s`);
      setTimeout(connect, RECONNECT_DELAY);
    });

    ws.on("error", (err) => {
      console.error(`[binance] ${pair.toUpperCase()} error:`, err.message);
      ws.terminate();
    });
  }

  connect();
}

module.exports = { startBinanceListener };
