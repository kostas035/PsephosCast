// ─── cyprus-engine.js ─────────────────────────────────────────────────────────

import { CY, cyToLogit, cyFromLogit } from "./cyprus-data.js";

// Applies logit swing from National baseline straight into the District Baseline
export function cyApplySwing(district, effectiveParties, baseParties) {
  const logitSwing = {};
  baseParties.forEach(bp => {
    const ep = effectiveParties.find(p => p.id === bp.id);
    const basePct      = Math.max(0.001, bp.basePercentage);
    const effectivePct = ep ? Math.max(0.001, ep.effectivePct) : basePct;
    logitSwing[bp.id]  = cyToLogit(effectivePct) - cyToLogit(basePct);
  });

  let total = 0;
  const adjusted = {};
  baseParties.forEach(bp => {
    const distBase    = Math.max(0.001, district.baseVotes[bp.id] ?? bp.basePercentage);
    const newLogit    = cyToLogit(distBase) + (logitSwing[bp.id] ?? 0);
    adjusted[bp.id]   = cyFromLogit(newLogit);
    total            += adjusted[bp.id];
  });

  const votes = Object.fromEntries(
    Object.entries(adjusted).map(([pid, v]) => [pid, total > 0 ? (v / total) * 100 : 0])
  );
  const leader = Object.entries(votes).reduce(
    (best, [pid, pct]) => pct > best.pct ? { pid, pct } : best,
    { pid: null, pct: 0 }
  );
  return { ...district, votes, leader: leader.pid };
}

