// greece-stats.js
// ─────────────────────────────────────────────────────────────────────────────
//  Deterministic statistics engine for PsephosCast.gr "Correlations & Trends".
//  Pure JavaScript, ZERO dependencies. Every function validated against
//  scipy 1.17 / statsmodels 0.14 (Shapiro–Wilk, KS, Pearson/Spearman/Kendall,
//  point-biserial, χ²/Cramér's V, Welch & Student t, Mann–Whitney U, one-way
//  ANOVA + η² + Tukey HSD, Kruskal–Wallis, multiple OLS with SE/t/p/CI, R²/adj-R²,
//  F-test, standardised β, VIF/tolerance, Durbin–Watson).
//
//  Export names & return shapes are kept compatible with the existing app
//  (GreeceCorrelations / GreecePlots / greece-stats-export consume these).
// ─────────────────────────────────────────────────────────────────────────────

/* ═══ 1 · special functions & distribution tails ═══ */
function gammaln(xx) {
  // Published Lanczos-approximation constants (Numerical Recipes) — more digits than
  // float64 holds, but JS rounds to the same nearest double either way. Safe as-is.
  const cof = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5]; // eslint-disable-line no-loss-of-precision
  let x = xx, y = xx, tmp = x + 5.5; tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015; for (let j = 0; j < 6; j++) ser += cof[j] / ++y;
  return -tmp + Math.log(2.5066282746310005 * ser / x); // eslint-disable-line no-loss-of-precision
}
function betacf(a, b, x) {
  const FPMIN = 1e-300, EPS = 3e-12, MAXIT = 300, qab = a + b, qap = a + 1, qam = a - 1;
  let c = 1, d = 1 - qab * x / qap; if (Math.abs(d) < FPMIN) d = FPMIN; d = 1 / d; let h = d;
  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN; c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN; d = 1 / d; h *= d * c;
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN; c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN; d = 1 / d;
    const del = d * c; h *= del; if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}
export function betai(a, b, x) {
  if (x <= 0) return 0; if (x >= 1) return 1;
  const bt = Math.exp(gammaln(a + b) - gammaln(a) - gammaln(b) + a * Math.log(x) + b * Math.log(1 - x));
  return x < (a + 1) / (a + b + 2) ? bt * betacf(a, b, x) / a : 1 - bt * betacf(b, a, 1 - x) / b;
}
function gammap(a, x) {
  if (x <= 0) return 0;
  if (x < a + 1) { let ap = a, sum = 1 / a, del = sum; for (let n = 0; n < 300; n++) { ap++; del *= x / ap; sum += del; if (Math.abs(del) < Math.abs(sum) * 1e-12) break; } return sum * Math.exp(-x + a * Math.log(x) - gammaln(a)); }
  const FPMIN = 1e-300; let b = x + 1 - a, c = 1 / FPMIN, d = 1 / b, h = d;
  for (let i = 1; i <= 300; i++) { const an = -i * (i - a); b += 2; d = an * d + b; if (Math.abs(d) < FPMIN) d = FPMIN; c = b + an / c; if (Math.abs(c) < FPMIN) c = FPMIN; d = 1 / d; const del = d * c; h *= del; if (Math.abs(del - 1) < 1e-12) break; }
  return 1 - Math.exp(-x + a * Math.log(x) - gammaln(a)) * h;
}
function erfc(x) {
  const z = Math.abs(x), t = 1 / (1 + 0.5 * z);
  const ans = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
  return x >= 0 ? ans : 2 - ans;
}
export function normCDF(z) { return 0.5 * erfc(-z / Math.SQRT2); }
export function normInv(p) {
  const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
  const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
  const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
  const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
  const pl = 0.02425, ph = 1 - pl; let q, r;
  if (p < pl) { q = Math.sqrt(-2 * Math.log(p)); return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1); }
  if (p <= ph) { q = p - 0.5; r = q*q; return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q / (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1); }
  q = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
}
export function tCDF(t, df) { const ib = betai(df / 2, 0.5, df / (df + t * t)); return t > 0 ? 1 - ib / 2 : ib / 2; }
export function studentTwoTailedP(t, df) { if (!isFinite(t) || df <= 0) return NaN; return betai(df / 2, 0.5, df / (df + t * t)); }
export function tInv(p, df) { if (p <= 0) return -Infinity; if (p >= 1) return Infinity; let lo = -1e4, hi = 1e4; for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; tCDF(m, df) < p ? lo = m : hi = m; } return (lo + hi) / 2; }
export function chiSqP(x, df) { return x <= 0 ? 1 : 1 - gammap(df / 2, x / 2); }
export function fP(F, d1, d2) { return (!isFinite(F) || F <= 0) ? 1 : betai(d2 / 2, d1 / 2, d2 / (d2 + d1 * F)); }
const _poly = (c, x) => { let s = 0; for (let i = c.length - 1; i >= 0; i--) s = s * x + c[i]; return s; };

