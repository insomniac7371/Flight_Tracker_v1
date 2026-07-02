from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qs, quote_plus, urlencode, urlparse
from urllib.request import Request, urlopen
import csv
import json
import math
import os
import re
import subprocess
import threading
import time


ROOT = Path(__file__).resolve().parent
HOST = "0.0.0.0"
PORT = 8765
SETTINGS_PATH = ROOT / "data" / "settings.json"
AIRPORTS_CSV_PATH = ROOT / "data" / "airports.csv"
OPENSKY_CREDENTIALS_PATH = ROOT / "data" / "opensky.json"
OPENSKY_TOKEN_URL = (
    "https://auth.opensky-network.org/auth/realms/opensky-network"
    "/protocol/openid-connect/token"
)
# Cached OAuth2 access token for OpenSky (valid ~30 min). Refreshed on demand.
OPENSKY_TOKEN = {"value": None, "expires_at": 0.0}
AIRPORT_DB_CACHE = None
# Monotonic timestamp until which the adsb.lol primary feed is skipped after a
# failure. Stored in a one-item list so request handlers can mutate it.
ADSBLOL_COOLDOWN_UNTIL = [0.0]
# Short-lived cache of the last aircraft response, keyed by lat/lon/dist. The
# kiosk polls every few seconds; caching keeps us well under the upstream feeds'
# rate limits without feeling stale.
AIRCRAFT_CACHE = {}
# adsb.lol is a community feed with no hard per-user quota, so it can refresh
# quickly. OpenSky authenticated access is 4,000 credits/day (~1 call / 22s),
# so when OpenSky is the active feed we cache longer to stay safely under quota.
AIRCRAFT_CACHE_TTL = 6.0
AIRCRAFT_CACHE_TTL_OPENSKY = 25.0
DEFAULT_SETTINGS = {
    "home": {
        "label": "Mitchell House",
        "lat": 32.9190,
        "lon": -80.1623,
        "rangeMi": 35,
        "sweepSeconds": 5,
        "sweepEnabled": True,
        "roadsEnabled": True,
        "mapEnabled": True,
    }
}


def load_airport_database():
    global AIRPORT_DB_CACHE
    if AIRPORT_DB_CACHE is not None:
        return AIRPORT_DB_CACHE

    airports = {}
    if not AIRPORTS_CSV_PATH.exists():
        AIRPORT_DB_CACHE = airports
        return airports

    with AIRPORTS_CSV_PATH.open("r", encoding="utf-8-sig", newline="") as handle:
        for row in csv.DictReader(handle):
            code = (row.get("iata_code") or "").strip().upper()
            airport_type = (row.get("type") or "").strip()
            if not code or len(code) != 3 or airport_type == "closed":
                continue
            try:
                lat = float(row.get("latitude_deg") or "")
                lon = float(row.get("longitude_deg") or "")
            except ValueError:
                continue
            airports[code] = {
                "code": code,
                "iata": code,
                "icao": (row.get("icao_code") or row.get("gps_code") or row.get("ident") or "").strip().upper(),
                "name": (row.get("name") or code).strip(),
                "municipality": (row.get("municipality") or "").strip(),
                "country": (row.get("iso_country") or "").strip(),
                "lat": lat,
                "lon": lon,
                "type": airport_type,
            }

    AIRPORT_DB_CACHE = airports
    return airports

USPS_SUFFIXES = {
    "ALLEY": "ALY",
    "AVENUE": "AVE",
    "BOULEVARD": "BLVD",
    "CIRCLE": "CIR",
    "COURT": "CT",
    "DRIVE": "DR",
    "EXPRESSWAY": "EXPY",
    "HIGHWAY": "HWY",
    "LANE": "LN",
    "PARKWAY": "PKWY",
    "PLACE": "PL",
    "PLAZA": "PLZ",
    "ROAD": "RD",
    "SQUARE": "SQ",
    "STREET": "ST",
    "TERRACE": "TER",
    "TRAIL": "TRL",
    "WAY": "WAY",
}

ZIP_FALLBACKS = {
    "29485": {
        "city": "Summerville",
        "state": "SC",
        "lat": "33.0185",
        "lon": "-80.1756",
    }
}


# Planespotters (and good API etiquette generally) require a User-Agent that
# identifies the app and a contact URL, otherwise requests are rejected with 403.
USER_AGENT = "DadFlightTracker/0.1 (+https://github.com/insomniac7371/dad-flight-tracker)"


def fetch_json(url, timeout=8, headers=None):
    merged = {
        "Accept": "application/json,text/plain,*/*",
        "User-Agent": USER_AGENT,
    }
    if headers:
        merged.update(headers)
    request = Request(url, headers=merged)
    with urlopen(request, timeout=timeout) as response:
        return json.loads(response.read().decode("utf-8"))


def load_opensky_credentials():
    """Read OpenSky OAuth2 client credentials from env vars or data/opensky.json."""
    client_id = os.environ.get("OPENSKY_CLIENT_ID", "").strip()
    client_secret = os.environ.get("OPENSKY_CLIENT_SECRET", "").strip()
    if client_id and client_secret:
        return client_id, client_secret
    try:
        with OPENSKY_CREDENTIALS_PATH.open("r", encoding="utf-8") as handle:
            creds = json.load(handle)
    except (OSError, json.JSONDecodeError):
        return "", ""
    client_id = str(creds.get("clientId") or creds.get("client_id") or "").strip()
    client_secret = str(creds.get("clientSecret") or creds.get("client_secret") or "").strip()
    return client_id, client_secret


