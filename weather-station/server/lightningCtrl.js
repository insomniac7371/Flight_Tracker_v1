// Real-time lightning strike dots via Blitzortung community WebSocket.
// Maintains a 30-minute rolling buffer of strikes near home and serves
// them via GET /api/lightning. No API key required.

"use strict";
const fs = require("fs");
const path = require("path");

let WebSocketImpl = null;
try {
  WebSocketImpl = require("ws");
} catch (e) {
  WebSocketImpl = null;
}

const SETTINGS_PATH = path.join(__dirname, "/../settings.json");
const MAX_AGE_MS = 30 * 60 * 1000; // keep 30 min of history
const BOX_DEG = 6;                  // ±6° box around home (~420 miles)

const strikes = []; // { lat, lon, t } sorted oldest-first
let ws = null;
let wsStatus = "idle";
let reconnectTimer = null;

function readSettings() {
  try {
    const s = JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf8"));
    return { lat: parseFloat(s.startingLat), lon: parseFloat(s.startingLon) };
  } catch (e) {
    return { lat: 32.9697, lon: -80.0473 };
  }
}

function prune() {
  const cutoff = Date.now() - MAX_AGE_MS;
  let i = 0;
  while (i < strikes.length && strikes[i].t < cutoff) i++;
  if (i > 0) strikes.splice(0, i);
}

function connect() {
  if (!WebSocketImpl) return;
  if (ws) {
    try { ws.terminate(); } catch (e) { /* ignore */ }
    ws = null;
  }
  if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }

  const { lat, lon } = readSettings();
  wsStatus = "connecting";

  // Blitzortung region 8 = Americas (us.blitzortung.org alt: ws8.blitzortung.org)
  ws = new WebSocketImpl("wss://ws8.blitzortung.org:8082/");

  ws.on("open", () => {
    wsStatus = "open";
    ws.send(JSON.stringify({
      west: lon - BOX_DEG,
      east: lon + BOX_DEG,
      south: lat - BOX_DEG,
      north: lat + BOX_DEG,
    }));
  });

  ws.on("message", (data) => {
    try {
      const d = JSON.parse(data.toString());
      if (typeof d.lat === "number" && typeof d.lon === "number") {
        strikes.push({ lat: d.lat, lon: d.lon, t: Date.now() });
        // Keep array size bounded between prune calls
        if (strikes.length > 5000) prune();
      }
    } catch (e) { /* ignore malformed */ }
  });

  ws.on("close", () => {
    wsStatus = "closed";
    ws = null;
    reconnectTimer = setTimeout(connect, 30000);
  });

  ws.on("error", () => {
    wsStatus = "error";
    try { if (ws) ws.terminate(); } catch (e) { /* ignore */ }
    ws = null;
    reconnectTimer = setTimeout(connect, 30000);
  });
}

function getStrikes(req, res) {
  prune();
  res.json({ strikes: strikes.slice(), status: wsStatus, count: strikes.length });
}

// Start connecting on module load; reconnect every 30 min to pick up home changes.
connect();
setInterval(connect, 30 * 60 * 1000);

module.exports = { getStrikes };
