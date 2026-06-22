import { memo } from "react";
import * as d3 from "d3";
import { mean, sd, quantile, normInv } from "./greece-stats.js";

const clean = a => a.filter(v => typeof v === "number" && isFinite(v));

function kde(values, m, s, grid) {
  const n = values.length, srt = [...values].sort((a, b) => a - b);
  const iqr = quantile(srt, 0.75) - quantile(srt, 0.25);
  const h = 0.9 * Math.min(s, (iqr || s) / 1.349) * Math.pow(n, -0.2) || s * 0.3;
  return grid.map(x => ({ x, y: values.reduce((acc, v) => acc + Math.exp(-0.5 * ((x - v) / h) ** 2), 0) / (n * h * 2.5066282746310002) }));
}

// Custom RGB Interpolator for a clean diverging correlation scale (Red = Pos, White = Zero, Blue = Neg)
function getCorrelationColor(r) {
  if (!isFinite(r)) return "var(--bg-base)";
  const val = Math.max(-1, Math.min(1, r));
  if (val >= 0) {
    // White to Crimson (#DC2626)
    const g = Math.round(255 - (255 - 38) * val);
    const b = Math.round(255 - (255 - 38) * val);
    return `rgb(220, ${g}, ${b})`;
  } else {
    // White to Royal Blue (#2563EB)
    const abs = Math.abs(val);
    const rComp = Math.round(255 - (255 - 37) * abs);
    const gComp = Math.round(255 - (255 - 99) * abs);
    return `rgb(${rComp}, ${gComp}, 235)`;
  }
}

