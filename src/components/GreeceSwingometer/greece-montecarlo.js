// greece-montecarlo.js
// Probabilistic layer on top of the deterministic engine. Takes the CURRENT
// effective national percentages as the centre, perturbs them by a realistic
// polling error thousands of times, re-runs the real seat engine each time, and
// summarises the distribution of outcomes. Pure functions — no React, no I/O.
import { GR } from "./greece-data.js";
import { grRunElection } from "./greece-engine.js";

// Random helpers
// Standard normal via Box–Muller.
function randn() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// Student-t with `df` degrees of freedom. Fatter tails than a normal, so the
// occasional big polling miss is represented — this is the distribution
// election forecasters use for poll error (df≈5, ~2pt average miss).
function studentT(df) {
  let w = 0;
  for (let i = 0; i < df; i++) { const z = randn(); w += z * z; }
  return randn() / Math.sqrt(w / df);
}

function percentile(sortedArr, q) {
  if (!sortedArr.length) return 0;
  const idx = Math.round((sortedArr.length - 1) * q);
  return sortedArr[Math.max(0, Math.min(sortedArr.length - 1, idx))];
}

/**
 * Run the Monte Carlo simulation.
 *
 * @param {Array}  effectiveParties  current parties with `effectivePct` (the same
 *                                   array that produces the official result).
 * @param {Object} opts
 * @param {number} opts.threshold    electoral threshold % (e.g. 3)
 * @param {number} opts.turnout      turnout for vote estimates (optional)
 * @param {number} opts.sigma        typical polling error in points (default 2.5)
 * @param {number} opts.iterations   number of simulations (default 5000)
 * @param {number} opts.df           t-distribution degrees of freedom (default 5)
 * @param {number} opts.correlation  0–1: share of the error that is a common
 *                                   "all-pollsters-wrong-together" shock vs.
 *                                   party-specific noise (default 0.35)
 * @param {string} opts.scenarioId   scenario id, so the sims use that era's
 *                                   majority-bonus formula (flat 50 pre-2023,
 *                                   sliding after — see GR_BONUS_CONFIG)
 */
export function grRunMonteCarlo(effectiveParties, opts = {}) {
  const {
    threshold = 3.0,
    turnout = 0,
    sigma = 2.5,
    iterations = 5000,
    df = 5,
    correlation = 0.35,
    scenarioId = null,
  } = opts;

  // Only real contesting parties (exclude the "Other" bucket from the centre).
  const base = (effectiveParties || []).filter(p => p && p.id !== "other" && p.effectivePct > 0);
  if (base.length === 0) return null;

  const ids = base.map(p => p.id);
  const meta = {};
  base.forEach(p => { meta[p.id] = { id: p.id, name: p.name, fullName: p.fullName, color: p.color, ideology: p.ideology }; });

  // Per-party seat samples, plus tallies.
  const seatSamples = {};            // id -> number[] (length = iterations)
  const firstPlace = {};             // id -> count of sims finishing first (most votes)
  const soloMajority = {};           // id -> count of sims with >=151 seats alone
  ids.forEach(id => { seatSamples[id] = new Array(iterations); firstPlace[id] = 0; soloMajority[id] = 0; });

  // Full seat matrix kept so coalition probabilities can be computed instantly
  // afterwards without re-simulating.
  const seatMatrix = new Array(iterations);
  let hung = 0;

  // How wide is "the error" relative to a party's size? We scale the common
  // shock mildly with each party's share so a 28% party can miss by more points
  // than a 3% party (realistic), while the party-specific noise is flat.
  for (let s = 0; s < iterations; s++) {
    const common = studentT(df);                 // one shared shock for this sim
    const perturbed = base.map(p => {
      const shareScale = 0.5 + Math.min(1.5, p.effectivePct / 20); // mild size scaling
      const shared = common * sigma * correlation * shareScale;
      const idio  = studentT(df) * sigma * (1 - correlation) * shareScale;
      return { ...p, effectivePct: Math.max(0, p.effectivePct + shared + idio) };
    });

    const res = grRunElection(perturbed, threshold, turnout, scenarioId);
    const seatsById = {};
    let topSeats = 0, topId = null;
    (res.results || []).forEach(r => {
      seatsById[r.id] = r.seats;
      if (r.seats > topSeats) { topSeats = r.seats; topId = r.id; }
    });

    ids.forEach(id => { seatSamples[id][s] = seatsById[id] || 0; });
    seatMatrix[s] = seatsById;

    if (res.winnerId && firstPlace[res.winnerId] !== undefined) firstPlace[res.winnerId]++;
    if (topId && topSeats >= GR.MAJORITY) soloMajority[topId]++;
    if (topSeats < GR.MAJORITY) hung++;
  }

  // Summarise each party.
  const parties = ids.map(id => {
    const sorted = [...seatSamples[id]].sort((a, b) => a - b);
    const mean = sorted.reduce((a, b) => a + b, 0) / iterations;
    return {
      ...meta[id],
      mean,
      median: percentile(sorted, 0.5),
      p5:  percentile(sorted, 0.05),
      p25: percentile(sorted, 0.25),
      p75: percentile(sorted, 0.75),
      p95: percentile(sorted, 0.95),
      min: sorted[0],
      max: sorted[sorted.length - 1],
      pFirst: firstPlace[id] / iterations,
      pSoloMajority: soloMajority[id] / iterations,
    };
  }).sort((a, b) => b.mean - a.mean);

  return {
    iterations,
    sigma,
    threshold,
    pHung: hung / iterations,
    parties,
    seatMatrix,   // for coalition probabilities
    ids,
  };
}

// Probability a chosen coalition (array of party ids) reaches a majority,
// computed from the stored seat matrix — instant, no re-simulation.
export function grCoalitionProbability(mc, coalitionIds) {
  if (!mc || !coalitionIds || !coalitionIds.length) return { pMajority: 0, meanSeats: 0, medianSeats: 0 };
  let wins = 0, sum = 0;
  const totals = new Array(mc.iterations);
  for (let s = 0; s < mc.iterations; s++) {
    const row = mc.seatMatrix[s];
    let t = 0;
    for (const id of coalitionIds) t += row[id] || 0;
    totals[s] = t;
    sum += t;
    if (t >= GR.MAJORITY) wins++;
  }
  totals.sort((a, b) => a - b);
  return {
    pMajority: wins / mc.iterations,
    meanSeats: sum / mc.iterations,
    medianSeats: percentile(totals, 0.5),
  };
}