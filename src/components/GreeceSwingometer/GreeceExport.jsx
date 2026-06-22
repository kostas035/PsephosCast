// GreeceExport.jsx
// Modular export composer for the Greece Swingometer — v2.
//
// What changed from v1, and why:
//  • ONE board, not two. v1 rendered the editor at one cell size and the
//    captured PNG at another (a hidden 1480px copy with different cell heights),
//    so what you arranged was never what downloaded. Now a single <ExportBoard>
//    is rendered at native export pixels and the on-screen editor is just that
//    same node scaled down with a CSS transform (fit-to-viewport via
//    ResizeObserver). Editor === download. This is the "stick better" fix.
//  • FORMATS — Landscape / Square / Portrait / Phone. Each carries its own
//    pixel size AND grid (cols×rows); Phone is a single tall column. Switching
//    format re-packs the panels into a valid layout (packItems).
//  • Content-scale slider (per board) shrinks the chunky bits — the odds bars,
//    labels and legends — without touching the layout. This is the
//    "make the bars smaller" knob.
//  • Parliament panel is now wrapped + clipped so the hemicycle's labels can no
//    longer spill out and cover the map.
//  • Boards / "slides": you can build several boards and "Download all" emits
//    one PNG per board. "Download this" emits just the active one.
//
// Nothing re-runs engine work the page already did, except the Monte-Carlo
// simulation, computed once and only if any board has an MC panel. Maps reuse
// the live <Map>; poll/MC charts are hand-rolled SVG so html2canvas captures
// them crisply at any scale.

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { S } from "./GreeceStyles";
import { GR, GR_PARTY_DICT } from "./greece-data.js";
import { POLL_PARTIES_MAPPING, DEFAULT_HIDDEN_PARTIES } from "./greece-utils.js";
import { grRunMonteCarlo } from "./greece-montecarlo.js";
import { IconCamera } from "./GreeceIcons";
import Map from "./Map";
import Hemicycle, { GrCoalitionBuilder } from "./Hemicycle";

/* ────────────────────────────── panel registry ───────────────────────────── */

const PANELS = [
  { type: "greece_map", label: "Map of Greece",            icon: "🗺️", needsMc: false },
  { type: "athens_map", label: "Athens (zoomed in)",        icon: "🏙️", needsMc: false },
  { type: "parliament", label: "Parliament makeup",         icon: "🏛️", needsMc: false, defH: 2 },
  { type: "mc_odds",    label: "Forecast · odds & range",   icon: "🎲", needsMc: true  },
  { type: "mc_dist",    label: "Forecast · seat spread",    icon: "📈", needsMc: true  },
  { type: "polls",      label: "Opinion polling",           icon: "📊", needsMc: false },
];
const PANEL = Object.fromEntries(PANELS.map((p) => [p.type, p]));

/* ─────────────────────────────── formats ─────────────────────────────────── */
/* Each format owns its export pixel box AND its grid. w/h are the *native*
 * capture dimensions; the editor scales this down to fit. */
const FORMATS = {
  landscape: { label: "Landscape · 3:2", w: 1480, h: 980,  cols: 2, rows: 2 },
  square:    { label: "Square · 1:1",    w: 1280, h: 1280, cols: 2, rows: 2 },
  portrait:  { label: "Portrait · 4:5",  w: 1080, h: 1350, cols: 2, rows: 3 },
  phone:     { label: "Phone · 9:16",    w: 1080, h: 1920, cols: 1, rows: 4 },
};
const fmtOf = (key) => FORMATS[key] || FORMATS.landscape;

/* ───────────────────────────────── helpers ───────────────────────────────── */

const covered = (items, c, r) => items.some((it) => c >= it.col && c < it.col + it.w && r >= it.row && r < it.row + it.h);

// Reachable sizes for an item anchored at (col,row) within a cols×rows grid.
// "Full" spans the entire board (works on phone's 1×4 too → whole screen).
function sizesFor(col, row, cols, rows) {
  const out = [{ w: 1, h: 1, key: "cell", label: "Cell" }];
  if (col + 2 <= cols) out.push({ w: 2, h: 1, key: "wide", label: "Wide" });
  if (row + 2 <= rows) out.push({ w: 1, h: 2, key: "tall", label: "Tall" });
  for (let h = 3; row + h <= rows; h++) out.push({ w: 1, h, key: `tall${h}`, label: `Tall×${h}` });
  if (col === 0 && row === 0 && cols * rows > 1) out.push({ w: cols, h: rows, key: "full", label: "Full" });
  return out;
}

// Re-flow items into a valid layout for a (possibly new) cols×rows grid.
// Clamp each item's footprint, then place it in the first free slot, row-major.
// Falls back to smaller footprints; drops an item only if nothing fits.
function packItems(items, cols, rows) {
  const placed = [];
  const overlaps = (c, r, w, h) =>
    placed.some((it) => c < it.col + it.w && c + w > it.col && r < it.row + it.h && r + h > it.row);
  const findSlot = (w, h) => {
    for (let r = 0; r + h <= rows; r++) for (let c = 0; c + w <= cols; c++) if (!overlaps(c, r, w, h)) return { c, r };
    return null;
  };
  for (const it of items) {
    const candidates = [
      [Math.min(it.w, cols), Math.min(it.h, rows)],
      [Math.min(it.w, cols), 1],
      [1, Math.min(it.h, rows)],
      [1, 1],
    ];
    for (const [w, h] of candidates) {
      const s = findSlot(w, h);
      if (s) { placed.push({ ...it, col: s.c, row: s.r, w, h }); break; }
    }
  }
  return placed;
}

const monthLabel = (ts) => { const d = new Date(ts); return `${d.toLocaleString("en-US", { month: "short" })} '${String(d.getFullYear()).slice(2)}`; };

/* LOESS — local linear fit, tri-cube kernel (ported from OpinionPolls so the
 * export trend line matches the on-page one). */
function loess(xs, ys, evalXs, span = 0.12) {
  const n = xs.length;
  if (n === 0) return evalXs.map(() => null);
  if (n < 3) { const m = ys.reduce((a, b) => a + b, 0) / n; return evalXs.map((x) => (x < xs[0] || x > xs[n - 1]) ? null : m); }
  const minX = xs[0], maxX = xs[n - 1];
  const q = Math.max(2, Math.min(n, Math.ceil(span * n)));
  return evalXs.map((x0) => {
    if (x0 < minX || x0 > maxX) return null;
    const dists = xs.map((x) => Math.abs(x - x0));
    const h = [...dists].sort((a, b) => a - b)[q - 1] || 1e-9;
    let sw = 0, swx = 0, swy = 0, swxx = 0, swxy = 0;
    for (let i = 0; i < n; i++) {
      const u = dists[i] / h;
      if (u >= 1) continue;
      const w = (1 - u * u * u) ** 3;
      sw += w; swx += w * xs[i]; swy += w * ys[i]; swxx += w * xs[i] * xs[i]; swxy += w * xs[i] * ys[i];
    }
    if (sw === 0) return null;
    const denom = sw * swxx - swx * swx;
    if (Math.abs(denom) < 1e-12) return Math.max(0, swy / sw);
    const b = (sw * swxy - swx * swy) / denom;
    const a = (swy - b * swx) / sw;
    return Math.max(0, a + b * x0);
  });
}

const fmtPct = (p) => `${Math.round(p * 100)}%`;

/* ─────────────────────────── MC: odds & seat range ────────────────────────── */
/* `cs` (content scale) shrinks/grows the bars, labels and fonts without
 * touching the grid layout. */

