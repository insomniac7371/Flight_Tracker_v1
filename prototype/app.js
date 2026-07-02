const HOME = {
  label: "Mitchell House",
  lat: 32.9190,
  lon: -80.1623,
  rangeMi: 35
};

const AIRPORTS = [
  {
    code: "PHL",
    name: "Philadelphia Intl",
    lat: 39.8719,
    lon: -75.2411,
    runway: 90
  },
  {
    code: "PNE",
    name: "Northeast Philadelphia",
    lat: 40.0819,
    lon: -75.0106,
    runway: 60
  },
  {
    code: "ILG",
    name: "Wilmington",
    lat: 39.6787,
    lon: -75.6065,
    runway: 10
  },
  {
    code: "NXX",
    name: "Willow Grove",
    lat: 40.1998,
    lon: -75.1482,
    runway: 150
  },
  {
    code: "TTN",
    name: "Trenton Mercer",
    lat: 40.2767,
    lon: -74.8135,
    runway: 60
  },
  {
    code: "CHS",
    name: "Charleston Intl",
    lat: 32.898611,
    lon: -80.040556,
    runway: 150
  },
  {
    code: "DYB",
    name: "Summerville",
    lat: 33.0634,
    lon: -80.2775,
    runway: 60
  },
  {
    code: "JZI",
    name: "Charleston Executive",
    lat: 32.7009,
    lon: -80.0029,
    runway: 90
  },
  {
    code: "LRO",
    name: "Mount Pleasant Regional",
    lat: 32.8978,
    lon: -79.7829,
    runway: 170
  },
  {
    code: "MKS",
    name: "Berkeley County",
    lat: 33.1865,
    lon: -80.0362,
    runway: 50
  }
];

const ROUTE_AIRPORTS = {
  ATL: { name: "Atlanta", lat: 33.6407, lon: -84.4277 },
  BOS: { name: "Boston", lat: 42.3656, lon: -71.0096 },
  CHS: { name: "Charleston", lat: 32.898611, lon: -80.040556 },
  CLE: { name: "Cleveland", lat: 41.4117, lon: -81.8498 },
  CMH: { name: "Columbus", lat: 39.9980, lon: -82.8919 },
  DYB: { name: "Summerville", lat: 33.0634, lon: -80.2775 },
  JZI: { name: "Charleston Executive", lat: 32.7009, lon: -80.0029 },
  LRO: { name: "Mount Pleasant", lat: 32.8978, lon: -79.7829 },
  MKS: { name: "Berkeley County", lat: 33.1865, lon: -80.0362 },
  TEB: { name: "Teterboro", lat: 40.8501, lon: -74.0608 },
  PHL: { name: "Philadelphia", lat: 39.8719, lon: -75.2411 },
  JFK: { name: "New York JFK", lat: 40.6413, lon: -73.7781 },
  LGA: { name: "New York LaGuardia", lat: 40.7769, lon: -73.8740 },
  EWR: { name: "Newark", lat: 40.6895, lon: -74.1745 },
  CLT: { name: "Charlotte", lat: 35.2144, lon: -80.9473 },
  DCA: { name: "Washington Reagan", lat: 38.8512, lon: -77.0402 },
  DEN: { name: "Denver", lat: 39.8561, lon: -104.6737 },
  DFW: { name: "Dallas/Fort Worth", lat: 32.8998, lon: -97.0403 },
  FLL: { name: "Fort Lauderdale", lat: 26.0726, lon: -80.1527 },
  IAD: { name: "Washington Dulles", lat: 38.9531, lon: -77.4565 },
  JAX: { name: "Jacksonville", lat: 30.4941, lon: -81.6879 },
  LAX: { name: "Los Angeles", lat: 33.9416, lon: -118.4085 },
  MIA: { name: "Miami", lat: 25.7959, lon: -80.2870 },
  MCO: { name: "Orlando", lat: 28.4312, lon: -81.3081 },
  ORD: { name: "Chicago O'Hare", lat: 41.9742, lon: -87.9073 },
  RIC: { name: "Richmond", lat: 37.5052, lon: -77.3197 },
  SDF: { name: "Louisville", lat: 38.1744, lon: -85.7360 },
  SFO: { name: "San Francisco", lat: 37.6213, lon: -122.3790 }
};

const ROAD_OVERLAYS = [
  {
    id: "I-26",
    type: "interstate",
    labelIndex: 1,
    points: [
      [32.781, -79.934],
      [32.883, -80.012],
      [33.019, -80.176],
      [33.492, -80.855],
      [34.000, -81.034],
      [34.949, -81.932]
    ]
  },
  {
    id: "I-95",
    type: "interstate",
    labelIndex: 2,
    points: [
      [32.083, -81.094],
      [32.905, -80.667],
      [33.187, -80.575],
      [33.922, -80.150],
      [34.195, -79.762],
      [35.052, -78.878]
    ]
  },
  {
    id: "I-526",
    type: "interstate",
    labelIndex: 1,
    points: [
      [32.817, -79.839],
      [32.878, -79.974],
      [32.881, -80.040],
      [32.809, -80.092],
      [32.789, -80.053]
    ]
  },
  {
    id: "US 17",
    type: "state",
    labelIndex: 2,
    points: [
      [32.083, -81.094],
      [32.433, -80.680],
      [32.781, -79.934],
      [33.087, -79.463],
      [33.376, -79.294]
    ]
  },
  {
    id: "US 52",
    type: "state",
    labelIndex: 1,
    points: [
      [32.789, -79.935],
      [32.934, -79.990],
      [33.018, -80.038],
      [33.196, -79.994],
      [33.664, -79.831]
    ]
  },
  {
    id: "US 78",
    type: "state",
    labelIndex: 1,
    points: [
      [32.856, -80.015],
      [33.019, -80.176],
      [33.215, -80.448],
      [33.249, -80.815]
    ]
  },
  {
    id: "SC 61",
    type: "state",
    labelIndex: 1,
    points: [
      [32.781, -79.944],
      [32.824, -80.060],
      [32.913, -80.142],
      [33.019, -80.176]
    ]
  },
  {
    id: "SC 165",
    type: "state",
    labelIndex: 1,
    points: [
      [33.019, -80.176],
      [32.940, -80.250],
      [32.831, -80.332],
      [32.704, -80.248]
    ]
  }
];

const LABEL_OFFSETS = [
  { left: 48, top: 1, angle: -28 },
  { left: 42, top: -24, angle: -48 },
  { left: 42, top: 26, angle: 24 },
  { left: -70, top: -24, angle: -150 },
  { left: -72, top: 24, angle: 150 },
  { left: 54, top: -8, angle: -12 },
  { left: -76, top: 0, angle: 180 }
];

const MAP_AIRPORT_OFFSETS = [
  { x: -18, y: -18 },
  { x: 8, y: -26 },
  { x: -24, y: 6 },
  { x: 12, y: 10 },
  { x: 28, y: -8 }
];

const WORLD_SHAPES = [
  {
    name: "North America",
    points: [[-168, 71], [-158, 62], [-145, 60], [-136, 57], [-129, 51], [-124, 45], [-124, 38], [-117, 32], [-110, 28], [-103, 22], [-96, 18], [-90, 20], [-86, 18], [-83, 24], [-81, 31], [-75, 35], [-70, 43], [-57, 48], [-52, 54], [-61, 59], [-75, 63], [-92, 63], [-97, 70], [-115, 73], [-134, 71], [-149, 73]]
  },
  {
    name: "Central America",
    points: [[-96, 18], [-90, 18], [-86, 15], [-84, 10], [-79, 9], [-77, 7], [-82, 8], [-88, 12], [-94, 14]]
  },
  {
    name: "South America",
    points: [[-81, 12], [-74, 10], [-67, 5], [-61, -5], [-54, -13], [-48, -22], [-52, -32], [-58, -39], [-65, -52], [-71, -54], [-74, -42], [-78, -30], [-81, -18], [-79, -7], [-82, 3]]
  },
  {
    name: "Greenland",
    points: [[-52, 83], [-37, 80], [-24, 73], [-29, 63], [-43, 59], [-55, 63], [-63, 72]]
  },
  {
    name: "Eurasia",
    points: [[-10, 72], [5, 70], [25, 71], [45, 67], [70, 72], [97, 72], [128, 69], [150, 62], [174, 61], [179, 53], [166, 48], [151, 46], [142, 39], [129, 35], [121, 24], [109, 22], [103, 12], [96, 8], [88, 20], [79, 21], [72, 17], [68, 24], [58, 25], [50, 30], [43, 37], [31, 36], [23, 40], [15, 44], [7, 43], [-1, 51], [-9, 54], [-24, 58], [-17, 66]]
  },
  {
    name: "Africa",
    points: [[-17, 37], [-5, 36], [11, 33], [25, 31], [34, 24], [43, 12], [50, 2], [43, -12], [35, -22], [28, -31], [18, -35], [7, -34], [-5, -28], [-13, -18], [-16, -5], [-17, 10], [-10, 23]]
  },
  {
    name: "Australia",
    points: [[113, -11], [129, -12], [143, -17], [153, -27], [147, -37], [133, -39], [118, -34], [112, -24]]
  },
  {
    name: "Madagascar",
    points: [[47, -12], [51, -18], [50, -25], [45, -24], [44, -17]]
  },
  {
    name: "Japan",
    points: [[130, 32], [136, 34], [141, 39], [145, 43], [141, 36], [135, 31]]
  },
  {
    name: "United Kingdom",
    points: [[-8, 58], [-3, 59], [1, 54], [-2, 50], [-7, 52]]
  },
  {
    name: "New Zealand",
    points: [[166, -35], [174, -41], [178, -47], [170, -45], [166, -39]]
  }
];

const WORLD_LINES = [
  [[-125, 49], [-66, 49]],
  [[-124, 32], [-82, 31]],
  [[-97, 49], [-97, 26]],
  [[-75, 45], [-80, 25]],
  [[-10, 36], [32, 31], [43, 12]],
  [[30, 66], [45, 37], [72, 17]],
  [[68, 24], [88, 20], [103, 12]],
  [[112, -11], [153, -27]]
];

const US_REGION_SHAPES = [
  {
    name: "South Carolina",
    label: [33.75, -80.9],
    points: [
      [35.21, -82.78],
      [35.18, -81.04],
      [34.99, -80.78],
      [34.82, -79.68],
      [33.85, -78.54],
      [32.08, -80.90],
      [32.03, -81.14],
      [32.87, -81.52],
      [33.50, -82.04],
      [34.47, -82.65]
    ]
  },
  {
    name: "North Carolina",
    label: [35.35, -79.8],
    points: [
      [36.55, -84.32],
      [36.55, -75.45],
      [35.25, -75.55],
      [34.72, -76.65],
      [34.99, -78.90],
      [34.82, -79.68],
      [34.99, -80.78],
      [35.18, -81.04],
      [35.21, -82.78]
    ]
  },
  {
    name: "Georgia",
    label: [32.85, -83.4],
    points: [
      [35.00, -85.61],
      [35.00, -82.99],
      [34.47, -82.65],
      [33.50, -82.04],
      [32.87, -81.52],
      [32.03, -81.14],
      [30.71, -81.48],
      [30.36, -84.86],
      [31.00, -85.00],
      [35.00, -85.61]
    ]
  },
  {
    name: "Florida",
    label: [28.6, -82.5],
    points: [
      [30.71, -81.48],
      [30.36, -84.86],
      [29.70, -85.40],
      [27.92, -82.85],
      [25.12, -81.10],
      [25.68, -80.16],
      [27.55, -80.05],
      [29.40, -81.10]
    ]
  },
  {
    name: "Virginia",
    label: [37.6, -78.5],
    points: [
      [39.46, -77.97],
      [38.93, -77.04],
      [36.55, -75.45],
      [36.55, -83.68],
      [37.20, -82.30],
      [38.60, -79.40]
    ]
  }
];

const COASTLINE_LINES = [
  [[36.55, -75.45], [35.25, -75.55], [34.72, -76.65], [33.85, -78.54], [32.08, -80.90], [30.71, -81.48], [29.40, -81.10], [27.55, -80.05], [25.68, -80.16]],
  [[40.64, -73.78], [39.87, -75.24], [38.85, -77.04], [36.85, -76.29], [35.25, -75.55]]
];

const USPS_SUFFIXES = {
  ALLEY: "ALY",
  AVENUE: "AVE",
  BOULEVARD: "BLVD",
  CIRCLE: "CIR",
  COURT: "CT",
  DRIVE: "DR",
  EXPRESSWAY: "EXPY",
  HIGHWAY: "HWY",
  LANE: "LN",
  PARKWAY: "PKWY",
  PLACE: "PL",
  PLAZA: "PLZ",
  ROAD: "RD",
  SQUARE: "SQ",
  STREET: "ST",
  TERRACE: "TER",
  TRAIL: "TRL",
  WAY: "WAY"
};

let aircraft = [];

const radar = document.querySelector("#radar");
const detailPanel = document.querySelector("#detailPanel");
const settingsPanel = document.querySelector("#settingsPanel");
const settingsButton = document.querySelector("#settingsButton");
const closeSettings = document.querySelector("#closeSettings");
const batteryStatus = document.querySelector(".battery-status");
const photoPanel = document.querySelector("#aircraftPhoto");
const rangeInput = document.querySelector("#rangeInput");
const rangeValue = document.querySelector("#rangeValue");
const sweepSpeedInput = document.querySelector("#sweepSpeedInput");
const sweepSpeedValue = document.querySelector("#sweepSpeedValue");
const sweepToggle = document.querySelector("#sweepToggle");
const roadsToggle = document.querySelector("#roadsToggle");
const radarZoomInput = document.querySelector("#radarZoomInput");
const scaleLabel = document.querySelector("#scaleLabel");
const scaleLegend = document.querySelector("#scaleLegend");
const homeNameInput = document.querySelector("#homeNameInput");
const addressInput = document.querySelector("#addressInput");
const addressSuggestions = document.querySelector("#addressSuggestions");
const cityInput = document.querySelector("#cityInput");
const stateInput = document.querySelector("#stateInput");
const postalInput = document.querySelector("#postalInput");
const latInput = document.querySelector("#latInput");
const lonInput = document.querySelector("#lonInput");
const saveLocationButton = document.querySelector("#saveLocationButton");
const makeDefaultButton = document.querySelector("#makeDefaultButton");
const locationMessage = document.querySelector("#locationMessage");
const airportToggle = document.querySelector("#airportToggle");
const mapToggle = document.querySelector("#mapToggle");
const radarMapLayer = document.querySelector("#radarMapLayer");
const flightSearch = document.querySelector("#flightSearch");
const flightSearchInput = document.querySelector("#flightSearchInput");
const radarView = document.querySelector("#radarView");
const trackMapView = document.querySelector("#trackMapView");
const radarLegend = document.querySelector("#radarLegend");
const trackFooter = document.querySelector("#trackFooter");
const backToRadarButton = document.querySelector("#backToRadarButton");
const trackZoomInput = document.querySelector("#trackZoomInput");
const zoomValue = document.querySelector("#zoomValue");
const worldMap = document.querySelector("#worldMap");
const mapRaster = document.querySelector("#mapRaster");
const mapOutlineLayer = document.querySelector("#mapOutlineLayer");
const mapRoadsLayer = document.querySelector("#mapRoadsLayer");
const mapRouteLayer = document.querySelector("#mapRouteLayer");
const routeTraveledLine = document.querySelector("#routeTraveledLine");
const routeRemainingLine = document.querySelector("#routeRemainingLine");
const mapAirports = document.querySelector("#mapAirports");
const mapTarget = document.querySelector(".map-target");
const mapTargetLabel = document.querySelector("#mapTargetLabel");
const progressDepartureCode = document.querySelector("#progressDepartureCode");
const progressDepartureName = document.querySelector("#progressDepartureName");
const progressArrivalCode = document.querySelector("#progressArrivalCode");
const progressArrivalName = document.querySelector("#progressArrivalName");
const progressArrivalEta = document.querySelector("#progressArrivalEta");
const routeProgressPercent = document.querySelector("#routeProgressPercent");
const routeProgressStatus = document.querySelector("#routeProgressStatus");
const routeProgressComplete = document.querySelector("#routeProgressComplete");
const routeProgressArcComplete = document.querySelector("#routeProgressArcComplete");
const routePlaneMarker = document.querySelector("#routePlaneMarker");
const routeProgressDistance = document.querySelector("#routeProgressDistance");
const routeProgressClock = document.querySelector("#routeProgressClock");
const mapPosition = document.querySelector("#mapPosition");
const mapRoute = document.querySelector("#mapRoute");
const mapDeparture = document.querySelector("#mapDeparture");
const mapDepartureTime = document.querySelector("#mapDepartureTime");
const mapArrival = document.querySelector("#mapArrival");
const mapArrivalTime = document.querySelector("#mapArrivalTime");
const trackFooterText = document.querySelector("#trackFooterText");
const trackSelectedButton = document.querySelector("#trackSelectedButton");
const modeEyebrow = document.querySelector("#modeEyebrow");
const titleText = document.querySelector("h1");
const homeTitleButton = document.querySelector("#homeTitleButton");
const detailNote = document.querySelector("#detailNote");
const touchKeyboard = document.querySelector("#touchKeyboard");
const keyboardRows = document.querySelector("#keyboardRows");
const keyboardTarget = document.querySelector("#keyboardTarget");
const wifiSsidInput = document.querySelector("#wifiSsidInput");
const scanWifiButton = document.querySelector("#scanWifiButton");
const clearCacheButton = document.querySelector("#clearCacheButton");

