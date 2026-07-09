import React, {
  useEffect,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import {
  Map,
  TileLayer,
  AttributionControl,
  Marker,
  Polyline,
  CircleMarker,
  Tooltip,
  ZoomControl,
} from "react-leaflet";
import L from "leaflet";
import PropTypes from "prop-types";
import { AppContext } from "~/AppContext";
import AIRFIELDS from "~/data/airports";
import axios from "axios";
import styles from "./styles.css";

// OpenWeatherMap (1.0) overlay tile layers, keyed by toggle name.
const OWM_LAYERS = {
  temp: "temp_new",
};
const WX_LABELS = {
  temp: "Temp",
};
// Layers that only have grid mode — no city-values cycling.
const WX_GRID_ONLY = new Set([]);

// Approximate color scales for the OpenWeatherMap overlays, for the legend.
const WX_SCALES = {
  temp: {
    label: "Temp",
    grad: "linear-gradient(90deg,#9b5de5,#3a86ff,#48cae4,#43e0c0,#ffd166,#ff7b00,#d00000)",
    ticks: ["-40°", "20°", "60°", "100°F"],
  },
};

// Aircraft marker colors by aircraft *type*. Military status is shown as a red
// ring on top of the type color (so e.g. an MH-65 is an amber helicopter that
// also carries the military ring).
const CAT_COLORS = {
  airliner: "#3fd2ff",
  helicopter: "#ffcf3f",
  private: "#5cf08a",
  other: "#b3bccb",
};
const MIL_RING = "#ff5c5c";
const CAT_LEGEND = [
  ["airliner", "Airliner"],
  ["private", "GA / Private"],
  ["helicopter", "Helicopter"],
  ["other", "Other"],
];

// Trigger the overhead banner when a plane is within this many km of home.
const OVERHEAD_KM = 3;

// Vessel marker colors by coarse AIS category.
const VESSEL_COLORS = {
  cargo: "#6ee7a8",
  tanker: "#ffb86b",
  passenger: "#5ac8fa",
  fishing: "#c8a2ff",
  fast: "#ff7ab6",
  service: "#9fe0d0",
  other: "#86c5b8",
};

/**
 * Weather map
 *
 * @param {Object} props
 * @param {Number} props.zoom zoom level
 * @param {Boolean} [props.dark] dark mode
 * @returns {JSX.Element} Weather map
 */
const WeatherMap = ({ zoom, dark }) => {
  const {
    panToCoords,
    setPanToCoords,
    browserGeo,
    mapGeo,
    mapApiKey,
    getMapApiKey,
    markerIsVisible,
    animateWeatherMap,
    toggleAnimateWeatherMap,
    showAircraft,
    toggleAircraft,
    showSourceBadge,
    showAirports,
    toggleAirports,
    showVessels,
    toggleVessels,
    showSatellite,
    toggleSatellite,
    showLightning,
    aisApiKey,
    getAisApiKey,
    setOverheadAircraft,
    setSelectedVessel,
    selectedAircraft,
    setSelectedAircraft,
    selectedFlightInfo,
    trackedCallsign,
    setTrackedCallsign,
    owmApiKey,
    getOwmApiKey,
    activeWxLayer,
    wxMode,
    cycleWxLayer,
  } = useContext(AppContext);
  const mapRef = useRef();
  const prevTracked = useRef(null);

  // Recenter the map on the saved home location at the default zoom.
  const recenterHome = useCallback(() => {
    const el = mapRef.current && mapRef.current.leafletElement;
    if (el && browserGeo) {
      el.setView([browserGeo.latitude, browserGeo.longitude], zoom);
    }
  }, [browserGeo, zoom]);

  // When tracking ends, snap back to the home view.
  useEffect(() => {
    if (prevTracked.current && !trackedCallsign) recenterHome();
    prevTracked.current = trackedCallsign;
  }, [trackedCallsign, recenterHome]);

  // Return-to-home: after 30s without touches, recenter on home and clear
  // any selected plane/ship — unless a flight is being actively tracked.
  useEffect(() => {
    let timer;
    const arm = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (!trackedCallsign) {
          setSelectedAircraft(null);
          setSelectedVessel(null);
          recenterHome();
        }
        arm(); // keep the cycle going for the next stretch of inactivity
      }, 30000);
    };
    const EVENTS = ["pointerdown", "pointermove", "wheel", "keydown"];
    EVENTS.forEach((ev) => window.addEventListener(ev, arm, { passive: true }));
    arm();
    return () => {
      clearTimeout(timer);
      EVENTS.forEach((ev) => window.removeEventListener(ev, arm));
    };
  }, [trackedCallsign, recenterHome, setSelectedAircraft, setSelectedVessel]);

  const [mapTimestamps, setMapTimestamps] = useState(null);
  const [currentMapTimestampIdx, setCurrentMapTimestampIdx] = useState(0);

  const [aircraft, setAircraft] = useState([]);
  const [aircraftSource, setAircraftSource] = useState(null);
  const AIRCRAFT_REFRESH = 8000; //ms — server caches upstream at 5s

  const MAP_TIMESTAMP_REFRESH_FREQUENCY = 1000 * 60 * 10; //update every 10 minutes
  const MAP_CYCLE_RATE = 800; //ms — paired with the 0.5s crossfade for smooth looping

  // Live aircraft (flight) overlay. Polls the server proxy, which prefers the
  // local dump1090 feed and falls back to the public adsb.lol API.
  useEffect(() => {
    if (!showAircraft) {
      setAircraft([]);
      setAircraftSource(null);
      return undefined;
    }
    let active = true;
    const load = () => {
      axios
        .get("/api/aircraft")
        .then((res) => {
          if (!active || !res || !res.data) return;
          setAircraft(Array.isArray(res.data.aircraft) ? res.data.aircraft : []);
          setAircraftSource(res.data.source || null);
        })
        .catch(() => {
          /* keep last known list on a transient error */
        });
    };
    load();
    const id = setInterval(load, AIRCRAFT_REFRESH);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [showAircraft]);

  // Detect a plane passing (nearly) overhead the home location.
  useEffect(() => {
    if (!browserGeo || !aircraft.length) {
      setOverheadAircraft(null);
      return;
    }
    let best = null;
    let bestKm = Infinity;
    aircraft.forEach((a) => {
      if (a.lat == null || a.lon == null) return;
      const km = haversineKm(
        browserGeo.latitude,
        browserGeo.longitude,
        a.lat,
        a.lon
      );
      if (km < bestKm) {
        bestKm = km;
        best = a;
      }
    });
    setOverheadAircraft(bestKm <= OVERHEAD_KM ? best : null);
  }, [aircraft, browserGeo]); // eslint-disable-line react-hooks/exhaustive-deps

  // Live maritime (AIS) vessels from the server proxy.
  const [vessels, setVessels] = useState([]);
  useEffect(() => {
    if (!showVessels) {
      setVessels([]);
      return undefined;
    }
    let active = true;
    const load = () => {
      axios
        .get("/api/vessels")
        .then((res) => {
          if (active && res && res.data) {
            setVessels(Array.isArray(res.data.vessels) ? res.data.vessels : []);
          }
        })
        .catch(() => {
          /* keep last known list */
        });
    };
    load();
    const id = setInterval(load, 12000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [showVessels]);

  // Lightning strike dots from Blitzortung (30-min rolling buffer).
  const [lightningStrikes, setLightningStrikes] = useState([]);
  useEffect(() => {
    if (!showLightning) { setLightningStrikes([]); return undefined; }
    let active = true;
    const load = () => {
      axios
        .get("/api/lightning")
        .then((res) => {
          if (active && res && res.data && Array.isArray(res.data.strikes)) {
            setLightningStrikes(res.data.strikes);
          }
        })
        .catch(() => {
          /* keep last known */
        });
    };
    load();
    const id = setInterval(load, 30000);
    return () => { active = false; clearInterval(id); };
  }, [showLightning]);

  // Tracking poll — lives here (always mounted) so following a flight keeps
  // working even when the Settings panel (where the search lives) is closed.
  useEffect(() => {
    if (!trackedCallsign) return undefined;
    let active = true;
    const tick = () => {
      axios
        .get(`/api/track?callsign=${encodeURIComponent(trackedCallsign)}`)
        .then((res) => {
          const d = res && res.data;
          if (active && d && d.found && d.aircraft) {
            setSelectedAircraft(d.aircraft);
            setPanToCoords({
              latitude: d.aircraft.lat,
              longitude: d.aircraft.lon,
            });
          }
        })
        .catch(() => {
          /* keep last known position */
        });
    };
    const id = setInterval(tick, 10000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [trackedCallsign]); // eslint-disable-line react-hooks/exhaustive-deps

  // City/town values for the "points" weather mode.
  const [wxPoints, setWxPoints] = useState([]);
  const [wxPointsUnit, setWxPointsUnit] = useState("");
  useEffect(() => {
    if (!activeWxLayer || wxMode !== "points") {
      setWxPoints([]);
      return undefined;
    }
    let active = true;
    const load = () => {
      axios
        .get(`/api/wx-points?layer=${activeWxLayer}`)
        .then((res) => {
          if (active && res && res.data) {
            setWxPoints(Array.isArray(res.data.points) ? res.data.points : []);
            setWxPointsUnit(res.data.unit || "");
          }
        })
        .catch(() => {
          /* keep last known */
        });
    };
    load();
    const id = setInterval(load, 5 * 60 * 1000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [activeWxLayer, wxMode]);

  const getMapApiKeyCallback = useCallback(
    () => getMapApiKey(),
    [getMapApiKey],
  );

  useEffect(() => {
    getOwmApiKey();
    getAisApiKey();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    getMapApiKeyCallback().catch((err) => {
      console.log("err!", err);
    });

    const updateTimeStamps = () => {
      getMapTimestamps()
        .then((res) => {
          // Full history + forecast: RainViewer provides ~2h of past frames
          // and up to 30 min of nowcast. Future frames are flagged so the
          // scrubber can mark them and the idle position can rest at "now".
          const past = (res && res.radar) || [];
          const nowcast = ((res && res.nowcast) || []).map((f) => ({
            ...f,
            future: true,
          }));
          setMapTimestamps([...past, ...nowcast]);
        })
        .catch((err) => {
          console.log("err", err);
        });
    };

    const mapTimestampsInterval = setInterval(
      updateTimeStamps,
      MAP_TIMESTAMP_REFRESH_FREQUENCY,
    );
    updateTimeStamps(); //initial update
    return () => {
      clearInterval(mapTimestampsInterval);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Pan the screen to a a specific location when `panToCoords` is updated with grid coordinates
  useEffect(() => {
    if (panToCoords && mapRef.current) {
      const { leafletElement } = mapRef.current;
      leafletElement.setView([panToCoords.latitude, panToCoords.longitude], leafletElement.getZoom(), { animate: false });
      setPanToCoords(null); //reset back to null so we can observe a change next time its fired for the same coords
    }
  }, [panToCoords, mapRef]); // eslint-disable-line react-hooks/exhaustive-deps

  const { latitude, longitude } = browserGeo || {};

  // cycle through weather maps when animated is enabled
  useEffect(() => {
    if (mapTimestamps) {
      if (animateWeatherMap) {
        const interval = setInterval(() => {
          let nextIdx;
          if (currentMapTimestampIdx + 1 >= mapTimestamps.length) {
            nextIdx = 0;
          } else {
            nextIdx = currentMapTimestampIdx + 1;
          }
          setCurrentMapTimestampIdx(nextIdx);
        }, MAP_CYCLE_RATE);
        return () => {
          clearInterval(interval);
        };
      } else {
        // Rest at "now" — the newest PAST frame, not the end of the forecast.
        let idx = mapTimestamps.length - 1;
        while (idx > 0 && mapTimestamps[idx].future) idx--;
        setCurrentMapTimestampIdx(idx);
      }
    }
  }, [currentMapTimestampIdx, animateWeatherMap, mapTimestamps]);

  if (!hasVal(latitude) || !hasVal(longitude) || !zoom || !mapApiKey) {
    return (
      <div className={`${styles.noMap} ${dark ? styles.dark : styles.light}`}>
        <div>Cannot retrieve map data.</div>
        <div>Did you enter an API key?</div>
      </div>
    );
  }
  const markerPosition = mapGeo ? [mapGeo.latitude, mapGeo.longitude] : null;

  // Route line — only in dedicated tracker mode, not on every plane tap.
  const route =
    trackedCallsign && selectedFlightInfo && selectedFlightInfo.route;
  const hasLatLon = (p) => p && p.lat != null && p.lon != null;
  const routeOrigin = route && hasLatLon(route.origin) ? route.origin : null;
  const routeDest = route && hasLatLon(route.destination) ? route.destination : null;

  return (
    <>
    <Map
      ref={mapRef}
      center={[latitude, longitude]}
      zoom={zoom}
      style={{ width: "100%", height: "100%" }}
      attributionControl={false}
      touchZoom={true}
      doubleClickZoom={true}
      scrollWheelZoom={true}
      dragging={true}
      keyboard={false}
      fadeAnimation={false}
      zoomControl={false}
      onClick={() => {
        // Tapping empty map deselects any plane/ship and stops tracking
        // (same as the X button). Marker clicks don't reach here — Leaflet
        // stops their propagation — so selecting still works.
        setSelectedAircraft(null);
        setSelectedVessel(null);
        setTrackedCallsign(null);
      }}
    >
      <AttributionControl position={"bottomleft"} />
      <ZoomControl position="bottomright" />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url={`https://{s}.basemaps.cartocdn.com/${
          dark ? "dark_all" : "light_all"
        }/{z}/{x}/{y}.png`}
        subdomains={"abcd"}
        maxZoom={20}
      />
      {showSatellite ? (
        <TileLayer
          attribution='Imagery: <a href="https://earthdata.nasa.gov/gibs">NASA GIBS</a> / NOAA GOES-East'
          url="https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/GOES-East_ABI_GeoColor/default/default/GoogleMapsCompatible_Level7/{z}/{y}/{x}.png"
          opacity={0.7}
          maxNativeZoom={7}
        />
      ) : null}
      {owmApiKey && activeWxLayer && wxMode === "grid" ? (
        <TileLayer
          key={activeWxLayer}
          attribution='&copy; <a href="https://openweathermap.org/">OpenWeather</a>'
          url={`https://tile.openweathermap.org/map/${OWM_LAYERS[activeWxLayer]}/{z}/{x}/{y}.png?appid=${owmApiKey}`}
          opacity={0.6}
        />
      ) : null}
      {(mapTimestamps || []).map((frame, idx) => (
        <TileLayer
          key={frame.path}
          className={"rv-frame"}
          attribution='<a href="https://www.rainviewer.com/">RainViewer</a>'
          url={`https://tilecache.rainviewer.com${frame.path}/512/{z}/{x}/{y}/6/1_1.png`}
          opacity={idx === currentMapTimestampIdx ? 0.5 : 0}
          tileSize={512}
          zoomOffset={-1}
          maxNativeZoom={8}
        />
      ))}
      {markerIsVisible && markerPosition ? (
        <Marker position={markerPosition} opacity={0.65}></Marker>
      ) : null}
      {wxMode === "points"
        ? wxPoints.map((p) => (
            <Marker
              key={p.name}
              position={[p.lat, p.lon]}
              icon={wxPointIcon(p.value, wxPointsUnit)}
              zIndexOffset={-300}
            />
          ))
        : null}
      {routeOrigin && routeDest ? (
        <>
          <Polyline
            positions={[
              [routeOrigin.lat, routeOrigin.lon],
              [routeDest.lat, routeDest.lon],
            ]}
            color={"#6fc0ff"}
            weight={2}
            opacity={0.85}
            dashArray={"6 7"}
          />
          {[routeOrigin, routeDest].map((p) => (
            <CircleMarker
              key={p.code}
              center={[p.lat, p.lon]}
              radius={4}
              color={"#6fc0ff"}
              fillColor={"#0a0e16"}
              fillOpacity={1}
              weight={2}
            >
              <Tooltip permanent direction={"top"} className={"route-ap"}>
                {p.code}
              </Tooltip>
            </CircleMarker>
          ))}
        </>
      ) : null}
      {showAirports
        ? AIRFIELDS.map((f) => (
            <Marker
              key={f.code}
              position={[f.lat, f.lon]}
              icon={airportIcon(f)}
              zIndexOffset={-500}
            >
              <Tooltip direction={"top"} offset={[0, -6]}>
                {f.name}
              </Tooltip>
            </Marker>
          ))
        : null}
      {showLightning
        ? lightningStrikes.map((s, i) => (
            <CircleMarker
              key={i}
              center={[s.lat, s.lon]}
              radius={3}
              pathOptions={{
                color: "#ffd700",
                fillColor: "#ffe566",
                fillOpacity: Math.max(0.2, 1 - (Date.now() - s.t) / (30 * 60 * 1000)),
                weight: 1,
                opacity: 0.85,
              }}
            />
          ))
        : null}
      {showVessels
        ? vessels.map((v) => (
            <Marker
              key={v.id}
              position={[v.lat, v.lon]}
              icon={vesselIcon(v)}
              zIndexOffset={-200}
              onClick={() => { setSelectedVessel(v); setSelectedAircraft(null); }}
            >
              <Tooltip direction={"top"} offset={[0, -6]}>
                {v.name}
                {v.speed != null ? ` · ${Math.round(v.speed)} kt` : ""}
              </Tooltip>
            </Marker>
          ))
        : null}
      {showAircraft && !trackedCallsign
        ? aircraft.map((ac) => (
            <Marker
              key={ac.id}
              position={[ac.lat, ac.lon]}
              icon={aircraftIcon(ac.track, ac.category, { mil: ac.mil, selected: !trackedCallsign && selectedAircraft && selectedAircraft.id === ac.id })}
              onClick={() => { setSelectedAircraft(ac); setSelectedVessel(null); }}
            />
          ))
        : null}
      {trackedCallsign && selectedAircraft && selectedAircraft.lat != null ? (
        <Marker
          position={[selectedAircraft.lat, selectedAircraft.lon]}
          icon={aircraftIcon(selectedAircraft.track, selectedAircraft.category, {
            tracked: true,
            mil: selectedAircraft.mil,
          })}
          zIndexOffset={1000}
        />
      ) : null}
    </Map>
    <button
      type="button"
      className={styles.homeBtn}
      onClick={recenterHome}
      aria-label="Center on home"
    >
      ⌂
    </button>
    {showAircraft && showSourceBadge ? (
      <div className={styles.acBadge}>
        {`✈ ${aircraft.length}`}
        {aircraftSource ? ` · ${aircraftSource}` : ""}
      </div>
    ) : null}
    <div className={styles.wxLayers}>
      <button
        type="button"
        className={`${styles.wxChip} ${showAircraft ? styles.wxChipOn : ""}`}
        onClick={() => toggleAircraft()}
      >
        Flights
      </button>
      <button
        type="button"
        className={`${styles.wxChip} ${showAirports ? styles.wxChipOn : ""}`}
        onClick={() => toggleAirports()}
      >
        Airports
      </button>
      <button
        type="button"
        className={`${styles.wxChip} ${showVessels ? styles.wxChipOn : ""}`}
        onClick={() => toggleVessels()}
        title={!aisApiKey ? "Add an aisstream.io key in settings" : ""}
      >
        Ships
      </button>
      <button
        type="button"
        className={`${styles.wxChip} ${showSatellite ? styles.wxChipOn : ""}`}
        onClick={() => toggleSatellite()}
      >
        Satellite
      </button>
      {Object.keys(OWM_LAYERS).map((k) => (
        <button
          key={k}
          type="button"
          className={`${styles.wxChip} ${
            activeWxLayer === k ? styles.wxChipOn : ""
          }`}
          onClick={() => cycleWxLayer(k)}
          title={WX_GRID_ONLY.has(k) ? "Tap to toggle overlay" : "Tap: off → color grid → city values"}
        >
          {WX_LABELS[k]}
          {activeWxLayer === k && !WX_GRID_ONLY.has(k) ? (
            <em className={styles.wxChipMode}>
              {wxMode === "points" ? " #" : " ▦"}
            </em>
          ) : null}
        </button>
      ))}
      {!owmApiKey ? (
        <span className={styles.wxHint}>add OWM key in settings</span>
      ) : null}
    </div>
    {showAircraft ? (
      <div className={styles.acLegend}>
        {CAT_LEGEND.map(([key, label]) => (
          <span key={key} className={styles.acLegendItem}>
            <i style={{ background: CAT_COLORS[key] }} />
            {label}
          </span>
        ))}
        <span className={styles.acLegendItem}>
          <i style={{ background: MIL_RING }} />
          Military
        </span>
      </div>
    ) : null}
    {mapTimestamps && mapTimestamps.length > 1 ? (
      <div className={styles.radarBar}>
        <button
          className={styles.radarPlay}
          type="button"
          onClick={() => toggleAnimateWeatherMap()}
          aria-label={animateWeatherMap ? "Pause radar" : "Play radar"}
        >
          {animateWeatherMap ? "❚❚" : "▶"}
        </button>
        <div className={styles.radarTrack}>
          <span
            className={styles.radarFill}
            style={{
              width: `${(currentMapTimestampIdx /
                (mapTimestamps.length - 1)) *
                100}%`,
            }}
          />
          {mapTimestamps.map((f, i) => (
            <button
              key={f.time}
              type="button"
              className={`${styles.radarTick} ${
                i === currentMapTimestampIdx ? styles.radarTickActive : ""
              } ${f.future ? styles.radarTickFuture : ""}`}
              style={{
                left: `${(i / (mapTimestamps.length - 1)) * 100}%`,
              }}
              onClick={() => setCurrentMapTimestampIdx(i)}
            />
          ))}
          <span
            className={styles.radarHandle}
            style={{
              left: `${(currentMapTimestampIdx /
                (mapTimestamps.length - 1)) *
                100}%`,
            }}
          />
        </div>
        <span
          className={`${styles.radarNow} ${
            mapTimestamps[currentMapTimestampIdx].future
              ? styles.radarNowFuture
              : ""
          }`}
        >
          {radarTimeLabel(mapTimestamps, currentMapTimestampIdx) === "now"
            ? "now"
            : fmtTime(
                mapTimestamps[currentMapTimestampIdx].time,
                true
              )}
        </span>
      </div>
    ) : null}
    {activeWxLayer && wxMode === "grid" && WX_SCALES[activeWxLayer] ? (
      <div className={styles.wxScale}>
        <div className={styles.wxScaleRow}>
          <span className={styles.wxScaleLabel}>
            {WX_SCALES[activeWxLayer].label}
          </span>
          <span
            className={styles.wxScaleBar}
            style={{ background: WX_SCALES[activeWxLayer].grad }}
          />
          <span className={styles.wxScaleTicks}>
            {WX_SCALES[activeWxLayer].ticks.map((t) => (
              <em key={t}>{t}</em>
            ))}
          </span>
        </div>
      </div>
    ) : null}
    </>
  );
};

WeatherMap.propTypes = {
  zoom: PropTypes.number.isRequired,
  dark: PropTypes.bool,
};

/**
 * Weather layer
 *
 * @param {Object} props
 * @param {String} props.layer
 * @param {String} props.weatherApiKey
 * @returns {JSX.Element} Weather layer
 */
const WeatherLayer = ({ layer, weatherApiKey }) => {
  return (
    <TileLayer
      attribution='&amp;copy <a href="https://openweathermap.org/">OpenWeather</a>'
      url={`https://tile.openweathermap.org/map/${layer}/{z}/{x}/{y}.png?appid=${weatherApiKey}`}
      apiKey
    />
  );
};

WeatherLayer.propTypes = {
  layer: PropTypes.string.isRequired,
  weatherApiKey: PropTypes.string,
};

/**
 * Determines if truthy, but returns true for 0
 *
 * @param {*} i
 * @returns {Boolean} If truthy or zero
 */
function hasVal(i) {
  return !!(i || i === 0);
}

/**
 * Human label for which radar frame is showing (relative to now).
 *
 * @param {Array} frames RainViewer frames with `time` (unix seconds)
 * @param {Number} idx active frame index
 * @returns {String|null} label like "now" or "-40 min"
 */
/**
 * Marker icon for a city/town weather value (the "points" overlay mode).
 *
 * @param {Number} value reading
 * @param {String} unit suffix (e.g. "°", "%")
 * @returns {Object} Leaflet divIcon
 */
function wxPointIcon(value, unit) {
  return L.divIcon({
    className: "wxpt-marker",
    html: `<span class="wxpt">${value}${unit || ""}</span>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

/**
 * Marker icon for an AIS vessel — a boat hull pointed along its course.
 *
 * @param {Object} v vessel {course, kind}
 * @returns {Object} Leaflet divIcon
 */
function vesselIcon(v) {
  const rot = Math.round((((v.course || 0) % 360) + 360) % 360);
  const fill = VESSEL_COLORS[v.kind] || VESSEL_COLORS.other;
  return L.divIcon({
    className: "vessel-marker",
    html:
      `<div class="vs-rot" style="transform: rotate(${rot}deg)">` +
      `<svg viewBox="0 0 16 16" width="25" height="25" aria-hidden="true">` +
      `<path d="M8 1.4c1.7 1.6 2.4 3.6 2.4 5.8v5.2c0 .7-.4 1.2-1 1.2H6.6c-.6 0-1-.5-1-1.2V7.2C5.6 5 6.3 3 8 1.4z" ` +
      `fill="${fill}" stroke="#06121a" stroke-width="0.8" stroke-linejoin="round"/></svg></div>`,
    iconSize: [25, 25],
    iconAnchor: [12, 12],
  });
}

/**
 * Great-circle distance in km.
 *
 * @returns {Number} km
 */
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Marker icon for an airport or military installation.
 *
 * @param {Object} f airfield {code, type}
 * @returns {Object} Leaflet divIcon
 */
function airportIcon(f) {
  const mil = f.type === "military";
  return L.divIcon({
    className: "airfield-marker",
    html:
      `<div class="af-wrap ${mil ? "af-mil" : "af-civ"}">` +
      `<i class="af-dot"></i><span>${f.code}</span></div>`,
    iconSize: [0, 0],
    iconAnchor: [4, 4],
  });
}

/**
 * Human label for which radar frame is showing (relative to now).
 *
 * @param {Array} frames RainViewer frames with `time` (unix seconds)
 * @param {Number} idx active frame index
 * @returns {String|null} label like "now" or "-40 min"
 */
function radarTimeLabel(frames, idx) {
  if (!frames || !frames[idx] || !frames[idx].time) return null;
  const diffMin = Math.round(Date.now() / 1000 / 60 - frames[idx].time / 60);
  if (diffMin < -1) return `+${-diffMin} min`; // forecast frame
  if (diffMin <= 1) return "now";
  if (diffMin < 60) return `-${diffMin} min`;
  const h = Math.floor(diffMin / 60);
  const m = diffMin % 60;
  return `-${h}h${m ? ` ${m}m` : ""}`;
}

/**
 * Format a unix-second timestamp as a short clock time (h:mm).
 *
 * @param {Number} unixSec seconds
 * @param {Boolean} [ampm] include AM/PM suffix
 * @returns {String} formatted time
 */
function fmtTime(unixSec, ampm) {
  const d = new Date(unixSec * 1000);
  let h = d.getHours();
  const m = d.getMinutes();
  const suffix = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, "0")}${ampm ? ` ${suffix}` : ""}`;
}

/**
 * Builds a rotated plane marker icon for an aircraft heading.
 *
 * @param {Number} track heading in degrees (0 = north)
 * @returns {Object} Leaflet divIcon
 */
function aircraftIcon(track, category, opts) {
  const { tracked = false, selected = false, mil = false } = opts || {};
  const rot = Math.round((((track || 0) % 360) + 360) % 360);
  const fill = tracked
    ? "#ffffff"
    : mil
    ? MIL_RING
    : CAT_COLORS[category] || CAT_COLORS.other;
  const sz = tracked ? 52 : 38;
  const ring = tracked
    ? `<circle cx="12" cy="12" r="11.2" fill="none" stroke="#49f49c" stroke-width="1.6" opacity="0.95"/>`
    : selected
    ? `<circle cx="12" cy="12" r="11.2" fill="none" stroke="#ffd700" stroke-width="2" opacity="0.9"/>`
    : "";
  const cls = tracked ? "ac-marker ac-tracked" : selected ? "ac-marker ac-selected" : "ac-marker";
  return L.divIcon({
    className: cls,
    html:
      `<div class="ac-rot" style="transform: rotate(${rot}deg)">` +
      `<svg viewBox="0 0 24 24" width="${sz}" height="${sz}" aria-hidden="true">${ring}` +
      `<path d="M12 2c.69 0 1.25 1.07 1.25 2.39v4.94l8 4.62v1.78l-8-2.4v4.55l2.1 1.55v1.34L12 19.9l-3.35 1.41v-1.34l2.1-1.55v-4.55l-8 2.4v-1.78l8-4.62V4.39C10.75 3.07 11.31 2 12 2z" ` +
      `fill="${fill}" stroke="#04121a" stroke-width="0.9" stroke-linejoin="round"/></svg></div>`,
    iconSize: [sz, sz],
    iconAnchor: [sz / 2, sz / 2],
  });
}

/**
 * Get timestamps for weather map
 *
 * @returns {Promise} Promise of timestamps
 */
function getMapTimestamps() {
  return new Promise((resolve, reject) => {
    axios
      .get("https://api.rainviewer.com/public/weather-maps.json")
      .then((res) => {
        const d = res.data || {};
        resolve({
          radar: (d.radar && d.radar.past) || [],
          nowcast: (d.radar && d.radar.nowcast) || [],
          satellite: (d.satellite && d.satellite.infrared) || [],
        });
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export default WeatherMap;
