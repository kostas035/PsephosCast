// usa-data.js — core reference data for the USA Swingometer.
// Architecture mirrors cyprus-data.js / greece-data.js: national candidates get
// swung via a logit transform from a real baseline into each state (and, since
// we now have certified county-level returns for all ~3,140 counties, into
// every county too), then electoral votes are awarded state-by-state
// (winner-take-all, matching 48 states + DC; Maine's and Nebraska's district
// splits are a documented simplification — see methodology).

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
// Candidates. IDs are cycle-agnostic so the swing engine and Monte Carlo layer
// don't need to know which humans are running; only display metadata (label,
// via USA_CANDIDATE_LABELS) changes per scenario. Third-party sensitivities
// are 0 — the demographic sliders model the two-party dynamic only, matching
// how these blocs are actually tracked in exit polling.
export const USA_CANDIDATE_DICT = {
  gop:   { name: "GOP",  color: "#DC2626", ideology: 1,    sensitivities: {} },
  dem:   { name: "DEM",  color: "#2563EB", ideology: -1,   sensitivities: {} },
  grn:   { name: "GRN",  color: "#16A34A", ideology: -1.5, sensitivities: {} },
  lib:   { name: "LIB",  color: "#CA8A04", ideology: 1.5,  sensitivities: {} },
  rfk:   { name: "RFK",  color: "#7C3AED", ideology: 0.2,  sensitivities: {} },
  west:  { name: "WEST", color: "#EA580C", ideology: -1.8, sensitivities: {} },
  other: { name: "OTH",  color: "#9CA3AF", ideology: 0,    sensitivities: {} },
};
// Which candidate ids are on the ballot (as modelled) for each scenario year.
export const USA_CANDIDATE_IDS_BY_YEAR = {
  "2024": ["gop", "dem", "grn", "lib", "rfk", "west", "other"],
  "2020": ["gop", "dem", "grn", "lib", "other"],
};

