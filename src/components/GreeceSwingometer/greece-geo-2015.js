// greece-geo-2015.js
//
// Scenario-aware GeoJSON transform for the pre-2018 maps (May and June 2012,
// January and September 2015). Dissolves the post-December-2018 Athens B1/B2/B3
// and East/West Attica boundaries back into the single pre-2018 "Athens B" /
// "Attica" constituencies, so the "2012", "2012may", "2015" and "2015jan"
// scenarios render the 56-constituency map while every other scenario keeps
// rendering the current 59-district GeoJSON files untouched.
import { union } from "@turf/union";
import { grExtractName } from "./greece-utils.js";

// New (pre-2018) constituency name -> the current GeoJSON feature names it replaces.
const GR_2015_GEO_MERGES = {
  "Athens B": { nameGreek: "Αθήνα",  match: ["Athens B1 (North)", "Athens B2 (West)", "Athens B3 (South)"] },
  "Attica":   { nameGreek: "Αττική", match: ["East Attica", "West Attica"] },
};

// Concatenates ring sets into one MultiPolygon without a true topological
// dissolve (a visible seam may remain along the old internal border). Used
// only if turf's union() throws on unexpected input geometry, so the map still
// renders instead of breaking.
function concatAsMultiPolygon(features) {
  const polys = [];
  features.forEach(f => {
    const g = f.geometry;
    if (g.type === "Polygon") polys.push(g.coordinates);
    else if (g.type === "MultiPolygon") polys.push(...g.coordinates);
  });
  return { type: "MultiPolygon", coordinates: polys };
}

function mergeFeatures(features, spec, name) {
  if (!features.length) return null;
  if (features.length === 1) {
    return { ...features[0], properties: { ...features[0].properties, name, name_greek: spec.nameGreek } };
  }
  let geometry;
  try {
    const unioned = union({ type: "FeatureCollection", features });
    geometry = unioned ? unioned.geometry : concatAsMultiPolygon(features);
  } catch {
    geometry = concatAsMultiPolygon(features);
  }
  return {
    type: "Feature",
    properties: { name, name_greek: spec.nameGreek, cartodb_id: features[0].properties?.cartodb_id ?? null },
    geometry,
  };
}

// Returns the SAME object reference for every scenario except the 2015 ones
// ("2015" and "2015jan", cheap no-op) so 2019/2023/2026 rendering is completely
// unaffected.
export function grScenarioGeoJson(geoJson, scenarioId) {
  const isPre2018 = scenarioId === "2015" || scenarioId === "2015jan" || scenarioId === "2012" || scenarioId === "2012may";
  if (!isPre2018 || !geoJson?.features) return geoJson;

  const consumed = new Set();
  const mergedFeatures = [];

  Object.entries(GR_2015_GEO_MERGES).forEach(([name, spec]) => {
    const toMerge = geoJson.features.filter(f => spec.match.includes(grExtractName(f.properties)));
    if (!toMerge.length) return;
    toMerge.forEach(f => consumed.add(f));
    const merged = mergeFeatures(toMerge, spec, name);
    if (merged) mergedFeatures.push(merged);
  });

  if (!mergedFeatures.length) return geoJson;

  const passthrough = geoJson.features.filter(f => !consumed.has(f));
  return { ...geoJson, features: [...passthrough, ...mergedFeatures] };
}