/* ═══ 2 · basic helpers ═══ */
const _num = v => typeof v === "number" && isFinite(v);
export function pairwiseClean(x, y) { const xs = [], ys = [], n = Math.min(x.length, y.length); for (let i = 0; i < n; i++) { if (_num(x[i]) && _num(y[i])) { xs.push(x[i]); ys.push(y[i]); } } return [xs, ys]; }
export function cleanRow(row) { return row.filter(_num); }
export const finiteOnly = cleanRow;
export function mean(a) { let s = 0; for (let i = 0; i < a.length; i++) s += a[i]; return a.length ? s / a.length : NaN; }
export function variance(a, sample = true) { const n = a.length; if (n < (sample ? 2 : 1)) return NaN; const m = mean(a); let s = 0; for (const v of a) s += (v - m) ** 2; return s / (n - (sample ? 1 : 0)); }
export function sd(a, sample = true) { const v = variance(a, sample); return isFinite(v) ? Math.sqrt(v) : NaN; }
export function quantile(a, q) { const s = cleanRow(a).slice().sort((x, y) => x - y), n = s.length; if (!n) return NaN; if (n === 1) return s[0]; const h = (n - 1) * q, lo = Math.floor(h); return s[lo] + (h - lo) * (s[Math.min(lo + 1, n - 1)] - s[lo]); }
export function median(a) { return quantile(a, 0.5); }
export function averageRanks(a) {
  const idx = a.map((v, i) => [v, i]).sort((p, q) => p[0] - q[0]); const ranks = new Array(a.length); let i = 0;
  while (i < idx.length) { let j = i; while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++; const r = (i + j) / 2 + 1; for (let k = i; k <= j; k++) ranks[idx[k][1]] = r; i = j + 1; }
  return ranks;
}
function tieGroups(a) { const m = {}; for (const v of a) m[v] = (m[v] || 0) + 1; return Object.values(m).filter(c => c > 1); }

/* ═══ 3 · descriptive moments ═══ */
export function skewness(a) {            // G1 (scipy bias=False) — matches Excel/SPSS
  const v = cleanRow(a), n = v.length; if (n < 3) return NaN;
  const m = mean(v); let m2 = 0, m3 = 0; for (const x of v) { const d = x - m; m2 += d * d; m3 += d * d * d; } m2 /= n; m3 /= n;
  return m2 > 0 ? Math.sqrt(n * (n - 1)) / (n - 2) * (m3 / m2 ** 1.5) : NaN;
}
export function kurtosis(a) {            // excess kurtosis G2 (scipy fisher=True, bias=False)
  const v = cleanRow(a), n = v.length; if (n < 4) return NaN;
  const m = mean(v); let m2 = 0, m4 = 0; for (const x of v) { const d = x - m; m2 += d * d; m4 += d * d * d * d; } m2 /= n; m4 /= n;
  const g2 = m2 > 0 ? m4 / (m2 * m2) - 3 : NaN;
  return ((n - 1) / ((n - 2) * (n - 3))) * ((n + 1) * g2 + 6);
}
export function describe(raw) {
  const a = cleanRow(raw), n = a.length; if (!n) return { n: 0 };
  const s = a.slice().sort((p, q) => p - q), m = mean(a), v = variance(a), s_ = Math.sqrt(v);
  const q1 = quantile(s, 0.25), q3 = quantile(s, 0.75);
  const freq = {}; let mode = null, best = 0; for (const x of a) { freq[x] = (freq[x] || 0) + 1; if (freq[x] > best) { best = freq[x]; mode = x; } }
  const skew = skewness(a), kurt = kurtosis(a);
  const seSkew = n > 2 ? Math.sqrt(6 * n * (n - 1) / ((n - 2) * (n + 1) * (n + 3))) : NaN;
  const seKurt = n > 3 ? 2 * seSkew * Math.sqrt((n * n - 1) / ((n - 3) * (n + 5))) : NaN;
  const tc = n > 1 ? tInv(0.975, n - 1) : NaN;
  const ciMean = n > 1 ? [m - tc * s_ / Math.sqrt(n), m + tc * s_ / Math.sqrt(n)] : [NaN, NaN];
  return { n, mean: m, median: quantile(s, 0.5), mode: best > 1 ? mode : NaN, sd: s_, variance: v, min: s[0], max: s[n - 1], range: s[n - 1] - s[0], q1, q3, iqr: q3 - q1, skew, skewSE: seSkew, kurt, kurtSE: seKurt, cv: m !== 0 ? (s_ / Math.abs(m)) * 100 : NaN, ciMean };
}
export function frequencyTable(values) { const map = new Map(); for (const v of values) map.set(v, (map.get(v) || 0) + 1); const n = values.length; return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([k, c]) => ({ value: k, count: c, pct: n ? (c / n) * 100 : 0 })); }

