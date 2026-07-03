import React, { useEffect, useContext } from "react";
import axios from "axios";
import styles from "./styles.css";
import { AppContext } from "~/AppContext";

import WeatherMap from "~/components/WeatherMap";
import InfoPanel from "~/components/InfoPanel";
import Settings from "~/components/Settings";
import OverheadBanner from "~/components/OverheadBanner";
import AlertBanner from "~/components/AlertBanner";
import VirtualKeyboard from "~/components/VirtualKeyboard";
import InactivityDim from "~/components/InactivityDim";

import "!style-loader!css-loader!./overrides.css";

/**
 * Main component
 *
 * @returns {JSX.Element} Main component
 */
const App = () => {
  const {
    getBrowserGeo,
    getCustomLatLon,
    loadStoredData,
    darkMode,
    mouseHide,
  } = useContext(AppContext);

  useEffect(() => {
    getCustomLatLon();
    getBrowserGeo();
    loadStoredData();
  }, []);

  // Auto-reload after updates: the auto-updater restarts the server, but the
  // kiosk page keeps running the old bundle until reloaded. Baseline the
  // server commit at mount, then reload whenever it changes.
  useEffect(() => {
    let baseline = null;
    const check = () => {
      axios
        .get("/api/version")
        .then((res) => {
          const commit = res.data && res.data.commit;
          if (!commit) return;
          if (baseline === null) {
            baseline = commit;
          } else if (commit !== baseline) {
            window.location.reload();
          }
        })
        .catch(() => { /* server restarting mid-update — try next tick */ });
    };
    check();
    const iv = setInterval(check, 5 * 60 * 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div
      className={`${darkMode ? styles.dark : styles.light} ${
        mouseHide ? styles.hideMouse : ""
      }`}
    >
      <div className={styles.container}>
        <AlertBanner />
        <OverheadBanner />
        <div className={styles.settingsContainer}>
          <Settings />
        </div>
        <div
          className={`${styles.weatherMap} map-container ${
            mouseHide ? "map-mouse-hide" : ""
          } ${darkMode ? "map-dark-mode" : ""}`}
        >
          <WeatherMap zoom={11} dark={darkMode} />
        </div>
        <div className={styles.infoContainer}>
          <InfoPanel />
        </div>
      </div>
      <VirtualKeyboard />
      <InactivityDim />
    </div>
  );
};

export default App;
