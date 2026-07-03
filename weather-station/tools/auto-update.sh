#!/bin/bash
# Auto-update: pull latest from GitHub and restart the kiosk app if changed.
# Run by pi-weather-update.timer every 15 minutes. Safe to run manually.

set -u
REPO_DIR="/home/flightrack/Dad-Flight-Tracker"
SERVICE="pi-weather-station"
LOG_TAG="pi-weather-update"

log() { logger -t "$LOG_TAG" "$1"; echo "$1"; }

cd "$REPO_DIR" || { log "ERROR: repo dir not found"; exit 1; }

# Fetch quietly; bail if network/GitHub is unreachable (kiosk keeps running).
if ! git fetch origin main --quiet 2>/dev/null; then
  log "fetch failed (offline?) — skipping"
  exit 0
fi

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
  exit 0  # already up to date — silent
fi

log "update found: $LOCAL -> $REMOTE"

# Never let a pull clobber local settings.json (it's gitignored, but belt+suspenders).
cp weather-station/settings.json /tmp/settings-keep.json 2>/dev/null

if ! git reset --hard origin/main --quiet; then
  log "ERROR: git reset failed"
  exit 1
fi

cp /tmp/settings-keep.json weather-station/settings.json 2>/dev/null

# Reinstall server deps only if package.json changed in this update.
if git diff --name-only "$LOCAL" "$REMOTE" | grep -q "weather-station/package.json"; then
  log "package.json changed — running npm install"
  cd weather-station && npm install --omit=dev --silent && cd ..
fi

sudo /usr/bin/systemctl restart "$SERVICE"
log "updated to $REMOTE and restarted $SERVICE"
