// Tomorrow.io precipitation FORECAST map-tile proxy.
//
// Tomorrow.io's free tier is 25 req/hour shared with the weather cards, so a
// scrubbable radar loop is out — but a single cached forecast overlay is
// affordable. This proxy:
//   - keeps the API key server-side (never sent to the browser),
//   - rounds the forecast time to a 30-min boundary so every client/refresh
//     requests the SAME tiles (maximizing cache hits),
//   - caches tile bytes in memory for 30 min,
//   - serves a transparent tile on any upstream error so the map never shows
//     broken tiles and the failure is retried soon after.

const fs = require("fs");
const path = require("path");

const SETTINGS_PATH = path.join(__dirname, "/../settings.json");
const FIELD = "precipitationIntensity";
const TTL_MS = 30 * 60 * 1000; // tiles refresh on the 30-min boundary
const ERR_TTL_MS = 60 * 1000; // brief cache on failure, then retry
const ALLOWED_OFFSETS = new Set([60, 120]); // minutes ahead (chips: +1h/+2h)
const FETCH_TIMEOUT_MS = 8000;

// 1x1 transparent PNG — returned on any error so Leaflet shows nothing rather
// than a broken-tile icon.
const TRANSPARENT_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AAAMBAQDJ/pLvAAAAAElFTkSuQmCC",
  "base64"
);

const cache = new Map(); // key -> { t, buf, ok }
const MAX_ENTRIES = 400;

/** @returns {Object} parsed settings.json ({} on failure) */
function settings() {
  try {
    return JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf8"));
  } catch (e) {
    return {};
  }
}

/** Forecast target time rounded to a 30-min boundary, as an ISO string. */
function roundedTargetIso(offsetMin) {
  const ms = 30 * 60 * 1000;
  const target = Date.now() + offsetMin * 60 * 1000;
  return new Date(Math.round(target / ms) * ms).toISOString();
}

function prune() {
  while (cache.size > MAX_ENTRIES) cache.delete(cache.keys().next().value);
}

function sendTile(res, buf, cacheable) {
  res.set("Content-Type", "image/png");
  res.set("Cache-Control", cacheable ? "public, max-age=1800" : "no-store");
  res.end(buf);
}

/**
 * GET /api/precip-tile/:offset/:z/:x/:y.png — cached Tomorrow.io forecast tile.
 *
 * @param {Object} req
 * @param {Object} res
 */
async function getPrecipTile(req, res) {
  const offset = parseInt(req.params.offset, 10);
  const z = parseInt(req.params.z, 10);
  const x = parseInt(req.params.x, 10);
  const y = parseInt(req.params.y, 10);
  if (
    !ALLOWED_OFFSETS.has(offset) ||
    [z, x, y].some((n) => Number.isNaN(n)) ||
    z < 0 || z > 16
  ) {
    return res.status(400).json({ error: "bad tile request" });
  }

  const iso = roundedTargetIso(offset);
  const key = `${offset}:${iso}:${z}:${x}:${y}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.t < (hit.ok ? TTL_MS : ERR_TTL_MS)) {
    return sendTile(res, hit.buf, hit.ok);
  }

  const apiKey = settings().weatherApiKey;
  if (!apiKey) return sendTile(res, TRANSPARENT_PNG, false);

  const url =
    `https://api.tomorrow.io/v4/map/tile/${z}/${x}/${y}/${FIELD}/` +
    `${encodeURIComponent(iso)}.png?apikey=${apiKey}`;

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const r = await fetch(url, {
      signal: ctrl.signal,
      headers: { "User-Agent": "DadFlightTracker/1.0" },
    });
    if (!r.ok) {
      if (r.status === 429) console.error("precip-tile: Tomorrow.io 429 (quota)");
      cache.set(key, { t: Date.now(), buf: TRANSPARENT_PNG, ok: false });
      prune();
      return sendTile(res, TRANSPARENT_PNG, false);
    }
    const buf = Buffer.from(await r.arrayBuffer());
    cache.set(key, { t: Date.now(), buf, ok: true });
    prune();
    return sendTile(res, buf, true);
  } catch (e) {
    cache.set(key, { t: Date.now(), buf: TRANSPARENT_PNG, ok: false });
    prune();
    return sendTile(res, TRANSPARENT_PNG, false);
  } finally {
    clearTimeout(t);
  }
}

module.exports = { getPrecipTile };
