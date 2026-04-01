const express = require("express");
const path = require("path");
const rateLimit = require("express-rate-limit");
const { priceStore } = require("./priceStore");

function createRestAPI() {
  const app = express();
  app.use(express.json());

  // serve the dashboard UI
  app.use(express.static(path.join(__dirname, "..", "public")));

  // rate limit: 60 requests per minute per IP
  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, try again later." },
  });
  app.use(limiter);

  // GET /price - returns all prices, or filter with ?symbol=BTCUSDT
  app.get("/price", (req, res) => {
    const { symbol } = req.query;

    if (symbol) {
      const upper = symbol.toUpperCase();
      const data = priceStore.get(upper);
      if (!data) {
        return res.status(404).json({ error: `No data for ${upper}` });
      }
      return res.json(data);
    }

    // return all
    const all = {};
    priceStore.forEach((value, key) => {
      all[key] = value;
    });

    if (Object.keys(all).length === 0) {
      return res.status(503).json({ error: "Price data not available yet, try again shortly." });
    }

    res.json(all);
  });

  // GET /price/:symbol - e.g. /price/BTCUSDT
  app.get("/price/:symbol", (req, res) => {
    const upper = req.params.symbol.toUpperCase();
    const data = priceStore.get(upper);
    if (!data) {
      return res.status(404).json({ error: `No data for ${upper}` });
    }
    res.json(data);
  });

  // health check
  app.get("/health", (req, res) => {
    res.json({
      status: "ok",
      pairs: [...priceStore.keys()],
      timestamp: new Date().toISOString(),
    });
  });

  return app;
}

module.exports = { createRestAPI };
