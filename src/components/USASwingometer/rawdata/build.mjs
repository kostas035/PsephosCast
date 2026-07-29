// build.mjs — one-off generator: parses the full verified county-level 2024 &
// 2020 presidential CSVs (tonmcg/US_County_Level_Election_Results_08-24) and
// produces (a) a full ~3144-county results module for both years and (b)
// exact 51-jurisdiction state totals, plus a modeled third-party state split
// for 2024 (Green/Libertarian/RFK/West) and 2020 (Green/Libertarian) built
// from real national vote totals + ballot-access gating, distributed within
// each state's EXACT "other" residual so state sums stay exact-to-the-vote.
import fs from "node:fs";

const STATE_NAME_TO_ABBR = {
  "Alabama":"AL","Alaska":"AK","Arizona":"AZ","Arkansas":"AR","California":"CA","Colorado":"CO",
  "Connecticut":"CT","Delaware":"DE","District of Columbia":"DC","Florida":"FL","Georgia":"GA",
  "Hawaii":"HI","Idaho":"ID","Illinois":"IL","Indiana":"IN","Iowa":"IA","Kansas":"KS","Kentucky":"KY",
  "Louisiana":"LA","Maine":"ME","Maryland":"MD","Massachusetts":"MA","Michigan":"MI","Minnesota":"MN",
  "Mississippi":"MS","Missouri":"MO","Montana":"MT","Nebraska":"NE","Nevada":"NV","New Hampshire":"NH",
  "New Jersey":"NJ","New Mexico":"NM","New York":"NY","North Carolina":"NC","North Dakota":"ND",
  "Ohio":"OH","Oklahoma":"OK","Oregon":"OR","Pennsylvania":"PA","Rhode Island":"RI","South Carolina":"SC",
  "South Dakota":"SD","Tennessee":"TN","Texas":"TX","Utah":"UT","Vermont":"VT","Virginia":"VA",
  "Washington":"WA","West Virginia":"WV","Wisconsin":"WI","Wyoming":"WY",
};

function parseCsv(path) {
  const text = fs.readFileSync(path, "utf8").trim();
  const lines = text.split("\n");
  const header = lines[0].split(",");
  const idx = Object.fromEntries(header.map((h, i) => [h.trim(), i]));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    // county_name may contain commas inside quotes in theory; this dataset doesn't, so a plain split is safe.
    const cols = lines[i].split(",");
    rows.push({
      state: cols[idx.state_name],
      fips: cols[idx.county_fips].padStart(5, "0"),
      name: cols[idx.county_name],
      gop: Number(cols[idx.votes_gop]),
      dem: Number(cols[idx.votes_dem]),
      total: Number(cols[idx.total_votes]),
    });
  }
  return rows;
}

// Alaska (reported by state house district, fips 02001-02040) and DC
// (reported by ward, fips 11001-11008) use PSEUDO-fips that are NOT real
// county-equivalent codes — and worse, some of them numerically COLLIDE with
// real geography: Alaska's districts 13/16/20 collide with the real borough
// codes for Aleutians East (02013), Aleutians West (02016), and Anchorage
// (02020); DC's Ward 1 (11001) collides with DC's own single real county
// code (11001, "District of Columbia"). Storing these under `county` would
// silently mislabel a district's/ward's numbers as if they were that real
// county's — so they're only summed into `stateAgg` (the real state totals,
// unaffected either way) and never stored as fake "county" rows at all.
function buildYear(rows) {
  const county = {};
  const stateAgg = {};
  for (const r of rows) {
    const abbr = STATE_NAME_TO_ABBR[r.state];
    if (!abbr) { console.error("UNKNOWN STATE", r.state); continue; }
    if (abbr !== "AK" && abbr !== "DC") county[r.fips] = [r.gop, r.dem, r.total];
    if (!stateAgg[abbr]) stateAgg[abbr] = { gop: 0, dem: 0, total: 0 };
    stateAgg[abbr].gop += r.gop;
    stateAgg[abbr].dem += r.dem;
    stateAgg[abbr].total += r.total;
  }
  return { county, stateAgg };
}

const rows2024 = parseCsv("./2024_county.csv");
const rows2020 = parseCsv("./2020_county.csv");
const y2024 = buildYear(rows2024);
const y2020 = buildYear(rows2020);

console.log("2024 states:", Object.keys(y2024.stateAgg).length, "counties:", Object.keys(y2024.county).length);
console.log("2020 states:", Object.keys(y2020.stateAgg).length, "counties:", Object.keys(y2020.county).length);

// ---------------------------------------------------------------------------
// Third-party split. "other" per state = total - gop - dem (exact, from the
// certified county sums above). We distribute that exact pool among named
// minor candidates using real national vote totals as relative weights,
// gated by ballot access so a candidate who wasn't on a state's ballot gets 0
// there (their weight is redistributed among the candidates who WERE).
const THIRDPARTY_2024 = {
  grn: { national: 871222, states: "AL,AK,AZ,AR,CA,CO,CT,DE,DC,FL,GA,HI,ID,IL,IN,IA,KS,KY,LA,ME,MD,MA,MI,MN,MS,MO,MT,NE,NV,NH,NJ,NM,NY,NC,ND,OH,OK,OR,PA,RI,SC,SD,TN,TX,UT,VT,VA,WA,WV,WI,WY".split(",") },
  lib: { national: 650317, states: "ALL" }, // on ballot or write-in everywhere
  // RFK suspended his campaign in Aug 2024 and successfully petitioned to be
  // removed from the ballot in most competitive swing states; he remained on
  // the ballot (as an inactive/withdrawn candidate) in most non-swing states,
  // where nobody filed to remove him. Modeled as "everywhere except the states
  // he's confirmed removed from," rather than an eligibility whitelist.
  rfk: { national: 757432, exclude: "AZ,TX,PA,FL,SC,OH,ME,NV,VA,UT,NH,GA,ND,WY,NC,MA,NE,NY".split(",") },
  west:{ national: 84588,  states: "AK,AZ,CA,CO,CT,DC,FL,GA,IL,IN,IA,KY,ME,MD,MI,MN,MO,NV,NH,NJ,NM,NY,NC,OH,OR,PA,RI,TX,VT,VA,WA,WI".split(",") },
};
const THIRDPARTY_2020 = {
  grn: { national: 407068,  states: "ALL" },
  lib: { national: 1865535, states: "ALL" },
};

