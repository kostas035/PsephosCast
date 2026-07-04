import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { S, EASE_STD } from "./GreeceStyles";
import { GR_PARTY_DICT } from "./greece-data.js";
import { DEFAULT_HIDDEN_PARTIES, POLL_PARTIES_MAPPING } from "./greece-utils.js";
import { useGreeceT, tPartyNameById } from "./GreeceTranslations.jsx";

// Prevents white-box browser focus flash on button click
const BTN_BASE = { outline: "none", WebkitTapHighlightColor: "transparent", userSelect: "none" };

/* LOESS (locally-weighted regression) for the poll trend line
 * Local linear fit with a tri-cube kernel, run in the time domain so clusters
 * of polls don't over-weight a period. `span` = fraction of points in each
 * local neighbourhood (smaller = wigglier, larger = smoother). Evaluated only
 * within each party's own data range, so new/fading parties aren't extrapolated
 * off the ends. */
const LOESS_SPAN = 0.1;

function loessSmooth(xs, ys, evalXs, span = LOESS_SPAN) {
  const n = xs.length;
  if (n === 0) return evalXs.map(() => null);
  if (n < 3) { const m = ys.reduce((a, b) => a + b, 0) / n; return evalXs.map(x => (x < xs[0] || x > xs[n - 1]) ? null : m); }
  const minX = xs[0], maxX = xs[n - 1];
  const q = Math.max(2, Math.min(n, Math.ceil(span * n)));
  return evalXs.map(x0 => {
    if (x0 < minX || x0 > maxX) return null;
    const dists = xs.map(x => Math.abs(x - x0));
    const h = [...dists].sort((a, b) => a - b)[q - 1] || 1e-9;
    let sw = 0, swx = 0, swy = 0, swxx = 0, swxy = 0;
    for (let i = 0; i < n; i++) {
      const u = dists[i] / h;
      if (u >= 1) continue;
      const w = (1 - u * u * u) ** 3;            // tri-cube kernel
      sw += w; swx += w * xs[i]; swy += w * ys[i];
      swxx += w * xs[i] * xs[i]; swxy += w * xs[i] * ys[i];
    }
    if (sw === 0) return null;
    const denom = sw * swxx - swx * swx;
    if (Math.abs(denom) < 1e-12) return Math.max(0, swy / sw); // degenerate → weighted mean
    const b = (sw * swxy - swx * swy) / denom;   // slope
    const a = (swy - b * swx) / sw;              // intercept
    return Math.max(0, a + b * x0);
  });
}

