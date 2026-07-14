// scripts/calibrate-sensitivities.mjs
// Upgrade 4 — empirical calibration of geographic sensitivities and GR_DEMO_GEO_K.
// Node-only; never imported by src/ (keeps the client bundle untouched).
//
// METHOD
// Observed 2019 district shares = grDistrictBaseVotes(GR_SCENARIOS["2019"], d, "2019"),
// i.e. national 2019 shares x GR_MULTIPLIERS["2019"] per district, renormalised — the
// same formula the live engine already uses to backfill a scenario with no per-district
// baseline table. Observed 2023 district shares = GR_DISTRICT_BASELINES["2023"].
//
// For each modern party with a 2019 counterpart (itself, or via GR_PARTY_LINEAGE when
// it didn't exist as such in 2019 — e.g. spartans <- gd), compute the per-district
// residual swing not explained by the uniform national swing + the engine's existing
// stronghold damping:
//   r_d = [logit(share2023_d) - logit(share2019_d)] - damping_d * [logit(nat2023) - logit(nat2019)]
// then WLS-regress r_d on the 2019-vintage z-scores, weighted by GR_DISTRICT_ELECTORATE.
//
// NOTE ON COLLINEARITY: GR_DEMO_AXES has 6 slider axes, but "youth" is defined as the
// exact negative of "seniors" (same underlying field, opposite sign — see
// greece-demographics.js). Regressing on both independently makes the design matrix
// singular (youth column = -1 x seniors column). We regress on 5 independent axes
// (seniors, urban, education, precarity, affluence) + intercept — 6 params, 59 obs —
// and report youth's estimated sensitivity as -1 x the seniors estimate, which is the
// only value consistent with how the two axes are constructed.
import {
  GR_SCENARIOS, GR_DISTRICT_BASELINES, GR_PARTY_LINEAGE, GR_PARTY_DICT, grToLogit, grDistrictsForScenario,
} from "../src/components/GreeceSwingometer/greece-data.js";
import {
  GR_DISTRICT_ELECTORATE, grDistrictBaseVotes, GR_DEMO_GEO_K,
} from "../src/components/GreeceSwingometer/greece-engine.js";
import { grDemoZForScenario } from "../src/components/GreeceSwingometer/greece-demographics.js";

// Axes actually regressed (youth dropped — see NOTE above).
const REGRESSED_AXES = ["seniors", "urban", "education", "precarity", "affluence"];
// K grid for the second half of Upgrade 4 (named constant, not a magic literal).
const K_GRID = [0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.45, 0.50];
const BLEND_T_THRESHOLD = 2; // |t| > this blends hand + estimate 50/50; below, keep hand.

// ---------- 1. Determine 2019 -> 2023 party pairs ----------
const nat2019 = Object.fromEntries(GR_SCENARIOS["2019"].map(p => [p.id, p.userPercentage]));
const nat2023 = Object.fromEntries(GR_SCENARIOS["2023"].map(p => [p.id, p.userPercentage]));
const pairs = []; // { predecessor, successor }
for (const successor in nat2023) {
  if (successor === "other") continue;
  if (nat2019[successor] != null) { pairs.push({ predecessor: successor, successor }); continue; }
  const anc = GR_PARTY_LINEAGE[successor];
  if (anc && nat2019[anc] != null) pairs.push({ predecessor: anc, successor });
}

// ---------- 2. Districts, weights, z-scores ----------
const districts = grDistrictsForScenario("2023");
const weightOf = id => GR_DISTRICT_ELECTORATE[id] ?? 0;
const z2019 = grDemoZForScenario("2019");
const baseVotes2019ByDistrict = new Map(districts.map(d => [d.id, grDistrictBaseVotes(GR_SCENARIOS["2019"], d, "2019")]));
const baselines2023 = GR_DISTRICT_BASELINES["2023"];

const clampP = x => Math.min(99.999, Math.max(0.001, x));
const logit = pct => grToLogit(clampP(pct));
const damping = dBasePct => Math.max(0.4, 1.0 - ((dBasePct - 5) / 90) * 0.6);

