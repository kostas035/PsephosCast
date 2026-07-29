// build-ethnicity.mjs — extracts detailed ancestry / Hispanic-origin subgroup
// data at county AND state level from the Census Bureau's 2018-2022 ACS 5-year
// table-based Summary File (B04006 "People Reporting Ancestry" and B03001
// "Hispanic or Latino Origin by Specific Origin") — no API key needed, these
// are plain bulk .dat downloads. Values are stored as % of that table's own
// total population (each table's own E001 column), matching how the broad
// White/Black/Hispanic/Asian percentages are already computed elsewhere in
// this app, so every layer shares the same 0-100 color scale.
import fs from "node:fs";
import readline from "node:readline";

// [E-column number, output key, display label]
const B04006_WHITE = [
  ["005", "american", "American"],
  ["023", "british", "British"],
  ["033", "danish", "Danish"],
  ["034", "dutch", "Dutch"],
  ["036", "english", "English"],
  ["039", "finnish", "Finnish"],
  ["040", "french", "French"],
  ["042", "german", "German"],
  ["044", "greek", "Greek"],
  ["046", "hungarian", "Hungarian"],
  ["049", "irish", "Irish"],
  ["051", "italian", "Italian"],
  ["059", "norwegian", "Norwegian"],
  ["061", "polish", "Polish"],
  ["062", "portuguese", "Portuguese"],
  ["064", "russian", "Russian"],
  ["066", "scotchIrish", "Scotch-Irish"],
  ["067", "scottish", "Scottish"],
  ["089", "swedish", "Swedish"],
  ["090", "swiss", "Swiss"],
  ["093", "welsh", "Welsh"],
  ["006", "arab", "Arab"],
];
const B04006_BLACK = [
  ["073", "subsaharanAfrican", "Subsaharan African (overall)"],
  ["075", "ethiopian", "Ethiopian"],
  ["076", "ghanaian", "Ghanaian"],
  ["077", "kenyan", "Kenyan"],
  ["078", "liberian", "Liberian"],
  ["079", "nigerian", "Nigerian"],
  ["080", "senegalese", "Senegalese"],
  ["083", "southAfrican", "South African"],
  ["084", "sudanese", "Sudanese"],
  ["087", "africanOther", "African (other/unspecified)"],
  ["094", "caribbeanOverall", "Caribbean / West Indian (overall)"],
  ["095", "bahamian", "Bahamian"],
  ["096", "barbadian", "Barbadian"],
  ["101", "haitian", "Haitian"],
  ["102", "jamaican", "Jamaican"],
  ["103", "trinidadian", "Trinidadian and Tobagonian"],
];
const B03001_HISPANIC = [
  ["004", "mexican", "Mexican"],
  ["005", "puertoRican", "Puerto Rican"],
  ["006", "cuban", "Cuban"],
  ["007", "dominican", "Dominican"],
  ["009", "costaRican", "Costa Rican"],
  ["010", "guatemalan", "Guatemalan"],
  ["011", "honduran", "Honduran"],
  ["012", "nicaraguan", "Nicaraguan"],
  ["013", "panamanian", "Panamanian"],
  ["014", "salvadoran", "Salvadoran"],
  ["017", "argentinean", "Argentinean"],
  ["018", "bolivian", "Bolivian"],
  ["019", "chilean", "Chilean"],
  ["020", "colombian", "Colombian"],
  ["021", "ecuadorian", "Ecuadorian"],
  ["023", "peruvian", "Peruvian"],
  ["025", "venezuelan", "Venezuelan"],
  ["028", "spaniard", "Spaniard"],
];