/* ═══ 4 · normality & outliers ═══ */
export function shapiroWilk(raw) {                 // Royston AS R94, 3 ≤ n ≤ 5000
  const a = cleanRow(raw).slice().sort((p, q) => p - q), n = a.length; if (n < 3) return { W: NaN, p: NaN, n };
  const mI = []; for (let i = 1; i <= n; i++) mI.push(normInv((i - 0.375) / (n + 0.25)));
  const mm = mI.reduce((s, v) => s + v * v, 0), sm = Math.sqrt(mm), u = 1 / Math.sqrt(n);
  const c1 = [0, 0.221157, -0.147981, -2.071190, 4.434685, -2.706056], c2 = [0, 0.042981, -0.293762, -1.752461, 5.682633, -3.582633];
  const w = new Array(n);
  if (n === 3) { w[0] = -Math.SQRT1_2; w[1] = 0; w[2] = Math.SQRT1_2; }
  else {
    const an = mI[n - 1] / sm + _poly(c1, u); let phi;
    if (n > 5) { const an1 = mI[n - 2] / sm + _poly(c2, u); phi = (mm - 2 * mI[n - 1] ** 2 - 2 * mI[n - 2] ** 2) / (1 - 2 * an * an - 2 * an1 * an1); for (let i = 0; i < n; i++) w[i] = mI[i] / Math.sqrt(phi); w[n - 1] = an; w[0] = -an; w[n - 2] = an1; w[1] = -an1; }
    else { phi = (mm - 2 * mI[n - 1] ** 2) / (1 - 2 * an * an); for (let i = 0; i < n; i++) w[i] = mI[i] / Math.sqrt(phi); w[n - 1] = an; w[0] = -an; }
  }
  const m = mean(a); let nu = 0, den = 0; for (let i = 0; i < n; i++) { nu += w[i] * a[i]; den += (a[i] - m) ** 2; }
  const W = den > 0 ? (nu * nu) / den : NaN; let p; const ln = Math.log;
  if (n === 3) { p = 1.90985931710274 * (Math.asin(Math.sqrt(W)) - 1.04719755119660); }
  else if (n <= 11) { const g = -2.273 + 0.459 * n, mu = 0.5440 - 0.39978 * n + 0.025054 * n * n - 0.0006714 * n ** 3, sig = Math.exp(1.3822 - 0.77857 * n + 0.062767 * n * n - 0.0020322 * n ** 3); p = 1 - normCDF(((-ln(g - ln(1 - W))) - mu) / sig); }
  else { const L = ln(n), mu = 0.0038915 * L ** 3 - 0.083751 * L * L - 0.31082 * L - 1.5861, sig = Math.exp(0.0030302 * L * L - 0.082676 * L - 0.4803); p = 1 - normCDF((ln(1 - W) - mu) / sig); }
  return { W, p: Math.max(0, Math.min(1, p)), n };
}
export function ksLilliefors(raw) {                // KS vs estimated normal; Lilliefors p (approx, exact for p≤.10)
  const a = cleanRow(raw).slice().sort((p, q) => p - q), n = a.length; if (n < 4) return { D: NaN, p: NaN, n };
  const m = mean(a), s = sd(a); if (!(s > 0)) return { D: NaN, p: NaN, n };
  let D = 0; for (let i = 0; i < n; i++) { const z = normCDF((a[i] - m) / s); D = Math.max(D, Math.abs((i + 1) / n - z), Math.abs(z - i / n)); }
  const ns = Math.sqrt(n), Dm = D * (ns - 0.01 + 0.85 / ns); let p;
  if (Dm < 0.775) p = 1; else if (Dm > 1.5) p = 0; else p = Math.max(0, Math.min(1, Math.exp(-7.01256 * Dm * Dm * (n + 2.78019) + 2.99587 * Dm * Math.sqrt(n + 2.78019) - 0.122119 + 0.974598 / ns + 1.67997 / n)));
  return { D, p, n, approx: true };
}
export function outliers(raw, labels = [], method = "iqr", z = 3) {
  const pts = raw.map((v, i) => ({ v, label: labels[i] ?? "" })).filter(p => _num(p.v)), vals = pts.map(p => p.v), out = [];
  if (method === "z") { const m = mean(vals), s = sd(vals); if (!(s > 0)) return out; for (const p of pts) { const zz = (p.v - m) / s; if (Math.abs(zz) > z) out.push({ ...p, stat: zz, rule: `|z| > ${z}` }); } }
  else { const s = vals.slice().sort((a, b) => a - b), q1 = quantile(s, 0.25), q3 = quantile(s, 0.75), iqr = q3 - q1, lo = q1 - 1.5 * iqr, hi = q3 + 1.5 * iqr; for (const p of pts) if (p.v < lo || p.v > hi) out.push({ ...p, stat: p.v, rule: `outside [${lo.toFixed(2)}, ${hi.toFixed(2)}]` }); }
  return out;
}

