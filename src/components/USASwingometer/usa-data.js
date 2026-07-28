// usa-data.js — core reference data for the USA Swingometer.
// Architecture mirrors cyprus-data.js / greece-data.js: national "parties" (here,
// the two major-party lines plus a residual "other" bucket) get swung via a
// logit transform from a real baseline into each state, then electoral votes are
// awarded state-by-state (winner-take-all, matching 48 states + DC; Maine's and
// Nebraska's district splits are a documented simplification — see methodology).

export const USA = {
  TOTAL_EV: 538,
  MAJORITY_EV: 270,
  LEAN_COEFF: 0.026,
};

export function usToLogit(pct) {
  const p = Math.max(0.001, Math.min(0.999, pct / 100));
  return Math.log(p / (1 - p));
}
export function usFromLogit(lo) {
  return (1 / (1 + Math.exp(-lo))) * 100;
}

// ---------------------------------------------------------------------------
// Candidates. IDs are cycle-agnostic ("gop" / "dem" / "other") so the swing
// engine and Monte Carlo layer don't need to know which humans are running;
// only the display metadata changes per scenario.
export const USA_CANDIDATE_DICT = {
  gop:   { name: "GOP",  color: "#DC2626", ideology: 1,  sensitivities: { college: -1.05, seniors: 0.55, urban: -0.85, hispanic: 0.65, income: -0.10, gender: -0.55 } },
  dem:   { name: "DEM",  color: "#2563EB", ideology: -1, sensitivities: { college: 1.05,  seniors: -0.55, urban: 0.85, hispanic: -0.65, income: 0.10,  gender: 0.55 } },
  other: { name: "OTH",  color: "#9CA3AF", ideology: 0,  sensitivities: { college: 0, seniors: 0, urban: 0, hispanic: 0, income: 0, gender: 0 } },
};

export const USA_DEM_CONTROLS = [
  { key: "college",  label: "College-Educated Turnout", color: "#10B981", tip: "Negative = non-college surge · Positive = degree-holder surge (Dem-coded since 2016)" },
  { key: "seniors",   label: "Senior Turnout (65+)",     color: "#D97706", tip: "Negative = seniors stay home · Positive = seniors mobilised (GOP-coded since 2020)" },
  { key: "urban",     label: "Urban / Rural Skew",        color: "#0891B2", tip: "Negative = rural surge · Positive = urban-core surge" },
  { key: "hispanic",  label: "Hispanic Realignment",      color: "#F59E0B", tip: "Positive = continues the 2024 GOP gains with Hispanic voters · Negative = reverts toward 2020" },
  { key: "income",    label: "High-Income Suburbs",        color: "#7C3AED", tip: "Positive = affluent suburban swing toward Dem · Negative = reverts to pre-2016 pattern" },
  { key: "gender",    label: "Gender Gap",                 color: "#EC4899", tip: "Positive = women mobilised (reproductive rights salience) · Negative = male-heavy turnout" },
];
export const USA_DEM_RESET = { college: 0, seniors: 0, urban: 0, hispanic: 0, income: 0, gender: 0 };

// ---------------------------------------------------------------------------
// Electoral votes, 2024–2032 cycles (post-2020-census reapportionment). Sums to 538.
export const USA_EV = {
  AL: 9, AK: 3, AZ: 11, AR: 6, CA: 54, CO: 10, CT: 7, DE: 3, DC: 3, FL: 30,
  GA: 16, HI: 4, ID: 4, IL: 19, IN: 11, IA: 6, KS: 6, KY: 8, LA: 8, ME: 4,
  MD: 10, MA: 11, MI: 15, MN: 10, MS: 6, MO: 10, MT: 4, NE: 5, NV: 6, NH: 4,
  NJ: 14, NM: 5, NY: 28, NC: 16, ND: 3, OH: 17, OK: 7, OR: 8, PA: 19, RI: 4,
  SC: 9, SD: 3, TN: 11, TX: 40, UT: 6, VT: 3, VA: 13, WA: 12, WV: 4, WI: 10, WY: 3,
};

