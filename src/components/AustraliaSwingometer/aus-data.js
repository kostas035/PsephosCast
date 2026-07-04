// aus-data.js
// Foundation data for the Australian Federal Election Swingometer.
// 150 divisions (2025 boundaries), 3 historical scenarios, 6 parties.
// Electoral model: preferential voting → 2PP via logit swing.

// Constants
export const AUS = {
  TOTAL_SEATS: 150,
  MAJORITY:    76,
  STATES:      ["NSW","VIC","QLD","WA","SA","TAS","ACT","NT"],
  STATE_NAMES: {
    NSW: "New South Wales", VIC: "Victoria", QLD: "Queensland",
    WA:  "Western Australia", SA: "South Australia", TAS: "Tasmania",
    ACT: "ACT", NT: "Northern Territory",
  },
};

// Logit helpers
// Used for applying uniform swing via the logit transformation, which correctly
// handles near-zero and near-100% cases and produces realistic seat-swing curves.
export function ausToLogit(p) {
  const c = Math.max(0.001, Math.min(99.999, p)) / 100;
  return Math.log(c / (1 - c));
}
export function ausFromLogit(l) {
  return (1 / (1 + Math.exp(-l))) * 100;
}

// Party definitions
// prefToAlp + prefToLnp must sum to 1.0 for every minor party.
// ALP/LNP preferences are 1/0 (they count directly toward their own 2PP).
// These are user-editable at runtime; these are calibrated 2022 defaults.
// maxPrimary: slider hard cap for that party.
// ALP, LNP, GRN, ONP are major enough to theoretically reach very high primaries.
// All minor/micro parties capped at 5% — realistic ceiling for any single minor.
export const AUS_PARTIES = [
  // Major / significant parties (uncapped)
  {
    id: "alp",  name: "ALP",  fullName: "Australian Labor Party",
    color: "#E13940", prefToAlp: 1.00, prefToLnp: 0.00,
    maxPrimary: 60, hemiOrder: 2,
  },
  {
    id: "lnp",  name: "LNP",  fullName: "Liberal/National Coalition",
    color: "#1C4F9C", prefToAlp: 0.00, prefToLnp: 1.00,
    maxPrimary: 60, hemiOrder: 5,
  },
  {
    id: "grn",  name: "GRN",  fullName: "The Greens",
    color: "#009C3D", prefToAlp: 0.79, prefToLnp: 0.21,
    maxPrimary: 30, hemiOrder: 1,
  },
  {
    id: "onp",  name: "ONP",  fullName: "One Nation",
    color: "#F97316", prefToAlp: 0.30, prefToLnp: 0.70,
    maxPrimary: 20, hemiOrder: 6,
  },
  // Minor / micro parties (capped at 5%)
  {
    id: "uap",  name: "UAP",  fullName: "United Australia Party",
    color: "#FBBF24", prefToAlp: 0.38, prefToLnp: 0.62,
    maxPrimary: 5, hemiOrder: 6,
  },
  {
    id: "ind",  name: "IND",  fullName: "Independents & Teals",
    color: "#40C0C0", prefToAlp: 0.58, prefToLnp: 0.42,
    maxPrimary: 5, hemiOrder: 3,
  },
  {
    id: "kap",  name: "KAP",  fullName: "Katter's Australian Party",
    color: "#92400E", prefToAlp: 0.32, prefToLnp: 0.68,
    maxPrimary: 5, hemiOrder: 6,
  },
  {
    id: "ff",   name: "FF",   fullName: "Family First",
    color: "#7C3AED", prefToAlp: 0.28, prefToLnp: 0.72,
    maxPrimary: 5, hemiOrder: 6,
  },
  {
    id: "ca",   name: "CA",   fullName: "Centre Alliance / SA-BEST",
    color: "#0891B2", prefToAlp: 0.55, prefToLnp: 0.45,
    maxPrimary: 5, hemiOrder: 4,
  },
];

