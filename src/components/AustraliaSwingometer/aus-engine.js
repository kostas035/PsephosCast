// ─── aus-engine.js ────────────────────────────────────────────────────────────
// Preferential voting engine — simulates actual Australian count per division.
//
// Model:
//   1. Each division has a LOCAL primary profile (scaled from national primaries).
//   2. A full preferential count is simulated: candidates are eliminated bottom-up,
//      their preferences distributed according to party preference matrices, until
//      two candidates remain — producing a genuine per-division 2CP result.
//   3. "Local kings" — entrenched independents and regional party dominants —
//      are modelled with division-specific primary baselines that only shift
//      partially with national swings.
//   4. National 2PP displayed in the UI is the seat-weighted average of all
//      division 2CP results (as a cross-check / headline figure).

import { AUS_PARTIES, AUS_DIVISIONS, ausToLogit, ausFromLogit } from "./aus-data.js";
import { AUS_DIVISION_DEMOGRAPHICS } from "./aus-demographics-adapter.js";

// Fast lookup: divisionId → census record
const DEMOG_BY_ID = {};
AUS_DIVISION_DEMOGRAPHICS.forEach(d => { DEMOG_BY_ID[d.id] = d; });

// ── Demographic vote-lean weights ─────────────────────────────────────────────
// base = starting primary %, then each field adds (weight × census%) points.
// Derived from Australian cross-tabs (religion, education, tenure, age, ancestry).
const DEMOGRAPHIC_LEANS = {
  alp: { base: 26, noReligion: 0.04, islam: 0.55, bachelorOrHigher: 0.08,
         rented: 0.16, indigenous: 0.35, notSpokenEnglish: 0.18,
         age55plus: -0.18, ownedOutright: -0.16 },
  lnp: { base: 30, anglican: 0.35, christian: 0.10, ownedOutright: 0.28,
         age55plus: 0.26, bachelorOrHigher: -0.10, rented: -0.14, notSpokenEnglish: -0.16 },
  grn: { base: 5,  noReligion: 0.20, bachelorOrHigher: 0.16, rented: 0.12,
         age18to34: 0.16, buddhist: 0.20, age55plus: -0.08 },
  onp: { base: 2,  noQualification: 0.16, age55plus: 0.08, notSpokenEnglish: -0.10,
         bachelorOrHigher: -0.08 },
  uap: { base: 1.5, noQualification: 0.04, age55plus: 0.02 },
  kap: { base: 0.5, indigenous: 0.05 },     // regional QLD overlay in LOCAL_PROFILES
  ff:  { base: 0.5, otherChristian: 0.10, christian: 0.04 },
  ca:  { base: 0.5 },                        // SA overlay in LOCAL_PROFILES
  ind: { base: 3,  bachelorOrHigher: 0.04 },
};

// Estimate a division's primary vote purely from its census demographics.
function estimatePrimariesFromCensus(census) {
  if (!census) return null;
  const out = {};
  AUS_PARTIES.forEach(p => {
    const w = DEMOGRAPHIC_LEANS[p.id] || { base: 1 };
    let v = w.base || 0;
    Object.entries(w).forEach(([field, wt]) => {
      if (field === "base") return;
      v += wt * (census[field] || 0);
    });
    out[p.id] = Math.max(0, v);
  });
  const tot = Object.values(out).reduce((s, x) => s + x, 0);
  if (tot > 0) Object.keys(out).forEach(k => { out[k] = (out[k] / tot) * 100; });
  return out;
}

// Compute the implied ALP 2PP from a primary set (used for calibration offset).
function impliedAlp2PP(primaries) {
  let alp = primaries.alp || 0, lnp = primaries.lnp || 0;
  AUS_PARTIES.filter(p => p.id !== "alp" && p.id !== "lnp").forEach(p => {
    const pct = primaries[p.id] || 0;
    alp += pct * p.prefToAlp;
    lnp += pct * p.prefToLnp;
  });
  const t = alp + lnp;
  return t > 0 ? (alp / t) * 100 : 50;
}

