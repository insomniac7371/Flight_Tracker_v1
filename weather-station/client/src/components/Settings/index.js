import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import styles from "./styles.css";
import { AppContext } from "~/AppContext";
import { CSSTransition } from "react-transition-group";
import FlightSearch from "~/components/FlightSearch";
import WifiPanel from "~/components/WifiPanel";
import { InlineIcon } from "@iconify/react";
import closeFilled from "@iconify/icons-carbon/close-filled";
import roundSaveAlt from "@iconify/icons-ic/round-save-alt";
import undoIcon from "@iconify/icons-dashicons/undo";
import closeSharp from "@iconify/icons-ion/close-sharp";
import PropTypes from "prop-types";
import "!style-loader!css-loader!./animations.css";

/**
 * Settings page
 *
 * @returns {JSX.Element} Settings page
 */
const Settings = () => {
  const {
    settingsMenuOpen,
    weatherApiKey,
    mapApiKey,
    reverseGeoApiKey,
    owmApiKey,
    aisApiKey,
    customLat,
    customLon,
    setSettingsMenuOpen,
    mouseHide,
    saveMouseHide,
  } = useContext(AppContext);

  const [mapsKey, setMapsKey] = useState(null);
  const [weatherKey, setWeatherKey] = useState(null);
  const [geoKey, setGeoKey] = useState(null);
  const [owmKey, setOwmKey] = useState(null);
  const [aisKey, setAisKey] = useState(null);
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);
  const [keysOpen, setKeysOpen] = useState(false);

  const [currentWeatherKey, setCurrentWeatherKey] = useState(null);
  const [currentGeoKey, setCurrentGeoKey] = useState(null);
  const [currentOwmKey, setCurrentOwmKey] = useState(null);
  const [currentAisKey, setCurrentAisKey] = useState(null);
  const [currentLat, setCurrentLat] = useState(null);
  const [currentLon, setCurrentLon] = useState(null);

  useEffect(() => {
    setCurrentWeatherKey(weatherApiKey);
    setCurrentGeoKey(reverseGeoApiKey);
    setCurrentOwmKey(owmApiKey);
    setCurrentAisKey(aisApiKey);
    setCurrentLat(customLat);
    setCurrentLon(customLon);
  }, [
    mapApiKey,
    weatherApiKey,
    reverseGeoApiKey,
    owmApiKey,
    aisApiKey,
    customLat,
    customLon,
    currentGeoKey,
    mouseHide,
    saveMouseHide,
  ]);

  useEffect(() => {
    if (mapApiKey) {
      setMapsKey(mapApiKey);
    }
    if (weatherApiKey) {
      setWeatherKey(weatherApiKey);
    }
    if (reverseGeoApiKey) {
      setGeoKey(reverseGeoApiKey);
    }
    if (owmApiKey) {
      setOwmKey(owmApiKey);
    }
    if (aisApiKey) {
      setAisKey(aisApiKey);
    }
    if (customLat) {
      setLat(customLat);
    }
    if (customLon) {
      setLon(customLon);
    }
  }, [
    mapApiKey,
    weatherApiKey,
    reverseGeoApiKey,
    owmApiKey,
    aisApiKey,
    customLon,
    customLat,
  ]);

  return (
    <CSSTransition
      in={settingsMenuOpen}
      unmountOnExit
      timeout={300}
      classNames="animate"
    >
      <div className={styles.container}>
        <div className={styles.header}>SETTINGS</div>
        <div
          className={styles.closeButton}
          onClick={() => {
            setSettingsMenuOpen(false);
          }}
        >
          <InlineIcon icon={closeSharp} />
        </div>
        <div className={styles.settingsContainer}>
          <div className={styles.col}>
            <FlightSearch />
            <DataHealth open={settingsMenuOpen} />
            <ToggleButtons />
            <Input
              label={"CUSTOM STARTING LATITUDE"}
              val={lat}
              cb={setLat}
              current={currentLat}
            />
            <Input
              label={"CUSTOM STARTING LONGITUDE"}
              val={lon}
              cb={setLon}
              current={currentLon}
            />
            <WifiPanel open={settingsMenuOpen} />
          </div>
          <div className={styles.col}>
            <div className={styles.keysToggle} onClick={() => setKeysOpen((o) => !o)}>
              <span>🔑 API Keys</span>
              <span className={styles.keysChevron}>{keysOpen ? "▲" : "▼"}</span>
            </div>
            {keysOpen ? (
              <div className={styles.keysPanel}>
                <Input
                  label={"WEATHER (Tomorrow.io)"}
                  val={weatherKey}
                  current={currentWeatherKey}
                  cb={setWeatherKey}
                  required={true}
                />
                <Input
                  label={"MAP LAYERS + AQI (OpenWeatherMap)"}
                  val={owmKey}
                  current={currentOwmKey}
                  cb={setOwmKey}
                />
                <Input
                  label={"SHIP TRAFFIC (aisstream.io)"}
                  val={aisKey}
                  current={currentAisKey}
                  cb={setAisKey}
                />
                <Input
                  label={"GEOLOCATION API KEY"}
                  val={geoKey}
                  current={currentGeoKey}
                  cb={setGeoKey}
                />
              </div>
            ) : null}
            <UpdatePanel open={settingsMenuOpen} />
            <div className={styles.bottomButtonContainer}>
              <div>
                <div className={styles.label}>HIDE MOUSE</div>
                <ToggleButton
                  button1Label={"ON"}
                  button2Label={"OFF"}
                  val={mouseHide}
                  button1Val={true}
                  button2Val={false}
                  cb={saveMouseHide}
                />
              </div>
              <div className={styles.saveButtonContainer}>
                <SaveButton
                  mapsKey={mapsKey}
                  weatherKey={weatherKey}
                  geoKey={geoKey}
                  owmKey={owmKey}
                  aisKey={aisKey}
                  lat={lat}
                  lon={lon}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </CSSTransition>
  );
};

