import React, { useEffect, useRef, useState } from "react";
import styles from "./styles.css";

// Dim the screen after 5 minutes of no touch/mouse input.
// Any interaction wakes it back up immediately.
const IDLE_MS = 5 * 60 * 1000;

/**
 * @returns {JSX.Element|null} full-screen dim overlay when idle
 */
const InactivityDim = () => {
  const [dimmed, setDimmed] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    const wake = () => {
      setDimmed(false);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setDimmed(true), IDLE_MS);
    };

    const EVENTS = ["pointerdown", "pointermove", "keydown", "wheel"];
    EVENTS.forEach((ev) => window.addEventListener(ev, wake, { passive: true }));

    // Start the initial timer.
    timer.current = setTimeout(() => setDimmed(true), IDLE_MS);

    return () => {
      clearTimeout(timer.current);
      EVENTS.forEach((ev) => window.removeEventListener(ev, wake));
    };
  }, []);

  if (!dimmed) return null;

  return (
    <div
      className={styles.dim}
      onPointerDown={() => setDimmed(false)}
    />
  );
};

export default InactivityDim;
