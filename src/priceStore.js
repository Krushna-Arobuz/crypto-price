// In-memory store for latest prices, keyed by symbol (e.g. "BTCUSDT")
const priceStore = new Map();

module.exports = { priceStore };
