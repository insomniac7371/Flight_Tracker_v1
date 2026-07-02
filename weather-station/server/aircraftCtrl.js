const fs = require("fs");
const path = require("path");

// Serves a normalized list of nearby aircraft for the map's flight layer.
// Prefers the local dump1090 feed (FR24 feeder + SDR); falls back to the free
// adsb.lol public API so the layer works even before any hardware is set up.

const SETTINGS_PATH = path.join(__dirname, "/../settings.json");
const CACHE_MS = 5000;           // refresh at most every 5s
const STALE_MAX_MS = 90 * 1000;  // serve last-known-good for up to 90s on outage
const DUMP1090_URLS = [
  "http://localhost:8080/data/aircraft.json",
  "http://localhost:8080/skyaware/data/aircraft.json",
  "http://localhost:8080/dump1090/data/aircraft.json",
];

let cache = { t: 0, data: null };
let lastGood = null; // { data, goodAt } — last response with actual aircraft

function readHome() {
  try {
    const s = JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf8"));
    const lat = parseFloat(s.startingLat);
    const lon = parseFloat(s.startingLon);
    if (!isNaN(lat) && !isNaN(lon)) return { lat, lon };
  } catch (e) {
    /* fall through to default */
  }
  return { lat: 32.919, lon: -80.1623 };
}

function num(v) {
  return typeof v === "number" && isFinite(v) ? v : null;
}

// Common rotorcraft ICAO type-code prefixes (so a military helicopter that
// doesn't broadcast emitter category A7 is still recognized as a helicopter).
const HELI_TYPE_RE = /^(EC|AS3|AS5|AS6|AS65|H|R22|R44|R66|B06|B47|B412|S76|S92|UH|HH|MH|CH|AH|EH|NH|A109|A139|A169|A189)/;

// Whether the military bit of dbFlags is set.
function isMil(dbFlags) {
  return dbFlags != null && (Number(dbFlags) & 1) ? true : false;
}

// Aircraft *type* (independent of military status): airliner | helicopter |
// private | other. Helicopter takes precedence so e.g. an MH-65 reads as a
// helicopter, with the military flag carried separately.
function classify(emitterCat, typeCode) {
  const t = String(typeCode || "").toUpperCase();
  if (emitterCat === "A7" || (t && HELI_TYPE_RE.test(t))) return "helicopter";
  switch (emitterCat) {
    case "A3":
    case "A4":
    case "A5":
      return "airliner";
    case "A1":
    case "A2":
      return "private";
    default:
      return "other";
  }
}

async function fetchWithTimeout(url, ms) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, {
      signal: ctrl.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "DadFlightTracker/1.0 (kiosk)",
      },
    });
  } finally {
    clearTimeout(t);
  }
}

function normalizeDump1090(json) {
  const list = Array.isArray(json && json.aircraft) ? json.aircraft : [];
  return list
    .filter((a) => num(a.lat) !== null && num(a.lon) !== null)
    .map((a) => ({
      id: a.hex || a.flight || `${a.lat},${a.lon}`,
      callsign: (a.flight || "").trim() || (a.hex || "").toUpperCase(),
      lat: a.lat,
      lon: a.lon,
      alt: num(a.alt_baro) !== null ? a.alt_baro : num(a.altitude),
      speed: num(a.gs) !== null ? a.gs : num(a.speed),
      track: num(a.track) !== null ? a.track : 0,
      vertRate: num(a.baro_rate) !== null ? a.baro_rate : num(a.geom_rate),
      squawk: a.squawk || null,
      category: classify(a.category, a.t),
      mil: isMil(a.dbFlags),
    }));
}

