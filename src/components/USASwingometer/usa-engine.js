// usa-engine.js — swing math + electoral vote allocation for the USA Swingometer.
// Same shape as cyprus-engine.js: a uniform national logit-swing is computed
// once from the user's national vote shares vs the selected baseline, then
// applied to every state's (and, where we have real county returns, every
// county's) own historical baseline — so purple/marginal states move the most
// in percentage-point terms, exactly like real swingometers.
import { USA, usToLogit, usFromLogit, USA_EV, USA_STATE_BASELINES, USA_FIPS_TO_ABBR } from "./usa-data.js";
import { USA_COUNTY_RESULTS } from "./usa-county-data.js";

// Computes the logit-space swing for gop/dem/other from the national baseline
// to the user's current effective national percentages.
export function usNationalSwing(effectiveCandidates, baseCandidates) {
  const swing = {};
  for (const bc of baseCandidates) {
    const ec = effectiveCandidates.find(p => p.id === bc.id);
    const basePct = Math.max(0.05, bc.basePercentage);
    const effPct = ec ? Math.max(0.05, ec.effectivePct) : basePct;
    swing[bc.id] = usToLogit(effPct) - usToLogit(basePct);
  }
  return swing;
}

// Applies a precomputed logit swing onto any {gop,dem,other} baseline (a state
// or a county), renormalising back to 100%.
export function usApplyLogitSwing(baseline, swing) {
  let total = 0;
  const adj = {};
  for (const id of ["gop", "dem", "other"]) {
    const basePct = Math.max(0.05, baseline[id] ?? 0.05);
    const lo = usToLogit(basePct) + (swing[id] ?? 0);
    adj[id] = usFromLogit(lo);
    total += adj[id];
  }
  const out = {};
  for (const id of ["gop", "dem", "other"]) out[id] = total > 0 ? (adj[id] / total) * 100 : 0;
  return out;
}

// Full state-by-state swing + electoral vote allocation for a given cycle.
export function usAllocateElectoralVotes(effectiveCandidates, scenarioYear, baseCandidates) {
  const baselines = USA_STATE_BASELINES[scenarioYear];
  const swing = usNationalSwing(effectiveCandidates, baseCandidates);

  const stateResults = {};
  let gopEV = 0, demEV = 0, otherEV = 0;
  let gopStates = 0, demStates = 0;
  const closest = [];

  for (const abbr of Object.keys(baselines)) {
    const swung = usApplyLogitSwing(baselines[abbr], swing);
    const ev = USA_EV[abbr] || 0;
    const winner = swung.gop >= swung.dem ? "gop" : "dem";
    const margin = Math.abs(swung.gop - swung.dem);
    if (winner === "gop") { gopEV += ev; gopStates++; } else { demEV += ev; demStates++; }
    stateResults[abbr] = { abbr, ev, gop: swung.gop, dem: swung.dem, other: swung.other, winner, margin };
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
    nationalPct,
  };
}

// Real per-county swing for the states we have certified county returns for;
// every other county falls back to its parent state's swung result (uniform
// shading — see USA_COUNTY_DETAIL_STATES in usa-data.js).
export function usCountyResult(fips, stateResults, swing) {
  const abbr = USA_FIPS_TO_ABBR[fips.slice(0, 2)];
  const stateRes = stateResults[abbr];
  const raw = USA_COUNTY_RESULTS[fips];
  if (!raw) return stateRes ? { ...stateRes, fips, hasRealData: false } : null;

  const [gop, dem, total] = raw;
  const other = Math.max(0.05, total - gop - dem);
  const baseline = { gop: (gop / total) * 100, dem: (dem / total) * 100, other: (other / total) * 100 };
  const swung = usApplyLogitSwing(baseline, swing);
  const winner = swung.gop >= swung.dem ? "gop" : "dem";
  return {
    fips, abbr, ev: stateRes?.ev, winner, margin: Math.abs(swung.gop - swung.dem),
    gop: swung.gop, dem: swung.dem, other: swung.other,
    baselineGop: baseline.gop, baselineDem: baseline.dem, totalVotes: total,
    hasRealData: true,
  };
}

export function usFmtVotes(n) {
  if (n == null || isNaN(n)) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return Math.round(n).toLocaleString();
}

export function usFmtEV(n) { return n == null ? "—" : Math.round(n).toLocaleString(); }
