# Product Plan

## Experience Goal

The device should feel like a small dedicated radar terminal that lives in the house. It should boot directly into a useful view, require almost no maintenance, and turn overhead flights into something fun to notice.

## Primary Screen

The radar screen shows aircraft within a configured range of the home location. It should be readable from a few feet away but still work by touch at arm's length.

Core behaviors:

- Center point is the saved home location
- Range rings show approximate distance
- Sweep line gives the screen a radar feel without implying the data is only visible during the sweep
- Targets are colored by aircraft category
- Target glyph points in current heading when heading is known
- A selected target opens a details drawer with image and flight metadata
- A flight search can switch to a map track view centered on a specific aircraft
- Status strip shows data path, update state, GPS/home location status, Wi-Fi, power, and last refresh
- Radar range can be adjusted from the main screen with a touchscreen slider and miles scale
- Text and numeric fields use an on-screen keyboard for touchscreen-only operation

## Aircraft Categories

Initial category rules should be simple and editable as we learn from real data:

- Military: ICAO owner/operator, callsign prefixes, known registration ranges, aircraft type lists
- Airliner: scheduled airline callsigns, commercial operators, route metadata
- Private / GA: small aircraft types, owner/operator signals, no scheduled route
- Helicopter: type code and ADS-B category
- Drone / other: remote ID feed if supported later, otherwise explicit known sources
- Unknown: anything that cannot be confidently classified

## Settings

Settings should be split into short panels, not a long form.

- Network: Wi-Fi SSID, connection state, captive portal fallback
- Location: address, coordinates, geocode status, home marker label
- Radar: range, units, filters, brightness, night mode
- Data: ADS-B source, API key status if needed, last successful fetch, provider latency
- Power: UPS present, battery state, main power status, shutdown delay
- Updates: GitHub connection, current version, update channel, check now

## Build Phases

### Phase 1 - Prototype

- Static UI prototype
- Fake aircraft feed
- Touch target drawer
- Settings mock
- Decide case orientation and button placement

### Phase 2 - Pi Kiosk

- Raspberry Pi boots into Chromium kiosk mode
- Local web app served on `localhost`
- Basic settings persisted locally
- Screen brightness and power button behavior tested

### Phase 3 - Live Flight Data

- Choose flight-data source
- Implement polling and normalization service
- Add category classifier
- Cache aircraft and recent sightings
- Add provider health checks

### Phase 4 - Power Safety

- Integrate UPS HAT status
- Detect main USB-C power loss
- Start 5 minute shutdown timer
- Cancel timer if power returns
- Show clear power state in the UI

### Phase 5 - Gift Polish

- 3D printed case finalized
- Boot splash and device name
- One-tap software update flow
- GitHub profile connected to `https://github.com/insomniac7371`
- Photo enrichment for selected aircraft
- Backup and restore settings

## Open Decisions

- Whether the flight source will be a local ADS-B receiver, a web API, or both
- Whether the Pi should have a dedicated physical shutdown button in addition to touchscreen controls
- Whether OTA updates should auto-apply or require confirmation
- How much aircraft photo coverage is needed for the gift to feel complete