let trackRangeMi = 500;
let trackedAircraft = null;
let selectedAircraft = null;
let selectedAircraftId = "";
let activeKeyboardInput = null;
let selectedAddressSuggestion = null;
let addressSuggestTimer = null;
let liveFeedBusy = false;
const aircraftTrails = new Map();
const flightInfoCache = new Map();
const flightInfoInFlight = new Map();
const routeInfoCache = new Map();
const routeInfoInFlight = new Map();
const photoInfoCache = new Map();
const FLIGHT_INFO_CACHE_MS = 120000;
const ROUTE_INFO_CACHE_MS = 120000;
const PHOTO_INFO_CACHE_MS = 24 * 60 * 60 * 1000;
const USE_ADSBDB_ENRICHMENT = false;
const AIRLINE_PREFIXES = {
  AAL: "American Airlines",
  DAL: "Delta Air Lines",
  SWA: "Southwest Airlines",
  UAL: "United Airlines",
  JBU: "JetBlue Airways",
  FFT: "Frontier Airlines",
  NKS: "Spirit Airlines",
  ASA: "Alaska Airlines",
  JIA: "American Eagle",
  RPA: "Republic Airways",
  SKW: "SkyWest Airlines",
  EDV: "Endeavor Air",
  ENY: "Envoy Air"
};
const PRIVATE_CALLSIGN_PREFIXES = new Set(["EJA", "EJM", "JTZ", "LXJ", "NJE", "XOJ"]);

