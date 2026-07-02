// Weather alerts (NWS), air quality (OWM), and a data-source health summary.

const fs = require("fs");
const path = require("path");
const aircraftCtrl = require("./aircraftCtrl");
const vesselCtrl = require("./vesselCtrl");

const SETTINGS_PATH = path.join(__dirname, "/../settings.json");
const UA = "DadFlightTracker/1.0 (kiosk)";

function settings() {
  try {
    return JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf8"));
  } catch (e) {
    return {};
  }
}

async function fetchJson(url, ms, headers) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: "application/json", "User-Agent": UA, ...(headers || {}) },
    });
    if (!r.ok) return { __status: r.status };
    return await r.json();
  } catch (e) {
    return { __error: String(e) };
  } finally {
    clearTimeout(t);
  }
}

function homeLatLon() {
  const s = settings();
  return { lat: parseFloat(s.startingLat), lon: parseFloat(s.startingLon) };
}

// --- NWS weather alerts -----------------------------------------------------
const alertsCache = { t: 0, data: null };

async function getAlerts(req, res) {
  const now = Date.now();
  if (alertsCache.data && now - alertsCache.t < 60 * 1000) {
    return res.json(alertsCache.data);
  }
  const { lat, lon } = homeLatLon();
  const j = await fetchJson(
    `https://api.weather.gov/alerts/active?point=${lat},${lon}`,
    6000
  );
  const features = j && Array.isArray(j.features) ? j.features : [];
  const alerts = features.map((f) => {
    const p = f.properties || {};
    return {
      id: f.id,
      event: p.event,
      severity: p.severity,
      urgency: p.urgency,
      headline: p.headline,
      description: p.description,
      instruction: p.instruction,
      area: p.areaDesc,
      expires: p.expires,
      sender: p.senderName,
    };
  });
  const data = { count: alerts.length, alerts };
  alertsCache.t = now;
  alertsCache.data = data;
  return res.json(data);
}

// --- Air quality (OpenWeatherMap) -------------------------------------------
const AQI_LABEL = { 1: "Good", 2: "Fair", 3: "Moderate", 4: "Poor", 5: "Very Poor" };
const aqiCache = { t: 0, data: null };

async function getAqi(req, res) {
  const now = Date.now();
  if (aqiCache.data && now - aqiCache.t < 10 * 60 * 1000) {
    return res.json(aqiCache.data);
  }
  const key = settings().owmApiKey;
  if (!key) return res.json({ aqi: null, label: null, source: "no-key" });
  const { lat, lon } = homeLatLon();
  const j = await fetchJson(
    `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${key}`,
    5000
  );
  const item = j && Array.isArray(j.list) ? j.list[0] : null;
  const aqi = item && item.main ? item.main.aqi : null;
  const data = {
    aqi,
    label: aqi ? AQI_LABEL[aqi] : null,
    pm25: item && item.components ? item.components.pm2_5 : null,
    source: "owm",
  };
  aqiCache.t = now;
  aqiCache.data = data;
  return res.json(data);
}

// --- Data-source health -----------------------------------------------------
async function getHealth(req, res) {
  const s = settings();
  const { lat, lon } = homeLatLon();

  // Quick live checks for the free/cheap services (parallel).
  const [rainviewer, nws, adsbdb, geocode] = await Promise.all([
    fetchJson("https://api.rainviewer.com/public/weather-maps.json", 4000),
    fetchJson(`https://api.weather.gov/alerts/active?point=${lat},${lon}`, 5000),
    fetchJson("https://api.adsbdb.com/v0/aircraft/A835AF", 4000),
    fetchJson(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}`,
      4000
    ),
  ]);

  const liveOk = (j) => !!(j && !j.__error && !j.__status);

  const sources = [
    {
      name: "Weather (Tomorrow.io)",
      ok: !!s.weatherApiKey,
      detail: s.weatherApiKey ? "key set" : "no key",
    },
    {
      name: "Map layers + AQI (OpenWeatherMap)",
      ok: !!s.owmApiKey,
      detail: s.owmApiKey ? "key set" : "no key",
    },
    { name: "Flights (ADS-B)", ...aircraftCtrl.health() },
    { name: "Ships (aisstream.io)", ...vesselCtrl.health() },
    {
      name: "Aircraft photos/routes (adsbdb)",
      ok: liveOk(adsbdb),
      detail: liveOk(adsbdb) ? "reachable" : "unreachable",
    },
    {
      name: "Weather alerts (NWS)",
      ok: liveOk(nws),
      detail: liveOk(nws) ? "reachable" : "unreachable",
    },
    {
      name: "Radar (RainViewer)",
      ok: liveOk(rainviewer),
      detail: liveOk(rainviewer) ? "reachable" : "unreachable",
    },
    {
      name: "Geocoding (BigDataCloud)",
      ok: liveOk(geocode),
      detail: liveOk(geocode) ? "reachable" : "unreachable",
    },
  ];
  return res.json({ sources });
}

module.exports = { getAlerts, getAqi, getHealth };