function normalizeAdsbLol(json) {
  const list = Array.isArray(json && json.ac) ? json.ac : [];
  return list
    .filter((a) => num(a.lat) !== null && num(a.lon) !== null)
    .map((a) => ({
      id: a.hex || a.flight || `${a.lat},${a.lon}`,
      callsign: (a.flight || "").trim() || (a.hex || "").toUpperCase(),
      lat: a.lat,
      lon: a.lon,
      alt: typeof a.alt_baro === "number" ? a.alt_baro : null, // "ground" => string
      speed: num(a.gs),
      track: num(a.track) !== null ? a.track : 0,
      vertRate: num(a.baro_rate) !== null ? a.baro_rate : num(a.geom_rate),
      squawk: a.squawk || null,
      category: classify(a.category, a.t),
      mil: isMil(a.dbFlags),
    }));
}

async function getAircraft(req, res) {
  const now = Date.now();
  if (cache.data && now - cache.t < CACHE_MS) {
    return res.json(cache.data);
  }

  // 1) Local dump1090 from the FR24 feeder (preferred once the SDR is live)
  for (const url of DUMP1090_URLS) {
    try {
      const r = await fetchWithTimeout(url, 1500);
      if (r.ok) {
        const j = await r.json();
        const data = { source: "dump1090 (local)", aircraft: normalizeDump1090(j) };
        cache = { t: now, data };
        lastGood = { data, goodAt: now };
        return res.json(data);
      }
    } catch (e) {
      /* try next url */
    }
  }

  const { lat, lon } = readHome();

  // 2) adsb.lol public API (primary cloud source)
  try {
    const r = await fetchWithTimeout(
      `https://api.adsb.lol/v2/lat/${lat}/lon/${lon}/dist/80`,
      4000
    );
    if (r.ok) {
      const j = await r.json();
      if (Array.isArray(j && j.ac)) {
        const data = { source: "adsb.lol (public)", aircraft: normalizeAdsbLol(j) };
        cache = { t: now, data };
        lastGood = { data, goodAt: now };
        return res.json(data);
      }
    }
  } catch (e) {
    /* fall through to backup */
  }

  // 3) airplanes.live — independent aggregator, same format as adsb.lol
  try {
    const r = await fetchWithTimeout(
      `https://api.airplanes.live/v2/point/${lat}/${lon}/80`,
      4000
    );
    if (r.ok) {
      const j = await r.json();
      if (Array.isArray(j && j.ac)) {
        const data = { source: "airplanes.live (backup)", aircraft: normalizeAdsbLol(j) };
        cache = { t: now, data };
        lastGood = { data, goodAt: now };
        return res.json(data);
      }
    }
  } catch (e) {
    /* fall through to stale */
  }

  // 4) Stale fallback — keep planes on screen rather than blanking during outages
  if (lastGood && now - lastGood.goodAt < STALE_MAX_MS) {
    const data = { ...lastGood.data, source: `${lastGood.data.source} ⚠ stale`, stale: true };
    cache = { t: now, data };
    return res.json(data);
  }

  const data = { source: "unavailable", aircraft: [] };
  cache = { t: now, data };
  return res.json(data);
}