function compactAirportName(airport) {
  const city = firstText(airport.municipality);
  if (city) {
    return city;
  }
  return firstText(airport.name, airport.code)
    .replace(/\b(International|Municipal|Regional|County|Airport|Airfield|Aerodrome|Intl)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function mergeAirportDatabase(airports) {
  Object.values(airports || {}).forEach((airport) => {
    const code = String(airport.code || airport.iata || "").trim().toUpperCase();
    const lat = Number(airport.lat);
    const lon = Number(airport.lon);
    if (!code || code.length !== 3 || !Number.isFinite(lat) || !Number.isFinite(lon)) {
      return;
    }
    ROUTE_AIRPORTS[code] = {
      name: compactAirportName({ ...airport, code }),
      lat,
      lon
    };
  });
}

async function loadAirportDatabase() {
  try {
    const response = await fetch("/api/airports", {
      cache: "no-store",
      headers: { "Accept": "application/json" }
    });
    if (!response.ok) {
      throw new Error(`airport database returned ${response.status}`);
    }
    const data = await response.json();
    mergeAirportDatabase(data.airports || {});
  } catch (error) {
    console.warn("Airport database unavailable; using bundled fallback airports.", error);
  }
}

function formatAltitude(feet) {
  return Number.isFinite(feet) ? `${Math.round(feet).toLocaleString()} ft` : "No alt";
}

function formatSpeed(knots) {
  return Number.isFinite(knots) ? `${Math.round(knots)} kt` : "No spd";
}

function formatHeading(degrees) {
  return Number.isFinite(degrees) ? `${Math.round(degrees).toString().padStart(3, "0")} deg` : "---";
}

function formatDistance(nm) {
  return Number.isFinite(nm) ? `${nm.toFixed(1)} nm` : "---";
}

function inferAirlineName(item) {
  const explicit = firstText(item.airline, item.operator, item.owner);
  if (explicit) {
    return explicit;
  }
  const prefix = String(item.label || "").trim().match(/^[A-Z]{3}/)?.[0];
  return AIRLINE_PREFIXES[prefix] || "";
}

function photoModelQuery(item) {
  const model = firstText(item.aircraftType);
  if (/^[A-Z0-9]{2,5}$/i.test(model)) {
    return model.toUpperCase();
  }
  return "";
}

function photoCacheKey(item) {
  return [
    item?.icao,
    item?.registration,
    item?.label,
    item?.aircraftType
  ].filter(Boolean).join("|").toUpperCase();
}

function renderPhotoImage(item, imageUrl, source = "", generic = false) {
  const image = document.createElement("img");
  image.alt = `${item.label} aircraft photo`;
  image.src = location.protocol.startsWith("http") ? `/api/image?url=${encodeURIComponent(imageUrl)}` : imageUrl;
  photoPanel.innerHTML = "";
  photoPanel.removeAttribute("data-category");
  photoPanel.dataset.photoKey = photoCacheKey(item);
  photoPanel.appendChild(image);
  if (source || generic) {
    const badge = document.createElement("span");
    badge.className = "photo-source-badge";
    badge.textContent = generic ? `GENERIC ${source || "PHOTO"}` : source;
    photoPanel.appendChild(badge);
  }
  photoPanel.classList.add("has-image");
}

function displaySource(item) {
  if (!USE_ADSBDB_ENRICHMENT) {
    return "ADSB.lol live";
  }
  return String(item.source || "ADSB.lol live")
    .split("+")
    .map((part) => part.trim())
    .filter((part) => part && part !== "ADSBDB")
    .join(" + ") || "ADSB.lol live";
}

function ownerText(item) {
  return firstText(
    item.owner,
    item.operator,
    item.ownOp,
    item.dbOwner,
    item.dbOwnerName,
    item.rOwn,
    item.r_owner,
    item.r || item.registration ? `Reg ${item.r || item.registration}` : ""
  ) || "---";
}

function haversineMiles(a, b) {
  const lat1 = (Number(a.lat) * Math.PI) / 180;
  const lat2 = (Number(b.lat) * Math.PI) / 180;
  const deltaLat = ((Number(b.lat) - Number(a.lat)) * Math.PI) / 180;
  const deltaLon = ((Number(b.lon) - Number(a.lon)) * Math.PI) / 180;
  const sinLat = Math.sin(deltaLat / 2);
  const sinLon = Math.sin(deltaLon / 2);
  const value = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;
  return 3958.8 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function bearingDegrees(from, to) {
  const lat1 = (Number(from.lat) * Math.PI) / 180;
  const lat2 = (Number(to.lat) * Math.PI) / 180;
  const deltaLon = ((Number(to.lon) - Number(from.lon)) * Math.PI) / 180;
  const y = Math.sin(deltaLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

function angleDelta(a, b) {
  return Math.abs((((Number(a) - Number(b)) % 360) + 540) % 360 - 180);
}

function localRouteProjection(departure, arrival, current) {
  const lat0 = (Number(current.lat) * Math.PI) / 180;
  const milesPerLat = 69;
  const milesPerLon = 69 * Math.cos(lat0);
  const ax = 0;
  const ay = 0;
  const bx = (Number(arrival.lon) - Number(departure.lon)) * milesPerLon;
  const by = (Number(arrival.lat) - Number(departure.lat)) * milesPerLat;
  const px = (Number(current.lon) - Number(departure.lon)) * milesPerLon;
  const py = (Number(current.lat) - Number(departure.lat)) * milesPerLat;
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSq = dx * dx + dy * dy;
  const raw = lengthSq > 1 ? ((px - ax) * dx + (py - ay) * dy) / lengthSq : 0.5;
  const crossTrackMiles = lengthSq > 1 ? Math.abs((px - ax) * dy - (py - ay) * dx) / Math.sqrt(lengthSq) : 0;
  return {
    raw,
    percent: Math.min(0.98, Math.max(0.02, raw)),
    crossTrackMiles
  };
}

function routeLegMismatchReason(leg, current) {
  if (!leg || !Number.isFinite(Number(current.lat)) || !Number.isFinite(Number(current.lon))) {
    return "";
  }
  const maxCrossTrack = Math.min(220, Math.max(80, leg.totalMiles * 0.22));
  const tooFarFromPath = leg.projection.crossTrackMiles > maxCrossTrack;
  const tooFarBeforeDeparture = leg.projection.raw < -0.2;
  const tooFarPastArrival = leg.projection.raw > 1.2;
  if (tooFarFromPath || tooFarBeforeDeparture || tooFarPastArrival) {
    return `Route mismatch: aircraft is ${Math.round(leg.projection.crossTrackMiles)} mi off ${leg.departure.code}-${leg.arrival.code}`;
  }
  return "";
}

function formatTimeOffset(hoursFromNow) {
  if (!Number.isFinite(hoursFromNow)) {
    return "";
  }
  const date = new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function squawkDescription(code) {
  const value = String(code || "").trim();
  if (value === "1200") {
    return "VFR, no ATC service";
  }
  if (value === "7500") {
    return "Unlawful interference";
  }
  if (value === "7600") {
    return "Radio failure";
  }
  if (value === "7700") {
    return "Emergency";
  }
  if (!value || value === "---" || value === "0000") {
    return "No active beacon code";
  }
  return "Assigned beacon code";
}

function milesToNautical(miles) {
  return miles / 1.15078;
}

function updateRangeLabel() {
  const miles = Number(rangeInput.value);
  rangeValue.textContent = `${miles} mi`;
  radarZoomInput.value = String(miles);
  scaleLabel.textContent = `Range ${miles} mi`;
  scaleLegend.textContent = `${Math.max(1, Math.round(miles / 4))} mi`;
  HOME.rangeMi = miles;
}

function updateSweepSpeed() {
  const seconds = Math.min(12, Math.max(2, Number(sweepSpeedInput.value) || 5));
  sweepSpeedInput.value = String(seconds);
  sweepSpeedValue.textContent = `${seconds} sec`;
  radar.style.setProperty("--sweep-speed", `${seconds}s`);
  radar.classList.toggle("sweep-disabled", !sweepToggle.checked);
  sweepSpeedInput.disabled = !sweepToggle.checked;
}

function updateRoadsLayerVisibility() {
  mapRoadsLayer.classList.toggle("hidden", !roadsToggle.checked);
}

function currentDefaultSettings() {
  return {
    home: {
      label: HOME.label,
      lat: HOME.lat,
      lon: HOME.lon,
      rangeMi: HOME.rangeMi,
      sweepSeconds: Number(sweepSpeedInput.value) || 5,
      sweepEnabled: sweepToggle.checked,
      roadsEnabled: roadsToggle.checked,
      mapEnabled: mapToggle.checked
    }
  };
}

function applyDefaultSettings(settings) {
  const home = settings?.home || {};
  const label = String(home.label || HOME.label).trim();
  const lat = parseCoordinate(home.lat);
  const lon = parseCoordinate(home.lon);
  const range = Number(home.rangeMi);
  const sweep = Number(home.sweepSeconds);
  const sweepEnabled = home.sweepEnabled !== false;
  const roadsEnabled = home.roadsEnabled !== false;
  const mapEnabled = home.mapEnabled !== false;

  if (label) {
    HOME.label = label;
    homeNameInput.value = label;
    titleText.textContent = label;
  }
  if (Number.isFinite(lat) && lat >= -90 && lat <= 90) {
    HOME.lat = lat;
    latInput.value = lat.toFixed(5);
  }
  if (Number.isFinite(lon) && lon >= -180 && lon <= 180) {
    HOME.lon = lon;
    lonInput.value = lon.toFixed(5);
  }
  if (Number.isFinite(range)) {
    HOME.rangeMi = Math.min(100, Math.max(5, Math.round(range / 5) * 5));
    rangeInput.value = String(HOME.rangeMi);
  }
  if (Number.isFinite(sweep)) {
    sweepSpeedInput.value = String(Math.min(12, Math.max(2, Math.round(sweep))));
  }
  sweepToggle.checked = sweepEnabled;
  roadsToggle.checked = roadsEnabled;
  mapToggle.checked = mapEnabled;
}

async function loadDefaultSettings() {
  try {
    const response = await fetch("/api/settings", {
      cache: "no-store",
      headers: { "Accept": "application/json" }
    });
    if (!response.ok) {
      throw new Error(`settings returned ${response.status}`);
    }
    applyDefaultSettings(await response.json());
  } catch (error) {
    const cached = localStorage.getItem("dadFlightTrackerDefaults");
    if (cached) {
      try {
        applyDefaultSettings(JSON.parse(cached));
      } catch (parseError) {
        localStorage.removeItem("dadFlightTrackerDefaults");
      }
    }
  }
}

async function saveDefaultSettings() {
  const payload = currentDefaultSettings();
  localStorage.setItem("dadFlightTrackerDefaults", JSON.stringify(payload));
  if (!location.protocol.startsWith("http")) {
    return payload;
  }
  const response = await fetch("/api/settings", {
    method: "POST",
    cache: "no-store",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error(`settings save returned ${response.status}`);
  }
  return response.json();
}

function updateBattery(percent) {
  const bounded = Math.min(100, Math.max(0, Number(percent) || 0));
  document.querySelector(".battery-fill").style.width = `${bounded}%`;
  batteryStatus.setAttribute("aria-label", `Backup battery ${Math.round(bounded)} percent`);
  batteryStatus.classList.toggle("critical", bounded < 15);
  batteryStatus.classList.toggle("low", bounded >= 15 && bounded < 30);
}

function setRangeMiles(miles, refreshFeed = false) {
  const bounded = Math.min(100, Math.max(5, Math.round(Number(miles) / 5) * 5));
  const selectedId = getSelectedAircraftId();
  rangeInput.value = String(bounded);
  radarZoomInput.value = String(bounded);
  updateRangeLabel();
  renderRadarBasemap();
  renderAirports();
  renderTargets(selectedId);
  updateSelectedAircraftDetails(selectedId);
  if (refreshFeed) {
    startLiveFeed();
  }
}

// --- Low-detail offline basemap (state lines, coastlines, interstates) -------
// Bundled by tools/build_basemap.py into assets/basemap.json. Rendered as a
// faint reference layer under the radar targets, clipped to the current range.
const BASEMAP = { countries: [], states: [], roads: [] };

function indexBasemapFeature(points, extra = {}) {
  let minLat = 90;
  let maxLat = -90;
  let minLon = 180;
  let maxLon = -180;
  for (const [lat, lon] of points) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
  }
  return { points, minLat, maxLat, minLon, maxLon, ...extra };
}

async function loadBasemap() {
  try {
    const response = await fetch("assets/basemap.json", { cache: "no-cache" });
    if (!response.ok) {
      throw new Error(`basemap returned ${response.status}`);
    }
    const data = await response.json();
    BASEMAP.countries = (data.countries || []).map((ring) => indexBasemapFeature(ring));
    BASEMAP.states = (data.states || []).map((ring) => indexBasemapFeature(ring));
    BASEMAP.roads = (data.roads || []).map((road) => indexBasemapFeature(road.points, { name: road.name, cls: road.cls || "state" }));
  } catch (error) {
    console.warn("Basemap unavailable; radar map layer disabled.", error);
  }
}

function basemapViewBounds(margin) {
  const dLat = (HOME.rangeMi * margin) / 69;
  const cosLat = Math.abs(Math.cos((HOME.lat * Math.PI) / 180)) || 1;
  const dLon = (HOME.rangeMi * margin) / (69 * Math.max(0.2, cosLat));
  return {
    latMin: HOME.lat - dLat,
    latMax: HOME.lat + dLat,
    lonMin: HOME.lon - dLon,
    lonMax: HOME.lon + dLon
  };
}

function basemapFeatureVisible(feature, view) {
  return !(
    feature.maxLat < view.latMin ||
    feature.minLat > view.latMax ||
    feature.maxLon < view.lonMin ||
    feature.minLon > view.lonMax
  );
}

// Cohen-Sutherland region code for a [lat, lon] point against bounds.
function basemapOutcode(lat, lon, b) {
  let code = 0;
  if (lon < b.lonMin) code |= 1;
  else if (lon > b.lonMax) code |= 2;
  if (lat < b.latMin) code |= 4;
  else if (lat > b.latMax) code |= 8;
  return code;
}

// Clip a single segment to the bounds. Returns [[lat,lon],[lat,lon]] or null.
// Clipping keeps projected coordinates bounded so paths that merely pass
// through the view do not generate enormous off-screen geometry (which is slow
// to rasterize on the Pi).
function basemapClipSegment(a, b, bounds) {
  let [lat0, lon0] = a;
  let [lat1, lon1] = b;
  let code0 = basemapOutcode(lat0, lon0, bounds);
  let code1 = basemapOutcode(lat1, lon1, bounds);
  for (let guard = 0; guard < 8; guard += 1) {
    if (!(code0 | code1)) {
      return [[lat0, lon0], [lat1, lon1]];
    }
    if (code0 & code1) {
      return null;
    }
    const outside = code0 || code1;
    let lat;
    let lon;
    if (outside & 8) {
      lon = lon0 + ((lon1 - lon0) * (bounds.latMax - lat0)) / (lat1 - lat0);
      lat = bounds.latMax;
    } else if (outside & 4) {
      lon = lon0 + ((lon1 - lon0) * (bounds.latMin - lat0)) / (lat1 - lat0);
      lat = bounds.latMin;
    } else if (outside & 2) {
      lat = lat0 + ((lat1 - lat0) * (bounds.lonMax - lon0)) / (lon1 - lon0);
      lon = bounds.lonMax;
    } else {
      lat = lat0 + ((lat1 - lat0) * (bounds.lonMin - lon0)) / (lon1 - lon0);
      lon = bounds.lonMin;
    }
    if (outside === code0) {
      lat0 = lat;
      lon0 = lon;
      code0 = basemapOutcode(lat0, lon0, bounds);
    } else {
      lat1 = lat;
      lon1 = lon;
      code1 = basemapOutcode(lat1, lon1, bounds);
    }
  }
  return null;
}

// Clip a polyline to bounds, returning contiguous in-view runs of points.
function basemapClippedRuns(points, bounds) {
  const runs = [];
  let run = null;
  const epsilon = 1e-6;
  for (let i = 0; i + 1 < points.length; i += 1) {
    const segment = basemapClipSegment(points[i], points[i + 1], bounds);
    if (!segment) {
      if (run) {
        runs.push(run);
        run = null;
      }
      continue;
    }
    const [start, end] = segment;
    const last = run && run[run.length - 1];
    if (last && Math.abs(last[0] - start[0]) < epsilon && Math.abs(last[1] - start[1]) < epsilon) {
      run.push(end);
    } else {
      if (run) {
        runs.push(run);
      }
      run = [start, end];
    }
  }
  if (run) {
    runs.push(run);
  }
  return runs;
}

function basemapPath(points) {
  let d = "";
  for (let i = 0; i < points.length; i += 1) {
    const projected = projectAircraft(points[i][0], points[i][1]);
    d += `${i === 0 ? "M" : "L"}${projected.x.toFixed(2)} ${projected.y.toFixed(2)}`;
  }
  return d;
}

function renderRadarBasemap() {
  if (!radarMapLayer) {
    return;
  }
  radar.querySelectorAll(".road-label").forEach((label) => label.remove());
  if (!mapToggle.checked) {
    radarMapLayer.classList.add("hidden");
    radarMapLayer.innerHTML = "";
    return;
  }
  radarMapLayer.classList.remove("hidden");

  const view = basemapViewBounds(1.5);
  const clip = basemapViewBounds(2.6);
  const parts = [];

  const addOutlines = (features, className) => {
    features.forEach((feature) => {
      if (!basemapFeatureVisible(feature, view)) {
        return;
      }
      basemapClippedRuns(feature.points, clip).forEach((run) => {
        if (run.length >= 2) {
          parts.push(`<path class="${className}" d="${basemapPath(run)}"/>`);
        }
      });
    });
  };
  addOutlines(BASEMAP.countries, "radar-map-country");
  addOutlines(BASEMAP.states, "radar-map-state");

  // Level of detail: keep wide views readable (and the Pi fast) by dropping
  // smaller road classes as the range grows. Interstates always show; US routes
  // up to ~60 mi; state routes only when zoomed in to ~30 mi.
  const showUsRoutes = HOME.rangeMi <= 60;
  const showStateRoutes = HOME.rangeMi <= 30;
  const classPriority = { interstate: 3, us: 2, state: 1 };

  // Roads are drawn per class and labelled once per route name (longest run).
  const labelByName = new Map();
  BASEMAP.roads.forEach((feature) => {
    if (feature.cls === "us" && !showUsRoutes) {
      return;
    }
    if (feature.cls === "state" && !showStateRoutes) {
      return;
    }
    if (!basemapFeatureVisible(feature, view)) {
      return;
    }
    basemapClippedRuns(feature.points, clip).forEach((run) => {
      if (run.length < 2) {
        return;
      }
      parts.push(`<path class="radar-map-road ${feature.cls}" d="${basemapPath(run)}"/>`);
      const mid = run[Math.floor(run.length / 2)];
      const projected = projectAircraft(mid[0], mid[1]);
      if (projected.x < 8 || projected.x > 92 || projected.y < 8 || projected.y > 92) {
        return;
      }
      const existing = labelByName.get(feature.name);
      if (!existing || run.length > existing.score) {
        labelByName.set(feature.name, { x: projected.x, y: projected.y, score: run.length, cls: feature.cls });
      }
    });
  });

  radarMapLayer.innerHTML = parts.join("");

  // Place labels by priority (interstate > US > state) and skip any that would
  // overlap an already-placed label, so wider views stay readable.
  const placed = [];
  [...labelByName.entries()]
    .sort((a, b) => (classPriority[b[1].cls] - classPriority[a[1].cls]) || (b[1].score - a[1].score))
    .forEach(([name, info]) => {
      if (placed.some((other) => Math.hypot(other.x - info.x, other.y - info.y) < 7)) {
        return;
      }
      placed.push(info);
      const label = document.createElement("div");
      label.className = `road-label ${info.cls}`;
      label.style.left = `${info.x}%`;
      label.style.top = `${info.y}%`;
      label.textContent = name;
      radar.appendChild(label);
    });
}

function rectsOverlap(a, b) {
  return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}

// Common rotorcraft ICAO type designators. Used only as an exact-match set so
// fixed-wing types that merely start with "H" (e.g. the Hawker H25B jet) are
// never mistaken for helicopters.
const HELO_TYPES = new Set([
  "R22", "R44", "R66", "B06", "B06T", "B47G", "B407", "B412", "B427", "B429",
  "B430", "B505", "B204", "B205", "B206", "B210", "B212", "B222", "EC20",
  "EC25", "EC30", "EC35", "EC45", "EC55", "EC75", "AS50", "AS55", "AS65",
  "AS32", "A109", "A119", "A139", "A149", "A169", "A189", "EH10", "S76",
  "S92", "S61", "S64", "S70", "S55", "H500", "H50", "H60", "UH60", "H47",
  "CH47", "H64", "AH64", "H53", "H46", "BK17", "MD52", "MD60", "NH90",
  "LYNX", "EXPL", "GAZL", "B105"
]);

// Normalize an ADS-B emitter category to the canonical "A1".."C3" string form.
// Accepts the readsb / adsb.lol string style ("A7") as well as OpenSky's
// numeric scheme (8 = rotorcraft, 14 = UAV) so either feed classifies the same.
function emitterCategory(raw) {
  const value = String(raw ?? "").trim().toUpperCase();
  if (/^[A-C][0-7]$/.test(value)) {
    return value;
  }
  const numericMap = {
    2: "A1", 3: "A2", 4: "A3", 5: "A4", 6: "A5", 7: "A6", 8: "A7",
    9: "B1", 10: "B2", 11: "B3", 12: "B4", 14: "B6", 15: "B7"
  };
  return numericMap[Number(value)] || "";
}

function classifyAircraft(item) {
  const callsign = (item.flight || item.callsign || "").trim().toUpperCase();
  const registration = (item.r || item.registration || "").trim().toUpperCase();
  const category = emitterCategory(item.category);
  const type = (item.t || item.type || "").trim().toUpperCase();
  const prefix = callsign.match(/^[A-Z]{3}/)?.[0] || "";
  const airlineStyle = /^[A-Z]{3}[0-9]/.test(callsign);
  const dbFlags = Number(item.dbFlags ?? item.dbFlagsRaw ?? 0);
  const dbFlagText = String(item.dbFlags || item.flags || "").toLowerCase();
  const hasMilitaryFlag = (Number.isFinite(dbFlags) && (dbFlags & 1) === 1) || dbFlagText.includes("military");

  if (category === "A7" || HELO_TYPES.has(type)) {
    return { category: "helo", type: "Helicopter" };
  }

  if (category === "B6" || category === "B7") {
    return { category: "other", type: "Drone / Other" };
  }

  if (callsign.startsWith("RCH") || callsign.startsWith("ASY") || hasMilitaryFlag) {
    return { category: "mil", type: "Military" };
  }

  if (/^N[0-9]/.test(callsign) || /^N[0-9]/.test(registration)) {
    return { category: "private", type: "Private / GA" };
  }

  if (airlineStyle && PRIVATE_CALLSIGN_PREFIXES.has(prefix)) {
    return { category: "private", type: "Private / GA" };
  }

  if (airlineStyle) {
    return { category: "airliner", type: "Airliner" };
  }

  if (category === "A1" || category === "A2") {
    return { category: "private", type: "Private / GA" };
  }

  return { category: "other", type: "Unknown" };
}

function projectAircraft(lat, lon) {
  const nmPerLat = 60;
  const nmPerLon = 60 * Math.cos((HOME.lat * Math.PI) / 180);
  const eastNm = (lon - HOME.lon) * nmPerLon;
  const northNm = (lat - HOME.lat) * nmPerLat;
  const distanceNm = Math.sqrt(eastNm * eastNm + northNm * northNm);
  const scale = 42 / milesToNautical(HOME.rangeMi);
  return {
    x: 50 + eastNm * scale,
    y: 50 - northNm * scale,
    distanceNm
  };
}

function firstText(...values) {
  return values.find((value) => typeof value === "string" && value.trim())?.trim() || "";
}

function routeCodesFromText(value) {
  const matches = String(value || "").toUpperCase().match(/\b[A-Z]{3}\b/g) || [];
  return matches.filter((code, index, list) => index === 0 || code !== list[index - 1]);
}

function routeCodeChainFor(item) {
  const routeCodes = routeCodesFromText(item.route);
  if (routeCodes.filter((code) => ROUTE_AIRPORTS[code]).length >= 2) {
    return routeCodes;
  }

  const explicitCodes = routeCodesFromText([item.departure, item.arrival].filter(Boolean).join(" -> "));
  if (explicitCodes.filter((code) => ROUTE_AIRPORTS[code]).length >= 2) {
    return explicitCodes;
  }

  return [];
}

function airportFromRouteCode(code) {
  const airport = ROUTE_AIRPORTS[code];
  return airport ? { code, name: airport.name, lat: airport.lat, lon: airport.lon } : null;
}

function activeRouteLegFor(item) {
  const codes = routeCodeChainFor(item);
  if (codes.length < 2) {
    return null;
  }

  const current = { lat: Number(item.lat), lon: Number(item.lon) };
  const heading = Number(item.headingDeg);
  const legs = [];
  for (let index = 0; index < codes.length - 1; index += 1) {
    const departure = airportFromRouteCode(codes[index]);
    const arrival = airportFromRouteCode(codes[index + 1]);
    if (!departure || !arrival) {
      continue;
    }
    const totalMiles = haversineMiles(departure, arrival);
    let score = index * 3;
    let projection = { raw: index === 0 ? 0 : 1, percent: 0.5, crossTrackMiles: 9999 };
    if (Number.isFinite(current.lat) && Number.isFinite(current.lon)) {
      projection = localRouteProjection(departure, arrival, current);
      const outsidePenalty = projection.raw < -0.08
        ? Math.abs(projection.raw) * totalMiles * 0.55
        : projection.raw > 1.08
          ? (projection.raw - 1) * totalMiles * 0.55
          : 0;
      const headingPenalty = Number.isFinite(heading)
        ? angleDelta(heading, bearingDegrees(current, arrival)) * 0.45
        : 0;
      score = projection.crossTrackMiles + outsidePenalty + headingPenalty + index * 3;
    }
    legs.push({
      departure,
      arrival,
      index,
      codes,
      projection,
      totalMiles,
      score
    });
  }

  const bestLeg = legs.sort((a, b) => a.score - b.score)[0] || null;
  const mismatch = routeLegMismatchReason(bestLeg, current);
  if (mismatch) {
    return { invalid: true, reason: mismatch, codes };
  }
  return bestLeg;
}

function getFlightPlan(item) {
  const activeLeg = activeRouteLegFor(item);
  if (activeLeg && !activeLeg.invalid) {
    const fullRoute = activeLeg.codes.join(" -> ");
    return {
      departure: `${activeLeg.departure.code} ${activeLeg.departure.name}`,
      departureTime: firstText(item.departureTime, "Departure time unavailable"),
      arrival: `${activeLeg.arrival.code} ${activeLeg.arrival.name}`,
      arrivalTime: firstText(item.eta, item.arrivalTime, "ETA unavailable"),
      routeLabel: `${activeLeg.departure.code} -> ${activeLeg.arrival.code}`,
      fullRoute,
      legLabel: activeLeg.codes.length > 2 ? `Leg ${activeLeg.index + 1}/${activeLeg.codes.length - 1}` : ""
    };
  }

  const routeParts = typeof item.route === "string"
    ? item.route.split(/\s*(?:->|-|—)\s*/).map((part) => part.trim()).filter(Boolean)
    : [];
  const departure = firstText(item.departure, routeParts[0], "Not in feed");
  const arrival = firstText(item.arrival, routeParts[1], "Not in feed");
  const departureCode = airportCodeFromText(departure);
  const arrivalCode = airportCodeFromText(arrival);
  const sameAirportText = departureCode && arrivalCode && departureCode === arrivalCode;

  return {
    departure: sameAirportText ? "Not in feed" : departure,
    departureTime: firstText(item.departureTime, "Departure time unavailable"),
    arrival: sameAirportText ? "Not in feed" : arrival,
    arrivalTime: firstText(item.eta, item.arrivalTime, "ETA unavailable"),
    routeLabel: sameAirportText ? "" : routeParts.length >= 2 ? `${routeParts[0]} -> ${routeParts[1]}` : firstText(item.route, ""),
    fullRoute: sameAirportText ? "" : firstText(item.route, "")
  };
}

function flightInfoCacheKey(item) {
  return [item.icao, item.registration, item.label].filter(Boolean).join("|").toUpperCase();
}

function routeInfoCacheKey(item) {
  const callsign = String(item?.label || "").trim().toUpperCase();
  return /^[A-Z]{2,4}[0-9A-Z]{1,6}$/.test(callsign) ? callsign : "";
}

function formatAirportRouteLabel(origin, destination) {
  const originCode = origin?.iata || origin?.icao || "";
  const destinationCode = destination?.iata || destination?.icao || "";
  return originCode && destinationCode ? `${originCode} -> ${destinationCode}` : "";
}

function normalizedRouteAirport(airport, label) {
  return {
    code: airport?.iata || airport?.icao || airportCodeFromText(label),
    name: label || airport?.name || airport?.icao || airport?.iata,
    lat: Number(airport?.lat),
    lon: Number(airport?.lon)
  };
}

function airportIdentity(value, label = "") {
  const rawCode = firstText(value?.iata, value?.icao, value?.code, airportCodeFromText(label), airportCodeFromText(value?.name));
  const code = rawCode.length === 4 && rawCode.startsWith("K") ? rawCode.slice(1) : rawCode;
  return {
    code,
    lat: Number(value?.lat),
    lon: Number(value?.lon)
  };
}

function isSameAirportRoute(origin, destination, originLabel = "", destinationLabel = "") {
  const originIdentity = airportIdentity(origin, originLabel);
  const destinationIdentity = airportIdentity(destination, destinationLabel);
  if (originIdentity.code && destinationIdentity.code && originIdentity.code === destinationIdentity.code) {
    return true;
  }
  if (Number.isFinite(originIdentity.lat) && Number.isFinite(originIdentity.lon) && Number.isFinite(destinationIdentity.lat) && Number.isFinite(destinationIdentity.lon)) {
    return haversineMiles(originIdentity, destinationIdentity) < 3;
  }
  return false;
}

function validatedRouteForItem(item, origin, destination, routeInfo = {}) {
  if (!isUsableAirport(origin) || !isUsableAirport(destination)) {
    return null;
  }

  const current = { lat: Number(item.lat), lon: Number(item.lon) };
  const heading = Number(item.headingDeg);
  const labels = {
    departure: routeInfo.originLabel || [origin.iata || origin.icao, origin.municipality || origin.name].filter(Boolean).join(" "),
    arrival: routeInfo.destinationLabel || [destination.iata || destination.icao, destination.municipality || destination.name].filter(Boolean).join(" ")
  };
  if (isSameAirportRoute(origin, destination, labels.departure, labels.arrival)) {
    return {
      invalid: true,
      reason: "Route source returned the same airport for departure and arrival"
    };
  }

  const forward = {
    departure: normalizedRouteAirport(origin, labels.departure),
    arrival: normalizedRouteAirport(destination, labels.arrival),
    departureLabel: labels.departure,
    arrivalLabel: labels.arrival,
    reversed: false
  };
  const reversed = {
    departure: normalizedRouteAirport(destination, labels.arrival),
    arrival: normalizedRouteAirport(origin, labels.departure),
    departureLabel: labels.arrival,
    arrivalLabel: labels.departure,
    reversed: true
  };

  if (!Number.isFinite(current.lat) || !Number.isFinite(current.lon)) {
    return forward;
  }

  const totalMiles = haversineMiles(forward.departure, forward.arrival);
  if (!Number.isFinite(totalMiles) || totalMiles < 10) {
    return {
      invalid: true,
      reason: "Route source returned an unusable short route"
    };
  }

  const forwardProjection = localRouteProjection(forward.departure, forward.arrival, current);
  const reversedProjection = localRouteProjection(reversed.departure, reversed.arrival, current);
  const maxCrossTrack = Math.min(180, Math.max(70, totalMiles * 0.18));
  const routeIsNearby = Math.min(forwardProjection.crossTrackMiles, reversedProjection.crossTrackMiles) <= maxCrossTrack;
  const routeIsAlongPath = forwardProjection.raw > -0.15 && forwardProjection.raw < 1.15;

  if (!routeIsNearby || !routeIsAlongPath) {
    return {
      invalid: true,
      reason: `Route mismatch: aircraft is ${Math.round(forwardProjection.crossTrackMiles)} mi off ADSBDB route`
    };
  }

  if (Number.isFinite(heading)) {
    const towardArrival = angleDelta(heading, bearingDegrees(current, forward.arrival));
    const towardDeparture = angleDelta(heading, bearingDegrees(current, forward.departure));
    if (towardDeparture + 25 < towardArrival) {
      return reversed;
    }
  }

  return forward;
}

function applyFlightInfo(item, info) {
  if (!info) {
    return item;
  }

  const aircraftInfo = info.aircraft || {};
  const routeInfo = info.route || {};
  if (routeInfo && Object.keys(routeInfo).length) {
    item.routeLoading = false;
    item.routeNotFound = false;
  }
  mergeAirportDatabase(routeInfo.airports || []);
  const origin = routeInfo.origin;
  const destination = routeInfo.destination;
  const routeCodes = routeCodesFromText(routeInfo.routeLabel);
  const routeChainLabel = routeCodes.length >= 2 ? routeCodes.join(" -> ") : "";
  if (routeChainLabel) {
    item.route = routeChainLabel;
    item.routeWarning = "";
    item.routeCorrection = "";
    const activeLeg = activeRouteLegFor(item);
    if (activeLeg?.invalid) {
      item.departure = "Route unverified";
      item.arrival = "Route unverified";
      item.route = "Route unverified";
      item.routeOrigin = null;
      item.routeDestination = null;
      item.routeWarning = activeLeg.reason;
    } else if (activeLeg) {
      item.departure = `${activeLeg.departure.code} ${activeLeg.departure.name}`;
      item.arrival = `${activeLeg.arrival.code} ${activeLeg.arrival.name}`;
      item.routeOrigin = activeLeg.departure;
      item.routeDestination = activeLeg.arrival;
    } else {
      item.departure = routeCodes[0] || "";
      item.arrival = routeCodes[routeCodes.length - 1] || "";
      item.routeOrigin = null;
      item.routeDestination = null;
    }
  }

  const validatedRoute = routeChainLabel ? null : validatedRouteForItem(item, origin, destination, routeInfo);
  const routeLabel = validatedRoute && !validatedRoute.invalid
    ? `${airportCodeFromText(validatedRoute.departureLabel) || "DEP"} -> ${airportCodeFromText(validatedRoute.arrivalLabel) || "ARR"}`
    : "";

  if (routeInfo.airline) {
    item.airline = routeInfo.airline;
  }
  if (aircraftInfo.registration) {
    item.registration = aircraftInfo.registration;
  }
  if (aircraftInfo.icaoType || aircraftInfo.type) {
    item.aircraftType = aircraftInfo.icaoType || aircraftInfo.type;
  }
  if (aircraftInfo.type && (!item.type || item.type === "Unknown")) {
    item.type = aircraftInfo.type;
  }
  if (aircraftInfo.owner) {
    item.owner = aircraftInfo.owner;
  }
  if (aircraftInfo.photo || aircraftInfo.thumbnail) {
    item.photoUrl = aircraftInfo.photo || aircraftInfo.thumbnail;
  }
  if (routeLabel) {
    item.route = routeLabel;
  }
  if (validatedRoute?.invalid) {
    item.routeOrigin = null;
    item.routeDestination = null;
    item.departure = "Route unverified";
    item.arrival = "Route unverified";
    item.route = "Route unverified";
    item.routeWarning = validatedRoute.reason;
    item.routeCorrection = "";
  } else if (validatedRoute?.departureLabel) {
    item.departure = validatedRoute.departureLabel;
    item.departureTime = routeInfo.airline ? routeInfo.airline : `Route from ${info.source || "route feed"}`;
  }
  if (!validatedRoute?.invalid && validatedRoute?.arrivalLabel) {
    item.arrival = validatedRoute.arrivalLabel;
    item.eta = "ETA unavailable";
  }
  if (validatedRoute && !validatedRoute.invalid) {
    item.routeOrigin = validatedRoute.departure;
    item.routeDestination = validatedRoute.arrival;
    item.routeWarning = "";
    item.routeCorrection = validatedRoute.reversed ? "Route direction corrected from live heading" : "";
  }
  if (info.source && !String(item.source).includes(info.source)) {
    item.source = `${item.source} + ${info.source}`;
  }
  item.enriched = true;
  return item;
}

async function enrichAircraftDetails(item) {
  if (!USE_ADSBDB_ENRICHMENT) {
    return item;
  }

  if (!item || item.enriched) {
    return item;
  }

  const key = flightInfoCacheKey(item);
  if (!key) {
    return item;
  }

  if (flightInfoCache.has(key)) {
    const cached = flightInfoCache.get(key);
    if (cached && Date.now() - cached.time < FLIGHT_INFO_CACHE_MS) {
      return applyFlightInfo(item, cached.info);
    }
    flightInfoCache.delete(key);
  }

  if (flightInfoInFlight.has(key)) {
    return flightInfoInFlight.get(key);
  }

  const request = (async () => {
    const params = new URLSearchParams({
      icao: item.icao || "",
      registration: item.registration || "",
      callsign: item.label || ""
    });
    const response = await fetch(`/api/flight-info?${params.toString()}`, {
      cache: "no-store",
      headers: { "Accept": "application/json" }
    });
    if (!response.ok) {
      throw new Error(`flight info returned ${response.status}`);
    }
    const info = await response.json();
    flightInfoCache.set(key, { info, time: Date.now() });
    return applyFlightInfo(item, info);
  })();

  flightInfoInFlight.set(key, request);
  try {
    return await request;
  } catch (error) {
    flightInfoCache.delete(key);
    return item;
  } finally {
    flightInfoInFlight.delete(key);
  }
}

async function enrichRouteDetails(item) {
  if (!item || item.routeEnriched) {
    return item;
  }

  const key = routeInfoCacheKey(item);
  if (!key) {
    item.routeEnriched = true;
    item.routeNotFound = true;
    return item;
  }

  if (routeInfoCache.has(key)) {
    const cached = routeInfoCache.get(key);
    if (cached && Date.now() - cached.time < ROUTE_INFO_CACHE_MS) {
      item.routeEnriched = true;
      item.routeLoading = false;
      if (!cached.info) {
        item.routeNotFound = true;
        return item;
      }
      item.routeNotFound = false;
      return applyFlightInfo(item, cached.info);
    }
    routeInfoCache.delete(key);
  }

  if (routeInfoInFlight.has(key)) {
    item.routeLoading = true;
    return routeInfoInFlight.get(key);
  }

  item.routeLoading = true;
  item.routeNotFound = false;
  const request = (async () => {
    const params = new URLSearchParams({ callsign: key });
    const response = await fetch(`/api/route?${params.toString()}`, {
      cache: "no-store",
      headers: { "Accept": "application/json" }
    });
    if (!response.ok) {
      throw new Error(`route info returned ${response.status}`);
    }
    const info = await response.json();
    routeInfoCache.set(key, { info, time: Date.now() });
    item.routeEnriched = true;
    item.routeLoading = false;
    item.routeNotFound = false;
    return applyFlightInfo(item, info);
  })();

  routeInfoInFlight.set(key, request);
  try {
    return await request;
  } catch (error) {
    routeInfoCache.set(key, { info: null, time: Date.now() });
    item.routeEnriched = true;
    item.routeLoading = false;
    item.routeNotFound = true;
    return item;
  } finally {
    routeInfoInFlight.delete(key);
  }
}

function normalizeAdsbLol(item) {
  const lat = Number(item.lat);
  const lon = Number(item.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null;
  }

  const projection = projectAircraft(lat, lon);
  if (projection.x < 5 || projection.x > 95 || projection.y < 5 || projection.y > 95) {
    return null;
  }

  const classification = classifyAircraft(item);
  const altitudeFt = Number(item.alt_baro || item.alt_geom);
  const speedKt = Number(item.gs || item.speed);
  const headingDeg = Number(item.track || item.true_heading || item.mag_heading);
  const label = (item.flight || item.r || item.hex || "UNKNOWN").trim();

  return {
    id: item.hex || label,
    icao: item.hex || "",
    label,
    category: classification.category,
    type: classification.type,
    registration: item.r || "",
    aircraftType: item.t || "",
    route: firstText(item.route, item.desc) || (item.r ? `Reg ${item.r}` : "Route unavailable"),
    owner: firstText(item.owner, item.operator, item.ownOp, item.dbOwner, item.dbOwnerName, item.rOwn, item.r_owner),
    departure: firstText(item.from, item.origin, item.orig, item.airport_origin, item.airportOrigin),
    departureTime: firstText(item.departure_time, item.departureTime, item.dep_time),
    arrival: firstText(item.to, item.destination, item.dest, item.airport_destination, item.airportDestination),
    eta: firstText(item.eta, item.arrival_time, item.arrivalTime, item.est_arrival_time),
    altitudeFt,
    speedKt,
    headingDeg,
    lat,
    lon,
    distanceNm: projection.distanceNm,
    squawk: item.squawk || "---",
    source: "ADSB.lol live",
    x: projection.x,
    y: projection.y
  };
}

function worldPoint(lat, lon) {
  const clampedLat = Math.min(85, Math.max(-85, Number(lat) || 0));
  const latitudeRad = (clampedLat * Math.PI) / 180;
  const mercatorY = (1 - Math.log(Math.tan(latitudeRad) + 1 / Math.cos(latitudeRad)) / Math.PI) / 2;
  return {
    x: (((Number(lon) || 0) + 180) / 360) * 100,
    y: mercatorY * 100
  };
}

function formatTrackRange(value) {
  const miles = Math.round(Number(value) || 0);
  return miles >= 1000 ? `${(miles / 1000).toFixed(miles % 1000 === 0 ? 0 : 1)}K mi` : `${miles} mi`;
}

function trackMapPoint(center, lat, lon) {
  const centerLat = Number(center.lat) || HOME.lat;
  const centerLon = Number(center.lon) || HOME.lon;
  const targetLat = Number(lat) || centerLat;
  const targetLon = Number(lon) || centerLon;
  const milesPerLat = 69;
  const milesPerLon = 69 * Math.cos((centerLat * Math.PI) / 180);
  const eastMi = (targetLon - centerLon) * milesPerLon;
  const northMi = (targetLat - centerLat) * milesPerLat;
  const mapAspect = worldMap.clientWidth && worldMap.clientHeight ? worldMap.clientWidth / worldMap.clientHeight : 1.38;
  return {
    x: 50 + (eastMi / (trackRangeMi * mapAspect)) * 50,
    y: 50 - (northMi / trackRangeMi) * 50
  };
}

function isPointVisible(point, margin = 6) {
  return point.x >= -margin && point.x <= 100 + margin && point.y >= -margin && point.y <= 100 + margin;
}

function pointsToTrackPath(points, center) {
  return points
    .map(([lat, lon], index) => {
      const point = trackMapPoint(center, lat, lon);
      return `${index ? "L" : "M"} ${point.x.toFixed(3)} ${point.y.toFixed(3)}`;
    })
    .join(" ");
}

function airportCodeFromText(value) {
  return (value || "").match(/\b[A-Z]{3}\b/)?.[0] || "";
}

function isUsableAirport(value) {
  return value && Number.isFinite(Number(value.lat)) && Number.isFinite(Number(value.lon));
}

function routeEndpointsFor(item) {
  const activeLeg = activeRouteLegFor(item);
  if (activeLeg?.invalid) {
    return null;
  }
  if (activeLeg) {
    return {
      departure: activeLeg.departure,
      arrival: activeLeg.arrival,
      activeLeg
    };
  }

  if (isUsableAirport(item.routeOrigin) && isUsableAirport(item.routeDestination)) {
    const endpoints = {
      departure: item.routeOrigin,
      arrival: item.routeDestination
    };
    return isSameAirportRoute(endpoints.departure, endpoints.arrival, item.departure, item.arrival) ? null : endpoints;
  }

  const plan = getFlightPlan(item);
  const depCode = airportCodeFromText(plan.departure);
  const arrCode = airportCodeFromText(plan.arrival);
  const departure = ROUTE_AIRPORTS[depCode];
  const arrival = ROUTE_AIRPORTS[arrCode];
  if (!departure || !arrival || depCode === arrCode || isSameAirportRoute(departure, arrival, depCode, arrCode)) {
    return null;
  }
  return { departure, arrival };
}

function applyEstimatedRouteTimes(item) {
  const endpoints = routeEndpointsFor(item);
  const speedMph = Number(item.speedKt) * 1.15078;
  if (item.routeWarning || !endpoints || !Number.isFinite(speedMph) || speedMph < 30 || !Number.isFinite(Number(item.lat)) || !Number.isFinite(Number(item.lon))) {
    return;
  }

  const current = { lat: Number(item.lat), lon: Number(item.lon) };
  const totalMiles = haversineMiles(endpoints.departure, endpoints.arrival);
  if (!Number.isFinite(totalMiles) || totalMiles < 10) {
    return;
  }
  const projected = localRouteProjection(endpoints.departure, endpoints.arrival, current);
  const traveledMiles = totalMiles * projected.percent;
  const remainingMiles = haversineMiles(current, endpoints.arrival);
  const departed = formatTimeOffset(-(traveledMiles / speedMph));
  const arrival = formatTimeOffset(remainingMiles / speedMph);
  if (departed) {
    item.departureTime = `Est departed ${departed}`;
  }
  if (arrival) {
    item.eta = `Est arrival ${arrival}`;
  }
}

function routeNameParts(label, fallbackCode) {
  const text = firstText(label, fallbackCode, "Not in feed");
  const code = airportCodeFromText(text) || fallbackCode || text.slice(0, 3).toUpperCase();
  const name = text
    .replace(new RegExp(`^${code}\\b\\s*[-:]*\\s*`, "i"), "")
    .replace(/\s+/g, " ")
    .trim();
  return {
    code,
    name: name || (code === "DEP" || code === "ARR" ? "Not in feed" : text)
  };
}

function routeCardLabel(label, fallbackCode) {
  const parts = routeNameParts(label, fallbackCode);
  if (parts.name === "Not in feed" || parts.code === fallbackCode) {
    return "---";
  }
  return parts.name && parts.name !== parts.code ? `${parts.code} ${parts.name}` : parts.code;
}

function routeMissingText(item) {
  return item?.routeLoading ? "Loading..." : "Not found";
}

function routeCardValue(item, label, fallbackCode) {
  const value = routeCardLabel(label, fallbackCode);
  return value === "---" ? routeMissingText(item) : value;
}

function destinationEtaText(item, plan, hasRoute) {
  if (item?.routeLoading && !hasRoute) {
    return "ETA loading";
  }
  if (!hasRoute) {
    return "ETA not found";
  }

  const raw = firstText(plan?.arrivalTime, item?.eta, item?.arrivalTime, "");
  if (!raw || /unavailable|not found|not in feed/i.test(raw)) {
    return "ETA not found";
  }

  return raw
    .replace(/^est(?:imated)?\s+arrival\s*/i, "ETA ")
    .replace(/^arrival\s*/i, "ETA ")
    .replace(/^eta\s*/i, "ETA ")
    .trim();
}

function routeProgressFor(item) {
  const endpoints = routeEndpointsFor(item);
  const current = {
    lat: Number(item.lat),
    lon: Number(item.lon)
  };

  if (item.routeWarning || !endpoints || !Number.isFinite(current.lat) || !Number.isFinite(current.lon)) {
    return {
      hasRoute: false,
      percent: 0.5,
      totalMiles: null,
      traveledMiles: null,
      remainingMiles: null,
      warning: item.routeWarning || ""
    };
  }

  const totalMiles = haversineMiles(endpoints.departure, endpoints.arrival);
  const projected = localRouteProjection(endpoints.departure, endpoints.arrival, current);
  const traveledMiles = totalMiles * projected.percent;
  const remainingMiles = haversineMiles(current, endpoints.arrival);
  const percent = totalMiles > 1 ? projected.percent : 0.5;

  return {
    hasRoute: true,
    percent,
    totalMiles,
    traveledMiles,
    remainingMiles
  };
}

function updateRouteProgress(item) {
  const plan = getFlightPlan(item);
  const departure = routeNameParts(plan.departure, "DEP");
  const arrival = routeNameParts(plan.arrival, "ARR");
  const progress = routeProgressFor(item);
  const percentLabel = Math.round(progress.percent * 100);
  const hasRoute = progress.hasRoute;
  const routeLoading = item.routeLoading && !hasRoute;

  progressDepartureCode.textContent = hasRoute ? departure.code : routeLoading ? "LOAD" : "LIVE";
  progressDepartureName.textContent = hasRoute ? departure.name : routeLoading ? "Route lookup" : "Position";
  progressArrivalCode.textContent = hasRoute ? arrival.code : routeLoading ? "..." : "DEST";
  progressArrivalName.textContent = hasRoute ? arrival.name : routeMissingText(item);
  progressArrivalEta.textContent = destinationEtaText(item, plan, hasRoute);
  routeProgressPercent.textContent = hasRoute ? `${percentLabel}%` : "--";
  routeProgressStatus.textContent = routeLoading ? "LOADING" : progress.warning ? "ROUTE CHECK" : item.routeCorrection ? "CORRECTED" : hasRoute ? "EN ROUTE" : "LIVE TRACK";
  routeProgressComplete.style.width = `${progress.percent * 100}%`;
  routeProgressArcComplete.style.clipPath = `inset(0 ${100 - progress.percent * 100}% 0 0)`;
  routePlaneMarker.style.left = `${progress.percent * 100}%`;
  routePlaneMarker.style.bottom = `${18 + Math.sin(Math.PI * progress.percent) * 210}px`;
  routePlaneMarker.style.setProperty("--route-plane-angle", `${(0.5 - progress.percent) * 34}deg`);
  routePlaneMarker.className = `route-plane-marker ${item.category || "other"}`;

  if (hasRoute) {
    const remaining = Math.max(0, Math.round(progress.remainingMiles));
    const total = Math.max(1, Math.round(progress.totalMiles));
    routeProgressDistance.textContent = item.routeCorrection || `${remaining.toLocaleString()} mi remaining / ${total.toLocaleString()} mi route`;
    if (plan.legLabel || (plan.fullRoute && plan.fullRoute !== plan.routeLabel)) {
      routeProgressDistance.textContent = `${plan.legLabel || "Active leg"} | ${routeProgressDistance.textContent}`;
    }
    mapPosition.textContent = `${Math.round(progress.traveledMiles).toLocaleString()} mi flown`;
  } else {
    const liveFacts = [formatHeading(item.headingDeg), formatSpeed(item.speedKt), formatAltitude(item.altitudeFt)]
      .filter((value) => value && value !== "---")
      .join(" | ");
    routeProgressDistance.textContent = routeLoading ? "Looking up origin and destination..." : progress.warning || liveFacts || "Live position only";
    mapPosition.textContent = `${(Number(item.lat) || HOME.lat).toFixed(4)} / ${(Number(item.lon) || HOME.lon).toFixed(4)}`;
  }

  routeProgressClock.textContent = !hasRoute
    ? routeLoading ? "Checking ADSB.lol route service" : "Origin/destination not found"
    : plan.fullRoute && plan.fullRoute !== plan.routeLabel
      ? plan.fullRoute
      : `${plan.departureTime} | ${plan.arrivalTime}`;
}

function setRouteLine(line, from, to) {
  line.setAttribute("x1", from.x.toFixed(3));
  line.setAttribute("y1", from.y.toFixed(3));
  line.setAttribute("x2", to.x.toFixed(3));
  line.setAttribute("y2", to.y.toFixed(3));
}

function clearRouteExtras() {
  mapRouteLayer.querySelectorAll(".route-endpoint, .route-endpoint-label").forEach((node) => node.remove());
}

function addRouteEndpoint(point, label, anchor = "start") {
  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("class", "route-endpoint");
  circle.setAttribute("cx", point.x.toFixed(3));
  circle.setAttribute("cy", point.y.toFixed(3));
  circle.setAttribute("r", "1.15");
  mapRouteLayer.appendChild(circle);

  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("class", "route-endpoint-label");
  text.setAttribute("x", (point.x + (anchor === "end" ? -1.6 : 1.6)).toFixed(3));
  text.setAttribute("y", (point.y - 1.8).toFixed(3));
  text.setAttribute("text-anchor", anchor === "end" ? "end" : "start");
  text.textContent = label;
  mapRouteLayer.appendChild(text);
}

function renderOutlineOverlay(center) {
  mapOutlineLayer.innerHTML = "";
  US_REGION_SHAPES.forEach((shape) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("class", "map-outline");
    path.setAttribute("d", `${pointsToTrackPath(shape.points, center)} Z`);
    mapOutlineLayer.appendChild(path);

    const labelPoint = trackMapPoint(center, shape.label[0], shape.label[1]);
    if (isPointVisible(labelPoint, 2)) {
      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("class", "map-area-label");
      label.setAttribute("x", labelPoint.x.toFixed(3));
      label.setAttribute("y", labelPoint.y.toFixed(3));
      label.textContent = shape.name;
      mapOutlineLayer.appendChild(label);
    }
  });

  COASTLINE_LINES.forEach((line) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("class", "map-boundary");
    path.setAttribute("d", pointsToTrackPath(line, center));
    mapOutlineLayer.appendChild(path);
  });
}

function renderRoadOverlay(center = trackedAircraft || selectedAircraft || HOME) {
  mapRoadsLayer.innerHTML = "";
  ROAD_OVERLAYS.forEach((road) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("class", `map-road ${road.type}`);
    path.setAttribute("d", pointsToTrackPath(road.points, center));
    mapRoadsLayer.appendChild(path);

    const labelPoint = road.points[Math.min(road.points.length - 1, road.labelIndex || 0)];
    const projected = trackMapPoint(center, labelPoint[0], labelPoint[1]);
    if (!isPointVisible(projected, 2)) {
      return;
    }
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("class", "map-road-label");
    label.setAttribute("x", projected.x.toFixed(3));
    label.setAttribute("y", projected.y.toFixed(3));
    label.textContent = road.id;
    mapRoadsLayer.appendChild(label);
  });
  updateRoadsLayerVisibility();
}

function updateRouteLines(item) {
  const endpoints = routeEndpointsFor(item);
  mapRouteLayer.classList.toggle("has-route", Boolean(endpoints));
  clearRouteExtras();
  if (!endpoints) {
    setRouteLine(routeTraveledLine, { x: 0, y: 0 }, { x: 0, y: 0 });
    setRouteLine(routeRemainingLine, { x: 0, y: 0 }, { x: 0, y: 0 });
    return;
  }

  const departure = trackMapPoint(item, endpoints.departure.lat, endpoints.departure.lon);
  const current = trackMapPoint(item, Number(item.lat) || HOME.lat, Number(item.lon) || HOME.lon);
  const arrival = trackMapPoint(item, endpoints.arrival.lat, endpoints.arrival.lon);
  const plan = getFlightPlan(item);
  setRouteLine(routeTraveledLine, departure, current);
  setRouteLine(routeRemainingLine, current, arrival);
  addRouteEndpoint(departure, airportCodeFromText(plan.departure) || "DEP");
  addRouteEndpoint(arrival, airportCodeFromText(plan.arrival) || "ARR", "end");
}

function updateMapTransform(item) {
  mapRaster.removeAttribute("style");
  mapOutlineLayer.removeAttribute("style");
  mapRoadsLayer.removeAttribute("style");
  mapRouteLayer.removeAttribute("style");
  mapOutlineLayer.innerHTML = "";
  mapRoadsLayer.innerHTML = "";
  mapAirports.innerHTML = "";
  clearRouteExtras();
  setRouteLine(routeTraveledLine, { x: 0, y: 0 }, { x: 0, y: 0 });
  setRouteLine(routeRemainingLine, { x: 0, y: 0 }, { x: 0, y: 0 });
  mapRouteLayer.classList.remove("has-route");
  worldMap.style.setProperty("--map-grid-size", "36px");
  mapTarget.style.setProperty("--map-target-x", "50%");
  mapTarget.style.setProperty("--map-target-y", "50%");
  zoomValue.textContent = formatTrackRange(trackRangeMi);
  trackZoomInput.value = String(trackRangeMi);
  updateRouteProgress(item);
}

function showTrackMap(item, options = {}) {
  const { closeSettingsOnOpen = true } = options;
  applyEstimatedRouteTimes(item);
  trackedAircraft = item;
  radarView.classList.add("hidden");
  radarLegend.classList.add("hidden");
  trackMapView.classList.remove("hidden");
  trackFooter.classList.remove("hidden");
  if (closeSettingsOnOpen) {
    settingsPanel.classList.add("hidden");
  }

  mapTargetLabel.textContent = item.label;
  mapPosition.textContent = `${(Number(item.lat) || HOME.lat).toFixed(4)} / ${(Number(item.lon) || HOME.lon).toFixed(4)}`;
  const flightPlan = getFlightPlan(item);
  mapRoute.textContent = flightPlan.fullRoute || flightPlan.routeLabel || item.route;
  mapDeparture.textContent = flightPlan.departure;
  mapDepartureTime.textContent = flightPlan.departureTime;
  mapArrival.textContent = flightPlan.arrival;
  mapArrivalTime.textContent = flightPlan.arrivalTime;
  trackFooterText.textContent = `Tracking progress for ${item.label}`;
  modeEyebrow.textContent = "TRACK PROGRESS";
  titleText.textContent = item.label;
  detailNote.textContent = "Progress follows the flight from DEP to ARR.";
  updateMapTransform(item);
  selectAircraft(item);
  if (!item.enriched) {
    enrichAircraftDetails(item).then((enriched) => {
      if (trackedAircraft && trackedAircraft.id === enriched.id && enriched.enriched) {
        trackedAircraft = enriched;
        showTrackMap(enriched, { closeSettingsOnOpen: false });
      }
    });
  }
}

function showRadar() {
  trackMapView.classList.add("hidden");
  trackFooter.classList.add("hidden");
  radarView.classList.remove("hidden");
  radarLegend.classList.remove("hidden");
  modeEyebrow.textContent = "HOME RADAR";
  titleText.textContent = HOME.label;
  detailNote.textContent = "Radar origin stays fixed on the saved address.";
}

function findAircraft(query) {
  const needle = query.trim().toUpperCase();
  if (!needle) {
    return null;
  }
  return aircraft.find((item) => {
    return [
      item.label,
      item.registration,
      item.icao,
      item.aircraftType
    ].some((value) => (value || "").toUpperCase().includes(needle));
  }) || null;
}

function getSelectedAircraftId() {
  return selectedAircraftId || selectedAircraft?.id || "";
}

function updateSelectedAircraftDetails(selectedId) {
  const item = aircraft.find((candidate) => candidate.id === selectedId);
  if (item) {
    selectAircraft(item, null, false);
  }
}

function markSelectedTarget(id) {
  document.querySelectorAll(".target").forEach((node) => {
    node.classList.toggle("selected", node.dataset.aircraftId === id);
  });
}

function selectAircraftById(id, target = null) {
  const item = aircraft.find((candidate) => candidate.id === id);
  if (!item) {
    clearSelectedAircraft();
    return;
  }
  selectAircraft(item, target);
}

function clearSelectedAircraft() {
  selectedAircraft = null;
  selectedAircraftId = "";
  markSelectedTarget("");
  trackSelectedButton.textContent = "";
  trackSelectedButton.setAttribute("aria-label", "Track selected aircraft");
  trackSelectedButton.setAttribute("title", "Select an aircraft to track");
  trackSelectedButton.disabled = true;
  photoPanel.className = "aircraft-photo";
  photoPanel.removeAttribute("data-category");
  photoPanel.removeAttribute("data-photo-key");
  photoPanel.innerHTML = "<span>SELECT AIRCRAFT</span>";
  document.querySelector("#aircraftType").textContent = "NO TARGET";
  document.querySelector("#aircraftTitle").textContent = "No aircraft";
  document.querySelector("#aircraftRoute").textContent = "Tap a target on radar";
  document.querySelector("#altitude").textContent = "---";
  document.querySelector("#speed").textContent = "---";
  document.querySelector("#heading").textContent = "---";
  document.querySelector("#origin").textContent = "---";
  document.querySelector("#squawk").textContent = "---";
  document.querySelector("#squawkMeaning").textContent = "No beacon selected";
  document.querySelector("#destination").textContent = "---";
  document.querySelector("#airframe").textContent = "---";
  document.querySelector("#owner").textContent = "---";
  detailPanel.dataset.category = "";
  detailNote.textContent = "Select an aircraft target to view details.";
}

function nearestAircraftFromPointer(event) {
  const rect = radar.getBoundingClientRect();
  const xPercent = ((event.clientX - rect.left) / rect.width) * 100;
  const yPercent = ((event.clientY - rect.top) / rect.height) * 100;
  const pxPerPercent = Math.min(rect.width, rect.height) / 100;
  let nearest = null;
  let nearestDistance = Infinity;

  aircraft.forEach((item) => {
    if (!Number.isFinite(item.x) || !Number.isFinite(item.y) || item.x < 5 || item.x > 95 || item.y < 5 || item.y > 95) {
      return;
    }
    const dx = (item.x - xPercent) * pxPerPercent;
    const dy = (item.y - yPercent) * pxPerPercent;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < nearestDistance) {
      nearest = item;
      nearestDistance = distance;
    }
  });

  return nearestDistance <= 38 ? nearest : null;
}

function getTargetOffset(item, labelBoxes) {
  for (const offset of LABEL_OFFSETS) {
    const left = item.x + offset.left / 3.9;
    const top = item.y + offset.top / 3.9;
    const box = {
      left,
      top,
      right: left + 20,
      bottom: top + 10
    };
    if (!labelBoxes.some((existing) => rectsOverlap(existing, box))) {
      labelBoxes.push(box);
      return { ...offset, compact: false };
    }
  }

  const fallback = LABEL_OFFSETS[labelBoxes.length % LABEL_OFFSETS.length];
  labelBoxes.push({
    left: item.x + fallback.left / 3.9,
    top: item.y + fallback.top / 3.9,
    right: item.x + fallback.left / 3.9 + 15,
    bottom: item.y + fallback.top / 3.9 + 6
  });
  return { ...fallback, compact: true };
}

function rememberTrailPoint(item) {
  if (!Number.isFinite(item.x) || !Number.isFinite(item.y)) {
    return [];
  }
  const key = item.id || item.label;
  const points = aircraftTrails.get(key) || [];
  if (!points.length) {
    const heading = ((Number(item.headingDeg) || 0) * Math.PI) / 180;
    const dx = Math.sin(heading) * 1.4;
    const dy = -Math.cos(heading) * 1.4;
    for (let index = 4; index >= 1; index -= 1) {
      points.push({ x: item.x - dx * index, y: item.y - dy * index });
    }
  }
  const last = points[points.length - 1];
  if (!last || Math.abs(last.x - item.x) > 0.15 || Math.abs(last.y - item.y) > 0.15) {
    points.push({ x: item.x, y: item.y });
  }
  const trimmed = points.slice(-5);
  aircraftTrails.set(key, trimmed);
  return trimmed;
}

function renderTrail(item, points) {
  points.slice(0, -1).forEach((point, index) => {
    const next = points[index + 1];
    const dx = next.x - point.x;
    const dy = next.y - point.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length < 0.1) {
      return;
    }
    const trail = document.createElement("span");
    trail.className = `target-trail ${item.category}`;
    trail.style.left = `${point.x}%`;
    trail.style.top = `${point.y}%`;
    trail.style.width = `${length}%`;
    trail.style.opacity = String(0.18 + index * 0.12);
    trail.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
    radar.appendChild(trail);
  });
}

function standardizeStreetSuffix(street) {
  const parts = street.trim().split(/\s+/);
  if (!parts.length) {
    return street.trim();
  }
  const last = parts[parts.length - 1].toUpperCase().replace(/\./g, "");
  if (USPS_SUFFIXES[last]) {
    parts[parts.length - 1] = USPS_SUFFIXES[last];
  }
  return parts.join(" ");
}

function parseCoordinate(value) {
  if (value === null || value === undefined || String(value).trim() === "") {
    return NaN;
  }
  return Number(value);
}

function hasSuggestionCoordinates(suggestion) {
  return Number.isFinite(parseCoordinate(suggestion?.lat)) && Number.isFinite(parseCoordinate(suggestion?.lon));
}

function isApproximateSuggestion(suggestion) {
  return suggestion?.accuracy === "approximate" || /approximate/i.test(suggestion?.standard || "");
}

function buildAddressParts() {
  const street = standardizeStreetSuffix(addressInput.value);
  const city = cityInput.value.trim();
  const state = stateInput.value.trim();
  const postal = postalInput.value.trim();
  const streetLooksComplete = street.includes(",");
  const query = streetLooksComplete
    ? street
    : [street, city, state, postal].filter(Boolean).join(", ");

  return {
    street,
    city: streetLooksComplete ? "" : city,
    state: streetLooksComplete ? "" : state,
    postal: streetLooksComplete ? "" : postal,
    query
  };
}

function hideAddressSuggestions() {
  addressSuggestions.classList.add("hidden");
  addressSuggestions.innerHTML = "";
}

function renderAddressSuggestions(suggestions) {
  addressSuggestions.innerHTML = "";
  if (!suggestions.length) {
    hideAddressSuggestions();
    return;
  }

  suggestions.forEach((suggestion) => {
    const button = document.createElement("button");
    const label = document.createElement("strong");
    const secondary = document.createElement("span");
    button.type = "button";
    button.className = "address-suggestion";
    label.textContent = suggestion.label || suggestion.street || "Address";
    secondary.textContent = hasSuggestionCoordinates(suggestion)
      ? `${suggestion.secondary || suggestion.display_name} | ${isApproximateSuggestion(suggestion) ? "approximate area" : "verified coordinates"}`
      : `${suggestion.secondary || suggestion.display_name || "US address candidate"} | standardized`;
    button.append(label, secondary);
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      selectAddressSuggestion(suggestion);
    });
    addressSuggestions.appendChild(button);
  });
  addressSuggestions.classList.remove("hidden");
}

