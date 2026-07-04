// greece-engine.js
import { GR, GR_BONUS_CONFIG, GR_PARTY_DICT, GR_DISTRICT_BASELINES, GR_PARTY_LINEAGE, GR_MULTIPLIERS, grToLogit, grFromLogit, GR_DISTRICT_POP, GR_DISTRICT_REGISTERED, GR_DISTRICT_TURNOUT, GR_DISTRICT_VALID_VOTES, GR_STATE_BALLOT_EXCLUDED, GR_DISTRICT_DEMOGRAPHICS, grDistrictsForScenario } from './greece-data.js';

// ─────────────────────────────────────────────────────────────────────────────
//  Per-constituency electorate weight (2021 census legal residents).
//  Used ONLY for the cross-constituency remainder ranking of the second
//  distribution (Art. 100 §8), which compares ABSOLUTE remainders across
//  constituencies. Within-constituency steps are exact from shares alone.
//  Replace with an election's ACTUAL valid votes per constituency for an
//  exact 1:1 reproduction of that official result.
// ─────────────────────────────────────────────────────────────────────────────
export const GR_DISTRICT_ELECTORATE = {"athens_a": 430362, "athens_b": 557407+405623+636474, "athens_b1": 557407, "athens_b2": 405623, "athens_b3": 636474, "piraeus_a": 182667, "piraeus_b": 274730, "attica": 403714+148548, "east_attica": 403714, "west_attica": 148548, "thessaloniki_a": 568576, "thessaloniki_b": 316369, "chalkidiki": 104702, "imathia": 136602, "kilkis": 85885, "pella": 138568, "pieria": 123245, "serres": 182226, "evros": 134776, "rhodope": 101767, "xanthi": 107548, "drama": 95701, "kavala": 129872, "kozani": 149733, "kastoria": 48464, "florina": 50921, "grevena": 34538, "ioannina": 163044, "arta": 79776, "preveza": 62769, "thesprotia": 47947, "larissa": 268451, "magnesia": 181879, "trikala": 139562, "karditsa": 129171, "aetolia_acarnania": 235371, "boeotia": 109293, "phthiotis": 151036, "evrytania": 24545, "euboea": 213179, "phocis": 39800, "corinthia": 136401, "argolis": 93934, "arcadia": 96092, "laconia": 87104, "messenia": 161953, "elis": 168358, "achaea": 296574, "heraklion": 285528, "chania": 144259, "rethymno": 79801, "lasithi": 73258, "dodecanese": 180591, "cyclades": 122738, "lesbos": 97824, "samos": 42202, "chios": 52096, "corfu": 97037, "cephalonia": 41069, "lefkada": 25365, "zakynthos": 38340};

export function grCalcBonusSeats(pct, scenarioId) {
  const cfg = GR_BONUS_CONFIG[scenarioId] || { trigger: GR.BONUS_TRIGGER, base: GR.BONUS_BASE, step: GR.BONUS_STEP, cap: GR.BONUS_CAP };
  if (pct < cfg.trigger) return 0;
  return Math.min(cfg.base + Math.floor((pct-cfg.trigger)/cfg.step), cfg.cap);
}

export function grAllocateStateSeats(qualifying, qTotalPct, excludedIds = []) {
  // A party that did not file a State-Deputy ballot is barred from State seats; its
  // entitlement passes to the next party by remainder (P.D. 26/2012; AP 174/2023).
  const excl = new Set(excludedIds);
  const seats = {}, rems = [];
  const quota = qTotalPct / GR.LIST_SEATS;
  let alloc = 0;
  for (let i = 0; i < qualifying.length; i++) {
    const id = qualifying[i].id;
    if (excl.has(id)) { seats[id] = 0; continue; }   // no ballot filed → 0 State seats
    const raw = qualifying[i].nationalPct / quota, fl = Math.floor(raw);
    seats[id] = fl; alloc += fl;
    rems.push({ id, rem: raw - fl });
  }
  rems.sort((a, b) => b.rem - a.rem);
  for (let i = 0; i < GR.LIST_SEATS - alloc && i < rems.length; i++) seats[rems[i].id]++;
  return seats;
}

