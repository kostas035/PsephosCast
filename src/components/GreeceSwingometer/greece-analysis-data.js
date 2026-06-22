// greece-analysis-data.js
// ─────────────────────────────────────────────────────────────────────────────
//  Data layer for "Correlations & Trends": turns the swingometer's per-district
//  reconstruction into a flat district×variable frame (or a region aggregate),
//  with ideology blocs, island/urban binning, and baseline→scenario swing.
//
//  The look-up tables below (REGIONS, ISLANDS, BLOCS, URBAN_THRESHOLD) are the
//  domain choices you cannot redo in SPSS from a flat CSV — edit them freely.
// ─────────────────────────────────────────────────────────────────────────────

import {
  GR_RAW_DISTRICTS,
  GR_DISTRICT_DEMOGRAPHICS,
  GR_SCENARIOS,
  GR_DISTRICT_POP,
  GR_DISTRICT_REGISTERED,
  GR_DISTRICT_VALID_VOTES,
} from "./greece-data.js";
import { grDistrictBaseVotes, grApplySwing } from "./greece-engine.js";

/* District ≥ this %% urban ⇒ classified "urban" (editable). */
export const URBAN_THRESHOLD = 70;

export const REGIONS = {
  athens_a: "Attica", athens_b1: "Attica", athens_b2: "Attica", athens_b3: "Attica",
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

// NOTE: piraeus_b and euboea are coded as islands here; both are debatable
// (Piraeus B is mostly mainland Attica with some Saronic islands; Euboea/Evia is
// a bridge-connected island). Adjust to taste — it only affects the island split.
export const ISLANDS = new Set([
  "piraeus_b", "euboea", "heraklion", "chania", "rethymno", "lasithi",
  "corfu", "cephalonia", "lefkada", "zakynthos", "lesbos", "samos", "chios",
  "dodecanese", "cyclades",
]);

export const BLOCS = {
  "Radical & Broad Left": ["syriza", "kke", "na", "pe", "mera25", "elas"],
  "Social Democracy & Center": ["pasok", "dpk"],
  "Conservative & Center-Right": ["nd", "elpida", "samaras"],
  "Radical Right & Nationalist": ["el", "spartans", "niki", "gd", "fl", "pat"],
};

const num = v => typeof v === "number" && isFinite(v);
// turnout is derivable only where valid-vote counts exist (currently 2023).
export function turnoutAvailable(baselineKey) { return !!(GR_DISTRICT_VALID_VOTES && GR_DISTRICT_VALID_VOTES[baselineKey]); }

export function buildAnalysisFrame(unit = "district", baselineKey = "2023", scenarioKey = "none", liveParties = null, demSliders = null) {
  const baseParties = GR_SCENARIOS[baselineKey] || GR_SCENARIOS["2023"];
  const demographicsById = Object.fromEntries(GR_DISTRICT_DEMOGRAPHICS.map(d => [d.id, d]));

  let frame = [];

  for (const dist of GR_RAW_DISTRICTS) {
    const demo = demographicsById[dist.id] || {};
    const baseVotes = grDistrictBaseVotes(baseParties, dist, baselineKey);
    const popSize = GR_DISTRICT_POP[dist.id] || 0;
    const registered = GR_DISTRICT_REGISTERED?.[dist.id] || 0;
    const validVotes = GR_DISTRICT_VALID_VOTES?.[baselineKey]?.[dist.id] || 0;
    // REAL turnout rate (%). Null when this baseline has no valid-vote data.
    const turnoutPct = registered > 0 && validVotes > 0 ? (validVotes / registered) * 100 : null;

    let scenVotes = null;
    if (scenarioKey !== "none") {
      if (scenarioKey === "custom" && liveParties) {
        const distWithBase = { ...dist, baseVotes };
        const res = grApplySwing(distWithBase, liveParties, baseParties, demSliders || {});
        scenVotes = res.votes;
      } else {
        const scenParties = GR_SCENARIOS[scenarioKey];
        if (scenParties) scenVotes = grDistrictBaseVotes(scenParties, dist, scenarioKey);
      }
    }

    let row = {
      id: dist.id,
      name: dist.name,
      region: REGIONS[dist.id] || "Unknown",
      is_island: ISLANDS.has(dist.id) ? 1 : 0,
      is_urban: (demo.urbanization_pct || 0) >= URBAN_THRESHOLD ? 1 : 0,
      population_size: popSize,
      registered_electors: registered,
      valid_votes: validVotes,           // raw count of valid votes (≈ size; NOT turnout)
      turnout_raw: validVotes,           // kept for backward-compat with existing UI
      turnout_pct: turnoutPct,           // ← the real turnout RATE to correlate on
      ...demo,
    };

    Object.keys(baseVotes).forEach(p => { row[`base_${p}`] = baseVotes[p]; });
    Object.entries(BLOCS).forEach(([blocName, members]) => {
      row[`base_${blocName}`] = members.reduce((sum, p) => sum + (baseVotes[p] || 0), 0);
    });

    if (scenVotes) {
      Object.keys(scenVotes).forEach(p => {
        row[`scen_${p}`] = scenVotes[p];
        row[`swing_abs_${p}`] = scenVotes[p] - (baseVotes[p] || 0);
        row[`swing_prop_${p}`] = (baseVotes[p] || 0) > 0 ? (scenVotes[p] - baseVotes[p]) / baseVotes[p] : 0;
      });
      Object.entries(BLOCS).forEach(([blocName, members]) => {
        const scenSum = members.reduce((sum, p) => sum + (scenVotes[p] || 0), 0);
        const baseSum = row[`base_${blocName}`];
        row[`scen_${blocName}`] = scenSum;
        row[`swing_abs_${blocName}`] = scenSum - baseSum;
        row[`swing_prop_${blocName}`] = baseSum > 0 ? (scenSum - baseSum) / baseSum : 0;
      });
    }

    frame.push(row);
  }

  if (unit === "region") {
    const groups = {};
    frame.forEach(row => { (groups[row.region] ||= []).push(row); });

    // weighted mean of field `f` over district rows `rs`, weights from `wKey`
    const wmean = (rs, f, wKey) => {
      let sw = 0, s = 0;
      for (const r of rs) { const v = r[f], w = r[wKey] || 0; if (num(v) && w > 0) { s += v * w; sw += w; } }
      return sw ? s / sw : null;
    };

    frame = Object.keys(groups).map(regionName => {
      const rs = groups[regionName];
      const sumPop = rs.reduce((s, r) => s + (r.population_size || 0), 0);
      const sumReg = rs.reduce((s, r) => s + (r.registered_electors || 0), 0);
      const sumVV = rs.reduce((s, r) => s + (r.valid_votes || 0), 0);
      // weight vote shares by actual valid votes where available, else electorate, else population
      const voteWKey = sumVV > 0 ? "valid_votes" : (sumReg > 0 ? "registered_electors" : "population_size");

      const aggRow = {
        id: regionName, name: regionName, count: rs.length, is_region_layer: 1,
        region: regionName,
        population_size: sumPop,
        registered_electors: sumReg,
        valid_votes: sumVV,
        turnout_raw: sumVV,
        turnout_pct: sumReg > 0 && sumVV > 0 ? (sumVV / sumReg) * 100 : null,
        // demographics: population-weighted
        age_over_65_pct: wmean(rs, "age_over_65_pct", "population_size"),
        tertiary_edu_pct: wmean(rs, "tertiary_edu_pct", "population_size"),
        unemployment_rate: wmean(rs, "unemployment_rate", "population_size"),
        foreign_citizens_pct: wmean(rs, "foreign_citizens_pct", "population_size"),
        urbanization_pct: wmean(rs, "urbanization_pct", "population_size"),
      };

      // retain grouping flags at region level (was dropped before)
      aggRow.is_island = rs.every(r => r.is_island === 1) ? 1 : 0;
      aggRow.is_urban = (aggRow.urbanization_pct || 0) >= URBAN_THRESHOLD ? 1 : 0;

      // every base_/scen_/swing_ vote field: electorate/vote-weighted region share
      const shareKeys = new Set();
      rs.forEach(r => Object.keys(r).forEach(k => { if (/^(base_|scen_|swing_)/.test(k)) shareKeys.add(k); }));
      shareKeys.forEach(k => { aggRow[k] = wmean(rs, k, voteWKey); });

      // modal primary economy
      const econ = {};
      rs.forEach(r => { econ[r.primary_economy] = (econ[r.primary_economy] || 0) + 1; });
      aggRow.primary_economy = Object.keys(econ).reduce((a, b) => (econ[a] > econ[b] ? a : b), Object.keys(econ)[0]);

      return aggRow;
    });
  }

  return frame;
}