// Per-division calibration offset: anchors the demographic estimate to the
// division's real 2022 ALP 2PP so the map matches actual results, while
// demographics still drive HOW each seat swings.
const CALIBRATION = {};
AUS_DIVISIONS.forEach(div => {
  const demog = DEMOG_BY_ID[div.id];
  const est   = demog ? estimatePrimariesFromCensus(demog.census) : null;
  CALIBRATION[div.id] = est ? (div.alp2PP - impliedAlp2PP(est)) : 0;
});

// ── Preference distribution matrix ────────────────────────────────────────────
// How voters of party X distribute their preferences when X is eliminated.
// Format: prefMatrix[eliminated][receiving] = fraction (0–1), sums to 1.0 across row.
// These are the default "exhaust-adjusted" historical flows from AEC data.
// Users can override via the prefFlows UI (only alp/lnp split is exposed for simplicity;
// the full matrix is used internally during the count).
const DEFAULT_PREFS = {
  //          alp   lnp   grn   onp   uap   ind   kap   ff    ca
  grn: { alp: 0.79, lnp: 0.10, grn: 0,    onp: 0.01, uap: 0.01, ind: 0.05, kap: 0.01, ff: 0.01, ca: 0.02 },
  onp: { alp: 0.13, lnp: 0.57, grn: 0.08, onp: 0,    uap: 0.08, ind: 0.07, kap: 0.03, ff: 0.02, ca: 0.02 },
  uap: { alp: 0.14, lnp: 0.52, grn: 0.10, onp: 0.10, uap: 0,    ind: 0.07, kap: 0.03, ff: 0.02, ca: 0.02 },
  ind: { alp: 0.40, lnp: 0.32, grn: 0.16, onp: 0.04, uap: 0.02, ind: 0,    kap: 0.02, ff: 0.02, ca: 0.02 },
  kap: { alp: 0.22, lnp: 0.48, grn: 0.06, onp: 0.11, uap: 0.05, ind: 0.05, kap: 0,    ff: 0.02, ca: 0.01 },
  ff:  { alp: 0.12, lnp: 0.60, grn: 0.06, onp: 0.10, uap: 0.06, ind: 0.04, kap: 0.01, ff: 0,    ca: 0.01 },
  ca:  { alp: 0.38, lnp: 0.30, grn: 0.16, onp: 0.04, uap: 0.03, ind: 0.06, kap: 0.01, ff: 0.01, ca: 0    },
  // ALP/LNP never eliminated in national model but needed for div-level count
  alp: { alp: 0,    lnp: 0.18, grn: 0.62, onp: 0.04, uap: 0.03, ind: 0.08, kap: 0.02, ff: 0.02, ca: 0.01 },
  lnp: { alp: 0.35, lnp: 0,    grn: 0.12, onp: 0.18, uap: 0.12, ind: 0.15, kap: 0.05, ff: 0.02, ca: 0.01 },
};

// Build a normalised row (recipients only include parties still in the count)
function distributePrefs(eliminated, votes, remaining, prefMatrix) {
  const row   = prefMatrix[eliminated] || {};
  const dists = {};
  let rowTotal = 0;
  remaining.forEach(p => { if (p !== eliminated) { dists[p] = row[p] || 0; rowTotal += dists[p]; } });
  if (rowTotal <= 0) {
    // Exhaust equally among remaining
    remaining.forEach(p => { if (p !== eliminated) dists[p] = 1 / (remaining.length - 1); });
    rowTotal = 1;
  }
  // Normalise and distribute
  const result = {};
  remaining.forEach(p => { result[p] = p === eliminated ? 0 : votes * (dists[p] / rowTotal); });
  return result;
}

