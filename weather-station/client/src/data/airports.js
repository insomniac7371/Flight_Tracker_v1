// Curated airports + military installations for the Southeast US region the
// kiosk views (centered on the SC Lowcountry). type: "airport" | "military".
const AIRFIELDS = [
  // --- Civil airports ---
  { code: "CHS", name: "Charleston Intl", lat: 32.8986, lon: -80.0405, type: "airport" },
  { code: "JZI", name: "Charleston Executive", lat: 32.7009, lon: -80.0029, type: "airport" },
  { code: "DYB", name: "Summerville", lat: 33.0633, lon: -80.2793, type: "airport" },
  { code: "CAE", name: "Columbia Metro", lat: 33.9388, lon: -81.1195, type: "airport" },
  { code: "MYR", name: "Myrtle Beach Intl", lat: 33.6797, lon: -78.9283, type: "airport" },
  { code: "FLO", name: "Florence Regional", lat: 34.1854, lon: -79.7239, type: "airport" },
  { code: "GSP", name: "Greenville-Spartanburg", lat: 34.8957, lon: -82.2189, type: "airport" },
  { code: "HXD", name: "Hilton Head", lat: 32.2244, lon: -80.6976, type: "airport" },
  { code: "SAV", name: "Savannah/Hilton Head", lat: 32.1276, lon: -81.2021, type: "airport" },
  { code: "AGS", name: "Augusta Regional", lat: 33.3699, lon: -81.9645, type: "airport" },
  { code: "ATL", name: "Atlanta Hartsfield", lat: 33.6407, lon: -84.4277, type: "airport" },
  { code: "CLT", name: "Charlotte Douglas", lat: 35.214, lon: -80.9431, type: "airport" },
  { code: "RDU", name: "Raleigh-Durham", lat: 35.8776, lon: -78.7875, type: "airport" },
  { code: "ILM", name: "Wilmington Intl", lat: 34.2706, lon: -77.9026, type: "airport" },
  { code: "SSI", name: "Brunswick Golden Isles", lat: 31.1518, lon: -81.3913, type: "airport" },

  // --- Military installations ---
  { code: "CHS-AFB", name: "JB Charleston (AFB)", lat: 32.8986, lon: -80.0405, type: "military" },
  { code: "SSC", name: "Shaw AFB", lat: 33.9727, lon: -80.4707, type: "military" },
  { code: "MMT", name: "McEntire JNGB", lat: 33.9208, lon: -80.8015, type: "military" },
  { code: "NBC", name: "MCAS Beaufort", lat: 32.4774, lon: -80.7231, type: "military" },
  { code: "SVN", name: "Hunter AAF", lat: 32.0099, lon: -81.1457, type: "military" },
  { code: "LHW", name: "Fort Stewart / Wright AAF", lat: 31.8893, lon: -81.5621, type: "military" },
  { code: "POB", name: "Pope AAF / Fort Liberty", lat: 35.1708, lon: -79.0145, type: "military" },
  { code: "GSB", name: "Seymour Johnson AFB", lat: 35.3394, lon: -77.9606, type: "military" },
  { code: "NKT", name: "MCAS Cherry Point", lat: 34.9008, lon: -76.8807, type: "military" },
  { code: "WRB", name: "Robins AFB", lat: 32.64, lon: -83.5919, type: "military" },
];

export default AIRFIELDS;