// ---------- 3. Weighted least squares (normal equations, Gauss-Jordan solve) ----------
function solveWLS(X, y, w) {
  const n = X.length, k = X[0].length;
  const XtWX = Array.from({ length: k }, () => new Array(k).fill(0));
  const XtWy = new Array(k).fill(0);
  for (let i = 0; i < n; i++) {
    for (let a = 0; a < k; a++) {
      XtWy[a] += w[i] * X[i][a] * y[i];
      for (let b = 0; b < k; b++) XtWX[a][b] += w[i] * X[i][a] * X[i][b];
    }
  }
  // Augment [XtWX | I] and Gauss-Jordan eliminate with partial pivoting to get the inverse.
  const M = XtWX.map((row, i) => [...row, ...Array.from({ length: k }, (_, j) => (i === j ? 1 : 0))]);
  for (let col = 0; col < k; col++) {
    let piv = col;
    for (let r = col + 1; r < k; r++) if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r;
    [M[col], M[piv]] = [M[piv], M[col]];
    const pv = M[col][col];
    if (Math.abs(pv) < 1e-12) throw new Error("Singular design matrix in WLS solve");
    for (let c = 0; c < 2 * k; c++) M[col][c] /= pv;
    for (let r = 0; r < k; r++) {
      if (r === col) continue;
      const f = M[r][col];
      if (!f) continue;
      for (let c = 0; c < 2 * k; c++) M[r][c] -= f * M[col][c];
    }
  }
  const inv = M.map(row => row.slice(k));
  const beta = new Array(k).fill(0);
  for (let a = 0; a < k; a++) for (let b = 0; b < k; b++) beta[a] += inv[a][b] * XtWy[b];

  let wRSS = 0, sw = 0;
  const yhat = X.map(row => row.reduce((s, x, a) => s + x * beta[a], 0));
  for (let i = 0; i < n; i++) { wRSS += w[i] * (y[i] - yhat[i]) ** 2; sw += w[i]; }
  const wMean = y.reduce((s, yi, i) => s + w[i] * yi, 0) / sw;
  const wTSS = y.reduce((s, yi, i) => s + w[i] * (yi - wMean) ** 2, 0);
  const dof = Math.max(1, n - k);
  const sigma2 = wRSS / dof;
  const se = inv.map((row, a) => Math.sqrt(Math.max(0, sigma2 * inv[a][a])));
  const t = beta.map((b, a) => (se[a] > 0 ? b / se[a] : 0));
  const r2 = wTSS > 0 ? 1 - wRSS / wTSS : 0;
  return { beta, se, t, r2, n, k };
}

// ---------- 4. Fit each party ----------
const fits = {};
for (const { predecessor, successor } of pairs) {
  const rows = [];
  for (const d of districts) {
    const w = weightOf(d.id);
    const share2019 = baseVotes2019ByDistrict.get(d.id)?.[predecessor];
    const share2023 = baselines2023[d.id]?.[successor];
    const z = z2019[d.id];
    if (!w || share2019 == null || share2023 == null || !z) continue;
    const r = (logit(share2023) - logit(share2019)) - damping(share2019) * (logit(nat2023[successor]) - logit(nat2019[predecessor]));
    rows.push({ w, r, z, id: d.id });
  }
  if (rows.length < REGRESSED_AXES.length + 5) continue; // not enough usable districts
  const X = rows.map(row => [1, ...REGRESSED_AXES.map(a => row.z[a])]);
  const y = rows.map(row => row.r);
  const w = rows.map(row => row.w);
  const fit = solveWLS(X, y, w);
  fits[successor] = { predecessor, fit, nObs: rows.length };
}

// ---------- 5. Report: hand vs estimated, with blend ----------
console.log(`\n=== Upgrade 4a: hand vs WLS-estimated geographic sensitivities (GR_DEMO_GEO_K = ${GR_DEMO_GEO_K}) ===`);
console.log(`Pairs regressed: ${Object.keys(fits).length} of ${pairs.length} candidate 2019->2023 party links.\n`);

