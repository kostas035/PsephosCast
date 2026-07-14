// scripts/check-demographics.mjs
// Correctness checks for greece-demographics.js (Upgrade 1):
//  1. grDemoZForScenario is population-weighted mean-zero per axis, per scenario.
//  2. gdp_pc / unemployment_rate actually vary by scenario year (the whole point of
//     replacing the frozen snapshot) — a smoke test that catches an accidental
//     no-op refactor.
import { grDemoZForScenario, grDemographicsForScenario, grDemoWeightForYear, GR_DEMO_AXES, SCENARIO_REFERENCE_YEAR } from "../src/components/GreeceSwingometer/greece-demographics.js";
import { grDistrictsForScenario } from "../src/components/GreeceSwingometer/greece-data.js";
import { FIXED_SCENARIO_IDS } from "./lib/engine-runner.mjs";

const EPS = 1e-9;
let failures = 0;

for (const scenarioId of FIXED_SCENARIO_IDS) {
  const z = grDemoZForScenario(scenarioId);
  const year = SCENARIO_REFERENCE_YEAR[scenarioId] ?? 2026;
  const ids = grDistrictsForScenario(scenarioId).map(d => d.id).filter(id => z[id]);
  const wOf = id => grDemoWeightForYear(id, year);

  for (const axis in GR_DEMO_AXES) {
    let sw = 0, swz = 0;
    ids.forEach(id => { const w = wOf(id); sw += w; swz += w * z[id][axis]; });
    const meanZ = sw ? swz / sw : 0;
    if (Math.abs(meanZ) >= EPS) {
      failures++;
      console.error(`FAIL: scenario "${scenarioId}" axis "${axis}" population-weighted mean z = ${meanZ} (want |x| < ${EPS})`);
    }
  }
}
if (!failures) console.log(`OK — population-weighted mean-zero holds for all ${FIXED_SCENARIO_IDS.length} scenarios × ${Object.keys(GR_DEMO_AXES).length} axes.`);

// Smoke test: 2012 (crisis-era) vs 2023 gdp_pc/unemployment_rate must differ for a
// district present in both scenario maps, otherwise scenario-awareness is a no-op.
const d2012 = Object.fromEntries(grDemographicsForScenario("2012").map(r => [r.id, r]));
const d2023 = Object.fromEntries(grDemographicsForScenario("2023").map(r => [r.id, r]));
const probe = "athens_a";
if (d2012[probe].unemployment_rate === d2023[probe].unemployment_rate) {
  failures++;
  console.error(`FAIL: unemployment_rate for "${probe}" identical between 2012 and 2023 scenarios — scenario-awareness not wired.`);
}
if (d2012[probe].gdp_pc === d2023[probe].gdp_pc) {
  failures++;
  console.error(`FAIL: gdp_pc for "${probe}" identical between 2012 and 2023 scenarios — scenario-awareness not wired.`);
}
if (!failures) {
  console.log(`OK — scenario-awareness smoke test passed (${probe}: unemployment ${d2012[probe].unemployment_rate}% [2012] vs ${d2023[probe].unemployment_rate}% [2023]; gdp_pc €${d2012[probe].gdp_pc.toFixed(0)} [2012] vs €${d2023[probe].gdp_pc.toFixed(0)} [2023]).`);
}

process.exit(failures ? 1 : 0);