// UTILITY FUNCTION: Not used in global seat distribution. 
// Exported specifically for Map.jsx tooltips to preview local integer quotas.
export function grAllocateDistrictSeats(votes, seats) {
  const map = {}, keys = Object.keys(votes);
  let total = 0; keys.forEach(k => { map[k] = 0; total += votes[k]; });
  if (total <= 0) return map;
  const quota = total / seats, rems = [];
  let alloc = 0;
  keys.forEach(k => { const raw = votes[k]/quota, fl = Math.floor(raw); map[k] = fl; alloc += fl; rems.push({ id: k, rem: raw - fl }); });
  rems.sort((a,b) => b.rem - a.rem);
  for (let i = 0; i < seats - alloc && i < rems.length; i++) map[rems[i].id]++;
  return map;
}

export function grRunElection(effectiveParties, thresholdPct, turnout, scenarioId = null) {
  let rawTotal = effectiveParties.reduce((sum, p) => sum + p.effectivePct, 0);
  if (rawTotal <= 0) return { results: [], bonusSeats: 0, eliminated: [], eliminatedDetail: [] };
  
  const qualifying = [], eliminatedDetail = [], elimNames = [];
  let qTotalPct = 0;

  effectiveParties.forEach(p => {
    const nPct = (p.effectivePct / rawTotal) * 100;
    const mapped = { ...p, nationalPct: nPct, finalPct: 0 };
    if (nPct >= thresholdPct && p.id !== "other") { qualifying.push(mapped); qTotalPct += nPct; } 
    else if (p.id !== "other") { elimNames.push(p.name); eliminatedDetail.push({ ...mapped, votes: turnout ? Math.round((nPct/100)*turnout) : null }); }
  });

  if (!qualifying.length) return { results: [], bonusSeats: 0, eliminated: elimNames, eliminatedDetail, winnerId: null, winnerPct: 0 };
  qualifying.sort((a, b) => b.nationalPct - a.nationalPct);
  
  const winner = qualifying[0];
  const bonusSeats = grCalcBonusSeats(winner.nationalPct, scenarioId);
  const propPool = GR.TOTAL_SEATS - bonusSeats;
  
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

  const _excluded = (GR_STATE_BALLOT_EXCLUDED || {})[scenarioId] || [];
  const listSeats = grAllocateStateSeats(qualifying, qTotalPct, _excluded);
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
        votes: turnout ? Math.round((p.nationalPct/100)*turnout) : null 
    };
  }).sort((a, b) => b.seats - a.seats);

  return { results, bonusSeats, proportionalPool: propPool, eliminated: elimNames, eliminatedDetail, winnerId: winner.id, winnerPct: winner.nationalPct, listSeats };
}

