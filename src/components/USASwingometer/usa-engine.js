// usa-engine.js — swing math + electoral vote allocation for the USA Swingometer.
// A uniform national logit-swing (from the candidate sliders) is computed once,
// then a SEPARATE geographically-weighted demographic swing is layered on top
// per county (and per state, for Alaska/DC) using each area's real Census
// composition — a Hispanic-realignment slider genuinely moves Texas/Florida
// more than West Virginia, not the same everywhere. Both are applied to every
// county's own real baseline; state results are the SUM of their counties'
// swung votes, so every number on screen — state or county — is a real vote
// count, and a local override or turnout change on one county mechanically
// changes its parent state's total, exactly like a real swingometer.
import {
  USA, usToLogit, usFromLogit, USA_EV, USA_STATE_BASELINES, USA_FIPS_TO_ABBR,
  USA_CANDIDATE_IDS_BY_YEAR, USA_MINOR_BY_YEAR, USA_2PARTY_BY_YEAR, USA_COUNTY_DETAIL_STATES,
  USA_DEMO_GROUPS, USA_CANDIDATE_DICT,
} from "./usa-data.js";
import { USA_COUNTY_RESULTS } from "./usa-county-data.js";
import { USA_COUNTY_DEMOGRAPHICS, USA_STATE_DEMOGRAPHICS_2018 } from "./usa-county-demographics.js";

// Converts a desired two-party MARGIN shift, in points (e.g. +10 = 10pts more
// GOP), into the equivalent logit delta — the natural unit for a manual
// county/state override slider.
export function usPtsToLogitDelta(pts) {
  const half = Math.max(-49.5, Math.min(49.5, pts / 2));
  return usToLogit(50 + half) - usToLogit(50);
}

// Computes the logit-space swing for every active candidate id, from the
// national baseline to the user's current effective national percentages.
export function usNationalSwing(effectiveCandidates, baseCandidates) {
  const swing = {};
  for (const bc of baseCandidates) {
    const ec = effectiveCandidates.find(p => p.id === bc.id);
    const basePct = Math.max(0.02, bc.basePercentage);
    const effPct = ec ? Math.max(0.02, ec.effectivePct) : basePct;
    swing[bc.id] = usToLogit(effPct) - usToLogit(basePct);
  }
  return swing;
}

// Applies a precomputed logit swing onto any {id: pct} baseline (a state or a
// county), renormalising back to 100%. `extra` optionally adds a further
// per-id logit delta (used for local gop/dem overrides) on top of `swing`.
export function usApplyLogitSwing(baseline, swing, extra = null) {
  const ids = Object.keys(baseline);
  let total = 0;
  const adj = {};
  for (const id of ids) {
    const basePct = Math.max(0.02, baseline[id] ?? 0.02);
    const lo = usToLogit(basePct) + (swing[id] ?? 0) + (extra?.[id] ?? 0);
    adj[id] = usFromLogit(lo);
    total += adj[id];
  }
  const out = {};
  for (const id of ids) out[id] = total > 0 ? (adj[id] / total) * 100 : 0;
  return out;
}

