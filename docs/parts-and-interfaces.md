# Parts And Interfaces

## Parts Already Identified

- Raspberry Pi 5
- 7-inch 800x480 capacitive touchscreen
- Geekworm X1200 5V UPS HAT for Raspberry Pi 5
- Panel mount USB-C extension cable
- 12mm red momentary push buttons

## Likely Additions

- High-quality 5V USB-C power supply sized for Pi 5 plus display
- Short internal USB-C or power leads depending on the UPS HAT layout
- Heat sinks or active cooling compatible with the case
- M2.5 standoffs and screws
- Right-angle cables where the case clearance is tight
- Optional RTL-SDR and antenna if local ADS-B reception is desired

## Power Behavior

Target behavior:

1. Main USB-C power is present: device runs normally.
2. Main USB-C power is removed: UPS keeps Pi alive and UI shows backup power.
3. Power remains disconnected for 5 minutes: service initiates graceful shutdown.
4. Main power returns before timeout: shutdown timer cancels.

Implementation notes:

- Prefer reading UPS power state through the HAT's supported interface instead of guessing from battery voltage.
- Keep the shutdown command in a tiny service with logs and a dry-run test mode.
- Add a physical button action for safe shutdown or restart if the case design supports it.

## Case Notes

- Leave airflow around the Pi 5 and UPS HAT.
- Provide a visible or touch-accessible status area; do not bury all power state in menus.
- Keep the USB-C panel mount mechanically supported so cable pulls do not stress the board.
- Design screw bosses around real measured parts, not listing dimensions alone.
- Consider a removable back panel for SD card access and maintenance.

