import React, { useContext } from "react";
import { AppContext } from "~/AppContext";
import Clock from "~/components/Clock";
import WeatherInfo from "~/components/WeatherInfo";
import FlightInfo from "~/components/FlightInfo";
import VesselInfo from "~/components/VesselInfo";
import ControlButtons from "~/components/ControlButtons";
import styles from "./styles.css";

/**
 * Info Panel
 *
 * @returns {JSX.Element} Info Panel
 */
const InfoPanel = () => {
  const { darkMode, selectedAircraft, selectedVessel } = useContext(AppContext);

  // When a plane or ship is tapped, its card takes over the panel and the
  // weather cards hide until the user closes it (X). WeatherInfo stays
  // mounted (display:none) so its API refresh intervals keep running.
  const targetSelected = Boolean(selectedAircraft || selectedVessel);

  return (
    <div className={`${darkMode ? styles.dark : styles.light} ${styles.panel}`}>
      <div className={styles.container}>
        <div className={styles.clockContainer}>
          <Clock />
        </div>
        <div className={styles.weatherInfoContainer}>
          <div className={targetSelected ? styles.hidden : undefined}>
            <WeatherInfo />
          </div>
          <FlightInfo />
          <VesselInfo />
        </div>
        <div className={styles.controls}>
          <ControlButtons />
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;
