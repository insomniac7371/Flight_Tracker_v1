import React, { useContext, useState } from "react";
import axios from "axios";
import { AppContext } from "~/AppContext";
import { InlineIcon } from "@iconify/react";
import roundFlight from "@iconify/icons-ic/round-flight";
import closeSharp from "@iconify/icons-ion/close-sharp";
import styles from "./styles.css";

/**
 * Dedicated flight tracker. Type a flight number to follow that specific
 * aircraft: pans the map to it, draws its route line, and shows verbose info.
 *
 * @returns {JSX.Element} Flight tracker search/control
 */
const FlightSearch = () => {
  const {
    trackedCallsign,
    setTrackedCallsign,
    setSelectedAircraft,
    setPanToCoords,
  } = useContext(AppContext);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState(null); // searching | notfound | null

  const start = (raw) => {
    const callsign = (raw || "").trim().toUpperCase().replace(/\s+/g, "");
    if (!callsign) return;
    setStatus("searching");
    axios
      .get(`/api/track?callsign=${encodeURIComponent(callsign)}`)
      .then((res) => {
        const d = res && res.data;
        if (d && d.found && d.aircraft) {
          setTrackedCallsign(callsign);
          setSelectedAircraft(d.aircraft);
          setPanToCoords({
            latitude: d.aircraft.lat,
            longitude: d.aircraft.lon,
          });
          setStatus(null);
        } else {
          setStatus("notfound");
        }
      })
      .catch(() => setStatus("notfound"));
  };

  // Note: the follow/refresh poll lives in WeatherMap (always mounted) so it
  // keeps running after the Settings panel that hosts this search is closed.

  const stop = () => {
    setTrackedCallsign(null);
    setSelectedAircraft(null);
    setStatus(null);
    setInput("");
  };

  if (trackedCallsign) {
    return (
      <div className={styles.bar}>
        <span className={styles.trackingDot} />
        <span className={styles.trackingLabel}>TRACKING</span>
        <span className={styles.trackingCs}>{trackedCallsign}</span>
        <button className={styles.stop} onClick={stop} aria-label="Stop tracking">
          <InlineIcon icon={closeSharp} />
        </button>
      </div>
    );
  }

  return (
    <form
      className={styles.bar}
      onSubmit={(e) => {
        e.preventDefault();
        start(input);
      }}
    >
      <InlineIcon icon={roundFlight} className={styles.icon} />
      <input
        className={styles.input}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Track a flight #"
        autoComplete="off"
        spellCheck={false}
      />
      <button className={styles.go} type="submit">
        {status === "searching" ? "…" : "Track"}
      </button>
      {status === "notfound" ? (
        <span className={styles.err}>not airborne</span>
      ) : null}
    </form>
  );
};

export default FlightSearch;