export default Settings;

/**
 * Data-source health panel — pings every API/feed and shows status dots.
 *
 * @param {Object} props
 * @param {Boolean} props.open whether the settings menu is open
 * @returns {JSX.Element} Health panel
 */
const DataHealth = ({ open }) => {
  const [sources, setSources] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    axios
      .get("/api/health")
      .then((res) => setSources(res && res.data ? res.data.sources : null))
      .catch(() => setSources(null))
      .finally(() => setLoading(false));
  }, [open]);

  return (
    <div className={styles.health}>
      <div className={styles.label}>DATA SOURCES</div>
      {loading && !sources ? (
        <div className={styles.healthRow}>Checking…</div>
      ) : null}
      {(sources || []).map((s) => (
        <div key={s.name} className={styles.healthRow}>
          <span
            className={`${styles.healthDot} ${
              s.ok ? styles.healthOk : styles.healthBad
            }`}
          />
          <span className={styles.healthName}>{s.name}</span>
          <span className={styles.healthDetail}>{s.detail}</span>
        </div>
      ))}
    </div>
  );
};

DataHealth.propTypes = {
  open: PropTypes.bool,
};

/**
 * Version display + "Check for updates" button.
 *
 * @param {Object} props
 * @param {Boolean} props.open whether the settings menu is open
 * @returns {JSX.Element} Update panel
 */
const DIM_CHOICES = [0, 1, 5, 15, 30]; // minutes; 0 = never