// ── Simulated preferential count for one division ─────────────────────────────
// localPrimaries: { alp, lnp, grn, ... } summing to 100
// prefMatrix: override matrix (merged with DEFAULT_PREFS)
// Returns { winner, runnerUp, winnerVotes, runnerUpVotes, margin }
export function simulateCount(localPrimaries, prefMatrix = {}) {
  const matrix = {};
  Object.keys(DEFAULT_PREFS).forEach(k => {
    matrix[k] = { ...DEFAULT_PREFS[k], ...(prefMatrix[k] || {}) };
  });

  // Initialise vote tallies — only include parties with > 0.5% (no micro noise)
  let tallies = {};
  let remaining = [];
  Object.entries(localPrimaries).forEach(([id, pct]) => {
    if (pct >= 0.5) {
      tallies[id] = pct;
      remaining.push(id);
    }
  });

  if (remaining.length === 0) return { winner: "lnp", runnerUp: "alp", winnerVotes: 50, runnerUpVotes: 50, margin: 0 };
  if (remaining.length === 1) return { winner: remaining[0], runnerUp: "alp", winnerVotes: 100, runnerUpVotes: 0, margin: 100 };

  // Eliminate bottom candidates one by one until 2 remain
  while (remaining.length > 2) {
    // Find the candidate with the fewest votes
    let minParty = remaining[0];
    remaining.forEach(p => { if (tallies[p] < tallies[minParty]) minParty = p; });

    // Distribute their votes to remaining candidates (excluding themselves)
    const votes    = tallies[minParty];
    const newVotes = distributePrefs(minParty, votes, remaining, matrix);

    remaining = remaining.filter(p => p !== minParty);
    remaining.forEach(p => { tallies[p] = (tallies[p] || 0) + (newVotes[p] || 0); });
  }

  // Two candidates left
  const [a, b] = remaining;
  const aVotes = tallies[a] || 0;
  const bVotes = tallies[b] || 0;
  const totalFinal = aVotes + bVotes;

  const winner    = aVotes >= bVotes ? a : b;
  const runnerUp  = aVotes >= bVotes ? b : a;
  const winnerPct = totalFinal > 0 ? (Math.max(aVotes, bVotes) / totalFinal) * 100 : 50;

  return {
    winner,
    runnerUp,
    winnerVotes:    parseFloat(winnerPct.toFixed(1)),
    runnerUpVotes:  parseFloat((100 - winnerPct).toFixed(1)),
    margin:         parseFloat(Math.abs(winnerPct - 50).toFixed(1)),
  };
}

// ── Local primary profile per division ────────────────────────────────────────
// Each division has a local primary lean that deviates from the national figure.
// The national swing shifts these proportionally, but local kings only move at
// a "drag factor" (0 = perfectly safe, 1 = full national swing sensitivity).
//
// Structure: { [partyId]: { base, drag } }
//   base = local primary % at the 2025 scenario baseline
//   drag = 0–1, how much of the national swing in that party flows locally
//
// Most divisions just use national primaries (no entry needed — falls through to default).
// Divisions with local personalities / strong regional parties have explicit entries.