def get_opensky_token(force=False):
    """Return a valid OpenSky access token, or None if no credentials are set."""
    now = time.monotonic()
    if not force and OPENSKY_TOKEN["value"] and now < OPENSKY_TOKEN["expires_at"]:
        return OPENSKY_TOKEN["value"]

    client_id, client_secret = load_opensky_credentials()
    if not client_id or not client_secret:
        return None

    body = urlencode(
        {
            "grant_type": "client_credentials",
            "client_id": client_id,
            "client_secret": client_secret,
        }
    ).encode("utf-8")
    request = Request(
        OPENSKY_TOKEN_URL,
        data=body,
        headers={
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": USER_AGENT,
        },
    )
    try:
        with urlopen(request, timeout=10) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError):
        return None

    token = payload.get("access_token")
    if not token:
        return None
    # Refresh a minute early so an in-flight request never uses an expired token.
    expires_in = payload.get("expires_in", 1800)
    OPENSKY_TOKEN["value"] = token
    OPENSKY_TOKEN["expires_at"] = now + max(60, expires_in - 60)
    return token


def fetch_bytes(url):
    request = Request(
        url,
        headers={
            "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
            "Referer": "https://commons.wikimedia.org/",
            "User-Agent": USER_AGENT,
        },
    )
    with urlopen(request, timeout=12) as response:
        return response.read(), response.headers.get("Content-Type", "image/jpeg")


# OpenSky's numeric emitter categories mapped to the ADS-B "A1".."C3" style
# strings the rest of the app (and the frontend classifier) expects.
OPENSKY_CATEGORY_TO_ADSB = {
    2: "A1",   # Light
    3: "A2",   # Small
    4: "A3",   # Large
    5: "A4",   # High vortex large
    6: "A5",   # Heavy
    7: "A6",   # High performance
    8: "A7",   # Rotorcraft
    9: "B1",   # Glider / sailplane
    10: "B2",  # Lighter-than-air
    11: "B3",  # Parachutist
    12: "B4",  # Ultralight
    14: "B6",  # UAV / drone
    15: "B7",  # Space / trans-atmospheric
}


def normalize_opensky_state(state):
    """Convert one OpenSky state vector into an ADSB.lol-style aircraft dict."""
    if not state or len(state) < 17:
        return None
    lat = state[6]
    lon = state[5]
    if lat is None or lon is None:
        return None

    def feet(meters):
        return round(meters * 3.28084) if isinstance(meters, (int, float)) else None

    velocity = state[9]
    category = state[17] if len(state) > 17 else 0
    return {
        "hex": (state[0] or "").strip(),
        "flight": (state[1] or "").strip(),
        "lat": lat,
        "lon": lon,
        "alt_baro": feet(state[7]),
        "alt_geom": feet(state[13]),
        "gs": round(velocity * 1.943844, 1) if isinstance(velocity, (int, float)) else None,
        "track": state[10],
        "squawk": state[14] or "",
        "category": OPENSKY_CATEGORY_TO_ADSB.get(int(category) if category else 0, ""),
        "r": "",
        "t": "",
    }


def fetch_opensky_aircraft(lat, lon, dist_nm):
    """Fetch nearby aircraft from OpenSky and shape them like the ADSB.lol feed."""
    lat = float(lat)
    lon = float(lon)
    radius_mi = float(dist_nm) * 1.15078
    delta_lat = radius_mi / 69.0
    delta_lon = radius_mi / (69.0 * max(0.1, math.cos(math.radians(lat))))
    params = (
        f"lamin={lat - delta_lat}&lomin={lon - delta_lon}"
        f"&lamax={lat + delta_lat}&lomax={lon + delta_lon}"
    )
    url = f"https://opensky-network.org/api/states/all?{params}"

    token = get_opensky_token()
    auth_headers = {"Authorization": f"Bearer {token}"} if token else None
    try:
        data = fetch_json(url, timeout=15, headers=auth_headers)
    except HTTPError as error:
        # An expired/revoked token answers 401/403 -> refresh once and retry.
        if token and error.code in (401, 403):
            token = get_opensky_token(force=True)
            auth_headers = {"Authorization": f"Bearer {token}"} if token else None
            data = fetch_json(url, timeout=15, headers=auth_headers)
        else:
            raise

    aircraft = [normalize_opensky_state(state) for state in (data.get("states") or [])]
    aircraft = [item for item in aircraft if item]
    return {
        "ac": aircraft,
        "total": len(aircraft),
        "now": data.get("time"),
        "source": "OpenSky Network" + (" (auth)" if token else ""),
    }


def fetch_planespotters_photo(kind, value):
    value = value.strip()
    if not value:
        return None
    url = f"https://api.planespotters.net/pub/photos/{kind}/{quote_plus(value)}"
    data = fetch_json(url)
    if data.get("photos"):
        data["source"] = "Planespotters.net"
        data["generic"] = False
        data["search"] = f"{kind}:{value}"
    return data


def airport_label(airport):
    if not airport:
        return ""
    code = airport.get("iata_code") or airport.get("icao_code") or ""
    name = airport.get("municipality") or airport.get("name") or ""
    return " ".join(part for part in [code, name] if part)


