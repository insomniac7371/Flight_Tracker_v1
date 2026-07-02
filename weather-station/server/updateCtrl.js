// Version info + "Check for updates" endpoint.
// All git commands are fixed-argument execFile calls (no shell, no user input).

const { execFile, spawn } = require("child_process");
const path = require("path");
const pkg = require("../package.json");

const REPO_DIR = path.join(__dirname, "..", "..");
const UPDATE_SCRIPT = path.join(__dirname, "..", "tools", "auto-update.sh");

/**
 * Run a git command in the repo root; resolves null on any failure
 * (not a repo, git missing, network down) so callers can degrade gracefully.
 *
 * @param {string[]} args
 * @returns {Promise<string|null>}
 */
function git(args) {
  return new Promise((resolve) => {
    execFile("git", args, { cwd: REPO_DIR, timeout: 20000 }, (err, stdout) => {
      resolve(err ? null : String(stdout).trim());
    });
  });
}

/**
 * GET /api/version — app version, git commit, commit date
 */
async function getVersion(req, res) {
  const commit = await git(["rev-parse", "--short", "HEAD"]);
  const date = await git(["log", "-1", "--format=%cd", "--date=format:%Y-%m-%d"]);
  res.json({ version: pkg.version, commit, date });
}

/**
 * POST /api/update — fetch origin/main and compare.
 * Up to date  -> { upToDate: true }
 * Update found -> kicks off auto-update.sh (detached; it restarts this server)
 *                 and returns { updating: true, from, to }
 */
async function checkUpdate(req, res) {
  const local = await git(["rev-parse", "HEAD"]);
  if (!local) {
    return res.status(200).json({ error: "Not a git install — updates unavailable" });
  }

  const fetched = await git(["fetch", "origin", "main"]);
  if (fetched === null) {
    return res.status(200).json({ error: "Could not reach GitHub" });
  }

  const remote = await git(["rev-parse", "origin/main"]);
  if (!remote) {
    return res.status(200).json({ error: "Could not read origin/main" });
  }

  if (local === remote) {
    return res.json({ upToDate: true, commit: local.slice(0, 7) });
  }

  // Hand off to the same script the systemd timer uses. Detached, because it
  // restarts this very server — we must answer the request before dying.
  const child = spawn("bash", [UPDATE_SCRIPT], {
    detached: true,
    stdio: "ignore",
    cwd: REPO_DIR,
  });
  child.unref();

  return res.json({
    updating: true,
    from: local.slice(0, 7),
    to: remote.slice(0, 7),
  });
}

module.exports = { getVersion, checkUpdate };