const LOCAL_PROFILES = {
  // ── Andrew Wilkie — Clark (TAS) ────────────────────────────────────────────
  "clark": {
    ind: { base: 38, drag: 0.10 },  // Wilkie: very strong personal vote
    alp: { base: 30, drag: 0.7  },
    grn: { base: 18, drag: 0.8  },
    lnp: { base: 10, drag: 0.6  },
    onp: { base: 2,  drag: 0.5  },
  },

  // ── Fowler (NSW) — Dai Le independent ──────────────────────────────────────
  "fowler": {
    ind: { base: 34, drag: 0.10 },
    alp: { base: 32, drag: 0.7  },
    lnp: { base: 18, drag: 0.6  },
    grn: { base: 8,  drag: 0.6  },
    onp: { base: 4,  drag: 0.5  },
    uap: { base: 2,  drag: 0.4  },
  },

  // ── Warringah / North Sydney / Wentworth / Mackellar / Goldstein / Kooyong / Indi / Curtin
  // Teal independents — strong local brand, drag ~0.2 on national LNP swing
  "warringah": {
    ind: { base: 38, drag: 0.15 }, lnp: { base: 26, drag: 0.7 },
    alp: { base: 16, drag: 0.6  }, grn: { base: 14, drag: 0.7 }, onp: { base: 3, drag: 0.5 }, uap: { base: 3, drag: 0.4 },
  },
  "north-sydney": {
    ind: { base: 36, drag: 0.15 }, lnp: { base: 28, drag: 0.7 },
    alp: { base: 16, drag: 0.6  }, grn: { base: 14, drag: 0.7 }, onp: { base: 3, drag: 0.5 }, uap: { base: 3, drag: 0.4 },
  },
  "wentworth": {
    ind: { base: 32, drag: 0.15 }, lnp: { base: 28, drag: 0.7 },
    alp: { base: 16, drag: 0.6  }, grn: { base: 18, drag: 0.7 }, onp: { base: 3, drag: 0.5 }, uap: { base: 3, drag: 0.4 },
  },
  "mackellar": {
    ind: { base: 34, drag: 0.15 }, lnp: { base: 30, drag: 0.7 },
    alp: { base: 14, drag: 0.6  }, grn: { base: 16, drag: 0.7 }, onp: { base: 3, drag: 0.5 }, uap: { base: 3, drag: 0.4 },
  },
  "goldstein": {
    ind: { base: 36, drag: 0.15 }, lnp: { base: 30, drag: 0.7 },
    alp: { base: 14, drag: 0.6  }, grn: { base: 14, drag: 0.7 }, onp: { base: 3, drag: 0.5 }, uap: { base: 3, drag: 0.4 },
  },
  "kooyong": {
    ind: { base: 34, drag: 0.15 }, lnp: { base: 30, drag: 0.7 },
    alp: { base: 16, drag: 0.6  }, grn: { base: 14, drag: 0.7 }, onp: { base: 3, drag: 0.5 }, uap: { base: 3, drag: 0.4 },
  },
  "indi": {
    ind: { base: 40, drag: 0.10 }, lnp: { base: 28, drag: 0.7 },
    alp: { base: 14, drag: 0.6  }, grn: { base: 10, drag: 0.6 }, onp: { base: 4, drag: 0.5 }, kap: { base: 2, drag: 0.3 }, ca: { base: 2, drag: 0.3 },
  },
  "curtin": {
    ind: { base: 36, drag: 0.15 }, lnp: { base: 28, drag: 0.7 },
    alp: { base: 18, drag: 0.6  }, grn: { base: 12, drag: 0.7 }, onp: { base: 3, drag: 0.5 }, uap: { base: 3, drag: 0.4 },
  },

  // ── Melbourne — Adam Bandt / Greens stronghold ─────────────────────────────
  "melbourne": {
    grn: { base: 52, drag: 0.6  }, alp: { base: 26, drag: 0.7 },
    lnp: { base: 12, drag: 0.6  }, onp: { base: 2,  drag: 0.4 }, uap: { base: 2, drag: 0.3 }, ind: { base: 6, drag: 0.5 },
  },

  // ── Brisbane & Ryan — competitive GRN/LNP/ALP three-way ───────────────────
  "brisbane": {
    grn: { base: 36, drag: 0.7  }, lnp: { base: 28, drag: 0.7 },
    alp: { base: 24, drag: 0.7  }, onp: { base: 5,  drag: 0.7 }, uap: { base: 3, drag: 0.5 }, ind: { base: 4, drag: 0.5 },
  },
  "ryan": {
    grn: { base: 28, drag: 0.7  }, lnp: { base: 30, drag: 0.7 },
    alp: { base: 24, drag: 0.7  }, onp: { base: 5,  drag: 0.7 }, uap: { base: 3, drag: 0.5 }, ind: { base: 10, drag: 0.5 },
  },

  // ── ONP-heavy regional QLD ─────────────────────────────────────────────────
  "hinkler": {
    onp: { base: 18, drag: 0.8 }, lnp: { base: 38, drag: 0.8 },
    alp: { base: 26, drag: 0.8 }, kap: { base: 4,  drag: 0.4 }, uap: { base: 6, drag: 0.6 }, grn: { base: 5, drag: 0.6 }, ff: { base: 3, drag: 0.4 },
  },
  "maranoa": {
    onp: { base: 14, drag: 0.8 }, lnp: { base: 46, drag: 0.8 },
    alp: { base: 18, drag: 0.8 }, kap: { base: 8,  drag: 0.4 }, uap: { base: 6, drag: 0.6 }, grn: { base: 4, drag: 0.5 }, ff: { base: 4, drag: 0.4 },
  },
  "wide-bay": {
    onp: { base: 16, drag: 0.8 }, lnp: { base: 38, drag: 0.8 },
    alp: { base: 22, drag: 0.8 }, kap: { base: 4,  drag: 0.4 }, uap: { base: 8, drag: 0.6 }, grn: { base: 6, drag: 0.6 }, ff: { base: 6, drag: 0.4 },
  },
  "capricornia": {
    onp: { base: 14, drag: 0.8 }, lnp: { base: 36, drag: 0.8 },
    alp: { base: 30, drag: 0.8 }, kap: { base: 6,  drag: 0.4 }, uap: { base: 6, drag: 0.6 }, grn: { base: 5, drag: 0.5 }, ff: { base: 3, drag: 0.4 },
  },
  "kennedy": {  // Bob Katter — KAP dominant, near-immovable
    kap: { base: 42, drag: 0.05 }, lnp: { base: 26, drag: 0.6 },
    alp: { base: 14, drag: 0.5  }, onp: { base: 10, drag: 0.7 }, grn: { base: 4, drag: 0.5 }, uap: { base: 2, drag: 0.4 }, ind: { base: 2, drag: 0.3 },
  },

  // ── SA — Centre Alliance (Rebekha Sharkie, Mayo) ────────────────────────────
  "mayo": {  // very safe CA seat
    ca:  { base: 48, drag: 0.05 }, lnp: { base: 28, drag: 0.7 },
    alp: { base: 12, drag: 0.6  }, grn: { base: 8,  drag: 0.6 }, onp: { base: 2, drag: 0.5 }, ind: { base: 2, drag: 0.5 },
  },
};

