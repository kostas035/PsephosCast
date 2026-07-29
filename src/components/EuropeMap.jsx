import { useEffect, useRef } from "react";
import { MapLibreMap, Popup, setWorkerUrl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { feature } from "topojson-client";
import worldTopology from "world-atlas/countries-110m.json";

// MapLibre resolves its worker script at runtime via `import.meta.url` on its own
// module, which points somewhere sensible in dev (real node_modules files) but at a
// non-existent path once bundled into a hashed production chunk. Vite also can't
// statically detect that dynamic reference to bundle the worker as an asset. Point it
// at a copy served from /public (kept in sync with node_modules/maplibre-gl/dist/) instead.
setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

const GREECE_ID = 300;
const CYPRUS_ID = 196;
const USA_ID = 840;
const N_CYPRUS_NAME = "N. Cyprus";
const GREECE_COLOR = "#5b7fff";
const CYPRUS_COLOR = "#9ddf2e";
const USA_COLOR = "#f2545b";
const OCEAN_COLOR = "#bcdcf5";
const LAND_COLOR = "#eef1e6";
const DEFAULT_CENTER = [21, 43];
const DEFAULT_ZOOM = 0.9;
const ZOOM_WHEEL_SENSITIVITY = 0.01;

// A few countries (Russia, Fiji, ...) cross the antimeridian (+/-180deg longitude).
// Their raw rings jump straight from ~178deg to -180deg in a single edge instead of
// wrapping, which MapLibre renders as a long straight seam cutting across the globe.
// d3-geo's projections clip this automatically; a raw GeoJSON source does not, so we
// split those rings ourselves before handing the data to MapLibre.
function onAntimeridian(lon) {
  return Math.abs(Math.abs(lon) - 180) < 1e-6;
}

function isAntimeridianJump(lon1, lon2) {
  if (Math.abs(lon2 - lon1) <= 180) return false;
  // Two points that already both sit almost exactly on +/-180 are a boundary-hugging
  // vertex (the same meridian line, zero real distance), not an actual jump.
  return !(onAntimeridian(lon1) && onAntimeridian(lon2));
}

function closeAlongMeridian(piece) {
  const first = piece[0];
  const last = piece[piece.length - 1];
  if (first[0] === last[0] && first[1] === last[1]) return piece;
  const boundary = first[0]; // both ends sit on the same +/-180 boundary
  return [...piece, [boundary, first[1]], first];
}

function splitRingAtAntimeridian(rawRing) {
  const startsOnBoundary = onAntimeridian(rawRing[0][0]);

  let ring = rawRing;
  if (!startsOnBoundary) {
    const last = rawRing.length - 1;
    if (isAntimeridianJump(rawRing[last - 1][0], rawRing[last][0])) {
      const rot = Math.floor(last / 2);
      ring = [...rawRing.slice(rot, last), ...rawRing.slice(0, rot), rawRing[rot]];
    }
  }

  const segments = [[ring[0]]];
  let hasJump = false;
  for (let i = 1; i < ring.length; i++) {
    const [lon1, lat1] = ring[i - 1];
    const [lon2, lat2] = ring[i];
    if (isAntimeridianJump(lon1, lon2)) {
      hasJump = true;
      const dLon = lon2 - lon1;
      const unwrappedLon2 = dLon > 0 ? lon2 - 360 : lon2 + 360;
      const boundary = lon1 >= 0 ? 180 : -180;
      const denom = unwrappedLon2 - lon1;
      const crossLat = Math.abs(denom) < 1e-9 ? lat1 : lat1 + ((boundary - lon1) / denom) * (lat2 - lat1);
      segments[segments.length - 1].push([boundary, crossLat]);
      segments.push([[-boundary, crossLat]]);
    }
    segments[segments.length - 1].push([lon2, lat2]);
  }
  if (!hasJump) return [ring];

  if (startsOnBoundary) {
    // The ring already starts/ends exactly on the boundary, so each walked segment
    // is already its own self-contained piece — no merge needed.
    return segments.map(closeAlongMeridian);
  }
  // Otherwise the ring closes by wrapping from its last point back to its first,
  // which (for a normal interior start point) spans across a crossing — so the
  // first and last walked segments are really one piece.
  const merged = [...segments[segments.length - 1], ...segments[0].slice(1)];
  const pieces = [merged, ...segments.slice(1, -1)];
  return pieces.map(closeAlongMeridian);
}

function splitPolygonAtAntimeridian(rings) {
  const splitOuter = splitRingAtAntimeridian(rings[0]);
  if (splitOuter.length === 1) return [rings];
  return splitOuter.map((ring) => [ring]);
}

function fixAntimeridian(f) {
  if (f.geometry.type === "Polygon") {
    const polys = splitPolygonAtAntimeridian(f.geometry.coordinates);
    if (polys.length === 1) return f;
    return { ...f, geometry: { type: "MultiPolygon", coordinates: polys } };
  }
  if (f.geometry.type === "MultiPolygon") {
    const allPolys = f.geometry.coordinates.flatMap(splitPolygonAtAntimeridian);
    return { ...f, geometry: { type: "MultiPolygon", coordinates: allPolys } };
  }
  return f;
}

const worldGeoJSON = {
  type: "FeatureCollection",
  features: feature(worldTopology, worldTopology.objects.countries).features.map(fixAntimeridian),
};

const isCyprusFeature = (f) => f.id === CYPRUS_ID || f.properties?.name === N_CYPRUS_NAME;

// Antarctica's source geometry stops around -85.6° (a common Mercator-derived clipping
// limit), well short of the true pole. On a flat map that gap is invisible, but on a
// true sphere it renders as a hole — so we fill it in with a synthetic polar cap. A
// lon/lat rectangle from the clip latitude down to -90 wraps into a smooth circular cap
// once MapLibre's globe projection places each vertex on the sphere.
function poleCapPolygon(capLat) {
  const ring = [];
  for (let lon = -180; lon <= 180; lon += 5) ring.push([lon, capLat]);
  ring.push([180, -90], [-180, -90], ring[0]);
  return { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [ring] } };
}
const southPoleCap = poleCapPolygon(-85.5);

