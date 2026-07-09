import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "~/AppContext";
import styles from "./styles.css";
import { convertTemp, convertSpeed } from "~/services/conversions";

import { InlineIcon } from "@iconify/react";
import degreesIcon from "@iconify/icons-wi/degrees";
import nightClear from "@iconify/icons-wi/night-clear";
import daySunny from "@iconify/icons-wi/day-sunny";
import dayCloudy from "@iconify/icons-wi/day-cloudy";
import nightAltCloudy from "@iconify/icons-wi/night-alt-cloudy";
import dayRain from "@iconify/icons-wi/day-rain";
import nightRain from "@iconify/icons-wi/night-rain";
import humidityAlt from "@iconify/icons-carbon/humidity-alt";
import barometerIcon from "@iconify/icons-wi/barometer";
import cloudIcon from "@iconify/icons-wi/cloud";
import strongWind from "@iconify/icons-wi/strong-wind";
import snowIcon from "@iconify/icons-ion/snow";
import rainIcon from "@iconify/icons-wi/rain";
import raindropIcon from "@iconify/icons-wi/raindrop";
import rainMix from "@iconify/icons-wi/rain-mix";
import thunderstormIcon from "@iconify/icons-wi/thunderstorm";
import fogIcon from "@iconify/icons-wi/fog";
import cloudyIcon from "@iconify/icons-wi/cloudy";
import daySunnyOvercast from "@iconify/icons-wi/day-sunny-overcast";