/* ═══ 5 · bivariate association ═══ */
export function pearson(x, y) { const [xs, ys] = pairwiseClean(x, y), n = xs.length; if (n < 2) return { r: NaN, n }; const mx = mean(xs), my = mean(ys); let sxy = 0, sxx = 0, syy = 0; for (let i = 0; i < n; i++) { const dx = xs[i] - mx, dy = ys[i] - my; sxy += dx * dy; sxx += dx * dx; syy += dy * dy; } return (sxx === 0 || syy === 0) ? { r: NaN, n } : { r: sxy / Math.sqrt(sxx * syy), n }; }
export function spearman(x, y) { const [xs, ys] = pairwiseClean(x, y), n = xs.length; if (n < 2) return { rho: NaN, n }; return { rho: pearson(averageRanks(xs), averageRanks(ys)).r, n }; }
export function kendallTau(x, y) {
  const [xs, ys] = pairwiseClean(x, y), n = xs.length; if (n < 2) return { tau: NaN, p: NaN, n };
  let P = 0, Q = 0; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { const s = Math.sign(xs[j] - xs[i]) * Math.sign(ys[j] - ys[i]); if (s > 0) P++; else if (s < 0) Q++; }
  const t0 = n * (n - 1) / 2, gx = tieGroups(xs), gy = tieGroups(ys);
  const tx = gx.reduce((s, c) => s + c * (c - 1) / 2, 0), ty = gy.reduce((s, c) => s + c * (c - 1) / 2, 0);
  const tau = (P - Q) / Math.sqrt((t0 - tx) * (t0 - ty));
  const v0 = n * (n - 1) * (2 * n + 5), vt = gx.reduce((s, c) => s + c * (c - 1) * (2 * c + 5), 0), vu = gy.reduce((s, c) => s + c * (c - 1) * (2 * c + 5), 0);
  const v1 = gx.reduce((s, c) => s + c * (c - 1), 0) * gy.reduce((s, c) => s + c * (c - 1), 0) / (2 * n * (n - 1));
  const v2 = gx.reduce((s, c) => s + c * (c - 1) * (c - 2), 0) * gy.reduce((s, c) => s + c * (c - 1) * (c - 2), 0) / (9 * n * (n - 1) * (n - 2));
  const varS = (v0 - vt - vu) / 18 + v1 + v2, S = P - Q, z = varS > 0 ? S / Math.sqrt(varS) : NaN;
  return { tau, p: isFinite(z) ? 2 * (1 - normCDF(Math.abs(z))) : NaN, n, z };
}
export function corrPValue(r, n) { if (!isFinite(r) || n < 3) return NaN; if (Math.abs(r) >= 1) return 0; const t = r * Math.sqrt((n - 2) / (1 - r * r)); return studentTwoTailedP(t, n - 2); }
export function fisherCI(r, n, conf = 0.95) { if (!isFinite(r) || n < 4) return [NaN, NaN]; const zc = conf === 0.95 ? 1.959963985 : normInv(1 - (1 - conf) / 2); const z = Math.atanh(Math.max(-0.999999, Math.min(0.999999, r))), se = 1 / Math.sqrt(n - 3); return [Math.tanh(z - zc * se), Math.tanh(z + zc * se)]; }
export function pointBiserial(binaryX, continuousY) { const { r, n } = pearson(binaryX, continuousY); return { r, rpb: r, n, p: corrPValue(r, n), ci: fisherCI(r, n) }; }
// χ² independence + Cramér's V from two CATEGORICAL arrays
export function crossTabs(xCat, yCat) {
  const n = Math.min(xCat.length, yCat.length), table = {}, rowT = {}, colT = {}; let total = 0;
  for (let i = 0; i < n; i++) { const x = xCat[i], y = yCat[i]; if (x == null || y == null || x === "—" || y === "—") continue; (table[x] ||= {})[y] = (table[x][y] || 0) + 1; rowT[x] = (rowT[x] || 0) + 1; colT[y] = (colT[y] || 0) + 1; total++; }
  const rows = Object.keys(rowT), cols = Object.keys(colT); let chiSquare = 0;
  rows.forEach(r => cols.forEach(c => { const O = table[r]?.[c] || 0, E = rowT[r] * colT[c] / total; if (E > 0) chiSquare += (O - E) ** 2 / E; }));
  const df = (rows.length - 1) * (cols.length - 1), k = Math.min(rows.length, cols.length);
  return { chiSquare, df, p: chiSqP(chiSquare, df), cramersV: k > 1 && total > 0 ? Math.sqrt(chiSquare / (total * (k - 1))) : 0, total, rows, cols };
}
// χ² from a ready contingency MATRIX (rows × cols)
export function chiSquareTable(table) {
  const R = table.length, C = table[0]?.length || 0; if (!R || !C) return { chiSquare: NaN };
  const rt = table.map(r => r.reduce((s, v) => s + v, 0)), ct = Array.from({ length: C }, (_, j) => table.reduce((s, r) => s + r[j], 0)), N = rt.reduce((s, v) => s + v, 0);
  if (!N) return { chiSquare: NaN }; let chiSquare = 0;
  for (let i = 0; i < R; i++) for (let j = 0; j < C; j++) { const e = rt[i] * ct[j] / N; if (e > 0) chiSquare += (table[i][j] - e) ** 2 / e; }
  const df = (R - 1) * (C - 1);
  return { chiSquare, df, p: chiSqP(chiSquare, df), cramersV: Math.sqrt(chiSquare / (N * Math.min(R - 1, C - 1))), total: N };
}