// ---------------------------------------------------------------------------
// Demographic swing groups. Each group's baseline is a real, sourced national
// 2-party vote split (2024 AP VoteCast / Edison Research exit polling) shown
// directly in the control panel; the slider shifts THAT group's split toward
// Dem (positive) or GOP (negative), and the resulting national impact is
// scaled by the group's real approximate share of the national electorate —
// so a full drag on "White" (71% of voters) moves the topline far more than
// the same drag on "Black" (12% of voters). Applied as a uniform national
// swing (not geographically weighted beyond the existing state-lean model) —
// see methodology for that simplification.
function usDemoGroup(key, label, electorateShare, baselineDemPct, marginSwingMax, source) {
  const baselineGopPct = 100 - baselineDemPct;
  const demSens = +((electorateShare * marginSwingMax) / 2).toFixed(3);
  return { key, label, electorateShare, baselineDemPct, baselineGopPct, marginSwingMax, demSens, source };
}
export const USA_DEMO_GROUPS = [
  usDemoGroup("hispanic", "Hispanic / Latino Voters", 0.13, 55, 30, "AP VoteCast 2024"),
  usDemoGroup("black",    "Black Voters",              0.12, 86, 20, "Edison Research exit poll 2024"),
  usDemoGroup("white",    "White Voters",               0.71, 43, 10, "Edison Research exit poll 2024"),
  usDemoGroup("men",      "Men",                        0.47, 44, 12, "Edison Research exit poll 2024"),
  usDemoGroup("women",    "Women",                      0.53, 54, 12, "Edison Research exit poll 2024"),
  usDemoGroup("youth",    "Age 18–29 (Youth)",          0.13, 55, 25, "Edison Research exit poll 2024"),
  usDemoGroup("seniors",  "Age 65+ (Seniors)",          0.25, 50, 15, "Edison Research exit poll 2024"),
  usDemoGroup("college",  "College Graduates",          0.40, 57, 18, "Edison Research exit poll 2024"),
];
export const USA_DEMO_RESET = Object.fromEntries(USA_DEMO_GROUPS.map(g => [g.key, 0]));
// Wire the derived dem/gop sensitivities into the candidate dict (2-party only).
for (const g of USA_DEMO_GROUPS) {
  USA_CANDIDATE_DICT.dem.sensitivities[g.key] = g.demSens;
  USA_CANDIDATE_DICT.gop.sensitivities[g.key] = -g.demSens;
}

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
// State-level two-party vote totals, summed EXACTLY from certified county-level
// returns for all 51 jurisdictions (source: tonmcg/US_County_Level_Election_
// Results_08-24, itself compiled from official state/county election-authority
// reporting — see rawdata/build.mjs to regenerate). Alaska is reported by
// state house district and DC by ward (neither state publishes true county-level
// results), which is why those two don't join to real county map geometry —
// see USA_COUNTY_DETAIL_STATES.
export const USA_2024 = {
  AK: { gop: 184407, dem: 139690, total: 324097 },
  AL: { gop: 1462616, dem: 772412, total: 2256352 },
  AR: { gop: 759241, dem: 396905, total: 1182676 },
  AZ: { gop: 1770242, dem: 1582860, total: 3389319 },
  CA: { gop: 6081697, dem: 9276179, total: 15862536 },
  CO: { gop: 1377441, dem: 1728159, total: 3190873 },
  CT: { gop: 736918, dem: 992053, total: 1758429 },
  DC: { gop: 21076, dem: 294185, total: 325869 },
  DE: { gop: 214351, dem: 289758, total: 511697 },
  FL: { gop: 6110125, dem: 4683038, total: 10893547 },
  GA: { gop: 2663117, dem: 2548017, total: 5250047 },
  HI: { gop: 193661, dem: 313044, total: 516701 },
  IA: { gop: 927019, dem: 707278, total: 1656849 },
  ID: { gop: 605246, dem: 274972, total: 904812 },
  IL: { gop: 2449079, dem: 3062863, total: 5592368 },
  IN: { gop: 1720347, dem: 1163603, total: 2933700 },
  KS: { gop: 758802, dem: 544853, total: 1327591 },
  KY: { gop: 1337494, dem: 704043, total: 2073309 },
  LA: { gop: 1208505, dem: 766870, total: 2006975 },
  MA: { gop: 1251308, dem: 2126545, total: 3453437 },
  MD: { gop: 1035550, dem: 1902577, total: 3015650 },
  ME: { gop: 377977, dem: 435652, total: 831375 },
  MI: { gop: 2816636, dem: 2736533, total: 5662504 },
  MN: { gop: 1519032, dem: 1656979, total: 3240916 },
  MO: { gop: 1751986, dem: 1200599, total: 2993596 },
  MS: { gop: 747744, dem: 466668, total: 1228008 },
  MT: { gop: 352079, dem: 231906, total: 602963 },
  NC: { gop: 2898423, dem: 2715375, total: 5679647 },
  ND: { gop: 246505, dem: 112327, total: 365059 },
  NE: { gop: 564816, dem: 369995, total: 947159 },
  NH: { gop: 395578, dem: 418496, total: 822153 },
  NJ: { gop: 1968215, dem: 2220713, total: 4272725 },
  NM: { gop: 423391, dem: 478802, total: 923403 },
  NV: { gop: 751205, dem: 705197, total: 1484840 },
  NY: { gop: 3578899, dem: 4619195, total: 8198094 },
  OH: { gop: 3180116, dem: 2533699, total: 5765017 },
  OK: { gop: 1036213, dem: 499599, total: 1566173 },
  OR: { gop: 910702, dem: 1228410, total: 2207592 },
  PA: { gop: 3543308, dem: 3423042, total: 7034206 },
  RI: { gop: 214406, dem: 285156, total: 510659 },
  SC: { gop: 1483747, dem: 1028452, total: 2548140 },
  SD: { gop: 272081, dem: 146859, total: 428922 },
  TN: { gop: 1966865, dem: 1056265, total: 3063942 },
  TX: { gop: 6393597, dem: 4835250, total: 11380105 },
  UT: { gop: 883818, dem: 562566, total: 1487951 },
  VA: { gop: 2075085, dem: 2335395, total: 4482576 },
  VT: { gop: 119395, dem: 235791, total: 366389 },
  WA: { gop: 1530923, dem: 2245849, total: 3898835 },
  WI: { gop: 1697626, dem: 1668229, total: 3415213 },
  WV: { gop: 533556, dem: 214309, total: 762390 },
  WY: { gop: 192633, dem: 69527, total: 266353 },
};