function allStates(stateAgg) { return Object.keys(stateAgg); }

// Real total "other" (non-gop, non-dem) pool nationally — this is bigger than
// the sum of our named candidates (write-ins + additional minor candidates we
// don't model by name also live in here), so we use IT as the denominator for
// each named candidate's national vote share, not the sum of named candidates
// alone. Whatever a state's otherPool doesn't allocate to a named, eligible
// candidate falls into a generic "other" (write-in / unnamed minor party) bucket.
function splitThirdParty(stateAgg, spec) {
  const ids = Object.keys(spec);
  let nationalOtherPool = 0;
  for (const abbr of allStates(stateAgg)) {
    const s = stateAgg[abbr];
    nationalOtherPool += Math.max(0, s.total - s.gop - s.dem);
  }
  const out = {};
  for (const abbr of allStates(stateAgg)) {
    const s = stateAgg[abbr];
    const otherPool = Math.max(0, s.total - s.gop - s.dem);
    out[abbr] = {};
    let allocated = 0;
    for (const id of ids) {
      const cfg = spec[id];
      const eligible = cfg.exclude ? !cfg.exclude.includes(abbr) : (cfg.states === "ALL" || cfg.states.includes(abbr));
      const share = eligible ? spec[id].national / nationalOtherPool : 0;
      const v = Math.min(otherPool - allocated, Math.max(0, Math.round(otherPool * share)));
      out[abbr][id] = v;
      allocated += v;
    }
    out[abbr].other = Math.max(0, otherPool - allocated);
  }
  return out;
}

const tp2024 = splitThirdParty(y2024.stateAgg, THIRDPARTY_2024);
const tp2020 = splitThirdParty(y2020.stateAgg, THIRDPARTY_2020);

// Sanity: national reconstructed sums vs real totals
function checkNational(tp, spec) {
  for (const id of Object.keys(spec)) {
    let sum = 0;
    for (const abbr of Object.keys(tp)) sum += tp[abbr][id] || 0;
    console.log(id, "modeled national:", sum, "real:", spec[id].national, "diff%:", (((sum - spec[id].national) / spec[id].national) * 100).toFixed(1));
  }
}
checkNational(tp2024, THIRDPARTY_2024);
checkNational(tp2020, THIRDPARTY_2020);

// ---------------------------------------------------------------------------
// Emit the final shipped module: full county results for both years.
function emitCountyModule() {
  const fmt = (county) => {
    const keys = Object.keys(county).sort();
    return "{" + keys.map(k => `"${k}":[${county[k][0]},${county[k][1]},${county[k][2]}]`).join(",") + "}";
  };
  const out = `// usa-county-data.js — GENERATED from certified county-level presidential
// returns (tonmcg/US_County_Level_Election_Results_08-24, itself sourced from
// official state/county election-authority reporting). All ~3,140 counties,
// both cycles. [gop, dem, total] per FIPS. Regenerate via rawdata/build.mjs.
export const USA_COUNTY_RESULTS_2024 = ${fmt(y2024.county)};
export const USA_COUNTY_RESULTS_2020 = ${fmt(y2020.county)};
export const USA_COUNTY_RESULTS = { "2024": USA_COUNTY_RESULTS_2024, "2020": USA_COUNTY_RESULTS_2020 };
`;
  fs.writeFileSync("../usa-county-data.js", out);
}
emitCountyModule();

// Emit paste-ready snippets for usa-data.js (state totals + minor-party votes).
function emitStateSnippet(stateAgg, varName) {
  const lines = Object.keys(stateAgg).sort().map(abbr => {
    const s = stateAgg[abbr];
    return `  ${abbr}: { gop: ${s.gop}, dem: ${s.dem}, total: ${s.total} },`;
  });
  return `export const ${varName} = {\n${lines.join("\n")}\n};\n`;
}
function emitMinorSnippet(tp, varName, ids) {
  const lines = Object.keys(tp).sort().map(abbr => {
    const row = tp[abbr];
    return `  ${abbr}: { ${ids.map(id => `${id}: ${row[id] || 0}`).join(", ")} },`;
  });
  return `export const ${varName} = {\n${lines.join("\n")}\n};\n`;
}

let snippet = "";
snippet += emitStateSnippet(y2024.stateAgg, "USA_2024");
snippet += "\n";
snippet += emitStateSnippet(y2020.stateAgg, "USA_2020");
snippet += "\n";
snippet += emitMinorSnippet(tp2024, "USA_2024_MINOR", ["grn", "lib", "rfk", "west", "other"]);
snippet += "\n";
snippet += emitMinorSnippet(tp2020, "USA_2020_MINOR", ["grn", "lib", "other"]);
fs.writeFileSync("./gen_usa_data_snippet.js", snippet);

console.log("done");