async function extract(path, columns) {
  const rl = readline.createInterface({ input: fs.createReadStream(path, { encoding: "utf8" }), crlfDelay: Infinity });
  let header = null;
  const colIdx = {}; // E-col number -> array index in the split row
  const county = {}, state = {};
  for await (const line of rl) {
    if (!header) {
      header = line.split("|");
      header.forEach((h, i) => {
        const m = h.match(/_E(\d{3})$/);
        if (m) colIdx[m[1]] = i;
      });
      continue;
    }
    const isCounty = line.startsWith("0500000US");
    const isState = line.startsWith("0400000US");
    if (!isCounty && !isState) continue;
    const cols = line.split("|");
    const totalIdx = colIdx["001"];
    const total = Number(cols[totalIdx]);
    if (!total || total <= 0) continue;
    const row = {};
    for (const [e, key] of columns) {
      const idx = colIdx[e];
      const v = Number(cols[idx]);
      row[key] = Math.round(((v > 0 ? v : 0) / total) * 1000) / 10; // one decimal place %
    }
    if (isCounty) {
      const fips = line.slice(9, 14);
      county[fips] = row;
    } else {
      const stAbbr = line.slice(9, 11); // still raw state FIPS here, mapped below
      state[stAbbr] = row;
    }
  }
  return { county, state };
}

const STATE_FIPS_TO_ABBR = {
  "01":"AL","02":"AK","04":"AZ","05":"AR","06":"CA","08":"CO","09":"CT","10":"DE","11":"DC","12":"FL",
  "13":"GA","15":"HI","16":"ID","17":"IL","18":"IN","19":"IA","20":"KS","21":"KY","22":"LA","23":"ME",
  "24":"MD","25":"MA","26":"MI","27":"MN","28":"MS","29":"MO","30":"MT","31":"NE","32":"NV","33":"NH",
  "34":"NJ","35":"NM","36":"NY","37":"NC","38":"ND","39":"OH","40":"OK","41":"OR","42":"PA","44":"RI",
  "45":"SC","46":"SD","47":"TN","48":"TX","49":"UT","50":"VT","51":"VA","53":"WA","54":"WV","55":"WI","56":"WY",
};

function remapStateKeys(stateByFips) {
  const out = {};
  for (const [fips, row] of Object.entries(stateByFips)) {
    const abbr = STATE_FIPS_TO_ABBR[fips];
    if (abbr) out[abbr] = row;
  }
  return out;
}

const whiteData = await extract("./b04006_full.dat", B04006_WHITE);
console.log("white/other ancestry: counties", Object.keys(whiteData.county).length, "states", Object.keys(whiteData.state).length);
const blackData = await extract("./b04006_full.dat", B04006_BLACK);
console.log("black/african/caribbean ancestry: counties", Object.keys(blackData.county).length);
const hispanicData = await extract("./b03001_full.dat", B03001_HISPANIC);
console.log("hispanic origin: counties", Object.keys(hispanicData.county).length);

// Merge all three groups' county/state rows into one flat record per fips/abbr.
function merge(...sources) {
  const out = {};
  for (const src of sources) {
    for (const [key, row] of Object.entries(src)) {
      out[key] = { ...(out[key] || {}), ...row };
    }
  }
  return out;
}
const county = merge(whiteData.county, blackData.county, hispanicData.county);
const state = merge(remapStateKeys(whiteData.state), remapStateKeys(blackData.state), remapStateKeys(hispanicData.state));

console.log("sample Cook County IL (17031):", county["17031"]);
console.log("sample Los Angeles CA (06037):", county["06037"]);
console.log("sample Minnesota state (MN):", state["MN"]);

const CATEGORY_META = {
  white: B04006_WHITE.map(([, key, label]) => ({ key, label })),
  black: B04006_BLACK.map(([, key, label]) => ({ key, label })),
  hispanic: B03001_HISPANIC.map(([, key, label]) => ({ key, label })),
};

fs.writeFileSync("../usa-county-ethnicity.js",
  `// usa-county-ethnicity.js — GENERATED from the Census Bureau's 2018-2022 ACS\n` +
  `// 5-year Summary File, tables B04006 ("People Reporting Ancestry") and B03001\n` +
  `// ("Hispanic or Latino Origin by Specific Origin") — see rawdata/build-ethnicity.mjs.\n` +
  `// Each value is % of that table's own county/state total population, so it sits\n` +
  `// on the same 0-100 scale as the broad White/Black/Hispanic/Asian layers.\n` +
  `export const USA_ETHNICITY_CATEGORIES = ${JSON.stringify(CATEGORY_META, null, 2)};\n` +
  `export const USA_COUNTY_ETHNICITY = ${JSON.stringify(county)};\n` +
  `export const USA_STATE_ETHNICITY = ${JSON.stringify(state)};\n`
);
console.log("wrote usa-county-ethnicity.js");
