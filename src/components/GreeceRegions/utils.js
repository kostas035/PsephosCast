// utils.js
// Core swing engine for the Greece Regional Elections swingometer.
//
// KEY UPGRADE: Logit-space swing transformation.
//   Linear swing (old): newShare = base + swing * elasticity
//   Logit swing (new):  newLogit = logit(base) + Δlogit * elasticity
//
// Why? Linear swings produce impossible values (>100%, <0%) at extremes.
// Logit-space naturally compresses toward the bounds — a +10pt swing when
// you're at 80% is very different from +10pt when you're at 10%.
// This matches how political science models geographic vote diffusion.

// Logit Helpers
export const toLogit  = (p) => Math.log(Math.max(0.0001, p) / Math.max(0.0001, 100 - p));
export const fromLogit = (l) => 100 / (1 + Math.exp(-l));

// Pseudo-random (deterministic)
export const getPseudoRandom = (seed) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export const getHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return hash;
};

// computeMunicipalData
// Computes per-municipality vote shares given a set of active candidates and
// a turnout delta, then runs the seat allocation engine.
//
// @param {Object} config         — region config from REGIONS_DB
// @param {Array}  activeCandidates — candidate objects with .percent
// @param {number} turnoutDelta   — slider delta applied to baseTurnout
// @returns {{ municipalData, aggregateData }}
export const computeMunicipalData = (config, activeCandidates, turnoutDelta) => {
  if (!config || !activeCandidates.length)
    return { municipalData: {}, aggregateData: [] };

  // Build a baseline lookup from the config's original candidate percentages.
  // This is stable across slider moves — it's always the election baseline.
  const baselineMap = {};
  config.candidates.forEach((c) => { baselineMap[c.id] = c.percent; });

  const finalData = {};

  // Per-municipality swing calculation
  config.munis.forEach((m) => {
    const d = config.details[m];
    if (!d) return;

    let rawShares = {};
    let totalRawShare = 0;

    activeCandidates.forEach((c) => {
      // 1. Find this candidate's local baseline for this municipality.
      //    Fall back to the national baseline when no per-muni data exists.
      let baseShare = baselineMap[c.id] ?? c.percent ?? 0;
      if (d.baseVote) {
        const bv = d.baseVote[c.id] ?? d.baseVote[c.id?.toLowerCase()] ?? null;
        if (bv !== null && bv > 0) baseShare = bv;
      }

      // 2. Compute how much the national vote has moved since the baseline.
      const nationalBase    = Math.max(0.0001, baselineMap[c.id] ?? c.percent ?? 0.0001);
      const nationalCurrent = Math.max(0.0001, c.percent ?? 0.0001);

      // 3. Apply the swing in logit-space, scaled by municipality elasticity.
      //    elasticity > 1 → volatile municipality (swings harder than average)
      //    elasticity < 1 → stubborn municipality (resists national swings)
      const logitSwing = (toLogit(nationalCurrent) - toLogit(nationalBase))
                         * (d.elasticity ?? 1.0);

      rawShares[c.id] = Math.max(0, fromLogit(toLogit(Math.max(0.0001, baseShare)) + logitSwing));
      totalRawShare  += rawShares[c.id];
    });

    finalData[m] = activeCandidates
      .map((c) => ({
        ...c,
        localPercent: totalRawShare > 0 ? (rawShares[c.id] / totalRawShare) * 100 : 0,
      }))
      .sort((a, b) => b.localPercent - a.localPercent);
  });

  // Virtual District Aggregation
  if (config.virtualDistricts) {
    config.virtualDistricts.forEach((vd) => {
      let totalV  = 0;
      const aggVotes = {};
      activeCandidates.forEach((c) => (aggVotes[c.id] = 0));

      vd.sources.forEach((srcMuni) => {
        const d = config.details[srcMuni];
        if (!d) return;
        const v = d.pop * (Math.min(100, Math.max(0, d.baseTurnout + turnoutDelta)) / 100);
        totalV += v;
        if (finalData[srcMuni])
          finalData[srcMuni].forEach((r) => (aggVotes[r.id] += v * (r.localPercent / 100)));
      });

      finalData[vd.id] = activeCandidates
        .map((c) => ({
          ...c,
          localPercent: totalV > 0 ? (aggVotes[c.id] / totalV) * 100 : 0,
        }))
        .sort((a, b) => b.localPercent - a.localPercent);
    });
  }

  // Regional Aggregate
  const agg       = {};
  let grandTotal  = 0;
  activeCandidates.forEach((c) => (agg[c.id] = 0));

  const virtualNames = config.virtualDistricts
    ? config.virtualDistricts.map((v) => v.id)
    : [];

  Object.keys(finalData).forEach((m) => {
    if (virtualNames.includes(m)) return;
    const d = config.details[m];
    if (!d) return;
    const v = d.pop * (Math.min(100, Math.max(0, d.baseTurnout + turnoutDelta)) / 100);
    grandTotal += v;
    finalData[m]?.forEach((r) => { agg[r.id] += v * (r.localPercent / 100); });
  });

  let aggregateData = activeCandidates.map((c) => {
    const votes   = agg[c.id] || 0;
    const percent = grandTotal > 0 ? (votes / grandTotal) * 100 : 0;
    return { ...c, votes, percent, seats: 0 };
  });

  // Seat Allocation Engine
  // Greek regional councils use a bonus-seat system:
  //   – The list with the most first-round votes (or the runoff winner)
  //     receives `bonusSeats` seats automatically.
  //   – The remaining `distributableSeats` are split by Hare quota among
  //     all lists (excluding the winner) that cleared `threshold` per cent.
  if (aggregateData.length > 0) {
    let winner = aggregateData[0];
    for (let i = 1; i < aggregateData.length; i++) {
      if (aggregateData[i].percent > winner.percent) winner = aggregateData[i];
    }

    if (winner) {
      winner.seats = config.bonusSeats;

      const qualifyingOpposition = aggregateData.filter(
        (p) => p.id !== winner.id && p.percent >= config.threshold
      );
      const totalOppVotes = qualifyingOpposition.reduce((s, p) => s + p.votes, 0);
      let allocatedSeats  = 0;

      qualifyingOpposition.forEach((p) => {
        p.seats = totalOppVotes > 0
          ? Math.floor((p.votes / totalOppVotes) * config.distributableSeats)
          : 0;
        allocatedSeats += p.seats;
      });

      // Largest Remainder Method for rounding seats
      let remainderSeats = config.distributableSeats - allocatedSeats;
      if (remainderSeats > 0 && qualifyingOpposition.length > 0) {
        qualifyingOpposition
          .map((p) => ({
            id:  p.id,
            rem: totalOppVotes > 0
              ? ((p.votes / totalOppVotes) * config.distributableSeats) - p.seats
              : 0,
          }))
          .sort((a, b) => b.rem - a.rem)
          .slice(0, remainderSeats)
          .forEach(({ id }) => {
            const p = aggregateData.find((x) => x.id === id);
            if (p) p.seats += 1;
          });
      } else if (remainderSeats > 0) {
        // Safety: no qualifying opposition, give remaining seats to winner
        winner.seats += remainderSeats;
      }
    }
  }

  return { municipalData: finalData, aggregateData };
};