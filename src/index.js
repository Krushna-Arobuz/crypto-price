const http = require("http");
const { startBinanceListener } = require("./binanceListener");
const { createLocalWSServer } = require("./wsServer");
const { createRestAPI } = require("./restApi");
const { priceStore } = require("./priceStore");

// Render provides PORT env var; locally use 8000
const PORT = process.env.PORT || 8000;

// trading pairs to track
const PAIRS = ["btcusdt", "ethusdt", "bnbusdt"];

async function main() {
  console.log("Starting Crypto Price WebSocket Server...\n");

  // 1. create express app
  const app = createRestAPI();

  // 2. create a single HTTP server for both express and websocket
  const server = http.createServer(app);

  // 3. attach websocket server to the same http server
  const { broadcast } = createLocalWSServer(server);

  // 4. connect to binance for each pair
  PAIRS.forEach((pair) => {
    startBinanceListener(pair, (priceData) => {
      priceStore.set(priceData.symbol, priceData);
      broadcast(JSON.stringify(priceData));
    });
  });

  // 5. start listening on a single port
  server.listen(PORT, () => {
    console.log(`[server] running on http://localhost:${PORT}`);
    console.log(`[server] WebSocket available at ws://localhost:${PORT}/ws`);
    console.log(`\nFlow: Binance WS --> Listener --> Local WS Server --> Clients\n`);
  });
}

main().catch(console.error);
