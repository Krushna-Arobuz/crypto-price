const WebSocket = require("ws");

const MAX_CLIENTS = 100;

// Creates the WS server attached to an existing HTTP server.
// This way both Express and WebSocket share the same port.
function createLocalWSServer(server) {
  const wss = new WebSocket.Server({
    server,
    path: "/ws",
    verifyClient: ({ req }, cb) => {
      if (wss.clients.size >= MAX_CLIENTS) {
        console.warn("[ws] connection rejected - max clients reached");
        cb(false, 503, "Too many connections");
      } else {
        cb(true);
      }
    },
  });

  wss.on("connection", (ws, req) => {
    const clientIp = req.socket.remoteAddress;
    const clientId = Date.now().toString(36);
    console.log(`[ws] client connected: ${clientId} (${clientIp}), total: ${wss.clients.size}`);

    // send welcome message
    ws.send(JSON.stringify({
      type: "connected",
      message: "Connected to Crypto Price Server",
      clientId,
      timestamp: new Date().toISOString(),
    }));

    // handle incoming messages (ping/pong)
    ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === "ping") {
          ws.send(JSON.stringify({ type: "pong", timestamp: new Date().toISOString() }));
        }
      } catch (_) {
        // ignore non-json messages
      }
    });

    ws.on("close", (code) => {
      console.log(`[ws] client disconnected: ${clientId} (code ${code}), remaining: ${wss.clients.size}`);
    });

    ws.on("error", (err) => {
      console.error(`[ws] client ${clientId} error:`, err.message);
    });
  });

  // Broadcast a message to all connected clients
  function broadcast(message) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message, (err) => {
          if (err) console.error("[ws] send error:", err.message);
        });
      }
    });
  }

  return { wss, broadcast };
}

module.exports = { createLocalWSServer };