// ── Compute local primaries for a division ────────────────────────────────────
// Blends the division's local profile with the national primary swing.
function computeLocalPrimaries(div, nationalPrimaries, basePrimaries) {
  const profile = LOCAL_PROFILES[div.id];
  const demog   = DEMOG_BY_ID[div.id];
  const demEst  = demog ? estimatePrimariesFromCensus(demog.census) : null;
  const result  = {};

  // Blend weight: how much demographics drive the local base vs national uniform.
  const BLEND = 0.7;

  AUS_PARTIES.forEach(p => {
    const natNow  = Math.max(0, nationalPrimaries[p.id] || 0);
    const natBase = Math.max(0, basePrimaries[p.id]     || 0);
    const natSwing = natNow - natBase; // positive = party gaining nationally

    if (profile && profile[p.id] !== undefined) {
      // Local king / regional override — personal vote, ignores demographics
      const { base, drag } = profile[p.id];
      result[p.id] = Math.max(0, base + drag * natSwing);
    } else if (demEst) {
      // Demographic-driven local base, blended with national level, plus swing
      const demLocal = BLEND * demEst[p.id] + (1 - BLEND) * natBase;
      result[p.id] = Math.max(0, demLocal + natSwing);
    } else {
      result[p.id] = Math.max(0, natNow);
    }
  });

  // Normalise so local primaries sum to 100
  const total = Object.values(result).reduce((s, v) => s + v, 0);
  if (total > 0) Object.keys(result).forEach(k => { result[k] = (result[k] / total) * 100; });

  return result;
}

// ── National 2PP (headline) ───────────────────────────────────────────────────
// Still computed directly from national primaries for the headline display —
// this is the simple weighted flow version used in the UI top bar.
export function ausComputeNational2PP(primaries, prefOverrides = {}) {
  const total = Object.values(primaries).reduce((s, v) => s + Math.max(0, v), 0);
  if (total <= 0) return 50;
  const norm = {};
  Object.entries(primaries).forEach(([id, v]) => { norm[id] = (Math.max(0, v) / total) * 100; });

  let alpVote = norm.alp || 0;
  let lnpVote = norm.lnp || 0;

  AUS_PARTIES.filter(p => p.id !== "alp" && p.id !== "lnp").forEach(p => {
    const pct = norm[p.id] || 0;
    if (pct <= 0) return;
    const ov = prefOverrides[p.id];
    let prefAlp, prefLnp;
    if (ov) {
      const ovTotal = (ov.toAlp || 0) + (ov.toLnp || 0);
      prefAlp = ovTotal > 0 ? (ov.toAlp || 0) / ovTotal : p.prefToAlp;
      prefLnp = ovTotal > 0 ? (ov.toLnp || 0) / ovTotal : p.prefToLnp;
    } else {
      prefAlp = p.prefToAlp;
      prefLnp = p.prefToLnp;
    }
    alpVote += pct * prefAlp;
    lnpVote += pct * prefLnp;
  });

  const twoPartyTotal = alpVote + lnpVote;
  return twoPartyTotal > 0 ? (alpVote / twoPartyTotal) * 100 : 50;
}