// ---------------------------------------------------------------------------
// Real per-county baseline: gop/dem come directly from certified returns; the
// minor-party ids are the county's own (total-gop-dem) "other" pool split in
// the same proportions as its parent state's real minor-party split (we don't
// have county-level detail for named third parties, only state-level). Pure
// function of static data, so it's computed ONCE per fips and cached forever
// — this used to run fresh on every single slider tick for all ~3,140
// counties, which was the main source of lag when dragging sliders or
// clicking around the map.
function computeCountyBaseline(fips, abbr, scenarioYear) {
  const raw = USA_COUNTY_RESULTS[scenarioYear]?.[fips];
  if (!raw) return null;
  const [gop, dem, total] = raw;
  if (!total) return null;
  const ids = USA_CANDIDATE_IDS_BY_YEAR[scenarioYear];
  const stateMinor = USA_MINOR_BY_YEAR[scenarioYear][abbr] || {};
  const stateOtherTotal = ids.reduce((s, id) => (id === "gop" || id === "dem") ? s : s + (stateMinor[id] || 0), 0);
  const countyOtherVotes = Math.max(0, total - gop - dem);
  const votes = { gop, dem };
  for (const id of ids) {
    if (id === "gop" || id === "dem") continue;
    votes[id] = stateOtherTotal > 0 ? countyOtherVotes * ((stateMinor[id] || 0) / stateOtherTotal) : 0;
  }
  const baseline = {};
  for (const id of ids) baseline[id] = (votes[id] / total) * 100;
  return { baseline, total, votes };
}
const COUNTY_BASELINE_CACHE = new Map(); // `${year}:${fips}` -> result | null
function usCountyBaseline(fips, abbr, scenarioYear) {
  const key = scenarioYear + ":" + fips;
  if (COUNTY_BASELINE_CACHE.has(key)) return COUNTY_BASELINE_CACHE.get(key);
  const result = computeCountyBaseline(fips, abbr, scenarioYear);
  COUNTY_BASELINE_CACHE.set(key, result);
  return result;
}

// Counties grouped by state, computed once (static topology-independent data).
const COUNTIES_BY_STATE_CACHE = new Map(); // year -> { abbr: [fips,...] }
function countiesByStateFor(scenarioYear) {
  if (COUNTIES_BY_STATE_CACHE.has(scenarioYear)) return COUNTIES_BY_STATE_CACHE.get(scenarioYear);
  const countyTable = USA_COUNTY_RESULTS[scenarioYear] || {};
  const map = {};
  for (const fips of Object.keys(countyTable)) {
    const abbr = USA_FIPS_TO_ABBR[fips.slice(0, 2)];
    if (!abbr || !USA_COUNTY_DETAIL_STATES.has(abbr)) continue;
    (map[abbr] ||= []).push(fips);
  }
  COUNTIES_BY_STATE_CACHE.set(scenarioYear, map);
  return map;
}

// ---------------------------------------------------------------------------
// Geographic weighting for the demographic sliders: how over/under-represented
// a group is in a given county or state, relative to the national
// (population-weighted) average — clamped so a tiny, unrepresentative county
// can't produce an absurd multiplier. Computed once at module load.
const GEO_GROUP_FIELD = { hispanic: "hispanicPct", black: "blackNHPct", white: "whiteNHPct", seniors: "seniorPct", college: "bachelorPct" };
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function buildGeoWeights() {
  const countyWeight = {}, stateWeight = {};
  for (const [group, field] of Object.entries(GEO_GROUP_FIELD)) {
    let sumPctPop = 0, sumPop = 0;
    for (const rec of Object.values(USA_COUNTY_DEMOGRAPHICS)) {
      if (rec[field] == null || !rec.pop) continue;
      sumPctPop += rec[field] * rec.pop;
      sumPop += rec.pop;
    }
    const avg = sumPop > 0 ? sumPctPop / sumPop : null;
    countyWeight[group] = {};
    stateWeight[group] = {};
    if (!avg) continue;
    for (const [fips, rec] of Object.entries(USA_COUNTY_DEMOGRAPHICS)) {
      if (rec[field] != null) countyWeight[group][fips] = clamp(rec[field] / avg, 0.15, 4);
    }
    for (const [abbr, rec] of Object.entries(USA_STATE_DEMOGRAPHICS_2018)) {
      if (rec[field] != null) stateWeight[group][abbr] = clamp(rec[field] / avg, 0.15, 4);
    }
  }
  return { countyWeight, stateWeight };
}
const { countyWeight: COUNTY_GEO_WEIGHT, stateWeight: STATE_GEO_WEIGHT } = buildGeoWeights();