async function fetchAddressSuggestions() {
  const street = addressInput.value.trim();
  if (street.length < 4 || street.includes(",")) {
    hideAddressSuggestions();
    return;
  }

  const params = new URLSearchParams();
  params.set("q", standardizeStreetSuffix(street));
  if (cityInput.value.trim()) {
    params.set("city", cityInput.value.trim());
  }
  if (stateInput.value.trim()) {
    params.set("state", stateInput.value.trim());
  }
  if (postalInput.value.trim()) {
    params.set("postal", postalInput.value.trim());
  }

  try {
    const response = await fetch(`/api/address-suggest?${params.toString()}`, {
      cache: "no-store",
      headers: { "Accept": "application/json" }
    });
    if (!response.ok) {
      throw new Error(`Address suggestions returned ${response.status}`);
    }
    const data = await response.json();
    renderAddressSuggestions(data.suggestions || []);
  } catch (error) {
    hideAddressSuggestions();
    setLocationMessage("Address suggestions unavailable. Manual lookup still works.", "warn");
  }
}

function scheduleAddressSuggestions() {
  selectedAddressSuggestion = null;
  window.clearTimeout(addressSuggestTimer);
  addressSuggestTimer = window.setTimeout(fetchAddressSuggestions, 450);
}

function refreshAddressSuggestionsSoon() {
  window.clearTimeout(addressSuggestTimer);
  addressSuggestTimer = window.setTimeout(fetchAddressSuggestions, 120);
}

