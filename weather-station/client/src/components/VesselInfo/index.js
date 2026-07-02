import React, { useContext } from "react";
import PropTypes from "prop-types";
import { AppContext } from "~/AppContext";
import { InlineIcon } from "@iconify/react";
import closeSharp from "@iconify/icons-ion/close-sharp";
import styles from "./styles.css";

const KIND_LABEL = {
  cargo: "Cargo Ship",
  tanker: "Tanker",
  passenger: "Passenger / Ferry",
  fishing: "Fishing Vessel",
  fast: "High-speed Craft",
  service: "Service / Tug",
  other: "Vessel",
};

// Type-specific colors matching the map marker palette
const KIND_COLOR = {
  cargo: "#6ee7a8",
  tanker: "#ffb86b",
  passenger: "#5ac8fa",
  fishing: "#c8a2ff",
  fast: "#ff7ab6",
  service: "#9fe0d0",
  other: "#86c5b8",
};

/**
 * SVG ship silhouette — side profile, styled by vessel type.
 * No free ship-photo API exists (unlike aircraft/PlaneSpotters), so we show
 * a type-specific illustration instead.
 *
 * @param {Object} props
 * @param {String} props.kind vessel type key
 * @returns {JSX.Element} SVG illustration
 */
const ShipSilhouette = ({ kind }) => {
  const c = KIND_COLOR[kind] || KIND_COLOR.other;
  const dark = "rgba(0,0,0,0.35)";
  const water = "rgba(90,200,250,0.18)";

  // Each type gets a distinct silhouette path
  const shapes = {
    cargo: (
      <>
        {/* Long flat hull */}
        <path d="M6 38 L14 46 L146 46 L154 38 L124 35 L124 26 L104 22 L56 22 L36 26 Z" fill={c}/>
        {/* Aft superstructure */}
        <rect x="92" y="10" width="34" height="16" rx="2" fill={c}/>
        {/* Bridge windows */}
        <rect x="95" y="13" width="5" height="4" rx="1" fill={dark}/>
        <rect x="103" y="13" width="5" height="4" rx="1" fill={dark}/>
        <rect x="111" y="13" width="5" height="4" rx="1" fill={dark}/>
        {/* Mast */}
        <line x1="108" y1="2" x2="108" y2="12" stroke={c} strokeWidth="2"/>
        {/* Cargo hatches */}
        <rect x="40" y="24" width="18" height="8" rx="1" fill={dark}/>
        <rect x="64" y="24" width="18" height="8" rx="1" fill={dark}/>
      </>
    ),
    tanker: (
      <>
        {/* Very long low hull */}
        <path d="M4 40 L12 47 L148 47 L156 40 L130 37 L130 30 L110 27 L50 27 L30 30 Z" fill={c}/>
        {/* Aft superstructure */}
        <rect x="110" y="14" width="28" height="16" rx="2" fill={c}/>
        <rect x="112" y="17" width="4" height="4" rx="1" fill={dark}/>
        <rect x="120" y="17" width="4" height="4" rx="1" fill={dark}/>
        {/* Tank domes */}
        <ellipse cx="52" cy="28" rx="10" ry="5" fill={c} opacity="0.7"/>
        <ellipse cx="76" cy="28" rx="10" ry="5" fill={c} opacity="0.7"/>
        <ellipse cx="100" cy="28" rx="8" ry="4" fill={c} opacity="0.7"/>
        {/* Mast */}
        <line x1="120" y1="6" x2="120" y2="16" stroke={c} strokeWidth="2"/>
      </>
    ),
    passenger: (
      <>
        {/* Hull */}
        <path d="M8 40 L16 48 L144 48 L152 40 L130 37 L130 16 L30 16 L10 37 Z" fill={c}/>
        {/* Upper decks */}
        <rect x="28" y="8" width="104" height="10" rx="2" fill={c}/>
        <rect x="44" y="2" width="72" height="8" rx="2" fill={c} opacity="0.8"/>
        {/* Deck windows (rows) */}
        {[18, 10, 4].map((y, row) => (
          Array.from({length: 9}, (_, i) => (
            <rect key={`w${row}-${i}`} x={36 + i * 11} y={y} width="5" height="4" rx="1" fill={dark}/>
          ))
        ))}
        {/* Funnels */}
        <rect x="88" y="-2" width="8" height="6" rx="1" fill={c} opacity="0.7"/>
        <rect x="100" y="-2" width="8" height="6" rx="1" fill={c} opacity="0.7"/>
      </>
    ),
    fishing: (
      <>
        {/* Shorter hull */}
        <path d="M16 38 L24 46 L116 46 L124 38 L100 35 L100 24 L76 20 L48 22 L28 28 Z" fill={c}/>
        {/* Wheelhouse */}
        <rect x="62" y="10" width="28" height="14" rx="2" fill={c}/>
        <rect x="65" y="13" width="5" height="4" rx="1" fill={dark}/>
        <rect x="74" y="13" width="5" height="4" rx="1" fill={dark}/>
        {/* Mast + boom */}
        <line x1="76" y1="1" x2="76" y2="12" stroke={c} strokeWidth="2"/>
        <line x1="76" y1="4" x2="108" y2="14" stroke={c} strokeWidth="1.5" opacity="0.7"/>
        {/* Net drum */}
        <rect x="24" y="30" width="20" height="8" rx="3" fill={c} opacity="0.7"/>
      </>
    ),
    fast: (
      <>
        {/* Sleek low hull */}
        <path d="M4 40 L20 47 L148 47 L160 40 L140 37 L130 28 L100 24 L40 26 L12 36 Z" fill={c}/>
        {/* Low superstructure */}
        <path d="M80 16 L110 16 L126 28 L64 28 Z" fill={c}/>
        {/* Windows */}
        <rect x="84" y="18" width="5" height="4" rx="1" fill={dark}/>
        <rect x="93" y="18" width="5" height="4" rx="1" fill={dark}/>
        <rect x="102" y="18" width="5" height="4" rx="1" fill={dark}/>
        {/* Mast */}
        <line x1="98" y1="6" x2="98" y2="18" stroke={c} strokeWidth="1.5"/>
      </>
    ),
    service: (
      <>
        {/* Compact tug hull */}
        <path d="M18 36 L26 46 L114 46 L122 36 L106 32 L106 20 L80 16 L54 18 L34 24 Z" fill={c}/>
        {/* High superstructure */}
        <rect x="52" y="4" width="44" height="18" rx="2" fill={c}/>
        {/* Windows */}
        <rect x="56" y="7" width="5" height="5" rx="1" fill={dark}/>
        <rect x="65" y="7" width="5" height="5" rx="1" fill={dark}/>
        <rect x="74" y="7" width="5" height="5" rx="1" fill={dark}/>
        <rect x="83" y="7" width="5" height="5" rx="1" fill={dark}/>
        {/* Exhaust stack */}
        <rect x="80" y="-4" width="10" height="10" rx="2" fill={c} opacity="0.75"/>
        {/* Tow bit (aft) */}
        <rect x="96" y="34" width="8" height="6" rx="2" fill={c} opacity="0.6"/>
      </>
    ),
  };

  const shape = shapes[kind] || shapes.cargo;

  return (
    <svg
      viewBox="0 0 160 52"
      xmlns="http://www.w3.org/2000/svg"
      className={styles.silhouette}
      aria-hidden="true"
    >
      {/* Water line */}
      <rect x="0" y="44" width="160" height="8" rx="0" fill={water}/>
      {/* Bow wake */}
      <path d="M6 44 Q2 47 6 50" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" fill="none"/>
      {shape}
    </svg>
  );
};

