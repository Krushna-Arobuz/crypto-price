const { startBinanceListener } = require("./binanceListener");
const { createLocalWSServer } = require("./wsServer");
const { createRestAPI } = require("./restApi");
const { priceStore } = require("./priceStore");

const WS_PORT = process.env.WS_PORT || 8080;
const HTTP_PORT = process.env.HTTP_PORT || 8000;

// trading pairs to track
const PAIRS = ["btcusdt", "ethusdt", "bnbusdt"];

async function main() {
  console.log("Starting Crypto Price WebSocket Server...\n");

  // 1. start local websocket server
  const { wss, broadcast } = createLocalWSServer(WS_PORT);
  console.log(`[server] WebSocket server running on ws://localhost:${WS_PORT}/ws`);

  // 2. connect to binance for each pair
  PAIRS.forEach((pair) => {
    startBinanceListener(pair, (priceData) => {
      // store latest price and broadcast to all clients
      priceStore.set(priceData.symbol, priceData);
      broadcast(JSON.stringify(priceData));
    });
  });

  // 3. start rest api + serve dashboard
  createRestAPI(HTTP_PORT);

  console.log(`\nFlow: Binance WS --> Listener --> Local WS Server --> Clients\n`);
}

main().catch(console.error);