function selectAddressSuggestion(suggestion) {
  selectedAddressSuggestion = suggestion;
  addressInput.value = suggestion.street || suggestion.label || addressInput.value;
  cityInput.value = suggestion.city || cityInput.value;
  stateInput.value = suggestion.state || stateInput.value;
  postalInput.value = suggestion.postal || postalInput.value;
  const lat = parseCoordinate(suggestion.lat);
  const lon = parseCoordinate(suggestion.lon);
  if (Number.isFinite(lat) && Number.isFinite(lon)) {
    latInput.value = lat.toFixed(5);
    lonInput.value = lon.toFixed(5);
    setLocationMessage(
      `${isApproximateSuggestion(suggestion) ? "Approximate area selected" : "Selected standardized address"}: ${suggestion.display_name || suggestion.label}`,
      "good"
    );
  } else {
    setLocationMessage("Standardized address selected. Tap Update address to look up coordinates.", "good");
  }
  hideAddressSuggestions();
}

function setLocationMessage(message, state = "") {
  locationMessage.textContent = message;
  locationMessage.classList.toggle("good-text", state === "good");
  locationMessage.classList.toggle("warn-text", state === "warn");
}

async function geocodeAddress(parts) {
  if (!parts.query) {
    throw new Error("Address is empty");
  }

  const params = new URLSearchParams();
  params.set("q", parts.query);
  if (parts.street && !parts.street.includes(",")) {
    params.set("street", parts.street);
  }
  if (parts.city) {
    params.set("city", parts.city);
  }
  if (parts.state) {
    params.set("state", parts.state);
  }
  if (parts.postal) {
    params.set("postal", parts.postal);
  }

  const url = location.protocol.startsWith("http")
    ? `/api/geocode?${params.toString()}`
    : `https://nominatim.openstreetmap.org/search?${params.toString()}&format=jsonv2&addressdetails=1&limit=1&countrycodes=us`;
  const response = await fetch(url, {
    cache: "no-store",
    headers: { "Accept": "application/json" }
  });
  if (!response.ok) {
    throw new Error(`Address lookup returned ${response.status}`);
  }

  const data = await response.json();
  const result = Array.isArray(data) ? data[0] : data;
  const lat = Number(result?.lat);
  const lon = Number(result?.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw new Error("Address lookup did not return coordinates");
  }

  return {
    lat,
    lon,
    displayName: result.display_name || parts.query,
    accuracy: result.accuracy || ""
  };
}