/** @returns {JSX.Element} Current weather conditions panel */
const CurrentWeather = () => {
  const { currentWeatherData, tempUnit, speedUnit, sunriseTime, sunsetTime } =
    useContext(AppContext);
  const [aqi, setAqi] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertIdx, setAlertIdx] = useState(0);

  useEffect(() => {
    let active = true;
    const load = () => {
      axios
        .get("/api/aqi")
        .then((res) => {
          if (active && res && res.data && res.data.aqi) setAqi(res.data);
        })
        .catch(() => { /* AQI optional */ });
    };
    load();
    const id = setInterval(load, 10 * 60 * 1000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    let active = true;
    const load = () => {
      axios
        .get("/api/alerts")
        .then((res) => {
          if (active && res && res.data) {
            setAlerts(Array.isArray(res.data.alerts) ? res.data.alerts : []);
          }
        })
        .catch(() => { /* keep last known alerts */ });
    };
    load();
    const id = setInterval(load, 5 * 60 * 1000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const weatherData =
    currentWeatherData?.data?.timelines?.[0]?.intervals[0]?.values;
  if (!weatherData) return <div />;

  const {
    cloudCover,
    humidity,
    precipitationType,
    precipitationProbability,
    temperature,
    temperatureApparent,
    weatherCode,
    windSpeed,
    windDirection,
    pressureSurfaceLevel,
    dewPoint,
  } = weatherData;

  const daylight =
    sunriseTime && sunsetTime
      ? isDaylight(new Date(sunriseTime), new Date(sunsetTime))
      : true;
  const { icon: weatherIcon, desc: weatherDesc } =
    parseWeatherCode(weatherCode, daylight) || {};

  // When an NWS alert is active it takes over the last stats tile (in place
  // of pressure) and glows in a caution color; tapping opens the details.
  const activeAlert = alerts.length
    ? alerts[Math.min(alertIdx, alerts.length - 1)]
    : null;

  return (
    <div className={styles.container}>
      <div className={styles.topRow}>
        <div className={styles.mainIcon}>
          {weatherIcon ? <InlineIcon icon={weatherIcon} /> : null}
        </div>
        <div className={styles.tempBlock}>
          <div className={styles.currentTemp}>
            {convertTemp(temperature, tempUnit)}
            <InlineIcon icon={degreesIcon} />
          </div>
          {temperatureApparent != null ? (
            <div className={styles.feelsLike}>
              Feels like {convertTemp(temperatureApparent, tempUnit)}&deg;
            </div>
          ) : null}
        </div>
      </div>
      <div className={styles.description}>
        <span>{weatherDesc || ""}</span>
        {aqi && aqi.label ? (
          <span className={`${styles.aqi} ${styles["aqi" + aqi.aqi]}`}>
            AQI {aqi.label}
          </span>
        ) : null}
      </div>
      <div className={styles.statsGrid}>
        <div className={styles.statCell}>
          <span className={styles.statIcon}>
            <InlineIcon icon={precipitationType === 2 ? snowIcon : rainIcon} />
          </span>
          <div className={styles.statValue}>{precipitationProbability}%</div>
          <div className={styles.statLabel}>Rain</div>
        </div>
        <div className={styles.statCell}>
          <span className={styles.statIcon}>
            <InlineIcon icon={cloudIcon} />
          </span>
          <div className={styles.statValue}>{parseInt(cloudCover)}%</div>
          <div className={styles.statLabel}>Cloud</div>
        </div>
        <div className={styles.statCell}>
          <span className={styles.statIcon}>
            <InlineIcon icon={strongWind} />
          </span>
          <div className={styles.statValue}>{convertSpeed(windSpeed, speedUnit)}</div>
          <div className={styles.statLabel}>
            {speedUnit === "mph" ? "mph" : "m/s"}
            {windDirection != null ? ` ${degToCompass(windDirection)}` : ""}
          </div>
        </div>
        <div className={styles.statCell}>
          <span className={styles.statIcon}>
            <InlineIcon icon={humidityAlt} />
          </span>
          <div className={styles.statValue}>{parseInt(humidity)}%</div>
          <div className={styles.statLabel}>Humidity</div>
        </div>
        {activeAlert ? (
          <div
            className={`${styles.statCell} ${styles.alertCell} ${
              sevClass(activeAlert.severity, styles)
            }`}
            onClick={() => setAlertOpen(true)}
            role="button"
          >
            <div className={styles.alertTitle}>
              {shortEvent(activeAlert.event)}
            </div>
            <span className={styles.alertSign}>⚠</span>
            {alerts.length > 1 ? (
              <div className={styles.alertMore}>+{alerts.length - 1}</div>
            ) : null}
          </div>
        ) : pressureSurfaceLevel != null ? (
          <div className={styles.statCell}>
            <span className={styles.statIcon}>
              <InlineIcon icon={barometerIcon} />
            </span>
            <div className={styles.statValue}>
              {Math.round(pressureSurfaceLevel)}
            </div>
            <div className={styles.statLabel}>hPa</div>
          </div>
        ) : null}
        {dewPoint != null ? (
          <div className={styles.statCell}>
            <span className={styles.statIcon}>
              <InlineIcon icon={raindropIcon} />
            </span>
            <div className={styles.statValue}>
              {convertTemp(dewPoint, tempUnit)}&deg;
            </div>
            <div className={styles.statLabel}>Dew Pt</div>
          </div>
        ) : null}
      </div>
      {alertOpen && activeAlert ? (
        <div className={styles.alertOverlay} onClick={() => setAlertOpen(false)}>
          <div
            className={styles.alertModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`${styles.alertModalHead} ${
                sevClass(activeAlert.severity, styles)
              }`}
            >
              <span>⚠ {activeAlert.event}</span>
              <button
                className={styles.alertClose}
                onClick={() => setAlertOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className={styles.alertModalBody}>
              {activeAlert.headline ? (
                <p className={styles.alertHeadline}>{activeAlert.headline}</p>
              ) : null}
              <div className={styles.alertMeta}>
                {activeAlert.severity ? (
                  <span>Severity: {activeAlert.severity}</span>
                ) : null}
                {activeAlert.area ? <span>{activeAlert.area}</span> : null}
              </div>
              {activeAlert.description ? (
                <p className={styles.alertDesc}>{activeAlert.description}</p>
              ) : null}
              {activeAlert.instruction ? (
                <p className={styles.alertInstruction}>
                  {activeAlert.instruction}
                </p>
              ) : null}
              {alerts.length > 1 ? (
                <div className={styles.alertPager}>
                  {alerts.map((al, i) => (
                    <button
                      key={al.id || i}
                      className={i === alertIdx ? styles.alertPagerOn : ""}
                      onClick={() => setAlertIdx(i)}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              ) : null}
              <p className={styles.alertSrc}>{activeAlert.sender || "NWS"}</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

/**
 * Map Tomorrow.io weather code to description and icon.
 * @param {number} code - Tomorrow.io weather code
 * @param {boolean} isDay - whether it is currently daylight
 * @returns {{ desc: string, icon: object } | undefined}
 */
const parseWeatherCode = (code, isDay) => {
  switch (code) {
    case 6201: return { desc: "Heavy freezing rain", icon: isDay ? dayRain : nightRain };
    case 6001: return { desc: "Freezing rain", icon: isDay ? dayRain : nightRain };
    case 6200: return { desc: "Light freezing rain", icon: isDay ? dayRain : nightRain };
    case 6000: return { desc: "Freezing drizzle", icon: rainMix };
    case 7101: return { desc: "Heavy ice pellets", icon: rainMix };
    case 7000: return { desc: "Ice pellets", icon: rainMix };
    case 7102: return { desc: "Light ice pellets", icon: rainMix };
    case 5101: return { desc: "Heavy snow", icon: snowIcon };
    case 5000: return { desc: "Snow", icon: snowIcon };
    case 5100: return { desc: "Light snow", icon: snowIcon };
    case 5001: return { desc: "Flurries", icon: snowIcon };
    case 8000: return { desc: "Thunderstorm", icon: thunderstormIcon };
    case 4201: return { desc: "Heavy rain", icon: isDay ? dayRain : nightRain };
    case 4001: return { desc: "Rain", icon: isDay ? dayRain : nightRain };
    case 4200: return { desc: "Light rain", icon: isDay ? dayRain : nightRain };
    case 4000: return { desc: "Drizzle", icon: rainMix };
    case 2100: return { desc: "Light fog", icon: fogIcon };
    case 2000: return { desc: "Fog", icon: fogIcon };
    case 1001: return { desc: "Cloudy", icon: cloudyIcon };
    case 1102: return { desc: "Mostly cloudy", icon: cloudyIcon };
    case 1101: return { desc: "Partly cloudy", icon: isDay ? daySunnyOvercast : nightAltCloudy };
    case 1100: return { desc: "Mostly clear", icon: isDay ? dayCloudy : nightAltCloudy };
    case 1000: return { desc: "Clear", icon: isDay ? daySunny : nightClear };
    case 3001: return { desc: "Wind", icon: strongWind };
    case 3000: return { desc: "Light wind", icon: strongWind };
    case 3002: return { desc: "Strong wind", icon: strongWind };
  }
};

/**
 * Map an NWS severity to a caution-color CSS class.
 * @param {string} sev - alert severity
 * @param {Object} styles - CSS module
 * @returns {string} class name
 */
function sevClass(sev, styles) {
  const s = (sev || "").toLowerCase();
  if (s === "extreme" || s === "severe") return styles.sevSevere;
  if (s === "moderate") return styles.sevModerate;
  return styles.sevMinor;
}

/**
 * Trim a verbose NWS event name for the small tile (wraps to 2 lines in CSS).
 * @param {string} event - full event name
 * @returns {string} tile label
 */
function shortEvent(event) {
  const e = event || "Alert";
  return e.length > 22 ? `${e.slice(0, 20)}…` : e;
}

function degToCompass(deg) {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(((deg % 360) + 360) % 360 / 22.5) % 16];
}

function isDaylight(sunrise, sunset) {
  const now = new Date().getTime();
  return !!(now > sunrise.getTime() && now < sunset.getTime());
}

export default CurrentWeather;