function McOddsExport({ mc, cs = 1 }) {
  if (!mc) return <Empty>No qualifying parties to simulate.</Empty>;
  const z = (n) => Math.max(1, Math.round(n * cs));
  const axisMax = Math.max(160, Math.max(...mc.parties.map((p) => p.p95)) + 10);
  const leader = mc.parties.reduce((a, b) => (b.pFirst > (a?.pFirst ?? -1) ? b : a), null);
  const rows = mc.parties.filter((p) => p.p95 > 0 || p.mean > 0.5);

  return (
    <PanelFrame title="Odds & seat range per party">
      {leader && (
        <div style={{ fontSize: z(12), lineHeight: 1.5, color: "var(--text-main)", fontFamily: "var(--ff-body)", marginBottom: z(12) }}>
          <strong style={{ color: leader.color }}>{leader.name}</strong> finishes first in <strong>{fmtPct(leader.pFirst)}</strong> of runs ·
          {" "}hung parliament <strong>{fmtPct(mc.pHung)}</strong>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: z(9), flex: 1, justifyContent: "center" }}>
        {rows.map((p) => {
          const left = (p.p5 / axisMax) * 100;
          const width = Math.max(0.8, ((p.p95 - p.p5) / axisMax) * 100);
          const med = (p.median / axisMax) * 100;
          return (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: z(8) }}>
              <div style={{ display: "flex", alignItems: "center", gap: z(5), width: z(92), flexShrink: 0 }}>
                <div style={{ width: 3, height: z(15), borderRadius: 2, background: p.color }} />
                <span style={{ fontSize: z(12), color: "var(--text-main)", fontWeight: 600, fontFamily: "var(--ff-body)" }}>{p.name}</span>
              </div>
              <div style={{ flex: 1, position: "relative", height: z(18), background: "var(--bg-up)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ position: "absolute", left: `${(GR.MAJORITY / axisMax) * 100}%`, top: 0, bottom: 0, width: 1, background: "#F59E0B", opacity: 0.7, zIndex: 3 }} />
                <div style={{ position: "absolute", left: `${left}%`, width: `${width}%`, top: 3, bottom: 3, background: `${p.color}55`, border: `1px solid ${p.color}`, borderRadius: 3 }} />
                <div style={{ position: "absolute", left: `${med}%`, top: 1, bottom: 1, width: 2, background: p.color, zIndex: 2 }} />
              </div>
              <div style={{ width: z(80), fontSize: z(11), ...S.mono, textAlign: "right", flexShrink: 0 }}>
                <span style={{ color: "var(--text-bright)", fontWeight: 700 }}>{p.median}</span>
                <span style={{ color: "var(--text-dim)" }}> ({p.p5}–{p.p95})</span>
              </div>
              <div style={{ width: z(38), fontSize: z(11), ...S.mono, textAlign: "right", color: p.pFirst >= 0.01 ? "#60A5FA" : "var(--text-dim)", flexShrink: 0 }}>
                {p.pFirst >= 0.005 ? fmtPct(p.pFirst) : "—"}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: z(9), color: "var(--text-dim)", marginTop: z(10), display: "flex", flexWrap: "wrap", gap: z(12), fontFamily: "var(--ff-body)" }}>
        <span>bar = 90% range · tick = median</span>
        <span style={{ color: "#F59E0B" }}>│ 151 majority</span>
        <span style={{ color: "#60A5FA" }}>right = chance of 1st · {mc.iterations.toLocaleString()} runs</span>
      </div>
    </PanelFrame>
  );
}

/* ──────────────────────── MC: seat-distribution curves ─────────────────────── */

function McDistExport({ mc, showIds, cs = 1 }) {
  const z = (n) => Math.max(1, Math.round(n * cs));
  const dist = useMemo(() => {
    if (!mc || !mc.seatMatrix) return null;
    const ids = showIds.filter((id) => mc.parties.some((p) => p.id === id));
    if (!ids.length) return null;
    let maxSeat = 0;
    ids.forEach((id) => { for (let s = 0; s < mc.iterations; s++) { const v = mc.seatMatrix[s][id] || 0; if (v > maxSeat) maxSeat = v; } });
    const distMax = Math.min(GR.TOTAL_SEATS, Math.max(60, Math.ceil((maxSeat + 6) / 20) * 20));
    const N = distMax + 1;
    const h = Math.max(1, Math.round(distMax / 55));
    const series = ids.map((id) => {
      const meta = mc.parties.find((p) => p.id === id);
      const counts = new Array(N).fill(0);
      for (let s = 0; s < mc.iterations; s++) { const v = mc.seatMatrix[s][id] || 0; if (v >= 0 && v < N) counts[v]++; }
      const peakRaw = Math.max(1, ...counts);
      const sm = new Array(N);
      for (let i = 0; i < N; i++) { let sum = 0, n = 0; for (let k = i - h; k <= i + h; k++) if (k >= 0 && k < N) { sum += counts[k]; n++; } sm[i] = sum / n; }
      const peakSm = Math.max(1, ...sm);
      return { id, name: meta?.name, color: meta?.color || "#888", median: meta?.median ?? 0, p5: meta?.p5 ?? 0, p95: meta?.p95 ?? 0, counts, peakRaw, sm, peakSm };
    });
    return { series, distMax, N };
  }, [mc, showIds]);

  if (!mc) return <Empty>No qualifying parties to simulate.</Empty>;
  if (!dist) return <Empty>Pick at least one party to chart.</Empty>;

  const VBW = 760, VBH = 320, padL = 12, padR = 12, padT = 26, padB = 30;
  const plotW = VBW - padL - padR, plotH = VBH - padT - padB, baseline = padT + plotH;
  const maxH = plotH * 0.84;
  const X = (seat) => padL + (seat / dist.distMax) * plotW;
  const barW = Math.max(0.8, (plotW / dist.distMax) * 0.9);
  const ticks = []; for (let t = 0; t <= dist.distMax; t += 50) ticks.push(t);

  return (
    <PanelFrame title="Seat distribution — frequency of each total across all runs">
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", background: "var(--bg-up)", border: "1px solid var(--divider)", borderRadius: 6, padding: "6px 6px 2px" }}>
        <svg viewBox={`0 0 ${VBW} ${VBH}`} style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={X(t)} y1={padT} x2={X(t)} y2={baseline} stroke="var(--border)" strokeWidth={1} opacity={0.35} />
              <text x={X(t)} y={baseline + 16} textAnchor="middle" fontSize={10} fill="var(--text-dim)" fontFamily="var(--ff-mono)">{t}</text>
            </g>
          ))}
          {GR.MAJORITY <= dist.distMax && (
            <g>
              <line x1={X(GR.MAJORITY)} y1={padT - 4} x2={X(GR.MAJORITY)} y2={baseline} stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="3 3" opacity={0.85} />
              <text x={X(GR.MAJORITY)} y={padT - 7} textAnchor="middle" fontSize={9} fill="#F59E0B" fontFamily="var(--ff-mono)">151</text>
            </g>
          )}
          <line x1={padL} y1={baseline} x2={VBW - padR} y2={baseline} stroke="var(--border)" strokeWidth={1} />
          {dist.series.map((s) => (
            <g key={`b-${s.id}`}>
              {s.counts.map((c, seat) => c > 0 ? (
                <rect key={seat} x={X(seat) - barW / 2} y={baseline - (c / s.peakRaw) * maxH} width={barW} height={(c / s.peakRaw) * maxH} fill={s.color} opacity={0.22} />
              ) : null)}
            </g>
          ))}
          {dist.series.map((s) => {
            const pts = s.sm.map((v, i) => [X(i), baseline - (v / s.peakSm) * maxH]);
            const line = "M " + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L ");
            return <path key={`l-${s.id}`} d={line} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" />;
          })}
          {dist.series.map((s) => (
            <g key={`m-${s.id}`}>
              <line x1={X(s.median)} y1={baseline} x2={X(s.median)} y2={baseline - maxH - 2} stroke={s.color} strokeWidth={1} opacity={0.5} />
              <text x={X(s.median)} y={baseline - maxH - 6} textAnchor="middle" fontSize={11} fontWeight={700} fill={s.color} fontFamily="var(--ff-mono)">{s.median}</text>
            </g>
          ))}
        </svg>
        <div style={{ display: "flex", flexWrap: "wrap", gap: z(12), padding: "6px 6px 2px" }}>
          {dist.series.map((s) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: z(6) }}>
              <div style={{ width: z(9), height: 3, borderRadius: 2, background: s.color }} />
              <span style={{ fontSize: z(10), color: "var(--text-main)", fontWeight: 600, fontFamily: "var(--ff-body)" }}>{s.name}</span>
              <span style={{ fontSize: z(9), ...S.mono, color: "var(--text-dim)" }}>med {s.median} · 90% {s.p5}–{s.p95}</span>
            </div>
          ))}
        </div>
      </div>
    </PanelFrame>
  );
}

/* ──────────────────────────── opinion-poll chart ──────────────────────────── */