def normalized_airport(airport):
    if not airport:
        return None
    return {
        "iata": airport.get("iata_code") or "",
        "icao": airport.get("icao_code") or "",
        "name": airport.get("name") or "",
        "municipality": airport.get("municipality") or "",
        "country": airport.get("country_name") or "",
        "lat": airport.get("latitude"),
        "lon": airport.get("longitude"),
    }


def normalized_adsblol_airport(airport):
    if not airport:
        return None
    return {
        "iata": airport.get("iata") or "",
        "icao": airport.get("icao") or "",
        "name": airport.get("name") or "",
        "municipality": airport.get("location") or "",
        "country": airport.get("countryiso2") or "",
        "lat": airport.get("lat"),
        "lon": airport.get("lon"),
    }


def adsblol_airport_label(airport):
    if not airport:
        return ""
    code = airport.get("iata") or airport.get("icao") or ""
    location = airport.get("location") or airport.get("name") or ""
    return " ".join(part for part in [code, location] if part)


def fetch_adsblol_route(callsign=""):
    callsign = re.sub(r"[^A-Z0-9]", "", callsign.strip().upper())
    if not callsign:
        return None

    data = fetch_json(f"https://api.adsb.lol/api/0/route/{quote_plus(callsign)}", timeout=15)
    airports = data.get("_airports") or []
    origin = airports[0] if airports else {}
    destination = airports[-1] if len(airports) > 1 else {}
    route_label = data.get("_airport_codes_iata") or data.get("airport_codes") or ""
    airline_code = data.get("airline_code") or ""

    if not route_label and not origin and not destination:
        return None

    return {
        "aircraft": {},
        "route": {
            "callsign": data.get("callsign") or callsign,
            "airline": airline_code,
            "airports": [normalized_adsblol_airport(airport) for airport in airports],
            "origin": normalized_adsblol_airport(origin),
            "destination": normalized_adsblol_airport(destination),
            "originLabel": adsblol_airport_label(origin),
            "destinationLabel": adsblol_airport_label(destination),
            "routeLabel": route_label.replace("-", " -> "),
        },
        "source": "ADSB.lol route",
    }


def adsbdb_url(path):
    return f"https://api.adsbdb.com/v0/{path}"


def fetch_adsbdb_info(icao="", registration="", callsign=""):
    identifier = (icao or registration).strip().upper()
    callsign = callsign.strip().upper()
    payload = {}

    if identifier:
        url = adsbdb_url(f"aircraft/{quote_plus(identifier)}")
        if callsign:
            url += f"?callsign={quote_plus(callsign)}"
        try:
            payload = fetch_json(url).get("response") or {}
        except (HTTPError, URLError, TimeoutError, json.JSONDecodeError):
            payload = {}

    if callsign and not payload.get("flightroute"):
        try:
            route_payload = fetch_json(adsbdb_url(f"callsign/{quote_plus(callsign)}")).get("response") or {}
            if route_payload.get("flightroute"):
                payload["flightroute"] = route_payload["flightroute"]
        except (HTTPError, URLError, TimeoutError, json.JSONDecodeError):
            pass

    if not payload:
        return None

    aircraft = payload.get("aircraft") or {}
    route = payload.get("flightroute") or {}
    origin = route.get("origin") or {}
    destination = route.get("destination") or {}
    airline = route.get("airline") or {}

    return {
        "aircraft": {
            "type": aircraft.get("type") or "",
            "icaoType": aircraft.get("icao_type") or "",
            "manufacturer": aircraft.get("manufacturer") or "",
            "registration": aircraft.get("registration") or "",
            "owner": aircraft.get("registered_owner") or "",
            "photo": aircraft.get("url_photo") or "",
            "thumbnail": aircraft.get("url_photo_thumbnail") or "",
        },
        "route": {
            "callsign": route.get("callsign") or callsign,
            "airline": airline.get("name") or "",
            "origin": normalized_airport(origin),
            "destination": normalized_airport(destination),
            "originLabel": airport_label(origin),
            "destinationLabel": airport_label(destination),
        },
        "source": "ADSBDB",
    }


AIRLINE_ALIASES = {
    "american airlines": ["american airlines", "american eagle", "aal"],
    "delta air lines": ["delta air lines", "delta airlines", "delta", "dal"],
    "southwest airlines": ["southwest airlines", "southwest", "swa"],
    "united airlines": ["united airlines", "united", "ual"],
    "jetblue airways": ["jetblue airways", "jetblue", "jbu"],
    "frontier airlines": ["frontier airlines", "frontier", "fft"],
    "spirit airlines": ["spirit airlines", "spirit", "nks"],
    "alaska airlines": ["alaska airlines", "alaska", "asa"],
}


def airline_aliases(airline):
    normalized = airline.strip().lower()
    if not normalized:
        return []
    return AIRLINE_ALIASES.get(normalized, [normalized])


def looks_like_registration(value):
    return bool(value and re.match(r"^[A-Z]{1,3}[A-Z0-9-]{2,8}$", value.strip().upper()))


def looks_like_aircraft_model(value):
    return bool(value and re.match(r"^[A-Z0-9]{2,5}$", value.strip().upper()))


