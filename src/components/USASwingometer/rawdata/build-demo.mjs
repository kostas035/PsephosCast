// build-demo.mjs — extracts real county- and state-level demographics from
// JieYingWu/COVID-19_US_County-level_Summaries' counties.csv (itself compiled
// from USDA ERS county-level datasets + Census Bureau PEP population/race
// estimates, 2018 vintage) into a compact per-FIPS table for the map's
// demographic overlay modes.
import fs from "node:fs";

function parseCsvLine(line) {
  // No quoted commas in the columns we read, so a plain split is safe here.
  return line.split(",");
}

const text = fs.readFileSync("./county_demo.csv", "utf8").trim();
const lines = text.split("\n");
const header = parseCsvLine(lines[0]);
const idx = name => header.indexOf(name);

const COL = {
  fips: idx("FIPS"), state: idx("State"), area: idx("Area_Name"),
  pop: idx("POP_ESTIMATE_2018"),
  bachelor: idx("Percent of adults with a bachelor's degree or higher 2014-18"),
  poverty: idx("PCTPOVALL_2018"),
  unemployment: idx("Unemployment_rate_2018"),
  income: idx("Median_Household_Income_2018"),
  density: idx("Density per square mile of land area - Population"),
  age65: idx("Total_age65plus"),
  totMale: idx("TOT_MALE"), totFemale: idx("TOT_FEMALE"),
  hMale: idx("H_MALE"), hFemale: idx("H_FEMALE"),
  whMale: idx("NHWA_MALE"), whFemale: idx("NHWA_FEMALE"),
  blMale: idx("NHBA_MALE"), blFemale: idx("NHBA_FEMALE"),
  asMale: idx("NHAA_MALE"), asFemale: idx("NHAA_FEMALE"),
};
console.log("column indices:", COL);

const num = v => { const n = parseFloat(v); return isNaN(n) ? null : n; };

const county = {};
const state = {};
for (let i = 1; i < lines.length; i++) {
  const c = parseCsvLine(lines[i]);
  const fips = c[COL.fips];
  if (!fips || fips === "00000") continue;
  const totPop = (num(c[COL.totMale]) || 0) + (num(c[COL.totFemale]) || 0);
  const row = {
    pop: num(c[COL.pop]),
    bachelorPct: num(c[COL.bachelor]),
    povertyPct: num(c[COL.poverty]),
    unemploymentPct: num(c[COL.unemployment]),
    income: num(c[COL.income]),
    density: num(c[COL.density]),
    seniorPct: totPop > 0 ? (num(c[COL.age65]) / totPop) * 100 : null,
    hispanicPct: totPop > 0 ? (((num(c[COL.hMale]) || 0) + (num(c[COL.hFemale]) || 0)) / totPop) * 100 : null,
    whiteNHPct: totPop > 0 ? (((num(c[COL.whMale]) || 0) + (num(c[COL.whFemale]) || 0)) / totPop) * 100 : null,
    blackNHPct: totPop > 0 ? (((num(c[COL.blMale]) || 0) + (num(c[COL.blFemale]) || 0)) / totPop) * 100 : null,
    asianNHPct: totPop > 0 ? (((num(c[COL.asMale]) || 0) + (num(c[COL.asFemale]) || 0)) / totPop) * 100 : null,
  };
  // Round to keep the shipped file small.
  for (const k of Object.keys(row)) if (row[k] != null) row[k] = Math.round(row[k] * 10) / 10;

  if (fips.endsWith("000")) { state[c[COL.state]] = row; continue; } // state-summary row
  county[fips] = row;
}
// This dataset predates CT's 2022 switch to planning regions, so it still has
// the 8 old counties (09001-09015). Approximate each of the 9 new planning
// regions with whichever old county its towns mostly came from — a rough
// crosswalk, not a recomputation from town-level data, but far better than no
// county-level demographic detail at all for Connecticut.
const CT_REGION_TO_OLD_COUNTY = {
  "09110": "09003", // Capitol -> Hartford
  "09120": "09001", // Greater Bridgeport -> Fairfield
  "09130": "09007", // Lower CT River Valley -> Middlesex
  "09140": "09009", // Naugatuck Valley -> New Haven
  "09150": "09015", // Northeastern CT -> Windham
  "09160": "09005", // Northwest Hills -> Litchfield
  "09170": "09009", // South Central CT -> New Haven
  "09180": "09011", // Southeastern CT -> New London
  "09190": "09001", // Western CT -> Fairfield
};
for (const [region, oldCounty] of Object.entries(CT_REGION_TO_OLD_COUNTY)) {
  if (county[oldCounty]) county[region] = { ...county[oldCounty], approximated: true };
}

// The state-summary rows in this source only carry the ERS education/income/
// poverty/employment columns, not the PEP race/sex breakdown — so age/race
// fields are backfilled here as population-weighted averages of that state's
// own counties (from the SAME source), keeping state and county views on one
// consistent dataset instead of mixing in a differently-vintaged table.
const RACE_FIELDS = ["seniorPct", "hispanicPct", "whiteNHPct", "blackNHPct", "asianNHPct"];
const countyByState = {};
for (let i = 1; i < lines.length; i++) {
  const c = parseCsvLine(lines[i]);
  const fips = c[COL.fips];
  if (!fips || fips === "00000" || fips.endsWith("000")) continue;
  const abbr = c[COL.state];
  const totPop = (num(c[COL.totMale]) || 0) + (num(c[COL.totFemale]) || 0);
  if (totPop <= 0) continue;
  (countyByState[abbr] ||= []).push({ totPop, row: county[fips] });
}
for (const [abbr, rows] of Object.entries(countyByState)) {
  if (!state[abbr]) continue;
  const totalPop = rows.reduce((s, r) => s + r.totPop, 0);
  for (const field of RACE_FIELDS) {
    const weighted = rows.reduce((s, r) => s + (r.row[field] != null ? r.row[field] * r.totPop : 0), 0);
    state[abbr][field] = totalPop > 0 ? Math.round((weighted / totalPop) * 10) / 10 : null;
  }
}

console.log("counties:", Object.keys(county).length, "states:", Object.keys(state).length);
console.log("sample 17031 (Cook Co, IL):", county["17031"]);
console.log("sample state IL:", state["IL"]);

fs.writeFileSync("../usa-county-demographics.js",
  `// usa-county-demographics.js — GENERATED from real county- and state-level\n` +
  `// demographic/economic data (USDA ERS + Census Bureau PEP, 2018 vintage —\n` +
  `// see rawdata/build-demo.mjs). Powers the map's demographic overlay modes at\n` +
  `// full county granularity everywhere the geometry joins.\n` +
  `export const USA_COUNTY_DEMOGRAPHICS = ${JSON.stringify(county)};\n` +
  `export const USA_STATE_DEMOGRAPHICS_2018 = ${JSON.stringify(state)};\n`
);
console.log("wrote usa-county-demographics.js");