function PollChartExport({ polls, from, to, hidden, smooth, cs = 1 }) {
  const z = (n) => Math.max(1, Math.round(n * cs));
  const data = useMemo(() => (polls?.length ? [...polls].sort((a, b) => a.timestamp - b.timestamp) : []), [polls]);
  const vis = POLL_PARTIES_MAPPING.filter((p) => !hidden.includes(p.key));

  const chart = useMemo(() => {
    if (data.length < 2) return null;
    const inRange = data.filter((d) => d.timestamp >= from && d.timestamp <= to);
    let yMax = 0;
    const series = vis.map((p) => {
      const xs = [], ys = [];
      data.forEach((d) => { if (d[p.key] != null && !isNaN(d[p.key])) { xs.push(d.timestamp); ys.push(d[p.key]); } });
      let pts;
      if (smooth) {
        const grid = []; const STEPS = 80;
        for (let i = 0; i <= STEPS; i++) grid.push(from + ((to - from) * i) / STEPS);
        const fit = loess(xs, ys, grid);
        pts = grid.map((t, i) => (fit[i] == null ? null : { t, v: fit[i] })).filter(Boolean);
      } else {
        pts = [];
        for (let i = 0; i < xs.length; i++) if (xs[i] >= from && xs[i] <= to) pts.push({ t: xs[i], v: ys[i] });
      }
      pts.forEach((q) => { if (q.v > yMax) yMax = q.v; });
      const color = GR_PARTY_DICT[p.dictKey]?.color || p.color || "#ccc";
      return { key: p.key, color, pts };
    }).filter((s) => s.pts.length > 1);
    yMax = Math.max(10, Math.ceil((yMax + 2) / 5) * 5);
    return { series, yMax, inRangeCount: inRange.length };
  }, [data, from, to, hidden, smooth]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!polls?.length) return <Empty>No poll data loaded.</Empty>;
  if (!chart || !chart.series.length) return <Empty>No polls in this date range.</Empty>;

  const VBW = 760, VBH = 360, padL = 34, padR = 12, padT = 14, padB = 28;
  const plotW = VBW - padL - padR, plotH = VBH - padT - padB, baseY = padT + plotH;
  const X = (t) => padL + ((t - from) / (to - from || 1)) * plotW;
  const Y = (v) => baseY - (v / chart.yMax) * plotH;

  const xTicks = []; const TN = 5;
  for (let i = 0; i <= TN; i++) xTicks.push(from + ((to - from) * i) / TN);
  const yStep = chart.yMax > 30 ? 10 : 5;
  const yTicks = []; for (let v = 0; v <= chart.yMax; v += yStep) yTicks.push(v);

  return (
    <PanelFrame title={`Opinion polling · ${monthLabel(from)} → ${monthLabel(to)}`}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <svg viewBox={`0 0 ${VBW} ${VBH}`} style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}>
          {yTicks.map((v) => (
            <g key={`y${v}`}>
              <line x1={padL} y1={Y(v)} x2={VBW - padR} y2={Y(v)} stroke="var(--border)" strokeWidth={1} opacity={0.3} strokeDasharray="3 3" />
              <text x={padL - 6} y={Y(v) + 3} textAnchor="end" fontSize={10} fill="var(--text-dim)" fontFamily="var(--ff-mono)">{v}</text>
            </g>
          ))}
          {xTicks.map((t, i) => (
            <text key={`x${i}`} x={X(t)} y={baseY + 17} textAnchor="middle" fontSize={10} fill="var(--text-dim)" fontFamily="var(--ff-mono)">{monthLabel(t)}</text>
          ))}
          <line x1={padL} y1={baseY} x2={VBW - padR} y2={baseY} stroke="var(--border)" strokeWidth={1} />
          {chart.series.map((s) => {
            const d = "M " + s.pts.map((q) => `${X(q.t).toFixed(1)} ${Y(q.v).toFixed(1)}`).join(" L ");
            return (
              <g key={s.key}>
                <path d={d} fill="none" stroke={s.color} strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round" />
                {!smooth && s.pts.map((q, i) => <circle key={i} cx={X(q.t)} cy={Y(q.v)} r={2.4} fill={s.color} />)}
              </g>
            );
          })}
        </svg>
        <div style={{ display: "flex", flexWrap: "wrap", gap: `${z(5)}px ${z(12)}px`, justifyContent: "center", marginTop: z(6) }}>
          {chart.series.map((s) => (
            <div key={s.key} style={{ display: "flex", alignItems: "center", gap: z(5) }}>
              <div style={{ width: z(9), height: 3, borderRadius: 2, background: s.color }} />
              <span style={{ fontSize: z(10), color: "var(--text-main)", fontWeight: 600, fontFamily: "var(--ff-body)" }}>{s.key}</span>
            </div>
          ))}
        </div>
      </div>
    </PanelFrame>
  );
}

/* ─────────────────────────────── small chrome ─────────────────────────────── */

function Empty({ children }) {
  return <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 12, fontFamily: "var(--ff-body)", textAlign: "center", padding: 16 }}>{children}</div>;
}

function PanelFrame({ title, children }) {
  return (
    <div style={{ ...S.card, height: "100%", display: "flex", flexDirection: "column", padding: 14, boxSizing: "border-box", overflow: "hidden" }}>
      {title && <div style={{ ...S.label, marginBottom: 10 }}>{title}</div>}
      {children}
    </div>
  );
}

/* Renders a single placed panel's content (no editing chrome). */
function PanelBody({ item, ctx, mc, cs }) {
  switch (item.type) {
    case "greece_map":
      return (
        <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
          <Map districtResults={ctx.districtResults} parties={ctx.parties} electionResult={ctx.electionResult}
               featureSeatData={ctx.featureSeatData} geoCache={ctx.geoFeatures} isMobile={true}
               showDots={ctx.showDots} showLabels={ctx.showLabels} hideControls={true} />
        </div>
      );
    case "athens_map":
      return (
        <PanelFrame title="Athens Metropolitan Area">
          <div style={{ flex: 1, position: "relative", overflow: "hidden", borderRadius: 6, background: "var(--map-bg)", border: "1px solid var(--border)" }}>
            <Map districtResults={ctx.districtResults} parties={ctx.parties} electionResult={ctx.electionResult}
                 featureSeatData={ctx.atticaFeatureSeatData} geoCache={ctx.atticaGeoFeatures} isMobile={true}
                 showDots={ctx.showDots} showLabels={ctx.showLabels} isInset={true} />
          </div>
        </PanelFrame>
      );
    case "parliament":
      // Wrapped + clipped so the hemicycle's seat labels can't spill into the
      // neighbouring map cell.
      return ctx.electionResult?.results?.length > 0 ? (
        <PanelFrame title="Parliament makeup">
          <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <div style={{ width: "100%", maxHeight: "100%" }}>
              <Hemicycle electionResult={ctx.electionResult} parties={ctx.parties} />
            </div>
          </div>
        </PanelFrame>
      ) : <Empty>Parliament empty — no party cleared the threshold.</Empty>;
    case "mc_odds":  return <McOddsExport mc={mc} cs={cs} />;
    case "mc_dist":  return <McDistExport mc={mc} showIds={item.cfg.ids} cs={cs} />;
    case "polls":    return <PollChartExport polls={ctx.polls} from={item.cfg.from} to={item.cfg.to} hidden={item.cfg.hidden} smooth={item.cfg.smooth} cs={cs} />;
    default:         return null;
  }
}

/* ──────────────────────────── the grid (shared) ───────────────────────────── */

