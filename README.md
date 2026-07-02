# Dad Flight Tracker

A Raspberry Pi 5 based aviation display for a 7-inch touchscreen. The intended gift experience is an ATC-style radar screen centered on a saved home location, showing nearby overhead traffic with aircraft categories, flight details, photos, device settings, and over-the-air updates.

## MVP

- Fullscreen 800x480 touchscreen UI for the Raspberry Pi display
- Radar view centered on a configured home address or lat/lon
- Live aircraft targets from ADS-B / flight-data providers
- Color-coded categories: military, airliner, private/general aviation, helicopter, drone/other, unknown
- Tap target to show callsign, aircraft type, altitude, speed, heading, route, distance, and image when available
- Settings for Wi-Fi, location, radar range, data source health, update channel, brightness, and shutdown behavior
- UPS HAT integration for graceful shutdown if USB-C main power is disconnected for more than 5 minutes

## Repository Layout

- `prototype/` - static touchscreen UI prototype
- `family-arrival/` - phone-first PWA prototype for family airport pickup coordination
- `prototype/tools/build_basemap.py` - regenerates the low-detail radar basemap (`prototype/assets/basemap.json`) from public-domain state/country/road data
- `docs/product-plan.md` - build phases, feature scope, risks, and decisions
- `docs/family-arrival-sprint-plan.md` - sprint plan for the family pickup planner product
- `docs/system-architecture.md` - proposed hardware and software architecture
- `docs/parts-and-interfaces.md` - current parts, likely additions, and wiring notes
- `docs/live-data-sources.md` - live aircraft and photo source plan

## Prototype

Open `prototype/index.html` in a browser. It is self-contained and designed for the 800x480 Raspberry Pi touchscreen resolution.

Open `family-arrival/index.html` in a mobile browser or desktop responsive view to try the local-first Family Arrival Coordinator PWA prototype. It stores trip data, checklist state, saved GPS location, and photo attachments in local browser storage.

For live-data mode, run:

```powershell
python prototype/server.py
```

Then open `http://127.0.0.1:8765`. The local server proxies aircraft and photo requests so the browser UI can avoid CORS issues and the future Pi build can add caching.

The aircraft feed uses adsb.lol when reachable and automatically falls back to OpenSky otherwise. For the higher OpenSky quota, create an API client at opensky-network.org (Account > API Clients) and save the downloaded `credentials.json` as `prototype/data/opensky.json` (gitignored). See [docs/live-data-sources.md](docs/live-data-sources.md) for details.

## Recommended Stack

- Raspberry Pi OS Lite or Bookworm desktop kiosk mode
- Python service for data ingestion, classification, geocoding, UPS monitoring, and OTA update orchestration
- Local SQLite cache for settings, aircraft sightings, and image metadata
- Browser-based UI served locally from the Pi
- GitHub releases or a private repo under `insomniac7371` for OTA updates

## GitHub

- Profile: https://github.com/insomniac7371
- Suggested repo name: `dad-flight-tracker`
- Suggested OTA remote: `https://github.com/insomniac7371/dad-flight-tracker`
