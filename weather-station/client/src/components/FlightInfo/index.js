import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "~/AppContext";
import { InlineIcon } from "@iconify/react";
import closeSharp from "@iconify/icons-ion/close-sharp";
import locateSharp from "@iconify/icons-ion/locate-sharp";
import styles from "./styles.css";

/**
 * Flight detail card — shown under the weather info when a plane is tapped.
 * Pulls photo / type / route from the server proxy (adsbdb, no API key).
 *
 * @returns {JSX.Element|null} Flight info card
 */
const FlightInfo = () => {
  const {
    selectedAircraft,
    setSelectedAircraft,
    setSelectedFlightInfo,
    trackedCallsign,
    setTrackedCallsign,
  } = useContext(AppContext);
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    if (!selectedAircraft) {
      setInfo(null);
      setSelectedFlightInfo(null);
      return undefined;
    }
    let active = true;
    setLoading(true);
    setImgFailed(false);
    setInfo(null);
    setSelectedFlightInfo(null);
    const { id, callsign } = selectedAircraft;
    axios
      .get(
        `/api/aircraft-info?hex=${encodeURIComponent(id || "")}&callsign=${encodeURIComponent(
          callsign || ""
        )}`
      )
      .then((res) => {
        if (active) {
          const data = res && res.data ? res.data : null;
          setInfo(data);
          setSelectedFlightInfo(data);
        }
      })
      .catch(() => {
        if (active) setInfo(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selectedAircraft]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!selectedAircraft) return null;

  const ac = info && info.aircraft;
  const route = info && info.route;
  const photo = info && info.photo;
  const title =
    (selectedAircraft.callsign || "").trim() || (ac && ac.registration) || "Aircraft";

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.callsign}>{title}</span>
        {!trackedCallsign && selectedAircraft.callsign ? (
          <button
            type="button"
            className={styles.trackBtn}
            onClick={() => setTrackedCallsign(selectedAircraft.callsign)}
          >
            <InlineIcon icon={locateSharp} />
          </button>
        ) : null}
        <div
          className={styles.close}
          onClick={() => {
            setTrackedCallsign(null);
            setSelectedAircraft(null);
          }}
          role="button"
          aria-label="Close flight info"
        >
          <InlineIcon icon={closeSharp} />
        </div>
      </div>

      {photo && !imgFailed ? (
        <div className={styles.photoWrap}>
          <img
            className={styles.photo}
            src={photo}
            alt={title}
            onError={() => setImgFailed(true)}
          />
          <span className={styles.credit}>PlaneSpotters</span>
        </div>
      ) : null}

      {route && (route.origin || route.destination) ? (
        <div className={styles.route}>
          <span>{route.origin ? route.origin.code : "—"}</span>
          <span className={styles.arrow}>→</span>
          <span>{route.destination ? route.destination.code : "—"}</span>
        </div>
      ) : null}
      {route && route.origin && route.origin.name ? (
        <div className={styles.routeNames}>
          {route.origin.name}
          {route.destination && route.destination.name
            ? ` → ${route.destination.name}`
            : ""}
        </div>
      ) : null}

      <div className={styles.grid}>
        <div>
          <span>ALT</span>
          <strong>
            {selectedAircraft.alt != null ? `${selectedAircraft.alt} ft` : "—"}
          </strong>
        </div>
        <div>
          <span>SPD</span>
          <strong>
            {selectedAircraft.speed != null
              ? `${Math.round(selectedAircraft.speed)} kt`
              : "—"}
          </strong>
        </div>
        <div>
          <span>HDG</span>
          <strong>
            {selectedAircraft.track != null
              ? `${Math.round(selectedAircraft.track)}°`
              : "—"}
          </strong>
        </div>
        <div>
          <span>TYPE</span>
          <strong>{ac && (ac.type || ac.icaoType) ? ac.type || ac.icaoType : "—"}</strong>
        </div>
      </div>

      {trackedCallsign ? (
        <div className={styles.grid}>
          <div>
            <span>V/S</span>
            <strong>{vsLabel(selectedAircraft.vertRate)}</strong>
          </div>
          <div>
            <span>SQUAWK</span>
            <strong>{selectedAircraft.squawk || "—"}</strong>
          </div>
          <div style={{ gridColumn: "span 2" }}>
            <span>TO DESTINATION</span>
            <strong>{destLabel(selectedAircraft, route)}</strong>
          </div>
        </div>
      ) : null}

      {ac && (ac.registration || ac.owner) ? (
        <div className={styles.meta}>
          {ac.registration ? <span>{ac.registration}</span> : null}
          {ac.owner ? <span>{ac.owner}</span> : null}
        </div>
      ) : null}

      {loading ? <div className={styles.loading}>Looking up flight…</div> : null}
      {!loading && !ac && !route && !photo ? (
        <div className={styles.loading}>No extra details found for this flight.</div>
      ) : null}
    </div>
  );
};

/**
 * Vertical-speed label with a climb/descend/level glyph.
 *
 * @param {Number} fpm feet per minute
 * @returns {String} formatted vertical speed
 */
function vsLabel(fpm) {
  if (fpm == null) return "—";
  const r = Math.round(fpm / 50) * 50;
  if (r > 50) return `▲ ${r} fpm`;
  if (r < -50) return `▼ ${Math.abs(r)} fpm`;
  return "level";
}

/**
 * Great-circle distance from the aircraft to its destination.
 *
 * @param {Object} ac aircraft with lat/lon
 * @param {Object} route route with destination lat/lon
 * @returns {String} distance label
 */
function destLabel(ac, route) {
  const dest = route && route.destination;
  if (!ac || !dest || dest.lat == null || dest.lon == null) return "—";
  const R = 3440.065; // nautical miles
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(dest.lat - ac.lat);
  const dLon = toRad(dest.lon - ac.lon);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(ac.lat)) * Math.cos(toRad(dest.lat)) * Math.sin(dLon / 2) ** 2;
  const nm = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  const code = dest.code ? ` to ${dest.code}` : "";
  return `${nm} nm${code}`;
}

export default FlightInfo;