export const USA_2020 = {
  AK: { gop: 189892, dem: 153405, total: 391346 },
  AL: { gop: 1441168, dem: 849648, total: 2323304 },
  AR: { gop: 760647, dem: 423932, total: 1219069 },
  AZ: { gop: 1661686, dem: 1672143, total: 3387326 },
  CA: { gop: 6005961, dem: 11109764, total: 17495906 },
  CO: { gop: 1364607, dem: 1804352, total: 3256953 },
  CT: { gop: 715291, dem: 1080680, total: 1824280 },
  DC: { gop: 18586, dem: 317323, total: 344356 },
  DE: { gop: 200603, dem: 296268, total: 504010 },
  FL: { gop: 5668731, dem: 5297045, total: 11067456 },
  GA: { gop: 2461854, dem: 2473633, total: 4997716 },
  HI: { gop: 196864, dem: 366130, total: 574469 },
  IA: { gop: 897672, dem: 759061, total: 1690871 },
  ID: { gop: 554118, dem: 287021, total: 868105 },
  IL: { gop: 2446891, dem: 3471915, total: 6038850 },
  IN: { gop: 1729852, dem: 1242495, total: 3033198 },
  KS: { gop: 758100, dem: 558669, total: 1349567 },
  KY: { gop: 1326646, dem: 772474, total: 2136768 },
  LA: { gop: 1255776, dem: 856034, total: 2148062 },
  MA: { gop: 1167202, dem: 2382202, total: 3631402 },
  MD: { gop: 976414, dem: 1985023, total: 3037030 },
  ME: { gop: 359899, dem: 430473, total: 813740 },
  MI: { gop: 2649852, dem: 2804040, total: 5539302 },
  MN: { gop: 1484065, dem: 1717077, total: 3277171 },
  MO: { gop: 1718736, dem: 1253014, total: 3025962 },
  MS: { gop: 756764, dem: 539398, total: 1315178 },
  MT: { gop: 343602, dem: 244786, total: 605750 },
  NC: { gop: 2758773, dem: 2684292, total: 5524801 },
  ND: { gop: 235595, dem: 114902, total: 361819 },
  NE: { gop: 556846, dem: 374583, total: 956379 },
  NH: { gop: 365654, dem: 424921, total: 804430 },
  NJ: { gop: 1883274, dem: 2608335, total: 4564234 },
  NM: { gop: 401894, dem: 501614, total: 923965 },
  NV: { gop: 669890, dem: 703486, total: 1405376 },
  NY: { gop: 3250230, dem: 5244006, total: 8616205 },
  OH: { gop: 3154834, dem: 2679165, total: 5922202 },
  OK: { gop: 1020280, dem: 503890, total: 1560699 },
  OR: { gop: 958448, dem: 1340383, total: 2374321 },
  PA: { gop: 3378263, dem: 3459923, total: 6925255 },
  RI: { gop: 199837, dem: 306210, total: 516383 },
  SC: { gop: 1385103, dem: 1091541, total: 2513329 },
  SD: { gop: 261043, dem: 150471, total: 422609 },
  TN: { gop: 1852475, dem: 1143711, total: 3053851 },
  TX: { gop: 5890347, dem: 5259126, total: 11317911 },
  UT: { gop: 865140, dem: 560282, total: 1488289 },
  VA: { gop: 1962430, dem: 2413568, total: 4460524 },
  VT: { gop: 112704, dem: 242820, total: 367428 },
  WA: { gop: 1584651, dem: 2369612, total: 4087631 },
  WI: { gop: 1610065, dem: 1630673, total: 3297352 },
  WV: { gop: 545382, dem: 235984, total: 794652 },
  WY: { gop: 193559, dem: 73491, total: 276765 },
};

