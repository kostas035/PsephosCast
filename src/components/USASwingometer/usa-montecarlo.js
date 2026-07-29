// usa-montecarlo.js — probabilistic layer over the deterministic engine.
// Perturbs the current national vote shares thousands of times with a
// fat-tailed, partly-correlated error with THREE tiers (matching how real US
// election uncertainty behaves): national, regional, and per-state
// idiosyncratic (scaled by that state's historical elasticity). The random
// shock is applied to the gop<->dem competitive axis only — third parties are
// treated as comparatively stable and simply carry the user's slider-driven
// central swing with no added noise, which keeps a 4000-iteration run fast
// (this iterates only the 51 state baselines, not the full county set — the
// deterministic map/results panel is where county-level detail lives).
import { usToLogit, usFromLogit, USA_EV, USA_STATE_BASELINES, USA_STATE_REGION, USA_STATE_LEAN } from "./usa-data.js";

function randn() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
function studentT(df) {
  let w = 0;
  for (let i = 0; i < df; i++) { const z = randn(); w += z * z; }
  return randn() / Math.sqrt(w / df);
}
function percentile(sorted, q) {
  if (!sorted.length) return 0;
  const idx = Math.round((sorted.length - 1) * q);
  return sorted[Math.max(0, Math.min(sorted.length - 1, idx))];
}

const REGION_NAMES = ["Northeast", "Midwest", "South", "West"];

/**
 * @param {Array}  effectiveCandidates  candidates with `effectivePct` (any ids)
 * @param {string} scenarioYear
 * @param {Array}  baseCandidates
 * @param {Object} opts { sigma=2.2, iterations=4000, df=5, national=0.45, regional=0.25 }
 */
export function usRunMonteCarlo(effectiveCandidates, scenarioYear, baseCandidates, opts = {}) {
  const { sigma = 2.2, iterations = 4000, df = 5, national = 0.45, regional = 0.25 } = opts;
  const baselines = USA_STATE_BASELINES[scenarioYear];
  const abbrs = Object.keys(baselines);
  if (!abbrs.length) return null;
  const ids = Object.keys(baselines[abbrs[0]]);

  // Central (best-estimate) logit swing per candidate, identical to the deterministic engine.
  const centralSwing = {};
  for (const bc of baseCandidates) {
    const ec = effectiveCandidates.find(p => p.id === bc.id);
    const basePct = Math.max(0.02, bc.basePercentage);
    const effPct = ec ? Math.max(0.02, ec.effectivePct) : basePct;
    centralSwing[bc.id] = usToLogit(effPct) - usToLogit(basePct);
  }

  const evTotals = new Array(iterations);
  const stateGopWins = {}; abbrs.forEach(a => stateGopWins[a] = 0);
  const stateMargins = {}; abbrs.forEach(a => stateMargins[a] = new Array(iterations));
  let gopWins = 0, tie = 0;

  const idiosyncraticScale = {};
  abbrs.forEach(a => { idiosyncraticScale[a] = 0.6 + Math.min(1.4, Math.abs(USA_STATE_LEAN[a] || 0) * 6); });

  for (let s = 0; s < iterations; s++) {
    const natShock = studentT(df) * sigma * national;
    const regionShock = {};
    REGION_NAMES.forEach(r => { regionShock[r] = studentT(df) * sigma * regional; });

    let gopEV = 0, demEV = 0;
    for (const abbr of abbrs) {
      const region = USA_STATE_REGION[abbr] || "South";
      const idio = studentT(df) * sigma * (1 - national - regional) * idiosyncraticScale[abbr];
      const shockTotal = natShock + regionShock[region] + idio;

      const baseline = baselines[abbr];
      let total = 0;
      const adj = {};
      for (const id of ids) {
        const extra = id === "gop" ? shockTotal : id === "dem" ? -shockTotal * 0.85 : 0;
        const basePct = Math.max(0.02, baseline[id] ?? 0.02);
        const lo = usToLogit(basePct) + (centralSwing[id] ?? 0) + extra;
        adj[id] = usFromLogit(lo);
        total += adj[id];
      }
      let gop = total > 0 ? (adj.gop / total) * 100 : 0;
      let dem = total > 0 ? (adj.dem / total) * 100 : 0;

      const ev = USA_EV[abbr] || 0;
      const margin = gop - dem; // positive = GOP
      stateMargins[abbr][s] = margin;
      if (margin >= 0) { gopEV += ev; stateGopWins[abbr]++; } else { demEV += ev; }
    }
    evTotals[s] = gopEV;
    if (gopEV > demEV) gopWins++;
    else if (gopEV === demEV) tie++;
  }

  const sortedEV = [...evTotals].sort((a, b) => a - b);
  const meanEV = evTotals.reduce((a, b) => a + b, 0) / iterations;

  const stateOdds = abbrs.map(abbr => {
    const sorted = [...stateMargins[abbr]].sort((a, b) => a - b);
    return {
      abbr, ev: USA_EV[abbr] || 0,
      pGop: stateGopWins[abbr] / iterations,
      medianMargin: percentile(sorted, 0.5),
      p10: percentile(sorted, 0.1), p90: percentile(sorted, 0.9),
    };
  }).sort((a, b) => Math.abs(a.medianMargin) - Math.abs(b.medianMargin));

  return {
    iterations, sigma, evTotals, sortedEV,
    meanEV, medianEV: percentile(sortedEV, 0.5),
    p10EV: percentile(sortedEV, 0.1), p90EV: percentile(sortedEV, 0.9),
    pGopWin: gopWins / iterations, pDemWin: (iterations - gopWins - tie) / iterations, pTie: tie / iterations,
    stateOdds,
  };
}