function applyHomeLocation(lat, lon) {
  HOME.lat = lat;
  HOME.lon = lon;
  latInput.value = lat.toFixed(5);
  lonInput.value = lon.toFixed(5);
  renderRadarBasemap();
  startLiveFeed();
}

function keyboardLayoutFor(input) {
  if (input.type === "number" || input.inputMode === "numeric") {
    return [
      ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
      ["-", ".", "Back", "Clear", "Done"]
    ];
  }

  return [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M", ".", "-"],
    ["Space", "Back", "Clear", "Done"]
  ];
}

function redrawKeyboard(input) {
  keyboardRows.innerHTML = "";
  keyboardTarget.textContent = input.getAttribute("aria-label") || input.placeholder || input.id || "Input";

  keyboardLayoutFor(input).forEach((rowKeys) => {
    const row = document.createElement("div");
    row.className = "keyboard-row";
    rowKeys.forEach((key) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `keyboard-key${key.length > 1 ? " wide action" : ""}`;
      button.textContent = key;
      button.dataset.key = key;
      row.appendChild(button);
    });
    keyboardRows.appendChild(row);
  });
}

function setInputValue(input, value) {
  input.value = value;
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

function showKeyboard(input) {
  activeKeyboardInput = input;
  redrawKeyboard(input);
  document.body.classList.add("keyboard-open");
  touchKeyboard.classList.remove("hidden");
}

function hideKeyboard() {
  touchKeyboard.classList.add("hidden");
  document.body.classList.remove("keyboard-open");
  activeKeyboardInput = null;
}

function pressKeyboardKey(key) {
  if (!activeKeyboardInput) {
    return;
  }

  if (key === "Done") {
    activeKeyboardInput.dispatchEvent(new Event("change", { bubbles: true }));
    hideKeyboard();
    return;
  }

  if (key === "Clear") {
    setInputValue(activeKeyboardInput, "");
    return;
  }

  if (key === "Back") {
    setInputValue(activeKeyboardInput, activeKeyboardInput.value.slice(0, -1));
    return;
  }

  const next = key === "Space" ? " " : key;
  setInputValue(activeKeyboardInput, `${activeKeyboardInput.value}${next}`);
}

async function fetchLiveAircraft() {
  const url = location.protocol.startsWith("http")
    ? `/api/aircraft?lat=${HOME.lat}&lon=${HOME.lon}&dist=${milesToNautical(HOME.rangeMi).toFixed(1)}`
    : `https://api.adsb.lol/v2/lat/${HOME.lat}/lon/${HOME.lon}/dist/${milesToNautical(HOME.rangeMi).toFixed(1)}`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Aircraft feed returned ${response.status}`);
  }
  const data = await response.json();
  return {
    aircraft: (data.ac || [])
      .map(normalizeAdsbLol)
      .filter(Boolean)
      .slice(0, 18),
    source: data.source || ""
  };
}

const feedStatusEl = document.getElementById("feedStatus");

// Short label for the status pill based on which provider answered.
function feedLabel(source) {
  return /opensky/i.test(source || "") ? "OpenSky" : "ADS-B Live";
}

function setFeedStatus(text, state) {
  if (!feedStatusEl) {
    return;
  }
  feedStatusEl.textContent = text;
  feedStatusEl.classList.toggle("good", state === "good");
  feedStatusEl.classList.toggle("warn", state === "warn");
  feedStatusEl.classList.toggle("bad", state === "bad");
}

function renderTargets(selectedId = selectedAircraftId) {
  radar.querySelectorAll(".target").forEach((target) => target.remove());
  radar.querySelectorAll(".target-trail").forEach((trail) => trail.remove());
  const labelBoxes = [];

  aircraft.forEach((item) => {
    if (Number.isFinite(Number(item.lat)) && Number.isFinite(Number(item.lon))) {
      const projection = projectAircraft(Number(item.lat), Number(item.lon));
      item.x = projection.x;
      item.y = projection.y;
      item.distanceNm = projection.distanceNm;
    }

    if (item.x < 5 || item.x > 95 || item.y < 5 || item.y > 95) {
      return;
    }

    const trailPoints = rememberTrailPoint(item);
    renderTrail(item, trailPoints);

    const offset = getTargetOffset(item, labelBoxes);
    const target = document.createElement("button");
    const isSelected = item.id === selectedId;
    target.className = `target ${item.category}${isSelected ? " selected" : ""}${offset.compact ? " compact" : ""}`;
    target.dataset.aircraftId = item.id;
    target.style.left = `${item.x}%`;
    target.style.top = `${item.y}%`;
    target.style.setProperty("--heading", `${Number(item.headingDeg) || 0}deg`);
    target.style.setProperty("--label-left", `${offset.left}px`);
    target.style.setProperty("--label-top", `${offset.top}px`);
    target.style.setProperty("--label-angle", `${offset.angle}deg`);
    target.type = "button";
    target.setAttribute("aria-label", `${item.label} ${item.type}`);
    target.innerHTML = `
      <span class="target-symbol" aria-hidden="true"></span>
      <span class="leader-line" aria-hidden="true"></span>
      <span class="target-label">
        <strong>${item.label}</strong>
        <small>${formatDistance(item.distanceNm)}</small>
      </span>
    `;
    target.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      event.stopPropagation();
      selectAircraftById(item.id, target);
    });
    radar.appendChild(target);
  });
}

function renderAirports() {
  radar.querySelectorAll(".airport").forEach((airport) => airport.remove());

  if (!airportToggle.checked) {
    return;
  }

  AIRPORTS.forEach((item) => {
    const projection = projectAircraft(item.lat, item.lon);
    if (projection.x < 4 || projection.x > 96 || projection.y < 4 || projection.y > 96) {
      return;
    }

    const airport = document.createElement("div");
    airport.className = "airport";
    airport.style.left = `${projection.x}%`;
    airport.style.top = `${projection.y}%`;
    airport.style.setProperty("--runway", `${item.runway}deg`);
    airport.setAttribute("aria-label", `${item.code} ${item.name} ${formatDistance(projection.distanceNm)}`);
    airport.innerHTML = `
      <span class="airport-symbol" aria-hidden="true"></span>
      <span class="airport-label">
        <strong>${item.code}</strong>
        <span>${formatDistance(projection.distanceNm)}</span>
      </span>
    `;
    radar.appendChild(airport);
  });
}

function renderMapAirports(center) {
  mapAirports.innerHTML = "";
  if (!airportToggle.checked) {
    return;
  }

  const localAirportRadius = Math.min(trackRangeMi, 150);
  const candidates = AIRPORTS
    .filter((airport) => haversineMiles(center, airport) <= localAirportRadius)
    .map((airport) => ({ ...airport, code: airport.code }));

  const endpoints = routeEndpointsFor(center);
  if (endpoints) {
    const plan = getFlightPlan(center);
    [
      { code: airportCodeFromText(plan.departure) || "DEP", airport: endpoints.departure },
      { code: airportCodeFromText(plan.arrival) || "ARR", airport: endpoints.arrival }
    ].forEach(({ code, airport }) => {
      if (!candidates.some((item) => Math.abs(item.lat - airport.lat) < 0.001 && Math.abs(item.lon - airport.lon) < 0.001)) {
        candidates.push({ ...airport, code, runway: 0 });
      }
    });
  }

  candidates.forEach((airport, index) => {
    const point = trackMapPoint(center, airport.lat, airport.lon);
    if (!isPointVisible(point, 5)) {
      return;
    }
    const marker = document.createElement("div");
    marker.className = "map-airport";
    marker.style.left = `${point.x}%`;
    marker.style.top = `${point.y}%`;
    if (trackRangeMi > 1500) {
      const offset = MAP_AIRPORT_OFFSETS[index % MAP_AIRPORT_OFFSETS.length];
      marker.style.transform = `translate(${offset.x}px, ${offset.y}px)`;
    }
    marker.innerHTML = `<span>${airport.code}</span>`;
    mapAirports.appendChild(marker);
  });
}

function showPhotoFallback(item, title = "PHOTO NOT FOUND", detail = "") {
  photoPanel.classList.remove("has-image");
  photoPanel.dataset.category = item?.category || "other";
  photoPanel.dataset.photoKey = photoCacheKey(item);
  const model = firstText(item?.aircraftType, item?.type);
  const registration = firstText(item?.registration);
  const fallbackDetail = detail || [model, registration].filter(Boolean).join(" | ");
  photoPanel.innerHTML = `
    <span class="photo-fallback-text">
      <strong>${title}</strong>
      <em>${fallbackDetail || "Generic aircraft profile"}</em>
    </span>
  `;
}

async function loadAircraftPhoto(item) {
  const key = photoCacheKey(item);
  if (key && photoPanel.dataset.photoKey === key && photoPanel.classList.contains("has-image")) {
    return;
  }

  const cached = key ? photoInfoCache.get(key) : null;
  if (cached && Date.now() - cached.time < PHOTO_INFO_CACHE_MS) {
    if (cached.imageUrl) {
      item.photoUrl = cached.imageUrl;
      renderPhotoImage(item, cached.imageUrl, cached.source, cached.generic);
      return;
    }
    showPhotoFallback(item, cached.title || "PHOTO NOT FOUND", cached.detail || "");
    return;
  }

  photoPanel.classList.remove("has-image");
  photoPanel.removeAttribute("data-category");
  photoPanel.dataset.photoKey = key;
  photoPanel.innerHTML = "<span>PHOTO LINK PENDING</span>";

  if (item.photoUrl) {
    if (key) {
      photoInfoCache.set(key, { imageUrl: item.photoUrl, source: item.photoSource || "", generic: Boolean(item.photoGeneric), time: Date.now() });
    }
    renderPhotoImage(item, item.photoUrl, item.photoSource, item.photoGeneric);
    return;
  }

  const modelQuery = photoModelQuery(item);
  const photoQuery = item.registration || item.label || modelQuery;
  if (!item.icao && !modelQuery && !photoQuery) {
    if (key) {
      photoInfoCache.set(key, { title: "PHOTO NOT FOUND", detail: "", time: Date.now() });
    }
    showPhotoFallback(item, "PHOTO NOT FOUND");
    return;
  }

  try {
    const airline = inferAirlineName(item);
    const params = new URLSearchParams({
      icao: item.icao || "",
      query: photoQuery,
      callsign: item.label || "",
      airline,
      model: modelQuery,
      type: item.type || ""
    });
    const url = location.protocol.startsWith("http")
      ? `/api/photo?${params.toString()}`
      : `https://api.planespotters.net/pub/photos/hex/${item.icao}`;
    const response = await fetch(url, { cache: "no-store" });
    if (response.status === 404) {
      if (key) {
        photoInfoCache.set(key, { title: "PHOTO NOT FOUND", detail: "", time: Date.now() });
      }
      showPhotoFallback(item, "PHOTO NOT FOUND");
      return;
    }
    if (!response.ok) {
      throw new Error(`photo status ${response.status}`);
    }

    const data = await response.json();
    const photo = data.photos && data.photos[0];
    const imageUrl = photo?.thumbnail_large?.src || photo?.thumbnail?.src;
    if (!imageUrl) {
      if (key) {
        photoInfoCache.set(key, { title: "PHOTO NOT FOUND", detail: "", time: Date.now() });
      }
      showPhotoFallback(item, "PHOTO NOT FOUND");
      return;
    }

    item.photoUrl = imageUrl;
    item.photoSource = data.source || "";
    item.photoGeneric = Boolean(data.generic);
    if (key) {
      photoInfoCache.set(key, { imageUrl, source: item.photoSource, generic: item.photoGeneric, time: Date.now() });
    }
    renderPhotoImage(item, imageUrl, item.photoSource, item.photoGeneric);
  } catch (error) {
    if (key && photoPanel.dataset.photoKey === key && photoPanel.classList.contains("has-image")) {
      return;
    }
    if (key) {
      photoInfoCache.set(key, { title: "PHOTO SOURCE UNAVAILABLE", detail: "Using generic aircraft profile", time: Date.now() });
    }
    showPhotoFallback(item, "PHOTO SOURCE UNAVAILABLE", "Using generic aircraft profile");
  }
}