// Third-party votes per state. "other" here is the true residual write-in /
// unnamed-minor-candidate pool (state total minus every named line), NOT a
// leftover rounding bucket — see rawdata/build.mjs for the modelling method
// (real national vote totals for each candidate, gated by ballot access,
// distributed within each state's exact certified "other" pool).
export const USA_2024_MINOR = {
  AK: { grn: 0, lib: 0, rfk: 0, west: 0, other: 0 },
  AL: { grn: 7251, lib: 5412, rfk: 6304, west: 0, other: 2357 },
  AR: { grn: 9021, lib: 6734, rfk: 7843, west: 0, other: 2932 },
  AZ: { grn: 12315, lib: 9192, rfk: 0, west: 1196, other: 13514 },
  CA: { grn: 171599, lib: 128089, rfk: 149186, west: 16661, other: 39125 },
  CO: { grn: 28995, lib: 21643, rfk: 25208, west: 2815, other: 6612 },
  CT: { grn: 10017, lib: 7477, rfk: 8708, west: 973, other: 2283 },
  DC: { grn: 3607, lib: 2692, rfk: 3136, west: 350, other: 823 },
  DE: { grn: 2580, lib: 1926, rfk: 2243, west: 0, other: 839 },
  FL: { grn: 34133, lib: 25479, rfk: 0, west: 3314, other: 37458 },
  GA: { grn: 13232, lib: 9877, rfk: 0, west: 1285, other: 14519 },
  HI: { grn: 3399, lib: 2537, rfk: 2955, west: 0, other: 1105 },
  IA: { grn: 7668, lib: 5724, rfk: 6667, west: 745, other: 1748 },
  ID: { grn: 8363, lib: 6242, rfk: 7270, west: 0, other: 2719 },
  IL: { grn: 27347, lib: 20413, rfk: 23775, west: 2655, other: 6236 },
  IN: { grn: 16916, lib: 12627, rfk: 14707, west: 1642, other: 3858 },
  KS: { grn: 8139, lib: 6075, rfk: 7076, west: 0, other: 2646 },
  KY: { grn: 10803, lib: 8064, rfk: 9392, west: 1049, other: 2464 },
  LA: { grn: 10745, lib: 8020, rfk: 9342, west: 0, other: 3493 },
  MA: { grn: 25701, lib: 19184, rfk: 0, west: 0, other: 30699 },
  MD: { grn: 26360, lib: 19676, rfk: 22917, west: 2559, other: 6011 },
  ME: { grn: 6034, lib: 4504, rfk: 0, west: 586, other: 6622 },
  MI: { grn: 37177, lib: 27751, rfk: 32321, west: 3610, other: 8476 },
  MN: { grn: 22070, lib: 16474, rfk: 19187, west: 2143, other: 5031 },
  MO: { grn: 13945, lib: 10409, rfk: 12124, west: 1354, other: 3179 },
  MS: { grn: 4623, lib: 3451, rfk: 4019, west: 0, other: 1503 },
  MT: { grn: 6453, lib: 4817, rfk: 5610, west: 0, other: 2098 },
  NC: { grn: 22391, lib: 16713, rfk: 0, west: 2174, other: 24571 },
  ND: { grn: 2117, lib: 1580, rfk: 0, west: 0, other: 2530 },
  NE: { grn: 4199, lib: 3134, rfk: 0, west: 0, other: 5015 },
  NH: { grn: 2747, lib: 2051, rfk: 0, west: 267, other: 3014 },
  NJ: { grn: 28493, lib: 21269, rfk: 24772, west: 2766, other: 6497 },
  NM: { grn: 7212, lib: 5383, rfk: 6270, west: 700, other: 1645 },
  NV: { grn: 9670, lib: 7218, rfk: 0, west: 939, other: 10611 },
  NY: { grn: 0, lib: 0, rfk: 0, west: 0, other: 0 },
  OH: { grn: 17410, lib: 12996, rfk: 0, west: 1690, other: 19106 },
  OK: { grn: 10324, lib: 7706, rfk: 8975, west: 0, other: 3356 },
  OR: { grn: 23285, lib: 17381, rfk: 20244, west: 2261, other: 5309 },
  PA: { grn: 23073, lib: 17223, rfk: 0, west: 2240, other: 25320 },
  RI: { grn: 3773, lib: 2817, rfk: 3280, west: 366, other: 861 },
  SC: { grn: 12221, lib: 9122, rfk: 0, west: 0, other: 14598 },
  SD: { grn: 3394, lib: 2534, rfk: 2951, west: 0, other: 1103 },
  TN: { grn: 13877, lib: 10359, rfk: 12065, west: 0, other: 4511 },
  TX: { grn: 51432, lib: 38391, rfk: 0, west: 4994, other: 56441 },
  UT: { grn: 14134, lib: 10550, rfk: 0, west: 0, other: 16883 },
  VA: { grn: 24515, lib: 18299, rfk: 0, west: 2380, other: 26902 },
  VT: { grn: 3809, lib: 2843, rfk: 3312, west: 370, other: 869 },
  WA: { grn: 41505, lib: 30981, rfk: 36084, west: 4030, other: 9463 },
  WI: { grn: 16783, lib: 12528, rfk: 14591, west: 1629, other: 3827 },
  WV: { grn: 4939, lib: 3687, rfk: 4294, west: 0, other: 1605 },
  WY: { grn: 1426, lib: 1064, rfk: 0, west: 0, other: 1703 },
};
export const USA_2020_MINOR = {
  AK: { grn: 6607, lib: 30279, other: 11163 },
  AL: { grn: 4467, lib: 20473, other: 7548 },
  AR: { grn: 4743, lib: 21735, other: 8012 },
  AZ: { grn: 7356, lib: 33712, other: 12429 },
  CA: { grn: 52277, lib: 239579, other: 88325 },
  CO: { grn: 12100, lib: 55451, other: 20443 },
  CT: { grn: 3893, lib: 17839, other: 6577 },
  DC: { grn: 1162, lib: 5323, other: 1962 },
  DE: { grn: 982, lib: 4499, other: 1658 },
  FL: { grn: 13982, lib: 64076, other: 23622 },
  GA: { grn: 8557, lib: 39215, other: 14457 },
  HI: { grn: 1578, lib: 7231, other: 2666 },
  IA: { grn: 4694, lib: 21513, other: 7931 },
  ID: { grn: 3708, lib: 16993, other: 6265 },
  IL: { grn: 16507, lib: 75648, other: 27889 },
  IN: { grn: 8367, lib: 38346, other: 14138 },
  KS: { grn: 4510, lib: 20668, other: 7620 },
  KY: { grn: 5177, lib: 23725, other: 8746 },
  LA: { grn: 4985, lib: 22845, other: 8422 },
  MA: { grn: 11275, lib: 51673, other: 19050 },
  MD: { grn: 10394, lib: 47636, other: 17563 },
  ME: { grn: 3213, lib: 14726, other: 5429 },
  MI: { grn: 11744, lib: 53823, other: 19843 },
  MN: { grn: 10454, lib: 47911, other: 17664 },
  MO: { grn: 7454, lib: 34163, other: 12595 },
  MS: { grn: 2615, lib: 11983, other: 4418 },
  MT: { grn: 2387, lib: 10941, other: 4034 },
  NC: { grn: 11239, lib: 51508, other: 18989 },
  ND: { grn: 1557, lib: 7135, other: 2630 },
  NE: { grn: 3431, lib: 15723, other: 5796 },
  NH: { grn: 1905, lib: 8731, other: 3219 },
  NJ: { grn: 9986, lib: 45766, other: 16873 },
  NM: { grn: 2813, lib: 12891, other: 4753 },
  NV: { grn: 4400, lib: 20165, other: 7435 },
  NY: { grn: 16771, lib: 76861, other: 28337 },
  OH: { grn: 12128, lib: 55583, other: 20492 },
  OK: { grn: 5023, lib: 23019, other: 8487 },
  OR: { grn: 10380, lib: 47572, other: 17538 },
  PA: { grn: 11973, lib: 54868, other: 20228 },
  RI: { grn: 1421, lib: 6513, other: 2402 },
  SC: { grn: 5044, lib: 23118, other: 8523 },
  SD: { grn: 1526, lib: 6992, other: 2577 },
  TN: { grn: 7929, lib: 36339, other: 13397 },
  TX: { grn: 23161, lib: 106145, other: 39132 },
  UT: { grn: 8645, lib: 39617, other: 14605 },
  VA: { grn: 11623, lib: 53266, other: 19637 },
  VT: { grn: 1637, lib: 7502, other: 2765 },
  WA: { grn: 18339, lib: 84045, other: 30984 },
  WI: { grn: 7785, lib: 35676, other: 13153 },
  WV: { grn: 1827, lib: 8372, other: 3087 },
  WY: { grn: 1336, lib: 6122, other: 2257 },
};
export const USA_MINOR_BY_YEAR = { "2024": USA_2024_MINOR, "2020": USA_2020_MINOR };
export const USA_2PARTY_BY_YEAR = { "2024": USA_2024, "2020": USA_2020 };