export default function EuropeMap({ onSelectGreece, onSelectCyprus, onSelectUSA }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const popupRef = useRef(null);
  const onSelectGreeceRef = useRef(onSelectGreece);
  const onSelectCyprusRef = useRef(onSelectCyprus);
  const onSelectUSARef = useRef(onSelectUSA);
  onSelectGreeceRef.current = onSelectGreece;
  onSelectCyprusRef.current = onSelectCyprus;
  onSelectUSARef.current = onSelectUSA;

  useEffect(() => {
    const map = new MapLibreMap({
      container: containerRef.current,
      style: {
        version: 8,
        projection: { type: "globe" },
        sources: {},
        layers: [{ id: "bg", type: "background", paint: { "background-color": OCEAN_COLOR } }],
      },
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      minZoom: 0.2,
      maxZoom: 4,
      attributionControl: false,
      dragRotate: true,
      touchPitch: false,
      pitchWithRotate: false,
      doubleClickZoom: false,
    });
    map.scrollZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
    map.getCanvas().style.outline = "none";
    mapRef.current = map;

    // Ctrl/Cmd+scroll zooms the globe; a plain scroll passes straight through to page
    // scroll instead of showing MapLibre's built-in "use ctrl+scroll" hint overlay.
    const container = containerRef.current;
    const handleWheel = (e) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      const around = map.unproject([e.clientX - rect.left, e.clientY - rect.top]);
      const delta = Math.max(-1, Math.min(1, -e.deltaY * ZOOM_WHEEL_SENSITIVITY));
      map.easeTo({ zoom: map.getZoom() + delta, around, duration: 0 });
    };
    container.addEventListener("wheel", handleWheel, { passive: false });

    map.on("load", () => {
      map.setSky({
        "sky-color": OCEAN_COLOR,
        "horizon-color": OCEAN_COLOR,
        "fog-color": OCEAN_COLOR,
        "atmosphere-blend": 0,
      });

      map.addSource("world", { type: "geojson", data: worldGeoJSON });
      map.addSource("south-pole-cap", { type: "geojson", data: southPoleCap });

      map.addLayer({
        id: "south-pole-cap-fill",
        type: "fill",
        source: "south-pole-cap",
        paint: { "fill-color": LAND_COLOR, "fill-opacity": 1, "fill-antialias": false },
      });
      map.addLayer({
        id: "world-fill",
        type: "fill",
        source: "world",
        paint: { "fill-color": LAND_COLOR, "fill-opacity": 1, "fill-antialias": false },
      });
      map.addLayer({
        id: "world-line",
        type: "line",
        source: "world",
        paint: { "line-color": "rgba(110,120,100,0.55)", "line-width": 0.6 },
      });

      const highlightFilter = [
        "any",
        ["==", ["id"], GREECE_ID],
        ["==", ["id"], CYPRUS_ID],
        ["==", ["id"], USA_ID],
        ["==", ["get", "name"], N_CYPRUS_NAME],
      ];
      const highlightColor = [
        "case",
        ["==", ["id"], GREECE_ID],
        GREECE_COLOR,
        ["any", ["==", ["id"], CYPRUS_ID], ["==", ["get", "name"], N_CYPRUS_NAME]],
        CYPRUS_COLOR,
        ["==", ["id"], USA_ID],
        USA_COLOR,
        "#ffffff",
      ];

      map.addLayer({
        id: "highlight-fill",
        type: "fill",
        source: "world",
        filter: highlightFilter,
        paint: { "fill-color": highlightColor, "fill-opacity": 0.75 },
      });
      map.addLayer({
        id: "highlight-line",
        type: "line",
        source: "world",
        filter: highlightFilter,
        paint: { "line-color": highlightColor, "line-width": 1.4 },
      });

      // Cyprus in particular renders as only a few pixels at this zoom, so exact-pixel
      // hit-testing is unreliable — query a small tolerance box around the pointer instead.
      const HIT_TOLERANCE = 6;
      const featuresNearPoint = (point) =>
        map.queryRenderedFeatures(
          [
            [point.x - HIT_TOLERANCE, point.y - HIT_TOLERANCE],
            [point.x + HIT_TOLERANCE, point.y + HIT_TOLERANCE],
          ],
          { layers: ["highlight-fill"] }
        );

      map.on("mousemove", (e) => {
        map.getCanvas().style.cursor = featuresNearPoint(e.point).length ? "pointer" : "";
      });

      map.on("click", (e) => {
        const f = featuresNearPoint(e.point)[0];
        if (!f) return;
        if (isCyprusFeature(f)) {
          onSelectCyprusRef.current?.();
          return;
        }
        if (f.id === USA_ID) {
          onSelectUSARef.current?.();
          return;
        }
        if (f.id === GREECE_ID) {
          openGreecePopup(map, e.lngLat, popupRef, onSelectGreeceRef);
        }
      });
    });

    return () => {
      container.removeEventListener("wheel", handleWheel);
      popupRef.current?.remove();
      map.remove();
    };
  }, []);

  const zoomBy = (delta) => mapRef.current?.zoomTo(mapRef.current.getZoom() + delta, { duration: 250 });
  const resetView = () =>
    mapRef.current?.easeTo({ center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM, bearing: 0, pitch: 0, duration: 500 });

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 640,
        aspectRatio: "1 / 1",
        margin: "0 auto",
      }}
    >
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      <button
        type="button"
        onClick={resetView}
        aria-label="Reset view"
        className="mono-data"
        style={{
          position: "absolute",
          bottom: 12,
          left: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 28,
          height: 28,
          border: "0.5px solid rgba(255,255,255,0.18)",
          borderRadius: 2,
          background: "rgba(9,19,40,0.75)",
          backdropFilter: "blur(6px)",
          color: "#dae2ff",
          fontSize: 14,
          cursor: "pointer",
          transition: "background 0.15s",
        }}
        onMouseOver={(e) => (e.currentTarget.style.background = "rgba(180,197,255,0.15)")}
        onMouseOut={(e) => (e.currentTarget.style.background = "rgba(9,19,40,0.75)")}
      >
        ⟲
      </button>
      <div
        className="mono-data"
        style={{
          position: "absolute",
          bottom: 12,
          right: 12,
          display: "flex",
          flexDirection: "column",
          border: "0.5px solid rgba(255,255,255,0.18)",
          borderRadius: 2,
          overflow: "hidden",
          background: "rgba(9,19,40,0.75)",
          backdropFilter: "blur(6px)",
        }}
      >
        <button
          type="button"
          onClick={() => zoomBy(0.6)}
          aria-label="Zoom in"
          style={zoomBtnStyle()}
          onMouseOver={(e) => (e.currentTarget.style.background = "rgba(180,197,255,0.15)")}
          onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
        >
          +
        </button>
        <div style={{ height: 1, background: "rgba(255,255,255,0.18)" }} />
        <button
          type="button"
          onClick={() => zoomBy(-0.6)}
          aria-label="Zoom out"
          style={zoomBtnStyle()}
          onMouseOver={(e) => (e.currentTarget.style.background = "rgba(180,197,255,0.15)")}
          onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
        >
          −
        </button>
      </div>
    </div>
  );
}

