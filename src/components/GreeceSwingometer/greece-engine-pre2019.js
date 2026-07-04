// greece-engine-pre2019.js
//
// Pre-2019 Greek parliamentary seat-allocation engine — the "ενισχυμένη αναλογική"
// system with a FLAT 50-seat majority bonus, codified in Π.Δ. 26/2012 arts. 99-100
// (itself carrying forward Π.Δ. 96/2007 and ν.3636/2008 essentially unchanged). This
// was the law in force for every Greek legislative election from 2007 through July
// 2019 inclusive — 2007, 2009, May 2012, June 2012, January 2015, September 2015 and
// July 2019 were all fought under it. (The 2016 attempt to abolish the bonus never
// took effect: under Art. 54 §1 of the Constitution a non-supermajority electoral-law
// change only applies from the SECOND election after enactment, so it was due to bite
// in 2023 — but a new law in 2020 replaced it first with the sliding bonus, which is
// what greece-engine.js's grRunElection models for the "2023"/"2026" scenarios.)
//
// Two things distinguish this era from the modern ("in force since June 2023") engine:
//
//   1. THE BONUS IS FLAT, NOT SLIDING. Whichever party leads among those clearing the
//      3% threshold gets exactly 50 bonus seats regardless of its actual share (Art.
//      99 §§1-2, pre-2021 text). There is no 20-seats-at-25%-ramping-to-50-at-40%
//      formula — that only starts with the June 2023 election (L.4839/2021).
//   2. THERE WERE 12 STATE (Επικρατείας) DEPUTIES. greece-engine.js uses a single
//      app-wide GR.LIST_SEATS constant of 15 for every scenario as a simplification;
//      this module uses the historically correct 12 (Art. 99 §1). Note this only
//      changes the STATE/CONSTITUENCY split shown in the results table, never a
//      party's total seat count — see grLegacyRunElection below.
//
// What did NOT change: the constituency-level remainder mechanics of Art. 100 §§4-8
// (first distribution by Hare quota — valid votes ÷ seats, not the "+1" Hagenbach-
// Bischoff divisor used in local-council elections; then the local largest-remainder
// fill for 2-/3-seat constituencies with over-allocation stripped back; then the
// national ascending-by-vote-total fill for 4+-seat constituencies) is, verbatim, the
// same text (Π.Δ. 96/2007 / ν.3636/2008) that greece-engine.js's
// grAllocateAllDistrictSeats already implements for the modern 59-constituency map —
// confirmed against the current Art. 100 text (lawspot.gr). This module re-implements
// that same procedure independently — rather than importing greece-engine.js's logic —
// so the pre-2019 path can never be perturbed by a future change to the post-2023
// engine, and carries its own historically-accurate constants (50/12 above).
//
// VERIFICATION — both 2015 elections reproduce the official outcome EXACTLY, at both
// levels, when run on their scenarios' official data:
//   · national: Sept — SYRIZA 145, ND 75, GD 18, PASOK 17, KKE 15, Potami 11, ANEL 10,
//     EK 9; Jan — SYRIZA 149, ND 76, GD 17, Potami 17, KKE 15, ANEL 13, PASOK 13; and
//     the 12 State seats (Sept: SYRIZA 5, ND 4, GD 1, PASOK 1, KKE 1; Jan: SYRIZA 5,
//     ND 4, GD 1, Potami 1, KKE 1).
//   · per constituency: all 56 districts match the actual seats-by-party table in BOTH
//     elections (cross-checked against the elected-MP lists of the 16th and 17th
//     parliamentary terms), including the subtle cases — SYRIZA's 4/4 sweep of Chania,
//     ND keeping quota seats in Argolis/Arcadia/Laconia while forfeiting its §7
//     pickups in Corfu/Xanthi/Rhodope (Sept), etc.
//
// District-level data is EXACT for both 2015 scenarios: per-constituency party votes
// and valid-vote totals were harvested from the official ypes.gr polling-station
// archives (apotelesmata_09_2015 / archeia-...-ianoyarioy-2015) and reconcile with the
// official national results to the single vote (Sept: 5,433,376 valid; Jan: 6,180,872).
// Together with the real Π.Δ. 4/2013 seat apportionment (288 constituency seats) in
// GR_RAW_DISTRICTS_2015, the allocator below therefore runs the statutory procedure on
// the statute's own inputs.

