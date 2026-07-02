# Dad Flight Tracker — Claude Code Pickup Prompt

Paste the block below as your first message in a new Claude Code session.

---

## PICKUP PROMPT

I'm building a Raspberry Pi 5 kiosk called **Dad Flight Tracker** — an 800×480 touchscreen that runs a local Python HTTP server. The project is at `C:\Users\Veteran\Documents\Dad Flight Tracker`. The server runs with:

```
cd "C:\Users\Veteran\Documents\Dad Flight Tracker"
taskkill /f /im python.exe
python -B prototype/server.py
```

The UI is at `http://127.0.0.1:8765` and has two modes:
- **Flight mode** — ATC-green radar, live ADS-B aircraft via adsb.lol
- **Weather mode** — Apple iPad-inspired dark navy UI with NWS radar + Open-Meteo conditions

### Current file state (all working as of 2026-06-18)

| File | Size | Lines |
|------|------|-------|
| `prototype/index.html` | 21 506 B | 438 |
| `prototype/styles.css` | 60 197 B | 2 895 |
| `prototype/app.js` | 119 284 B | 3 478 |
| `prototype/server.py` | 48 573 B | 1 219 |

### Home coordinates

- Label: **Mitchell House**
- Lat/Lon: **32.9190, -80.1623** (Summerville SC)
- Both `HOME` in `app.js` (line 1) and `DEFAULT_SETTINGS` in `server.py` (line 41) are set correctly

### Server architecture

- `prototype/server.py` — Python 3.14, `ThreadingHTTPServer` on port 8765
- Class `Handler(SimpleHTTPRequestHandler)` at line 800; `do_GET` at line 814
- Key API routes in `do_GET`:
  - `/api/settings` (818), `/api/aircraft` (822), `/api/airports` (863)
  - `/api/weather` (1062) — concurrent Open-Meteo + NWS alerts via `threading.Thread`
  - `/api/radar-tile` (1121) — proxies NWS WMS tile from `opengeo.ncep.noaa.gov`

**IMPORTANT — stale process bug on Windows:** `ThreadingHTTPServer` uses `SO_REUSEADDR`, which on Windows allows multiple processes to bind the same port. Always `taskkill /f /im python.exe` before restarting or old routes serve stale code.

### Flight mode (ATC green)

- Radar: custom SVG with sweep animation, aircraft dots, map outlines
- Aircraft feed: `https://api.adsb.lol/api/0/aircraft` (within 35 mi radius)
- Track map: world SVG + road overlay when aircraft selected
- Detail panel: photo, stats (alt/speed/heading/squawk), route progress arc
- Settings panel: location, radar range, sweep speed, Wi-Fi, OTA

### Weather mode (Apple-inspired)

- **CSS palette**: deep navy `#141824` background, blue accents `#4a9eff` / `#5ac8fa`, glassmorphism cards `rgba(255,255,255,0.05)`
- **Layout** (`wx-` prefix classes throughout):
  - Top bar: `← FLIGHT` pill button, location name, circular icon buttons (refresh/gear)
  - Left: `wx-radar-frame` (rounded dark panel) with NWS radar tile overlay, layer chips (Radar/Precip/Wind — decorative), compass rose, dBZ legend
  - Right: `wx-conditions` sidebar — large thin-weight temp (`font-weight:200`), condition icon (emoji, updates per WMO code), feels-like, description, 2×2 stat cards (Wind/Humidity/Pressure/Precip with SVG icons)
- **State boundary SVG**: blue (`rgba(74,158,255,0.42)`) not green
- **Back button**: `#weatherBackBtn` → `switchMode("flight")`
- **Data**: `loadWeatherConditions()` fetches `/api/weather`, `loadWeatherRadar()` fetches `/api/radar-tile`; both called via `refreshWeather()` on mode switch and every 90 s
- **Condition icon**: `#wcConditionIcon`, populated via `WMO_ICONS` map in `app.js`

### Key JS architecture notes

- `switchMode(mode)` guards with `if (mode === currentMode) return;`
- `refreshWeather()` is called **before** `requestAnimationFrame(() => renderWeatherMap())` — this ordering is intentional so a map-render error can't block the data fetch
- `injectWeatherMapStyles()` injects a `<style id="weatherMapStyles">` once on first weather open
- `initWeatherMode()` wires all weather/mode button listeners (called once at DOMContentLoaded)
- **Edit tool truncation hazard**: the Edit tool has truncated `app.js` and `server.py` multiple times in previous sessions. Always use Python binary read/write for large block replacements. Never use the Edit tool on blocks > ~50 lines.

### CSS cascade fix (do not revert)

`.weather-panel.hidden { display: none }` must appear **after** `.weather-panel { display: grid }` in `styles.css`. If order is swapped, the panel is always visible. This rule is at line ~2457.

### Deferred / not started

- Pi kiosk setup (Chromium kiosk mode, systemd service)
- Powered UPS hat integration (battery status wiring)
- OTA updater (GitHub pull on boot)
- Lightning strike layer (NWS ATST API)
- Precip / Wind layer chips (currently decorative — need separate radar products)
- Forecast strip (hourly or daily from Open-Meteo)
- Settings panel: weather-specific settings (radar zoom, layer toggles)

### What to work on next (pick one)

1. **Forecast strip** — add an hourly or 7-day strip below the conditions sidebar using Open-Meteo `/forecast` data already fetched by `/api/weather`
2. **Layer chips** — wire Radar/Precip/Wind chips to swap the NWS WMS `layers=` param (`radar_reflectivity` / `qpe_001h` / `wind_speed`)
3. **Pi kiosk** — write the systemd service + Chromium kiosk launch script
4. **Radar zoom** — add a zoom/pan control to `wx-radar-frame` so the user can scroll in/out on the NWS tile
