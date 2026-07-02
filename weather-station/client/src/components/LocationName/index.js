import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "~/AppContext";
import { InlineIcon } from "@iconify/react";
import locationIcon from "@iconify/icons-gridicons/location";
import styles from "./styles.css";

/**
 * Map location — shows the reverse-geocoded city/town (key-free), falling back
 * to raw coordinates only if the lookup fails.
 *
 * @returns {JSX.Element} Location name
 */
const LocationName = () => {
  const { mapGeo } = useContext(AppContext);
  const [name, setName] = useState(null);

  useEffect(() => {
    if (!mapGeo) return;
    const { latitude: lat, longitude: lon } = mapGeo;
    const fallback = `${Number(lat).toFixed(3)}, ${Number(lon).toFixed(3)}`;
    axios
      .get(`/api/place?lat=${lat}&lon=${lon}`)
      .then((res) => {
        setName(res && res.data && res.data.name ? res.data.name : fallback);
      })
      .catch(() => setName(fallback));
  }, [mapGeo]);

  return (
    <div className={`${styles.container}`}>
      {name ? (
        <div>
          <InlineIcon icon={locationIcon} /> {name}
        </div>
      ) : null}
    </div>
  );
};

export default LocationName;