// The "at geoWeight=1" (i.e. national-average-composition) logit contribution
// of each demographic group's slider, kept separate per group so it can be
// re-weighted per county/state below. Uses the small-delta logit-derivative
// approximation (1 / (p·(1-p))) instead of full logit round-trips — accurate
// for the modest percentage-point deltas these sliders produce, and avoids
// ~30k extra Math.log calls per recompute.
function usDemoSwingByGroup(demSliders, baseCandidates) {
  const out = {};
  if (!demSliders) return out;
  const baseGop = (baseCandidates.find(c => c.id === "gop")?.basePercentage ?? 50) / 100;
  const baseDem = (baseCandidates.find(c => c.id === "dem")?.basePercentage ?? 50) / 100;
  const gopDeriv = 1 / Math.max(0.01, baseGop * (1 - baseGop));
  const demDeriv = 1 / Math.max(0.01, baseDem * (1 - baseDem));
  for (const g of USA_DEMO_GROUPS) {
    const slider = demSliders[g.key] || 0;
    if (!slider) continue;
    const gopSens = USA_CANDIDATE_DICT.gop.sensitivities[g.key] || 0;
    const demSens = USA_CANDIDATE_DICT.dem.sensitivities[g.key] || 0;
    out[g.key] = {
      gop: ((slider / 10) * gopSens / 100) * gopDeriv,
      dem: ((slider / 10) * demSens / 100) * demDeriv,
    };
  }
  return out;
}
// Combines the per-group logit contributions into one extra {gop,dem} delta
// for a specific county or state, scaled by that area's own composition.
function usAreaDemoSwing(demoByGroup, geoWeightByGroup) {
  let gop = 0, dem = 0;
  for (const [key, contrib] of Object.entries(demoByGroup)) {
    const w = geoWeightByGroup[key] ?? 1;
    gop += contrib.gop * w;
    dem += contrib.dem * w;
  }
  return { gop, dem };
}
function countyGeoWeights(fips) {
  const out = {};
  for (const key of Object.keys(GEO_GROUP_FIELD)) out[key] = COUNTY_GEO_WEIGHT[key][fips] ?? 1;
  return out;
}
function stateGeoWeights(abbr) {
  const out = {};
  for (const key of Object.keys(GEO_GROUP_FIELD)) out[key] = STATE_GEO_WEIGHT[key][abbr] ?? 1;
  return out;
}

// Applies a turnout adjustment (percent change, e.g. +15 = +15% more votes
// cast) to a raw vote total.
function usApplyTurnout(total, turnoutPct) {
  if (!turnoutPct) return total;
  return Math.max(0, total * (1 + turnoutPct / 100));
}