// Scenario definitions
// base2PP: ALP 2PP computed via ausComputeNational2PP(basePrimaries, AUS_PARTIES).
// At zero user adjustment the logit swing is 0.0, projections equal the modelled baseline.
// knownResult: certified AEC seat totals (for reference display, not applied as override).
export const AUS_SCENARIOS = [
  {
    id:       "2025",
    label:    "2025",
    fullLabel:"2025 Federal Election",
    sublabel: "Albanese re-elected · ALP 94 / LNP 43",
    date:     "3 May 2025",
    totalSeats: 150,
    majority:   76,
    // Primary votes sourced from AEC 2025 final count (national two-party preferred 55.22%)
    basePrimaries: { alp: 34.56, lnp: 31.82, grn: 12.20, onp: 6.40, uap: 1.50, ind: 2.52, kap: 0.80, ff: 0.80, ca: 0.40 },
    base2PP: 54.88,
    knownResult: { alp: 94, lnp: 43, grn: 1, ind: 12 },
  },
  {
    id:       "2022",
    label:    "2022",
    fullLabel:"2022 Federal Election",
    sublabel: "Albanese first term · ALP 77 / LNP 58",
    date:     "21 May 2022",
    totalSeats: 151,
    majority:   76,
    // AEC 2022 final (national 2PP 52.13%)
    basePrimaries: { alp: 32.58, lnp: 35.70, grn: 12.25, onp: 4.96, uap: 4.47, ind: 4.04, kap: 0.70, ff: 0.60, ca: 0.70 },
    base2PP: 51.60,
    knownResult: { alp: 77, lnp: 58, grn: 4, ind: 12 },
  },
  {
    id:       "2019",
    label:    "2019",
    fullLabel:"2019 Federal Election",
    sublabel: "Morrison majority · LNP 77 / ALP 68",
    date:     "18 May 2019",
    totalSeats: 151,
    majority:   76,
    // AEC 2019 final (national 2PP 48.47%)
    basePrimaries: { alp: 33.34, lnp: 41.44, grn: 10.40, onp: 3.09, uap: 1.35, ind: 4.38, kap: 0.80, ff: 0.90, ca: 1.30 },
    base2PP: 49.20,
    knownResult: { alp: 68, lnp: 77, grn: 1, ind: 5 },
  },
];

// Division data — 150 seats (2025 boundaries)
//
// DIVISION TYPES:
//   "std"     — ALP v LNP straight contest.  ALP wins if projected alp2PP ≥ 50.
//   "grn_alp" — GRN v ALP (Melbourne).       GRN wins if scaled GRN primary ≥ grnThreshold.
//   "grn_lnp" — GRN v LNP (Brisbane, Ryan).  3-way contest with ALP override on big swing.
//   "ind_lnp" — Teal / IND v LNP.            IND holds if projected anti-LNP 2PP ≥ indHoldThreshold.
//   "ind_alp" — IND v ALP (Fowler, Clark).   IND holds unless ALP 2PP ≥ indLossThreshold.
//
// alp2PP: 2022-boundary ALP 2-candidate-preferred at 2022 national baseline (51.60% 2PP).
//   For ind_lnp seats this is the "progressive / anti-LNP" 2CP (IND vs LNP).
//   For ind_alp seats this is the ALP vs IND 2CP.
//
// Compact builder helpers (keep data table readable):
const s  = (id, nm, st, a)         => ({ id, name: nm, state: st, type: "std",     alp2PP: a });
const ga = (id, nm, st, a, gp, gt) => ({ id, name: nm, state: st, type: "grn_alp", alp2PP: a, grnPrimary: gp, grnThreshold: gt });
const gl = (id, nm, st, a, gp, gt) => ({ id, name: nm, state: st, type: "grn_lnp", alp2PP: a, grnPrimary: gp, grnThreshold: gt });
const il = (id, nm, st, a, ht)     => ({ id, name: nm, state: st, type: "ind_lnp", alp2PP: a, indHoldThreshold: ht });
const ia = (id, nm, st, a, lt)     => ({ id, name: nm, state: st, type: "ind_alp", alp2PP: a, indLossThreshold: lt });