/* ═══ 6 · group comparison ═══ */
export function tTest(g1, g2, { welch = true } = {}) {
  const a = cleanRow(g1), b = cleanRow(g2), na = a.length, nb = b.length; if (na < 2 || nb < 2) return { t: NaN, p: NaN, df: NaN };
  const ma = mean(a), mb = mean(b), va = variance(a), vb = variance(b), sp2 = ((na - 1) * va + (nb - 1) * vb) / (na + nb - 2);
  let t, df, se;
  if (welch) { se = Math.sqrt(va / na + vb / nb); t = (ma - mb) / se; df = (va / na + vb / nb) ** 2 / ((va / na) ** 2 / (na - 1) + (vb / nb) ** 2 / (nb - 1)); }
  else { se = Math.sqrt(sp2 * (1 / na + 1 / nb)); t = (ma - mb) / se; df = na + nb - 2; }
  const tc = tInv(0.975, df);
  return { t, df, p: studentTwoTailedP(t, df), diff: ma - mb, meanDiff: ma - mb, cohenD: (ma - mb) / Math.sqrt(sp2), ci: [(ma - mb) - tc * se, (ma - mb) + tc * se], na, nb, meanA: ma, meanB: mb };
}
export function anova(groups) {
  const g = groups.map(cleanRow).filter(x => x.length > 0), k = g.length; if (k < 2) return { F: NaN, p: NaN, etaSq: NaN };
  const all = [].concat(...g), N = all.length, gm = mean(all); let ssb = 0, ssw = 0;
  const gstats = g.map(x => { const m = mean(x); ssb += x.length * (m - gm) ** 2; for (const v of x) ssw += (v - m) ** 2; return { n: x.length, mean: m, sd: sd(x) }; });
  const dfB = k - 1, dfW = N - k, msB = ssb / dfB, msW = ssw / dfW, F = msB / msW;
  return { F, p: fP(F, dfB, dfW), dfB, dfW, etaSq: ssb / (ssb + ssw), msW, ssb, ssw, grandMean: gm, k, N, gstats };
}
export const anovaOneWay = anova;
export function ptukey(q, k, df) {
  if (!(q > 0)) return 0; const GL = _gaussLegendre(32);
  const rangeCDF = (w) => { if (w <= 0) return 0; let s = 0; const lo = -8, hi = 8, mid = (hi + lo) / 2, half = (hi - lo) / 2; for (let i = 0; i < GL.x.length; i++) { const u = mid + half * GL.x[i]; s += GL.w[i] * _normPDF(u) * Math.pow(normCDF(u) - normCDF(u - w), k - 1); } return Math.min(1, Math.max(0, k * half * s)); };
  if (df > 5000) return rangeCDF(q);
  const a = df / 2, lg = a * Math.log(a) - gammaln(a), gdens = (s) => Math.exp(lg + (df - 1) * Math.log(s) - a * s * s) * 2;
  let s = 0; const lo = 1e-4, hi = 1 + 8 / Math.sqrt(df), mid = (hi + lo) / 2, half = (hi - lo) / 2;
  for (let i = 0; i < GL.x.length; i++) { const sv = mid + half * GL.x[i]; s += GL.w[i] * gdens(sv) * rangeCDF(q * sv); }
  return Math.min(1, Math.max(0, half * s));
}
function _normPDF(z) { return Math.exp(-0.5 * z * z) / 2.5066282746310002; }
function _gaussLegendre(n) { const x = new Array(n), w = new Array(n), m = (n + 1) >> 1; for (let i = 0; i < m; i++) { let z = Math.cos(Math.PI * (i + 0.75) / (n + 0.5)), z1, pp; do { let p1 = 1, p2 = 0; for (let j = 0; j < n; j++) { const p3 = p2; p2 = p1; p1 = ((2 * j + 1) * z * p2 - j * p3) / (j + 1); } pp = n * (z * p1 - p2) / (z * z - 1); z1 = z; z = z1 - p1 / pp; } while (Math.abs(z - z1) > 1e-14); x[i] = -z; x[n - 1 - i] = z; w[i] = 2 / ((1 - z * z) * pp * pp); w[n - 1 - i] = w[i]; } return { x, w }; }
export function tukeyHSD(groups, anovaRes = null, labels = []) {
  const g = groups.map(cleanRow), k = g.length, av = anovaRes && isFinite(anovaRes.msW) ? anovaRes : anova(g); if (!isFinite(av.msW)) return [];
  const means = g.map(mean), ns = g.map(x => x.length), out = [];
  for (let i = 0; i < k; i++) for (let j = i + 1; j < k; j++) { const se = Math.sqrt(av.msW / 2 * (1 / ns[i] + 1 / ns[j])), q = Math.abs(means[i] - means[j]) / se; out.push({ g1: i, g2: j, a: labels[i] ?? `G${i + 1}`, b: labels[j] ?? `G${j + 1}`, diff: means[i] - means[j], se, q, p: 1 - ptukey(q, k, av.dfW) }); }
  return out;
}
export function mannWhitneyU(g1, g2) {
  const a = cleanRow(g1), b = cleanRow(g2), na = a.length, nb = b.length; if (!na || !nb) return { U: NaN, p: NaN };
  const all = a.map(v => [v, 0]).concat(b.map(v => [v, 1])), ranks = averageRanks(all.map(d => d[0]));
  let Ra = 0; for (let i = 0; i < all.length; i++) if (all[i][1] === 0) Ra += ranks[i];
  const U1 = Ra - na * (na + 1) / 2, U2 = na * nb - U1, U = Math.min(U1, U2), mu = na * nb / 2;
  const tie = tieGroups(all.map(d => d[0])).reduce((s, c) => s + (c ** 3 - c), 0), N = na + nb;
  const sig = Math.sqrt((na * nb / 12) * ((N + 1) - tie / (N * (N - 1)))), z = sig > 0 ? (U - mu + 0.5 * Math.sign(mu - U)) / sig : NaN;
  return { U, U1, U2, z, p: isFinite(z) ? 2 * (1 - normCDF(Math.abs(z))) : NaN, na, nb };
}
export function kruskalWallis(groups) {
  const g = groups.map(cleanRow).filter(x => x.length), k = g.length; if (k < 2) return { H: NaN, p: NaN, df: NaN };
  const all = [].concat(...g), N = all.length, ranks = averageRanks(all); let idx = 0, H = 0;
  for (const x of g) { let R = 0; for (let i = 0; i < x.length; i++) R += ranks[idx++]; H += R * R / x.length; }
  H = 12 / (N * (N + 1)) * H - 3 * (N + 1);
  const tie = tieGroups(all).reduce((s, c) => s + (c ** 3 - c), 0), C = 1 - tie / (N ** 3 - N); H = C > 0 ? H / C : H;
  return { H, df: k - 1, p: chiSqP(H, k - 1), N, k };
}