// Look up a single flight by callsign (globally, not just nearby) so the
// dedicated tracker can follow any flight the user types in.
async function getTrack(req, res) {
  const callsign = String(req.query.callsign || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
  if (!callsign) return res.json({ found: false, aircraft: null });

  const norm = (cs) => (cs || "").toUpperCase().replace(/\s+/g, "");

  try {
    const r = await fetchWithTimeout(
      `https://api.adsb.lol/v2/callsign/${callsign}`,
      4000
    );
    if (r.ok) {
      const j = await r.json();
      const list = normalizeAdsbLol(j);
      const match =
        list.find((a) => norm(a.callsign) === callsign) || list[0] || null;
      if (match) return res.json({ found: true, aircraft: match });
    }
  } catch (e) {
    /* fall through to the nearby cache */
  }

  // Fallback: the flight may already be in the most-recent nearby feed.
  if (cache.data && Array.isArray(cache.data.aircraft)) {
    const match = cache.data.aircraft.find((a) => norm(a.callsign) === callsign);
    if (match) return res.json({ found: true, aircraft: match });
  }

  return res.json({ found: false, aircraft: null });
}

// --- Aircraft details (photo + type + route) via the free adsbdb.com API -----

const infoCache = new Map(); // key "hex|callsign" -> { t, data }
const INFO_TTL = 60 * 60 * 1000; // details are static-ish; cache 1h

async function getAircraftInfo(req, res) {
  const hex = String(req.query.hex || "").trim().toLowerCase();
  const callsign = String(req.query.callsign || "").trim().toUpperCase();
  const cacheKey = `${hex}|${callsign}`;

  const cached = infoCache.get(cacheKey);
  if (cached && Date.now() - cached.t < INFO_TTL) {
    return res.json(cached.data);
  }

  const out = { hex, callsign, aircraft: null, route: null, photo: null };

  // Aircraft type/registration/photo by ICAO hex
  if (hex) {
    try {
      const r = await fetchWithTimeout(`https://api.adsbdb.com/v0/aircraft/${hex}`, 4000);
      if (r.ok) {
        const j = await r.json();
        const a = j && j.response && j.response.aircraft;
        if (a) {
          out.aircraft = {
            type: a.type || null,
            icaoType: a.icao_type || null,
            manufacturer: a.manufacturer || null,
            registration: a.registration || null,
            owner: a.registered_owner || null,
          };
          out.photo = a.url_photo_thumbnail || a.url_photo || null;
        }
      }
    } catch (e) {
      /* ignore */
    }

    // Fallback for GA/private aircraft adsbdb has no photo for: ask the
    // PlaneSpotters public API directly (free, no key, attribution shown).
    if (!out.photo) {
      try {
        const r = await fetchWithTimeout(
          `https://api.planespotters.net/pub/photos/hex/${hex}`,
          4000
        );
        if (r.ok) {
          const j = await r.json();
          const p = j && Array.isArray(j.photos) ? j.photos[0] : null;
          if (p) {
            out.photo =
              (p.thumbnail_large && p.thumbnail_large.src) ||
              (p.thumbnail && p.thumbnail.src) ||
              null;
          }
        }
      } catch (e) {
        /* ignore */
      }
    }

    // Last resort: some aircraft (esp. GA/military) are indexed by tail number
    // on PlaneSpotters but not by hex — try the registration if we have one.
    if (!out.photo && out.aircraft && out.aircraft.registration) {
      try {
        const reg = encodeURIComponent(out.aircraft.registration);
        const r = await fetchWithTimeout(
          `https://api.planespotters.net/pub/photos/reg/${reg}`,
          4000
        );
        if (r.ok) {
          const j = await r.json();
          const p = j && Array.isArray(j.photos) ? j.photos[0] : null;
          if (p) {
            out.photo =
              (p.thumbnail_large && p.thumbnail_large.src) ||
              (p.thumbnail && p.thumbnail.src) ||
              null;
          }
        }
      } catch (e) {
        /* ignore */
      }
    }
  }

  // Flight route (origin/destination/airline) by callsign
  if (callsign) {
    try {
      const r = await fetchWithTimeout(`https://api.adsbdb.com/v0/callsign/${callsign}`, 4000);
      if (r.ok) {
        const j = await r.json();
        const fr = j && j.response && j.response.flightroute;
        if (fr) {
          const ep = (p) =>
            p
              ? {
                  code: p.iata_code || p.icao_code || null,
                  name: p.municipality || p.name || null,
                  lat: num(p.latitude),
                  lon: num(p.longitude),
                }
              : null;
          out.route = {
            origin: ep(fr.origin),
            destination: ep(fr.destination),
            airline: fr.airline ? fr.airline.name : null,
          };
        }
      }
    } catch (e) {
      /* ignore */
    }
  }

  infoCache.set(cacheKey, { t: Date.now(), data: out });
  return res.json(out);
}

function health() {
  const d = cache.data;
  const count = d && Array.isArray(d.aircraft) ? d.aircraft.length : 0;
  return {
    ok: count > 0,
    detail: d ? `${d.source} · ${count} aircraft` : "no data yet",
  };
}

module.exports = { getAircraft, getAircraftInfo, getTrack, health };