// ── Build preference matrix from user overrides ────────────────────────────────
// User overrides only specify the ALP/LNP split for each minor party.
// We blend these into the full matrix proportionally.
function buildMatrix(prefOverrides) {
  const matrix = {};
  Object.keys(DEFAULT_PREFS).forEach(k => { matrix[k] = { ...DEFAULT_PREFS[k] }; });

  AUS_PARTIES.filter(p => p.id !== "alp" && p.id !== "lnp").forEach(p => {
    const ov = prefOverrides[p.id];
    if (!ov) return;
    const ovTotal = (ov.toAlp || 0) + (ov.toLnp || 0);
    if (ovTotal <= 0) return;
    const userAlp = (ov.toAlp || 0) / ovTotal;
    const userLnp = (ov.toLnp || 0) / ovTotal;
    const defaultAlp = DEFAULT_PREFS[p.id]?.alp || 0;
    const defaultLnp = DEFAULT_PREFS[p.id]?.lnp || 0;

    // Scale alp and lnp flows to match user intent; redistribute proportionally
    const row = { ...DEFAULT_PREFS[p.id] };
    const otherTotal = 1 - defaultAlp - defaultLnp;
    row.alp = userAlp * (1 - otherTotal); // scale major-party flows
    row.lnp = userLnp * (1 - otherTotal);

    // Normalise full row
    let rowSum = Object.values(row).reduce((s, v) => s + v, 0);
    if (rowSum > 0) Object.keys(row).forEach(k => { row[k] = row[k] / rowSum; });
    matrix[p.id] = row;
  });

  return matrix;
}

// ── Seat projection ────────────────────────────────────────────────────────────
// Simulates a full preferential count for every division.
export function ausProjectSeats(divisions, nationalPrimaries, basePrimaries, prefOverrides = {}) {
  const prefMatrix = buildMatrix(prefOverrides);

  return divisions.map(div => {
    const localPrimaries = computeLocalPrimaries(div, nationalPrimaries, basePrimaries);
    const count = simulateCount(localPrimaries, prefMatrix);
    const offset = CALIBRATION[div.id] || 0;
    const profile = LOCAL_PROFILES[div.id];

    let proj2PP;
    let winner   = count.winner;
    let runnerUp = count.runnerUp;

    // ── Local king protection ────────────────────────────────────────────────
    // If this division has a profiled "king" party (KAP/CA/IND/GRN incumbent)
    // that leads on local primary vote, incumbency + name recognition means they
    // hold the 2CP. Override the count winner to that party.
    let kingId = null;
    if (profile) {
      // The king is the profiled party with the lowest drag (most entrenched)
      let lowestDrag = 1;
      Object.entries(profile).forEach(([pid, cfg]) => {
        if (["alp", "lnp"].includes(pid)) return;
        if (cfg.drag < lowestDrag) { lowestDrag = cfg.drag; kingId = pid; }
      });
    }
    const kingPrimary = kingId ? (localPrimaries[kingId] || 0) : 0;
    const kingLeads   = kingId && Object.keys(localPrimaries)
      .every(pid => pid === kingId || (localPrimaries[pid] || 0) <= kingPrimary);

    const finalIsAlpLnp =
      (count.winner === "alp" || count.runnerUp === "alp") &&
      (count.winner === "lnp" || count.runnerUp === "lnp");

    if (kingId && kingLeads && lowestDragSafe(profile, kingId)) {
      // Entrenched king wins their seat
      winner   = kingId;
      runnerUp = count.winner === kingId ? count.runnerUp : count.winner;
      proj2PP  = Math.max(50.1, count.winner === kingId ? count.winnerVotes : count.runnerUpVotes);
    } else if (finalIsAlpLnp) {
      const rawAlp = count.winner === "alp" ? count.winnerVotes : count.runnerUpVotes;
      proj2PP  = Math.max(2, Math.min(98, rawAlp + offset));
      winner   = proj2PP >= 50 ? "alp" : "lnp";
      runnerUp = proj2PP >= 50 ? "lnp" : "alp";
    } else if (count.winner === "alp") {
      proj2PP = count.winnerVotes;
    } else if (count.runnerUp === "alp") {
      proj2PP = count.runnerUpVotes;
    } else {
      // Neither finalist is ALP — show winner's own 2CP share
      proj2PP = Math.max(50.1, count.winnerVotes);
    }

    const flipDistance = finalIsAlpLnp ? Math.abs(proj2PP - 50) : count.margin;

    return {
      ...div,
      proj2PP:      parseFloat(proj2PP.toFixed(1)),
      margin2PP:    parseFloat((proj2PP - 50).toFixed(1)),
      winner,
      runnerUp,
      finalTwo:     [winner, runnerUp],
      localPrimaries,
      flipDistance: parseFloat(flipDistance.toFixed(1)),
    };
  });
}