/* ═══ 7 · regression (multiple OLS) ═══ */
function matT(A) { return A[0].map((_, j) => A.map(r => r[j])); }
function matMul(A, B) { return A.map(r => B[0].map((_, j) => r.reduce((s, v, k) => s + v * B[k][j], 0))); }
function matInv(M) {
  const n = M.length, A = M.map((r, i) => [...r, ...r.map((_, j) => (i === j ? 1 : 0))]);
  for (let i = 0; i < n; i++) { let p = i; for (let r = i + 1; r < n; r++) if (Math.abs(A[r][i]) > Math.abs(A[p][i])) p = r; if (Math.abs(A[p][i]) < 1e-12) return null; [A[i], A[p]] = [A[p], A[i]]; const d = A[i][i]; for (let j = 0; j < 2 * n; j++) A[i][j] /= d; for (let r = 0; r < n; r++) if (r !== i) { const f = A[r][i]; for (let j = 0; j < 2 * n; j++) A[r][j] -= f * A[i][j]; } }
  return A.map(r => r.slice(n));
}
function _r2on(otherCols, yvals, rows) {
  const X = rows.map(ri => [1, ...otherCols.map(c => c[ri])]), Xt = matT(X), inv = matInv(matMul(Xt, X)); if (!inv) return null;
  const beta = matMul(inv, matMul(Xt, yvals.map(v => [v]))).map(r => r[0]), fit = X.map(r => r.reduce((s, v, j) => s + v * beta[j], 0));
  const my = mean(yvals); let rss = 0, tss = 0; for (let i = 0; i < yvals.length; i++) { rss += (yvals[i] - fit[i]) ** 2; tss += (yvals[i] - my) ** 2; } return tss > 0 ? 1 - rss / tss : null;
}
// y = vector; xMatrix = array of ROWS (each row = predictor values). Listwise NA deletion.
export function multipleOLS(y, xMatrix, names = []) {
  const n0 = y.length, kPred = (xMatrix[0] || []).length, rows = [];
  for (let i = 0; i < n0; i++) if (_num(y[i]) && xMatrix[i] && xMatrix[i].every(_num)) rows.push(i);
  const n = rows.length, p = kPred + 1;
  if (n < p + 1) return { error: "Insufficient Degrees of Freedom", ok: false, n, kPred };
  const Y = rows.map(i => y[i]), X = rows.map(i => [1, ...xMatrix[i]]);
  const cols = Array.from({ length: kPred }, (_, j) => rows.map(i => xMatrix[i][j]));
  const Xt = matT(X), inv = matInv(matMul(Xt, X)); if (!inv) return { error: "Collinearity Error (Singular Matrix)", ok: false, n, kPred };
  const beta = matMul(inv, matMul(Xt, Y.map(v => [v]))).map(r => r[0]);
  const fitted = X.map(r => r.reduce((s, v, j) => s + v * beta[j], 0)), residuals = Y.map((v, i) => v - fitted[i]);
  const sse = residuals.reduce((s, e) => s + e * e, 0), my = mean(Y), sst = Y.reduce((s, v) => s + (v - my) ** 2, 0);
  const dfRes = n - p, mse = sse / dfRes, r2 = 1 - sse / sst, adjR2 = 1 - (1 - r2) * (n - 1) / dfRes;
  const fStat = ((sst - sse) / (p - 1)) / mse, tc = tInv(0.975, dfRes), sdy = sd(Y);
  const SE = beta.map((_, j) => Math.sqrt(mse * inv[j][j])), tStats = beta.map((b, j) => b / SE[j]);
  const pValues = tStats.map(t => studentTwoTailedP(t, dfRes));
  const ci = beta.map((b, j) => [b - tc * SE[j], b + tc * SE[j]]);
  const betaStd = beta.map((b, j) => j === 0 ? NaN : b * (sd(cols[j - 1]) / sdy));
  const vif = cols.map((col, j) => { if (kPred < 2) return 1; const others = cols.filter((_, k) => k !== j); const sub = _r2on(others, col, col.map((_, i) => i)); return sub != null && sub < 1 ? 1 / (1 - sub) : Infinity; });
  let dwNum = 0; for (let i = 1; i < n; i++) dwNum += (residuals[i] - residuals[i - 1]) ** 2;
  return { ok: true, coefficients: beta, standardErrors: SE, tStats, pValues, ci, beta: betaStd, r2, adjR2, fStat, fP: fP(fStat, p - 1, dfRes), durbinWatson: sse > 0 ? dwNum / sse : NaN, vif, tolerance: vif.map(v => isFinite(v) ? 1 / v : 0), residuals, fitted, n, kPred, dfRes, names, rowIndex: rows };
}
export function olsFit(x, y) {
  const [xs, ys] = pairwiseClean(x, y), n = xs.length; if (n < 2) return { slope: NaN, intercept: NaN, r2: NaN, n };
  const mx = mean(xs), my = mean(ys); let sxy = 0, sxx = 0, syy = 0; for (let i = 0; i < n; i++) { const dx = xs[i] - mx, dy = ys[i] - my; sxy += dx * dy; sxx += dx * dx; syy += dy * dy; }
  if (sxx === 0) return { slope: NaN, intercept: NaN, r2: NaN, n };
  const slope = sxy / sxx; return { slope, intercept: my - slope * mx, r2: syy === 0 ? NaN : (sxy * sxy) / (sxx * syy), n };
}

