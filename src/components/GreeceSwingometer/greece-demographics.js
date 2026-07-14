// greece-demographics.js
//  Scenario-year-aware constituency demographics for the geographic swing layer.
//
//  GR_DISTRICT_DEMOGRAPHICS (greece-data.js) is a single frozen snapshot, which is
//  fine for the slow-moving census fields (age, education, urbanisation, foreign
//  citizens) but wrong for unemployment and income: a "precarity" slider on the
//  2012 scenario should redistribute votes using the CRISIS-era unemployment map,
//  not today's. This module rebuilds the year-sensitive fields (unemployment_rate,
//  gdp_pc) and the resulting z-score table per scenario, memoized by scenarioId.
import { GR_DISTRICT_DEMOGRAPHICS, grDistrictsForScenario, GR_DISTRICT_POP } from "./greece-data.js";
import { GR_DISTRICT_GDP, GR_GDP_YEARS } from "./greece-gdp-data.js";
import { GR_DISTRICT_POPULATION_BY_YEAR, GR_POP_YEARS } from "./greece-population-data.js";
import { GR_UNEMPLOYMENT_BY_REGION, GR_UNEMPLOYMENT_YEARS } from "./greece-unemployment-data.js";

// Reference year each scenario's precarity/affluence geography should reflect.
export const SCENARIO_REFERENCE_YEAR = {
  "2009": 2009, "2012may": 2012, "2012": 2012, "2015jan": 2015, "2015": 2015,
  "2019": 2019, "2023": 2023, "2026": 2026, "custom": 2026,
};
const DEFAULT_REFERENCE_YEAR = 2026;

// District→NUTS-2 region, for the unemployment lookup. Mirrors REGIONS in
// greece-analysis-data.js (kept as a local copy — that module imports FROM
// greece-engine.js, which imports FROM this file, so importing it back here
// would be circular).
const REGION_OF = {
  athens_a: "Attica", athens_b1: "Attica", athens_b2: "Attica", athens_b3: "Attica",
  athens_b: "Attica", attica: "Attica",
  piraeus_a: "Attica", piraeus_b: "Attica", east_attica: "Attica", west_attica: "Attica",
  thessaloniki_a: "Central Macedonia", thessaloniki_b: "Central Macedonia", chalkidiki: "Central Macedonia",
  imathia: "Central Macedonia", kilkis: "Central Macedonia", pella: "Central Macedonia", pieria: "Central Macedonia", serres: "Central Macedonia",
  evros: "East Macedonia & Thrace", rhodope: "East Macedonia & Thrace", xanthi: "East Macedonia & Thrace", drama: "East Macedonia & Thrace", kavala: "East Macedonia & Thrace",
  kozani: "West Macedonia", kastoria: "West Macedonia", florina: "West Macedonia", grevena: "West Macedonia",
  ioannina: "Epirus", arta: "Epirus", preveza: "Epirus", thesprotia: "Epirus",
  larissa: "Thessaly", magnesia: "Thessaly", trikala: "Thessaly", karditsa: "Thessaly",
  aetolia_acarnania: "West Greece", boeotia: "Central Greece", phthiotis: "Central Greece", evrytania: "Central Greece", euboea: "Central Greece", phocis: "Central Greece",
  corinthia: "Peloponnese", argolis: "Peloponnese", arcadia: "Peloponnese", laconia: "Peloponnese", messenia: "Peloponnese",
  elis: "West Greece", achaea: "West Greece",
  heraklion: "Crete", chania: "Crete", rethymno: "Crete", lasithi: "Crete",
  corfu: "Ionian Islands", cephalonia: "Ionian Islands", lefkada: "Ionian Islands", zakynthos: "Ionian Islands",
  lesbos: "North Aegean", samos: "North Aegean", chios: "North Aegean",
  dodecanese: "South Aegean", cyclades: "South Aegean",
};

// athens_b / attica are the pre-2018 merged constituencies (see REGIONS in
// greece-analysis-data.js) — GDP and population are only tabulated at the modern
// (post-2018) granularity, so reconstruct the merged figure by summing parts.
const MERGE_PARTS = { athens_b: ["athens_b1", "athens_b2", "athens_b3"], attica: ["east_attica", "west_attica"] };

function seriesValue(table, id, year) {
  if (table[id]) return table[id][year];
  const parts = MERGE_PARTS[id];
  if (!parts) return undefined;
  let sum = 0;
  for (const p of parts) { const v = table[p]?.[year]; if (v == null) return undefined; sum += v; }
  return sum;
}

const clamp = (y, lo, hi) => Math.max(lo, Math.min(hi, y));
const UNEMPLOYMENT_MIN = Math.min(...GR_UNEMPLOYMENT_YEARS);
const UNEMPLOYMENT_MAX = Math.max(...GR_UNEMPLOYMENT_YEARS);
// gdp_pc needs both series available; clamp to the intersection of their ranges.
const GDPPC_MIN = Math.max(Math.min(...GR_GDP_YEARS), Math.min(...GR_POP_YEARS));
const GDPPC_MAX = Math.min(Math.max(...GR_GDP_YEARS), Math.max(...GR_POP_YEARS));