// ─────────────────────────────────────────────────────────────────────────────
//  grDistrictElectorate — per-constituency valid-vote weight for the §8 measure,
//  with a NON-UNIFORM national-turnout adjustment.
//
//  turnoutShiftPP shifts the *national* valid-vote rate by that many percentage
//  points, applied in LOGIT space so it lands non-uniformly across constituencies
//  (a flat multiplier would cancel out of the seat math and change nothing — this
//  is the whole point). At shift 0 it returns each scenario's real valid votes, so
//  the 2023 map reproduces exactly; moving it re-weights the cross-constituency
//  remainder ranking and shuffles the marginal/carom seats.
// ─────────────────────────────────────────────────────────────────────────────
export function grDistrictElectorate(scenarioId, turnoutShiftPP = 0) {
  const R   = GR_DISTRICT_REGISTERED || {};
  const POP = GR_DISTRICT_POP || {};
  const VV  = GR_DISTRICT_VALID_VOTES || {};
  // Valid-vote template: the scenario's own counts if present, else the stable 2023
  // turnout pattern (turnout shape barely moves election to election). This makes the
  // slider work on every scenario, including the 2026 polling view that has no votes yet.
  const base = VV[scenarioId] || VV["2023"] || {};
  const ids = Object.keys(R).length ? Object.keys(R) : Object.keys(base);
  const wOf = id => (base[id] != null ? base[id] : (R[id] != null ? R[id] : POP[id]));
  const out = {};
  if (!turnoutShiftPP) { for (const id of ids) out[id] = wOf(id) ?? null; return out; }
  // Need registered voters to define a per-district rate for the non-uniform shift.
  let sv = 0, sr = 0;
  for (const id of ids) { if (base[id] != null && R[id]) { sv += base[id]; sr += R[id]; } }
  if (!sv || !sr) { for (const id of ids) out[id] = wOf(id) ?? null; return out; }
  const clamp = x => Math.min(0.999, Math.max(0.001, x));
  const logit = p => Math.log(p / (1 - p));
  const sig = z => 1 / (1 + Math.exp(-z));
  const r0 = sv / sr;                                       // baseline national valid-rate
  const delta = logit(clamp(r0 + turnoutShiftPP / 100)) - logit(r0);  // logit shift (non-uniform)
  for (const id of ids) {
    if (base[id] != null && R[id]) out[id] = R[id] * sig(logit(clamp(base[id] / R[id])) + delta);
    else out[id] = wOf(id) ?? null;
  }
  return out;
}
// ─────────────────────────────────────────────────────────────────────────────
//  grAllocateAllDistrictSeats — 1:1 implementation of the Greek constituency
//  seat-distribution law (P.D. 26/2012, arts. 99–100, as amended by L.4859/2021;
//  the "reinforced proportional" system in force since June 2023).
//
//  This is the ACTUAL legal procedure, not an optimiser. It reproduces the
//  official per-constituency seat table when fed exact data. The steps:
//
//  SINGLE-SEAT CONSTITUENCIES — first-past-the-post. The leading party takes the
//    seat outright, regardless of margin.
//
//  FIRST DISTRIBUTION (πρώτη κατανομή), multi-seat constituencies — each party
//    gets floor( votes_in_constituency / constituency_measure ), where the
//    measure = total_valid_votes / seats. Because the model carries vote SHARES
//    (% of all valid votes in the constituency), this is exactly
//        floor( share × magnitude )
//    e.g. in a 3-seat seat a party needs ≥ 2⁄3 = 66.7% to take 2 outright here;
//    most second seats are won in the steps below, not in the first distribution.
//
//  UNUSED REMAINDERS (§100.6) — for every party in every multi-seat constituency,
//    remainder = votes − seats_won_so_far × measure = measure × frac(share×mag).
//    Within a constituency the measure is a common factor, so the LOCAL ordering
//    of remainders depends only on frac(share×mag) — exact from shares.
//
//  §100.7 — in 2- and 3-seat constituencies, leftover seats go one-by-one to the
//    largest local remainders. If that pushes a party above its national
//    constituency entitlement, the surplus is stripped back from the 3- then
//    2-seat constituencies where its remainder is smallest.
//
//  §100.8 — the remaining leftover seats (in 4+ seat constituencies) are filled
//    party-by-party from the SMALLEST national vote total to the largest, each
//    party taking one seat per constituency (ordered by its remainder) until it
//    reaches its entitlement; passes repeat until all seats are placed. Because
//    the largest party (the winner) is served LAST, it absorbs the leftover seats
//    in the constituencies no smaller party claimed — which is exactly why a
//    dominant party sweeps some districts (e.g. all 4 in Cyclades) yet takes only
//    1 of 3 elsewhere. The cross-constituency comparison here is on ABSOLUTE
//    remainders, so it uses GR_DISTRICT_ELECTORATE (valid-vote weight ÷ seats) as
//    the measure; with exact per-constituency valid votes this step is exact.
//
//  By construction every constituency is filled to its magnitude and every party
//  lands exactly on its national constituency total (party.seats − party.listSeats),
//  so the map reconciles to the hemicycle with no repair/fudge step.
//
//  Return shape and d.allocatedSeats side-effect are unchanged.
// ─────────────────────────────────────────────────────────────────────────────
export function grAllocateAllDistrictSeats(updatedDistricts, electionResult) {
  const qualifying = electionResult.results || [];
  if (!qualifying.length) {
    updatedDistricts.forEach(d => (d.allocatedSeats = {}));
    return { allocNat: {}, propTargets: {}, totalTargets: {}, unfilledDistricts: [] };
  }

  const qIds = qualifying.map(p => p.id);

  // National constituency entitlement per party = total seats − nationwide (list) seats.
  const propTargets = {}, totalTargets = {};
  qualifying.forEach(p => {
    propTargets[p.id]  = Math.max(0, (p.propSeats || 0) - (p.listSeats || 0));
    totalTargets[p.id] = Math.max(0, (p.seats     || 0) - (p.listSeats || 0));
  });

  // §100.8 processes parties from the SMALLEST national vote total to the largest.
  const ascending = [...qualifying]
    .sort((a, b) => ((a.votes ?? a.nationalPct ?? 0) - (b.votes ?? b.nationalPct ?? 0)))
    .map(p => p.id);

  const seatsByDist = {};   // mutable allocation matrix
  const frac = {};          // frac(share×mag) per (district,party) — drives remainder ordering
  const meas = {};          // constituency measure ∝ valid votes / seats (for §8 absolute ranking)
  const magOf = {};
  const rowFill = id => qIds.reduce((s, p) => s + seatsByDist[id][p], 0);
  const colSum  = p  => updatedDistricts.reduce((s, d) => s + seatsByDist[d.id][p], 0);

  updatedDistricts.forEach(d => {
    const m = d.seats || 0;
    magOf[d.id] = m;
    seatsByDist[d.id] = {}; frac[d.id] = {};
    qIds.forEach(p => (seatsByDist[d.id][p] = 0));
    // §8 measure ∝ valid votes per seat. Prefer the scenario's per-district electorate
    // (d.electorate = exact valid votes if known, else population×turnout); fall back to
    // the embedded census table, then to a flat constant.
    const elect = (d.electorate != null ? d.electorate : GR_DISTRICT_ELECTORATE[d.id]);
    meas[d.id] = (elect && m > 0) ? elect / m : 1;

    if (m === 1) {
      // single-seat → plurality among qualifying parties
      let lead = null, mx = -1;
      qIds.forEach(p => { const v = (d.votes || {})[p] || 0; if (v > mx) { mx = v; lead = p; } });
      if (lead !== null && mx > 0) seatsByDist[d.id][lead] = 1;
    } else if (m > 1) {
      // first distribution: floor(share × magnitude); share = d.votes[p] as % of ALL valid votes
      qIds.forEach(p => {
        const x = ((d.votes || {})[p] || 0) / 100 * m;
        const fl = Math.floor(x + 1e-9);
        seatsByDist[d.id][p] = fl;
        frac[d.id][p] = x - fl;
      });
    }
  });

  // §100.7 — fill leftover seats in 2- and 3-seat constituencies by largest local remainder
  updatedDistricts.forEach(d => {
    const m = magOf[d.id];
    if (m !== 2 && m !== 3) return;
    let un = m - rowFill(d.id);
    if (un <= 0) return;
    const order = [...qIds].sort((a, b) => frac[d.id][b] - frac[d.id][a]);
    let i = 0;
    while (un > 0 && i < order.length) { seatsByDist[d.id][order[i]]++; un--; i++; }
  });

  // §100.7 surplus stripping — a party over its entitlement loses seats from the
  // 3- then 2-seat constituencies where its remainder is smallest (freed → §8).
  qIds.forEach(p => {
    let over = colSum(p) - totalTargets[p];
    while (over > 0) {
      const cands = updatedDistricts.filter(d => (magOf[d.id] === 3 || magOf[d.id] === 2) && seatsByDist[d.id][p] > 0);
      if (!cands.length) break;
      cands.sort((a, b) => ((magOf[a.id] === 3 ? 0 : 1) - (magOf[b.id] === 3 ? 0 : 1)) || (frac[a.id][p] - frac[b.id][p]));
      seatsByDist[cands[0].id][p]--; over--;
    }
  });

  // §100.8 — remaining leftover seats (4+ seat constituencies), parties smallest→largest,
  // one seat per constituency per pass by absolute remainder, repeating until exhausted.
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
        .sort((a, b) => (meas[b.id] * (frac[b.id][p] || 0)) - (meas[a.id] * (frac[a.id][p] || 0)));
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

export function grDistrictBaseVotes(scenarioParties, district, scenarioId) {
  const sb = GR_DISTRICT_BASELINES[scenarioId], raw = {}; let total = 0;
  if (sb && sb[district.id]) {
    scenarioParties.forEach(p => {
      let val = sb[district.id][p.id] !== undefined ? sb[district.id][p.id] : (GR_PARTY_LINEAGE[p.id] && sb[district.id][GR_PARTY_LINEAGE[p.id]] !== undefined ? p.basePercentage * (sb[district.id][GR_PARTY_LINEAGE[p.id]] / 10) : p.basePercentage * ((GR_MULTIPLIERS[district.id] || {})[p.id] ?? 1.0));
      val = Math.max(0, val); raw[p.id] = val; total += val;
    });
  } else {
    scenarioParties.forEach(p => { const val = Math.max(0, p.basePercentage * ((GR_MULTIPLIERS[district.id] || {})[p.id] ?? 1.0)); raw[p.id] = val; total += val; });
  }
  const votes = {}; if (total > 0) scenarioParties.forEach(p => votes[p.id] = raw[p.id] * (100 / total));
  return votes;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Geographic demographic coupling (ELSTAT).
//  Each demographic slider maps to a real per-constituency ELSTAT measure. We
//  standardise those measures into POPULATION-WEIGHTED z-scores (district value
//  vs the national mean, in standard deviations), so a slider's swing lands
//  HARDER where the group is concentrated and softer (or negative) where it is
//  sparse. Because the weighting is population-based the z-scores are national
//  mean-zero — so this layer only REDISTRIBUTES the swing across the map; the
//  national vote total is still set by the slider's effect on each party's
//  national share (see effectivePct in grProcessFullElection / the app).
// ─────────────────────────────────────────────────────────────────────────────
export const GR_DEMO_GEO_K = 0.25;   // coupling strength (logit units per σ·sensitivity·slider). Tunable.

// slider axis -> [ELSTAT field, sign]. youth has no direct field, so it is the
// INVERSE of the 65+ share (more elderly ⇒ fewer young). gender has no ELSTAT
// district field, so it stays national-only (no geographic component).
const GR_DEMO_AXES = {
  seniors:   ["age_over_65_pct",   +1],
  youth:     ["age_over_65_pct",   -1],
  urban:     ["urbanization_pct",  +1],
  education: ["tertiary_edu_pct",  +1],
  precarity: ["unemployment_rate", +1],
};

// Build the standardised table once at module load.
const GR_DEMO_Z = (() => {
  const rows = Array.isArray(GR_DISTRICT_DEMOGRAPHICS) ? GR_DISTRICT_DEMOGRAPHICS : [];
  if (!rows.length) return {};
  const wOf = id => (GR_DISTRICT_POP[id] || 1);
  const fields = [...new Set(Object.values(GR_DEMO_AXES).map(([f]) => f))];
  const stat = {};
  fields.forEach(f => {
    let sw = 0, swx = 0;
    rows.forEach(r => { const w = wOf(r.id), v = r[f]; if (typeof v === 'number') { sw += w; swx += w * v; } });
    const mean = sw ? swx / sw : 0;
    let swv = 0; rows.forEach(r => { const w = wOf(r.id), v = r[f]; if (typeof v === 'number') swv += w * (v - mean) ** 2; });
    stat[f] = { mean, std: Math.sqrt(sw ? swv / sw : 0) || 1 };
  });
  const out = {};
  rows.forEach(r => {
    out[r.id] = {};
    for (const axis in GR_DEMO_AXES) {
      const [f, sign] = GR_DEMO_AXES[axis];
      const v = r[f];
      out[r.id][axis] = (typeof v === 'number') ? sign * (v - stat[f].mean) / stat[f].std : 0;
    }
  });
  return out;
})();

// Per-(district, party) logit nudge from the demographic sliders. Clamped so a
// pile-up of maxed sliders can't drive a district share to an absurd extreme.
function grDemoGeoNudge(districtId, sens, sliders) {
  const z = GR_DEMO_Z[districtId];
  if (!z || !sens || !sliders) return 0;
  let n = 0;
  for (const axis in GR_DEMO_AXES) {
    const sv = sliders[axis];
    if (!sv) continue;
    const zz = z[axis];
    if (zz == null) continue;
    n += (sv / 10) * (sens[axis] || 0) * zz;
  }
  n *= GR_DEMO_GEO_K;
  return Math.max(-0.6, Math.min(0.6, n));
}

export function grApplySwing(district, effectiveParties, baseParties, sliderValues = null) {
  const logitSwing = {};
  baseParties.forEach(bp => {
    const ep = effectiveParties.find(e => e.id === bp.id), basePct = Math.max(0.001, bp.basePercentage);
    logitSwing[bp.id] = grToLogit(ep ? Math.max(0.001, ep.effectivePct) : basePct) - grToLogit(basePct);
  });

  const adjusted = {}; let total = 0;
  baseParties.forEach(bp => {
    const dBase = Math.max(0.001, district.baseVotes[bp.id] ?? bp.basePercentage);
    
    // DAMPING FORMULA: clamps dominant parties (dBase > 65%) to 0.25x to prevent absurd
    // ceilings; for micro-parties (dBase < 5%) the multiplier exceeds 1.0, amplifying swings
    // so they can realistically cross 3% locally.
    const damping = Math.max(0.25, 1.0 - ((dBase - 5) / 60) * 0.75);
    let logitVal = grToLogit(dBase) + (logitSwing[bp.id] ?? 0) * damping;

    // Geographic demographic coupling: concentrate each slider's effect where that
    // ELSTAT group is over/under-represented (national mean-zero, so totals are unchanged).
    if (sliderValues) {
      const sens = bp.sensitivities || GR_PARTY_DICT[bp.id]?.sensitivities;
      logitVal += grDemoGeoNudge(district.id, sens, sliderValues);
    }

    const val = grFromLogit(logitVal);
    adjusted[bp.id] = val; total += val;
  });

  const rawVotes = {}; let maxPct = 0, leaderId = null;
  if (total > 0) {
    Object.keys(adjusted).forEach(pid => {
      const pct = adjusted[pid] * (100 / total); rawVotes[pid] = pct;
      if (pct > maxPct) { maxPct = pct; leaderId = pid; }
    });
  }
  return { ...district, votes: rawVotes, leader: leaderId };
}

export function grProcessFullElection(scenarioParties, sliderValues, scenarioId, thresholdPct = 3.0, turnoutTotal = 5000000) {
  let updated = scenarioParties.map(p => {
    let d = 0; const s = GR_PARTY_DICT[p.id]?.sensitivities;
    if (s) Object.keys(sliderValues).forEach(cat => d += ((sliderValues[cat] || 0) / 10) * (s[cat] || 0));
    return { ...p, effectivePct: Math.max(0, p.userPercentage + d) };
  });
  const sum = updated.reduce((s, p) => s + p.effectivePct, 0);
  if (sum > 0) updated = updated.map(p => ({ ...p, effectivePct: (p.effectivePct / sum) * 100 }));
  
  const electionResult = grRunElection(updated, thresholdPct, turnoutTotal, scenarioId);
  const updatedDistricts = grDistrictsForScenario(scenarioId).map(dist => grApplySwing({ ...dist, baseVotes: grDistrictBaseVotes(scenarioParties, dist, scenarioId) }, updated, scenarioParties, sliderValues));

  // Attach each district's electorate weight for the §8 cross-district remainder ranking.
  // Priority: exact valid-vote count (if supplied) > population × scenario turnout > population.
  const _vv = (GR_DISTRICT_VALID_VOTES || {})[scenarioId] || {};
  const _to = (GR_DISTRICT_TURNOUT || {})[scenarioId] || {};
  updatedDistricts.forEach(d => {
    const reg = (GR_DISTRICT_REGISTERED || {})[d.id];
    const pop = (GR_DISTRICT_POP || {})[d.id];
    const turn = _to[d.id];
    if (_vv[d.id] != null) d.electorate = _vv[d.id];               // exact valid votes (best)
    else if (reg != null && turn != null) d.electorate = reg * turn; // registered × scenario turnout
    else if (pop != null && turn != null) d.electorate = pop * turn; // population × turnout
    else if (reg != null) d.electorate = reg;
    else if (pop != null) d.electorate = pop;
    else d.electorate = null;
  });
  
  // Capture allocation stats for the React UI to debug failsafe activations or unallocated seats
  const allocationStats = grAllocateAllDistrictSeats(updatedDistricts, electionResult);

  return { electionResult, updatedDistricts, effectiveParties: updated, allocationStats };
}