/* ═══ 8 · bivariate bundle + reporting ═══ */
export function corrTest(x, y, labels = []) {
  const xs = [], ys = [], pts = [], n0 = Math.min(x.length, y.length);
  for (let i = 0; i < n0; i++) { if (_num(x[i]) && _num(y[i])) { xs.push(x[i]); ys.push(y[i]); pts.push({ label: labels[i] ?? "", x: x[i], y: y[i] }); } }
  const n = xs.length, { r } = pearson(xs, ys), { rho } = spearman(xs, ys), kt = kendallTau(xs, ys), ols = olsFit(xs, ys);
  return { n, r, rP: corrPValue(r, n), rho, rhoP: corrPValue(rho, n), tau: kt.tau, tauP: kt.p, ci: fisherCI(r, n), ols, points: pts, meanX: mean(xs), meanY: mean(ys), sdX: sd(xs), sdY: sd(ys) };
}
export function strengthBand(absR) { if (!isFinite(absR)) return "undefined"; return absR < 0.1 ? "negligible" : absR < 0.3 ? "weak" : absR < 0.5 ? "moderate" : absR < 0.7 ? "strong" : absR < 0.9 ? "very strong" : "near-perfect"; }
export function fmtR(r) { return !isFinite(r) ? "—" : (r >= 0 ? "" : "−") + Math.abs(r).toFixed(3); }
export function fmtP(p) { return !isFinite(p) ? "—" : p < 0.001 ? "p < 0.001" : "p = " + p.toFixed(3); }
export function fmtNum(v, dp = 2) { return _num(v) ? (v >= 0 ? "" : "−") + Math.abs(v).toFixed(dp) : "—"; }