const blended = {}; // successor -> { axis: value }
for (const successor in fits) {
  const { predecessor, fit, nObs } = fits[successor];
  const hand = GR_PARTY_DICT[successor]?.sensitivities || {};
  console.log(`--- ${successor} (predecessor: ${predecessor}, n=${nObs} districts, R2=${fit.r2.toFixed(3)}) ---`);
  console.log(`  intercept: beta=${fit.beta[0].toFixed(4)}  se=${fit.se[0].toFixed(4)}  t=${fit.t[0].toFixed(2)}`);
  blended[successor] = {};
  REGRESSED_AXES.forEach((axis, i) => {
    const a = i + 1;
    const beta = fit.beta[a], se = fit.se[a], t = fit.t[a];
    const estimated = beta / GR_DEMO_GEO_K;
    const handVal = hand[axis] ?? 0;
    const useBlend = Math.abs(t) > BLEND_T_THRESHOLD;
    const value = useBlend ? 0.5 * handVal + 0.5 * estimated : handVal;
    blended[successor][axis] = value;
    console.log(`  ${axis.padEnd(10)} hand=${handVal.toFixed(3).padStart(7)}  est=${estimated.toFixed(3).padStart(7)}  t=${t.toFixed(2).padStart(6)}  -> ${useBlend ? "BLEND" : "keep hand"} = ${value.toFixed(3)}`);
  });
  // youth mirrors -seniors by construction (see NOTE at top of file).
  const youthHand = hand.youth ?? 0;
  const youthEstimated = -(fit.beta[1] / GR_DEMO_GEO_K);
  const seniorsT = fit.t[1];
  const youthUseBlend = Math.abs(seniorsT) > BLEND_T_THRESHOLD;
  blended[successor].youth = youthUseBlend ? 0.5 * youthHand + 0.5 * youthEstimated : youthHand;
  console.log(`  youth      hand=${youthHand.toFixed(3).padStart(7)}  est=${youthEstimated.toFixed(3).padStart(7)} (=-seniors est, t=${seniorsT.toFixed(2)})  -> ${youthUseBlend ? "BLEND" : "keep hand"} = ${blended[successor].youth.toFixed(3)}`);
  console.log("");
}

console.log("=== Suggested GR_PARTY_DICT sensGeo patch (NOT auto-applied — review before pasting in) ===\n");
for (const successor in blended) {
  const b = blended[successor];
  const parts = ["seniors", "youth", "urban", "education", "precarity", "affluence"]
    .map(axis => `${axis}: ${b[axis].toFixed(3)}`).join(", ");
  console.log(`  ${successor}: { ${parts} },`);
}

// ---------- 6. K grid search ----------
console.log(`\n=== Upgrade 4b: GR_DEMO_GEO_K grid search (blended sensitivities held fixed, K varied) ===`);
console.log(`Predicting 2023 district shares from the 2019 baseline: logit(share2019_d) + damping_d*[logit(nat2023)-logit(nat2019)] + K' * sum_axis blended_sens[axis]*z_d,axis, vs actual 2023 shares. Electorate-weighted MAE (percentage points):\n`);

let bestK = null, bestMAE = Infinity;
for (const K of K_GRID) {
  let wSum = 0, aeSum = 0;
  for (const successor in fits) {
    const { predecessor } = fits[successor];
    for (const d of districts) {
      const w = weightOf(d.id);
      const share2019 = baseVotes2019ByDistrict.get(d.id)?.[predecessor];
      const share2023 = baselines2023[d.id]?.[successor];
      const z = z2019[d.id];
      if (!w || share2019 == null || share2023 == null || !z) continue;
      let geo = 0;
      for (const axis in blended[successor]) { const zz = z[axis]; if (zz != null) geo += blended[successor][axis] * zz; }
      const predictedLogit = logit(share2019) + damping(share2019) * (logit(nat2023[successor]) - logit(nat2019[predecessor])) + K * geo;
      const predictedPct = 100 / (1 + Math.exp(-predictedLogit));
      wSum += w; aeSum += w * Math.abs(predictedPct - share2023);
    }
  }
  const mae = wSum ? aeSum / wSum : NaN;
  if (mae < bestMAE) { bestMAE = mae; bestK = K; }
  console.log(`  K=${K.toFixed(2)}  MAE=${mae.toFixed(4)}pp${K === GR_DEMO_GEO_K ? "  <- current GR_DEMO_GEO_K" : ""}`);
}
console.log(`\nBest K in grid: ${bestK} (MAE=${bestMAE.toFixed(4)}pp). Current GR_DEMO_GEO_K=${GR_DEMO_GEO_K}.`);
console.log("This grid holds the BLENDED sensitivities (fit at K=GR_DEMO_GEO_K) fixed and only varies the coupling multiplier applied on top — it is not re-fitting sensitivities per K, so treat the minimum as directional, not a replacement for re-running 4a if K changes materially.\n");
