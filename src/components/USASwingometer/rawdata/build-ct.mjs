// build-ct.mjs — Connecticut switched from 8 counties to 9 "planning region"
// county-equivalents in 2022 (new FIPS 09110-09190); us-atlas's bundled
// topology still ships the old 8-county geometry, so it can never join to
// election data reported under the new FIPS. This extracts CT's 9 real
// planning-region shapes from growella/us-counties-10m-topojson (raw lon/lat),
// projects them with d3's default AlbersUSA, then applies the affine
// transform (fit by least squares against us-atlas's own state shapes) that
// maps that default projection into us-atlas's exact pre-projected pixel
// space — so the output drops in as real geometry alongside the rest of the map.
import fs from "node:fs";
import * as d3 from "d3-geo";
import { feature, mesh } from "topojson-client";

const AFFINE = { scaleX: 1.214917663353647, scaleY: 1.2149405458291112, translateX: -95.65443439880005, translateY: 1.263120086893775 };

const ctTopo = JSON.parse(fs.readFileSync("./ct_topology.json", "utf8"));
const feats = feature(ctTopo, ctTopo.objects.counties).features.filter(f => String(f.id).startsWith("09"));
console.log("CT regions found:", feats.length);

const proj = d3.geoAlbersUsa();
const rawPath = d3.geoPath(proj);

// Re-project each ring's raw coordinates through AlbersUSA + the affine fit,
// producing a NEW GeoJSON already in us-atlas pixel space (so we can reuse
// d3.geoPath() with no projection later, exactly like the rest of the map).
function projectRing(ring) {
  return ring.map(([lon, lat]) => {
    const p = proj([lon, lat]);
    if (!p) return null;
    return [p[0] * AFFINE.scaleX + AFFINE.translateX, p[1] * AFFINE.scaleY + AFFINE.translateY];
  }).filter(Boolean);
}
function projectGeometry(geom) {
  if (geom.type === "Polygon") return { type: "Polygon", coordinates: geom.coordinates.map(projectRing) };
  if (geom.type === "MultiPolygon") return { type: "MultiPolygon", coordinates: geom.coordinates.map(poly => poly.map(projectRing)) };
  return geom;
}

const identPath = d3.geoPath();
const regions = feats.map(f => {
  const projected = { type: "Feature", id: f.id, properties: f.properties, geometry: projectGeometry(f.geometry) };
  return { id: String(f.id).padStart(5, "0"), name: f.properties.name || f.properties.NAME, d: identPath(projected) };
});

// Internal mesh (borders between CT regions only) for the thin state-interior lines.
const meshGeom = mesh(ctTopo, ctTopo.objects.counties, (a, b) => a !== b && String(a.id).startsWith("09") && String(b.id).startsWith("09"));
const meshProjected = projectGeometry(meshGeom);
const meshD = identPath({ type: "Feature", geometry: meshProjected });

fs.writeFileSync("../usa-ct-regions.json", JSON.stringify({ regions, meshD }));
console.log("wrote usa-ct-regions.json —", regions.length, "regions");
regions.forEach(r => console.log(" ", r.id, r.name, "d-length:", r.d?.length));
