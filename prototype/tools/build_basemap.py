"""Build a very-low-detail offline basemap for the radar reference layer.

Writes a single compact JSON the kiosk loads at runtime (no runtime API calls):

- US state outlines    (folium example data; US Census cartographic source)
- World country outlines (Natural Earth 110m admin_0, public domain)
- Roads near home       (OpenStreetMap via Overpass): interstates, US routes,
                         and state routes (e.g. SC 61), classified and labelled

State/country outlines are global and home-independent. Roads are fetched for a
region around the saved home (data/settings.json) because OSM is the only source
with state-route coverage; re-run this if the home moves far. Pure standard
library so it runs anywhere Python runs (including the Pi).

    python tools/build_basemap.py

Output: prototype/assets/basemap.json, coordinates as [lat, lon] rounded to
4 decimals for roads / 3 for outlines.
"""

from pathlib import Path
from urllib.request import Request, urlopen
import json
import math
import time
import urllib.parse

ROOT = Path(__file__).resolve().parents[1]
CACHE_DIR = Path(__file__).resolve().parent / ".cache"
OUTPUT_PATH = ROOT / "assets" / "basemap.json"
SETTINGS_PATH = ROOT / "data" / "settings.json"
USER_AGENT = "DadFlightTracker-basemap-build/1.0 (+https://github.com/insomniac7371/dad-flight-tracker)"

OUTLINE_SOURCES = {
    "states": "https://raw.githubusercontent.com/python-visualization/folium/main/examples/data/us-states.json",
    "countries": "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson",
}
OVERPASS_ENDPOINT = "https://overpass-api.de/api/interpreter"

# Outline simplification (degrees) and island pruning.
STATE_TOLERANCE = 0.04
COUNTRY_TOLERANCE = 0.08
MIN_RING_SPAN = 0.25

# Roads: region half-size around home (degrees ~= 104 mi) and detail.
ROAD_REGION_DEG = 1.5
ROAD_TOLERANCE = 0.008
DEFAULT_HOME = {"lat": 32.91909, "lon": -80.16536}


# ---------------------------------------------------------------- geometry ---
def perpendicular_distance(point, start, end):
    (px, py), (sx, sy), (ex, ey) = point, start, end
    dx, dy = ex - sx, ey - sy
    if dx == 0 and dy == 0:
        return math.hypot(px - sx, py - sy)
    t = ((px - sx) * dx + (py - sy) * dy) / (dx * dx + dy * dy)
    t = max(0.0, min(1.0, t))
    return math.hypot(px - (sx + t * dx), py - (sy + t * dy))


def simplify(points, tolerance):
    """Iterative Ramer-Douglas-Peucker (avoids recursion limits on big rings)."""
    if len(points) < 3:
        return points
    keep = [False] * len(points)
    keep[0] = keep[-1] = True
    stack = [(0, len(points) - 1)]
    while stack:
        first, last = stack.pop()
        dmax, index = 0.0, first
        for i in range(first + 1, last):
            d = perpendicular_distance(points[i], points[first], points[last])
            if d > dmax:
                dmax, index = d, i
        if dmax > tolerance:
            keep[index] = True
            stack.append((first, index))
            stack.append((index, last))
    return [points[i] for i, flag in enumerate(keep) if flag]


def round_coords(points, decimals):
    return [[round(lat, decimals), round(lon, decimals)] for lat, lon in points]


def ring_span(points):
    lats = [p[0] for p in points]
    lons = [p[1] for p in points]
    return math.hypot(max(lats) - min(lats), max(lons) - min(lons))


def lonlat_to_latlon(ring):
    return [[lat, lon] for lon, lat in ring]


# ------------------------------------------------------------- outlines ------
def fetch_text(url, cache_name):
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cached = CACHE_DIR / cache_name
    if cached.exists():
        return cached.read_text(encoding="utf-8")
    print(f"  downloading {url} ...")
    request = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(request, timeout=180) as response:
        raw = response.read().decode("utf-8")
    cached.write_text(raw, encoding="utf-8")
    return raw


def polygon_rings(geometry):
    gtype = geometry.get("type")
    coords = geometry.get("coordinates") or []
    if gtype == "Polygon":
        rings = coords[:1]
    elif gtype == "MultiPolygon":
        rings = [polygon[0] for polygon in coords if polygon]
    else:
        rings = []
    return [lonlat_to_latlon(ring) for ring in rings]


def build_outline_set(geojson_text, tolerance):
    geojson = json.loads(geojson_text)
    outlines = []
    for feature in geojson.get("features", []):
        for ring in polygon_rings(feature.get("geometry") or {}):
            if len(ring) < 4 or ring_span(ring) < MIN_RING_SPAN:
                continue
            simplified = simplify(ring, tolerance)
            if len(simplified) >= 4:
                outlines.append(round_coords(simplified, 3))
    return outlines


# ---------------------------------------------------------------- roads ------
def load_home():
    try:
        home = json.loads(SETTINGS_PATH.read_text(encoding="utf-8")).get("home", {})
        return {"lat": float(home["lat"]), "lon": float(home["lon"])}
    except (OSError, KeyError, ValueError, json.JSONDecodeError):
        return dict(DEFAULT_HOME)


def road_class(ref):
    ref = ref.strip()
    if ref.startswith("I ") or ref.startswith("I-"):
        return "interstate"
    if ref.startswith("US "):
        return "us"
    return "state"


def road_label(ref):
    # Refs can be like "SC 91;SC 165;US 17 Alternate" - take the first route.
    first = ref.replace(",", ";").split(";")[0].strip()
    if first.startswith("I "):
        first = "I-" + first[2:]
    return first