function ExportGrid({ items, ctx, mc, cols, rows, cs, editable, onAdd, onRemove, onResize, onConfig, mcParties }) {
  const empties = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (!covered(items, c, r)) empties.push({ c, r });

  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`, gap: 16, width: "100%", height: "100%" }}>
      {items.map((it) => (
        <div key={it.id} style={{ gridColumn: `${it.col + 1} / span ${it.w}`, gridRow: `${it.row + 1} / span ${it.h}`, minWidth: 0, minHeight: 0, position: "relative" }}>
          {editable && (
            <ItemToolbar item={it} cols={cols} rows={rows} mcParties={mcParties} onRemove={onRemove} onResize={onResize} onConfig={onConfig} polls={ctx.polls} />
          )}
          <div style={{ height: "100%" }}>
            <PanelBody item={it} ctx={ctx} mc={mc} cs={cs} />
          </div>
        </div>
      ))}
      {editable && empties.map(({ c, r }) => (
        <AddSlot key={`e-${c}-${r}`} col={c} row={r} onAdd={onAdd} hasMc={!!mc} />
      ))}
    </div>
  );
}

/* "+" placeholder with a panel picker. */
function AddSlot({ col, row, onAdd }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ gridColumn: `${col + 1}`, gridRow: `${row + 1}`, position: "relative", border: "2px dashed var(--border)", borderRadius: 10, background: "var(--bg-up)", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0 }}>
      {!open ? (
        <button onClick={() => setOpen(true)} title="Add a panel"
          style={{ width: 54, height: 54, borderRadius: "50%", border: "1px solid var(--border)", background: "var(--bg-mid)", color: "var(--text-dim)", fontSize: 30, lineHeight: 1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          +
        </button>
      ) : (
        <div style={{ width: "92%", maxWidth: 320, background: "var(--bg-mid)", border: "1px solid var(--border)", borderRadius: 10, padding: 10, boxShadow: "0 12px 30px rgba(0,0,0,0.35)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ ...S.label }}>Add panel</span>
            <button onClick={() => setOpen(false)} style={{ ...S.ghostBtn, padding: "2px 7px", border: "none" }}>✕</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {PANELS.map((p) => (
              <button key={p.type} onClick={() => { onAdd(col, row, p.type); setOpen(false); }}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 7, background: "var(--btn-bg)", border: "1px solid var(--border)", cursor: "pointer", color: "var(--text-main)", fontFamily: "var(--ff-body)", fontSize: 12, textAlign: "left" }}>
                <span style={{ fontSize: 17 }}>{p.icon}</span> {p.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* Per-item edit chrome: title, size buttons, remove, plus type-specific config. */
function ItemToolbar({ item, cols, rows, mcParties, onRemove, onResize, onConfig, polls }) {
  const meta = PANEL[item.type];
  const sizes = sizesFor(item.col, item.row, cols, rows);
  const pollRange = useMemo(() => {
    if (!polls?.length) return null;
    const ts = polls.map((p) => p.timestamp);
    return [Math.min(...ts), Math.max(...ts)];
  }, [polls]);

  return (
    <div style={{ position: "absolute", top: 6, left: 6, right: 6, zIndex: 6, display: "flex", flexDirection: "column", gap: 6, pointerEvents: "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, pointerEvents: "auto", background: "var(--bg-mid)", border: "1px solid var(--border)", borderRadius: 8, padding: "4px 6px", boxShadow: "0 4px 12px rgba(0,0,0,0.25)" }}>
        <span style={{ fontSize: 13 }}>{meta.icon}</span>
        <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--ff-body)", fontWeight: 600, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{meta.label}</span>
        {sizes.map((s) => {
          const active = s.w === item.w && s.h === item.h;
          return (
            <button key={s.key} onClick={() => onResize(item.id, s.w, s.h)} title={s.label}
              style={{ fontSize: 9, letterSpacing: 0.5, padding: "3px 7px", borderRadius: 5, cursor: "pointer", border: `1px solid ${active ? "#2563EB" : "var(--border)"}`, background: active ? "#2563EB22" : "var(--btn-bg)", color: active ? "#60A5FA" : "var(--text-dim)", fontFamily: "var(--ff-body)" }}>
              {s.label}
            </button>
          );
        })}
        <button onClick={() => onRemove(item.id)} title="Remove"
          style={{ fontSize: 12, padding: "2px 7px", borderRadius: 5, cursor: "pointer", border: "1px solid var(--border)", background: "var(--btn-bg)", color: "#F87171" }}>✕</button>
      </div>

      {/* Poll date (drag) + smoothing controls */}
      {item.type === "polls" && pollRange && (
        <div style={{ pointerEvents: "auto", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, background: "var(--bg-mid)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px" }}>
          <PollRangeSlider min={pollRange[0]} max={pollRange[1]} from={item.cfg.from} to={item.cfg.to}
            onChange={(patch) => onConfig(item.id, patch)} />
          <button onClick={() => onConfig(item.id, { smooth: !item.cfg.smooth })}
            style={{ fontSize: 9, padding: "3px 8px", borderRadius: 5, cursor: "pointer", border: "1px solid var(--border)", background: "var(--btn-bg)", color: item.cfg.smooth ? "#60A5FA" : "var(--text-dim)", fontFamily: "var(--ff-body)" }}>
            {item.cfg.smooth ? "📈 Trend" : "📉 Raw"}
          </button>
          <PartyToggle keys={POLL_PARTIES_MAPPING.map((p) => p.key)} hidden={item.cfg.hidden}
            onToggle={(k) => onConfig(item.id, { hidden: item.cfg.hidden.includes(k) ? item.cfg.hidden.filter((x) => x !== k) : [...item.cfg.hidden, k] })} />
        </div>
      )}

      {/* MC-distribution party picker */}
      {item.type === "mc_dist" && mcParties && (
        <div style={{ pointerEvents: "auto", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 5, background: "var(--bg-mid)", border: "1px solid var(--border)", borderRadius: 8, padding: "4px 6px" }}>
          {mcParties.filter((p) => p.mean >= 0.5).map((p) => {
            const active = item.cfg.ids.includes(p.id);
            return (
              <button key={p.id} onClick={() => onConfig(item.id, { ids: active ? item.cfg.ids.filter((x) => x !== p.id) : [...item.cfg.ids, p.id] })}
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 7px", borderRadius: 4, cursor: "pointer", background: active ? `${p.color}22` : "var(--btn-bg)", border: `1px solid ${active ? p.color : "var(--border)"}` }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: p.color }} />
                <span style={{ fontSize: 9, color: active ? "var(--text-title)" : "var(--text-muted)", fontFamily: "var(--ff-body)" }}>{p.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* Dual-handle drag slider for the poll date window — no typing. */
function PollRangeSlider({ min, max, from, to, onChange }) {
  const trackRef = useRef(null);
  const [drag, setDrag] = useState(null); // "from" | "to" | null
  const MIN_GAP = 86400000 * 14; // keep at least ~2 weeks between handles

  const valFromX = useCallback((clientX) => {
    const el = trackRef.current;
    if (!el) return min;
    const r = el.getBoundingClientRect();
    const f = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    return min + f * (max - min);
  }, [min, max]);

  const onMove = useCallback((e) => {
    if (!drag) return;
    const v = valFromX(e.clientX);
    if (drag === "from") onChange({ from: Math.min(v, to - MIN_GAP) });
    else onChange({ to: Math.max(v, from + MIN_GAP) });
  }, [drag, valFromX, onChange, to, from, MIN_GAP]);

  const end = useCallback((e) => {
    if (drag) { setDrag(null); try { e.target.releasePointerCapture(e.pointerId); } catch { /* no active pointer capture to release */ } }
  }, [drag]);

  if (!(max > min)) return null;
  const span = max - min;
  const pFrom = ((from - min) / span) * 100;
  const pTo = ((to - min) / span) * 100;

  return (
    <div style={{ width: 220, paddingTop: 16 }}>
      <div ref={trackRef} onPointerMove={onMove} onPointerUp={end} onPointerCancel={end} onPointerLeave={end}
        style={{ position: "relative", height: 18, cursor: "pointer", touchAction: "none" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 8, height: 4, background: "var(--bg-up)", border: "1px solid var(--border)", borderRadius: 2 }} />
        <div style={{ position: "absolute", left: `${pFrom}%`, width: `${pTo - pFrom}%`, top: 8, height: 4, background: "#60A5FA", borderRadius: 2 }} />
        {[{ which: "from", p: pFrom, t: from }, { which: "to", p: pTo, t: to }].map(({ which, p, t }) => (
          <div key={which}>
            <div style={{ position: "absolute", left: `${p}%`, top: -14, transform: p > 80 ? "translateX(-100%)" : p < 12 ? "translateX(0)" : "translateX(-50%)", fontSize: 9, color: "var(--text-muted)", fontFamily: "var(--ff-mono)", whiteSpace: "nowrap", pointerEvents: "none" }}>
              {monthLabel(t)}
            </div>
            <div onPointerDown={(e) => { e.preventDefault(); setDrag(which); e.target.setPointerCapture(e.pointerId); }}
              style={{ position: "absolute", left: `${p}%`, top: 10, width: 14, height: 14, transform: "translate(-50%,-50%)", borderRadius: "50%", background: drag === which ? "#3B82F6" : "#60A5FA", border: "2px solid var(--bg-mid)", cursor: "grab", boxShadow: drag === which ? "0 0 0 5px rgba(96,165,250,0.2)" : "0 1px 3px rgba(0,0,0,0.3)", zIndex: drag === which ? 10 : 5 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function PartyToggle({ keys, hidden, onToggle }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
      {keys.map((k) => {
        const off = hidden.includes(k);
        return (
          <button key={k} onClick={() => onToggle(k)}
            style={{ fontSize: 8, padding: "2px 6px", borderRadius: 10, cursor: "pointer", border: "1px solid var(--border)", background: off ? "transparent" : "var(--btn-bg)", color: off ? "var(--text-dim)" : "var(--text-main)", opacity: off ? 0.5 : 1, fontFamily: "var(--ff-body)" }}>
            {k}
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────────────── the board (editor === capture) ───────────────────── */
/* A single board rendered at native export pixels. The editor scales this down
 * with a CSS transform; html2canvas snapshots the un-scaled twin. Same markup,
 * same props → WYSIWYG. */
function ExportBoard({ board, ctx, mc, scenarioId, editable, onAdd, onRemove, onResize, onConfig }) {
  const fmt = fmtOf(board.format);
  const boardH = board.customH || fmt.h;
  const cs = board.cs ?? 1;
  const transparent = board.bg === "transparent";
  const pad = board.header ? 28 : 0;                 // title off → edge-to-edge screenshot
  // Map dot/label overrides so the export shows them regardless of app state.
  const mapCtx = { ...ctx, showDots: board.dots ?? ctx.showDots, showLabels: board.labels ?? ctx.showLabels };

  return (
    <div style={{ width: fmt.w, height: boardH, boxSizing: "border-box", padding: pad, display: "flex", flexDirection: "column", background: transparent ? "transparent" : "var(--bg-base)", color: "var(--text-main)" }}>
      {board.header && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, flexShrink: 0 }}>
          <span style={{ fontSize: 30 }}>🇬🇷</span>
          <div>
            <div style={{ fontSize: 26, fontWeight: 900, fontFamily: "var(--ff-head)", letterSpacing: 2, color: "var(--text-title)", lineHeight: 1 }}>GREECE SWINGOMETER</div>
            <div style={{ fontSize: 10, color: "var(--text-dim)", fontFamily: "var(--ff-body)", letterSpacing: 3, marginTop: 4, textTransform: "uppercase" }}>Hellenic Parliament · 300 Seats · {scenarioId}</div>
          </div>
        </div>
      )}

      <div style={{ flex: 1, minHeight: 0 }}>
        <ExportGrid
          items={board.items} ctx={mapCtx} mc={mc} cols={fmt.cols} rows={fmt.rows} cs={cs}
          editable={editable} mcParties={mc?.parties}
          onAdd={onAdd} onRemove={onRemove} onResize={onResize} onConfig={onConfig}
        />
      </div>

      {board.header && (
        <div style={{ marginTop: 14, textAlign: "right", fontSize: 10, color: "var(--text-dim)", fontFamily: "var(--ff-mono)", letterSpacing: 1, flexShrink: 0 }}>psephos.site</div>
      )}
    </div>
  );
}

/* ───────────────────────────────── modal ──────────────────────────────────── */

let _uid = 0;
const nextId = () => `it_${++_uid}`;
let _bid = 0;
const nextBoardId = () => `bd_${++_bid}`;

function mkItem(type, col, row, pollWindow, mc, w = 1, h = 1) {
  const cfg = {};
  if (type === "polls") { cfg.from = pollWindow[0]; cfg.to = pollWindow[1]; cfg.hidden = [...DEFAULT_HIDDEN_PARTIES]; cfg.smooth = false; }
  if (type === "mc_dist") {
    const leader = mc?.parties?.[0]?.id;
    const top = mc?.parties?.filter((p) => p.mean >= 0.5).slice(0, 3).map((p) => p.id) || [];
    cfg.ids = Array.from(new Set([leader, ...top].filter(Boolean)));
  }
  return { id: nextId(), type, col, row, w, h, cfg };
}

function makeDefaultBoard(pollWindow, mc) {
  return {
    id: nextBoardId(), format: "landscape", cs: 1, bg: "auto", header: true,
    items: [
      mkItem("greece_map", 0, 0, pollWindow, mc),
      mkItem("parliament", 1, 0, pollWindow, mc, 1, 2),
      mkItem("polls", 0, 1, pollWindow, mc),
    ],
  };
}

const ctrl = { background: "var(--bg-mid)", border: "1px solid var(--border)", color: "var(--text-main)", padding: "6px 12px", borderRadius: 6, fontFamily: "var(--ff-body)", cursor: "pointer", fontSize: 13 };

/* ════════════════════════════ POSTER MODE ════════════════════════════════ */

/* Real June 2023 (second election) Hellenic Parliament seats, keyed by the
 * stable party id from greece-data.js (GR_PARTY_DICT). Used only for the +/-
 * change on the seat bars. An id present here (even at 0) shows a delta; an id
 * absent (e.g. the fictional/new parties elas, elpida, fl, na…) shows "(new)".
 *   el = Greek Solution (12), pe = Course of Freedom (8), etc. */
const SEATS_2023 = { nd: 158, syriza: 47, pasok: 32, kke: 21, el: 12, niki: 10, spartans: 12, pe: 8, mera25: 0, gd: 0 };

/* Per-party national seat totals. electionResult is the same object Hemicycle &
 * ResultsTable consume, so its per-party rows live on .results (fallbacks
 * included). If the bars come out blank, this is the one function to adjust. */
function getPartySeats(er) {
  const rows = er?.results || er?.parties || er?.partyResults || [];
  const map = {};
  rows.forEach((r) => {
    const id = r.id ?? r.partyId ?? r.party ?? r.key ?? r.name;
    const seats = r.seats ?? r.totalSeats ?? r.total ?? r.seatsTotal ?? r.nSeats ?? 0;
    if (id != null) map[id] = (map[id] || 0) + (Number(seats) || 0);
  });
  return map;
}

/* Color tokens for the chosen background, applied on the poster root so the
 * reused components (map / hemicycle / coalition) recolor to suit it. Fonts
 * inherit from the app theme. */
const BG_OPTIONS = [
  { key: "white", label: "White", swatch: "#ffffff" },
  { key: "light", label: "Light", swatch: "#f1f5f9" },
  { key: "cream", label: "Cream", swatch: "#faf6ec" },
  { key: "navy",  label: "Navy",  swatch: "#0b1220" },
  { key: "dark",  label: "Dark",  swatch: "#0f172a" },
];
function tokensFor(bgKey) {
  const BG = { white: "#ffffff", light: "#f1f5f9", cream: "#faf6ec", navy: "#0b1220", dark: "#0f172a" }[bgKey] || "#ffffff";
  const dark = bgKey === "navy" || bgKey === "dark";
  return {
    "--bg-base": BG, "--map-bg": BG,
    "--bg-up": dark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.04)",
    "--bg-mid": dark ? "#1e293b" : "#ffffff",
    "--btn-bg": dark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.04)",
    "--border": dark ? "rgba(255,255,255,0.16)" : "rgba(15,23,42,0.12)",
    "--divider": dark ? "rgba(255,255,255,0.10)" : "rgba(15,23,42,0.08)",
    "--text-title": dark ? "#f1f5f9" : "#0f172a",
    "--text-bright": dark ? "#ffffff" : "#0b1220",
    "--text-main": dark ? "#e2e8f0" : "#1e293b",
    "--text-muted": dark ? "#94a3b8" : "#475569",
    "--text-dim": dark ? "#64748b" : "#8a98ab",
  };
}

/* Horizontal party seat bars with +/- vs 2023 (or "new"). */
function SeatBars({ parties, seatsMap, scale = 1 }) {
  const z = (n) => Math.round(n * scale);
  const rows = parties
    .map((p) => ({ id: p.id, name: p.name, color: p.color || "#888", seats: seatsMap[p.id] ?? seatsMap[p.name] ?? 0 }))
    .filter((r) => r.seats > 0)
    .sort((a, b) => b.seats - a.seats);
  if (!rows.length) return null;
  const max = Math.max(1, ...rows.map((r) => r.seats));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: z(10) }}>
      {rows.map((r) => {
        const base = SEATS_2023[r.id];
        const known = base !== undefined;
        const diff = known ? r.seats - base : null;
        const tag = !known ? "(new)" : diff > 0 ? `(+${diff})` : diff < 0 ? `(${diff})` : "(±0)";
        const tagColor = !known ? "var(--text-dim)" : diff > 0 ? "#16a34a" : diff < 0 ? "#dc2626" : "var(--text-dim)";
        return (
          <div key={r.id} style={{ display: "flex", alignItems: "center", gap: z(12) }}>
            <div style={{ width: z(54), textAlign: "right", fontWeight: 800, fontSize: z(17), color: "var(--text-title)", fontFamily: "var(--ff-head)", flexShrink: 0 }}>{r.name}</div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: z(10), minWidth: 0 }}>
              <div style={{ height: z(26), width: `${(r.seats / max) * 100}%`, background: r.color, borderRadius: z(4), minWidth: z(6) }} />
              <span style={{ fontWeight: 800, fontSize: z(18), color: "var(--text-bright)", fontFamily: "var(--ff-head)", whiteSpace: "nowrap" }}>{r.seats}</span>
              <span style={{ fontWeight: 700, fontSize: z(15), fontStyle: "italic", color: tagColor, whiteSpace: "nowrap", fontFamily: "var(--ff-head)" }}>{tag}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* The poster. Landscape: a left info column (title, seat bars, parliament,
 * coalition) beside a big map. Portrait/phone: everything stacks vertically so
 * nothing gets squished. Disabled blocks vanish and the survivors grow. */
function PosterCanvas({ format, bg, show, scale, ctx, scenarioId }) {
  const fmt = fmtOf(format);
  const isPortrait = fmt.h > fmt.w;
  const seatsMap = useMemo(() => getPartySeats(ctx.electionResult), [ctx.electionResult]);
  const z = (n) => Math.round(n * scale);
  const hasResults = ctx.electionResult?.results?.length > 0;
  const pad = z(40), gap = z(30);

  const Label = ({ children }) => (
    <div style={{ fontSize: z(12), fontWeight: 800, letterSpacing: 2.5, textTransform: "uppercase", color: "var(--text-dim)", fontFamily: "var(--ff-body)", marginBottom: z(6) }}>{children}</div>
  );

  const titleEl = show.title ? (
    <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: z(16), justifyContent: isPortrait ? "center" : "flex-start" }}>
      <img src="/correlationslogo.png" alt="" onError={(e) => { e.currentTarget.style.display = "none"; }}
           style={{ height: z(isPortrait ? 66 : 58), width: "auto", flexShrink: 0 }} />
      <div style={{ textAlign: isPortrait ? "center" : "left" }}>
        <div style={{ fontSize: z(isPortrait ? 46 : 40), fontWeight: 900, fontFamily: "var(--ff-head)", color: "var(--text-title)", lineHeight: 1.05 }}>Greece · National projection</div>
        <div style={{ fontSize: z(18), color: "var(--text-muted)", fontFamily: "var(--ff-body)", marginTop: z(5) }}>Hellenic Parliament · 300 seats · {scenarioId}</div>
      </div>
    </div>
  ) : null;

  const barsEl = show.bars ? (
    <div>{hasResults ? <SeatBars parties={ctx.parties} seatsMap={seatsMap} scale={scale} /> : <div style={{ fontSize: z(13), color: "var(--text-dim)" }}>No party cleared the threshold.</div>}</div>
  ) : null;

  const parliamentEl = (show.parliament && hasResults) ? (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
      <Label>Parliament</Label>
      <div style={{ width: "100%", overflow: "hidden" }}><Hemicycle electionResult={ctx.electionResult} parties={ctx.parties} /></div>
    </div>
  ) : null;

  const coalitionEl = (show.coalition && hasResults) ? (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Label>Coalition check</Label>
      <div style={{ overflow: "hidden" }}><GrCoalitionBuilder electionResult={ctx.electionResult} parties={ctx.parties} /></div>
    </div>
  ) : null;

  const mapEl = show.map ? (
    <div style={{ flex: 1, position: "relative", minWidth: 0, minHeight: 0, borderRadius: z(10), overflow: "hidden", border: "1px solid var(--border)" }}>
      <div style={{ width: "100%", height: "100%" }}>
        <Map districtResults={ctx.districtResults} parties={ctx.parties} electionResult={ctx.electionResult}
             featureSeatData={ctx.featureSeatData} geoCache={ctx.geoFeatures} isMobile={true}
             showDots={ctx.showDots} showLabels={ctx.showLabels} hideControls={true} />
      </div>
      {show.athens && (
        <div style={{ position: "absolute", right: z(12), bottom: z(12), width: isPortrait ? "44%" : "30%", aspectRatio: "1 / 1", background: "var(--bg-up)", border: "1px solid var(--border)", borderRadius: z(8), overflow: "hidden" }}>
          <div style={{ position: "absolute", top: z(6), left: z(8), fontSize: z(12), fontWeight: 700, color: "var(--text-main)", fontFamily: "var(--ff-body)", zIndex: 2 }}>Athens</div>
          <Map districtResults={ctx.districtResults} parties={ctx.parties} electionResult={ctx.electionResult}
               featureSeatData={ctx.atticaFeatureSeatData} geoCache={ctx.atticaGeoFeatures} isMobile={true}
               showDots={ctx.showDots} showLabels={true} isInset={true} />
        </div>
      )}
    </div>
  ) : null;

  const root = { ...tokensFor(bg), width: fmt.w, height: fmt.h, background: "var(--bg-base)", color: "var(--text-main)", boxSizing: "border-box", padding: pad, display: "flex", flexDirection: "column", gap, overflow: "hidden" };

  // Portrait / phone → vertical stack (map grows to fill the slack).
  if (isPortrait) {
    return (
      <div style={root}>
        {titleEl}
        {barsEl}
        {mapEl}
        {parliamentEl}
        {coalitionEl}
      </div>
    );
  }

  // Landscape → info column beside the map.
  const showLeftCol = barsEl || parliamentEl || coalitionEl;
  return (
    <div style={root}>
      {titleEl}
      <div style={{ flex: 1, display: "flex", gap, minHeight: 0 }}>
        {showLeftCol && (
          <div style={{ width: mapEl ? "33%" : "100%", display: "flex", flexDirection: "column", gap, minWidth: 0, flexShrink: 0 }}>
            {barsEl}
            <div style={{ flex: 1, minHeight: 0 }} />
            {parliamentEl}
            {coalitionEl}
          </div>
        )}
        {mapEl}
      </div>
    </div>
  );
}


function GridComposer({ open, onClose, ctx, isMobile, theme, onSwitch }) {
  const [boards, setBoards] = useState([]);
  const [active, setActive] = useState(0);
  const [scale, setScale] = useState(2);
  const [busy, setBusy] = useState(false);
  const [captureIdx, setCaptureIdx] = useState(0);
  const [fitScale, setFitScale] = useState(1);
  const captureRef = useRef(null);
  const fitRef = useRef(null);

  // Default poll window: 2024-01-01 (or earliest) → latest, like the page.
  const pollWindow = useMemo(() => {
    if (!ctx.polls?.length) return [Date.now() - 86400000 * 365, Date.now()];
    const ts = ctx.polls.map((p) => p.timestamp);
    const lo = Math.min(...ts), hi = Math.max(...ts);
    const floor = new Date("2024-01-01").getTime();
    return [Math.min(Math.max(lo, floor), hi), hi];
  }, [ctx.polls]);

  // Monte-Carlo: run once, only when *some* board has a forecast panel.
  const needMc = open && boards.some((b) => b.items.some((i) => i.type === "mc_odds" || i.type === "mc_dist"));
  const mc = useMemo(
    () => (needMc ? grRunMonteCarlo(ctx.effectiveParties, { threshold: ctx.threshold, turnout: ctx.turnout, sigma: 2.5, iterations: 4000 }) : null),
    [needMc, ctx.effectiveParties, ctx.threshold, ctx.turnout]
  );

  // Seed one board the first time the modal opens (persists across re-opens).
  useEffect(() => {
    if (open && boards.length === 0) {
      setBoards([makeDefaultBoard(pollWindow, mc)]);
      setActive(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Keep mc_dist selections valid once the simulation resolves (auto-pick leader).
  useEffect(() => {
    if (!mc) return;
    setBoards((prev) => prev.map((b) => ({
      ...b,
      items: b.items.map((it) => {
        if (it.type !== "mc_dist" || (it.cfg.ids && it.cfg.ids.length)) return it;
        const leader = mc.parties[0]?.id;
        const top = mc.parties.filter((p) => p.mean >= 0.5).slice(0, 3).map((p) => p.id);
        const ids = Array.from(new Set([leader, ...top].filter(Boolean)));
        return { ...it, cfg: { ...it.cfg, ids } };
      }),
    })));
  }, [mc]);

  // The hidden capture node mirrors the active board, except while a download
  // loop is driving it explicitly.
  useEffect(() => { if (!busy) setCaptureIdx(active); }, [active, busy]);

  // Fit-to-viewport scale for the editor preview.
  const activeFmtKey = boards[active]?.format;
  const activeCustomH = boards[active]?.customH;
  useEffect(() => {
    if (!open) return;
    const el = fitRef.current;
    if (!el) return;
    const fmt = fmtOf(activeFmtKey);
    const bh = activeCustomH || fmt.h;
    const compute = () => {
      const w = el.clientWidth - 8, h = el.clientHeight - 8;
      const s = Math.min(w / fmt.w, h / bh, 1);
      setFitScale(s > 0.05 ? s : 0.05);
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [open, activeFmtKey, activeCustomH, active]);

  /* board-scoped item ops */
  const addPanel = useCallback((col, row, type) => {
    setBoards((prev) => prev.map((b, i) => {
      if (i !== active) return b;
      if (covered(b.items, col, row)) return b;
      const f = fmtOf(b.format);
      const def = PANEL[type];
      const h = def.defH && row + def.defH <= f.rows ? def.defH : 1;
      return { ...b, items: [...b.items, mkItem(type, col, row, pollWindow, mc, 1, h)] };
    }));
  }, [active, pollWindow, mc]);

  const removePanel = useCallback((id) => {
    setBoards((prev) => prev.map((b, i) => (i === active ? { ...b, items: b.items.filter((it) => it.id !== id) } : b)));
  }, [active]);

  const resizePanel = useCallback((id, w, h) => {
    setBoards((prev) => prev.map((b, i) => {
      if (i !== active) return b;
      const f = fmtOf(b.format);
      const me = b.items.find((it) => it.id === id);
      if (!me) return b;
      if (me.col + w > f.cols || me.row + h > f.rows) return b;
      const kept = b.items.filter((it) => {
        if (it.id === id) return true;
        const inside = it.col >= me.col && it.col < me.col + w && it.row >= me.row && it.row < me.row + h;
        return !inside;
      });
      return { ...b, items: kept.map((it) => (it.id === id ? { ...it, w, h } : it)) };
    }));
  }, [active]);

  const configPanel = useCallback((id, patch) => {
    setBoards((prev) => prev.map((b, i) => (i === active
      ? { ...b, items: b.items.map((it) => (it.id === id ? { ...it, cfg: { ...it.cfg, ...patch } } : it)) }
      : b)));
  }, [active]);

  /* board-scoped config ops */
  const setFormat = useCallback((key) => {
    setBoards((prev) => prev.map((b, i) => {
      if (i !== active) return b;
      const o = fmtOf(b.format), f = fmtOf(key);
      // keep a full-board panel full when the grid changes
      const items = b.items.map((it) =>
        (it.col === 0 && it.row === 0 && it.w === o.cols && it.h === o.rows) ? { ...it, w: f.cols, h: f.rows } : it);
      return { ...b, format: key, customH: undefined, items: packItems(items, f.cols, f.rows) };
    }));
  }, [active]);

  const setHeight = useCallback((v) => {
    setBoards((prev) => prev.map((b, i) => (i === active ? { ...b, customH: v } : b)));
  }, [active]);

  const toggleDots = useCallback(() => {
    setBoards((prev) => prev.map((b, i) => (i === active ? { ...b, dots: !(b.dots ?? ctx.showDots) } : b)));
  }, [active, ctx.showDots]);

  const toggleLabels = useCallback(() => {
    setBoards((prev) => prev.map((b, i) => (i === active ? { ...b, labels: !(b.labels ?? ctx.showLabels) } : b)));
  }, [active, ctx.showLabels]);

  // One click: fill the whole board with just the Greece map, title off.
  const mapOnly = useCallback(() => {
    setBoards((prev) => prev.map((b, i) => {
      if (i !== active) return b;
      const f = fmtOf(b.format);
      return { ...b, header: false, items: [mkItem("greece_map", 0, 0, pollWindow, mc, f.cols, f.rows)] };
    }));
  }, [active, pollWindow, mc]);

  const setCs = useCallback((v) => {
    setBoards((prev) => prev.map((b, i) => (i === active ? { ...b, cs: v } : b)));
  }, [active]);

  const setBg = useCallback((v) => {
    setBoards((prev) => prev.map((b, i) => (i === active ? { ...b, bg: v } : b)));
  }, [active]);

  const toggleHeader = useCallback(() => {
    setBoards((prev) => prev.map((b, i) => (i === active ? { ...b, header: !b.header } : b)));
  }, [active]);

  const clearActive = useCallback(() => {
    setBoards((prev) => prev.map((b, i) => (i === active ? { ...b, items: [] } : b)));
  }, [active]);

  /* board (slide) management */
  const addBoard = useCallback(() => {
    setBoards((prev) => {
      const src = prev[active] || makeDefaultBoard(pollWindow, mc);
      return [...prev, { id: nextBoardId(), format: src.format, cs: src.cs, bg: src.bg, header: src.header, items: [] }];
    });
    setActive(boards.length);
  }, [active, boards.length, pollWindow, mc]);

  const removeBoard = useCallback((idx) => {
    setBoards((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));
    setActive((a) => {
      if (boards.length <= 1) return a;
      const na = a > idx ? a - 1 : a;
      return Math.min(na, boards.length - 2);
    });
  }, [boards.length]);

  /* capture + download */
  const captureToCanvas = useCallback(async (boardIndex) => {
    setCaptureIdx(boardIndex);
    await new Promise((r) => setTimeout(r, 150)); // let it mount + SVG/d3 settle
    const el = captureRef.current;
    const b = boards[boardIndex];
    if (!el || !b) return null;
    const fmt = fmtOf(b.format);
    const bh = b.customH || fmt.h;
    const bg = b.bg === "transparent" ? null : (theme === "dark" ? "#0f172a" : "#f8fafc");
    const mod = await import("html2canvas");
    const html2canvas = mod.default || mod;
    return html2canvas(el, {
      backgroundColor: bg, scale, useCORS: true, logging: false,
      width: fmt.w, height: bh, windowWidth: fmt.w, windowHeight: bh,
    });
  }, [boards, scale, theme]);

  const trigger = (canvas, name) => {
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = name;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const downloadThis = useCallback(async () => {
    setBusy(true);
    try {
      const c = await captureToCanvas(active);
      if (c) trigger(c, `Greece_${ctx.scenarioId}_board${active + 1}.png`);
    } catch (e) {
      console.error("Export failed:", e);
      alert("Export failed. Make sure html2canvas is installed (npm install html2canvas).");
    } finally {
      setBusy(false);
      setCaptureIdx(active);
    }
  }, [captureToCanvas, active, ctx.scenarioId]);

  const downloadAll = useCallback(async () => {
    setBusy(true);
    try {
      for (let i = 0; i < boards.length; i++) {
        const c = await captureToCanvas(i);
        if (c) { trigger(c, `Greece_${ctx.scenarioId}_board${i + 1}.png`); await new Promise((r) => setTimeout(r, 350)); }
      }
    } catch (e) {
      console.error("Export failed:", e);
      alert("Export failed. Make sure html2canvas is installed (npm install html2canvas).");
    } finally {
      setBusy(false);
      setCaptureIdx(active);
    }
  }, [captureToCanvas, boards.length, ctx.scenarioId, active]);

  if (!open) return null;

  const activeBoard = boards[active];
  const curFmt = fmtOf(activeBoard?.format);
  const curBoardH = (activeBoard?.customH) || curFmt.h;
  const captureBoard = boards[captureIdx];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.8)", display: "flex", flexDirection: "column", padding: isMobile ? 6 : 12, backdropFilter: "blur(4px)" }}>
      <div style={{ flex: 1, minHeight: 0, width: "100%", display: "flex", flexDirection: "column", gap: 10, background: "var(--bg-base)", borderRadius: 12, border: "1px solid var(--border)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", padding: 16, boxSizing: "border-box" }}>

        {/* header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, gap: 8, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <IconCamera size={20} color="var(--text-title)" />
            <h3 style={{ margin: 0, fontFamily: "var(--ff-head)", fontSize: 19, color: "var(--text-title)", letterSpacing: 0.5 }}>Compose Export</h3>
            <span style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--ff-body)" }}>tap + to add · resize Cell/Tall/Wide/Full · build slides below</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {onSwitch && <button className="icon-btn" onClick={onSwitch} style={S.ghostBtn}>▣ Poster mode</button>}
            <button className="icon-btn" onClick={onClose} style={S.ghostBtn}>✕ Close</button>
          </div>
        </div>

        {/* slide strip */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--ff-body)", fontWeight: 600, marginRight: 2 }}>Slides:</span>
          {boards.map((b, i) => {
            const isAct = i === active;
            return (
              <div key={b.id} style={{ display: "flex", alignItems: "center", borderRadius: 6, border: `1px solid ${isAct ? "#2563EB" : "var(--border)"}`, background: isAct ? "#2563EB22" : "var(--btn-bg)", overflow: "hidden" }}>
                <button onClick={() => setActive(i)}
                  style={{ background: "transparent", border: "none", color: isAct ? "#60A5FA" : "var(--text-dim)", padding: "5px 10px", cursor: "pointer", fontFamily: "var(--ff-body)", fontSize: 12, fontWeight: 600 }}>
                  {i + 1} · {fmtOf(b.format).label.split(" ")[0]}
                </button>
                {boards.length > 1 && (
                  <button onClick={() => removeBoard(i)} title="Delete slide"
                    style={{ background: "transparent", border: "none", borderLeft: "1px solid var(--border)", color: "#F87171", padding: "5px 8px", cursor: "pointer", fontSize: 11 }}>✕</button>
                )}
              </div>
            );
          })}
          <button onClick={addBoard} title="Add slide"
            style={{ ...ctrl, padding: "5px 11px", fontWeight: 700 }}>+ Slide</button>
        </div>

        {/* live editor — the board, scaled to fit */}
        <div ref={fitRef} style={{ flex: 1, minHeight: 0, overflow: "auto", border: "1px solid var(--border)", borderRadius: 10, background: "var(--bg-up)", padding: 8, display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
          {activeBoard && (
            <div style={{ width: curFmt.w * fitScale, height: curBoardH * fitScale, flexShrink: 0 }}>
              <div style={{ width: curFmt.w, height: curBoardH, transform: `scale(${fitScale})`, transformOrigin: "top left" }}>
                <ExportBoard
                  board={activeBoard} ctx={ctx} mc={mc} scenarioId={ctx.scenarioId} editable
                  onAdd={addPanel} onRemove={removePanel} onResize={resizePanel} onConfig={configPanel}
                />
              </div>
            </div>
          )}
        </div>

        {/* controls */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {/* format */}
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12, color: "var(--text-dim)", fontFamily: "var(--ff-body)", fontWeight: 600 }}>Format</span>
              <select value={activeBoard?.format || "landscape"} onChange={(e) => setFormat(e.target.value)} style={ctrl}>
                {Object.entries(FORMATS).map(([k, f]) => <option key={k} value={k}>{f.label}</option>)}
              </select>
            </label>

            {/* content scale */}
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12, color: "var(--text-dim)", fontFamily: "var(--ff-body)", fontWeight: 600 }}>Bar &amp; label size</span>
              <input type="range" min={0.7} max={1.3} step={0.05} value={activeBoard?.cs ?? 1}
                onChange={(e) => setCs(Number(e.target.value))} style={{ width: 110, cursor: "pointer", accentColor: "#2563EB" }} />
              <span style={{ ...S.mono, fontSize: 11, color: "var(--text-dim)", width: 36, textAlign: "right" }}>{Math.round((activeBoard?.cs ?? 1) * 100)}%</span>
            </label>

            {/* board height — make it as tall as you want */}
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12, color: "var(--text-dim)", fontFamily: "var(--ff-body)", fontWeight: 600 }}>Height</span>
              <input type="range" min={600} max={5000} step={20} value={curBoardH}
                onChange={(e) => setHeight(Number(e.target.value))} style={{ width: 130, cursor: "pointer", accentColor: "#2563EB" }} />
              <span style={{ ...S.mono, fontSize: 11, color: "var(--text-dim)", width: 54, textAlign: "right" }}>{curBoardH}px</span>
            </label>

            {/* map dots / labels in the export */}
            <button onClick={toggleDots} style={{ ...ctrl, color: (activeBoard?.dots ?? ctx.showDots) ? "#60A5FA" : "var(--text-dim)" }}>
              Dots: {(activeBoard?.dots ?? ctx.showDots) ? "on" : "off"}
            </button>
            <button onClick={toggleLabels} style={{ ...ctrl, color: (activeBoard?.labels ?? ctx.showLabels) ? "#60A5FA" : "var(--text-dim)" }}>
              Labels: {(activeBoard?.labels ?? ctx.showLabels) ? "on" : "off"}
            </button>

            {/* one-click full-screen map */}
            <button onClick={mapOnly} style={{ ...ctrl, fontWeight: 600 }}>🗺️ Map only</button>

            {/* quality */}
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12, color: "var(--text-dim)", fontFamily: "var(--ff-body)", fontWeight: 600 }}>Quality</span>
              <select value={scale} onChange={(e) => setScale(Number(e.target.value))} style={ctrl}>
                <option value={1}>1x</option><option value={2}>2x</option><option value={3}>3x</option>
              </select>
            </label>

            {/* header toggle */}
            <button onClick={toggleHeader} style={{ ...ctrl, color: activeBoard?.header ? "#60A5FA" : "var(--text-dim)" }}>
              {activeBoard?.header ? "Title: on" : "Title: off"}
            </button>

            {/* background */}
            <button onClick={() => setBg(activeBoard?.bg === "transparent" ? "auto" : "transparent")}
              style={{ ...ctrl, color: activeBoard?.bg === "transparent" ? "#60A5FA" : "var(--text-dim)" }}>
              {activeBoard?.bg === "transparent" ? "BG: transparent" : "BG: solid"}
            </button>

            {activeBoard?.items.length > 0 && <button onClick={clearActive} style={{ ...S.ghostBtn, padding: "6px 12px" }}>Clear slide</button>}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button className="icon-btn" onClick={onClose} style={{ ...S.ghostBtn, padding: "8px 16px" }}>Cancel</button>
            {boards.length > 1 && (
              <button className="icon-btn" onClick={downloadAll} disabled={busy}
                style={{ background: "var(--btn-bg)", color: "var(--text-main)", border: "1px solid var(--border)", borderRadius: 6, padding: "8px 16px", cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1, fontFamily: "var(--ff-body)", fontWeight: 600 }}>
                Download all ({boards.length})
              </button>
            )}
            <button className="icon-btn" onClick={downloadThis} disabled={busy || !activeBoard?.items.length}
              style={{ background: "#2563EB", color: "#fff", border: "none", borderRadius: 6, padding: "8px 18px", cursor: busy || !activeBoard?.items.length ? "default" : "pointer", opacity: busy || !activeBoard?.items.length ? 0.6 : 1, fontFamily: "var(--ff-body)", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
              {busy ? <><span style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid #fff", borderTopColor: "transparent", animation: "spin 1s linear infinite" }} /> Rendering…</> : <><IconCamera size={14} /> Download this</>}
            </button>
          </div>
        </div>
      </div>

      {/* Off-screen, native-size capture twin. Same component + props as the
          editor board (just un-scaled), so the PNG matches what you see. */}
      <div ref={captureRef} style={{ position: "fixed", top: 0, left: -100000 }}>
        {captureBoard && (
          <ExportBoard board={captureBoard} ctx={ctx} mc={mc} scenarioId={ctx.scenarioId} editable={false} />
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `@keyframes spin{100%{transform:rotate(360deg)}}` }} />
    </div>
  );
}

/* ─────────────────────── poster composer (simple UI) ──────────────────────── */

function PosterComposer({ open, onClose, ctx, isMobile, theme, onSwitch }) {
  const [format, setFormat] = useState("landscape");
  const [bg, setBg] = useState("white");
  const [scale, setScale] = useState(2);
  const [show, setShow] = useState({ title: true, bars: true, map: true, parliament: true, coalition: true, athens: true });
  const [busy, setBusy] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [fitScale, setFitScale] = useState(1);
  const fitRef = useRef(null);
  const posterRef = useRef(null);

  const fmt = fmtOf(format);

  useEffect(() => {
    if (!open) return;
    const el = fitRef.current;
    if (!el) return;
    const compute = () => {
      const w = el.clientWidth - 8, h = el.clientHeight - 8;
      setFitScale(Math.max(0.05, Math.min(w / fmt.w, h / fmt.h, 1)));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [open, fmt.w, fmt.h]);

  const toggle = (k) => setShow((s) => ({ ...s, [k]: !s[k] }));

  const download = useCallback(async () => {
    setBusy(true); setCapturing(true);
    await new Promise((r) => setTimeout(r, 180)); // un-scale + let map/d3 settle
    try {
      const el = posterRef.current;
      if (el) {
        const bgCol = { white: "#ffffff", light: "#f1f5f9", cream: "#faf6ec", navy: "#0b1220", dark: "#0f172a" }[bg] || "#ffffff";
        const mod = await import("html2canvas");
        const html2canvas = mod.default || mod;
        const canvas = await html2canvas(el, { backgroundColor: bgCol, scale, useCORS: true, logging: false, width: fmt.w, height: fmt.h, windowWidth: fmt.w, windowHeight: fmt.h });
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = `Greece_${ctx.scenarioId}_poster.png`;
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
      }
    } catch (e) {
      console.error("Export failed:", e);
      alert("Export failed. Make sure html2canvas is installed (npm install html2canvas).");
    } finally {
      setCapturing(false); setBusy(false);
    }
  }, [bg, scale, fmt.w, fmt.h, ctx.scenarioId]);

  if (!open) return null;

  // Editor: scaled to fit. Capture: native size, off-screen, no transform.
  const wrapStyle = capturing
    ? { position: "fixed", top: 0, left: -100000, width: fmt.w, height: fmt.h }
    : { width: fmt.w * fitScale, height: fmt.h * fitScale, flexShrink: 0 };
  const innerStyle = capturing
    ? { width: fmt.w, height: fmt.h }
    : { width: fmt.w, height: fmt.h, transform: `scale(${fitScale})`, transformOrigin: "top left" };

  const CHIPS = [["title", "Title"], ["bars", "Seat bars"], ["map", "Map"], ["parliament", "Parliament"], ["coalition", "Coalition"], ["athens", "Athens inset"]];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.8)", display: "flex", flexDirection: "column", padding: isMobile ? 6 : 12, backdropFilter: "blur(4px)" }}>
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", gap: 12, background: "var(--bg-base)", borderRadius: 12, border: "1px solid var(--border)", padding: 16, boxSizing: "border-box" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <IconCamera size={20} color="var(--text-title)" />
            <h3 style={{ margin: 0, fontFamily: "var(--ff-head)", fontSize: 19, color: "var(--text-title)", letterSpacing: 0.5 }}>Export poster</h3>
            <span style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--ff-body)" }}>toggle blocks · disabled ones make the rest grow · tick your coalition in the preview</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {onSwitch && <button onClick={onSwitch} style={S.ghostBtn}>⊞ Advanced grid</button>}
            <button onClick={onClose} style={S.ghostBtn}>✕ Close</button>
          </div>
        </div>

        <div ref={fitRef} style={{ flex: 1, minHeight: 0, overflow: "auto", border: "1px solid var(--border)", borderRadius: 10, background: "var(--bg-up)", padding: 8, display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
          <div style={wrapStyle}>
            <div ref={posterRef} style={innerStyle}>
              <PosterCanvas format={format} bg={bg} show={show} scale={1} ctx={ctx} scenarioId={ctx.scenarioId} />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, flexShrink: 0 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--text-dim)", fontWeight: 600, fontFamily: "var(--ff-body)" }}>Show:</span>
            {CHIPS.map(([k, label]) => (
              <button key={k} onClick={() => toggle(k)} style={{ ...ctrl, padding: "5px 12px", color: show[k] ? "#fff" : "var(--text-dim)", background: show[k] ? "#2563EB" : "var(--btn-bg)", border: `1px solid ${show[k] ? "#2563EB" : "var(--border)"}` }}>{label}</button>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 12, color: "var(--text-dim)", fontWeight: 600, fontFamily: "var(--ff-body)" }}>Background</span>
                {BG_OPTIONS.map((o) => (
                  <button key={o.key} title={o.label} onClick={() => setBg(o.key)}
                    style={{ width: 24, height: 24, borderRadius: 6, cursor: "pointer", background: o.swatch, border: bg === o.key ? "2px solid #2563EB" : "1px solid var(--border)" }} />
                ))}
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 12, color: "var(--text-dim)", fontWeight: 600, fontFamily: "var(--ff-body)" }}>Shape</span>
                <select value={format} onChange={(e) => setFormat(e.target.value)} style={ctrl}>
                  {Object.entries(FORMATS).map(([k, f]) => <option key={k} value={k}>{f.label}</option>)}
                </select>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 12, color: "var(--text-dim)", fontWeight: 600, fontFamily: "var(--ff-body)" }}>Quality</span>
                <select value={scale} onChange={(e) => setScale(Number(e.target.value))} style={ctrl}>
                  <option value={1}>1x</option><option value={2}>2x</option><option value={3}>3x</option>
                </select>
              </label>
            </div>

            <button onClick={download} disabled={busy}
              style={{ background: "#2563EB", color: "#fff", border: "none", borderRadius: 6, padding: "9px 20px", cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1, fontFamily: "var(--ff-body)", fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
              {busy ? <><span style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid #fff", borderTopColor: "transparent", animation: "spin 1s linear infinite" }} /> Rendering…</> : <><IconCamera size={14} /> Download PNG</>}
            </button>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `@keyframes spin{100%{transform:rotate(360deg)}}` }} />
    </div>
  );
}

/* ───────────────────────────── mode switch ────────────────────────────────── */

export default function GreeceExportModal(props) {
  const [mode, setMode] = useState("poster");
  if (!props.open) return null;
  return mode === "grid"
    ? <GridComposer {...props} onSwitch={() => setMode("poster")} />
    : <PosterComposer {...props} onSwitch={() => setMode("grid")} />;
}
