// scripts/check-zero-slider.mjs
// Regression guard for the demographic-engine upgrades: at all-zero demographic
// sliders, every scenario's district votes and seat table must stay bit-identical
// to the pre-upgrade baseline (in particular, 2023 must keep reproducing the
// official result exactly). Run with --write once to (re)generate the baseline
// after a change you've verified is intentional; plain run to check against it.
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { FIXED_SCENARIO_IDS, snapshotScenario } from "./lib/engine-runner.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const baselinePath = path.join(__dirname, "baselines", "zero-slider-baseline.json");
const ZERO_SLIDERS = { youth: 0, seniors: 0, urban: 0, education: 0, precarity: 0, gender: 0, affluence: 0 };

const current = {};
for (const id of FIXED_SCENARIO_IDS) {
  current[id] = snapshotScenario(id, { demSliders: ZERO_SLIDERS, threshold: 3.0, turnoutShift: 0 });
}

const write = process.argv.includes("--write");
if (write || !existsSync(baselinePath)) {
  mkdirSync(path.dirname(baselinePath), { recursive: true });
  writeFileSync(baselinePath, JSON.stringify(current, null, 2));
  console.log(`Wrote baseline for ${FIXED_SCENARIO_IDS.length} scenarios to ${baselinePath}`);
  process.exit(0);
}

const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
let failures = 0;
for (const id of FIXED_SCENARIO_IDS) {
  const a = JSON.stringify(baseline[id]);
  const b = JSON.stringify(current[id]);
  if (a !== b) {
    failures++;
    console.error(`MISMATCH in scenario "${id}" at zero sliders:`);
    console.error(`  baseline: ${a.slice(0, 300)}...`);
    console.error(`  current:  ${b.slice(0, 300)}...`);
  }
}

if (failures) {
  console.error(`\n${failures}/${FIXED_SCENARIO_IDS.length} scenarios changed at zero sliders. This must stay bit-identical.`);
  process.exit(1);
}
console.log(`OK — all ${FIXED_SCENARIO_IDS.length} scenarios bit-identical to baseline at zero sliders.`);
