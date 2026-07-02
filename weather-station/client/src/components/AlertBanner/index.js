import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./styles.css";

const POLL_MS = 5 * 60 * 1000;

function sevClass(sev) {
  const s = (sev || "").toLowerCase();
  if (s === "extreme" || s === "severe") return styles.severe;
  if (s === "moderate") return styles.moderate;
  return styles.minor;
}

/**
 * NWS weather-alert banner for the home location. Collapsed bar shows the
 * active event; tapping opens the full advisory text.
 *
 * @returns {JSX.Element|null} Alert banner
 */
const AlertBanner = () => {
  const [alerts, setAlerts] = useState([]);
  const [idx, setIdx] = useState(0);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState({});

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
        .catch(() => {
          /* keep last known alerts */
        });
    };
    load();
    const id = setInterval(load, POLL_MS);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const visible = alerts.filter((a) => !dismissed[a.id]);
  if (!visible.length) return null;
  const a = visible[Math.min(idx, visible.length - 1)];

  return (
    <>
      <div
        className={`${styles.bar} ${sevClass(a.severity)}`}
        onClick={() => setOpen(true)}
        role="button"
      >
        <span className={styles.icon}>⚠</span>
        <span className={styles.event}>{a.event}</span>
        {visible.length > 1 ? (
          <span className={styles.count}>+{visible.length - 1} more</span>
        ) : null}
        <span className={styles.more}>tap for details</span>
        <button
          className={styles.x}
          onClick={(e) => {
            e.stopPropagation();
            setDismissed((d) => ({ ...d, [a.id]: true }));
          }}
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>

      {open ? (
        <div className={styles.overlay} onClick={() => setOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={`${styles.modalHead} ${sevClass(a.severity)}`}>
              <span>{a.event}</span>
              <button className={styles.x} onClick={() => setOpen(false)}>
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              {a.headline ? <p className={styles.headline}>{a.headline}</p> : null}
              <div className={styles.meta}>
                {a.severity ? <span>Severity: {a.severity}</span> : null}
                {a.area ? <span>{a.area}</span> : null}
              </div>
              {a.description ? (
                <p className={styles.desc}>{a.description}</p>
              ) : null}
              {a.instruction ? (
                <p className={styles.instruction}>{a.instruction}</p>
              ) : null}
              {visible.length > 1 ? (
                <div className={styles.pager}>
                  {visible.map((al, i) => (
                    <button
                      key={al.id}
                      className={i === idx ? styles.pagerOn : ""}
                      onClick={() => setIdx(i)}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              ) : null}
              <p className={styles.src}>{a.sender || "NWS"}</p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default AlertBanner;