export const USA_STATE_NAMES = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "District of Columbia",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois",
  IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana",
  ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota",
  MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada",
  NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York",
  NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon",
  PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota",
  TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia",
  WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

// FIPS state-prefix -> USPS abbreviation (needed to key the D3 topology, whose
// feature ids are 2-digit FIPS codes, back to our results/EV tables).
export const USA_FIPS_TO_ABBR = {
  "01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA", "08": "CO", "09": "CT",
  "10": "DE", "11": "DC", "12": "FL", "13": "GA", "15": "HI", "16": "ID", "17": "IL",
  "18": "IN", "19": "IA", "20": "KS", "21": "KY", "22": "LA", "23": "ME", "24": "MD",
  "25": "MA", "26": "MI", "27": "MN", "28": "MS", "29": "MO", "30": "MT", "31": "NE",
  "32": "NV", "33": "NH", "34": "NJ", "35": "NM", "36": "NY", "37": "NC", "38": "ND",
  "39": "OH", "40": "OK", "41": "OR", "42": "PA", "44": "RI", "45": "SC", "46": "SD",
  "47": "TN", "48": "TX", "49": "UT", "50": "VT", "51": "VA", "53": "WA", "54": "WV",
  "55": "WI", "56": "WY",
};
// Territory FIPS present in us-atlas but outside the presidential election map.
export const USA_NON_STATE_FIPS = new Set(["60", "66", "69", "72", "78"]);

export const USA_REGIONS = {
  Northeast: ["ME","NH","VT","MA","RI","CT","NY","NJ","PA"],
  Midwest:   ["OH","MI","IN","WI","IL","MN","IA","MO","ND","SD","NE","KS"],
  South:     ["DE","MD","DC","VA","WV","NC","SC","GA","FL","KY","TN","AL","MS","AR","LA","OK","TX"],
  West:      ["MT","ID","WY","CO","NM","AZ","UT","NV","WA","OR","CA","AK","HI"],
};
export const USA_STATE_REGION = Object.fromEntries(
  Object.entries(USA_REGIONS).flatMap(([region, states]) => states.map(s => [s, region]))
);

