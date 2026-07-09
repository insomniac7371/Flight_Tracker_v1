import React, { useEffect, useState, useContext } from "react";
import { AppContext } from "~/AppContext";
import { format } from "date-fns";
import styles from "./styles.css";
import SunRiseSet from "~/components/SunRiseSet";

/**
 * Displays time and date
 *
 * @returns {JSX.Element} Clock component
 */
const Clock = () => {
  const { clockTime } = useContext(AppContext);
  const [date, setDate] = useState(new Date().getTime());

  useEffect(() => {
    const clockInterval = setInterval(() => {
      setDate(new Date().getTime());
    }, 1000);
    return () => {
      clearInterval(clockInterval);
    };
  }, []);

  return (
    <div>
      <div className={styles.date}>
        {`${format(date, "cccc")} ${format(date, "LLLL")} ${format(
          date,
          "d"
        )}`.toUpperCase()}
      </div>
      {clockTime === "12" ? (
        <div className={styles.timeRow}>
          <span className={styles.time}>{format(date, "h:mm")}</span>
          <span className={styles.ampm}>{format(date, "a")}</span>
        </div>
      ) : (
        <div className={styles.time}>{format(date, "HH:mm")}</div>
      )}
      <div className={styles.sunRiseSetContainer}>
        <SunRiseSet/>
      </div>
    </div>
  );
};

export default Clock;
