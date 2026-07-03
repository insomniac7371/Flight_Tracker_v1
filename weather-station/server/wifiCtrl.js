// Wi-Fi management via NetworkManager (nmcli) — scan, connect, status, forget.
// nmcli is invoked directly (NOT via sudo: the service runs with
// NoNewPrivileges=true, which blocks setuid). NetworkManager authorizes the
// service user through polkit — install this rule on the Pi:
//   /etc/polkit-1/rules.d/50-flightrack-networkmanager.rules
//   polkit.addRule(function(action, subject) {
//     if (action.id.indexOf("org.freedesktop.NetworkManager.") === 0 &&
//         subject.user == "flightrack") { return polkit.Result.YES; }
//   });
// All invocations use execFile with argument arrays — no shell, no injection.
// Passwords are never logged.

const { execFile } = require("child_process");

/**
 * Run nmcli with the given args.
 *
 * @param {string[]} args
 * @param {number} [timeoutMs]
 * @returns {Promise<{ok: boolean, out: string, err: string}>}
 */
function nmcli(args, timeoutMs) {
  return new Promise((resolve) => {
    execFile(
      "nmcli",
      args,
      { timeout: timeoutMs || 20000 },
      (error, stdout, stderr) => {
        resolve({
          ok: !error,
          out: String(stdout || ""),
          err: String(stderr || "") || (error ? String(error.message || "") : ""),
        });
      }
    );
  });
}

/**
 * Split one line of `nmcli -t` output on unescaped colons
 * (SSIDs may contain `\:`).
 *
 * @param {string} line
 * @returns {string[]}
 */
function splitFields(line) {
  const fields = [];
  let cur = "";
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === "\\" && line[i + 1] === ":") {
      cur += ":";
      i++;
    } else if (ch === ":") {
      fields.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  fields.push(cur);
  return fields;
}

/**
 * Validate an SSID from the client.
 *
 * @param {*} ssid
 * @returns {string|null} error message or null
 */
function badSsid(ssid) {
  if (typeof ssid !== "string" || !ssid.length || ssid.length > 32) {
    return "Invalid network name";
  }
  if (ssid.startsWith("-")) return "Invalid network name";
  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x1f]/.test(ssid)) return "Invalid network name";
  return null;
}

/**
 * GET /api/wifi/status — current connection + saved network names.
 */
async function getStatus(req, res) {
  const active = await nmcli(["-t", "-f", "ACTIVE,SSID,SIGNAL", "dev", "wifi"]);
  if (!active.ok && /not found|command not found|ENOENT/i.test(active.err)) {
    return res.json({ available: false });
  }
  let connected = null;
  active.out.split("\n").forEach((line) => {
    const [act, ssid, signal] = splitFields(line.trim());
    if (act === "yes" && ssid) {
      connected = { ssid, signal: parseInt(signal, 10) || null };
    }
  });

  const saved = await nmcli(["-t", "-f", "NAME,TYPE", "connection", "show"]);
  const savedNames = [];
  saved.out.split("\n").forEach((line) => {
    const [name, type] = splitFields(line.trim());
    if (name && /wireless|wifi/.test(type || "")) savedNames.push(name);
  });

  res.json({ available: true, connected, saved: savedNames });
}

/**
 * GET /api/wifi/scan — visible networks, strongest first, deduped.
 */
async function scan(req, res) {
  const r = await nmcli(
    ["-t", "-f", "SSID,SIGNAL,SECURITY", "dev", "wifi", "list", "--rescan", "yes"],
    30000
  );
  if (!r.ok) {
    console.error("wifi scan failed:", r.err.slice(0, 200));
    if (/not found|command not found|ENOENT/i.test(r.err)) {
      return res.json({ available: false, networks: [] });
    }
    const error = /not authorized|permission denied/i.test(r.err)
      ? "Not authorized — polkit rule missing (see setup guide)"
      : "Scan failed — try again";
    return res.json({ available: true, networks: [], error });
  }
  const byName = new Map();
  r.out.split("\n").forEach((line) => {
    const [ssid, signal, security] = splitFields(line.trim());
    if (!ssid) return; // hidden networks
    const sig = parseInt(signal, 10) || 0;
    const prev = byName.get(ssid);
    if (!prev || sig > prev.signal) {
      byName.set(ssid, {
        ssid,
        signal: sig,
        secured: Boolean(security && security !== "--"),
      });
    }
  });
  const networks = [...byName.values()].sort((a, b) => b.signal - a.signal);
  res.json({ available: true, networks });
}

/**
 * POST /api/wifi/connect { ssid, password } — connect and remember.
 * NetworkManager stores the profile automatically on success.
 */
async function connect(req, res) {
  const { ssid, password } = req.body || {};
  const ssidErr = badSsid(ssid);
  if (ssidErr) return res.status(400).json({ error: ssidErr });
  if (password !== undefined && password !== "") {
    if (typeof password !== "string" || password.length < 8 || password.length > 63) {
      return res.status(400).json({ error: "Password must be 8-63 characters" });
    }
  }

  const args = ["dev", "wifi", "connect", ssid];
  if (password) args.push("password", password);

  const r = await nmcli(args, 60000);
  if (r.ok && /successfully activated/i.test(r.out)) {
    return res.json({ ok: true, ssid });
  }
  // Don't echo raw nmcli output (may include the SSID quoting oddly) —
  // map the common failures to friendly messages.
  const msg = /secrets were required|802-11-wireless-security|invalid.*password|preshared/i.test(
    r.err + r.out
  )
    ? "Wrong password"
    : /no network with ssid|not found/i.test(r.err + r.out)
    ? "Network not found — try scanning again"
    : /not authorized|permission denied/i.test(r.err + r.out)
    ? "Not authorized — polkit rule missing (see setup guide)"
    : "Could not connect";
  console.error("wifi connect failed:", (r.err || r.out).slice(0, 200));
  res.json({ ok: false, error: msg });
}

/**
 * POST /api/wifi/forget { ssid } — delete a saved network profile.
 */
async function forget(req, res) {
  const { ssid } = req.body || {};
  const ssidErr = badSsid(ssid);
  if (ssidErr) return res.status(400).json({ error: ssidErr });

  const r = await nmcli(["connection", "delete", "id", ssid], 15000);
  res.json({ ok: r.ok });
}

module.exports = { getStatus, scan, connect, forget };