// ---------------------------------------------------------------------------
// 2024 state-level popular vote baseline. AZ, AK, AL, AR, CA, CO, CT, DC, DE,
// FL, GA, HI, ID, IL, IN, MI, NC, NV, PA, WI are summed directly from the
// certified county-level returns bundled in usa-county-data.js (see
// rawdata/aggregate.mjs) — exact to the vote. The remaining states use
// certified statewide totals reported by state election authorities /
// AP as of the January 2025 certification (rounded to the nearest vote we had
// on hand); third-party + write-in totals fill the residual to 100%.
export const USA_2024 = {
  AL: { gop: 1462616, dem: 772412,  total: 2256352 },
  AK: { gop: 184407,  dem: 139690,  total: 324097  },
  AZ: { gop: 1770242, dem: 1582860, total: 3389319 },
  AR: { gop: 759241,  dem: 396905,  total: 1182676 },
  CA: { gop: 6081697, dem: 9276179, total: 15862536 },
  CO: { gop: 1377441, dem: 1728159, total: 3190873 },
  CT: { gop: 736918,  dem: 992053,  total: 1758429 },
  DE: { gop: 214351,  dem: 289758,  total: 511697  },
  DC: { gop: 21076,   dem: 294185,  total: 325869  },
  FL: { gop: 6110125, dem: 4683038, total: 10893547 },
  GA: { gop: 2663117, dem: 2548017, total: 5250047 },
  HI: { gop: 193661,  dem: 313044,  total: 516701  },
  ID: { gop: 605246,  dem: 274972,  total: 904812  },
  IL: { gop: 2449079, dem: 3062863, total: 5592368 },
  IN: { gop: 1696256, dem: 1154524, total: 2899851 },
  IA: { gop: 926745,  dem: 707278,  total: 1691465 },
  KS: { gop: 771246,  dem: 501552,  total: 1330810 },
  KY: { gop: 1335428, dem: 704924,  total: 2064730 },
  LA: { gop: 1208935, dem: 749033,  total: 2020490 },
  ME: { gop: 388928,  dem: 434124,  total: 848489  },
  MD: { gop: 985899,  dem: 1835101, total: 2864840 },
  MA: { gop: 1251001, dem: 2072512, total: 3403182 },
  MI: { gop: 2816636, dem: 2736533, total: 5662504 },
  MN: { gop: 1519013, dem: 1568986, total: 3254853 },
  MS: { gop: 743300,  dem: 442795,  total: 1219020 },
  MO: { gop: 1730533, dem: 1190772, total: 2961201 },
  MT: { gop: 302864,  dem: 189225,  total: 518492  },
  NE: { gop: 564000,  dem: 379000,  total: 965226  },
  NV: { gop: 751205,  dem: 705197,  total: 1484840 },
  NH: { gop: 361829,  dem: 424937,  total: 812637  },
  NJ: { gop: 1968215, dem: 2057451, total: 4243506 },
  NM: { gop: 423391,  dem: 478802,  total: 923965  },
  NY: { gop: 3588178, dem: 4632185, total: 8477434 },
  NC: { gop: 2898423, dem: 2715375, total: 5679647 },
  ND: { gop: 216000,  dem: 84000,   total: 322895  },
  OH: { gop: 3133919, dem: 2533699, total: 5721390 },
  OK: { gop: 1036213, dem: 499199,  total: 1571905 },
  OR: { gop: 967506,  dem: 1167346, total: 2183021 },
  PA: { gop: 3543308, dem: 3423042, total: 7034206 },
  RI: { gop: 174214,  dem: 283163,  total: 471618  },
  SC: { gop: 1483747, dem: 1032384, total: 2599033 },
  SD: { gop: 273000,  dem: 150000,  total: 439459  },
  TN: { gop: 1969077, dem: 1058940, total: 3060381 },
  TX: { gop: 6393597, dem: 4835250, total: 11292154 },
  UT: { gop: 883860,  dem: 560282,  total: 1470834 },
  VT: { gop: 121171,  dem: 216974,  total: 367480  },
  VA: { gop: 1968239, dem: 2063607, total: 4249146 },
  WA: { gop: 1548004, dem: 2158648, total: 3939792 },
  WV: { gop: 606860,  dem: 214309,  total: 837166  },
  WI: { gop: 1697626, dem: 1668229, total: 3415213 },
  WY: { gop: 197415,  dem: 57468,   total: 271656  },
};

