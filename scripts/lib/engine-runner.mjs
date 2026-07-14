// scripts/lib/engine-runner.mjs
// Node-side replica of the GreeceApp.jsx election pipeline (GreeceApp.jsx:285-308),
// for use by scripts/ (regression checks, calibration, backtesting) that can't
// mount the React app. Mirrors that pipeline's exact call sequence — if GreeceApp.jsx
// changes shape, update this alongside it.
import {
  GR_SCENARIOS, GR_SCENARIO_TURNOUT, grDistrictsForScenario,
} from "../../src/components/GreeceSwingometer/greece-data.js";
import {
  grApplySwing, grRunElection, grAllocateAllDistrictSeats, grDistrictElectorate, grDistrictBaseVotes,
} from "../../src/components/GreeceSwingometer/greece-engine.js";
import {
  grIsPre2019Scenario, grLegacyRunElection, grLegacyAllocateAllDistrictSeats,
} from "../../src/components/GreeceSwingometer/greece-engine-pre2019.js";

// All scenarios with a fixed (non-live-poll, non-custom) national baseline —
// the deterministic set a regression/calibration/backtest run can rely on.
export const FIXED_SCENARIO_IDS = Object.keys(GR_SCENARIOS);

export function computeEffectiveParties(parties, demSliders = {}) {
  return parties.map(p => {
    const s = p.sensitivities || {};
    let d = 0;
    for (const axis in demSliders) d += ((demSliders[axis] || 0) / 10) * (s[axis] || 0);
    return { ...p, effectivePct: Math.max(0, p.userPercentage + d) };
  });
}

// Runs one scenario end to end exactly as GreeceApp.jsx does, returning the same
// { districtResults, electionResult } shape.
export function runScenario(scenarioId, { demSliders = {}, threshold = 3.0, turnoutShift = 0 } = {}) {
  const parties = GR_SCENARIOS[scenarioId];
  if (!parties) throw new Error(`Unknown scenario: ${scenarioId}`);
  const turnout = GR_SCENARIO_TURNOUT[scenarioId] ?? 0;
  const isLegacy = grIsPre2019Scenario(scenarioId);

  const effectiveParties = computeEffectiveParties(parties, demSliders);
  const baseDistrictData = grDistrictsForScenario(scenarioId)
    .map(d => ({ ...d, baseVotes: grDistrictBaseVotes(parties, d, scenarioId) }));

  const districtResults = baseDistrictData.map(d => grApplySwing(d, effectiveParties, parties, demSliders, scenarioId));
  const electionResult = isLegacy
    ? grLegacyRunElection(effectiveParties, threshold, turnout)
    : grRunElection(effectiveParties, threshold, turnout, scenarioId);

  const elect = grDistrictElectorate(scenarioId, turnoutShift, demSliders);
  districtResults.forEach(d => { if (elect[d.id] != null) d.electorate = elect[d.id]; });

  if (isLegacy) grLegacyAllocateAllDistrictSeats(districtResults, electionResult);
  else grAllocateAllDistrictSeats(districtResults, electionResult);

  return { districtResults, electionResult };
}

// Deterministic, diff-friendly projection of a scenario run — just the numbers a
// regression check or backtest cares about, with stable key ordering.
export function snapshotScenario(scenarioId, opts) {
  const { districtResults, electionResult } = runScenario(scenarioId, opts);
  const results = [...(electionResult.results || [])]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(p => ({ id: p.id, nationalPct: p.nationalPct, seats: p.seats, propSeats: p.propSeats, bonusSeats: p.bonusSeats, listSeats: p.listSeats }));
  const districts = [...districtResults]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(d => ({
      id: d.id,
      electorate: d.electorate ?? null,
      votes: Object.fromEntries(Object.entries(d.votes || {}).sort(([a], [b]) => a.localeCompare(b))),
      allocatedSeats: Object.fromEntries(Object.entries(d.allocatedSeats || {}).sort(([a], [b]) => a.localeCompare(b))),
    }));
  return { scenarioId, results, districts };
}