import { GR_DISTRICT_ELECTORATE } from './greece-engine.js';

export const GR_LEGACY = {
  TOTAL_SEATS: 300,
  STATE_SEATS: 12,   // βουλευτές Επικρατείας (Art. 99 §1, pre-2021 text)
  BONUS_SEATS: 50,   // flat, unconditional "ενίσχυση" (Art. 99 §2, pre-2021 text)
};

// Scenario ids in this app are election years ("2015", "2019", "2023", ...). Any
// scenario dated before July 2019 belongs to this engine — a plain year check means a
// future earlier scenario (e.g. "2012") is covered automatically without touching
// either engine file again.
export function grIsPre2019Scenario(scenarioId) {
  const year = parseInt(scenarioId, 10);
  return Number.isFinite(year) && year < 2019;
}

// Art. 99 §1: quota = (valid ballots of qualifying formations) / 12, then largest
// remainder. Structurally identical to grAllocateStateSeats in greece-engine.js, just
// with the historically correct divisor of 12 instead of the app's global 15.
export function grLegacyAllocateStateSeats(qualifying, qTotalPct) {
  const seats = {}, rems = [];
  const quota = qTotalPct / GR_LEGACY.STATE_SEATS;
  let alloc = 0;
  qualifying.forEach(p => {
    const raw = p.nationalPct / quota, fl = Math.floor(raw);
    seats[p.id] = fl; alloc += fl;
    rems.push({ id: p.id, rem: raw - fl });
  });
  rems.sort((a, b) => b.rem - a.rem);
  for (let i = 0; i < GR_LEGACY.STATE_SEATS - alloc && i < rems.length; i++) seats[rems[i].id]++;
  return seats;
}

export function grLegacyRunElection(effectiveParties, thresholdPct, turnout) {
  let rawTotal = effectiveParties.reduce((sum, p) => sum + p.effectivePct, 0);
  if (rawTotal <= 0) return { results: [], bonusSeats: 0, eliminated: [], eliminatedDetail: [] };

  const qualifying = [], eliminatedDetail = [], elimNames = [];
  let qTotalPct = 0;

  effectiveParties.forEach(p => {
    const nPct = (p.effectivePct / rawTotal) * 100;
    const mapped = { ...p, nationalPct: nPct, finalPct: 0 };
    if (nPct >= thresholdPct && p.id !== "other") { qualifying.push(mapped); qTotalPct += nPct; }
    else if (p.id !== "other") { elimNames.push(p.name); eliminatedDetail.push({ ...mapped, votes: turnout ? Math.round((nPct / 100) * turnout) : null }); }
  });

  if (!qualifying.length) return { results: [], bonusSeats: 0, eliminated: elimNames, eliminatedDetail, winnerId: null, winnerPct: 0 };
  qualifying.sort((a, b) => b.nationalPct - a.nationalPct);

  // Art. 99 §2 (pre-2021): the plurality winner among qualifying formations gets a
  // flat, unconditional 50-seat bonus — no sliding scale.
  const winner = qualifying[0];
  const bonusSeats = GR_LEGACY.BONUS_SEATS;
  const propPool = GR_LEGACY.TOTAL_SEATS - bonusSeats; // 250, split later into 12 state + 238 constituency

  let alloc = 0; const propRems = [];
  qualifying.forEach(p => {
    p.finalPct = (p.nationalPct / qTotalPct) * 100;
    p.rawSeats = (p.nationalPct / qTotalPct) * propPool;
    p.propSeats = Math.floor(p.rawSeats);
    alloc += p.propSeats;
    propRems.push({ party: p, rem: p.rawSeats - p.propSeats });
  });

  propRems.sort((a, b) => b.rem - a.rem);
  for (let i = 0; i < propPool - alloc; i++) if (propRems[i]) propRems[i].party.propSeats++;

  const listSeats = grLegacyAllocateStateSeats(qualifying, qTotalPct);
  const results = qualifying.map(p => {
    const isWinner = p.id === winner.id;
    const tSeats = p.propSeats + (isWinner ? bonusSeats : 0);
    return {
      ...p,
      seats: tSeats,
      propSeats: p.propSeats,
      bonusSeats: isWinner ? bonusSeats : 0,
      listSeats: listSeats[p.id] || 0,
      isWinner,
      votes: turnout ? Math.round((p.nationalPct / 100) * turnout) : null
    };
  }).sort((a, b) => b.seats - a.seats);

  return { results, bonusSeats, proportionalPool: propPool, eliminated: elimNames, eliminatedDetail, winnerId: winner.id, winnerPct: winner.nationalPct, listSeats };
}

