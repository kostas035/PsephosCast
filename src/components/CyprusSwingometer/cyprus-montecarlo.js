// cyprus-montecarlo.js
// Probabilistic layer over the deterministic engine. Takes the CURRENT effective
// national percentages as the centre, perturbs them by a realistic polling error
// thousands of times, re-runs the national Hare seat allocation each time (the
// same allocation that fixes each party's seat total in cyprus-engine), and
// summarises the distribution. Pure functions — no React, no I/O.
import { CY } from "./cyprus-data.js";

// Standard normal (Box–Muller).
function randn() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
// Student-t with `df` degrees of freedom — fatter tails than a normal, so the
// occasional big polling miss is represented (forecasters use df≈5).
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

// National seat allocation = the seat TOTAL each party wins (Hare quota +
// largest remainder over qualifying national shares, 56 seats). This mirrors
// step 1 of cyAllocateAllSeats; the district distribution only decides WHERE
// those seats land, not how many a party gets nationally.
function cyNationalSeats(parties, thresholdPct) {
  const rawTotal = parties.reduce((s, p) => s + p.effectivePct, 0);
  const withNat = parties.map(p => ({ id: p.id, nat: rawTotal > 0 ? (p.effectivePct / rawTotal) * 100 : 0 }));
  const q = withNat.filter(p => p.nat >= thresholdPct);
  const seats = {};
  parties.forEach(p => { seats[p.id] = 0; });
  if (!q.length) return { seats, topId: null, topSeats: 0, firstId: null };

  const qTotal = q.reduce((s, p) => s + p.nat, 0);
  const quota = qTotal / CY.TOTAL_SEATS;
  let allocated = 0;
  const rem = [];
  q.forEach(p => {
    const raw = p.nat / quota, fl = Math.floor(raw);
    seats[p.id] = fl; allocated += fl; rem.push({ id: p.id, rem: raw - fl });
  });
  rem.sort((a, b) => b.rem - a.rem);
  for (let i = 0; i < CY.TOTAL_SEATS - allocated; i++) seats[rem[i % rem.length].id]++;

  // first place = highest national vote share; top = most seats.
  let firstId = null, firstPct = -1, topId = null, topSeats = -1;
  withNat.forEach(p => { if (p.nat > firstPct) { firstPct = p.nat; firstId = p.id; } });
  q.forEach(p => { if (seats[p.id] > topSeats) { topSeats = seats[p.id]; topId = p.id; } });
  return { seats, topId, topSeats, firstId };
}

/**
 * @param {Array}  effectiveParties  parties with `effectivePct`
 * @param {Object} opts  { threshold, turnout, sigma=2.5, iterations=4000, df=5, correlation=0.35 }
 */
export function cyRunMonteCarlo(effectiveParties, opts = {}) {
  const { threshold = CY.THRESHOLD, sigma = 2.5, iterations = 4000, df = 5, correlation = 0.35 } = opts;

  const base = (effectiveParties || []).filter(p => p && p.id !== "others" && p.effectivePct > 0);
  if (base.length === 0) return null;

  const ids = base.map(p => p.id);
  const meta = {};
  base.forEach(p => { meta[p.id] = { id: p.id, name: p.name, fullName: p.fullName, color: p.color, ideology: p.ideology }; });

  const seatSamples = {}; const firstPlace = {}; const soloMajority = {};
  ids.forEach(id => { seatSamples[id] = new Array(iterations); firstPlace[id] = 0; soloMajority[id] = 0; });

  const seatMatrix = new Array(iterations);
  let hung = 0;

  for (let s = 0; s < iterations; s++) {
    const common = studentT(df);
    const perturbed = base.map(p => {
      const shareScale = 0.5 + Math.min(1.5, p.effectivePct / 20);
      const shared = common * sigma * correlation * shareScale;
      const idio   = studentT(df) * sigma * (1 - correlation) * shareScale;
      return { ...p, effectivePct: Math.max(0, p.effectivePct + shared + idio) };
    });

    const { seats, topId, topSeats, firstId } = cyNationalSeats(perturbed, threshold);
    ids.forEach(id => { seatSamples[id][s] = seats[id] || 0; });
    seatMatrix[s] = seats;

    if (firstId && firstPlace[firstId] !== undefined) firstPlace[firstId]++;
    if (topId && topSeats >= CY.MAJORITY) soloMajority[topId]++;
    if (topSeats < CY.MAJORITY) hung++;
  }

  const parties = ids.map(id => {
    const sorted = [...seatSamples[id]].sort((a, b) => a - b);
    const mean = sorted.reduce((a, b) => a + b, 0) / iterations;
    return {
      ...meta[id], mean,
      median: percentile(sorted, 0.5),
      p5: percentile(sorted, 0.05), p25: percentile(sorted, 0.25),
      p75: percentile(sorted, 0.75), p95: percentile(sorted, 0.95),
      min: sorted[0], max: sorted[sorted.length - 1],
      pFirst: firstPlace[id] / iterations,
      pSoloMajority: soloMajority[id] / iterations,
    };
  }).sort((a, b) => b.mean - a.mean);

  return { iterations, sigma, threshold, pHung: hung / iterations, parties, seatMatrix, ids };
}

export function cyCoalitionProbability(mc, coalitionIds) {
  if (!mc || !coalitionIds || !coalitionIds.length) return { pMajority: 0, meanSeats: 0, medianSeats: 0 };
  let wins = 0, sum = 0;
  const totals = new Array(mc.iterations);
  for (let s = 0; s < mc.iterations; s++) {
    const row = mc.seatMatrix[s];
    let t = 0;
    for (const id of coalitionIds) t += row[id] || 0;
    totals[s] = t; sum += t;
    if (t >= CY.MAJORITY) wins++;
  }
  totals.sort((a, b) => a - b);
  return { pMajority: wins / mc.iterations, meanSeats: sum / mc.iterations, medianSeats: percentile(totals, 0.5) };
}