def commons_photo(search_terms, airline="", required_text=""):
    required_aliases = airline_aliases(airline)
    required_text = required_text.strip().lower()
    for search in search_terms:
        search = search.strip()
        if not search:
            continue
        commons_url = (
            "https://commons.wikimedia.org/w/api.php"
            "?action=query&generator=search&gsrnamespace=6"
            f"&gsrsearch={quote_plus(search + ' aircraft')}"
            "&gsrlimit=1&prop=imageinfo&iiprop=url&iiurlwidth=420&format=json"
        )
        data = fetch_json(commons_url)
        pages = data.get("query", {}).get("pages", {})
        page = next(iter(pages.values()), {})
        info = (page.get("imageinfo") or [{}])[0]
        image_url = info.get("thumburl") or info.get("url")
        candidate_text = " ".join(
            str(part or "")
            for part in [page.get("title"), info.get("descriptionurl"), image_url]
        ).lower()
        if required_aliases and not any(alias in candidate_text for alias in required_aliases):
            continue
        if required_text and required_text not in candidate_text:
            continue
        if image_url:
            return {
                "source": "Wikimedia Commons",
                "generic": True,
                "search": search,
                "photos": [
                    {
                        "thumbnail_large": {"src": image_url},
                        "link": info.get("descriptionurl", ""),
                    }
                ],
            }
    return None


def load_settings():
    if not SETTINGS_PATH.exists():
        return DEFAULT_SETTINGS
    try:
        with SETTINGS_PATH.open("r", encoding="utf-8") as handle:
            data = json.load(handle)
    except (OSError, json.JSONDecodeError):
        return DEFAULT_SETTINGS

    home = data.get("home", {})
    return {
        "home": {
            "label": str(home.get("label") or DEFAULT_SETTINGS["home"]["label"])[:80],
            "lat": bounded_float(home.get("lat"), -90, 90, DEFAULT_SETTINGS["home"]["lat"]),
            "lon": bounded_float(home.get("lon"), -180, 180, DEFAULT_SETTINGS["home"]["lon"]),
            "rangeMi": bounded_float(home.get("rangeMi"), 5, 100, DEFAULT_SETTINGS["home"]["rangeMi"]),
            "sweepSeconds": bounded_float(home.get("sweepSeconds"), 2, 12, DEFAULT_SETTINGS["home"]["sweepSeconds"]),
            "sweepEnabled": bool(home.get("sweepEnabled", DEFAULT_SETTINGS["home"]["sweepEnabled"])),
            "roadsEnabled": bool(home.get("roadsEnabled", DEFAULT_SETTINGS["home"]["roadsEnabled"])),
            "mapEnabled": bool(home.get("mapEnabled", DEFAULT_SETTINGS["home"]["mapEnabled"])),
        }
    }


def bounded_float(value, minimum, maximum, fallback):
    try:
        number = float(value)
    except (TypeError, ValueError):
        return fallback
    if minimum <= number <= maximum:
        return number
    return fallback


def save_settings(payload):
    home = payload.get("home", {})
    settings = {
        "home": {
            "label": str(home.get("label") or DEFAULT_SETTINGS["home"]["label"])[:80],
            "lat": bounded_float(home.get("lat"), -90, 90, DEFAULT_SETTINGS["home"]["lat"]),
            "lon": bounded_float(home.get("lon"), -180, 180, DEFAULT_SETTINGS["home"]["lon"]),
            "rangeMi": bounded_float(home.get("rangeMi"), 5, 100, DEFAULT_SETTINGS["home"]["rangeMi"]),
            "sweepSeconds": bounded_float(home.get("sweepSeconds"), 2, 12, DEFAULT_SETTINGS["home"]["sweepSeconds"]),
            "sweepEnabled": bool(home.get("sweepEnabled", DEFAULT_SETTINGS["home"]["sweepEnabled"])),
            "roadsEnabled": bool(home.get("roadsEnabled", DEFAULT_SETTINGS["home"]["roadsEnabled"])),
            "mapEnabled": bool(home.get("mapEnabled", DEFAULT_SETTINGS["home"]["mapEnabled"])),
        }
    }
    SETTINGS_PATH.parent.mkdir(parents=True, exist_ok=True)
    with SETTINGS_PATH.open("w", encoding="utf-8") as handle:
        json.dump(settings, handle, indent=2)
        handle.write("\n")
    return settings


def scan_wifi_networks():
    fallback = [
        {"ssid": "HomeMesh-5G", "signal": 92, "secure": True},
        {"ssid": "HomeMesh-2G", "signal": 78, "secure": True},
        {"ssid": "DadFlight-Setup", "signal": 64, "secure": False},
    ]
    commands = [
        ["nmcli", "-t", "-f", "SSID,SIGNAL,SECURITY", "dev", "wifi", "list", "--rescan", "yes"],
        ["iwlist", "wlan0", "scan"],
    ]
    for command in commands:
        try:
            output = subprocess.check_output(command, text=True, timeout=8, stderr=subprocess.DEVNULL)
        except Exception:
            continue
        networks = []
        if command[0] == "nmcli":
            for line in output.splitlines():
                parts = line.split(":")
                if not parts or not parts[0].strip():
                    continue
                networks.append(
                    {
                        "ssid": parts[0].strip(),
                        "signal": int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else 0,
                        "secure": len(parts) > 2 and bool(parts[2].strip()),
                    }
                )
        else:
            current = None
            for raw in output.splitlines():
                line = raw.strip()
                if "ESSID:" in line:
                    ssid = line.split("ESSID:", 1)[1].strip().strip('"')
                    if ssid:
                        current = {"ssid": ssid, "signal": 0, "secure": False}
                        networks.append(current)
                elif current and "Quality=" in line:
                    quality = line.split("Quality=", 1)[1].split()[0]
                    try:
                        value, total = quality.split("/")
                        current["signal"] = round((int(value) / int(total)) * 100)
                    except Exception:
                        pass
                elif current and "Encryption key:on" in line:
                    current["secure"] = True
        if networks:
            unique = {}
            for network in networks:
                unique[network["ssid"]] = network
            return sorted(unique.values(), key=lambda item: item.get("signal", 0), reverse=True)
    return fallback