// Art. 100 §§4-8 — same text (Π.Δ. 96/2007 / ν.3636/2008) as the "in force since June
// 2023" version greece-engine.js implements; only the inputs differ (12 state seats
// baked into electionResult.listSeats above, and the 56-constituency 2015 map supplied
// by the caller via grDistrictsForScenario).
//
// Unlike the modern engine's share-based formulation, this works on ABSOLUTE votes
// exactly as the statute is written, because both 2015 scenarios carry exact official
// per-constituency valid-vote counts (GR_DISTRICT_VALID_VOTES, harvested from the
// ypes.gr polling-station archives): the §4 constituency measure is the INTEGER part
// of valid votes ÷ seats, first-distribution seats are floor(party votes ÷ measure),
// and the §§6-8 unused remainders are integer vote counts — so remainder orderings
// (local for §7, cross-constituency for §8) are the law's own, not a share-scaled
// approximation. When a district carries no electorate weight the math degrades
// gracefully to the share×magnitude formulation (identical orderings, unit scale).
export function grLegacyAllocateAllDistrictSeats(updatedDistricts, electionResult) {
  const qualifying = electionResult.results || [];
  if (!qualifying.length) {
    updatedDistricts.forEach(d => (d.allocatedSeats = {}));
    return { allocNat: {}, propTargets: {}, totalTargets: {}, unfilledDistricts: [] };
  }

  const qIds = qualifying.map(p => p.id);

  // National constituency entitlement per party = total seats − state (list) seats.
  const propTargets = {}, totalTargets = {};
  qualifying.forEach(p => {
    propTargets[p.id] = Math.max(0, (p.propSeats || 0) - (p.listSeats || 0));
    totalTargets[p.id] = Math.max(0, (p.seats || 0) - (p.listSeats || 0));
  });

  // §100.8 processes parties from the SMALLEST national vote total to the largest.
  const ascending = [...qualifying]
    .sort((a, b) => ((a.votes ?? a.nationalPct ?? 0) - (b.votes ?? b.nationalPct ?? 0)))
    .map(p => p.id);

  const seatsByDist = {};   // mutable allocation matrix
  const rem = {};           // §100.6 unused remainder per (district,party), in votes
  const magOf = {};
  const rowFill = id => qIds.reduce((s, p) => s + seatsByDist[id][p], 0);
  const colSum = p => updatedDistricts.reduce((s, d) => s + seatsByDist[d.id][p], 0);

  updatedDistricts.forEach(d => {
    const m = d.seats || 0;
    magOf[d.id] = m;
    seatsByDist[d.id] = {}; rem[d.id] = {};
    qIds.forEach(p => { seatsByDist[d.id][p] = 0; rem[d.id][p] = 0; });
    const valid = (d.electorate != null ? d.electorate : GR_DISTRICT_ELECTORATE[d.id]) || 0;

    if (m === 1) {
      // single-seat → plurality among qualifying parties (no remainders carried to §8)
      let lead = null, mx = -1;
      qIds.forEach(p => { const v = (d.votes || {})[p] || 0; if (v > mx) { mx = v; lead = p; } });
      if (lead !== null && mx > 0) seatsByDist[d.id][lead] = 1;
    } else if (m > 1 && valid > 0) {
      // §100.4 first distribution on absolute votes: measure = ⌊valid ÷ seats⌋,
      // seats = ⌊votes ÷ measure⌋; §100.6 remainder = votes − seats×measure.
      const measure = Math.floor(valid / m);
      qIds.forEach(p => {
        const votes = Math.round(((d.votes || {})[p] || 0) / 100 * valid);
        const fl = measure > 0 ? Math.floor(votes / measure) : 0;
        seatsByDist[d.id][p] = fl;
        rem[d.id][p] = votes - fl * measure;
      });
    } else if (m > 1) {
      // no electorate data → same procedure on shares (measure ≡ 100/m, unit scale)
      qIds.forEach(p => {
        const x = ((d.votes || {})[p] || 0) / 100 * m;
        const fl = Math.floor(x + 1e-9);
        seatsByDist[d.id][p] = fl;
        rem[d.id][p] = x - fl;
      });
    }
  });

  // §100.7 first sentence — every leftover seat of a 2- or 3-seat constituency goes
  // to the largest unused LOCAL remainder (no entitlement check at this stage; a
  // remainder yields at most one seat and is then used up).
  const sevenAwards = [];   // §7-awarded seats, remembered for the strip below
  updatedDistricts.forEach(d => {
    const m = magOf[d.id];
    if (m !== 2 && m !== 3) return;
    let un = m - rowFill(d.id);
    while (un > 0) {
      let bp = null;
      qIds.forEach(p => { if (rem[d.id][p] > (bp !== null ? rem[d.id][bp] : -1)) bp = p; });
      if (bp === null) break;
      seatsByDist[d.id][bp]++;
      sevenAwards.push({ d: d.id, p: bp, rem: rem[d.id][bp], mag: m });
      rem[d.id][bp] = 0;
      un--;
    }
  });

  // §100.7 second sentence — a formation now over its national entitlement loses the
  // surplus "από τις τριεδρικές περιφέρειες και αν υπάρξει ανάγκη από τις διεδρικές,
  // στις οποίες ο συνδυασμός αυτός κατέλαβε έδρα, σύμφωνα με το προηγούμενο εδάφιο":
  // ONLY seats won in the §7 fill above are strippable (never first-distribution
  // quota seats), 3-seat constituencies before 2-seat ones, smallest remainder first.
  // The freed seats stay unallocated and fall through to §8. Getting this pool right
  // is what reproduces the official September 2015 map: ND keeps its quota seats in
  // Argolis/Arcadia/Laconia and instead forfeits its §7 pickups in
  // Corfu/Xanthi/Rhodope, whose final seats then reach SYRIZA via §8.
  qIds.forEach(p => {
    let over = colSum(p) - totalTargets[p];
    if (over <= 0) return;
    const mine = sevenAwards.filter(a => a.p === p)
      .sort((a, b) => ((a.mag === 3 ? 0 : 1) - (b.mag === 3 ? 0 : 1)) || (a.rem - b.rem));
    for (const a of mine) { if (over <= 0) break; seatsByDist[a.d][p]--; over--; }
  });

  // §100.8 — remaining leftover seats, parties smallest→largest by national votes,
  // each taking one seat per constituency ranked by its absolute unused remainder,
  // repeating passes until every seat is placed.
  const GUARD = updatedDistricts.length * qIds.length + 80;
  for (let pass = 0; pass < GUARD; pass++) {
    const unleft = updatedDistricts.reduce((s, d) => s + (magOf[d.id] - rowFill(d.id)), 0);
    if (unleft <= 0) break;
    let progress = false;
    for (const p of ascending) {
      let owed = totalTargets[p] - colSum(p);
      if (owed <= 0) continue;
      const dl = updatedDistricts
        .filter(d => (magOf[d.id] - rowFill(d.id)) > 0)
        .sort((a, b) => (rem[b.id][p] || 0) - (rem[a.id][p] || 0));
      for (const d of dl) {
        if (owed <= 0) break;
        if ((magOf[d.id] - rowFill(d.id)) > 0) { seatsByDist[d.id][p]++; owed--; progress = true; }
      }
    }
    if (!progress) break;
  }

  // write back & national tally
  const allocNat = {}; qIds.forEach(p => (allocNat[p] = 0));
  updatedDistricts.forEach(d => {
    d.allocatedSeats = {};
    qIds.forEach(p => { const s = seatsByDist[d.id][p]; d.allocatedSeats[p] = s; allocNat[p] += s; });
  });
  const unfilledDistricts = updatedDistricts
    .filter(d => (d.seats || 0) > qIds.reduce((a, p) => a + d.allocatedSeats[p], 0))
    .map(d => d.id);

  return { allocNat, propTargets, totalTargets, unfilledDistricts };
}
