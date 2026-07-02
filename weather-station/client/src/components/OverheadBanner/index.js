import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "~/AppContext";
import styles from "./styles.css";

/**
 * LED-sign style banner that appears when a flight passes (nearly) overhead.
 *
 * @returns {JSX.Element|null} Banner
 */
const OverheadBanner = () => {
  const { overheadAircraft } = useContext(AppContext);
  const [info, setInfo] = useState(null);

  const hex = overheadAircraft && overheadAircraft.id;
  useEffect(() => {
    if (!overheadAircraft) {
      setInfo(null);
      return undefined;
    }
    let active = true;
    setInfo(null);
    axios
      .get(
        `/api/aircraft-info?hex=${encodeURIComponent(
          overheadAircraft.id || ""
        )}&callsign=${encodeURIComponent(overheadAircraft.callsign || "")}`
      )
      .then((r) => {
        if (active) setInfo(r && r.data ? r.data : null);
      })
      .catch(() => {
        /* no extra info; banner still shows live position */
      });
    return () => {
      active = false;
    };
  }, [hex]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!overheadAircraft) return null;

  const ac = info && info.aircraft;
  const route = info && info.route;
  const airline =
    (route && route.airline) ||
    (ac && ac.owner) ||
    overheadAircraft.callsign ||
    "Aircraft";
  const type = (ac && (ac.type || ac.icaoType)) || null;
  const o = route && route.origin;
  const d = route && route.destination;

  const stat = (v, suffix, round) =>
    v == null ? "--" : `${round ? Math.round(v) : v}${suffix}`;
  const vr =
    overheadAircraft.vertRate == null
      ? "--"
      : `${overheadAircraft.vertRate > 0 ? "+" : ""}${overheadAircraft.vertRate} fpm`;

  return (
    <div className={styles.banner}>
      <div className={styles.led}>
        <div className={styles.left}>
          <div className={styles.tag}>● OVERHEAD</div>
          <div className={styles.airline}>{airline}</div>
          {o && d ? (
            <div className={styles.route}>
              {o.code}–{d.code}
            </div>
          ) : null}
          {type ? <div className={styles.type}>{type}</div> : null}
          {o && o.name ? <div className={styles.ap}>{o.name}</div> : null}
          {d && d.name ? <div className={styles.ap}>{d.name}</div> : null}
        </div>
        <div className={styles.right}>
          <div>
            <span>Alt</span>
            <b>{stat(overheadAircraft.alt, " ft")}</b>
          </div>
          <div>
            <span>Spd</span>
            <b>{stat(overheadAircraft.speed, " kt", true)}</b>
          </div>
          <div>
            <span>Trk</span>
            <b>{stat(overheadAircraft.track, "°", true)}</b>
          </div>
          <div>
            <span>Vr</span>
            <b>{vr}</b>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverheadBanner;
