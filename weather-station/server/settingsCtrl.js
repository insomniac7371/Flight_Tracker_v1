const fs = require("fs");
const path = require("path");

const SETTINGS_FILE = "../settings.json";
const FILE_PATH = path.join(`${__dirname}/${SETTINGS_FILE}`);
const ENCODING = "utf8";

// Strict whitelist — only these keys may be written to settings.json.
// Matches exactly the keys in saveSettingsToJson() (AppContext.js).
const ALLOWED_KEYS = new Set([
  "weatherApiKey",   // Tomorrow.io API key
  "mapApiKey",       // Map provider key (currently unused — CARTO needs no key)
  "reverseGeoApiKey",// Optional reverse-geocode key
  "owmApiKey",       // OpenWeatherMap key (AQI / overlays)
  "aisApiKey",       // aisstream.io WebSocket key
  "startingLat",     // Home latitude
  "startingLon",     // Home longitude
]);

// Max length for string values — prevents excessive disk writes.
const MAX_VAL_LENGTH = 256;

/**
 * Validate a single settings key/value pair.
 * @param {string} key
 * @param {*} val
 * @returns {string|null} error message, or null if valid
 */
function validateSetting(key, val) {
  if (!ALLOWED_KEYS.has(key)) return `Unknown setting key: ${key}`;
  if (typeof val === "string" && val.length > MAX_VAL_LENGTH) return "Value too long";
  if (key === "startingLat" && (isNaN(parseFloat(val)) || Math.abs(parseFloat(val)) > 90)) return "Invalid latitude";
  if (key === "startingLon" && (isNaN(parseFloat(val)) || Math.abs(parseFloat(val)) > 180)) return "Invalid longitude";
  return null;
}

/**
 * Read the settings.json file
 *
 * @param {Object} callbacks
 * @param {Function} callbacks.successCb
 * @param {Function} callbacks.errorCb
 */
function readSettingsFile({ successCb, errorCb }) {
  fs.readFile(FILE_PATH, (err, data) => {
    if (err) {
      errorCb(err);
    } else {
      successCb(JSON.parse(data));
    }
  });
}

/**
 * Creates a `settings.json` file
 *
 * @param {Object} req
 * @param {Object} [req.body]
 * @param {Object} res
 */
function createSettingsFile(req, res) {
  const contents = req.body || {};

  if (fs.existsSync(FILE_PATH)) {
    return res.status(409).json("settings file already exists").end();
  } else {
    fs.writeFile(FILE_PATH, JSON.stringify(contents), ENCODING, (writeErr) => {
      if (writeErr) {
        console.error("createSettingsFile error:", writeErr.message);
        return res.status(500).json("Internal server error").end();
      }
      return res.status(201).json(contents).end();
    });
  }
}

/**
 * Return the settings.json file
 */
function getSettings(req, res) {
  if (!fs.existsSync(FILE_PATH)) {
    return res.status(404).json("settings.json not found!").end();
  }

  readSettingsFile({
    successCb: (data) => {
      return res.status(200).json(data).end();
    },
    errorCb: (err) => {
      return res.status(500).end();
    },
  });
}

/**
 * Sets a single setting. Creates a new `settings.json` file if none exists.
 *
 * @param {Object} req
 * @param {Object} res
 */
function setSetting(req, res) {
  const { key, val } = req.body;
  if (!key || val === undefined || val === null) {
    return res.status(400).json("You must supply a key and val").end();
  }
  const err = validateSetting(key, val);
  if (err) return res.status(400).json(err).end();

  /**
   * Writes file contents
   *
   * @param {Object} newSettings
   * @param {Boolean} [newFile] If file is new
   */
  const writeContents = (newSettings, newFile) => {
    fs.writeFile(FILE_PATH, JSON.stringify(newSettings), ENCODING, (writeErr) => {
      if (writeErr) {
        console.error("setSetting write error:", writeErr.message);
        return res.status(500).json("Internal server error").end();
      }
      return res.status(newFile ? 201 : 200).json(newSettings).end();
    });
  };

  /**
   * Read success callback
   *
   * @param {Object} currentSettings
   */
  const readSuccess = (currentSettings) => {
    const newSettings = {
      ...currentSettings,
      [key]: val,
    };
    writeContents(newSettings);
  };

  const readError = (readErr) => {
    console.error("setSetting read error:", readErr.message);
    return res.status(500).json("Internal server error").end();
  };

  if (!fs.existsSync(FILE_PATH)) {
    writeContents({ [key]: val }, true);
  } else {
    readSettingsFile({
      successCb: readSuccess,
      errorCb: readError,
    });
  }
}

function replaceSettings(req, res) {
  const { body } = req;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json("You must provide a settings object").end();
  }
  // Validate every key in the replacement object.
  for (const [key, val] of Object.entries(body)) {
    const err = validateSetting(key, val);
    if (err) return res.status(400).json(err).end();
  }
  const fileExists = fs.existsSync(FILE_PATH);

  fs.writeFile(FILE_PATH, JSON.stringify(body), ENCODING, (err) => {
    if (err) {
      console.error("replaceSettings write error:", err.message);
      return res.status(500).json("Internal server error").end();
    }
    return res.status(fileExists ? 200 : 201).json(body).end();
  });
}

/**
 * Deletes a specific setting
 *
 * @param {Object} req
 * @param {Object} req.query
 * @param {Object} req.query.key The key to be deleted
 * @param {Object} res
 */
function deleteSetting(req, res) {
  const { key } = req.query;
  if (!key) {
    return res.status(400).json("You must supply a key to delete").end();
  }
  if (!ALLOWED_KEYS.has(key)) {
    return res.status(400).json(`Unknown setting key: ${key}`).end();
  }

  /**
   * Read success callback
   *
   * @param {Object} currentSettings
   */
  const readSuccess = (currentSettings) => {
    if (!Object.prototype.hasOwnProperty.call(currentSettings, key)) {
      return res.status(404).end();
    }

    delete currentSettings[key];

    fs.writeFile(FILE_PATH, JSON.stringify(currentSettings), ENCODING, (writeErr) => {
      if (writeErr) {
        console.error("deleteSetting write error:", writeErr.message);
        return res.status(500).json("Internal server error").end();
      }
      return res.status(200).json(currentSettings).end();
    });
  };

  const readError = (readErr) => {
    console.error("deleteSetting read error:", readErr.message);
    return res.status(500).json("Internal server error").end();
  };

  readSettingsFile({
    successCb: readSuccess,
    errorCb: readError,
  });
}

module.exports = {
  getSettings,
  setSetting,
  deleteSetting,
  createSettingsFile,
  replaceSettings,
};