function selectAircraft(item, target, shouldLoadPhoto = true) {
  applyEstimatedRouteTimes(item);
  selectedAircraft = item;
  selectedAircraftId = item.id;
  trackSelectedButton.textContent = "";
  trackSelectedButton.setAttribute("aria-label", `Track ${item.label}`);
  trackSelectedButton.setAttribute("title", `Track ${item.label}`);
  trackSelectedButton.disabled = false;
  if (target) {
    markSelectedTarget(item.id);
  } else {
    markSelectedTarget(item.id);
  }

  document.querySelector("#aircraftType").textContent = item.type.toUpperCase();
  document.querySelector("#aircraftTitle").textContent = item.label;
  const flightPlan = getFlightPlan(item);
  const routeText = flightPlan.fullRoute || flightPlan.routeLabel || item.route;
  document.querySelector("#aircraftRoute").textContent = item.routeLoading && !routeText ? "Loading route..." : routeText || "Route not found";
  document.querySelector("#altitude").textContent = formatAltitude(item.altitudeFt);
  document.querySelector("#speed").textContent = formatSpeed(item.speedKt);
  document.querySelector("#heading").textContent = formatHeading(item.headingDeg);
  document.querySelector("#origin").textContent = routeCardValue(item, flightPlan.departure, "DEP");
  document.querySelector("#squawk").textContent = item.squawk || "---";
  document.querySelector("#squawkMeaning").textContent = squawkDescription(item.squawk);
  document.querySelector("#destination").textContent = routeCardValue(item, flightPlan.arrival, "ARR");
  document.querySelector("#airframe").textContent = item.aircraftType || item.type || "---";
  document.querySelector("#owner").textContent = ownerText(item);
  detailPanel.dataset.category = item.category;
  if (shouldLoadPhoto) {
    loadAircraftPhoto(item);
  }
  if (trackedAircraft && trackedAircraft.id === item.id) {
    updateMapTransform(item);
  }
  if (!item.routeEnriched) {
    enrichRouteDetails(item).then((enriched) => {
      if (selectedAircraft && selectedAircraft.id === enriched.id) {
        selectAircraft(enriched, null, false);
      }
      if (trackedAircraft && trackedAircraft.id === enriched.id) {
        trackedAircraft = enriched;
        showTrackMap(enriched, { closeSettingsOnOpen: false });
      }
    });
  }
  if (!item.enriched) {
    enrichAircraftDetails(item).then((enriched) => {
      if (selectedAircraft && selectedAircraft.id === enriched.id && enriched.enriched) {
        selectAircraft(enriched, null, false);
        if (trackedAircraft && trackedAircraft.id === enriched.id) {
          trackedAircraft = enriched;
          showTrackMap(enriched);
        }
        if (shouldLoadPhoto) {
          loadAircraftPhoto(enriched);
        }
      }
    });
  }
}

async function startLiveFeed() {
  if (liveFeedBusy) {
    return;
  }

  liveFeedBusy = true;
  const selectedId = getSelectedAircraftId();
  const routeStateById = new Map(
    aircraft.map((item) => [
      item.id,
      {
        routeLoading: item.routeLoading,
        routeEnriched: item.routeEnriched,
        routeNotFound: item.routeNotFound,
        routeWarning: item.routeWarning,
        routeCorrection: item.routeCorrection,
        route: item.route,
        departure: item.departure,
        arrival: item.arrival,
        departureTime: item.departureTime,
        eta: item.eta,
        routeOrigin: item.routeOrigin,
        routeDestination: item.routeDestination,
        airline: item.airline,
        photoUrl: item.photoUrl,
        photoSource: item.photoSource,
        photoGeneric: item.photoGeneric
      }
    ])
  );
  try {
    const { aircraft: liveAircraft, source } = await fetchLiveAircraft();
    liveAircraft.forEach((item) => {
      const state = routeStateById.get(item.id);
      if (state) {
        Object.assign(item, state);
      }
    });
    aircraft = liveAircraft;
    if (liveAircraft.length) {
      setFeedStatus(feedLabel(source), "good");
    } else {
      setFeedStatus("No Traffic", "warn");
    }
  } catch (error) {
    aircraft = [];
    setFeedStatus("Feed Offline", "bad");
  } finally {
    liveFeedBusy = false;
  }

  renderAirports();
  renderTargets(selectedId);
  const refreshedSelection = selectedAircraft
    ? findAircraft(selectedAircraft.label) || findAircraft(selectedId)
    : null;
  if (refreshedSelection) {
    selectAircraft(refreshedSelection, null, refreshedSelection.id !== selectedAircraft?.id);
  } else if (selectedAircraft) {
    clearSelectedAircraft();
  }
  if (trackedAircraft) {
    const refreshed = findAircraft(trackedAircraft.label) || trackedAircraft;
    showTrackMap(refreshed, { closeSettingsOnOpen: false });
  }
}

settingsButton.addEventListener("click", () => {
  settingsPanel.classList.toggle("hidden");
  if (!settingsPanel.classList.contains("hidden")) {
    refreshAddressSuggestionsSoon();
  }
});

homeTitleButton.addEventListener("click", () => {
  settingsPanel.classList.remove("hidden");
  homeNameInput.focus();
});

closeSettings.addEventListener("click", () => {
  settingsPanel.classList.add("hidden");
});

rangeInput.addEventListener("input", () => {
  setRangeMiles(rangeInput.value);
});

sweepSpeedInput.addEventListener("input", updateSweepSpeed);
sweepToggle.addEventListener("change", updateSweepSpeed);
roadsToggle.addEventListener("change", updateRoadsLayerVisibility);

airportToggle.addEventListener("change", () => {
  renderAirports();
});

mapToggle.addEventListener("change", () => {
  renderRadarBasemap();
});

flightSearch.addEventListener("submit", (event) => {
  event.preventDefault();
  const match = findAircraft(flightSearchInput.value);
  if (match) {
    hideKeyboard();
    showTrackMap(match);
    return;
  }
  flightSearchInput.value = "";
  flightSearchInput.placeholder = "Not found";
});

backToRadarButton.addEventListener("click", () => {
  trackedAircraft = null;
  showRadar();
});

trackZoomInput.addEventListener("input", () => {
  trackRangeMi = Number(trackZoomInput.value);
  if (trackedAircraft) {
    updateMapTransform(trackedAircraft);
  } else {
    zoomValue.textContent = formatTrackRange(trackRangeMi);
  }
});

trackSelectedButton.addEventListener("click", () => {
  const item = selectedAircraft || aircraft.find((candidate) => candidate.id === getSelectedAircraftId());
  if (item) {
    hideKeyboard();
    showTrackMap(item);
  }
});

radar.addEventListener("pointerdown", (event) => {
  if (event.target.closest(".target, .radar-zoom-control, .map-button, input, button")) {
    return;
  }
  const nearest = nearestAircraftFromPointer(event);
  if (nearest) {
    event.preventDefault();
    selectAircraftById(nearest.id);
  } else {
    clearSelectedAircraft();
  }
});

rangeInput.addEventListener("change", () => {
  setRangeMiles(rangeInput.value, true);
});

radarZoomInput.addEventListener("input", () => {
  setRangeMiles(radarZoomInput.value);
});

radarZoomInput.addEventListener("change", () => {
  setRangeMiles(radarZoomInput.value, true);
});

saveLocationButton.addEventListener("click", async () => {
  if (homeNameInput.value.trim()) {
    HOME.label = homeNameInput.value.trim();
    titleText.textContent = HOME.label;
  }

  saveLocationButton.disabled = true;
  setLocationMessage("Updating coordinates...");
  try {
    const lat = parseCoordinate(latInput.value);
    const lon = parseCoordinate(lonInput.value);
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      throw new Error("Coordinates out of range");
    }
    applyHomeLocation(lat, lon);
    await saveDefaultSettings();
    setLocationMessage(`Coordinates saved to ${lat.toFixed(5)} / ${lon.toFixed(5)}`, "good");
  } catch (error) {
    setLocationMessage("Enter valid latitude and longitude.", "warn");
  } finally {
    saveLocationButton.disabled = false;
  }
});

makeDefaultButton.addEventListener("click", async () => {
  if (homeNameInput.value.trim()) {
    HOME.label = homeNameInput.value.trim();
    titleText.textContent = HOME.label;
  }

  makeDefaultButton.disabled = true;
  setLocationMessage("Saving default...");
  try {
    const lat = parseCoordinate(latInput.value);
    const lon = parseCoordinate(lonInput.value);
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      throw new Error("Coordinates out of range");
    }
    HOME.lat = lat;
    HOME.lon = lon;
    updateRangeLabel();
    updateSweepSpeed();
    await saveDefaultSettings();
    setLocationMessage("Default saved for restarts and updates.", "good");
  } catch (error) {
    setLocationMessage("Default save failed. Check coordinates.", "warn");
  } finally {
    makeDefaultButton.disabled = false;
  }
});

scanWifiButton.addEventListener("click", async () => {
  scanWifiButton.disabled = true;
  scanWifiButton.textContent = "Scanning...";
  try {
    const response = await fetch("/api/wifi-scan", {
      cache: "no-store",
      headers: { "Accept": "application/json" }
    });
    if (!response.ok) {
      throw new Error(`Wi-Fi scan returned ${response.status}`);
    }
    const data = await response.json();
    const networks = data.networks || [];
    wifiSsidInput.innerHTML = "";
    networks.forEach((network) => {
      const option = document.createElement("option");
      option.value = network.ssid;
      option.textContent = network.secure ? `${network.ssid} (${network.signal}%, locked)` : `${network.ssid} (${network.signal}%)`;
      wifiSsidInput.appendChild(option);
    });
    if (!networks.length) {
      const option = document.createElement("option");
      option.textContent = "No networks found";
      wifiSsidInput.appendChild(option);
    }
  } catch (error) {
    wifiSsidInput.innerHTML = "<option>Wi-Fi scan unavailable</option>";
  } finally {
    scanWifiButton.disabled = false;
    scanWifiButton.textContent = "Scan Wi-Fi";
  }
});