// A king is "safe" if its profile drag is low (entrenched personal vote)
function lowestDragSafe(profile, kingId) {
  return profile && profile[kingId] && profile[kingId].drag <= 0.2;
}

// ── Aggregate seat counts ──────────────────────────────────────────────────────
export function ausSeatCounts(projected) {
  const counts = { alp: 0, lnp: 0, grn: 0, ind: 0 };
  projected.forEach(d => {
    const w = d.winner;
    if (w === "alp")      counts.alp++;
    else if (w === "lnp") counts.lnp++;
    else if (w === "grn") counts.grn++;
    else                  counts.ind++;
  });
  return { ...counts, total: projected.length };
}

// ── State-by-state breakdown ───────────────────────────────────────────────────
export function ausStateBreakdown(projected) {
  const map = {};
  projected.forEach(d => {
    if (!map[d.state]) map[d.state] = { state: d.state, alp: 0, lnp: 0, grn: 0, ind: 0, total: 0 };
    const g = d.winner === "alp" ? "alp" : d.winner === "lnp" ? "lnp" : d.winner === "grn" ? "grn" : "ind";
    map[d.state][g]++;
    map[d.state].total++;
  });
  const ORDER = ["NSW","VIC","QLD","WA","SA","TAS","ACT","NT"];
  return ORDER.map(st => map[st]).filter(Boolean);
}

// ── Marginal seats ─────────────────────────────────────────────────────────────
export function ausMarginalSeats(projected, n = 20) {
  return [...projected]
    .sort((a, b) => a.flipDistance - b.flipDistance)
    .slice(0, n);
}

// ── Party colour / label ──────────────────────────────────────────────────────
export function ausPartyColor(partyId) {
  const map = {
    alp: "#E13940", lnp: "#1C4F9C", grn: "#009C3D", ind: "#40C0C0",
    onp: "#F97316", uap: "#FBBF24", kap: "#92400E", ff: "#7C3AED", ca: "#0891B2",
  };
  return map[partyId] ?? "#94a3b8";
}

export function ausPartyLabel(partyId) {
  const map = {
    alp: "ALP", lnp: "LNP", grn: "GRN", ind: "IND",
    onp: "ONP", uap: "UAP", kap: "KAP", ff: "FF", ca: "CA",
  };
  return map[partyId] ?? partyId.toUpperCase();
}

// ── Format helpers ─────────────────────────────────────────────────────────────
export function ausFmt2PP(n) { if (n == null) return "—"; return n.toFixed(1) + "%"; }
export function ausSwingLabel(current, base) {
  const d = current - base;
  if (Math.abs(d) < 0.05) return "±0.0";
  return (d > 0 ? "+" : "") + d.toFixed(1);
}
export function ausFmtPrimary(n) { if (n == null) return "—"; return n.toFixed(1) + "%"; }