// 2020 state-level baseline (Trump vs Biden), used as the prior-cycle scenario
// and to derive each state's revealed 2020→2024 "lean drift" for the model.
export const USA_2020 = {
  AL: { gop: 1441170, dem: 849624,  total: 2323282 }, AK: { gop: 189951, dem: 153778, total: 359530 },
  AZ: { gop: 1661686, dem: 1672143, total: 3387326 }, AR: { gop: 760647, dem: 423932, total: 1219069 },
  CA: { gop: 6006429, dem: 11110250,total: 17500881 }, CO: { gop: 1364607, dem: 1804352, total: 3256980 },
  CT: { gop: 715291,  dem: 1080831, total: 1823857 }, DE: { gop: 200603, dem: 296268, total: 504346 },
  DC: { gop: 18586,   dem: 317323,  total: 344356 },   FL: { gop: 5668731, dem: 5297045, total: 11067456 },
  GA: { gop: 2461837, dem: 2473633, total: 4999960 },  HI: { gop: 196602, dem: 366130, total: 574469 },
  ID: { gop: 554119,  dem: 287021,  total: 861123 },   IL: { gop: 2446891, dem: 3471915, total: 6033744 },
  IN: { gop: 1729519, dem: 1242416, total: 3033919 },  IA: { gop: 897672, dem: 759061, total: 1690871 },
  KS: { gop: 771406,  dem: 570323,  total: 1372949 },  KY: { gop: 1326646, dem: 772474, total: 2136768 },
  LA: { gop: 1255776, dem: 856034,  total: 2144032 },  ME: { gop: 360737, dem: 435072, total: 819580 },
  MD: { gop: 976414,  dem: 1985023, total: 3037030 },  MA: { gop: 1167202, dem: 2382202, total: 3631402 },
  MI: { gop: 2649852, dem: 2804040, total: 5539302 },  MN: { gop: 1484065, dem: 1717077, total: 3277171 },
  MS: { gop: 756763,  dem: 539508,  total: 1313853 },  MO: { gop: 1718736, dem: 1253014, total: 3009498 },
  MT: { gop: 343602,  dem: 244786,  total: 603640 },   NE: { gop: 556846, dem: 374583, total: 960834 },
  NV: { gop: 669890,  dem: 703486,  total: 1405376 },  NH: { gop: 365660, dem: 424937, total: 806205 },
  NJ: { gop: 1883274, dem: 2608335, total: 4568879 },  NM: { gop: 401894, dem: 501614, total: 923965 },
  NY: { gop: 3251997, dem: 5230985, total: 8618828 },  NC: { gop: 2758775, dem: 2684292, total: 5524804 },
  ND: { gop: 235595,  dem: 114902,  total: 361819 },   OH: { gop: 3154834, dem: 2679165, total: 5922702 },
  OK: { gop: 1020280, dem: 503890,  total: 1560699 },  OR: { gop: 958448, dem: 1340383, total: 2374321 },
  PA: { gop: 3377674, dem: 3458229, total: 6915283 },  RI: { gop: 199922, dem: 307486, total: 517757 },
  SC: { gop: 1385103, dem: 1091541, total: 2513329 },  SD: { gop: 261043, dem: 150471, total: 422609 },
  TN: { gop: 1852475, dem: 1143711, total: 3053851 },  TX: { gop: 5890347, dem: 5259126, total: 11315056 },
  UT: { gop: 865140,  dem: 560282,  total: 1488656 },  VT: { gop: 112704, dem: 242820, total: 367480 },
  VA: { gop: 1962430, dem: 2413568, total: 4460524 },  WA: { gop: 1584651, dem: 2369612, total: 4087631 },
  WV: { gop: 545382,  dem: 235984,  total: 792438 },   WI: { gop: 1610184, dem: 1630866, total: 3298041 },
  WY: { gop: 193559,  dem: 73491,   total: 278503 },
};

export const USA_SCENARIOS_RAW = { "2024": USA_2024, "2020": USA_2020 };
export const USA_SCENARIO_LABELS = { "2024": "November 2024 — Trump/Vance vs Harris/Walz", "2020": "November 2020 — Biden/Harris vs Trump/Pence" };
export const USA_CANDIDATE_LABELS = {
  "2024": { gop: "Trump/Vance", dem: "Harris/Walz" },
  "2020": { gop: "Trump/Pence", dem: "Biden/Harris" },
};

// Builds the national scenario array (mirrors CY_SCENARIOS' cyBuildScenario shape).
function usBuildScenario(byState, year) {
  let gop = 0, dem = 0, total = 0;
  for (const s of Object.values(byState)) { gop += s.gop; dem += s.dem; total += s.total; }
  const other = Math.max(0, total - gop - dem);
  const rows = [
    { id: "gop", ...USA_CANDIDATE_DICT.gop, label: USA_CANDIDATE_LABELS[year].gop, votes: gop },
    { id: "dem", ...USA_CANDIDATE_DICT.dem, label: USA_CANDIDATE_LABELS[year].dem, votes: dem },
    { id: "other", ...USA_CANDIDATE_DICT.other, label: "Other / Third Party", votes: other },
  ];
  return rows.map(r => ({ ...r, basePercentage: (r.votes / total) * 100, userPercentage: (r.votes / total) * 100 }));
}
export const USA_SCENARIOS = { "2024": usBuildScenario(USA_2024, "2024"), "2020": usBuildScenario(USA_2020, "2020") };
export const USA_SCENARIO_TURNOUT = Object.fromEntries(
  Object.entries(USA_SCENARIOS_RAW).map(([y, byState]) => [y, Object.values(byState).reduce((s, v) => s + v.total, 0)])
);