// THE NEW UNIFIED ALLOCATOR
export function cyAllocateAllSeats(nationalParties, districts, thresholdPct, scenarioId, isBaseline, turnout = null) {
  const rawTotal = nationalParties.reduce((s, p) => s + p.effectivePct, 0);
  
  const withNational = nationalParties.map(p => ({
    ...p,
    nationalPct: rawTotal > 0 ? (p.effectivePct / rawTotal) * 100 : 0
  }));

  const qParties = withNational.filter(p => p.nationalPct >= thresholdPct);
  const qIds = new Set(qParties.map(p => p.id));
  
  if (qParties.length === 0) {
    return { results: [], districtSeats: {}, eliminated: [], eliminatedDetail: [], unfilledDistricts: {} };
  }

  // 1. Calculate National Target Seats
  const qTotalPct = qParties.reduce((sum, p) => sum + p.nationalPct, 0);
  const quota = qTotalPct / CY.TOTAL_SEATS;
  let targetSeats = {};
  let allocated = 0;
  const remainders = [];
  
  qParties.forEach(p => {
    const raw = p.nationalPct / quota;
    const fl = Math.floor(raw);
    targetSeats[p.id] = fl;
    allocated += fl;
    remainders.push({ id: p.id, rem: raw - fl });
  });
  remainders.sort((a, b) => b.rem - a.rem);
  for (let i = 0; i < CY.TOTAL_SEATS - allocated; i++) {
    targetSeats[remainders[i].id]++;
  }

  // 2. Historical Baseline Override — pins each scenario to the official certified results.
  //    The Hare quota approximation on percentages can flip marginal seats vs. raw-vote counts,
  //    so we hardcode the verified totals here for all three election years.
  if (isBaseline) {
    if (scenarioId === "2026") {
      // Official May 2026 results (56 seats total)
      targetSeats = { disy: 17, akel: 15, elam: 8, diko: 8, alma: 4, adk: 4 };
      qParties.forEach(p => { if (targetSeats[p.id] === undefined) targetSeats[p.id] = 0; });
    } else if (scenarioId === "2021") {
      // Official May 2021 results (56 seats total)
      targetSeats = { disy: 17, akel: 15, diko: 9, elam: 4, edek: 4, dipa: 4, kosp: 3 };
      qParties.forEach(p => { if (targetSeats[p.id] === undefined) targetSeats[p.id] = 0; });
    } else if (scenarioId === "2016") {
      // Official May 2016 results (56 seats total)
      targetSeats = { disy: 18, akel: 16, diko: 9, edek: 3, sypol: 3, solid: 3, kosp: 2, elam: 2 };
      qParties.forEach(p => { if (targetSeats[p.id] === undefined) targetSeats[p.id] = 0; });
    }
  }

  // 3. First Distribution: District Seats (Hare Quota) - DRY RUN PASS
  const uncappedSeats = {};
  const uncappedNational = {};
  qParties.forEach(p => { uncappedSeats[p.id] = []; uncappedNational[p.id] = 0; });

  districts.forEach(d => {
    const validVotes = Object.entries(d.votes).filter(([id]) => qIds.has(id)).reduce((sum, [_, v]) => sum + v, 0);
    const dQuota = validVotes > 0 ? validVotes / d.seats : Infinity;

    qParties.forEach(p => {
      const v = d.votes[p.id] || 0;
      const raw = validVotes > 0 ? v / dQuota : 0;
      const fl = Math.floor(raw);
      uncappedSeats[p.id].push({ distId: d.id, seats: fl, rem: raw - fl });
      uncappedNational[p.id] += fl;
    });
  });

  // Apply caps globally and proportionally to avoid processing order bias
  const currentNational = {};
  const districtSeats = {};
  districts.forEach(d => {
     districtSeats[d.id] = Object.fromEntries(qParties.map(p => [p.id, 0]));
  });
  const districtRemainders = [];

  qParties.forEach(p => {
     let excess = uncappedNational[p.id] - targetSeats[p.id];
     let allocations = [...uncappedSeats[p.id]];

     if (excess > 0) {
        // Party won more base integer seats than its national target.
        // Penalize the districts where it had the lowest fractional remainder.
        allocations.sort((a, b) => a.rem - b.rem);
        for (let i = 0; i < allocations.length; i++) {
           if (excess <= 0) break;
           if (allocations[i].seats > 0) {
              allocations[i].seats--;
              excess--;
           }
        }
     }

     currentNational[p.id] = 0;
     allocations.forEach(alloc => {
        districtSeats[alloc.distId][p.id] = alloc.seats;
        currentNational[p.id] += alloc.seats;
        districtRemainders.push({ distId: alloc.distId, partyId: p.id, rem: alloc.rem });
     });
  });

  // 4. Second/Third Distribution: Fill shortfalls globally
  const shortfalls = {};
  qParties.forEach(p => shortfalls[p.id] = targetSeats[p.id] - currentNational[p.id]);

  districtRemainders.sort((a, b) => b.rem - a.rem);

  for (const dr of districtRemainders) {
    const dSeatsAssigned = Object.values(districtSeats[dr.distId]).reduce((a, b) => a + b, 0);
    const dCapacity = districts.find(d => d.id === dr.distId).seats;
    
    if (shortfalls[dr.partyId] > 0 && dSeatsAssigned < dCapacity) {
      districtSeats[dr.distId][dr.partyId]++;
      currentNational[dr.partyId]++;
      shortfalls[dr.partyId]--;
      dr.rem = -999; // Mark used so fallback doesn't double dip
    }
  }

  // 5. Fallback: Force fill remaining empty district seats.
  //    IMPORTANT: always check the national cap (targetSeats) before awarding a seat —
  //    without this guard, parties with high district remainders steal seats from
  //    parties that legitimately need them to reach their national target.
  const unfilledDistricts = {};
  const remaindersByDist = {};
  
  districts.forEach(d => {
     remaindersByDist[d.id] = districtRemainders
        .filter(r => r.distId === d.id && r.rem !== -999)
        .sort((a, b) => b.rem - a.rem);
  });

  districts.forEach(d => {
    let dSeatsAssigned = Object.values(districtSeats[d.id]).reduce((a, b) => a + b, 0);
    const distRems = remaindersByDist[d.id];
    let remIdx = 0;

    while (dSeatsAssigned < d.seats) {
      if (remIdx < distRems.length) {
        const best = distRems[remIdx];
        remIdx++;
        // Skip this party if it has already reached its national target
        if (currentNational[best.partyId] >= targetSeats[best.partyId]) continue;
        districtSeats[d.id][best.partyId]++;
        currentNational[best.partyId]++;
        dSeatsAssigned++;
      } else {
        unfilledDistricts[d.id] = d.seats - dSeatsAssigned;
        break;
      }
    }
  });

  // 6. Assemble final results for the Table
  const results = withNational.map(p => {
    const seats = currentNational[p.id] || 0;
    return {
      ...p,
      seats,
      isWinner: false,
      finalPct: qIds.has(p.id) ? (p.nationalPct / qTotalPct) * 100 : 0,
      votes: turnout ? Math.round((p.nationalPct / 100) * turnout) : null,
    };
  }).filter(p => p.seats > 0 || qIds.has(p.id)).sort((a, b) => b.seats - a.seats);

  if (results.length > 0) results[0].isWinner = true;

  const eliminated = withNational.filter(p => p.nationalPct < thresholdPct).map(p => p.name);
  const eliminatedDetail = withNational.filter(p => p.nationalPct < thresholdPct).map(p => ({
    ...p,
    votes: turnout ? Math.round((p.nationalPct / 100) * turnout) : null,
  }));

  return { results, districtSeats, eliminated, eliminatedDetail, winnerId: results[0]?.id, unfilledDistricts };
}

export function cyPackCenteredDots(dotsArray, dotRadius = 5.5, gap = 2) {
  const count = dotsArray.length;
  if (count === 0) return [];
  const cols        = Math.ceil(Math.sqrt(count * 1.5));
  const rows        = Math.ceil(count / cols);
  const dotSize     = dotRadius * 2;
  const fullHeight  = rows * dotSize + (rows - 1) * gap;
  const positions   = [];
  let currentIdx    = 0;
  for (let r = 0; r < rows; r++) {
    const dotsInRow = Math.min(cols, count - currentIdx);
    const rowWidth  = dotsInRow * dotSize + (dotsInRow - 1) * gap;
    for (let c = 0; c < dotsInRow; c++) {
      positions.push({
        x: -rowWidth / 2 + (c * (dotSize + gap)) + dotRadius,
        y: -fullHeight / 2 + (r * (dotSize + gap)) + dotRadius,
        party: dotsArray[currentIdx],
      });
      currentIdx++;
    }
  }
  return positions;
}

export function cyFmtVotes(n) {
  if (!n && n !== 0) return "—";
  return Math.round(n).toLocaleString();
}

export function cyFmtVotesShort(n) {
  if (!n && n !== 0) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(0) + "K";
  return Math.round(n).toLocaleString();
}