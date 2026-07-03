import React, { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "~/AppContext";
import styles from "./styles.css";

/**
 * Dim the screen after a period of no touch/mouse input. The timeout is
 * user-configurable in Settings (dimTimeoutMin); 0 disables dimming.
 * Any interaction wakes it back up immediately.
 *
 * @returns {JSX.Element|null} full-screen dim overlay when idle
 */
const InactivityDim = () => {
  const { dimTimeoutMin } = useContext(AppContext);
  const [dimmed, setDimmed] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    setDimmed(false);
    clearTimeout(timer.current);
    if (!dimTimeoutMin) return undefined; // 0 = never dim

    const idleMs = dimTimeoutMin * 60 * 1000;
    const wake = () => {
      setDimmed(false);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setDimmed(true), idleMs);
    };

    const EVENTS = ["pointerdown", "pointermove", "keydown", "wheel"];
    EVENTS.forEach((ev) => window.addEventListener(ev, wake, { passive: true }));

    timer.current = setTimeout(() => setDimmed(true), idleMs);

    return () => {
      clearTimeout(timer.current);
      EVENTS.forEach((ev) => window.removeEventListener(ev, wake));
    };
  }, [dimTimeoutMin]);

  if (!dimmed) return null;

  return (
    <div
      className={styles.dim}
      onPointerDown={() => setDimmed(false)}
    />
  );
};

export default InactivityDim;
