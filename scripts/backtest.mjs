// scripts/backtest.mjs
// Upgrade 6 — validation harness. Node-only; never imported by src/.
//
// Runs the production model's baseline behaviour (zero demographic sliders — i.e.
// national swing + the existing per-district stronghold damping only, no geographic
// layer) FORWARD from the real 2019 result to see how well it would have predicted
// the real 2023 result, at both the district-vote-share and constituency-seat level.
// "Official" ground truth = the app's own zero-slider "2023" scenario (GR_DISTRICT_BASELINES,
// which the regression suite in check-zero-slider.mjs guarantees is reproduced exactly).
import {
  GR_SCENARIOS, GR_SCENARIO_TURNOUT, GR_DISTRICT_BASELINES, grDistrictsForScenario,
} from "../src/components/GreeceSwingometer/greece-data.js";
import {
  grApplySwing, grRunElection, grAllocateAllDistrictSeats, grDistrictBaseVotes, grDistrictElectorate,
} from "../src/components/GreeceSwingometer/greece-engine.js";
import { runScenario } from "./lib/engine-runner.mjs";

const FROM = "2019", TO = "2023";

// ---------- "Official" ground truth: the app's own zero-slider 2023 run ----------
const ZERO = { youth: 0, seniors: 0, urban: 0, education: 0, precarity: 0, affluence: 0, gender: 0 };
const official = runScenario(TO, { demSliders: ZERO, threshold: 3.0, turnoutShift: 0 });
const officialById = Object.fromEntries(official.districtResults.map(d => [d.id, d]));

// ---------- Predicted: swing the real 2019 baseline forward to the real 2023 national shares ----------
const baseParties2019 = GR_SCENARIOS[FROM];
const targetParties2023 = GR_SCENARIOS[TO].map(p => ({ ...p, effectivePct: p.userPercentage }));
const districts = grDistrictsForScenario(TO);
const predictedDistricts = districts.map(d => grApplySwing(
  { ...d, baseVotes: grDistrictBaseVotes(baseParties2019, d, FROM) },
  targetParties2023, baseParties2019, null, TO,
));
const predictedElection = grRunElection(targetParties2023, 3.0, GR_SCENARIO_TURNOUT[TO], TO);
const elect = grDistrictElectorate(TO, 0, null);
predictedDistricts.forEach(d => { if (elect[d.id] != null) d.electorate = elect[d.id]; });
grAllocateAllDistrictSeats(predictedDistricts, predictedElection);
const predictedById = Object.fromEntries(predictedDistricts.map(d => [d.id, d]));

// ---------- Per-party, per-district MAE ----------
const partyIds = (predictedElection.results || []).map(p => p.id);
const perPartyErrors = {}; partyIds.forEach(p => (perPartyErrors[p] = []));
const perDistrictTotal = {};

for (const d of districts) {
  const off = officialById[d.id], pred = predictedById[d.id];
  if (!off || !pred) continue;
  let districtTotal = 0, n = 0;
  for (const p of partyIds) {
    const a = off.votes?.[p], b = pred.votes?.[p];
    if (a == null || b == null) continue;
    const err = Math.abs(a - b);
    perPartyErrors[p].push(err);
    districtTotal += err; n++;
  }
  if (n) perDistrictTotal[d.id] = { total: districtTotal, mean: districtTotal / n, name: d.name };
}

console.log(`\n=== Upgrade 6: backtest ${FROM} -> ${TO} (zero demographic sliders — national swing + damping only) ===\n`);
console.log("Per-party district vote-share MAE (percentage points):");
let grandSum = 0, grandN = 0;
for (const p of partyIds) {
  const errs = perPartyErrors[p];
  if (!errs.length) continue;
  const mae = errs.reduce((s, e) => s + e, 0) / errs.length;
  const max = Math.max(...errs);
  console.log(`  ${p.padEnd(10)} MAE=${mae.toFixed(3)}pp  max=${max.toFixed(3)}pp  n=${errs.length}`);
  grandSum += errs.reduce((s, e) => s + e, 0); grandN += errs.length;
}
const overallMAE = grandN ? grandSum / grandN : NaN;
console.log(`  ${"OVERALL".padEnd(10)} MAE=${overallMAE.toFixed(3)}pp across ${grandN} (party,district) predictions\n`);

console.log("Worst 10 districts (mean abs error across parties present, percentage points):");
const worst = Object.entries(perDistrictTotal).sort((a, b) => b[1].mean - a[1].mean).slice(0, 10);
worst.forEach(([id, v]) => console.log(`  ${id.padEnd(16)} ${v.name?.padEnd(22) || ""} mean=${v.mean.toFixed(3)}pp`));

// ---------- Seat-table diff (constituency seats only — national total seats match by
// construction, since both runs use the same real 2023 national vote shares) ----------
console.log("\nConstituency-seat diff vs official (predicted - official), by party:");
const officialSeats = {}, predictedSeats = {};
partyIds.forEach(p => { officialSeats[p] = 0; predictedSeats[p] = 0; });
districts.forEach(d => {
  const off = officialById[d.id], pred = predictedById[d.id];
  partyIds.forEach(p => {
    officialSeats[p] += off?.allocatedSeats?.[p] || 0;
    predictedSeats[p] += pred?.allocatedSeats?.[p] || 0;
  });
});
let totalMisallocated = 0;
partyIds.forEach(p => {
  const diff = predictedSeats[p] - officialSeats[p];
  if (diff !== 0) totalMisallocated += Math.abs(diff);
  console.log(`  ${p.padEnd(10)} official=${String(officialSeats[p]).padStart(3)}  predicted=${String(predictedSeats[p]).padStart(3)}  diff=${diff > 0 ? "+" : ""}${diff}`);
});
// Each misallocation is counted from both the losing and gaining party's side.
const seatsWrong = totalMisallocated / 2;

const summary = `Backtest ${FROM}->${TO} (zero sliders, damping-only model): district vote-share MAE = ${overallMAE.toFixed(2)}pp (electorate-unweighted, ${grandN} predictions), ${seatsWrong} of ${partyIds.reduce((s, p) => s + officialSeats[p], 0)} constituency seats misallocated relative to the official result.`;
console.log(`\n=== One-line summary (for MethodologyModal) ===\n${summary}\n`);
