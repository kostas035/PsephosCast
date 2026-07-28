// USAMonteCarloPanel.jsx — probabilistic forecast panel over usa-montecarlo.js.
// Same role as CyprusMonteCarloPanel.jsx but built around a single axis (GOP
// electoral votes, 0-538) instead of per-party seat curves, plus a per-state
// win-probability list — the natural way to read Electoral College uncertainty.
import { memo, useState, useMemo, useDeferredValue, useRef, useCallback } from "react";
import { S, IconChevron, EASE_SPRING, EASE_STD } from "./usa-ui.jsx";
import { USA, USA_STATE_NAMES, USA_CANDIDATE_DICT, USA_CANDIDATE_LABELS } from "./usa-data.js";
import { usRunMonteCarlo } from "./usa-montecarlo.js";

const pct = p => `${Math.round(p * 100)}%`;
const inWords = p => {
  if (p >= 0.97) return "almost certain";
  if (p <= 0.03) return "very unlikely";
  return `about ${Math.round(p * 10)} in 10`;
};

const USAMonteCarloPanel = memo(function USAMonteCarloPanel({ effectiveCandidates, baseCandidates, scenarioYear, isMobile }) {
  const [expanded, setExpanded] = useState(true);
  const [sigma, setSigma] = useState(2.2);
  const [iterations, setIterations] = useState(4000);

  const dEff = useDeferredValue(effectiveCandidates);
  const dSigma = useDeferredValue(sigma);
  const dIter = useDeferredValue(iterations);
  const dExp = useDeferredValue(expanded);
  const computing = dEff !== effectiveCandidates || dSigma !== sigma || dIter !== iterations;

  const labels = USA_CANDIDATE_LABELS[scenarioYear] || { gop: "GOP", dem: "DEM" };

  const mc = useMemo(
    () => (dExp ? usRunMonteCarlo(dEff, scenarioYear, baseCandidates, { sigma: dSigma, iterations: dIter }) : null),
    [dExp, dEff, scenarioYear, baseCandidates, dSigma, dIter]
  );

  const [chartW, setChartW] = useState(900);
  const roRef = useRef(null);
  const setChartNode = useCallback(node => {
    if (roRef.current) { roRef.current.disconnect(); roRef.current = null; }
    if (node) {
      const ro = new ResizeObserver(entries => { const w = entries[0]?.contentRect?.width; if (w) setChartW(Math.round(w)); });
      ro.observe(node);
      roRef.current = ro;
      const w = node.getBoundingClientRect().width;
      if (w) setChartW(Math.round(w));
    }
  }, []);
  const [hoverEV, setHoverEV] = useState(null);

  // Histogram of GOP EV totals across all runs (10-EV-wide buckets).
  const hist = useMemo(() => {
    if (!mc) return null;
    const bucket = 10;
    const N = Math.ceil((USA.TOTAL_EV + 1) / bucket);
    const counts = new Array(N).fill(0);
    for (const ev of mc.evTotals) counts[Math.min(N - 1, Math.floor(ev / bucket))]++;
    const peak = Math.max(1, ...counts);
    return { counts, peak, bucket, N };
  }, [mc]);

  if (!mc && !dExp) return null;

  return (
    <div style={{ ...S.card }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: expanded ? 14 : 0, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={S.label}>🎲 Monte Carlo Forecast</span>
          {expanded && mc && <span style={{ fontSize: 9, color: "var(--text-dim)", ...S.mono, letterSpacing: 0.5 }}>{mc.iterations.toLocaleString()} runs{computing ? " · updating…" : ""}</span>}
        </div>
        <button className="icon-btn" onClick={() => setExpanded(e => !e)} style={{ ...S.ghostBtn, padding: "4px 9px" }}>
          {expanded ? "Hide" : "Show"} <IconChevron dir={expanded ? "up" : "down"} size={9} />
        </button>
      </div>

      {expanded && mc && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, opacity: computing ? 0.6 : 1, transition: `opacity 0.2s ${EASE_STD}` }}>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ margin: 0, fontSize: 11, lineHeight: 1.55, color: "var(--text-muted)", fontFamily: "var(--ff-body)", flex: 1, minWidth: 240 }}>
              Your current national vote shares re-run thousands of times with a three-tier polling error (national, regional, and per-state), showing the <strong style={{ color: "var(--text-main)" }}>range</strong> of Electoral College outcomes around today's fixed estimate.
            </p>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-end" }}>
              <div style={{ width: 150 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: 0.5 }}>UNCERTAINTY</span>
                  <span style={{ fontSize: 10, ...S.mono, color: "#3B82F6" }}>±{sigma.toFixed(1)}</span>
                </div>
                <input type="range" min={0.5} max={6} step={0.5} value={sigma} onChange={e => setSigma(parseFloat(e.target.value))}
                  style={{ width: "100%", height: 5, borderRadius: 4, outline: "none", cursor: "pointer", background: `linear-gradient(to right,#3B82F6 0%,#3B82F6 ${((sigma - 0.5) / 5.5) * 100}%,var(--border) ${((sigma - 0.5) / 5.5) * 100}%)` }} />
              </div>
              <select value={iterations} onChange={e => setIterations(parseInt(e.target.value))} style={{ ...S.editInput, cursor: "pointer", padding: "4px 6px", height: 26 }}>
                <option value={2000}>2k runs</option>
                <option value={4000}>4k runs</option>
                <option value={10000}>10k runs</option>
              </select>
            </div>
          </div>

          <div style={{ padding: "10px 14px", background: "var(--btn-bg)", border: "1px solid var(--divider, var(--border))", borderRadius: 6, fontSize: 12, lineHeight: 1.55, fontFamily: "var(--ff-body)" }}>
            <strong style={{ color: USA_CANDIDATE_DICT.gop.color }}>{labels.gop}</strong> wins the Electoral College in <strong>{pct(mc.pGopWin)}</strong> of runs; <strong style={{ color: USA_CANDIDATE_DICT.dem.color }}>{labels.dem}</strong> wins in <strong>{pct(mc.pDemWin)}</strong> ({inWords(Math.max(mc.pGopWin, mc.pDemWin))} for the favorite).
            {mc.pTie > 0.005 && <> A 269-269 tie occurs in <strong>{pct(mc.pTie)}</strong> of runs.</>}
            {" "}Median outcome: <strong>{Math.round(mc.medianEV)}</strong> GOP EV ({mc.p10EV}–{mc.p90EV} at the 10th–90th percentile).
          </div>

          {/* EV histogram */}
          {hist && (() => {
            const VBW = chartW, VBH = 220, padL = 10, padR = 10, padT = 20, padB = 26;
            const plotW = VBW - padL - padR, plotH = VBH - padT - padB, baseline = padT + plotH;
            const maxH = plotH * 0.86;
            const X = i => padL + ((i * hist.bucket + hist.bucket / 2) / USA.TOTAL_EV) * plotW;
            const barW = Math.max(1, (plotW / hist.N) * 0.85);
            const majX = padL + (USA.MAJORITY_EV / USA.TOTAL_EV) * plotW;
            const onMove = e => {
              const r = e.currentTarget.getBoundingClientRect();
              const evVal = Math.round(((e.clientX - r.left) / r.width) * USA.TOTAL_EV);
              const b = Math.max(0, Math.min(hist.N - 1, Math.floor(evVal / hist.bucket)));
              setHoverEV(prev => (prev === b ? prev : b));
            };
            return (
              <div style={{ position: "relative", background: "var(--bg-up)", border: "1px solid var(--divider, var(--border))", borderRadius: 6, padding: "8px 6px 4px" }}>
                <svg ref={setChartNode} viewBox={`0 0 ${VBW} ${VBH}`} preserveAspectRatio="none" style={{ width: "100%", height: VBH, display: "block", overflow: "visible" }}>
                  {[0, 100, 200, 270, 300, 400, 500].map(t => (
                    <g key={t}>
                      <line x1={padL + (t / USA.TOTAL_EV) * plotW} y1={padT} x2={padL + (t / USA.TOTAL_EV) * plotW} y2={baseline} stroke="var(--border)" strokeWidth={1} opacity={t === 270 ? 0 : 0.3} />
                      <text x={padL + (t / USA.TOTAL_EV) * plotW} y={baseline + 15} textAnchor="middle" fontSize={9} fill="var(--text-dim)" fontFamily="var(--ff-mono)">{t}</text>
                    </g>
                  ))}
                  <line x1={majX} y1={padT - 4} x2={majX} y2={baseline} stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="3 3" opacity={0.85} />
                  <text x={majX} y={padT - 7} textAnchor="middle" fontSize={9} fill="#F59E0B" fontFamily="var(--ff-mono)">270</text>
                  <line x1={padL} y1={baseline} x2={VBW - padR} y2={baseline} stroke="var(--border)" strokeWidth={1} />
                  {hist.counts.map((c, i) => {
                    const evMid = i * hist.bucket + hist.bucket / 2;
                    const color = evMid >= USA.MAJORITY_EV ? USA_CANDIDATE_DICT.gop.color : USA_CANDIDATE_DICT.dem.color;
                    const h = (c / hist.peak) * maxH;
                    return <rect key={i} x={X(i) - barW / 2} y={baseline - h} width={barW} height={h} fill={color} opacity={hoverEV === i ? 0.95 : 0.65} />;
                  })}
                  <rect x={padL} y={padT - 8} width={plotW} height={plotH + 8} fill="transparent" onMouseMove={onMove} onMouseLeave={() => setHoverEV(null)} style={{ cursor: "crosshair" }} />
                </svg>
                {hoverEV != null && (
                  <div style={{ position: "absolute", top: 6, right: 10, pointerEvents: "none", background: "var(--bg-mid)", border: "1px solid var(--border)", borderRadius: 6, padding: "5px 9px", fontSize: 10, ...S.mono }}>
                    {hoverEV * hist.bucket}–{hoverEV * hist.bucket + hist.bucket - 1} EV: <strong>{hist.counts[hoverEV].toLocaleString()}</strong> runs ({((hist.counts[hoverEV] / mc.iterations) * 100).toFixed(1)}%)
                  </div>
                )}
                <div style={{ fontSize: 8, color: "var(--text-dim)", padding: "6px 4px 2px", fontFamily: "var(--ff-body)" }}>
                  Distribution of {labels.gop} electoral votes across {mc.iterations.toLocaleString()} runs · bars left of the dashed line are {labels.dem} wins, right are {labels.gop} wins.
                </div>
              </div>
            );
          })()}

          {/* Per-state odds, closest first */}
          <div>
            <div style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: 1, textTransform: "uppercase", fontFamily: "var(--ff-body)", marginBottom: 10 }}>Closest states — win probability</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {mc.stateOdds.slice(0, isMobile ? 8 : 14).map(s => {
                const gopWidth = Math.max(0.5, s.pGop * 100);
                return (
                  <div key={s.abbr} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: isMobile ? 90 : 130, flexShrink: 0, display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ fontSize: 10, color: "var(--text-main)", fontWeight: 600, fontFamily: "var(--ff-body)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{USA_STATE_NAMES[s.abbr]}</span>
                      <span style={{ fontSize: 8, color: "var(--text-dim)", ...S.mono }}>{s.ev}ev</span>
                    </div>
                    <div style={{ flex: 1, position: "relative", height: 14, background: USA_CANDIDATE_DICT.dem.color + "33", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${gopWidth}%`, background: USA_CANDIDATE_DICT.gop.color + "AA", transition: `width 0.3s ${EASE_SPRING}` }} />
                      <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "var(--text-dim)", opacity: 0.5 }} />
                    </div>
                    {!isMobile && (
                      <div style={{ width: 92, fontSize: 9, ...S.mono, textAlign: "right", flexShrink: 0, color: "var(--text-dim)" }}>
                        med {s.medianMargin >= 0 ? "+" : ""}{s.medianMargin.toFixed(1)}pt
                      </div>
                    )}
                    <div style={{ width: 38, fontSize: 10, ...S.mono, textAlign: "right", fontWeight: 700, color: s.pGop >= 0.5 ? USA_CANDIDATE_DICT.gop.color : USA_CANDIDATE_DICT.dem.color, flexShrink: 0 }}>
                      {s.pGop >= 0.5 ? pct(s.pGop) : pct(1 - s.pGop)}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: 8, color: "var(--text-dim)", marginTop: 8, display: "flex", flexWrap: "wrap", gap: 12, fontFamily: "var(--ff-body)" }}>
              <span>bar fill = GOP win share of runs · right column = winning side's probability</span>
            </div>
          </div>

          <div style={{ fontSize: 8, color: "var(--text-dim)", borderTop: "1px solid var(--divider, var(--border))", paddingTop: 10, lineHeight: 1.5, fontFamily: "var(--ff-body)" }}>
            Each run draws a fat-tailed (Student-t) national miss, a regional miss (Northeast/Midwest/South/West), and an idiosyncratic per-state miss scaled by that state's historical 2020→2024 volatility, then re-allocates all 538 electoral votes. Odds are estimates from {mc.iterations.toLocaleString()} runs and settle down with more of them.
          </div>
        </div>
      )}
    </div>
  );
});

export default USAMonteCarloPanel;