export const CAVEATS = [
  "Ecological (aggregate) inference: every figure describes electoral districts (or regions) as units, not individual voters. A district-level association cannot be read as how any individual voted — that is the ecological fallacy.",
  "Low n: with ~59 districts (and only 13 regions) statistical power is limited, and one or two unusual units can move a correlation or regression coefficient noticeably.",
  "Spatial non-independence: neighbouring districts share economic and demographic traits, which can violate the independence assumption behind OLS standard errors and p-values.",
  "Linearity & outliers: Pearson r and OLS assume approximately linear relationships and are outlier-sensitive; Spearman ρ and Kendall τ are reported as rank-based, monotonic cross-checks.",
  "Inference: p-values are two-tailed (correlation via Student-t; group tests via Welch/Student t, ANOVA F, Mann–Whitney U and Kruskal–Wallis asymptotics; normality via Shapiro–Wilk and Lilliefors-KS). The 95% CI for r uses the Fisher z-transform.",
  "Causality: associations and regressions describe predictive relationships, not causal mechanisms; region-level results are descriptive only.",
  "Data provenance: demographic/structural figures are constituency-level ELSTAT-based estimates; vote shares are the model's baseline reconstruction; turnout is available only where valid-vote counts are supplied.",
];

export function buildReadout(result, meta) {
  const { n, r, rP, rho, ols } = result, party = meta.partyName, demo = meta.demoLabel, unit = meta.unitLabel, baseline = meta.baselineLabel;
  if (!isFinite(r) || n < 3) return `There are too few ${unit} with both ${party}'s ${baseline} value and ${demo} present (n = ${n}) to estimate a reliable correlation.`;
  const dir = r >= 0 ? "higher" : "lower", band = strengthBand(Math.abs(r));
  const sig = isFinite(rP) ? (rP < 0.05 ? "statistically significant at the 5% level" : "not statistically significant at the conventional 5% level") : "of undetermined significance";
  const eq = `${party} = ${ols.intercept.toFixed(2)} ${ols.slope >= 0 ? "+" : "−"} ${Math.abs(ols.slope).toFixed(3)} × ${demo}`;
  const rhoNote = isFinite(rho) ? ` Spearman's ρ = ${fmtR(rho)} gives a rank-based check in the ${(r >= 0) === (rho >= 0) ? "same" : "opposite"} direction.` : "";
  return `Across the ${n} ${unit}, ${party}'s ${baseline} value shows a ${band} ${r >= 0 ? "positive" : "negative"} association with ${demo}: ${unit} ranking higher on ${demo} tend to record ${dir} ${party} values (Pearson r = ${fmtR(r)}, ${fmtP(rP)}, n = ${n}). This is ${sig}.${rhoNote} The least-squares fit (${eq}) accounts for R² = ${(ols.r2 * 100).toFixed(1)}% of the between-unit variance. Because this is an aggregate relationship, it describes places, not people (ecological fallacy).`;
}