ShipSilhouette.propTypes = { kind: PropTypes.string };

/**
 * Detail card for a tapped AIS vessel.
 *
 * @returns {JSX.Element|null} Vessel info card
 */
const VesselInfo = () => {
  const { selectedVessel, setSelectedVessel } = useContext(AppContext);
  if (!selectedVessel) return null;
  const v = selectedVessel;
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.name}>{v.name}</span>
        <div
          className={styles.close}
          onClick={() => setSelectedVessel(null)}
          role="button"
          aria-label="Close vessel info"
        >
          <InlineIcon icon={closeSharp} />
        </div>
      </div>
      <div className={styles.kind}>{KIND_LABEL[v.kind] || "Vessel"}</div>
      <ShipSilhouette kind={v.kind} />
      <div className={styles.grid}>
        <div>
          <span>SPEED</span>
          <strong>{v.speed != null ? `${Math.round(v.speed)} kt` : "—"}</strong>
        </div>
        <div>
          <span>COURSE</span>
          <strong>{v.course != null ? `${Math.round(v.course)}°` : "—"}</strong>
        </div>
        <div>
          <span>MMSI</span>
          <strong>{v.id}</strong>
        </div>
      </div>
      <div className={styles.note}>Live AIS · aisstream.io</div>
    </div>
  );
};

export default VesselInfo;