function zoomBtnStyle() {
  return {
    width: 28,
    height: 28,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    border: "none",
    color: "#dae2ff",
    fontSize: 15,
    lineHeight: 1,
    cursor: "pointer",
    transition: "background 0.15s",
  };
}

function openGreecePopup(map, lngLat, popupRef, onSelectGreeceRef) {
  popupRef.current?.remove();

  const el = document.createElement("div");
  el.className = "hardware-module globe-popup-panel";
  el.innerHTML = `
    <div class="screw-head screw-tl"></div>
    <div class="screw-head screw-tr"></div>
    <div class="globe-popup-header">
      <div class="globe-popup-country">Greece</div>
      <div class="globe-popup-subtitle mono-data">Select Model</div>
    </div>
    <button type="button" class="globe-popup-btn" data-action="legislative">
      <span>LEGISLATIVE</span>
      <span class="globe-popup-badge">
        <span class="indicator-dot" style="background:#dc2626;box-shadow:0 0 8px rgba(220,38,38,0.6)"></span>
        <span>LIVE</span>
      </span>
    </button>
    <button type="button" class="globe-popup-btn" data-action="regional" style="margin-top:8px">
      <span>REGIONAL</span>
      <span class="globe-popup-badge">
        <span class="material-symbols-outlined" style="font-size:12px;color:#D97706">construction</span>
        <span>IN_DEV</span>
      </span>
    </button>
  `;

  const popup = new Popup({
    closeButton: false,
    offset: 14,
    maxWidth: "240px",
    className: "globe-popup",
  })
    .setLngLat(lngLat)
    .setDOMContent(el)
    .addTo(map);
  popupRef.current = popup;

  el.querySelector('[data-action="legislative"]').addEventListener("click", () => {
    popup.remove();
    onSelectGreeceRef.current?.("legislative");
  });
  el.querySelector('[data-action="regional"]').addEventListener("click", () => {
    popup.remove();
    onSelectGreeceRef.current?.("regional");
  });
}