// ---------------------------------------------------------------------------
// Full state-by-state + national swing/allocation for a given cycle. States
// with certified per-county returns (every state except AK/DC) are computed
// bottom-up as the sum of their (swung, possibly overridden/turnout-adjusted)
// counties; AK/DC fall back to a direct state-level swing since they don't
// have a real county-equivalent breakdown. `countyOverrides`/`stateOverrides`
// are {id: marginPts} maps applying an extra local gop<->dem shift;
// `countyTurnout`/`stateTurnout` are {id: pctChange} maps scaling vote totals.
// `demSliders` (raw -10..10 per group) drives the geographically-weighted
// demographic swing described above.
export function usAllocateElectoralVotes(effectiveCandidates, scenarioYear, baseCandidates, opts = {}) {
  const { countyOverrides = {}, stateOverrides = {}, countyTurnout = {}, stateTurnout = {}, demSliders = null } = opts;
  const baselines = USA_STATE_BASELINES[scenarioYear];
  const swing = usNationalSwing(effectiveCandidates, baseCandidates);
  const demoByGroup = usDemoSwingByGroup(demSliders, baseCandidates);
  const hasDemo = Object.keys(demoByGroup).length > 0;
  const ids = USA_CANDIDATE_IDS_BY_YEAR[scenarioYear];
  const countiesByState = countiesByStateFor(scenarioYear);

  const stateResults = {};
  let gopEV = 0, demEV = 0, otherEV = 0;
  let gopStates = 0, demStates = 0;
  const closest = [];

  for (const abbr of Object.keys(baselines)) {
    const ev = USA_EV[abbr] || 0;
    const fipsList = countiesByState[abbr];
    let pctResult, voteTotals, totalVotes;

    if (fipsList && fipsList.length) {
      // Bottom-up: sum every county's swung (+ optionally overridden/turnout-adjusted) votes.
      voteTotals = Object.fromEntries(ids.map(id => [id, 0]));
      totalVotes = 0;
      for (const fips of fipsList) {
        const cb = usCountyBaseline(fips, abbr, scenarioYear);
        if (!cb) continue;
        const overridePts = countyOverrides[fips];
        const demoExtra = hasDemo ? usAreaDemoSwing(demoByGroup, countyGeoWeights(fips)) : null;
        const extra = overridePts
          ? { gop: usPtsToLogitDelta(overridePts) + (demoExtra?.gop || 0), dem: -usPtsToLogitDelta(overridePts) + (demoExtra?.dem || 0) }
          : demoExtra;
        const swung = usApplyLogitSwing(cb.baseline, swing, extra);
        const total = usApplyTurnout(cb.total, countyTurnout[fips]);
        for (const id of ids) voteTotals[id] += (swung[id] / 100) * total;
        totalVotes += total;
      }
      pctResult = {};
      for (const id of ids) pctResult[id] = totalVotes > 0 ? (voteTotals[id] / totalVotes) * 100 : 0;
    } else {
      const overridePts = stateOverrides[abbr];
      const demoExtra = hasDemo ? usAreaDemoSwing(demoByGroup, stateGeoWeights(abbr)) : null;
      const extra = overridePts
        ? { gop: usPtsToLogitDelta(overridePts) + (demoExtra?.gop || 0), dem: -usPtsToLogitDelta(overridePts) + (demoExtra?.dem || 0) }
        : demoExtra;
      pctResult = usApplyLogitSwing(baselines[abbr], swing, extra);
      totalVotes = usApplyTurnout(USA_2PARTY_BY_YEAR[scenarioYear][abbr]?.total || 0, stateTurnout[abbr]);
      voteTotals = {};
      for (const id of ids) voteTotals[id] = (pctResult[id] / 100) * totalVotes;
    }

    // A direct state-level override/turnout still applies even for bottom-up
    // states (e.g. before drilling into any single county) — layer it on the summed pct.
    if (fipsList?.length && (stateOverrides[abbr] || stateTurnout[abbr])) {
      if (stateOverrides[abbr]) {
        const extra = { gop: usPtsToLogitDelta(stateOverrides[abbr]), dem: -usPtsToLogitDelta(stateOverrides[abbr]) };
        pctResult = usApplyLogitSwing(pctResult, {}, extra);
      }
      if (stateTurnout[abbr]) totalVotes = usApplyTurnout(totalVotes, stateTurnout[abbr]);
      for (const id of ids) voteTotals[id] = (pctResult[id] / 100) * totalVotes;
    }

    const winner = ids.reduce((a, b) => (pctResult[b] > pctResult[a] ? b : a));
    const sorted = [...ids].sort((a, b) => pctResult[b] - pctResult[a]);
    const margin = pctResult[sorted[0]] - pctResult[sorted[1]];
    if (winner === "gop") { gopEV += ev; gopStates++; } else if (winner === "dem") { demEV += ev; demStates++; } else { otherEV += ev; }

    stateResults[abbr] = { abbr, ev, ...pctResult, votes: voteTotals, totalVotes, winner, margin, hasCountyDetail: !!(fipsList && fipsList.length) };
    closest.push({ abbr, margin, winner, ev });
  }
  closest.sort((a, b) => a.margin - b.margin);

  const winnerId = gopEV > demEV ? "gop" : demEV > gopEV ? "dem" : "tie";
  const nationalPct = {};
  for (const c of effectiveCandidates) nationalPct[c.id] = c.effectivePct;

  return {
    stateResults, swing, gopEV, demEV, otherEV,
    gopStates, demStates, winnerId,
    majorityReached: Math.max(gopEV, demEV) >= USA.MAJORITY_EV,
    tippingPoint: closest.find(s => s.winner === winnerId) || null,
    closestStates: closest.slice(0, 12),
    nationalPct, candidateIds: ids,
  };
}