def nominatim_search_url(params):
    return "https://nominatim.openstreetmap.org/search?" + "&".join(params)


def census_address_url(street, city="", state="", postal=""):
    params = [
        f"street={quote_plus(street)}",
        "benchmark=Public_AR_Current",
        "format=json",
    ]
    if city:
        params.append(f"city={quote_plus(city)}")
    if state:
        params.append(f"state={quote_plus(state)}")
    if postal:
        params.append(f"zip={quote_plus(postal)}")
    return "https://geocoding.geo.census.gov/geocoder/locations/address?" + "&".join(params)


def census_oneline_url(address):
    return (
        "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?"
        f"address={quote_plus(address)}&benchmark=Public_AR_Current&format=json"
    )


def zippopotam_url(postal):
    return f"https://api.zippopotam.us/us/{quote_plus(postal)}"


def standardize_street_suffix(street):
    parts = street.split()
    if not parts:
        return street
    last = parts[-1].upper().rstrip(".")
    if last in USPS_SUFFIXES:
        parts[-1] = USPS_SUFFIXES[last]
    return " ".join(parts)


def postal_fallback(postal, city="", state=""):
    if not postal:
        return None
    try:
        data = fetch_json(zippopotam_url(postal))
        place = (data.get("places") or [{}])[0]
        lat = place.get("latitude", "")
        lon = place.get("longitude", "")
        if lat and lon:
            return {
                "city": place.get("place name") or city,
                "state": place.get("state abbreviation") or state,
                "lat": lat,
                "lon": lon,
            }
    except Exception:
        pass
    return ZIP_FALLBACKS.get(postal)


def suggestion_from_nominatim(result):
    address = result.get("address", {})
    house = address.get("house_number", "")
    road = address.get("road") or address.get("pedestrian") or address.get("footway") or ""
    street = standardize_street_suffix(" ".join(part for part in [house, road] if part))
    city = address.get("city") or address.get("town") or address.get("village") or address.get("hamlet") or ""
    state = address.get("state", "")
    postal = address.get("postcode", "")
    label = street or result.get("display_name", "Address")
    locality = ", ".join(part for part in [city, state, postal] if part)
    return {
        "street": street,
        "city": city,
        "state": state,
        "postal": postal,
        "lat": result.get("lat"),
        "lon": result.get("lon"),
        "label": label,
        "secondary": locality,
        "display_name": result.get("display_name", label),
        "standard": "USPS Publication 28 suffix style",
        "accuracy": "exact",
    }


def suggestion_from_census(result, city="", state="", postal=""):
    address = result.get("matchedAddress", "")
    coordinates = result.get("coordinates", {})
    parts = [part.strip() for part in address.split(",")]
    street = standardize_street_suffix(parts[0]) if parts else ""
    city_value = parts[1].title() if len(parts) > 1 else city
    state_zip = parts[2].strip().split() if len(parts) > 2 else []
    state_value = state_zip[0].upper() if state_zip else state.upper()
    postal_value = state_zip[1] if len(state_zip) > 1 else postal
    secondary = ", ".join(part for part in [city_value, state_value, postal_value] if part)
    return {
        "street": street,
        "city": city_value,
        "state": state_value,
        "postal": postal_value,
        "lat": coordinates.get("y", ""),
        "lon": coordinates.get("x", ""),
        "label": street or address,
        "secondary": secondary,
        "display_name": address or ", ".join(part for part in [street, secondary] if part),
        "standard": "U.S. Census address candidate",
        "accuracy": "exact",
    }