/* ── HISTOGRAM + DENSITY OVERLAY ── */
export const Histogram = memo(function Histogram({ values: raw, color = "#2563EB", xLabel = "value", height = 240 }) {
  const v = clean(raw); if (v.length < 3) return <Empty h={height} />;
  const W = 700, H = height, M = { t: 14, r: 16, b: 40, l: 40 };
  const m = mean(v), s = sd(v), lo = Math.min(...v), hi = Math.max(...v);
  const nb = Math.max(5, Math.min(20, Math.ceil(Math.log2(v.length) + 1))); 
  const bw = (hi - lo) / nb || 1, bins = new Array(nb).fill(0);
  for (const x of v) bins[Math.min(nb - 1, Math.floor((x - lo) / bw))]++;
  const maxC = Math.max(...bins);
  const sx = d3.scaleLinear().domain([lo, hi]).range([M.l, W - M.r]);
  const sy = d3.scaleLinear().domain([0, maxC]).range([H - M.b, M.t]);
  const grid = d3.range(40).map(i => lo + (hi - lo) * i / 39);
  const dens = kde(v, m, s, grid), maxD = Math.max(...dens.map(d => d.y));
  const syD = d3.scaleLinear().domain([0, maxD]).range([H - M.b, M.t]);
  const normD = grid.map(x => ({ x, y: Math.exp(-0.5 * ((x - m) / s) ** 2) / (s * 2.5066282746310002) }));
  const line = (pts, sc) => pts.map((d, i) => `${i ? "L" : "M"}${sx(d.x)},${sc(d.y)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={SVG}>
      {sy.ticks(4).map((t, i) => <line key={i} x1={M.l} x2={W - M.r} y1={sy(t)} y2={sy(t)} stroke="var(--border)" opacity="0.4" />)}
      {bins.map((c, i) => <rect key={i} x={sx(lo + i * bw) + 1} y={sy(c)} width={Math.max(0, sx(lo + bw) - sx(lo) - 2)} height={H - M.b - sy(c)} fill={color} fillOpacity="0.55" />)}
      <path d={line(normD, syD)} fill="none" stroke="var(--text-dim)" strokeWidth="1.5" strokeDasharray="5 3" opacity="0.8" />
      
      {/* BUG WAS HERE: It is now correctly line(dens, syD) */}
      <path d={line(dens, syD)} fill="none" stroke="var(--text-main)" strokeWidth="2" />
      
      <line x1={M.l} x2={W - M.r} y1={H - M.b} y2={H - M.b} stroke="var(--border)" />
      {sx.ticks(6).map((t, i) => <text key={i} x={sx(t)} y={H - M.b + 16} textAnchor="middle" fontSize="10" fill="var(--text-dim)">{fmtTick(t)}</text>)}
      <text x={(M.l + W - M.r) / 2} y={H - 6} textAnchor="middle" fontSize="11" fill="var(--text-muted)" fontWeight="600">{xLabel}</text>
    </svg>
  );
});

/* ── BOX PLOT ── */
export const BoxPlot = memo(function BoxPlot({ values: raw, labels = [], color = "#2563EB", height = 150 }) {
  const pts = raw.map((v, i) => ({ v, label: labels[i] })).filter(p => typeof p.v === "number" && isFinite(p.v));
  const v = pts.map(p => p.v); if (v.length < 3) return <Empty h={height} />;
  const W = 700, H = height, M = { l: 24, r: 24 }, cy = H / 2 - 8;
  const srt = [...v].sort((a, b) => a - b), q1 = quantile(srt, 0.25), q3 = quantile(srt, 0.75), med = quantile(srt, 0.5), iqr = q3 - q1;
  const loF = q1 - 1.5 * iqr, hiF = q3 + 1.5 * iqr;
  const inn = v.filter(x => x >= loF && x <= hiF), wLo = Math.min(...inn), wHi = Math.max(...inn);
  const lo = Math.min(...v), hi = Math.max(...v), pad = (hi - lo) * 0.05 || 1;
  const sx = d3.scaleLinear().domain([lo - pad, hi + pad]).range([M.l, W - M.r]);
  const out = pts.filter(p => p.v < loF || p.v > hiF);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={SVG}>
      <line x1={sx(wLo)} x2={sx(wHi)} y1={cy} y2={cy} stroke="var(--text-muted)" strokeWidth="1.5" />
      <line x1={sx(wLo)} x2={sx(wLo)} y1={cy - 10} y2={cy + 10} stroke="var(--text-muted)" strokeWidth="1.5" />
      <line x1={sx(wHi)} x2={sx(wHi)} y1={cy - 10} y2={cy + 10} stroke="var(--text-muted)" strokeWidth="1.5" />
      <rect x={sx(q1)} y={cy - 18} width={sx(q3) - sx(q1)} height={36} fill={color} fillOpacity="0.35" stroke={color} strokeWidth="1.5" />
      <line x1={sx(med)} x2={sx(med)} y1={cy - 18} y2={cy + 18} stroke="var(--text-bright)" strokeWidth="3" />
      {out.map((p, i) => <g key={i}><circle cx={sx(p.v)} cy={cy} r="4" fill="var(--bg-base)" stroke="#EF4444" strokeWidth="1.5" /><text x={sx(p.v)} y={cy - 22} textAnchor="middle" fontSize="9" fill="var(--text-bright)" fontWeight="700">{p.label}</text></g>)}
      <line x1={M.l} x2={W - M.r} y1={H - 20} y2={H - 20} stroke="var(--border)" />
      {sx.ticks(6).map((t, i) => <text key={i} x={sx(t)} y={H - 6} textAnchor="middle" fontSize="10" fill="var(--text-dim)">{fmtTick(t)}</text>)}
    </svg>
  );
});

/* ── VIOLIN PLOT ── */
export const ViolinPlot = memo(function ViolinPlot({ values: raw, color = "#2563EB", height = 180 }) {
  const v = clean(raw); if (v.length < 4) return <Empty h={height} />;
  const W = 700, H = height, M = { t: 12, r: 16, b: 30, l: 16 }, cy = (M.t + H - M.b) / 2;
  const m = mean(v), s = sd(v), lo = Math.min(...v), hi = Math.max(...v);
  const grid = d3.range(60).map(i => lo + (hi - lo) * i / 59);
  const dens = kde(v, m, s, grid), maxD = Math.max(...dens.map(d => d.y)) || 1;
  const sx = d3.scaleLinear().domain([lo, hi]).range([M.l, W - M.r]);
  const halfH = (H - M.t - M.b) / 2 - 4;
  const top = dens.map((d, i) => `${i ? "L" : "M"}${sx(d.x)},${cy - (d.y / maxD) * halfH}`).join(" ");
  const bot = dens.slice().reverse().map(d => `L${sx(d.x)},${cy + (d.y / maxD) * halfH}`).join(" ");
  const srt = [...v].sort((a, b) => a - b);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={SVG}>
      <path d={`${top} ${bot} Z`} fill={color} fillOpacity="0.25" stroke={color} strokeWidth="1.5" />
      <line x1={sx(quantile(srt, 0.25))} x2={sx(quantile(srt, 0.75))} y1={cy} y2={cy} stroke="var(--text-bright)" strokeWidth="5" strokeLinecap="round" />
      <circle cx={sx(quantile(srt, 0.5))} cy={cy} r="3.5" fill="var(--bg-mid)" stroke="var(--text-bright)" strokeWidth="2" />
      <line x1={M.l} x2={W - M.r} y1={H - 20} y2={H - 20} stroke="var(--border)" />
      {sx.ticks(6).map((t, i) => <text key={i} x={sx(t)} y={H - 6} textAnchor="middle" fontSize="10" fill="var(--text-dim)">{fmtTick(t)}</text>)}
    </svg>
  );
});

/* ── NORMAL Q-Q PLOT ── */
export const QQPlot = memo(function QQPlot({ values: raw, color = "#2563EB", height = 240, title = "" }) {
  const v = clean(raw); if (v.length < 4) return <Empty h={height} />;
  const W = 700, H = height, M = { t: 14, r: 16, b: 42, l: 48 };
  const srt = [...v].sort((a, b) => a - b), n = srt.length, m = mean(v), s = sd(v);
  const pts = srt.map((y, i) => ({ tq: normInv((i + 0.5) / n), sq: y }));
  const tqs = pts.map(p => p.tq), sqs = pts.map(p => p.sq);
  const sx = d3.scaleLinear().domain([Math.min(...tqs), Math.max(...tqs)]).range([M.l, W - M.r]);
  const sy = d3.scaleLinear().domain([Math.min(...sqs), Math.max(...sqs)]).range([H - M.b, M.t]);
  const x0 = Math.min(...tqs), x1 = Math.max(...tqs);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={SVG}>
      {sy.ticks(5).map((t, i) => <line key={i} x1={M.l} x2={W - M.r} y1={sy(t)} y2={sy(t)} stroke="var(--border)" opacity="0.3" />)}
      <line x1={sx(x0)} y1={sy(m + s * x0)} x2={sx(x1)} y2={sy(m + s * x1)} stroke="var(--text-muted)" strokeWidth="2" strokeDasharray="6 4" />
      {pts.map((p, i) => <circle key={i} cx={sx(p.tq)} cy={sy(p.sq)} r="3.5" fill={color} fillOpacity="0.85" stroke="var(--bg-mid)" strokeWidth="0.8" />)}
      <line x1={M.l} x2={W - M.r} y1={H - M.b} y2={H - M.b} stroke="var(--border)" />
      <line x1={M.l} x2={M.l} y1={M.t} y2={H - M.b} stroke="var(--border)" />
      {sx.ticks(6).map((t, i) => <text key={i} x={sx(t)} y={H - M.b + 16} textAnchor="middle" fontSize="10" fill="var(--text-dim)">{t.toFixed(1)}</text>)}
      <text x={(M.l + W - M.r) / 2} y={H - 6} textAnchor="middle" fontSize="11" fill="var(--text-muted)" fontWeight="600">Theoretical normal quantiles</text>
      <text transform={`translate(13 ${(M.t + H - M.b) / 2}) rotate(-90)`} textAnchor="middle" fontSize="11" fill="var(--text-muted)" fontWeight="600">Sample quantiles</text>
    </svg>
  );
});

/* ── CORRELATION HEATMAP MATRIX ── */
export const CorrelationHeatmap = memo(function CorrelationHeatmap({ matrix = [], xLabels = [], yLabels = [] }) {
  if (!matrix.length || !xLabels.length || !yLabels.length) return <Empty h={200} />;
  
  return (
    <div style={{ overflowX: "auto", width: "100%", marginTop: 10 }}>
      <table style={{ borderCollapse: "collapse", width: "100%", fontFamily: "var(--ff-mono)", fontSize: 11 }}>
        <thead>
          <tr>
            <th style={{ padding: "8px", border: "1px solid var(--border)", background: "var(--bg-up)", color: "var(--text-dim)", textAlign: "left" }}>Target Metric</th>
            {xLabels.map((xl, idx) => (
              <th key={idx} style={{ padding: "8px", border: "1px solid var(--border)", background: "var(--bg-up)", color: "var(--text-title)", textAlign: "center", minWidth: 80 }}>
                {xl}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {yLabels.map((yl, yIdx) => (
            <tr key={yIdx}>
              <td style={{ padding: "8px", border: "1px solid var(--border)", background: "var(--bg-mid)", color: "var(--text-main)", fontWeight: 700 }}>
                {yl}
              </td>
              {xLabels.map((xl, xIdx) => {
                const rVal = matrix[yIdx]?.[xIdx];
                const cellBg = getCorrelationColor(rVal);
                // Dynamically swap text foreground contrast matching luminance shifts
                const textColor = Math.abs(rVal) > 0.45 ? "#FFF" : "var(--text-bright)";
                return (
                  <td key={xIdx} style={{ 
                    padding: "10px", 
                    border: "1px solid var(--border)", 
                    backgroundColor: cellBg, 
                    color: textColor, 
                    textAlign: "center",
                    fontWeight: 700,
                    transition: "background-color 0.2s ease"
                  }}>
                    {typeof rVal === "number" && isFinite(rVal) ? rVal.toFixed(3) : "—"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

const SVG = { width: "100%", height: "auto", display: "block", fontFamily: "var(--ff-body)" };
function fmtTick(t) { return Math.abs(t) >= 10000 ? d3.format(".2s")(t) : (Math.round(t) === t ? t : t.toFixed(1)); }
function Empty({ h }) { return <div style={{ height: h, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-dim)", fontFamily: "var(--ff-body)", fontSize: 12 }}>Insufficient variance to render parameters.</div>; }
