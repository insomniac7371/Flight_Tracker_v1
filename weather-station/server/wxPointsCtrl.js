// City/town weather values for the "Values" layer mode — numbers placed on the
// map (like a TV weather map). Uses the OpenWeatherMap current-weather endpoint
// (one cached call per town) keyed by the same OWM key the tile layers use.

const fs = require("fs");
const path = require("path");

const SETTINGS_PATH = path.join(__dirname, "/../settings.json");
const TTL = 10 * 60 * 1000; // refresh each town at most every 10 min

// Towns spread across the Lowcountry view so values are distributed.
const TOWNS = [
  { name: "Charleston", lat: 32.776, lon: -79.931 },
  { name: "North Charleston", lat: 32.854, lon: -79.975 },
  { name: "Mount Pleasant", lat: 32.794, lon: -79.863 },
  { name: "Summerville", lat: 33.018, lon: -80.176 },
  { name: "Goose Creek", lat: 32.981, lon: -80.032 },
  { name: "Moncks Corner", lat: 33.196, lon: -80.011 },
  { name: "Walterboro", lat: 32.905, lon: -80.667 },
  { name: "Georgetown", lat: 33.377, lon: -79.295 },
  { name: "Beaufort", lat: 32.431, lon: -80.67 },
  { name: "Orangeburg", lat: 33.492, lon: -80.856 },
  { name: "Kingstree", lat: 33.663, lon: -79.832 },
  { name: "St. George", lat: 33.19, lon: -80.575 },
  { name: "Hilton Head", lat: 32.216, lon: -80.752 },
  { name: "Manning", lat: 33.696, lon: -80.213 },
  { name: "Santee", lat: 33.482, lon: -80.487 },
  { name: "Edisto Beach", lat: 32.505, lon: -80.3 },
  { name: "Awendaw", lat: 33.03, lon: -79.614 },
  { name: "Bamberg", lat: 33.297, lon: -81.034 },
];

const wxCache = new Map(); // "lat,lon" -> { t, data }

function owmKey() {
  try {
    const s = JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf8"));
    return s.owmApiKey || null;
  } catch (e) {
    return null;
  }
}

async function fetchJson(url, ms) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    return r.ok ? await r.json() : null;
  } catch (e) {
    return null;
  } finally {
    clearTimeout(t);
  }
}

async function townWx(town, key) {
  const k = `${town.lat},${town.lon}`;
  const c = wxCache.get(k);
  if (c && Date.now() - c.t < TTL) return c.data;
  const j = await fetchJson(
    `https://api.openweathermap.org/data/2.5/weather?lat=${town.lat}&lon=${town.lon}&units=imperial&appid=${key}`,
    4000
  );
  if (j) wxCache.set(k, { t: Date.now(), data: j });
  return j || (c && c.data) || null;
}

function valueFor(owm, layer) {
  if (!owm) return null;
  switch (layer) {
    case "temp":
      return owm.main ? Math.round(owm.main.temp) : null;
    case "wind":
      return owm.wind ? Math.round(owm.wind.speed) : null;
    case "clouds":
      return owm.clouds ? owm.clouds.all : null;
    case "pressure":
      return owm.main ? Math.round(owm.main.pressure) : null;
    default:
      return null;
  }
}

const UNIT = { temp: "°", wind: "", clouds: "%", pressure: "" };

async function getWxPoints(req, res) {
  const layer = String(req.query.layer || "temp");
  const key = owmKey();
  if (!key) return res.json({ layer, source: "no-key", points: [] });

  const points = [];
  await Promise.all(
    TOWNS.map(async (town) => {
      const owm = await townWx(town, key);
      const v = valueFor(owm, layer);
      if (v != null) {
        points.push({ name: town.name, lat: town.lat, lon: town.lon, value: v });
      }
    })
  );
  res.json({ layer, source: "owm", unit: UNIT[layer] || "", points });
}

module.exports = { getWxPoints };
