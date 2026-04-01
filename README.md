# Crypto Price WebSocket Server

Node.js app that connects to Binance's WebSocket API and broadcasts real-time crypto prices to connected clients.

## How it works

```
Binance WebSocket --> Listener --> Local WS Server (ws://localhost:8080/ws) --> Clients
                                        |
                                  REST API (http://localhost:8000)
```

- Listens to Binance ticker streams for BTC/USDT, ETH/USDT, BNB/USDT
- Broadcasts price updates to all connected WebSocket clients
- REST API to fetch latest prices as JSON
- Simple browser dashboard at `http://localhost:8000`

## Setup

```bash
npm install
npm start
```

Or with Docker:

```bash
docker-compose up --build
```

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/price` | All latest prices |
| GET | `/price?symbol=BTCUSDT` | Filter by symbol |
| GET | `/price/BTCUSDT` | Get specific symbol |
| GET | `/health` | Health check |
| WS | `ws://localhost:8080/ws` | Live price stream |

### Example: GET /price/BTCUSDT

```json
{
  "symbol": "BTCUSDT",
  "lastPrice": 67420.50,
  "change24h": 2.35,
  "highPrice": 68100.00,
  "lowPrice": 65800.00,
  "volume": 18432.75,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## WebSocket

Connect to `ws://localhost:8080/ws`. You'll receive:

- A welcome message with your client ID on connect
- Continuous price updates for all tracked pairs

Supports ping/pong - send `{"type": "ping"}` to get a pong back.

## Project Structure

```
src/
  index.js            - entry point, wires everything together
  binanceListener.js  - connects to Binance WS streams
  wsServer.js         - local WebSocket server + broadcast
  restApi.js          - Express REST API + serves dashboard
  priceStore.js       - shared in-memory price store
public/
  index.html          - browser dashboard
```

## Config

| Env Variable | Default | Description |
|-------------|---------|-------------|
| WS_PORT | 8080 | WebSocket server port |
| HTTP_PORT | 8000 | REST API port |

## Features

- Multi-pair support (BTC, ETH, BNB)
- Auto-reconnect on Binance disconnect
- Rate limiting (60 req/min per IP)
- Connection limit (max 100 WS clients)
- Docker support
- Graceful disconnect handling
