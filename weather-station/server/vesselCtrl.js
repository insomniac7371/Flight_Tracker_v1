// Live maritime (AIS) traffic via aisstream.io (free, requires an API key).
// Maintains a single WebSocket subscription filtered to a box around home and
// keeps the latest position per vessel; /api/vessels serves the current list.

const fs = require("fs");
const path = require("path");

let WebSocketImpl = null;
try {
  WebSocketImpl = require("ws");
} catch (e) {
  WebSocketImpl = null;
}

const SETTINGS_PATH = path.join(__dirname, "/../settings.json");
const VESSEL_TTL = 12 * 60 * 1000; // drop vessels not heard from in 12 min
const BOX_DEG = 0.7; // ~50 mi half-box around home

const vessels = new Map(); // mmsi -> { mmsi, lat, lon, course, speed, heading, name, type, t }
let ws = null;
let connectedKey = null;
let wsStatus = "idle"; // idle | connecting | open | error | closed
let msgCount = 0;
let lastError = null;

function readSettings() {
  try {
    const s = JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf8"));
    return {
      key: s.aisApiKey || null,
      lat: parseFloat(s.startingLat),
      lon: parseFloat(s.startingLon),
    };
  } catch (e) {
    return { key: null, lat: 32.9697, lon: -80.0473 };
  }
}

function connect() {
  if (!WebSocketImpl) return;
  const { key, lat, lon } = readSettings();
  if (!key) return; // no key yet — nothing to connect to
  if (ws && connectedKey === key) return; // already connected with this key
  if (ws) {
    try {
      ws.terminate();
    } catch (e) {
      /* ignore */
    }
    ws = null;
  }
  connectedKey = key;

  const box = [
    [
      [lat - BOX_DEG, lon - BOX_DEG],
      [lat + BOX_DEG, lon + BOX_DEG],
    ],
  ];

  wsStatus = "connecting";
  try {
    ws = new WebSocketImpl("wss://stream.aisstream.io/v0/stream");
    ws.on("open", () => {
      wsStatus = "open";
      const sub = {
        APIKey: key,
        BoundingBoxes: box,
        FilterMessageTypes: ["PositionReport", "ShipStaticData"],
      };
      ws.send(JSON.stringify(sub));
      console.log("[AIS] connected, subscribed:", JSON.stringify(box));
    });
    ws.on("message", (raw) => {
      try {
        msgCount += 1;
        const m = JSON.parse(raw.toString());
        if (m.error) {
          lastError = m.error;
          console.log("[AIS] server error:", m.error);
          return;
        }
        const meta = m.MetaData || {};
        const mmsi = meta.MMSI;
        if (!mmsi) return;
        const ex = vessels.get(mmsi) || {};
        if (m.MessageType === "PositionReport") {
          const p = m.Message.PositionReport;
          vessels.set(mmsi, {
            ...ex,
            mmsi,
            lat: p.Latitude,
            lon: p.Longitude,
            course: typeof p.Cog === "number" ? p.Cog : ex.course,
            speed: typeof p.Sog === "number" ? p.Sog : ex.speed,
            heading: p.TrueHeading != null && p.TrueHeading < 360 ? p.TrueHeading : ex.heading,
            name: ex.name || (meta.ShipName || "").trim() || null,
            t: Date.now(),
          });
        } else if (m.MessageType === "ShipStaticData") {
          const s = m.Message.ShipStaticData;
          vessels.set(mmsi, {
            ...ex,
            mmsi,
            name: (s.Name || "").trim() || ex.name || null,
            type: typeof s.Type === "number" ? s.Type : ex.type,
            t: ex.t || Date.now(),
          });
        }
      } catch (e) {
        /* ignore malformed frame */
      }
    });
    ws.on("close", () => {
      wsStatus = "closed";
      ws = null;
      setTimeout(connect, 5000);
    });
    ws.on("error", (err) => {
      wsStatus = "error";
      lastError = err && err.message ? err.message : String(err);
      console.log("[AIS] ws error:", lastError);
      try {
        ws.terminate();
      } catch (e) {
        /* ignore */
      }
      ws = null;
    });
  } catch (e) {
    wsStatus = "error";
    lastError = String(e);
    ws = null;
  }
}

// Connect on boot and keep retrying (picks up a key added later via settings).
connect();
setInterval(connect, 30000);

// Coarse vessel category from the AIS ship-type code, for marker coloring.
function vesselKind(type) {
  if (type == null) return "other";
  if (type >= 60 && type <= 69) return "passenger";
  if (type >= 70 && type <= 79) return "cargo";
  if (type >= 80 && type <= 89) return "tanker";
  if (type >= 30 && type <= 37) return "fishing";
  if (type >= 40 && type <= 49) return "fast";
  if (type >= 50 && type <= 59) return "service";
  return "other";
}

function getVessels(req, res) {
  const now = Date.now();
  const list = [];
  for (const [mmsi, v] of vessels) {
    if (now - v.t > VESSEL_TTL) {
      vessels.delete(mmsi);
      continue;
    }
    if (v.lat == null || v.lon == null) continue;
    list.push({
      id: String(mmsi),
      name: v.name || String(mmsi),
      lat: v.lat,
      lon: v.lon,
      course: v.heading != null ? v.heading : v.course,
      speed: v.speed,
      kind: vesselKind(v.type),
    });
  }
  res.json({
    source: !WebSocketImpl ? "no-ws" : connectedKey ? "aisstream" : "no-key",
    status: wsStatus,
    msgCount,
    lastError,
    count: list.length,
    vessels: list,
  });
}

function health() {
  if (!WebSocketImpl) return { ok: false, detail: "ws module missing" };
  if (!connectedKey) return { ok: false, detail: "no aisstream key" };
  return {
    ok: wsStatus === "open",
    detail: `${wsStatus} · ${vessels.size} vessels · ${msgCount} msgs`,
  };
}

module.exports = { getVessels, health };
