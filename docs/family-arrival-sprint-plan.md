# Family Arrival Coordinator Sprint Plan

## Product Position

Family Arrival Coordinator is a phone-first airport pickup planner for families. The first useful version should help one coordinator manage one traveler, one flight, one pickup person, and one shared status without creating accounts.

Avoid describing the product as a general family logistics app. That wording makes the scope too broad. The useful wedge is airport pickup coordination.

## Capability Triage

### Build Early

- Camera attachments: ticket, baggage tag, medication list, parking spot, ID note, or pickup landmark photo
- GPS "where am I" capture: save current pickup location or parking spot coordinates
- Maps handoff: open Apple Maps / Google Maps / browser maps for airport, parking, or pickup point
- Local notifications: reminder prototype using browser notification permission where supported

### Build After Workflow Proof

- Live flight status API
- Shareable trip page
- Family member status updates
- Push notifications from backend events
- Paid family plan

### Defer

- Full family accounts
- Real-time chat
- Live location tracking
- Native-only push infrastructure
- In-app payments

## Why The Order Matters

Camera and GPS are high-value and low-overhead in a PWA. Maps can be handled by deep links before we build a map stack. Notifications are useful, but reliable mobile notifications can become platform-specific quickly, especially on iOS, so reminders should start as calendar/SMS/share flows plus best-effort local notifications.

## MVP Data Model

- `travelerName`
- `flightNumber`
- `airline`
- `arrivalAirport`
- `arrivalTime`
- `pickupPerson`
- `pickupAddress`
- `pickupStatus`
- `notes`
- `checklist`
- `attachments`
- `savedLocations`
- `reminders`

## Six-Week Sprint

### Week 1 - Local Trip Planner

- Create phone-first PWA prototype
- Add one active trip
- Save trip locally
- Add traveler, flight, airport, pickup person, arrival time, and notes
- Add pickup checklist

### Week 2 - Status Board

- Add status buttons: planned, leaving, at airport, parked, arrivals, picked up, delayed
- Add current trip dashboard
- Add one-tap SMS/share message generation
- Add parking and baggage notes

### Week 3 - Camera, GPS, And Maps

- Add photo attachments using device camera/file picker
- Add current GPS capture for pickup or parking spot
- Add native map handoff for airport/pickup location
- Add privacy warning: local-only storage on this device

### Week 4 - Reminder Layer

- Add manual reminder list
- Add best-effort browser notifications
- Add calendar export path if native notifications are unreliable
- Add leave-time reminder fields

### Week 5 - Flight Data Spike

- Price and test flight data providers
- Add one provider behind a clean adapter
- Keep manual flight status override
- Document API cost and rate-limit risk

### Week 6 - Lightweight Sharing Prototype

- Add read-only trip summary page format
- Add export/share payload
- Prototype backend choice: Supabase or Firebase
- Do not build full family accounts unless the shared page proves useful

## MVP Success Criteria

- A trip can be created in under 90 seconds
- Pickup status is clear on one phone screen
- Photo, GPS, and map actions are reachable without digging through settings
- The workflow reduces coordination texts
- The app still works without an account
- Manual fallback exists for every external dependency

## Monetization Gate

Do not add payments until at least three real pickup scenarios have been tested. A paid version should sell unlimited trip boards, saved family profiles, shared pickup links, and smart reminders, not generic family task management.