export const USA_SCENARIOS_RAW = { "2024": USA_2024, "2020": USA_2020 };
export const USA_SCENARIO_LABELS = { "2024": "November 2024 — Trump/Vance vs Harris/Walz", "2020": "November 2020 — Biden/Harris vs Trump/Pence" };
export const USA_CANDIDATE_LABELS = {
  "2024": { gop: "Trump/Vance", dem: "Harris/Walz", grn: "Stein (Green)", lib: "Oliver (Libertarian)", rfk: "Kennedy (Independent)", west: "West (Independent)", other: "Other / Write-in" },
  "2020": { gop: "Trump/Pence", dem: "Biden/Harris", grn: "Hawkins (Green)", lib: "Jorgensen (Libertarian)", other: "Other / Write-in" },
};

// Builds the national scenario array: one row per candidate id active that
// year, votes summed from the 2-party table (gop/dem) plus the minor-party
// table (everyone else).
function usBuildScenario(year) {
  const byState = USA_2PARTY_BY_YEAR[year];
  const minorByState = USA_MINOR_BY_YEAR[year];
  const ids = USA_CANDIDATE_IDS_BY_YEAR[year];
  const totals = Object.fromEntries(ids.map(id => [id, 0]));
  let grandTotal = 0;
  for (const abbr of Object.keys(byState)) {
    const s = byState[abbr];
    totals.gop += s.gop;
    totals.dem += s.dem;
    grandTotal += s.total;
    const m = minorByState[abbr] || {};
    for (const id of ids) if (id !== "gop" && id !== "dem") totals[id] += m[id] || 0;
  }
  return ids.map(id => ({
    id, ...USA_CANDIDATE_DICT[id], label: USA_CANDIDATE_LABELS[year][id], votes: totals[id],
    basePercentage: (totals[id] / grandTotal) * 100, userPercentage: (totals[id] / grandTotal) * 100,
  }));
}
export const USA_SCENARIOS = { "2024": usBuildScenario("2024"), "2020": usBuildScenario("2020") };
export const USA_SCENARIO_TURNOUT = Object.fromEntries(
  Object.entries(USA_2PARTY_BY_YEAR).map(([y, byState]) => [y, Object.values(byState).reduce((s, v) => s + v.total, 0)])
);

