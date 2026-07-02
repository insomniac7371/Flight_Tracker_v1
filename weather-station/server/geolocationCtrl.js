const axios = require("axios");

/**
 * Gets coordinates from an external API
 *
 */
function getCoords(req, res) {
  axios
    .get("https://ipapi.co/json/")
    .then((result) => {
      return res.status(result.status).json(result.data).end();
    })
    .catch((err) => {
      console.error("geolocation error:", err.message);
      return res.status(500).json("Geolocation lookup failed").end();
    });
}

module.exports = {
  getCoords,
};