// Per-state baseline percentages the swing engine perturbs (gop/dem/other must sum to 100).
export function usStateBaselines(byState) {
  const out = {};
  for (const [abbr, s] of Object.entries(byState)) {
    const other = Math.max(0.05, s.total - s.gop - s.dem);
    const total = s.gop + s.dem + other;
    out[abbr] = { gop: (s.gop / total) * 100, dem: (s.dem / total) * 100, other: (other / total) * 100 };
  }
  return out;
}
export const USA_STATE_BASELINES = { "2024": usStateBaselines(USA_2024), "2020": usStateBaselines(USA_2020) };

// Per-state structural "lean" fed into the swing model — the residual (in
// logit points) between how each state moved 2020→2024 vs the national
// average shift, i.e. how much more/less swingy a state has proven than the
// country as a whole. Positive = swung more GOP than the nation; negative =
// swung more Dem than the nation. Derived once from USA_STATE_BASELINES.
export const USA_STATE_LEAN = (() => {
  const b24 = USA_STATE_BASELINES["2024"], b20 = USA_STATE_BASELINES["2020"];
  const nat24 = usStateBaselines({ US: Object.values(USA_2024).reduce((a, s) => ({ gop: a.gop + s.gop, dem: a.dem + s.dem, total: a.total + s.total }), { gop: 0, dem: 0, total: 0 }) }).US;
  const nat20 = usStateBaselines({ US: Object.values(USA_2020).reduce((a, s) => ({ gop: a.gop + s.gop, dem: a.dem + s.dem, total: a.total + s.total }), { gop: 0, dem: 0, total: 0 }) }).US;
  const natShift = usToLogit(nat24.gop) - usToLogit(nat20.gop);
  const out = {};
  for (const abbr of Object.keys(b24)) {
    const shift = usToLogit(b24[abbr].gop) - usToLogit(b20[abbr].gop);
    out[abbr] = +(shift - natShift).toFixed(4);
  }
  return out;
})();

