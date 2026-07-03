import React, { createContext, useState } from "react";
import { getSettings } from "~/settings";
import PropTypes from "prop-types";
import { getCoordsFromApi } from "~/services/geolocation";
import axios from "axios";

export const AppContext = createContext();

const TEMP_UNIT_STORAGE_KEY = "tempUnit";
const SPEED_UNIT_STORAGE_KEY = "speedUnit";
const LENGTH_UNIT_STORAGE_KEY = "lengthUnit";
const CLOCK_UNIT_STORAGE_KEY = "clockTime";
const MOUSE_HIDE_STORAGE_KEY = "mouseHide";

/**
 * App context provider
 *
 * @param {Object} props
 * @param {Node} props.children
 * @returns {JSX.Element} Context provider
 */
export function AppContextProvider({ children }) {
  const [weatherApiKey, setWeatherApiKey] = useState(null);
  // CARTO basemap needs no API key; seed a truthy sentinel so map-key gates pass.
  const [mapApiKey, setMapApiKey] = useState("carto");
  const [owmApiKey, setOwmApiKey] = useState(null); // OpenWeatherMap (map overlays)
  // One weather overlay at a time. activeWxLayer: null|wind|temp|clouds|pressure.
  // wxMode: "grid" (color tiles) or "points" (city values).
  const [activeWxLayer, setActiveWxLayer] = useState(null);
  const [wxMode, setWxMode] = useState("grid");
  const [reverseGeoApiKey, setReverseGeoApiKey] = useState(null);
  const [browserGeo, setBrowserGeo] = useState(null);
  const [mapGeo, setMapGeo] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [currentWeatherData, setCurrentWeatherData] = useState(null);
  const [currentWeatherDataErr, setCurrentWeatherDataErr] = useState(null);
  const [currentWeatherDataErrMsg, setCurrentWeatherDataErrMsg] = useState(
    null
  );
  const [hourlyWeatherData, setHourlyWeatherData] = useState(null);
  const [hourlyWeatherDataErr, setHourlyWeatherDataErr] = useState(null);
  const [hourlyWeatherDataErrMsg, setHourlyWeatherDataErrMsg] = useState(null);
  const [dailyWeatherData, setDailyWeatherData] = useState(null);
  const [dailyWeatherDataErr, setDailyWeatherDataErr] = useState(null);
  const [dailyWeatherDataErrMsg, setDailyWeatherDataErrMsg] = useState(null);
  const [panToCoords, setPanToCoords] = useState(null);
  const [markerIsVisible, setMarkerIsVisible] = useState(true);
  const [tempUnit, setTempUnit] = useState("f"); // fahrenheit or celsius
  const [speedUnit, setSpeedUnit] = useState("mph"); // mph or ms for m/s
  const [lengthUnit, setLengthUnit] = useState("in"); // in or mm
  const [clockTime, setClockTime] = useState("12"); // 12h or 24h time for clock
  const [animateWeatherMap, setAnimateWeatherMap] = useState(true);
  const [showAircraft, setShowAircraft] = useState(true); // flight overlay layer
  const [showAirports, setShowAirports] = useState(true); // airport/base layer
  const [showVessels, setShowVessels] = useState(true); // maritime/AIS layer
  const [showSatellite, setShowSatellite] = useState(false); // RainViewer IR clouds
  const [showLightning, setShowLightning] = useState(false); // Blitzortung strike dots
  const [aisApiKey, setAisApiKey] = useState(null); // aisstream.io key
  const [overheadAircraft, setOverheadAircraft] = useState(null); // within ~1km
  const [selectedVessel, setSelectedVessel] = useState(null); // tapped ship
  const [selectedAircraft, setSelectedAircraft] = useState(null); // tapped plane
  const [selectedFlightInfo, setSelectedFlightInfo] = useState(null); // adsbdb lookup
  const [trackedCallsign, setTrackedCallsign] = useState(null); // dedicated tracker mode
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [customLat, setCustomLat] = useState(null);
  const [customLon, setCustomLon] = useState(null);
  const [mouseHide, setMouseHide] = useState(false);
  const [sunriseTime, setSunriseTime] = useState(null);
  const [sunsetTime, setSunsetTime] = useState(null);
  // Aircraft count/source badge on the map — hidden by default, toggle in Settings
  const [showSourceBadge, setShowSourceBadge] = useState(
    () => window.localStorage.getItem("showSourceBadge") === "1"
  );

  /**
   * Save source badge visibility
   *
   * @param {Boolean} newVal
   */
  function saveShowSourceBadge(newVal) {
    setShowSourceBadge(!!newVal);
    window.localStorage.setItem("showSourceBadge", newVal ? "1" : "0");
  }

  // Screen dim timeout in minutes; 0 disables dimming entirely.
  const [dimTimeoutMin, setDimTimeoutMin] = useState(() => {
    const v = parseInt(window.localStorage.getItem("dimTimeoutMin"), 10);
    return Number.isNaN(v) ? 5 : v;
  });

  /**
   * Save screen dim timeout
   *
   * @param {Number} newVal minutes; 0 = never dim
   */
  function saveDimTimeoutMin(newVal) {
    setDimTimeoutMin(newVal);
    window.localStorage.setItem("dimTimeoutMin", String(newVal));
  }

  /**
   * Save mouse hide state
   *
   * @param {Boolean} newVal
   */
  function saveMouseHide(newVal) {
    let newState;
    try {
      newState = JSON.parse(newVal);
    } catch (e) {
      console.log("saveMouseHide", e);
      return;
    }
    setMouseHide(newState);
    window.localStorage.setItem(MOUSE_HIDE_STORAGE_KEY, newState);
  }

  /**
   * Save clock time
   *
   * @param {String} newVal `12` or `24`
   */
  function saveClockTime(newVal) {
    setClockTime(newVal);
    window.localStorage.setItem(CLOCK_UNIT_STORAGE_KEY, newVal);
  }

  /**
   * Save temp unit
   *
   * @param {String} newVal `f` or `c`
   */
  function saveTempUnit(newVal) {
    setTempUnit(newVal);
    window.localStorage.setItem(TEMP_UNIT_STORAGE_KEY, newVal);
  }

  /**
   * Save speed unit
   *
   * @param {String} newVal `mph` or `ms`
   */
  function saveSpeedUnit(newVal) {
    setSpeedUnit(newVal);
    window.localStorage.setItem(SPEED_UNIT_STORAGE_KEY, newVal);
  }

  /**
   * Save length unit
   *
   * @param {String} newVal  `in` or `mm`
   */
  function saveLengthUnit(newVal) {
    setLengthUnit(newVal);
    window.localStorage.setItem(LENGTH_UNIT_STORAGE_KEY, newVal);
  }

  function loadStoredData() {
    const temp = window.localStorage.getItem(TEMP_UNIT_STORAGE_KEY);
    const speed = window.localStorage.getItem(SPEED_UNIT_STORAGE_KEY);
    const length = window.localStorage.getItem(LENGTH_UNIT_STORAGE_KEY);
    const clock = window.localStorage.getItem(CLOCK_UNIT_STORAGE_KEY);

    let mouseHide;
    try {
      mouseHide = JSON.parse(
        window.localStorage.getItem(MOUSE_HIDE_STORAGE_KEY)
      );
    } catch (e) {
      console.log("mouseHide", e);
    }

    setMouseHide(!!mouseHide);
    if (temp) {
      setTempUnit(temp);
    }
    if (speed) {
      setSpeedUnit(speed);
    }
    if (length) {
      setLengthUnit(length);
    }
    if (clock) {
      setClockTime(clock);
    }
  }

  /**
   * Set custom starting lat/lon
   *
   * @returns {Promise} lat/lon
   * @private
   */
  function getCustomLatLon() {
    return new Promise((resolve, reject) => {
      getSettings()
        .then((res) => {
          if (res) {
            const { startingLat, startingLon } = res;
            if (startingLat) {
              setCustomLat(startingLat);
            }
            if (startingLon) {
              setCustomLon(startingLon);
            }
          }
          resolve(res);
        })
        .catch((err) => {
          console.log("could not read settings.json", err);
          reject(err);
        });
    });
  }

  /**
   * Set the map to a given position
   *
   * @param {Object} coords coordinates
   * @param {String} coords.latitude
   * @param {String} coords.longitude
   */
  function setMapPosition(coords) {
    updateCurrentWeatherData(coords);
    updateHourlyWeatherData(coords);
    updateDailyWeatherData(coords);
    setMapGeo(coords);
    setPanToCoords(coords);
  }

  /**
   * Return the map position to browser geolocation coordinates
   */
  function resetMapPosition() {
    setMapPosition(browserGeo);
  }

  /**
   * Gets geolocation and sets it, unless custom starting coordinates are provided.
   *
   * @returns {Object} coords
   */
  function getBrowserGeo() {
    return new Promise((resolve, reject) => {
      getCustomLatLon()
        .then((res) => {
          const { startingLat, startingLon } = res;
          if (startingLat && startingLon) {
            const latLon = {
              latitude: parseFloat(startingLat),
              longitude: parseFloat(startingLon),
            };
            setBrowserGeo(latLon);
            setMapGeo(latLon); //Set initial map coords to custom lat/lon
            resolve(latLon);
          } else {
            getCoordsFromApi()
              .then((res) => {
                if (!res) {
                  return reject("Could not get browser geolocation data");
                }
                const { latitude, longitude } = res;
                setBrowserGeo({ latitude, longitude });
                setMapGeo({ latitude, longitude }); //Set initial map coords to browser geolocation
                resolve(res);
              })
              .catch((err) => {
                reject(err);
              });
          }
        })
        .catch((err) => {
          console.log("err!", err);
        });
    });
  }

  /**
   * Retrieves weather API key and sets it
   *
   * @returns {Promise} Weather API Key
   */
  function getWeatherApiKey() {
    return new Promise((resolve, reject) => {
      getSettings()
        .then((res) => {
          if (!res || (res && !res.weatherApiKey)) {
            setSettingsMenuOpen(true);
            return reject("Weather API key missing");
          }
          setWeatherApiKey(res && res.weatherApiKey ? res.weatherApiKey : null);
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * Retrieves map API key and sets it
   *
   * @returns {Promise} Weather API Key
   */
  function getMapApiKey() {
    // CARTO basemap requires no API key, so this always succeeds without
    // forcing the settings menu open. Kept for API compatibility with callers.
    return new Promise((resolve) => {
      setMapApiKey("carto");
      resolve();
    });
  }

  /**
   * Retrieves reverse geolocation API key and sets it
   *
   * @returns {Promise} Weather API Key
   */
  function getReverseGeoApiKey() {
    return new Promise((resolve, reject) => {
      getSettings()
        .then((res) => {
          if (!res || (res && !res.reverseGeoApiKey)) {
            return reject("Reverse geolocation API key missing!");
          }
          setReverseGeoApiKey(
            res && res.reverseGeoApiKey ? res.reverseGeoApiKey : null
          );
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * Retrieves the OpenWeatherMap key (for wind/temp/cloud/pressure map tiles)
   *
   * @returns {Promise} resolves when loaded (absent key is not an error)
   */
  function getOwmApiKey() {
    return new Promise((resolve) => {
      getSettings()
        .then((res) => {
          setOwmApiKey(res && res.owmApiKey ? res.owmApiKey : null);
          resolve();
        })
        .catch(() => resolve());
    });
  }

  /**
   * Weather chip click — cycles a layer off -> grid -> points -> off, and
   * enforces only one weather overlay active at a time.
   * Clouds and lightning are grid-only (no city-values points mode).
   *
   * @param {String} name one of temp|clouds|lightning
   */
  const WX_GRID_ONLY = new Set(["clouds"]);
  function cycleWxLayer(name) {
    if (activeWxLayer !== name) {
      setActiveWxLayer(name);
      setWxMode("grid");
    } else if (wxMode === "grid" && !WX_GRID_ONLY.has(name)) {
      setWxMode("points");
    } else {
      setActiveWxLayer(null);
    }
  }

  /**
   * Updates hourly weather data
   *
   * @param {Object} coords
   * @param {Number} coords.latitude latitude
   * @param {Number} coords.longitude longitude
   *
   * @returns {Promise} hourly weather data
   */
  function updateHourlyWeatherData(coords) {
    setHourlyWeatherDataErr(null);
    setHourlyWeatherDataErrMsg(null);
    const { latitude, longitude } = coords;

    return new Promise((resolve, reject) => {
      if (!coords) {
        setHourlyWeatherDataErr(true);
        return reject("No coords");
      }
      if (!weatherApiKey) {
        setHourlyWeatherDataErr(true);
        setSettingsMenuOpen(true);
        return reject("Missing weather API key");
      }

      axios
        .get(`/api/weather?type=hourly&lat=${latitude}&lon=${longitude}`)
        .then((res) => {
          if (!res) {
            return reject({ message: "No response" });
          }
          const { data } = res;
          setHourlyWeatherData(data);
          resolve(data);
        })
        .catch((err) => {
          setHourlyWeatherDataErr(true);
          if (err && err.message) {
            setHourlyWeatherDataErrMsg(err.message);
          }

          reject(err);
        });
    });
  }

  /**
   * Updates daily  weather data
   *
   * @param {Object} coords
   * @param {Number} coords.latitude latitude
   * @param {Number} coords.longitude longitude
   *
   * @returns {Promise} daily weather data
   */
  function updateDailyWeatherData(coords) {
    setDailyWeatherDataErr(null);
    setDailyWeatherDataErrMsg(null);
    const { latitude, longitude } = coords;

    return new Promise((resolve, reject) => {
      if (!coords) {
        setDailyWeatherDataErr(true);
        return reject("No coords");
      }
      if (!weatherApiKey) {
        setDailyWeatherDataErr(true);
        setSettingsMenuOpen(true);
        return reject("Missing weather API key");
      }
      axios
        .get(`/api/weather?type=daily&lat=${latitude}&lon=${longitude}`)
        .then((res) => {
          if (!res) {
            return reject({ message: "No response" });
          }
          const { data } = res;
          setDailyWeatherData(data);
          resolve(data);
        })
        .catch((err) => {
          setDailyWeatherDataErr(true);
          if (err && err.message) {
            setDailyWeatherDataErrMsg(err.message);
          }
          reject(err);
        });
    });
  }

  function updateSunriseSunset(coords) {
    return new Promise((resolve, reject) => {
      if (!coords) {
        setSunriseTime(null);
        setSunsetTime(null);
        return reject("No coords");
      }
      const { latitude, longitude } = coords;

      axios
        .get(
          `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&formatted=0`
        )
        .then((res) => {
          const { results } = res?.data;
          if (results) {
            const { sunrise, sunset } = results;
            setSunriseTime(sunrise);
            setSunsetTime(sunset);
          } else {
            setSunriseTime(null);
            setSunsetTime(null);
          }
          resolve(results);
        })
        .catch((err) => {
          setSunriseTime(null);
          setSunsetTime(null);
          reject(err);
        });
    });
  }

  /**
   * Updates current weather data
   *
   * @param {Object} coords
   * @param {Number} coords.latitude latitude
   * @param {Number} coords.longitude longitude
   *
   * @returns {Promise} current weather data
   */
  function updateCurrentWeatherData(coords) {
    setCurrentWeatherDataErr(null);
    setCurrentWeatherDataErrMsg(null);
    const { latitude, longitude } = coords;

    return new Promise((resolve, reject) => {
      if (!coords) {
        setCurrentWeatherDataErr(true);
        return reject("No coords");
      }
      if (!weatherApiKey) {
        setCurrentWeatherDataErr(true);
        setSettingsMenuOpen(true);
        return reject("Missing weather API key");
      }

      axios
        .get(`/api/weather?type=current&lat=${latitude}&lon=${longitude}`)
        .then((res) => {
          if (!res) {
            return reject({ message: "No response" });
          }
          const { data } = res;
          setCurrentWeatherData(data);
          resolve(data);
        })
        .catch((err) => {
          setCurrentWeatherDataErr(true);
          if (err && err.message) {
            setCurrentWeatherDataErrMsg(err.message);
          }
          reject(err);
        });
    });
  }

  /**
   * Toggles the marker on and off
   */
  function toggleMarker() {
    setMarkerIsVisible(!markerIsVisible);
  }

  /**
   * Toggles weather map animation on/off
   */
  function toggleAnimateWeatherMap() {
    setAnimateWeatherMap(!animateWeatherMap);
  }

  /**
   * Toggles the live aircraft (flight) overlay layer on/off
   */
  function toggleAircraft() {
    setShowAircraft((v) => !v);
  }

  /**
   * Toggles the airport / military-base layer on/off
   */
  function toggleAirports() {
    setShowAirports((v) => !v);
  }

  /**
   * Toggles the maritime (AIS) vessel layer on/off
   */
  function toggleVessels() {
    setShowVessels((v) => !v);
  }

  /**
   * Toggles the satellite (infrared cloud) layer on/off
   */
  function toggleSatellite() {
    setShowSatellite((v) => !v);
  }

  /**
   * Toggles Blitzortung lightning strike dots on/off
   */
  function toggleLightning() {
    setShowLightning((v) => !v);
  }

  /**
   * Loads the aisstream.io key from settings (absent key is not an error)
   *
   * @returns {Promise} resolves when loaded
   */
  function getAisApiKey() {
    return new Promise((resolve) => {
      getSettings()
        .then((res) => {
          setAisApiKey(res && res.aisApiKey ? res.aisApiKey : null);
          resolve();
        })
        .catch(() => resolve());
    });
  }

  /**
   * Toggles settings menu open/closed
   */
  function toggleSettingsMenuOpen() {
    setSettingsMenuOpen(!settingsMenuOpen);
  }

  /**
   * Saves settings to `settings.json`
   *
   * @param {Object} settings
   * @param {String} [settings.mapsKey]
   * @param {String} [settings.weatherKey]
   * @param {String} [settings.geoKey]
   * @param {String} [settings.lat]
   * @param {String} [settings.lon]
   * @returns {Promise} Resolves when complete
   */
  function saveSettingsToJson({
    mapsKey,
    weatherKey,
    geoKey,
    owmKey,
    aisKey,
    lat,
    lon,
  }) {
    return new Promise((resolve, reject) => {
      axios
        .put("/settings", {
          weatherApiKey: weatherKey,
          mapApiKey: mapsKey,
          reverseGeoApiKey: geoKey,
          owmApiKey: owmKey,
          aisApiKey: aisKey,
          startingLat: lat,
          startingLon: lon,
        })
        .then((res) => {
          resolve(res);
          setMapApiKey(mapsKey);
          setWeatherApiKey(weatherKey);
          setReverseGeoApiKey(geoKey);
          setOwmApiKey(owmKey);
          setAisApiKey(aisKey);
          setCustomLat(lat);
          setCustomLon(lon);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  const defaultContext = {
    weatherApiKey,
    getWeatherApiKey,
    reverseGeoApiKey,
    getReverseGeoApiKey,
    mapApiKey,
    getMapApiKey,
    owmApiKey,
    getOwmApiKey,
    activeWxLayer,
    wxMode,
    cycleWxLayer,
    browserGeo,
    getBrowserGeo,
    darkMode,
    setDarkMode,
    mapGeo,
    setMapGeo,
    setMapPosition,
    resetMapPosition,
    panToCoords,
    setPanToCoords,
    markerIsVisible,
    toggleMarker,
    tempUnit,
    saveTempUnit,
    speedUnit,
    saveSpeedUnit,
    lengthUnit,
    saveLengthUnit,
    animateWeatherMap,
    toggleAnimateWeatherMap,
    showAircraft,
    toggleAircraft,
    showAirports,
    toggleAirports,
    showVessels,
    toggleVessels,
    showSatellite,
    toggleSatellite,
    showLightning,
    toggleLightning,
    aisApiKey,
    getAisApiKey,
    overheadAircraft,
    setOverheadAircraft,
    selectedVessel,
    setSelectedVessel,
    selectedAircraft,
    setSelectedAircraft,
    selectedFlightInfo,
    setSelectedFlightInfo,
    trackedCallsign,
    setTrackedCallsign,
    settingsMenuOpen,
    setSettingsMenuOpen,
    toggleSettingsMenuOpen,
    getCustomLatLon,
    customLat,
    customLon,
    loadStoredData,
    clockTime,
    saveClockTime,
    saveSettingsToJson,
    updateCurrentWeatherData,
    updateDailyWeatherData,
    updateHourlyWeatherData,
    currentWeatherData,
    currentWeatherDataErr,
    currentWeatherDataErrMsg,
    hourlyWeatherData,
    hourlyWeatherDataErr,
    hourlyWeatherDataErrMsg,
    dailyWeatherData,
    dailyWeatherDataErr,
    dailyWeatherDataErrMsg,
    mouseHide,
    saveMouseHide,
    updateSunriseSunset,
    sunriseTime,
    sunsetTime,
    showSourceBadge,
    saveShowSourceBadge,
    dimTimeoutMin,
    saveDimTimeoutMin,
  };

  return (
    <AppContext.Provider value={defaultContext}>{children}</AppContext.Provider>
  );
}

AppContextProvider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};
