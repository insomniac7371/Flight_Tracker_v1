# Live Data Sources

## Recommended Runtime Path

Use a small backend service on the Pi instead of calling every external source directly from the touchscreen browser.

Browser UI:

- Requests `/api/geocode` when the saved address changes
- Requests `/api/aircraft/nearby`
- Requests `/api/aircraft/:icao/photo`
- Shows cached/fallback data when internet is unavailable

Pi backend:

- Geocodes the saved address once and stores lat/lon
- Polls the chosen aircraft feed by radius or bounding box
- Normalizes units to feet, knots, nautical miles, and degrees
- Classifies aircraft into display categories
- Fetches and caches aircraft photos by ICAO hex
- Keeps last-known aircraft visible briefly if a poll fails

## Aircraft Feeds

### ADSB.lol

Best prototype/default option because it supports a simple radius-style query around a location:

`https://api.adsb.lol/v2/lat/{lat}/lon/{lon}/dist/{nautical_miles}`

Useful fields commonly returned by readsb-style feeds:

- `hex`: ICAO24 aircraft id
- `flight`: callsign
- `lat`, `lon`: position
- `alt_baro`, `alt_geom`: altitude
- `gs`: ground speed
- `track`: heading / track
- `squawk`: transponder code
- `category`: ADS-B emitter category

### OpenSky Network

Good fallback or alternate provider. It supports `/states/all` with a WGS84 bounding box. It has documented state-vector fields for ICAO24, callsign, latitude, longitude, altitude, velocity, true track, squawk, position source, and aircraft category.

OpenSky now uses OAuth2 for authenticated API calls, while anonymous calls have rate and history limitations.

### Implemented behavior (prototype server)

`/api/aircraft` tries adsb.lol first, then automatically falls back to OpenSky's
`/states/all` if adsb.lol is unreachable. OpenSky state vectors are normalized to
the adsb.lol `ac[]` shape (including emitter category mapped to the `A1`..`C3`
string form) so the browser UI and classifier need no changes. The response
carries a `source` field (`"ADSB.lol live"` or `"OpenSky Network"`) which the
status pill displays.

To keep within the upstream feeds' rate limits, responses are cached
server-side, a failed primary feed is skipped for a short cooldown, and the last
good response is served if both feeds momentarily fail. adsb.lol responses cache
for ~6s; OpenSky responses cache for ~25s because OpenSky meters access by
credits.

### OpenSky OAuth2

The server authenticates to OpenSky with the OAuth2 client-credentials flow when
credentials are present, raising the daily quota from 400 (anonymous) to 4,000
(authenticated). Provide credentials either as a `data/opensky.json` file
(`{"clientId": "...", "clientSecret": "..."}` — this is exactly the
`credentials.json` OpenSky lets you download when you create an API client under
Account > API Clients) or via the `OPENSKY_CLIENT_ID` / `OPENSKY_CLIENT_SECRET`
environment variables. `data/` is gitignored so the secret stays on the device.
Tokens are cached and refreshed automatically (~30 min lifetime), and a 401/403
triggers a single forced refresh and retry. With valid credentials the feed
source is reported as `OpenSky Network (auth)`; without, it falls back to the
anonymous feed (`OpenSky Network`). See `prototype/opensky.example.json`.

## Photo Source

Use PlaneSpotters photo lookups by ICAO hex as the first enrichment source:

`https://api.planespotters.net/pub/photos/hex/{icao24}`

PlaneSpotters requires a `User-Agent` that identifies the app and includes a
contact URL or email (e.g. `DadFlightTracker/0.1 (+https://github.com/insomniac7371/dad-flight-tracker)`);
requests without one are rejected with HTTP 403.

If PlaneSpotters has no result, fall back to Wikimedia Commons image search by registration, aircraft type, or callsign. Cache returned image URLs and credits locally. Some aircraft, especially military aircraft, helicopters, and private aircraft, may not have a public image.

In the prototype, external aircraft images are served through `/api/image` so the kiosk browser receives them from the local Pi server. This avoids hotlinking issues and gives the Pi a place to add disk caching later. The proxy host allowlist includes `t.plnspttrs.net` (the PlaneSpotters thumbnail CDN), `cdn.jetphotos.com`, `upload.wikimedia.org`, and `cdn.planespotters.net`.

## Category Rules

Initial rules:

- Military: known military callsign prefixes, known ICAO blocks, special database flags
- Airliner: three-letter airline callsign followed by flight number
- Private / GA: N-number callsigns, light/small ADS-B categories
- Helicopter: rotorcraft ADS-B category or helicopter type code
- Drone / other: UAV ADS-B category or explicitly configured source
- Unknown: anything uncertain

The UI should show category as confidence, not as guaranteed truth.

## Radar Basemap (offline reference layer)

A faint geographic reference layer renders under the radar targets: world country
outlines/coastlines, US state outlines, and numbered roads (interstates, US
routes, and state routes such as SC 61). It is fully offline at runtime - bundled
into `prototype/assets/basemap.json` by `prototype/tools/build_basemap.py`.

Sources (all open):

- State outlines: folium example data (US Census cartographic boundaries)
- Country outlines: Natural Earth 110m admin_0 (public domain)
- Roads: OpenStreetMap via the Overpass API (ODbL). Natural Earth's road data
  only reaches US routes, not state routes, so OSM is required for routes like
  SC 61. The build queries numbered routes (`ref` starting with `I`/`US`/a
  two-letter state code) within ~104 mi of the saved home, then **merges**
  contiguous OSM way segments per route into long polylines (e.g. I-26 collapses
  from ~1800 segments to 2) to keep the file small and rendering fast.

Because state-route coverage is regional, roads are fetched around the saved home
at build time; re-run `build_basemap.py` if the home moves far. The renderer uses
level-of-detail (interstates always; US routes ≤60 mi; state routes ≤30 mi),
Cohen-Sutherland clipping to the view, and labels deduplicated/spaced by route.
Toggle: "Map outlines" in Settings → Radar.