export const AUS_DIVISIONS = [
  // NSW  46 seats
  s("blaxland",        "Blaxland",        "NSW", 75.3),
  s("watson",          "Watson",          "NSW", 72.1),
  s("chifley",         "Chifley",         "NSW", 68.2),
  s("mcmahon",         "McMahon",         "NSW", 65.0),
  s("grayndler",       "Grayndler",       "NSW", 65.5),
  s("sydney",          "Sydney",          "NSW", 64.3),
  s("kingsford-smith", "Kingsford Smith", "NSW", 62.4),
  s("werriwa",         "Werriwa",         "NSW", 62.0),
  s("shortland",       "Shortland",       "NSW", 61.3),
  s("hunter",          "Hunter",          "NSW", 62.5),
  s("newcastle",       "Newcastle",       "NSW", 63.4),
  s("whitlam",         "Whitlam",         "NSW", 61.2),
  s("cunningham",      "Cunningham",      "NSW", 64.7),
  s("richmond",        "Richmond",        "NSW", 59.8),
  s("macarthur",       "Macarthur",       "NSW", 56.2),
  s("parramatta",      "Parramatta",      "NSW", 57.4),
  s("greenway",        "Greenway",        "NSW", 54.2),
  s("reid",            "Reid",            "NSW", 56.1),
  s("macquarie",       "Macquarie",       "NSW", 55.3),
  s("robertson",       "Robertson",       "NSW", 55.9),
  s("dobell",          "Dobell",          "NSW", 53.5),
  s("eden-monaro",     "Eden-Monaro",     "NSW", 51.8),
  s("lindsay",         "Lindsay",         "NSW", 52.3),
  s("banks",           "Banks",           "NSW", 48.6),
  s("barton",          "Barton",          "NSW", 47.9),
  s("bennelong",       "Bennelong",       "NSW", 47.3),
  s("gilmore",         "Gilmore",         "NSW", 44.1),
  s("page",            "Page",            "NSW", 43.6),
  s("hughes",          "Hughes",          "NSW", 44.8),
  s("cook",            "Cook",            "NSW", 41.5),
  s("hume",            "Hume",            "NSW", 37.9),
  s("mitchell",        "Mitchell",        "NSW", 37.5),
  s("berowra",         "Berowra",         "NSW", 37.0),
  s("bradfield",       "Bradfield",       "NSW", 35.8),
  s("calare",          "Calare",          "NSW", 39.5),
  s("farrer",          "Farrer",          "NSW", 29.4),
  s("lyne",            "Lyne",            "NSW", 34.6),
  s("parkes",          "Parkes",          "NSW", 31.3),
  s("new-england",     "New England",     "NSW", 40.2),
  s("riverina",        "Riverina",        "NSW", 31.5),
  s("cowper",          "Cowper",          "NSW", 42.3),
  s("paterson",        "Paterson",        "NSW", 49.8),
  il("warringah",      "Warringah",       "NSW", 61.3, 44),
  il("mackellar",      "Mackellar",       "NSW", 53.8, 44),
  il("wentworth",      "Wentworth",       "NSW", 55.4, 44),
  ia("fowler",         "Fowler",          "NSW", 55.2, 62),

  // VIC  37 seats
  s("cooper",          "Cooper",          "VIC", 73.2),
  s("scullin",         "Scullin",         "VIC", 70.1),
  s("calwell",         "Calwell",         "VIC", 68.4),
  s("lalor",           "Lalor",           "VIC", 67.8),
  s("maribyrnong",     "Maribyrnong",     "VIC", 67.3),
  s("holt",            "Holt",            "VIC", 57.1),
  s("gellibrand",      "Gellibrand",      "VIC", 65.1),
  s("isaacs",          "Isaacs",          "VIC", 62.2),
  s("jagajaga",        "Jagajaga",        "VIC", 60.4),
  s("bruce",           "Bruce",           "VIC", 60.8),
  s("hotham",          "Hotham",          "VIC", 60.1),
  s("ballarat",        "Ballarat",        "VIC", 60.5),
  s("bendigo",         "Bendigo",         "VIC", 58.4),
  s("fraser",          "Fraser",          "VIC", 62.0),
  s("wills",           "Wills",           "VIC", 63.8),
  s("mcewen",          "McEwen",          "VIC", 55.3),
  s("hawke",           "Hawke",           "VIC", 56.1),
  s("corio",           "Corio",           "VIC", 59.2),
  s("gorton",          "Gorton",          "VIC", 57.4),
  s("macnamara",       "Macnamara",       "VIC", 51.6),
  s("chisholm",        "Chisholm",        "VIC", 51.3),
  s("dunkley",         "Dunkley",         "VIC", 52.5),
  s("corangamite",     "Corangamite",     "VIC", 52.1),
  s("casey",           "Casey",           "VIC", 44.9),
  s("deakin",          "Deakin",          "VIC", 46.1),
  s("aston",           "Aston",           "VIC", 47.2),
  s("flinders",        "Flinders",        "VIC", 44.6),
  s("la-trobe",        "La Trobe",        "VIC", 45.2),
  s("monash",          "Monash",          "VIC", 43.1),
  s("menzies",         "Menzies",         "VIC", 40.3),
  s("mallee",          "Mallee",          "VIC", 29.8),
  s("gippsland",       "Gippsland",       "VIC", 35.2),
  s("wannon",          "Wannon",          "VIC", 38.1),
  s("murray",          "Nicholls",          "VIC", 32.4),
  ga("melbourne",      "Melbourne",       "VIC", 37.5, 48.0, 28.0),
  il("kooyong",        "Kooyong",         "VIC", 52.2, 44),
  il("goldstein",      "Goldstein",       "VIC", 53.1, 44),
  il("indi",           "Indi",            "VIC", 57.8, 44),

  // QLD  30 seats
  s("oxley",           "Oxley",           "QLD", 57.8),
  s("rankin",          "Rankin",          "QLD", 58.2),
  s("moreton",         "Moreton",         "QLD", 57.4),
  s("blair",           "Blair",           "QLD", 56.9),
  s("forde",           "Forde",           "QLD", 53.1),
  s("petrie",          "Petrie",          "QLD", 52.0),
  s("lilley",          "Lilley",          "QLD", 51.5),
  s("griffith",        "Griffith",        "QLD", 52.3),
  s("longman",         "Longman",         "QLD", 49.5),
  s("dickson",         "Dickson",         "QLD", 45.8),
  s("bonner",          "Bonner",          "QLD", 46.2),
  s("bowman",          "Bowman",          "QLD", 45.1),
  s("fisher",          "Fisher",          "QLD", 41.3),
  s("fadden",          "Fadden",          "QLD", 38.5),
  s("moncrieff",       "Moncrieff",       "QLD", 38.2),
  s("mcpherson",       "McPherson",       "QLD", 40.6),
  s("fairfax",         "Fairfax",         "QLD", 44.2),
  s("wright",          "Wright",          "QLD", 42.1),
  s("leichhardt",      "Leichhardt",      "QLD", 46.3),
  s("herbert",         "Herbert",         "QLD", 49.5),
  s("hinkler",         "Hinkler",         "QLD", 35.4),
  s("capricornia",     "Capricornia",     "QLD", 42.8),
  s("dawson",          "Dawson",          "QLD", 40.3),
  s("flynn",           "Flynn",           "QLD", 41.2),
  s("wide-bay",        "Wide Bay",        "QLD", 33.8),
  s("groom",           "Groom",           "QLD", 33.1),
  s("maranoa",         "Maranoa",         "QLD", 24.8),
  il("kennedy",        "Kennedy",         "QLD", 38.4, 28),  // KAP (Bob Katter) — near-unassailable
  gl("brisbane",       "Brisbane",        "QLD", 51.3, 37.7, 22.0),
  gl("ryan",           "Ryan",            "QLD", 51.5, 25.8, 19.0),

  // WA  16 seats
  s("perth",           "Perth",           "WA",  55.1),
  s("fremantle",       "Fremantle",       "WA",  62.4),
  s("brand",           "Brand",           "WA",  58.3),
  s("canning",         "Canning",         "WA",  53.2),
  s("pearce",          "Pearce",          "WA",  53.5),
  s("cowan",           "Cowan",           "WA",  54.1),
  s("burt",            "Burt",            "WA",  55.0),
  s("swan",            "Swan",            "WA",  52.1),
  s("hasluck",         "Hasluck",         "WA",  51.7),
  s("stirling",        "Forrest",        "WA",  52.4),
  s("bullwinkel",      "Bullwinkel",      "WA",  53.0),  // New seat 2025
  s("moore",           "Moore",           "WA",  43.2),
  s("tangney",         "Tangney",         "WA",  47.1),
  s("durack",          "Durack",          "WA",  33.5),
  s("oconnor",         "O'Connor",        "WA",  35.8),
  il("curtin",         "Curtin",          "WA",  52.6, 44),  // Kate Chaney (Teal)

  // SA  10 seats
  s("adelaide",        "Adelaide",        "SA",  57.3),
  s("hindmarsh",       "Hindmarsh",       "SA",  51.2),
  s("kingston",        "Kingston",        "SA",  57.4),
  s("makin",           "Makin",           "SA",  57.1),
  s("spence",          "Spence",          "SA",  63.2),
  s("boothby",         "Boothby",         "SA",  50.2),
  s("sturt",           "Sturt",           "SA",  44.8),
  s("grey",            "Grey",            "SA",  29.8),
  s("barker",          "Barker",          "SA",  35.2),
  il("mayo",           "Mayo",            "SA",  58.4, 40),  // Rebekha Sharkie (CA) — strong hold

  // TAS  5 seats
  s("bass",            "Bass",            "TAS", 48.5),
  s("braddon",         "Braddon",         "TAS", 49.0),
  s("franklin",        "Franklin",        "TAS", 57.4),
  s("lyons",           "Lyons",           "TAS", 55.2),
  ia("clark",          "Clark",           "TAS", 64.1, 70),  // Andrew Wilkie — ALP loses Clark only on massive swing

  // ACT  3 seats
  s("canberra",        "Canberra",        "ACT", 65.3),
  s("bean",            "Bean",            "ACT", 60.8),
  s("fenner",          "Fenner",          "ACT", 60.2),

  // NT  2 seats
  s("lingiari",        "Lingiari",        "NT",  52.4),
  s("solomon",         "Solomon",         "NT",  51.8),
];
// Total: NSW(46) + VIC(37) + QLD(30) + WA(16) + SA(11) + TAS(5) + ACT(3) + NT(2) = 150 ✓