function DateRangeSlider({ data, domain, setDomain }) {
  const containerRef  = useRef(null);
  const [localDomain, setLocalDomain] = useState(domain || [0, 100]);
  const [dragging,    setDragging]    = useState(null);

  useEffect(() => { if (domain) setLocalDomain(domain); }, [domain]);

  const min = data?.length ? data[0].timestamp : 0;
  const max = data?.length ? data[data.length - 1].timestamp : 100;

  const getValFromX = useCallback((clientX) => {
    if (!containerRef.current) return min;
    const rect = containerRef.current.getBoundingClientRect();
    return min + Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)) * (max - min);
  }, [min, max]);

  const MIN_GAP = 86400000 * 14;

  const handlePointerMove = useCallback((e) => {
    if (!dragging) return;
    const val = getValFromX(e.clientX);
    setLocalDomain(prev => dragging === "min" ? [Math.min(val, prev[1] - MIN_GAP), prev[1]] : [prev[0], Math.max(val, prev[0] + MIN_GAP)]);
  }, [dragging, getValFromX]);

  const handlePointerUp = useCallback((e) => {
    if (dragging) { setDragging(null); e.target.releasePointerCapture(e.pointerId); setDomain(localDomain); }
  }, [dragging, localDomain, setDomain]);

  if (!data || data.length < 2 || !domain) return null;

  const pctMin = ((localDomain[0] - min) / (max - min)) * 100;
  const pctMax = ((localDomain[1] - min) / (max - min)) * 100;
  const d1 = new Date(localDomain[0]), d2 = new Date(localDomain[1]);

  return (
    <div style={{ padding: "30px 16px 16px 16px", userSelect: "none" }}>
      <div ref={containerRef} style={{ position: "relative", height: 24, cursor: "pointer", touchAction: "none" }} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} onPointerLeave={handlePointerUp}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 10, height: 4, background: "var(--bg-up)", borderRadius: 2, border: "1px solid var(--border)" }}/>
        <div style={{ position: "absolute", left: `${pctMin}%`, width: `${pctMax - pctMin}%`, top: 11, height: 4, background: "#60A5FA", borderRadius: 2, transition: dragging ? "none" : `left 0.1s ${EASE_STD}, width 0.1s ${EASE_STD}` }}/>
        {[{ which: "min", pct: pctMin }, { which: "max", pct: pctMax }].map(({ which, pct }) => (
          <div key={which} onPointerDown={e => { e.preventDefault(); setDragging(which); e.target.setPointerCapture(e.pointerId); }} style={{ position: "absolute", left: `${pct}%`, top: 13, width: 14, height: 14, transform: "translate(-50%,-50%)", borderRadius: "50%", background: dragging === which ? "#3B82F6" : "#60A5FA", border: "2px solid var(--bg-mid)", cursor: "grab", boxShadow: dragging === which ? "0 0 0 5px rgba(96,165,250,0.2)" : "0 1px 3px rgba(0,0,0,0.3)", zIndex: dragging === which ? 10 : 5, transition: `box-shadow 0.15s ${EASE_STD}, background 0.15s ${EASE_STD}` }}/>
        ))}
        {[{ pct: pctMin, date: d1, isLeft: pctMin < 8 }, { pct: pctMax, date: d2, isRight: pctMax > 92 }].map(({ pct, date, isLeft, isRight }, i) => (
          <div key={i} style={{ position: "absolute", left: `${pct}%`, top: -24, transform: isLeft ? "translateX(0)" : isRight ? "translateX(-100%)" : "translateX(-50%)", fontSize: 10, fontFamily: "var(--ff-mono)", color: "var(--text-muted)", whiteSpace: "nowrap", pointerEvents: "none", background: "var(--bg-mid)", padding: "2px 6px", borderRadius: 4, border: "1px solid transparent", zIndex: 20 }}>
            {date.toLocaleString("en-US", { month: "short", year: "2-digit" })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OpinionPolls({ polls = [], loading = false, error = false, source, reload, onApplyPoll, lang }) {
  const t = useGreeceT(lang);
  const [hiddenParties, setHiddenParties] = useState(DEFAULT_HIDDEN_PARTIES);
  const [isSmooth,    setIsSmooth]    = useState(true);
  const [showTrend,   setShowTrend]   = useState(false);
  const [showDashed,  setShowDashed]  = useState(false);
  const [dateDomain,  setDateDomain]  = useState(null);
  const [popup,       setPopup]       = useState(null);
  const chartBoxRef = useRef(null);

  // Localized date strings, sorted chronologically for the chart axis
  const chartData = useMemo(() => {
    if (!polls?.length) return [];
    return [...polls]
      .map(poll => {
        const localizedDate = new Date(poll.timestamp).toLocaleString("en-GB", { 
          day: "numeric", 
          month: "short", 
          year: "numeric" 
        });
        return { 
          ...poll, 
          dateLabel: localizedDate, 
          displayDate: localizedDate 
        };
      })
      .sort((a, b) => a.timestamp - b.timestamp); // Chronological sorting solves LOESS and Slider range inversion
  }, [polls]);

  // Default view starts in 2024 — 2023 polls stay accessible by dragging the slider left.
  useEffect(() => {
    if (chartData.length > 0 && !dateDomain) {
      const earliest = chartData[0].timestamp;
      const last = chartData[chartData.length - 1].timestamp;
      const startFloor = new Date("2024-01-01").getTime();
      const start = Math.min(Math.max(earliest, startFloor), last);
      setDateDomain([start, last]);
    }
  }, [chartData, dateDomain]);

  const smoothedData = useMemo(() => {
    if (!chartData.length) return [];
    const evalXs = chartData.map(p => p.timestamp);
    const out = chartData.map(p => ({ ...p, isTrend: true }));
    POLL_PARTIES_MAPPING.forEach(({ key }) => {
      const xs = [], ys = [];
      chartData.forEach(p => { if (p[key] != null && !isNaN(p[key])) { xs.push(p.timestamp); ys.push(p[key]); } });
      const fitted = loessSmooth(xs, ys, evalXs);
      out.forEach((row, i) => { row[key] = fitted[i] == null ? null : parseFloat(fitted[i].toFixed(2)); });
    });
    return out;
  }, [chartData]);

  const visibleData = useMemo(() => {
    if (!chartData.length || !dateDomain) return chartData;
    return chartData.filter(d => d.timestamp >= dateDomain[0] && d.timestamp <= dateDomain[1]);
  }, [chartData, dateDomain]);

  const trendData = useMemo(() => {
    if (!dateDomain) return smoothedData;
    return smoothedData.filter(d => d.timestamp >= dateDomain[0] && d.timestamp <= dateDomain[1]);
  }, [smoothedData, dateDomain]);

  const displayData = showTrend ? trendData : visibleData;
  const formatXAxisDate = useCallback((tick) => { const d = new Date(tick); return `${d.toLocaleString("en-US", { month: "short" })} '${d.getFullYear().toString().slice(2)}`; }, []);

  const tooltipContent = useCallback(({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;
    const displayDate = data.displayDate || data.dateLabel;
    const sorted = [...payload].sort((a, b) => (b.value || 0) - (a.value || 0));
    return (
      <div style={{ backgroundColor: "var(--tooltip-bg)", border: "1px solid var(--tooltip-border)", borderRadius: 8, padding: "10px 12px", backdropFilter: "blur(8px)", boxShadow: "0 8px 24px rgba(0,0,0,0.2)", minWidth: 160 }}>
        <div style={{ fontFamily: "var(--ff-head)", fontWeight: 700, color: "var(--text-title)", fontSize: 13, marginBottom: 2 }}>{displayDate}</div>
        <div style={{ fontSize: 9, color: "var(--text-muted)", fontFamily: "var(--ff-body)", marginBottom: 8, paddingBottom: 6, borderBottom: "1px solid var(--border)" }}>
          {data.isTrend ? t("Local Regression (LOESS)") : `${data.pollster || t("Unknown Firm")}${data.sample_size ? ` | N=${data.sample_size}` : ""}`}
        </div>
        {sorted.map((entry, idx) => (
          <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 3 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: entry.color }}/>
              <span style={{ fontSize: 10, fontFamily: "var(--ff-body)", color: "var(--text-main)" }}>{entry.name}</span>
            </div>
            <span style={{ fontSize: 10, fontFamily: "var(--ff-mono)", color: "var(--text-bright)", fontWeight: 600 }}>{Number(entry.value).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    );
  }, [t]);

  // Clicking on/near a poll point opens a small popup. We always resolve back to the
  // RAW poll (by timestamp) so the copied numbers are the real poll, not the LOESS trend.
  const handleChartClick = useCallback((state) => {
    if (!state || !state.activePayload || !state.activePayload.length) { setPopup(null); return; }
    const ts = state.activeLabel;
    const raw = chartData.find(d => Number(d.timestamp) === Number(ts)) || state.activePayload[0].payload;
    if (!raw) { setPopup(null); return; }
    const coord = state.activeCoordinate || { x: state.chartX ?? 0, y: state.chartY ?? 0 };
    const W = chartBoxRef.current ? chartBoxRef.current.clientWidth : 600;
    const PW = 204;
    let left = (coord.x ?? 0) + 14;
    if (left + PW > W) left = (coord.x ?? 0) - PW - 14;
    if (left < 6) left = 6;
    const top = Math.max(6, Math.min((coord.y ?? 0) - 8, 300 - 116));
    setPopup({ left, top, poll: raw });
  }, [chartData]);

  const applyPollToProjection = useCallback(() => {
    if (!popup?.poll) return;
    const avg = {};
    POLL_PARTIES_MAPPING.forEach(({ key }) => {
      const v = popup.poll[key];
      if (v != null && !isNaN(v)) avg[key] = Number(v);   // parties that didn't exist yet (null) are skipped → 0
    });
    onApplyPoll?.(avg, popup.poll);
    setPopup(null);
  }, [popup, onApplyPoll]);

  // Open the popup for a specific point. Fired from the dot's own DOM node, so it
  // works on touch + click without a hover-set active state — that was why the old
  // chart-level handler "didn't work" on tap. Always resolves to the RAW poll.
  const openPopupFor = useCallback((payload, cx, cy) => {
    if (!payload) return;
    const raw = chartData.find(d => Number(d.timestamp) === Number(payload.timestamp)) || payload;
    const W = chartBoxRef.current ? chartBoxRef.current.clientWidth : 600;
    const PW = 204;
    let left = (cx ?? 0) + 14;
    if (left + PW > W) left = (cx ?? 0) - PW - 14;
    if (left < 6) left = 6;
    const top = Math.max(6, Math.min((cy ?? 0) - 8, 300 - 116));
    setPopup({ left, top, poll: raw });
  }, [chartData]);

  // Interactive dot: small visible marker + a larger transparent hit area so the
  // points are easy to tap. In trend mode the marker is hidden (clean line) but the
  // hit area still works, so you can copy a poll from either view.
  const makeDot = useCallback((color, hideMarker) => {
    const InteractiveDot = (props) => {
      const { cx, cy, index, dataKey, payload } = props;
      if (cx == null || cy == null || isNaN(cx) || isNaN(cy)) return null;
      return (
        <g key={`${dataKey}-${index}`} style={{ cursor: "pointer" }}
           onClick={(e) => { e.stopPropagation(); openPopupFor(payload, cx, cy); }}>
          <circle cx={cx} cy={cy} r={11} fill="transparent" />
          {!hideMarker && <circle cx={cx} cy={cy} r={2.5} fill={color} />}
        </g>
      );
    };
    return InteractiveDot;
  }, [openPopupFor]);

  return (
    <div className="gr-poll-card" style={{ ...S.card, padding: "16px 16px 10px 16px" }}>
      <style>{`
        .gr-poll-card, .gr-poll-card * { -webkit-tap-highlight-color: transparent; }
        .gr-poll-card :focus, .gr-poll-card :focus-visible { outline: none; }
        .gr-poll-card svg, .gr-poll-card path, .gr-poll-card circle,
        .gr-poll-card .recharts-wrapper, .gr-poll-card .recharts-surface,
        .gr-poll-card .recharts-layer, .gr-poll-card .recharts-dot,
        .gr-poll-card .recharts-active-dot { outline: none !important; }
      `}</style>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={S.label}>{source || t("Loading live polls…")}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {error && <div style={{ fontSize: 9, color: "var(--text-dim)", fontFamily: "var(--ff-body)", background: "#ef444422", padding: "3px 6px", borderRadius: 4 }}>{t("Fallback data")}</div>}
          <button className="icon-btn" onClick={reload} disabled={loading} style={{ ...BTN_BASE, ...S.ghostBtn, padding: "4px 8px", background: "var(--btn-bg)", opacity: loading ? 0.5 : 1 }}>{t("🔄 Refresh")}</button>
          <button className="icon-btn" onClick={() => setShowTrend(s => !s)} style={{ ...BTN_BASE, ...S.ghostBtn, padding: "4px 8px", background: "var(--btn-bg)", color: showTrend ? "#60A5FA" : "var(--text-muted)" }}>{showTrend ? t("📉 Trendline") : t("📊 Raw Polls")}</button>
          <button className="icon-btn" onClick={() => setIsSmooth(s => !s)} style={{ ...BTN_BASE, ...S.ghostBtn, padding: "4px 8px", background: "var(--btn-bg)" }}>{isSmooth ? t("📈 Smooth") : t("📉 Spiky")}</button>
          <button className="icon-btn" onClick={() => setShowDashed(s => !s)} style={{ ...BTN_BASE, ...S.ghostBtn, padding: "4px 8px", background: "var(--btn-bg)", color: showDashed ? "#60A5FA" : "var(--text-muted)" }} title={t("Toggle dashed lines")}>{showDashed ? t("╌╌ Dashed") : t("── Solid")}</button>
        </div>
      </div>

      {loading ? (
        <div style={{ width: "100%", height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "var(--text-dim)", fontSize: 11, ...S.mono }}>{t("Fetching latest polls…")}</span></div>
      ) : (<>
        <div ref={chartBoxRef} style={{ 
          width: "100%", 
          height: 300, 
          minWidth: 0,
          minHeight: 300, 
          overflow: "hidden", 
          position: "relative",
          cursor: "pointer"
        }}>
          {displayData && displayData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }} onClick={handleChartClick}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                <XAxis dataKey="timestamp" type="number" scale="time" domain={["dataMin", "dataMax"]} tickFormatter={formatXAxisDate} stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false}/>
                <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false}/>
                <RechartsTooltip content={tooltipContent} cursor={{ stroke: "var(--border)", strokeWidth: 1, strokeDasharray: "3 3" }}/>
                {POLL_PARTIES_MAPPING.map(p => {
                  if (hiddenParties.includes(p.key)) return null;
                  const color = GR_PARTY_DICT[p.dictKey]?.color || p.color || "#ccc";
                  return (
                    <Line 
                      key={p.key} 
                      type={isSmooth ? "monotone" : "linear"} 
                      dataKey={p.key}
                      name={tPartyNameById(lang, p.dictKey, p.key)}
                      stroke={color} 
                      strokeWidth={showTrend ? 3 : 2} 
                      dot={makeDot(color, showTrend)} 
                      activeDot={{ r: 5 }} 
                      connectNulls 
                      isAnimationActive={false}
                      strokeDasharray={showDashed ? (p.key === "ELAS" || p.key === "ELPIDA" ? "8 3" : "5 4") : (p.key === "ELAS" || p.key === "ELPIDA" ? "6 3" : undefined)}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: 11 }}>
              {t("No poll data available to display")}
            </div>
          )}

          {popup && (
            <div style={{ position: "absolute", left: popup.left, top: popup.top, zIndex: 40, width: 204, background: "var(--tooltip-bg, var(--bg-mid))", border: "1px solid var(--tooltip-border, var(--border))", borderRadius: 8, padding: "8px 10px", boxShadow: "0 8px 24px rgba(0,0,0,0.28)", backdropFilter: "blur(8px)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: onApplyPoll ? 7 : 0 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-title)", fontFamily: "var(--ff-head)", lineHeight: 1.2 }}>{popup.poll.displayDate || popup.poll.dateLabel}</div>
                  <div style={{ fontSize: 9, color: "var(--text-muted)", fontFamily: "var(--ff-body)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{popup.poll.pollster || t("Unknown firm")}</div>
                </div>
                <button onClick={() => setPopup(null)} style={{ ...BTN_BASE, background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 12, lineHeight: 1, padding: 2 }}>✕</button>
              </div>
              {onApplyPoll && (
                <button onClick={applyPollToProjection} style={{ ...BTN_BASE, width: "100%", background: "#2563EB", color: "#fff", border: "none", borderRadius: 6, padding: "6px 8px", cursor: "pointer", fontFamily: "var(--ff-body)", fontWeight: 700, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>{t("📥 Copy for the projection")}</button>
              )}
            </div>
          )}
        </div>
        <DateRangeSlider data={chartData} domain={dateDomain} setDomain={setDateDomain}/>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 8px", marginTop: 4, justifyContent: "center" }}>
          {POLL_PARTIES_MAPPING.map(p => {
            const isHidden = hiddenParties.includes(p.key);
            const color    = GR_PARTY_DICT[p.dictKey]?.color || p.color || "#ccc";
            return (
              <button key={p.key} className="icon-btn" onClick={() => setHiddenParties(prev => prev.includes(p.key) ? prev.filter(x => x !== p.key) : [...prev, p.key])} style={{ ...BTN_BASE, display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 12, cursor: "pointer", background: isHidden ? "transparent" : `${color}15`, border: `1px solid ${isHidden ? "var(--border)" : color}`, opacity: isHidden ? 0.4 : 1 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: isHidden ? "var(--text-muted)" : color }}/>
                <span style={{ fontSize: 10, color: isHidden ? "var(--text-muted)" : "var(--text-main)", fontFamily: "var(--ff-body)", fontWeight: 600 }}>{tPartyNameById(lang, p.dictKey, p.key)}</span>
              </button>
            );
          })}
        </div>
      </>)}
    </div>
  );
}