def find_address_suggestions(address, city="", state="", postal=""):
    standardized_street = standardize_street_suffix(address)
    display_city = "Summerville" if city.strip().lower() == "summervile" and postal == "29485" else city
    fallback = postal_fallback(postal, display_city, state)
    local = {
        "street": standardized_street,
        "city": (fallback or {}).get("city", display_city),
        "state": (fallback or {}).get("state", state.upper()),
        "postal": postal,
        "lat": (fallback or {}).get("lat", ""),
        "lon": (fallback or {}).get("lon", ""),
        "label": standardized_street,
        "secondary": ", ".join(part for part in [(fallback or {}).get("city", display_city), (fallback or {}).get("state", state.upper()), postal] if part) or "USPS-style standardized entry",
        "display_name": ", ".join(part for part in [standardized_street, (fallback or {}).get("city", display_city), (fallback or {}).get("state", state.upper()), postal] if part),
        "standard": "ZIP/city approximate fallback" if fallback else "USPS Publication 28 suffix style",
        "accuracy": "approximate" if fallback else "standardized",
    }
    one_line_attempts = [
        ", ".join(part for part in [address, city, state, postal] if part),
        ", ".join(part for part in [standardized_street, display_city, state, postal] if part),
        ", ".join(part for part in [standardized_street, state, postal] if part),
    ]
    seen_one_line = set()
    for full_address in one_line_attempts:
        if not full_address or full_address in seen_one_line:
            continue
        seen_one_line.add(full_address)
        try:
            data = fetch_json(census_oneline_url(full_address))
            matches = data.get("result", {}).get("addressMatches", [])
        except Exception:
            matches = []
        if matches:
            return [suggestion_from_census(item, display_city, state, postal) for item in matches[:5]]

    census_attempts = [
        (address, display_city, state, postal),
        (standardized_street, display_city, state, postal),
        (standardized_street, "", state, postal),
        (standardized_street, "", "", postal),
    ]
    seen_census_urls = set()
    for street_part, city_part, state_part, postal_part in census_attempts:
        url = census_address_url(street_part, city_part, state_part, postal_part)
        if url in seen_census_urls:
            continue
        seen_census_urls.add(url)
        try:
            data = fetch_json(url)
            matches = data.get("result", {}).get("addressMatches", [])
        except Exception:
            matches = []
        if matches:
            return [suggestion_from_census(item, city, state, postal) for item in matches[:5]]

    search = ", ".join(part for part in [address, city, state, postal] if part)
    url = nominatim_search_url(
        [
            f"q={quote_plus(search)}",
            "format=jsonv2",
            "addressdetails=1",
            "limit=5",
            "countrycodes=us",
        ]
    )
    try:
        results = fetch_json(url)
    except Exception:
        return [local]
    suggestions = [suggestion_from_nominatim(item) for item in results]
    suggestions = [item for item in suggestions if item.get("lat") and item.get("lon")]
    return (suggestions[:5] or [local])


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def send_json(self, status, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def end_headers(self):
        # Force fresh static assets (index.html/app.js/styles.css) on every load
        # so the kiosk never runs stale cached JS/CSS after an OTA update. Only
        # applied to responses that haven't already set Cache-Control themselves
        # (the API routes send "no-store"; aircraft photos send a max-age).
        if not any(h.lower().startswith(b"cache-control") for h in self._headers_buffer):
            self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        import sys; sys.stderr.write(f"[GET] {parsed.path}\n"); sys.stderr.flush()

        if parsed.path == "/api/settings":
            self.send_json(200, load_settings())
            return

        if parsed.path == "/api/aircraft":
            query = parse_qs(parsed.query)
            lat = query.get("lat", ["39.9526"])[0]
            lon = query.get("lon", ["-75.1652"])[0]
            dist = query.get("dist", ["35"])[0]
            now = time.monotonic()

            cache_key = f"{lat}/{lon}/{dist}"
            cached = AIRCRAFT_CACHE.get(cache_key)
            if cached:
                cached_source = str(cached[1].get("source", ""))
                ttl = AIRCRAFT_CACHE_TTL_OPENSKY if cached_source.startswith("OpenSky") else AIRCRAFT_CACHE_TTL
                if now - cached[0] < ttl:
                    self.send_json(200, cached[1])
                    return

            url = f"https://api.adsb.lol/v2/lat/{lat}/lon/{lon}/dist/{dist}"
            # Skip the primary feed for a cooldown window after it fails so the
            # kiosk does not pay the connection timeout on every poll.
            if now >= ADSBLOL_COOLDOWN_UNTIL[0]:
                try:
                    data = fetch_json(url, timeout=5)
                    data.setdefault("source", "ADSB.lol live")
                    AIRCRAFT_CACHE[cache_key] = (now, data)
                    self.send_json(200, data)
                    return
                except (HTTPError, URLError, TimeoutError, json.JSONDecodeError, ValueError):
                    ADSBLOL_COOLDOWN_UNTIL[0] = now + 60
            # adsb.lol unavailable: fall back to OpenSky's open feed.
            try:
                data = fetch_opensky_aircraft(lat, lon, dist)
                AIRCRAFT_CACHE[cache_key] = (now, data)
                self.send_json(200, data)
            except (HTTPError, URLError, TimeoutError, json.JSONDecodeError, ValueError) as error:
                # Serve the last good response if we have one, even if stale.
                if cached:
                    self.send_json(200, cached[1])
                else:
                    self.send_json(502, {"error": "aircraft_source_unavailable", "detail": str(error)})
            return

        if parsed.path == "/api/airports":
            airports = load_airport_database()
            self.send_json(200, {"count": len(airports), "airports": airports})
            return

        if parsed.path == "/api/wifi-scan":
            self.send_json(200, {"networks": scan_wifi_networks()})
            return

        if parsed.path == "/api/flight-info":
            query = parse_qs(parsed.query)
            icao = query.get("icao", [""])[0]
            registration = query.get("registration", [""])[0]
            callsign = query.get("callsign", [""])[0]
            info = fetch_adsbdb_info(icao, registration, callsign)
            if info:
                self.send_json(200, info)
            else:
                self.send_json(404, {"error": "flight_info_not_found"})
            return

        if parsed.path == "/api/route":
            query = parse_qs(parsed.query)
            callsign = query.get("callsign", [""])[0]
            try:
                route = fetch_adsblol_route(callsign)
            except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as error:
                self.send_json(502, {"error": "route_source_unavailable", "detail": str(error)})
                return
            if route:
                self.send_json(200, route)
            else:
                self.send_json(404, {"error": "route_not_found"})
            return

        if parsed.path == "/api/photo":
            query = parse_qs(parsed.query)
            icao = query.get("icao", [""])[0].strip().lower()
            query_text = query.get("query", [""])[0].strip()
            callsign = query.get("callsign", [""])[0].strip()
            airline = query.get("airline", [""])[0].strip()
            model = query.get("model", [""])[0].strip()
            aircraft_type = query.get("type", [""])[0].strip()

            if icao:
                try:
                    self.send_json(200, fetch_planespotters_photo("hex", icao))
                    return
                except (HTTPError, URLError, TimeoutError, json.JSONDecodeError):
                    pass
            if looks_like_registration(query_text):
                try:
                    self.send_json(200, fetch_planespotters_photo("reg", query_text.upper()))
                    return
                except (HTTPError, URLError, TimeoutError, json.JSONDecodeError):
                    pass

            try:
                if airline:
                    fallback_terms = [
                        " ".join(part for part in [airline, callsign, model] if part),
                        " ".join(part for part in [airline, query_text, model] if part),
                        " ".join(part for part in [airline, model] if part),
                        " ".join(part for part in [airline, aircraft_type] if part),
                    ]
                    fallback = commons_photo(fallback_terms, airline=airline)
                else:
                    fallback = None
                    if looks_like_registration(query_text):
                        fallback = commons_photo([query_text], required_text=query_text)
                    if not fallback and looks_like_aircraft_model(model):
                        fallback = commons_photo([model])
                if fallback:
                    self.send_json(200, fallback)
                else:
                    self.send_json(404, {"error": "photo_not_found"})
            except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as error:
                self.send_json(502, {"error": "photo_source_unavailable", "detail": str(error)})
            return

        if parsed.path in {"/api/address-suggest", "/api/address_suggest"}:
            query = parse_qs(parsed.query)
            address = query.get("q", [""])[0].strip()
            city = query.get("city", [""])[0].strip()
            state = query.get("state", [""])[0].strip()
            postal = query.get("postal", [""])[0].strip()
            if len(address) < 4:
                self.send_json(200, {"suggestions": []})
                return

            try:
                self.send_json(200, {"suggestions": find_address_suggestions(address, city, state, postal)})
            except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as error:
                self.send_json(502, {"error": "address_suggest_unavailable", "detail": str(error)})
            return

        if parsed.path == "/api/geocode":
            query = parse_qs(parsed.query)
            address = query.get("q", [""])[0].strip()
            street = query.get("street", [""])[0].strip()
            city = query.get("city", [""])[0].strip()
            state = query.get("state", [""])[0].strip()
            postal = query.get("postal", [""])[0].strip()
            if not address:
                self.send_json(400, {"error": "missing_address"})
                return

            try:
                if street:
                    census_suggestions = find_address_suggestions(street, city, state, postal)
                    census_match = next((item for item in census_suggestions if item.get("lat") and item.get("lon")), None)
                    if census_match:
                        self.send_json(
                            200,
                            {
                                "lat": census_match.get("lat"),
                                "lon": census_match.get("lon"),
                                "display_name": census_match.get("display_name", address),
                                "source": census_match.get("standard", "U.S. Census address candidate"),
                                "accuracy": census_match.get("accuracy", ""),
                            },
                        )
                        return

                attempts = []
                if street and (city or state or postal):
                    structured = [
                        f"street={quote_plus(street)}",
                        f"format=jsonv2",
                        f"addressdetails=1",
                        f"limit=1",
                        f"countrycodes=us",
                    ]
                    if city:
                        structured.append(f"city={quote_plus(city)}")
                    if state:
                        structured.append(f"state={quote_plus(state)}")
                    if postal:
                        structured.append(f"postalcode={quote_plus(postal)}")
                    attempts.append(nominatim_search_url(structured))

                variants = [address]
                if street and (city or state or postal):
                    variants.append(", ".join(part for part in [street, city, state, postal] if part))
                variants.append(f"{address}, United States")

                seen = set()
                for variant in variants:
                    if variant and variant not in seen:
                        seen.add(variant)
                        attempts.append(
                            nominatim_search_url(
                                [
                                    f"q={quote_plus(variant)}",
                                    "format=jsonv2",
                                    "addressdetails=1",
                                    "limit=1",
                                    "countrycodes=us",
                                ]
                            )
                        )

                results = []
                for url in attempts:
                    results = fetch_json(url)
                    if results:
                        break

                if not results:
                    fallback = postal_fallback(postal, city, state)
                    if fallback:
                        display_city = fallback.get("city") or city
                        display_state = fallback.get("state") or state
                        self.send_json(
                            200,
                            {
                                "lat": fallback.get("lat"),
                                "lon": fallback.get("lon"),
                                "display_name": ", ".join(part for part in [street or address, display_city, display_state, postal] if part),
                                "source": "ZIP/city approximate fallback",
                                "accuracy": "approximate",
                            },
                        )
                        return
                    self.send_json(404, {"error": "address_not_found"})
                    return
                first = results[0]
                self.send_json(
                    200,
                    {
                        "lat": first.get("lat"),
                        "lon": first.get("lon"),
                        "display_name": first.get("display_name", address),
                    },
                )
            except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as error:
                self.send_json(502, {"error": "geocode_source_unavailable", "detail": str(error)})
            return

        if parsed.path == "/api/weather":
            query = parse_qs(parsed.query)
            lat = query.get("lat", [str(DEFAULT_SETTINGS["home"]["lat"])])[0]
            lon = query.get("lon", [str(DEFAULT_SETTINGS["home"]["lon"])])[0]
            result = {}

            # Fetch Open-Meteo and NWS alerts concurrently so the total wait is
            # max(om_time, nws_time) instead of sum(om_time, nws_time).
            om_url = (
                "https://api.open-meteo.com/v1/forecast"
                f"?latitude={lat}&longitude={lon}"
                "&current=temperature_2m,relative_humidity_2m,apparent_temperature"
                ",wind_speed_10m,wind_direction_10m,weather_code,precipitation,pressure_msl"
                "&wind_speed_unit=mph&temperature_unit=fahrenheit&timezone=auto"
            )
            alerts_url = f"https://api.weather.gov/alerts/active?point={lat},{lon}"

            om_result = {}
            nws_result = {}

            def fetch_om():
                try:
                    om = fetch_json(om_url, timeout=8)
                    om_result["current"] = om.get("current", {})
                    om_result["timezone"] = om.get("timezone", "")
                except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as err:
                    om_result["current"] = {}
                    om_result["current_error"] = str(err)

            def fetch_alerts():
                try:
                    nws = fetch_json(alerts_url, timeout=5, headers={"Accept": "application/geo+json"})
                    features = nws.get("features") or []
                    nws_result["alerts"] = [
                        {
                            "event": f.get("properties", {}).get("event", ""),
                            "headline": f.get("properties", {}).get("headline", ""),
                            "severity": f.get("properties", {}).get("severity", ""),
                            "urgency": f.get("properties", {}).get("urgency", ""),
                            "description": (f.get("properties", {}).get("description") or "")[:200],
                        }
                        for f in features[:3]
                    ]
                except (HTTPError, URLError, TimeoutError, json.JSONDecodeError):
                    nws_result["alerts"] = []

            t1 = threading.Thread(target=fetch_om, daemon=True)
            t2 = threading.Thread(target=fetch_alerts, daemon=True)
            t1.start(); t2.start()
            t1.join(timeout=9); t2.join(timeout=6)

            result.update(om_result)
            result.update(nws_result)
            if "alerts" not in result:
                result["alerts"] = []

            self.send_json(200, result)
            return

        if parsed.path == "/api/radar-tile":
            query = parse_qs(parsed.query)
            try:
                west = float(query.get("west", ["-84.0"])[0])
                south = float(query.get("south", ["31.0"])[0])
                east = float(query.get("east", ["-77.0"])[0])
                north = float(query.get("north", ["36.0"])[0])
                width = int(query.get("width", ["520"])[0])
                height = int(query.get("height", ["380"])[0])
                # Clamp to sane bounds
                west = max(-180.0, min(west, 180.0))
                east = max(-180.0, min(east, 180.0))
                south = max(-90.0, min(south, 90.0))
                north = max(-90.0, min(north, 90.0))
                width = max(100, min(width, 1200))
                height = max(100, min(height, 900))
            except (TypeError, ValueError) as error:
                self.send_json(400, {"error": "invalid_bbox", "detail": str(error)})
                return

            wms_url = (
                "https://opengeo.ncep.noaa.gov/geoserver/conus/conus_bref_qcd/ows"
                "?service=WMS&version=1.1.1&request=GetMap"
                "&layers=conus_bref_qcd"
                f"&bbox={west},{south},{east},{north}"
                f"&width={width}&height={height}"
                "&srs=EPSG:4326&styles=&format=image/png&transparent=true"
            )
            try:
                request = Request(wms_url, headers={"User-Agent": USER_AGENT, "Accept": "image/png,*/*"})
                with urlopen(request, timeout=15) as response:
                    body = response.read()
                    ct = response.headers.get("Content-Type", "image/png")
                self.send_response(200)
                self.send_header("Content-Type", ct)
                self.send_header("Content-Length", str(len(body)))
                self.send_header("Cache-Control", "public, max-age=60")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(body)
            except (HTTPError, URLError, TimeoutError) as error:
                self.send_json(502, {"error": "radar_source_unavailable", "detail": str(error)})
            return

        if parsed.path == "/api/image":
            query = parse_qs(parsed.query)
            image_url = query.get("url", [""])[0].strip()
            host = urlparse(image_url).netloc.lower()
            allowed_image_hosts = {
                "upload.wikimedia.org",
                "cdn.jetphotos.com",
                "cdn.planespotters.net",
                "t.plnspttrs.net",
            }
            if not image_url or host not in allowed_image_hosts:
                self.send_json(400, {"error": "image_url_not_allowed"})
                return

            try:
                body, content_type = fetch_bytes(image_url)
                self.send_response(200)
                self.send_header("Content-Type", content_type)
                self.send_header("Content-Length", str(len(body)))
                self.send_header("Cache-Control", "public, max-age=86400")
                self.end_headers()
                self.wfile.write(body)
            except (HTTPError, URLError, TimeoutError) as error:
                self.send_json(502, {"error": "image_source_unavailable", "detail": str(error)})
            return

        super().do_GET()

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type,Accept")
        self.end_headers()

    def do_POST(self):
        parsed = urlparse(self.path)

        if parsed.path == "/api/settings":
            try:
                length = int(self.headers.get("Content-Length", "0"))
                raw = self.rfile.read(length).decode("utf-8")
                payload = json.loads(raw or "{}")
                self.send_json(200, save_settings(payload))
            except (OSError, ValueError, json.JSONDecodeError) as error:
                self.send_json(400, {"error": "settings_save_failed", "detail": str(error)})
            return

        self.send_json(404, {"error": "not_found"})


if __name__ == "__main__":
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"Serving Dad Flight Tracker prototype at http://{HOST}:{PORT}")
    server.serve_forever()