def fetch_overpass_roads(home):
    south = home["lat"] - ROAD_REGION_DEG
    north = home["lat"] + ROAD_REGION_DEG
    west = home["lon"] - ROAD_REGION_DEG
    east = home["lon"] + ROAD_REGION_DEG
    # Numbered routes only (ref starts with I / US / two-letter state + number),
    # which excludes minor county roads and keeps the file low-detail.
    query = (
        "[out:json][timeout:150];"
        'way[highway~"^(motorway|trunk|primary|secondary)$"]'
        '["ref"~"^(I|US|[A-Z][A-Z]) [0-9]"]'
        f"({south:.5f},{west:.5f},{north:.5f},{east:.5f});"
        "out tags geom;"
    )
    body = urllib.parse.urlencode({"data": query}).encode("utf-8")
    request = Request(OVERPASS_ENDPOINT, data=body, headers={"User-Agent": USER_AGENT})
    last_error = None
    for attempt in range(5):
        try:
            print(f"  querying Overpass (attempt {attempt + 1}/5) ...")
            with urlopen(request, timeout=180) as response:
                return json.loads(response.read().decode("utf-8"))
        except Exception as error:  # noqa: BLE001 - retry any transient failure
            last_error = error
            time.sleep(10)
    raise RuntimeError(f"Overpass unavailable: {last_error}")


def endpoint_key(point):
    return (round(point[0], 5), round(point[1], 5))


def merge_segments(segments):
    """Chain OSM way segments that share endpoints into long polylines.

    OSM splits each route into many small ways (at every junction). Stitching
    them back together keeps the rendered/SVG path count - and the file - small.
    """
    from collections import defaultdict

    endpoint_map = defaultdict(list)
    for index, segment in enumerate(segments):
        endpoint_map[endpoint_key(segment[0])].append(index)
        endpoint_map[endpoint_key(segment[-1])].append(index)

    used = [False] * len(segments)
    merged = []
    for start in range(len(segments)):
        if used[start]:
            continue
        used[start] = True
        chain = list(segments[start])

        extended = True
        while extended:
            extended = False
            tail = endpoint_key(chain[-1])
            for j in endpoint_map.get(tail, []):
                if used[j]:
                    continue
                seg = segments[j]
                if endpoint_key(seg[0]) == tail:
                    chain.extend(seg[1:])
                elif endpoint_key(seg[-1]) == tail:
                    chain.extend(reversed(seg[:-1]))
                else:
                    continue
                used[j] = True
                extended = True
                break

        extended = True
        while extended:
            extended = False
            head = endpoint_key(chain[0])
            for j in endpoint_map.get(head, []):
                if used[j]:
                    continue
                seg = segments[j]
                if endpoint_key(seg[-1]) == head:
                    chain = seg[:-1] + chain
                elif endpoint_key(seg[0]) == head:
                    chain = list(reversed(seg[1:])) + chain
                else:
                    continue
                used[j] = True
                extended = True
                break

        merged.append(chain)
    return merged


def build_roads(home):
    from collections import defaultdict

    data = fetch_overpass_roads(home)
    groups = defaultdict(list)
    for element in data.get("elements", []):
        if element.get("type") != "way":
            continue
        geometry = element.get("geometry") or []
        ref = (element.get("tags") or {}).get("ref", "")
        if len(geometry) < 2 or not ref:
            continue
        points = [[node["lat"], node["lon"]] for node in geometry]
        groups[(road_class(ref), road_label(ref))].append(points)

    roads = []
    for (cls, name), segments in groups.items():
        for chain in merge_segments(segments):
            simplified = round_coords(simplify(chain, ROAD_TOLERANCE), 4)
            if len(simplified) >= 2:
                roads.append({"name": name, "cls": cls, "points": simplified})
    return roads


# ----------------------------------------------------------------- main ------
def main():
    print("Building radar basemap...")
    states = build_outline_set(fetch_text(OUTLINE_SOURCES["states"], "us-states.json"), STATE_TOLERANCE)
    print(f"  states: {len(states)} outlines")
    countries = build_outline_set(fetch_text(OUTLINE_SOURCES["countries"], "countries-110m.geojson"), COUNTRY_TOLERANCE)
    print(f"  countries: {len(countries)} outlines")

    home = load_home()
    print(f"  home for roads: {home['lat']:.4f}, {home['lon']:.4f}")
    try:
        roads = build_roads(home)
        print(f"  roads: {len(roads)} segments")
    except RuntimeError as error:
        # Keep previously built roads if Overpass is down, rather than wiping them.
        print(f"  WARNING: {error}")
        try:
            roads = json.loads(OUTPUT_PATH.read_text(encoding="utf-8")).get("roads", [])
            print(f"  keeping {len(roads)} existing road segments")
        except (OSError, json.JSONDecodeError):
            roads = []

    bundle = {
        "meta": {
            "generated": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "note": "Very-low-detail offline basemap. Coordinates are [lat, lon].",
            "roadRegion": {"home": home, "halfDegrees": ROAD_REGION_DEG},
            "sources": {**OUTLINE_SOURCES, "roads": "OpenStreetMap / Overpass (ODbL)"},
        },
        "countries": countries,
        "states": states,
        "roads": roads,
    }
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(bundle, separators=(",", ":")), encoding="utf-8")
    print(f"Wrote {OUTPUT_PATH} ({OUTPUT_PATH.stat().st_size / 1024:.0f} KB)")


if __name__ == "__main__":
    main()
