// Server-side proxy for the Tomorrow.io v4 timelines API with in-memory
// caching. The free tier allows only 25 requests/hour, so kiosk reboots and
// map pans must hit the cache instead of the upstream API. Also keeps the
// weatherApiKey out of the browser entirely.

const fs = require("fs");
const path = require("path");

const SETTINGS_PATH = path.join(__dirname, "/../settings.json");
const UA = "DadFlightTracker/1.0 (kiosk)";
const FETCH_TIMEOUT_MS = 8000;

// Per-type request shape (fields/timesteps/forecast window mirror what the
// client previously requested directly) and cache TTL.
const TYPES = {
  current: {
    timesteps: "current",
    windowMs: 0,
    ttlMs: 10 * 60 * 1000, // 10 min
    fields: [
      "temperature",
      "temperatureApparent",
      "humidity",
      "windSpeed",
      "windDirection",
      "pressureSurfaceLevel",
      "precipitationIntensity",
      "precipitationType",
      "precipitationProbability",
      "cloudCover",
      "weatherCode",
      "dewPoint",
    ],
  },
  hourly: {
    timesteps: "1h",
    windowMs: 23 * 60 * 60 * 1000, // next 23 hours
    ttlMs: 45 * 60 * 1000, // 45 min
    fields: [
      "temperature",
      "precipitationProbability",
      "precipitationIntensity",
      "windSpeed",
    ],
  },
  daily: {
    timesteps: "1d",
    windowMs: 4 * 24 * 60 * 60 * 1000, // next 4 days
    ttlMs: 6 * 60 * 60 * 1000, // 6 hours
    fields: [
      "temperature",
      "precipitationProbability",
      "precipitationIntensity",
      "windSpeed",
    ],
  },
};

// "type:lat,lon" -> { t, data }. Entries are kept past their TTL so they can
// be served stale when the upstream call fails (stale-while-error).
const cache = new Map();
const MAX_CACHE_ENTRIES = 200;

/**
 * Read settings.json, returning {} on any failure.
 *
 * @returns {Object} parsed settings
 */
function settings() {
  try {
    return JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf8"));
  } catch (e) {
    return {};
  }
}

/**
 * Evict oldest cache entries once the map grows past MAX_CACHE_ENTRIES
 * (map panning can generate many distinct coordinate keys).
 */
function pruneCache() {
  while (cache.size > MAX_CACHE_ENTRIES) {
    cache.delete(cache.keys().next().value);
  }
}

/**
 * Call the Tomorrow.io timelines endpoint. Never logs or returns the URL,
 * since it contains the API key.
 *
 * @param {URLSearchParams} params query params including apikey
 * @returns {Promise<Object>} { data } on success, { status } or { error } on failure
 */
async function fetchTimelines(params) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const r = await fetch(`https://api.tomorrow.io/v4/timelines?${params}`, {
      signal: ctrl.signal,
      headers: { Accept: "application/json", "User-Agent": UA },
    });
    if (!r.ok) return { status: r.status };
    return { data: await r.json() };
  } catch (e) {
    return { error: e && e.name === "AbortError" ? "timeout" : "network error" };
  } finally {
    clearTimeout(t);
  }
}

/**
 * GET /api/weather?type=current|hourly|daily&lat=..&lon=..
 * Proxies Tomorrow.io with caching; serves stale data on upstream failure.
 *
 * @param {Object} req
 * @param {Object} res
 */
async function getWeather(req, res) {
  const cfg = TYPES[req.query.type];
  if (!cfg) {
    return res.status(400).json({ error: "type must be current, hourly, or daily" });
  }
  const lat = parseFloat(req.query.lat);
  const lon = parseFloat(req.query.lon);
  if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return res.status(400).json({ error: "Invalid coordinates" });
  }

  const key = `${req.query.type}:${lat.toFixed(3)},${lon.toFixed(3)}`;
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && now - cached.t < cfg.ttlMs) {
    return res.json(cached.data);
  }

  const apiKey = settings().weatherApiKey;
  if (!apiKey) {
    return res.status(503).json({ error: "Weather API key not configured" });
  }

  const params = new URLSearchParams({
    location: `${lat},${lon}`,
    fields: cfg.fields.join(","),
    timesteps: cfg.timesteps,
    apikey: apiKey,
  });
  if (cfg.windowMs) {
    params.set("endTime", new Date(now + cfg.windowMs).toISOString());
  }

  const result = await fetchTimelines(params);
  if (result.data) {
    cache.set(key, { t: now, data: result.data });
    pruneCache();
    return res.json(result.data);
  }

  // Stale-while-error: a 429 or network failure serves the expired entry
  // rather than blanking the weather cards.
  console.error(
    `getWeather(${req.query.type}) upstream failed:`,
    result.status ? `HTTP ${result.status}` : result.error
  );
  if (cached) {
    return res.json(cached.data);
  }
  return res
    .status(result.status === 429 ? 429 : 502)
    .json({ error: "Weather fetch failed" });
}

module.exports = { getWeather };