// Single-county result for the map tooltip / detail panel — real baseline,
// current national + geo-weighted demographic swing, any active local
// override, and any active turnout change for that county. Alaska (reported
// by state house district, not borough) and any other fips without a real
// county-equivalent join fall back to that STATE's swung result, flagged
// hasRealData:false, rather than showing nothing.
export function usCountyResult(fips, scenarioYear, swing, overridePts, opts = {}) {
  const { demSliders = null, baseCandidates = null, turnoutPct = 0 } = opts;
  const abbr = USA_FIPS_TO_ABBR[fips.slice(0, 2)];
  if (!abbr) return null;
  const cb = usCountyBaseline(fips, abbr, scenarioYear);
  const demoByGroup = (demSliders && baseCandidates) ? usDemoSwingByGroup(demSliders, baseCandidates) : {};
  const hasDemo = Object.keys(demoByGroup).length > 0;

  if (!cb) {
    const stateBaseline = USA_STATE_BASELINES[scenarioYear][abbr];
    if (!stateBaseline) return null;
    const demoExtra = hasDemo ? usAreaDemoSwing(demoByGroup, stateGeoWeights(abbr)) : null;
    const extra = overridePts
      ? { gop: usPtsToLogitDelta(overridePts) + (demoExtra?.gop || 0), dem: -usPtsToLogitDelta(overridePts) + (demoExtra?.dem || 0) }
      : demoExtra;
    const swung = usApplyLogitSwing(stateBaseline, swing, extra);
    const ids = Object.keys(stateBaseline);
    const winner = ids.reduce((a, b) => (swung[b] > swung[a] ? b : a));
    const sorted = [...ids].sort((a, b) => swung[b] - swung[a]);
    const totalVotes = usApplyTurnout(USA_2PARTY_BY_YEAR[scenarioYear][abbr]?.total || 0, turnoutPct);
    const votes = {};
    for (const id of ids) votes[id] = (swung[id] / 100) * totalVotes;
    return {
      fips, abbr, winner, margin: swung[sorted[0]] - swung[sorted[1]],
      pct: swung, votes, totalVotes, baseline: stateBaseline, hasRealData: false, isStatewide: true, overridePts: overridePts || 0,
    };
  }

  const demoExtra = hasDemo ? usAreaDemoSwing(demoByGroup, countyGeoWeights(fips)) : null;
  const extra = overridePts
    ? { gop: usPtsToLogitDelta(overridePts) + (demoExtra?.gop || 0), dem: -usPtsToLogitDelta(overridePts) + (demoExtra?.dem || 0) }
    : demoExtra;
  const swung = usApplyLogitSwing(cb.baseline, swing, extra);
  const ids = Object.keys(cb.baseline);
  const winner = ids.reduce((a, b) => (swung[b] > swung[a] ? b : a));
  const sorted = [...ids].sort((a, b) => swung[b] - swung[a]);
  const total = usApplyTurnout(cb.total, turnoutPct);
  const votes = {};
  for (const id of ids) votes[id] = (swung[id] / 100) * total;
  return {
    fips, abbr, winner, margin: swung[sorted[0]] - swung[sorted[1]],
    pct: swung, votes, totalVotes: total, baseline: cb.baseline, hasRealData: true, overridePts: overridePts || 0,
  };
}

export function usFmtVotes(n) {
  if (n == null || isNaN(n)) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return Math.round(n).toLocaleString();
}
export function usFmtVotesExact(n) {
  if (n == null || isNaN(n)) return "—";
  return Math.round(n).toLocaleString();
}

export function usFmtEV(n) { return n == null ? "—" : Math.round(n).toLocaleString(); }
