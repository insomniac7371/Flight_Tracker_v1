// Reverse-geocode a lat/lon to a "City, ST" label using the free, key-free
// BigDataCloud API. Cached aggressively since the home location rarely moves.

const cache = new Map(); // "lat,lon" -> { t, data }
const TTL = 24 * 60 * 60 * 1000; // 1 day

async function fetchJson(url, ms) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: "application/json", "User-Agent": "DadFlightTracker/1.0" },
    });
    return r.ok ? await r.json() : null;
  } finally {
    clearTimeout(t);
  }
}

async function getPlace(req, res) {
  const lat = parseFloat(req.query.lat);
  const lon = parseFloat(req.query.lon);
  if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return res.status(400).json({ error: "Invalid coordinates" });
  }

  const key = `${lat.toFixed(3)},${lon.toFixed(3)}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.t < TTL) return res.json(cached.data);

  try {
    const j = await fetchJson(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
      5000
    );
    if (j) {
      const city = j.city || j.locality || null;
      let state = j.principalSubdivision || null;
      if (j.principalSubdivisionCode) {
        state = j.principalSubdivisionCode.replace(/^[A-Z]{2}-/, "");
      }
      const name = city
        ? state
          ? `${city}, ${state}`
          : city
        : j.principalSubdivision || j.countryName || null;
      const data = { name };
      cache.set(key, { t: Date.now(), data });
      return res.json(data);
    }
  } catch (e) {
    /* fall through */
  }
  return res.json({ name: null });
}

module.exports = { getPlace };