function unemploymentForDistrict(id, year) {
  const region = REGION_OF[id];
  if (!region) return null;
  const row = GR_UNEMPLOYMENT_BY_REGION[region];
  if (!row) return null;
  const v = row[clamp(year, UNEMPLOYMENT_MIN, UNEMPLOYMENT_MAX)];
  return typeof v === "number" ? v : null;
}

function gdpPerCapitaForDistrict(id, year) {
  const y = clamp(year, GDPPC_MIN, GDPPC_MAX);
  const gdp = seriesValue(GR_DISTRICT_GDP, id, y);
  const pop = seriesValue(GR_DISTRICT_POPULATION_BY_YEAR, id, y);
  return (gdp != null && pop) ? gdp / pop : null;
}

// slider axis -> [demographic field, sign]. youth has no direct field, so it is the
// INVERSE of the 65+ share. gender has no district field, so it stays national-only.
// affluence is signed + (higher gdp_pc ⇒ more affluent) — see GR_PARTY_DICT sensitivities.
export const GR_DEMO_AXES = {
  seniors:   ["age_over_65_pct",   +1],
  youth:     ["age_over_65_pct",   -1],
  urban:     ["urbanization_pct",  +1],
  education: ["tertiary_edu_pct",  +1],
  precarity: ["unemployment_rate", +1],
  affluence: ["gdp_pc",            +1],
};

// Population weight for a district in a given scenario year — reconstructing merged
// pre-2018 ids from their parts. Exported so callers that need weights consistent
// with grDemoZForScenario (e.g. its own regression test) don't have to re-derive them.
export function grDemoWeightForYear(id, year) {
  return seriesValue(GR_DISTRICT_POPULATION_BY_YEAR, id, year) ?? GR_DISTRICT_POP[id] ?? 1;
}

const demographicsCache = new Map();
const zCache = new Map();

// Per-constituency demographic row for a scenario's reference year: census-anchored
// fields (age/education/urbanisation/foreign-citizens) are unchanged; unemployment_rate
// and gdp_pc are recomputed for that year.
export function grDemographicsForScenario(scenarioId) {
  const cached = demographicsCache.get(scenarioId);
  if (cached) return cached;
  const year = SCENARIO_REFERENCE_YEAR[scenarioId] ?? DEFAULT_REFERENCE_YEAR;
  const rows = GR_DISTRICT_DEMOGRAPHICS.map(r => ({
    ...r,
    unemployment_rate: unemploymentForDistrict(r.id, year) ?? r.unemployment_rate,
    gdp_pc: gdpPerCapitaForDistrict(r.id, year),
  }));
  demographicsCache.set(scenarioId, rows);
  return rows;
}

// Population-weighted z-scores per axis, restricted to the districts actually used by
// this scenario's constituency map (so a legacy scenario weights on "athens_b"/"attica"
// merged figures, not the modern split ones, and vice versa) and weighted by that
// scenario's own reference-year population, not the frozen 2021 snapshot.
export function grDemoZForScenario(scenarioId) {
  const cached = zCache.get(scenarioId);
  if (cached) return cached;

  const year = SCENARIO_REFERENCE_YEAR[scenarioId] ?? DEFAULT_REFERENCE_YEAR;
  const demoById = Object.fromEntries(grDemographicsForScenario(scenarioId).map(r => [r.id, r]));
  const districtIds = grDistrictsForScenario(scenarioId).map(d => d.id).filter(id => demoById[id]);
  const wOf = id => grDemoWeightForYear(id, year);

  const fields = [...new Set(Object.values(GR_DEMO_AXES).map(([f]) => f))];
  const stat = {};
  fields.forEach(f => {
    let sw = 0, swx = 0;
    districtIds.forEach(id => { const w = wOf(id), v = demoById[id][f]; if (typeof v === "number") { sw += w; swx += w * v; } });
    const mean = sw ? swx / sw : 0;
    let swv = 0;
    districtIds.forEach(id => { const w = wOf(id), v = demoById[id][f]; if (typeof v === "number") swv += w * (v - mean) ** 2; });
    stat[f] = { mean, std: Math.sqrt(sw ? swv / sw : 0) || 1 };
  });

  const out = {};
  districtIds.forEach(id => {
    out[id] = {};
    for (const axis in GR_DEMO_AXES) {
      const [f, sign] = GR_DEMO_AXES[axis];
      const v = demoById[id][f];
      out[id][axis] = (typeof v === "number") ? sign * (v - stat[f].mean) / stat[f].std : 0;
    }
  });
  zCache.set(scenarioId, out);
  return out;
}