clearCacheButton.addEventListener("click", () => {
  flightInfoCache.clear();
  routeInfoCache.clear();
  photoInfoCache.clear();
  flightInfoInFlight.clear();
  routeInfoInFlight.clear();
  aircraft.forEach((item) => {
    delete item.routeLoading;
    delete item.routeEnriched;
    delete item.routeNotFound;
    delete item.routeWarning;
    delete item.routeCorrection;
    delete item.photoUrl;
    delete item.photoSource;
    delete item.photoGeneric;
  });
  photoPanel.removeAttribute("data-photo-key");
  locationMessage.textContent = "Temporary photo and route caches cleared.";
  if (selectedAircraft) {
    selectAircraft(selectedAircraft, null, true);
  }
});

addressInput.addEventListener("input", scheduleAddressSuggestions);
cityInput.addEventListener("input", scheduleAddressSuggestions);
stateInput.addEventListener("input", scheduleAddressSuggestions);
postalInput.addEventListener("input", scheduleAddressSuggestions);
addressInput.addEventListener("change", refreshAddressSuggestionsSoon);
cityInput.addEventListener("change", refreshAddressSuggestionsSoon);
stateInput.addEventListener("change", refreshAddressSuggestionsSoon);
postalInput.addEventListener("change", refreshAddressSuggestionsSoon);

document.addEventListener("input", (event) => {
  if ([addressInput, cityInput, stateInput, postalInput].includes(event.target)) {
    scheduleAddressSuggestions();
  }
});

document.addEventListener("change", (event) => {
  if ([addressInput, cityInput, stateInput, postalInput].includes(event.target)) {
    refreshAddressSuggestionsSoon();
  }
});

document.querySelectorAll("input[type='text'], input[type='search'], input[type='number'], input[type='password']").forEach((input) => {
  input.setAttribute("inputmode", "none");
  input.addEventListener("focus", () => showKeyboard(input));
});

keyboardRows.addEventListener("pointerdown", (event) => {
  const button = event.target.closest(".keyboard-key");
  if (!button) {
    return;
  }
  event.preventDefault();
  pressKeyboardKey(button.dataset.key);
});

async function initializeApp() {
  await loadDefaultSettings();
  await loadAirportDatabase();
  await loadBasemap();
  titleText.textContent = HOME.label;
  clearSelectedAircraft();
  updateBattery(87);
  updateSweepSpeed();
  renderOutlineOverlay(HOME);
  renderRoadOverlay(HOME);
  setRangeMiles(HOME.rangeMi);
  startLiveFeed();
  window.setInterval(startLiveFeed, 3000);
  initWeatherMode();
}

initializeApp();

// ─────────────────────────────────────────────────────────────────────────────
// WEATHER MODE
// ─────────────────────────────────────────────────────────────────────────────

const weatherPanel        = document.querySelector("#weatherPanel");
const weatherTitle        = document.querySelector("#weatherTitle");
const weatherFeedStatus   = document.querySelector("#weatherFeedStatus");
const weatherLastUpdated  = document.querySelector("#weatherLastUpdated");
const weatherRefreshBtn   = document.querySelector("#weatherRefreshBtn");
const weatherSettingsBtn  = document.querySelector("#weatherSettingsBtn");
const weatherRadarFrame   = document.querySelector("#weatherRadarFrame");
const weatherMapLayer     = document.querySelector("#weatherMapLayer");
const weatherRadarImg     = document.querySelector("#weatherRadarImg");
const weatherHomeDot      = document.querySelector("#weatherHomeDot");
const weatherHomeLbl      = document.querySelector(".weather-home-label");
const weatherRadarStatus  = document.querySelector("#weatherRadarStatus");
const wcConditionIcon     = document.querySelector("#wcConditionIcon");
const modeFlightBtn       = document.querySelector("#modeFlightBtn");
const modeWeatherBtn      = document.querySelector("#modeWeatherBtn");
const wcTemp              = document.querySelector("#wcTemp");
const wcFeels             = document.querySelector("#wcFeels");
const wcDesc              = document.querySelector("#wcDesc");
const wcWind              = document.querySelector("#wcWind");
const wcWindDir           = document.querySelector("#wcWindDir");
const wcHumidity          = document.querySelector("#wcHumidity");
const wcPressure          = document.querySelector("#wcPressure");
const wcPrecip            = document.querySelector("#wcPrecip");
const wcAlerts            = document.querySelector("#wcAlerts");
const wcAlertList         = document.querySelector("#wcAlertList");
const wcSource            = document.querySelector("#wcSource");
const weatherLastUpdatedEl = document.querySelector("#weatherLastUpdated");

let currentMode = "flight";
let weatherRefreshTimer = null;

const WMO_CODES = {
  0: "Clear Sky", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
  45: "Fog", 48: "Icy Fog",
  51: "Light Drizzle", 53: "Drizzle", 55: "Heavy Drizzle",
  61: "Light Rain", 63: "Rain", 65: "Heavy Rain",
  71: "Light Snow", 73: "Snow", 75: "Heavy Snow",
  80: "Rain Showers", 81: "Heavy Showers", 82: "Violent Showers",
  85: "Snow Showers", 95: "Thunderstorm",
  96: "Thunderstorm + Hail", 99: "Severe Thunderstorm",
};

// Weather condition icons (Unicode — reliable on Chromium)
const WMO_ICONS = {
  0: "☀",   // ☀ clear
  1: "\u{1F324}", // 🌤 mainly clear
  2: "⛅",   // ⛅ partly cloudy
  3: "☁",   // ☁ overcast
  45: "\u{1F32B}", // 🌫 fog
  48: "\u{1F32B}",
  51: "\u{1F326}", // 🌦 drizzle
  53: "\u{1F326}",
  55: "\u{1F327}", // 🌧 heavy drizzle
  56: "\u{1F327}",
  57: "\u{1F327}",
  61: "\u{1F326}", // 🌦 light rain
  63: "\u{1F327}", // 🌧 rain
  65: "\u{1F327}",
  66: "\u{1F327}",
  67: "\u{1F327}",
  71: "\u{1F328}", // 🌨 light snow
  73: "❄",   // ❄ snow
  75: "❄",
  77: "\u{1F328}",
  80: "\u{1F326}", // 🌦 showers
  81: "\u{1F327}", // 🌧 heavy showers
  82: "⛈",   // ⛈ violent showers
  85: "\u{1F328}", // 🌨 snow showers
  86: "❄",
  95: "⛈",   // ⛈ thunderstorm
  96: "⛈",
  99: "⛈",
};

function windBearing(deg) {
  if (deg === null || deg === undefined) return "---";
  const dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  return dirs[Math.round(((deg % 360) + 360) % 360 / 22.5) % 16];
}

const RADAR_BBOX = { west: -84.0, south: 31.0, east: -77.0, north: 36.0 };

function radarLatLonToXY(lat, lon, frameW, frameH) {
  const x = (lon - RADAR_BBOX.west)  / (RADAR_BBOX.east  - RADAR_BBOX.west)  * frameW;
  const y = (RADAR_BBOX.north - lat) / (RADAR_BBOX.north - RADAR_BBOX.south) * frameH;
  return { x, y };
}

function injectWeatherMapStyles() {
  if (document.querySelector("#weatherMapStyles")) return;
  const style = document.createElement("style");
  style.id = "weatherMapStyles";
  style.textContent = `
    .weather-map-state {
      fill: rgba(74,158,255,0.04);
      stroke: rgba(74,158,255,0.42);
      stroke-width: 1;
      vector-effect: non-scaling-stroke;
    }
    .weather-map-country {
      fill: none;
      stroke: rgba(74,158,255,0.22);
      stroke-width: 0.8;
      vector-effect: non-scaling-stroke;
    }
  `;
  document.head.appendChild(style);
}

function renderWeatherMap() {
  const frameW = weatherRadarFrame.offsetWidth  || 520;
  const frameH = weatherRadarFrame.offsetHeight || 380;

  function latlonToSvg(lat, lon) {
    const x = (lon - RADAR_BBOX.west)  / (RADAR_BBOX.east  - RADAR_BBOX.west)  * 100;
    const y = (RADAR_BBOX.north - lat) / (RADAR_BBOX.north - RADAR_BBOX.south) * 100;
    return `${x.toFixed(3)},${y.toFixed(3)}`;
  }

  let svgContent = "";

  if (typeof US_REGION_SHAPES !== "undefined") {
    US_REGION_SHAPES.forEach((shape) => {
      const pts = shape.points.map(([lat, lon]) => latlonToSvg(lat, lon)).join(" ");
      svgContent += `<polygon class="weather-map-state" points="${pts}" />`;
    });
  }

  if (typeof WORLD_SHAPES !== "undefined") {
    WORLD_SHAPES.forEach((shape) => {
      const pts = shape.points.map(([lon, lat]) => latlonToSvg(lat, lon)).join(" ");
      svgContent += `<polygon class="weather-map-country" points="${pts}" />`;
    });
  }

  if (typeof COASTLINE_LINES !== "undefined") {
    COASTLINE_LINES.forEach((line) => {
      const d = line.map(([lat, lon], i) => `${i === 0 ? "M" : "L"}${latlonToSvg(lat, lon)}`).join(" ");
      svgContent += `<path class="weather-map-country" d="${d}" />`;
    });
  }

  weatherMapLayer.innerHTML = svgContent;

  const { x, y } = radarLatLonToXY(HOME.lat, HOME.lon, frameW, frameH);
  weatherHomeDot.style.left  = `${x}px`;
  weatherHomeDot.style.top   = `${y}px`;
  weatherHomeLbl.style.left  = `${x + 14}px`;
  weatherHomeLbl.style.top   = `${y - 9}px`;
}

async function loadWeatherRadar() {
  const frameW = Math.round(weatherRadarFrame.offsetWidth  || 520);
  const frameH = Math.round(weatherRadarFrame.offsetHeight || 380);
  const { west, south, east, north } = RADAR_BBOX;
  const url = `/api/radar-tile?west=${west}&south=${south}&east=${east}&north=${north}&width=${frameW}&height=${frameH}&_t=${Date.now()}`;

  weatherRadarStatus.classList.remove("hidden");
  weatherRadarStatus.textContent = "Loading radar...";
  weatherRefreshBtn.classList.add("spinning");

  try {
    const ctrl = new AbortController();
    const tid  = setTimeout(() => ctrl.abort(), 20000);
    let resp;
    try {
      resp = await fetch(url, { cache: "no-store", signal: ctrl.signal });
    } finally {
      clearTimeout(tid);
    }
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const blob = await resp.blob();
    const objUrl = URL.createObjectURL(blob);
    const prevUrl = weatherRadarImg.dataset.objUrl;
    weatherRadarImg.src = objUrl;
    weatherRadarImg.dataset.objUrl = objUrl;
    if (prevUrl) URL.revokeObjectURL(prevUrl);
    weatherRadarImg.classList.remove("hidden");
    weatherRadarStatus.classList.add("hidden");
    weatherFeedStatus.textContent = "NWS Live";
    weatherFeedStatus.className   = "status good";
    const now = new Date();
    weatherLastUpdatedEl.textContent = `${now.getHours()}:${String(now.getMinutes()).padStart(2,"0")}`;
  } catch (err) {
    console.error("loadWeatherRadar failed:", err);
    weatherRadarImg.classList.add("hidden");
    weatherRadarStatus.classList.remove("hidden");
    weatherRadarStatus.textContent = err.name === "AbortError" ? "Radar timeout" : `Radar error: ${err.message}`;
    weatherFeedStatus.textContent  = "Radar offline";
    weatherFeedStatus.className    = "status bad";
  } finally {
    weatherRefreshBtn.classList.remove("spinning");
  }
}

async function loadWeatherConditions() {
  try {
    const ctrl = new AbortController();
    const tid  = setTimeout(() => ctrl.abort(), 15000);
    let resp;
    try {
      resp = await fetch(`/api/weather?lat=${HOME.lat}&lon=${HOME.lon}`, {
        cache: "no-store",
        signal: ctrl.signal,
        headers: { Accept: "application/json" },
      });
    } finally {
      clearTimeout(tid);
    }
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    const c = data.current || {};

    const temp  = c.temperature_2m        !== undefined ? Math.round(c.temperature_2m)        : null;
    const feels = c.apparent_temperature  !== undefined ? Math.round(c.apparent_temperature)  : null;
    wcTemp.textContent  = temp  !== null ? `${temp}°F`       : "--°F";
    wcFeels.textContent = feels !== null ? `Feels ${feels}°F` : "Feels --°F";

    const code = c.weather_code;
    wcDesc.textContent = (code !== undefined && WMO_CODES[code]) ? WMO_CODES[code] : "Conditions unavailable";
    if (wcConditionIcon) wcConditionIcon.textContent = (code !== undefined && WMO_ICONS[code]) ? WMO_ICONS[code] : "🌡";

    const wspd = c.wind_speed_10m      !== undefined ? Math.round(c.wind_speed_10m)  : null;
    const wdir = c.wind_direction_10m  !== undefined ? c.wind_direction_10m           : null;
    wcWind.textContent    = wspd !== null ? `${wspd} mph`    : "-- mph";
    wcWindDir.textContent = wdir !== null ? windBearing(wdir) : "---";

    const hum = c.relative_humidity_2m;
    wcHumidity.textContent = hum !== undefined ? `${Math.round(hum)}%` : "--%";

    const hpa = c.pressure_msl;
    wcPressure.textContent = hpa !== undefined ? `${(hpa * 0.02953).toFixed(2)} inHg` : "-- inHg";

    const precip = c.precipitation;
    wcPrecip.textContent = precip !== undefined ? `${precip.toFixed(2)}"` : `--"`;

    const alerts = data.alerts || [];
    if (alerts.length > 0) {
      wcAlerts.classList.remove("hidden");
      wcAlertList.innerHTML = alerts.map((a) =>
        `<div class="wc-alert-item"><strong>${a.event}</strong>${a.headline || ""}</div>`
      ).join("");
    } else {
      wcAlerts.classList.add("hidden");
    }

    wcSource.textContent = "NWS / Open-Meteo";
  } catch (err) {
    console.error("loadWeatherConditions failed:", err);
    wcDesc.textContent   = err.name === "AbortError" ? "Timeout — check server" : `Error: ${err.message}`;
    wcSource.textContent = "Source offline";
  }
}

async function refreshWeather() {
  await Promise.all([loadWeatherRadar(), loadWeatherConditions()]);
}

function startWeatherAutoRefresh() {
  stopWeatherAutoRefresh();
  weatherRefreshTimer = window.setInterval(refreshWeather, 90_000);
}

function stopWeatherAutoRefresh() {
  if (weatherRefreshTimer !== null) {
    window.clearInterval(weatherRefreshTimer);
    weatherRefreshTimer = null;
  }
}

function switchMode(mode) {
  if (mode === currentMode) return;
  currentMode = mode;

  if (mode === "weather") {
    weatherPanel.classList.remove("hidden");
    weatherTitle.textContent = HOME.label;
    modeWeatherBtn.classList.add("active");
    modeFlightBtn.classList.remove("active");
    injectWeatherMapStyles();
    // Kick off data fetch immediately — don't let map-render errors block it
    refreshWeather();
    startWeatherAutoRefresh();
    requestAnimationFrame(() => {
      try { renderWeatherMap(); } catch (e) { console.error("renderWeatherMap failed:", e); }
    });
  } else {
    weatherPanel.classList.add("hidden");
    modeFlightBtn.classList.add("active");
    modeWeatherBtn.classList.remove("active");
    stopWeatherAutoRefresh();
  }

  settingsPanel.classList.add("hidden");
}

function initWeatherMode() {
  const weatherBackBtn = document.querySelector("#weatherBackBtn");
  if (weatherBackBtn) {
    weatherBackBtn.addEventListener("click", () => switchMode("flight"));
  }
  modeFlightBtn.addEventListener("click",   () => switchMode("flight"));
  modeWeatherBtn.addEventListener("click",  () => switchMode("weather"));
  weatherRefreshBtn.addEventListener("click", () => refreshWeather());
  weatherSettingsBtn.addEventListener("click", () => {
    settingsPanel.classList.remove("hidden");
  });
}