// ---------------------------------------------------------------------------
// State-level demographic aggregates (ACS 5-year-style estimates, ~2023,
// approximate to the nearest reporting unit — see methodology). Used for the
// demographic-swing sliders and the map's demographic overlay layer, in the
// same role CY_DISTRICT_DEMOGRAPHICS plays for Cyprus.
//   pop: 2023 population estimate (millions)
//   bachelorPct: % 25+ with a bachelor's degree or higher
//   income: median household income ($)
//   seniorPct: % population 65+
//   whiteNHPct: % white alone, not Hispanic/Latino
//   hispanicPct: % Hispanic or Latino (any race)
//   foreignBornPct: % foreign-born
export const USA_STATE_DEMOGRAPHICS = {
  AL:{pop:5.1,bachelorPct:27.6,income:59609,seniorPct:17.7,whiteNHPct:63.0,hispanicPct:5.0,foreignBornPct:3.9},
  AK:{pop:0.73,bachelorPct:30.5,income:86370,seniorPct:12.5,whiteNHPct:57.0,hispanicPct:7.6,foreignBornPct:8.0},
  AZ:{pop:7.4,bachelorPct:32.0,income:72581,seniorPct:18.4,whiteNHPct:52.6,hispanicPct:32.3,foreignBornPct:13.6},
  AR:{pop:3.05,bachelorPct:25.4,income:56335,seniorPct:17.4,whiteNHPct:69.0,hispanicPct:8.5,foreignBornPct:4.9},
  CA:{pop:38.9,bachelorPct:35.4,income:91905,seniorPct:15.2,whiteNHPct:34.7,hispanicPct:40.2,foreignBornPct:26.7},
  CO:{pop:5.9,bachelorPct:44.0,income:92911,seniorPct:14.5,whiteNHPct:66.3,hispanicPct:22.2,foreignBornPct:10.1},
  CT:{pop:3.6,bachelorPct:42.0,income:90213,seniorPct:17.7,whiteNHPct:63.9,hispanicPct:17.6,foreignBornPct:15.0},
  DE:{pop:1.02,bachelorPct:34.0,income:79325,seniorPct:19.4,whiteNHPct:58.0,hispanicPct:10.1,foreignBornPct:10.0},
  DC:{pop:0.68,bachelorPct:62.0,income:106287,seniorPct:12.9,whiteNHPct:36.0,hispanicPct:11.5,foreignBornPct:14.2},
  FL:{pop:22.6,bachelorPct:32.0,income:67917,seniorPct:21.3,whiteNHPct:50.6,hispanicPct:27.1,foreignBornPct:21.5},
  GA:{pop:11.0,bachelorPct:33.0,income:71355,seniorPct:14.8,whiteNHPct:50.1,hispanicPct:10.7,foreignBornPct:10.6},
  HI:{pop:1.44,bachelorPct:34.0,income:95322,seniorPct:18.6,whiteNHPct:21.4,hispanicPct:11.1,foreignBornPct:18.4},
  ID:{pop:1.96,bachelorPct:29.0,income:70214,seniorPct:16.1,whiteNHPct:78.2,hispanicPct:13.4,foreignBornPct:6.5},
  IL:{pop:12.5,bachelorPct:36.0,income:78433,seniorPct:16.3,whiteNHPct:58.2,hispanicPct:18.3,foreignBornPct:13.9},
  IN:{pop:6.8,bachelorPct:28.0,income:65284,seniorPct:16.9,whiteNHPct:76.4,hispanicPct:8.1,foreignBornPct:5.1},
  IA:{pop:3.2,bachelorPct:30.0,income:68430,seniorPct:18.1,whiteNHPct:82.9,hispanicPct:7.0,foreignBornPct:5.4},
  KS:{pop:2.9,bachelorPct:34.0,income:69747,seniorPct:16.6,whiteNHPct:71.7,hispanicPct:13.1,foreignBornPct:7.2},
  KY:{pop:4.5,bachelorPct:26.0,income:60183,seniorPct:17.7,whiteNHPct:82.9,hispanicPct:4.9,foreignBornPct:3.9},
  LA:{pop:4.6,bachelorPct:26.0,income:57852,seniorPct:16.4,whiteNHPct:56.6,hispanicPct:6.2,foreignBornPct:4.3},
  ME:{pop:1.4,bachelorPct:33.0,income:68251,seniorPct:21.5,whiteNHPct:92.2,hispanicPct:2.2,foreignBornPct:4.2},
  MD:{pop:6.2,bachelorPct:42.0,income:98461,seniorPct:16.3,whiteNHPct:46.9,hispanicPct:12.0,foreignBornPct:15.7},
  MA:{pop:7.0,bachelorPct:46.0,income:96505,seniorPct:17.5,whiteNHPct:68.3,hispanicPct:12.9,foreignBornPct:17.9},
  MI:{pop:10.0,bachelorPct:31.0,income:68505,seniorPct:18.0,whiteNHPct:73.0,hispanicPct:5.7,foreignBornPct:7.1},
  MN:{pop:5.7,bachelorPct:39.0,income:84313,seniorPct:16.6,whiteNHPct:76.3,hispanicPct:6.1,foreignBornPct:9.0},
  MS:{pop:2.9,bachelorPct:23.0,income:52719,seniorPct:16.4,whiteNHPct:55.4,hispanicPct:3.6,foreignBornPct:2.6},
  MO:{pop:6.2,bachelorPct:30.0,income:65920,seniorPct:17.6,whiteNHPct:77.4,hispanicPct:5.1,foreignBornPct:4.6},
  MT:{pop:1.13,bachelorPct:33.0,income:66341,seniorPct:19.1,whiteNHPct:84.4,hispanicPct:4.4,foreignBornPct:3.0},
  NE:{pop:2.0,bachelorPct:33.0,income:71722,seniorPct:15.6,whiteNHPct:79.4,hispanicPct:12.5,foreignBornPct:7.1},
  NV:{pop:3.2,bachelorPct:27.0,income:71646,seniorPct:16.5,whiteNHPct:44.7,hispanicPct:30.4,foreignBornPct:19.9},
  NH:{pop:1.4,bachelorPct:39.0,income:90845,seniorPct:19.1,whiteNHPct:88.6,hispanicPct:4.4,foreignBornPct:6.0},
  NJ:{pop:9.3,bachelorPct:41.0,income:97126,seniorPct:16.7,whiteNHPct:51.0,hispanicPct:21.6,foreignBornPct:24.0},
  NM:{pop:2.1,bachelorPct:28.0,income:58722,seniorPct:18.5,whiteNHPct:36.5,hispanicPct:49.7,foreignBornPct:10.5},
  NY:{pop:19.6,bachelorPct:38.0,income:81386,seniorPct:17.0,whiteNHPct:52.5,hispanicPct:19.6,foreignBornPct:22.4},
  NC:{pop:10.8,bachelorPct:33.0,income:66186,seniorPct:16.6,whiteNHPct:60.5,hispanicPct:10.3,foreignBornPct:8.4},
  ND:{pop:0.78,bachelorPct:31.0,income:71970,seniorPct:15.4,whiteNHPct:82.0,hispanicPct:4.4,foreignBornPct:3.9},
  OH:{pop:11.8,bachelorPct:29.5,income:66990,seniorPct:18.0,whiteNHPct:76.9,hispanicPct:4.5,foreignBornPct:5.0},
  OK:{pop:4.05,bachelorPct:27.0,income:61364,seniorPct:15.7,whiteNHPct:62.1,hispanicPct:12.5,foreignBornPct:6.4},
  OR:{pop:4.2,bachelorPct:36.0,income:76632,seniorPct:18.7,whiteNHPct:71.5,hispanicPct:13.5,foreignBornPct:10.4},
  PA:{pop:13.0,bachelorPct:33.0,income:73170,seniorPct:18.9,whiteNHPct:73.6,hispanicPct:8.5,foreignBornPct:8.2},
  RI:{pop:1.1,bachelorPct:36.0,income:81370,seniorPct:18.0,whiteNHPct:66.2,hispanicPct:17.0,foreignBornPct:14.6},
  SC:{pop:5.4,bachelorPct:29.0,income:63623,seniorPct:19.0,whiteNHPct:62.6,hispanicPct:6.9,foreignBornPct:5.6},
  SD:{pop:0.92,bachelorPct:30.0,income:69457,seniorPct:17.4,whiteNHPct:79.1,hispanicPct:5.0,foreignBornPct:3.9},
  TN:{pop:7.1,bachelorPct:29.0,income:65254,seniorPct:17.6,whiteNHPct:70.6,hispanicPct:6.5,foreignBornPct:5.7},
  TX:{pop:30.5,bachelorPct:30.5,income:73035,seniorPct:13.2,whiteNHPct:39.3,hispanicPct:40.2,foreignBornPct:17.1},
  UT:{pop:3.4,bachelorPct:37.0,income:86833,seniorPct:11.7,whiteNHPct:74.4,hispanicPct:15.1,foreignBornPct:8.9},
  VT:{pop:0.65,bachelorPct:41.0,income:74014,seniorPct:20.7,whiteNHPct:90.1,hispanicPct:2.2,foreignBornPct:4.9},
  VA:{pop:8.7,bachelorPct:40.0,income:87249,seniorPct:16.1,whiteNHPct:59.5,hispanicPct:10.5,foreignBornPct:12.9},
  WA:{pop:7.8,bachelorPct:38.0,income:90325,seniorPct:15.9,whiteNHPct:62.4,hispanicPct:14.1,foreignBornPct:14.5},
  WV:{pop:1.77,bachelorPct:22.0,income:55217,seniorPct:20.9,whiteNHPct:91.1,hispanicPct:1.9,foreignBornPct:1.6},
  WI:{pop:5.9,bachelorPct:32.0,income:72458,seniorPct:17.6,whiteNHPct:78.1,hispanicPct:7.6,foreignBornPct:5.2},
  WY:{pop:0.58,bachelorPct:29.0,income:72415,seniorPct:16.6,whiteNHPct:82.5,hispanicPct:10.5,foreignBornPct:3.5},
};

// States with genuine certified county-level detail transcribed from the
// supplied returns file (usa-county-data.js). All other states still render
// real county boundaries on the map, shaded uniformly by their modelled
// statewide result — see usa-map.jsx.
export const USA_COUNTY_DETAIL_STATES = new Set([
  "AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN","MI","WI","PA","NV","NC",
]);
