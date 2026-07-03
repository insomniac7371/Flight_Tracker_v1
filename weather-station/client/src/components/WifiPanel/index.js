import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import styles from "./styles.css";

/**
 * Wi-Fi manager — scan, connect (password via on-screen keyboard), forget.
 * Collapsible like the API Keys section. NetworkManager remembers networks
 * automatically once connected.
 *
 * @param {Object} props
 * @param {Boolean} props.open whether the settings menu is open
 * @returns {JSX.Element} Wi-Fi panel
 */
const WifiPanel = ({ open }) => {
  const [expanded, setExpanded] = useState(false);
  const [available, setAvailable] = useState(true);
  const [connected, setConnected] = useState(null);
  const [saved, setSaved] = useState([]);
  const [networks, setNetworks] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [target, setTarget] = useState(null); // network being connected to
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null); // { ok, msg }

  const refreshStatus = useCallback(() => {
    axios
      .get("/api/wifi/status")
      .then((res) => {
        const d = res.data || {};
        setAvailable(d.available !== false);
        setConnected(d.connected || null);
        setSaved(d.saved || []);
      })
      .catch(() => setAvailable(false));
  }, []);

  useEffect(() => {
    if (open && expanded) refreshStatus();
  }, [open, expanded, refreshStatus]);

  const doScan = () => {
    setScanning(true);
    setStatus(null);
    axios
      .get("/api/wifi/scan")
      .then((res) => {
        const d = res.data || {};
        setAvailable(d.available !== false);
        setNetworks(d.networks || []);
      })
      .catch(() => setNetworks([]))
      .finally(() => setScanning(false));
  };

  const doConnect = () => {
    if (!target || busy) return;
    setBusy(true);
    setStatus(null);
    axios
      .post("/api/wifi/connect", {
        ssid: target.ssid,
        password: target.secured ? password : undefined,
      })
      .then((res) => {
        const d = res.data || {};
        if (d.ok) {
          setStatus({ ok: true, msg: `Connected to ${target.ssid}` });
          setTarget(null);
          setPassword("");
          refreshStatus();
        } else {
          setStatus({ ok: false, msg: d.error || "Could not connect" });
        }
      })
      .catch((err) => {
        const msg =
          err && err.response && err.response.data && err.response.data.error
            ? err.response.data.error
            : "Could not connect";
        setStatus({ ok: false, msg });
      })
      .finally(() => setBusy(false));
  };

  const doForget = (ssid) => {
    axios
      .post("/api/wifi/forget", { ssid })
      .then(() => refreshStatus())
      .catch(() => { /* refresh shows the truth either way */ });
  };

  return (
    <div className={styles.panel}>
      <div className={styles.toggle} onClick={() => setExpanded((e) => !e)}>
        <span>
          📶 Wi-Fi
          {connected ? (
            <span className={styles.currentSsid}> — {connected.ssid}</span>
          ) : null}
        </span>
        <span className={styles.chevron}>{expanded ? "▲" : "▼"}</span>
      </div>

      {expanded ? (
        <div className={styles.body}>
          {!available ? (
            <div className={styles.note}>
              Wi-Fi control not available on this device.
            </div>
          ) : (
            <>
              <div className={styles.row}>
                <span className={styles.note}>
                  {connected
                    ? `Connected: ${connected.ssid}${
                        connected.signal ? ` (${connected.signal}%)` : ""
                      }`
                    : "Not connected"}
                </span>
                <button
                  type="button"
                  className={styles.btn}
                  onClick={doScan}
                  disabled={scanning}
                >
                  {scanning ? "Scanning…" : "Scan"}
                </button>
              </div>

              {networks ? (
                <div className={styles.list}>
                  {networks.length === 0 ? (
                    <div className={styles.note}>No networks found</div>
                  ) : null}
                  {networks.map((n) => (
                    <div
                      key={n.ssid}
                      className={`${styles.net} ${
                        target && target.ssid === n.ssid ? styles.netActive : ""
                      }`}
                      onClick={() => {
                        setTarget(n);
                        setPassword("");
                        setStatus(null);
                      }}
                    >
                      <span className={styles.netName}>
                        {n.ssid}
                        {connected && connected.ssid === n.ssid ? " ✓" : ""}
                      </span>
                      <span className={styles.netMeta}>
                        {n.secured ? "🔒" : ""} {n.signal}%
                        {saved.includes(n.ssid) ? (
                          <button
                            type="button"
                            className={styles.forget}
                            onClick={(e) => {
                              e.stopPropagation();
                              doForget(n.ssid);
                            }}
                          >
                            forget
                          </button>
                        ) : null}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}

              {target ? (
                <div className={styles.connectRow}>
                  {target.secured && !saved.includes(target.ssid) ? (
                    <input
                      type="text"
                      className={styles.pwInput}
                      placeholder={`Password for ${target.ssid}`}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  ) : null}
                  <button
                    type="button"
                    className={styles.btn}
                    onClick={doConnect}
                    disabled={
                      busy ||
                      (target.secured &&
                        !saved.includes(target.ssid) &&
                        password.length < 8)
                    }
                  >
                    {busy ? "Connecting…" : "Connect"}
                  </button>
                </div>
              ) : null}

              {status ? (
                <div
                  className={`${styles.status} ${
                    status.ok ? styles.statusOk : styles.statusBad
                  }`}
                >
                  {status.msg}
                </div>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
};

WifiPanel.propTypes = {
  open: PropTypes.bool,
};

export default WifiPanel;