const UpdatePanel = ({ open }) => {
  const {
    showSourceBadge,
    saveShowSourceBadge,
    dimTimeoutMin,
    saveDimTimeoutMin,
  } = useContext(AppContext);
  const [info, setInfo] = useState(null);
  const [status, setStatus] = useState(null); // null | checking | current | updating | error
  const [errMsg, setErrMsg] = useState(null);
  // Flight tab visibility in the kiosk shell — shared via same-origin
  // localStorage; the shell listens for the storage event and reacts live.
  const [flightTab, setFlightTab] = useState(
    () => window.localStorage.getItem("flightTabEnabled") === "1"
  );

  const saveFlightTab = (on) => {
    window.localStorage.setItem("flightTabEnabled", on ? "1" : "0");
    setFlightTab(on);
  };

  useEffect(() => {
    if (!open) return;
    axios
      .get("/api/version")
      .then((res) => setInfo(res.data))
      .catch(() => setInfo(null));
  }, [open]);

  const checkForUpdates = () => {
    if (status === "checking" || status === "updating") return;
    setStatus("checking");
    setErrMsg(null);
    axios
      .post("/api/update")
      .then((res) => {
        const d = res.data || {};
        if (d.updating) {
          setStatus("updating");
          // The server restarts itself mid-update. Poll until it comes back
          // with a new commit hash, then hard-reload to pick up the new bundle.
          const oldCommit = info && info.commit;
          const poll = setInterval(() => {
            axios
              .get("/api/version")
              .then((r) => {
                if (r.data && r.data.commit && r.data.commit !== oldCommit) {
                  clearInterval(poll);
                  window.location.reload();
                }
              })
              .catch(() => { /* server restarting — keep polling */ });
          }, 3000);
        } else if (d.upToDate) {
          setStatus("current");
        } else {
          setStatus("error");
          setErrMsg(d.error || "Update check failed");
        }
      })
      .catch(() => {
        setStatus("error");
        setErrMsg("Update check failed");
      });
  };

  return (
    <div className={styles.updatePanel}>
      <div className={styles.label}>ABOUT</div>
      <div className={styles.updateRow}>
        <span className={styles.updateVersion}>
          v{info && info.version ? info.version : "?"}
          {info && info.commit ? ` (${info.commit})` : ""}
          {info && info.date ? ` — ${info.date}` : ""}
        </span>
        <div
          className={`${styles.button} ${styles.updateBtn}`}
          onClick={checkForUpdates}
        >
          {status === "checking"
            ? "Checking…"
            : status === "updating"
            ? "Updating…"
            : "Check for updates"}
        </div>
      </div>
      {status === "current" ? (
        <div className={styles.updateStatus}>✓ Up to date</div>
      ) : null}
      {status === "updating" ? (
        <div className={styles.updateStatus}>
          Installing update — the app will reload automatically…
        </div>
      ) : null}
      {status === "error" ? (
        <div className={`${styles.updateStatus} ${styles.updateError}`}>
          {errMsg}
        </div>
      ) : null}
      <div className={styles.updateRow}>
        <span className={styles.updateVersion}>
          FLIGHT TAB (needs SDR feeder)
        </span>
        <ToggleButton
          button1Label={"ON"}
          button2Label={"OFF"}
          val={flightTab}
          button1Val={true}
          button2Val={false}
          cb={saveFlightTab}
        />
      </div>
      <div className={styles.updateRow}>
        <span className={styles.updateVersion}>
          FLIGHT COUNT / SOURCE BADGE
        </span>
        <ToggleButton
          button1Label={"ON"}
          button2Label={"OFF"}
          val={showSourceBadge}
          button1Val={true}
          button2Val={false}
          cb={saveShowSourceBadge}
        />
      </div>
      <div className={styles.updateRow}>
        <span className={styles.updateVersion}>SCREEN DIM AFTER</span>
        <div className={styles.dimRow}>
          {DIM_CHOICES.map((m) => (
            <div
              key={m}
              className={`${styles.button} ${styles.dimBtn} ${
                dimTimeoutMin === m ? styles.down : ""
              }`}
              onClick={() => saveDimTimeoutMin(m)}
            >
              {m === 0 ? "OFF" : `${m}m`}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

UpdatePanel.propTypes = {
  open: PropTypes.bool,
};

/**
 * Save button
 *
 * @param {Object} props
 * @param {String} [props.mapsKey]
 * @param {String} [props.weatherKey]
 * @param {String} [props.geoKey]
 * @param {String} [props.lat]
 * @param {String} [props.lon]
 * @returns {JSX.Element} Save button
 */
const SaveButton = ({ mapsKey, weatherKey, geoKey, owmKey, aisKey, lat, lon }) => {
  const { saveSettingsToJson, setSettingsMenuOpen, mouseHide } = useContext(
    AppContext
  );
  return (
    <div
      className={`${styles.button} ${styles.saveButton} ${
        !mouseHide ? styles.showMouse : ""
      }`}
      onClick={() => {
        saveSettingsToJson({ mapsKey, weatherKey, geoKey, owmKey, aisKey, lat, lon })
          .then(() => {
            setSettingsMenuOpen(false);
          })
          .catch((err) => {
            console.log("err!", err);
          });
      }}
    >
      <div className={styles.label}>SAVE</div>
      <div>
        <InlineIcon icon={roundSaveAlt} />
      </div>
    </div>
  );
};

SaveButton.propTypes = {
  mapsKey: PropTypes.string,
  weatherKey: PropTypes.string,
  geoKey: PropTypes.string,
  owmKey: PropTypes.string,
  aisKey: PropTypes.string,
  lat: PropTypes.string,
  lon: PropTypes.string,
};

/**
 * Toggle Buttons Group
 *
 * @returns {JSX.Element} A grouping of toggle buttons
 */
const ToggleButtons = () => {
  const {
    tempUnit,
    saveTempUnit,
    speedUnit,
    saveSpeedUnit,
    lengthUnit,
    saveLengthUnit,
    clockTime,
    saveClockTime,
  } = useContext(AppContext);

  return (
    <div>
      <div className={styles.label}>UNITS</div>
      <div className={styles.toggleButtons}>
        <div>
          <ToggleButton
            button1Label={"F"}
            button2Label={"C"}
            val={tempUnit}
            button1Val={"f"}
            button2Val={"c"}
            cb={saveTempUnit}
          />
        </div>
        <div>
          <ToggleButton
            button1Label={"mph"}
            button2Label={"m/s"}
            val={speedUnit}
            button1Val={"mph"}
            button2Val={"ms"}
            cb={saveSpeedUnit}
          />
        </div>
        <div>
          <ToggleButton
            button1Label={"in"}
            button2Label={"mm"}
            val={lengthUnit}
            button1Val={"in"}
            button2Val={"mm"}
            cb={saveLengthUnit}
          />
        </div>
        <div>
          <ToggleButton
            button1Label={"12h"}
            button2Label={"24h"}
            val={clockTime}
            button1Val={"12"}
            button2Val={"24"}
            cb={saveClockTime}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Toggle buttons
 *
 * @param {Object} props
 * @param {String} props.button1Label PropTypes.string.isRequired,
 * @param {String} props.button2Label PropTypes.string.isRequired,
 * @param {*} props.val PropTypes.string.isRequired,
 * @param {*} props.button1Val PropTypes.string.isRequired,
 * @param {*} props.button2Val PropTypes.string.isRequired,
 * @param {Function} props.cb PropTypes.func.isRequired,
 * @returns {JSX.Element} Toggle buttons
 */
const ToggleButton = ({
  button1Label,
  button2Label,
  val,
  button1Val,
  button2Val,
  cb,
}) => {
  return (
    <div className={styles.toggleContainer}>
      <div
        className={` ${styles.button} ${button1Val === val ? styles.down : ""}`}
        onClick={() => {
          cb(button1Val);
        }}
      >
        {button1Label}
      </div>
      <div
        className={` ${styles.button} ${button2Val === val ? styles.down : ""}`}
        onClick={() => {
          cb(button2Val);
        }}
      >
        {button2Label}
      </div>
    </div>
  );
};

ToggleButton.propTypes = {
  button1Label: PropTypes.string.isRequired,
  button2Label: PropTypes.string.isRequired,
  val: PropTypes.any.isRequired,
  button1Val: PropTypes.any.isRequired,
  button2Val: PropTypes.any.isRequired,
  cb: PropTypes.func.isRequired,
};

/**
 * Delete button
 *
 * @param {Object} props
 * @param {Function} props.cb callback
 * @returns {JSX.Element} Delete button
 */
const DeleteButton = ({ cb }) => {
  return (
    <div className={styles.button} onClick={cb}>
      <InlineIcon icon={closeFilled} />
    </div>
  );
};

DeleteButton.propTypes = {
  cb: PropTypes.func.isRequired,
};

/**
 * Undo button, restores input to default value
 *
 * @param {Object} props
 * @param {Function} props.cb callback
 * @returns {JSX.Element} Undo button
 */
const UndoButton = ({ cb }) => {
  return (
    <div className={styles.button} onClick={cb}>
      <InlineIcon icon={undoIcon} />
    </div>
  );
};

UndoButton.propTypes = {
  cb: PropTypes.func.isRequired,
};

/**
 * Settings input
 *
 * @param {Object} props
 * @param {String} props.label Label
 * @param {String} props.val value
 * @param {Function} props.cb change callback
 * @param {String} props.current current default value
 * @param {Boolean} [props.required] If input is required
 * @returns {JSX.Element} Input
 */
const Input = ({ label, val, cb, required, current }) => {
  const [inputValue, setInputValue] = useState(val);
  const [defaultValue, setDefaultValue] = useState(null);

  useEffect(() => {
    if ((val || val === "") && (!defaultValue || defaultValue === "")) {
      setDefaultValue(val);
    }
    setInputValue(val);
  }, [val, defaultValue]);
  return (
    <div className={styles.settingsItem}>
      <div className={styles.label}>{label}</div>
      <div
        className={`${styles.inputContainer} ${
          required && !val ? styles.invalid : ""
        }`}
      >
        <input
          type="text"
          placeholder={"None"}
          value={inputValue || ""}
          onChange={(e) => {
            const { value } = e.target;
            setInputValue(value);
            cb(value);
          }}
        />

        <div className={styles.buttonContainer}>
          <DeleteButton
            cb={() => {
              setInputValue("");
              cb("");
            }}
          />
          <UndoButton
            cb={() => {
              setInputValue(current);
              cb(current);
            }}
          />
        </div>
      </div>
    </div>
  );
};

Input.propTypes = {
  label: PropTypes.string,
  val: PropTypes.string,
  cb: PropTypes.func.isRequired,
  required: PropTypes.bool,
  current: PropTypes.string,
};
