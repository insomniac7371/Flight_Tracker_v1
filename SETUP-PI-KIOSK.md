# Dad Kiosk — Single-Pi Setup (Flight feeder + Weather)

One Raspberry Pi that **receives local aircraft** (FR24/dump1090 from an SDR) **and**
**displays** both a flight map and the weather station on the 7" 800×480 touchscreen.

```
┌──────────────────────────── Raspberry Pi (Desktop OS) ────────────────────────────┐
│  RTL-SDR dongle ─▶ fr24feed + dump1090        →  http://localhost:8080/  (planes)  │
│  Node weather-station                          →  http://localhost:8081/ (weather) │
│  Chromium --kiosk  http://localhost:8081/kiosk/  (Flight ⇄ Weather switcher)       │
└────────────────────────────────────────────────────────────────────────────────────┘
```

## 0. Hardware to buy
- **RTL-SDR dongle** — get the **RTL-SDR Blog V4** kit (it includes a dipole antenna). A 1090 MHz
  ADS-B band filter helps but is optional to start.
- You already have: Raspberry Pi (use a **Pi 4 or 5**, the feeder + browser + two maps want the RAM)
  and the official 7" touchscreen.

> NOTE: Do **not** flash the downloaded `fr24-raspberry-pi-latest.img.zip` for this single-Pi build —
> that image is headless Lite (no desktop for the kiosk). It's only for a *dedicated* feeder Pi.
> For all-in-one, use Raspberry Pi OS **with Desktop** and install the feeder on top (below).

## 1. Flash the OS
- Use **Raspberry Pi Imager** → **Raspberry Pi OS (64-bit, with Desktop)** → your SD card.
- In Imager's settings (gear): set hostname, enable SSH, set Wi-Fi + locale.

## 2. Install the FR24 feeder (gives you dump1090 on :8080)
SSH in (or open a terminal on the Pi) and run:
```bash
sudo bash -c "$(wget -O - https://repo.feed.flightradar24.com/install_fr24_rpi.sh)"
```
- Step through the wizard. If you don't have a sharing key yet, choose to create one (needs an
  email; FR24 emails the key). Answer **yes** to the dump1090/receiver questions; accept defaults.
- Plug in the SDR + antenna **before** finishing so it detects the device.
- Verify:
  - Feeder status: `http://<pi-ip>:8754/`
  - **Local plane map: `http://localhost:8080/`**  ← this is what the kiosk Flight pane shows.
    (If you later switch to `dump1090-fa`, its map is at `http://localhost:8080/skyaware/` — update
    `FLIGHT_URL` in `kiosk/index.html`.)

## 3. Copy this project to the Pi
Put the `Dad Flight Tracker` folder on the Pi (e.g. `/home/pi/Dad-Flight-Tracker`). The pieces used:
- `weather-station/`  — the Node weather app (serves weather **and** the kiosk shell)
- `kiosk/index.html`  — the Flight ⇄ Weather switcher

## 4. Run the weather station (port 8081)
```bash
sudo apt install -y nodejs npm
cd /home/pi/Dad-Flight-Tracker/weather-station
npm install --omit=dev          # server deps only; client is already built in client/dist
# add your Tomorrow.io key:
nano settings.json              # set "weatherApiKey": "YOUR_TOMORROW_IO_KEY"
node ./server/index.js          # serves :8081  (test it, then Ctrl-C)
```
Make it start on boot with systemd — create `/etc/systemd/system/weather-station.service`:
```ini
[Unit]
Description=Dad Weather Station
After=network-online.target
Wants=network-online.target

[Service]
WorkingDirectory=/home/pi/Dad-Flight-Tracker/weather-station
ExecStart=/usr/bin/node ./server/index.js
Restart=always
User=pi
Environment=PORT=8081

[Install]
WantedBy=multi-user.target
```
```bash
sudo systemctl enable --now weather-station
```

## 5. Chromium kiosk autostart
Point Chromium at the kiosk shell (it embeds both maps). Create
`/home/pi/.config/autostart/kiosk.desktop`:
```ini
[Desktop Entry]
Type=Application
Name=Dad Kiosk
Exec=chromium-browser --kiosk --noerrdialogs --disable-infobars --incognito --check-for-update-interval=31536000 http://localhost:8081/kiosk/
X-GNOME-Autostart-enabled=true
```
- Hide the cursor: `sudo apt install -y unclutter` (autostart `unclutter -idle 0`).
- Screen blanking off: `sudo raspi-config` → Display → Screen Blanking → Off.

## 6. Verify the whole stack
- Boot the Pi. Chromium should open full-screen on the **Weather** pane.
- Tap **FLIGHT** → the dump1090 map of real local planes should be there (the "waiting for feeder"
  placeholder disappears automatically once :8080 responds).
- Tap **WEATHER** → CARTO + RainViewer radar + Tomorrow.io conditions.

## Auto-updates from GitHub

The Pi can check GitHub every 15 minutes and self-update when you push a patch.
Requires the project to be a git clone (not an scp copy) — see readme for the GitHub setup.

```bash
cd /home/flightrack/Dad-Flight-Tracker/weather-station/tools
chmod +x auto-update.sh
sudo cp pi-weather-update.service pi-weather-update.timer /etc/systemd/system/

# Allow the updater to restart the app without a password prompt:
echo "flightrack ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart pi-weather-station" | sudo tee /etc/sudoers.d/pi-weather-update

sudo systemctl daemon-reload
sudo systemctl enable --now pi-weather-update.timer
```

Check it's scheduled: `systemctl list-timers | grep weather`
See update history: `journalctl -t pi-weather-update`

**Publishing a patch from the PC:** edit code → rebuild the client if you touched it
(`cd client && npm run prod`) → `git add -A && git commit -m "fix ..." && git push`.
The Pi picks it up within 15 min and restarts the app automatically. `settings.json`
is gitignored and preserved across updates.

## Ports / troubleshooting
| Service | Port | Check |
|---------|------|-------|
| dump1090 map | 8080 | `curl -I http://localhost:8080/` |
| weather-station | 8081 | `curl -I http://localhost:8081/` |
| fr24feed status | 8754 | `http://localhost:8754/` |
| kiosk shell | 8081 | `http://localhost:8081/kiosk/` |

- **Flight pane stuck on "Waiting for feeder":** dump1090 isn't on :8080. Check `sudo systemctl status fr24feed`,
  confirm the SDR is seen (`lsusb`), and that `http://localhost:8080/` loads in a browser on the Pi.
- **Port clash:** the weather app reads `PORT` (defaults to 8081). dump1090 owns 8080. If you must change
  the flight map port, edit `FLIGHT_URL` at the top of `kiosk/index.html`.
- **Weather pane blank / "Could not retrieve weather data":** Tomorrow.io key missing/invalid in
  `settings.json` (or tap the gear in the weather pane to enter it).