// Per-state baseline percentages the swing engine perturbs — one field per
// active candidate id for that year, summing to 100.
export function usStateBaselines(year) {
  const byState = USA_2PARTY_BY_YEAR[year];
  const minorByState = USA_MINOR_BY_YEAR[year];
  const ids = USA_CANDIDATE_IDS_BY_YEAR[year];
  const out = {};
  for (const [abbr, s] of Object.entries(byState)) {
    const m = minorByState[abbr] || {};
    const total = s.total;
    out[abbr] = {};
    for (const id of ids) {
      const votes = id === "gop" ? s.gop : id === "dem" ? s.dem : (m[id] || 0);
      out[abbr][id] = total > 0 ? (votes / total) * 100 : 0;
    }
  }
  return out;
}
export const USA_STATE_BASELINES = { "2024": usStateBaselines("2024"), "2020": usStateBaselines("2020") };

// Per-state structural "lean" fed into the Monte Carlo model — the residual
// (in logit points) between how each state's GOP-vs-DEM race moved 2020→2024
// vs the national average shift. Positive = swung more GOP than the nation.
export const USA_STATE_LEAN = (() => {
  const b24 = USA_STATE_BASELINES["2024"], b20 = USA_STATE_BASELINES["2020"];
  const nat24 = usStateBaselines2Party(USA_2024), nat20 = usStateBaselines2Party(USA_2020);
  const natShift = usToLogit(nat24.gop) - usToLogit(nat20.gop);
  const out = {};
  for (const abbr of Object.keys(b24)) {
    const shift = usToLogit(b24[abbr].gop) - usToLogit(b20[abbr].gop);
    out[abbr] = +(shift - natShift).toFixed(4);
  }
  return out;
})();
function usStateBaselines2Party(byState) {
  const agg = Object.values(byState).reduce((a, s) => ({ gop: a.gop + s.gop, dem: a.dem + s.dem, total: a.total + s.total }), { gop: 0, dem: 0, total: 0 });
  return { gop: (agg.gop / agg.total) * 100, dem: (agg.dem / agg.total) * 100 };
}

// ---------------------------------------------------------------------------
// State-level demographic aggregates (ACS 5-year-style estimates, ~2023,
// approximate to the nearest reporting unit — see methodology). Drives the
// map's demographic overlay layer (distinct from the exit-poll-grounded swing
// groups above, which model vote CHOICE within a group, not population share).
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

// States whose real county-level results join to genuine county-boundary
// geometry on the map. Alaska (reported by state house district) and DC
// (reported by ward) don't have county-equivalent FIPS in this results
// dataset, so they render as real county SHAPES shaded uniformly by the
// statewide result — every other state now has certified per-county detail.
export const USA_COUNTY_DETAIL_STATES = new Set(Object.keys(USA_STATE_NAMES).filter(a => a !== "AK" && a !== "DC"));
