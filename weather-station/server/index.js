const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const ver = require("../package.json").version;
const appName = require("../package.json").name;

const settingsCtrl = require("./settingsCtrl");
const geolocationCtrl = require("./geolocationCtrl");
const aircraftCtrl = require("./aircraftCtrl");
const placeCtrl = require("./placeCtrl");
const vesselCtrl = require("./vesselCtrl");
const wxPointsCtrl = require("./wxPointsCtrl");
const extraCtrl = require("./extraCtrl");
const lightningCtrl = require("./lightningCtrl");
const weatherCtrl = require("./weatherCtrl");
const updateCtrl = require("./updateCtrl");
const wifiCtrl = require("./wifiCtrl");
const precipTileCtrl = require("./precipTileCtrl");

const {
  getSettings,
  setSetting,
  deleteSetting,
  createSettingsFile,
  replaceSettings,
} = settingsCtrl;
const { getCoords } = geolocationCtrl;
const { getAircraft, getAircraftInfo, getTrack } = aircraftCtrl;

const DIST_DIR = "/../client/dist";
// 8081 so the FR24 feeder's dump1090 map can own the conventional 8080.
const PORT = process.env.PORT || 8081;
const app = express();

// ***** dev only:
// const livereload = require("livereload");
// const connectLivereload = require("connect-livereload");
// const liveReloadServer = livereload.createServer();
// liveReloadServer.watch(path.join(`${__dirname}/${DIST_DIR}`));
// liveReloadServer.server.once("connection", () => {
//   setTimeout(() => {
//     liveReloadServer.refresh("/");
//   }, 100);
// });
// app.use(connectLivereload());
// *****

// Security headers — CSP disabled intentionally: kiosk loads map tiles
// from multiple CDN origins (CARTO, RainViewer, NASA, OWM, PlaneSpotters).
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
}));

// Restrict CORS to localhost requests only (server already binds to 127.0.0.1,
// but belt-and-suspenders prevents any cross-origin abuse).
app.use(cors({
  origin: [`http://localhost:${PORT}`, `http://127.0.0.1:${PORT}`],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: false,
}));

// Prevent clients from caching the JS bundle — ensures updates are picked up
// immediately on a kiosk that may never do a hard refresh.
app.use((req, res, next) => {
  if (req.path.endsWith(".js") || req.path.endsWith(".css") || req.path === "/" || req.path.endsWith(".html") || req.path.endsWith("/")) {
    res.set("Cache-Control", "no-store");
  }
  next();
});

app.use(bodyParser.json({ limit: "16kb" })); // cap request body size
// Kiosk shell (Flight + Weather switcher) lives one level above weather-station.
app.use("/kiosk", express.static(path.join(`${__dirname}/../../kiosk`)));
app.use(express.static(path.join(`${__dirname}/${DIST_DIR}`)));

const server = app.listen(PORT, "localhost", () => {
  console.log(`${appName} v${ver} has started on port ${PORT}`);
});

// Graceful shutdown — finish in-flight requests before exiting.
function shutdown(signal) {
  console.log(`${signal} received — shutting down gracefully`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5000);
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));

app.get("/settings", getSettings);
app.post("/settings", createSettingsFile);
app.put("/settings", replaceSettings);
app.patch("/setting", setSetting);
app.delete("/setting", deleteSetting);

app.get("/geolocation", getCoords);

app.get("/api/aircraft", getAircraft);

app.get("/api/aircraft-info", getAircraftInfo);

app.get("/api/track", getTrack);

app.get("/api/place", placeCtrl.getPlace);

app.get("/api/vessels", vesselCtrl.getVessels);

app.get("/api/wx-points", wxPointsCtrl.getWxPoints);

app.get("/api/weather", weatherCtrl.getWeather);

app.get("/api/precip-tile/:offset/:z/:x/:y.png", precipTileCtrl.getPrecipTile);

app.get("/api/alerts", extraCtrl.getAlerts);
app.get("/api/aqi", extraCtrl.getAqi);
app.get("/api/health", extraCtrl.getHealth);

app.get("/api/lightning", lightningCtrl.getStrikes);

app.get("/api/version", updateCtrl.getVersion);
app.post("/api/update", updateCtrl.checkUpdate);
app.post("/api/reboot", updateCtrl.reboot);

app.get("/api/wifi/status", wifiCtrl.getStatus);
app.get("/api/wifi/scan", wifiCtrl.scan);
app.post("/api/wifi/connect", wifiCtrl.connect);
app.post("/api/wifi/forget", wifiCtrl.forget);
