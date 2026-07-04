import { useState, useMemo, useDeferredValue, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { S, EASE_SPRING, EASE_STD } from "./GreeceStyles";
import { GR } from "./greece-data.js";
import { IconChevron } from "./GreeceIcons";
import { grRunMonteCarlo, grCoalitionProbability } from "./greece-montecarlo.js";
import { useGreeceT, T, fmtRunsLabel, fmtMajorityLine, fmtChanceOfReaching, fmtMedianSeatsCombined, fmtSeatDistFooter, fmtMcMethodologyFooter, fmtLeaderFirst, fmtOutrightMajority, fmtAboutXIn10, tPartyName } from "./GreeceTranslations.jsx";

// Friendly probability formatting — forecasters avoid false precision (58.3%).
const pct = (p) => `${Math.round(p * 100)}%`;
const inWords = (p, lang) => {
  if (p >= 0.97) return lang === "el" ? "σχεδόν βέβαιο" : "almost certain";
  if (p <= 0.03) return lang === "el" ? "πολύ απίθανο" : "very unlikely";
  return fmtAboutXIn10(lang, Math.round(p * 10));
};

export default function MonteCarloPanel({ effectiveParties, parties, threshold, turnout, isMobile, lang, scenarioId }) {
  const t = useGreeceT(lang);
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(true);
  const [sigma, setSigma] = useState(2.5);
  const [iterations, setIterations] = useState(4000);
  const [coalition, setCoalition] = useState([]);
  const [distSel, setDistSel] = useState([]); // parties shown in the seat-distribution chart

  // Defer heavy inputs so slider drags and live edits stay smooth.
  const dEff   = useDeferredValue(effectiveParties);
  const dSigma = useDeferredValue(sigma);
  const dIter  = useDeferredValue(iterations);
  const dExp   = useDeferredValue(expanded);
  const computing = dEff !== effectiveParties || dSigma !== sigma || dIter !== iterations;

  const mc = useMemo(
    () => (dExp ? grRunMonteCarlo(dEff, { threshold, turnout, sigma: dSigma, iterations: dIter, scenarioId }) : null),
    [dExp, dEff, threshold, turnout, dSigma, dIter, scenarioId]
  );

  const coalResult = useMemo(() => (mc ? grCoalitionProbability(mc, coalition) : null), [mc, coalition]);
  const toggle = (id) => setCoalition((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  const distToggle = (id) => setDistSel((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  // Real per-party seat distributions, built from the stored simulation matrix.
  // The leading party is shown automatically until the user picks their own set.
  const dist = useMemo(() => {
    if (!mc || !mc.seatMatrix) return null;
    const leaderId = mc.parties[0]?.id;
    const showIds = (leaderId ? [leaderId, ...distSel.filter((id) => id !== leaderId)] : distSel).filter((id) =>
      mc.parties.some((p) => p.id === id)
    );
    if (!showIds.length) return { series: [], showIds, distMax: 60, binW: 1 };

    // Shared x-axis: 0 → just past the widest 99th-percentile outcome.
    let maxSeat = 0;
    showIds.forEach((id) => {
      for (let s = 0; s < mc.iterations; s++) {
        const v = mc.seatMatrix[s][id] || 0;
        if (v > maxSeat) maxSeat = v;
      }
    });
    const distMax = Math.min(GR.TOTAL_SEATS, Math.max(60, Math.ceil((maxSeat + 6) / 20) * 20));
    const N = distMax + 1;                 // one slot per integer seat total
    const h = Math.max(1, Math.round(distMax / 55)); // smoothing half-window for the line

    const series = showIds.map((id) => {
      const meta = mc.parties.find((p) => p.id === id);
      // Exact count of how many runs produced each integer seat total.
      const counts = new Array(N).fill(0);
      for (let s = 0; s < mc.iterations; s++) {
        const v = mc.seatMatrix[s][id] || 0;
        if (v >= 0 && v < N) counts[v]++;
      }
      const peakRaw = Math.max(1, ...counts);
      // Moving-average smoothing so the integer lumpiness reads as a clean curve.
      const sm = new Array(N);
      for (let i = 0; i < N; i++) {
        let sum = 0, n = 0;
        for (let k = i - h; k <= i + h; k++) { if (k >= 0 && k < N) { sum += counts[k]; n++; } }
        sm[i] = sum / n;
      }
      const peakSm = Math.max(1, ...sm);
      return { id, name: meta?.name, color: meta?.color || "#888", median: meta?.median ?? 0, p5: meta?.p5 ?? 0, p95: meta?.p95 ?? 0, counts, peakRaw, sm, peakSm };
    });
    return { series, showIds, distMax, N, leaderId };
  }, [mc, distSel]);

  // Chart display mode + hover state (hover only touches this tiny state → no lag).
  const [distMode, setDistMode] = useState("both"); // "line" | "bars" | "both"
  const [hoverSeat, setHoverSeat] = useState(null);

  // Measure the chart's real pixel width so the SVG viewBox matches it 1:1.
  // This keeps the X and Y scales equal — no stretched/distorted axis labels.
  const [chartW, setChartW] = useState(900);
  const roRef = useRef(null);
  const setChartNode = useCallback((node) => {
    if (roRef.current) { roRef.current.disconnect(); roRef.current = null; }
    if (node) {
      const ro = new ResizeObserver((entries) => {
        const w = entries[0]?.contentRect?.width;
        if (w) setChartW(Math.round(w));
      });
      ro.observe(node);
      roRef.current = ro;
      const w = node.getBoundingClientRect().width;
      if (w) setChartW(Math.round(w));
    }
  }, []);

  const axisMax = mc ? Math.max(160, Math.max(...mc.parties.map((p) => p.p95)) + 10) : 160;
  const leader = mc ? mc.parties.reduce((a, b) => (b.pFirst > (a?.pFirst ?? -1) ? b : a), null) : null;
  const bestMaj = mc ? mc.parties.reduce((a, b) => (b.pSoloMajority > (a?.pSoloMajority ?? -1) ? b : a), null) : null;

  return (
    <div style={{ ...S.card }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: expanded ? 14 : 0, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={S.label}>{t("🎲 Probabilistic Forecast")}</span>
          {expanded && mc && (
            <span style={{ fontSize: 9, color: "var(--text-dim)", ...S.mono, letterSpacing: 0.5 }}>
              {fmtRunsLabel(lang, mc.iterations, computing)}
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            className="icon-btn"
            onClick={() => navigate('/greece/correlations')}
            style={{
              ...S.ghostBtn,
              background: "var(--bg-mid)",
              border: "1px solid #3B82F6",
              color: "#3B82F6",
              fontWeight: 600,
              padding: "4px 9px"
            }}
          >
            {t("📊 Create Detailed Correlation Models")}
          </button>

          <button className="icon-btn" onClick={() => setExpanded((e) => !e)} style={{ ...S.ghostBtn, padding: "4px 9px" }}>
            {expanded ? t("Hide") : t("Show")} <IconChevron dir={expanded ? "up" : "down"} size={9} />
          </button>
        </div>
      </div>

      {expanded && (
        !mc ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 12, fontFamily: "var(--ff-body)" }}>
            {t("No qualifying parties to simulate.")}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, opacity: computing ? 0.6 : 1, transition: `opacity 0.2s ${EASE_STD}` }}>

            {/* What this is + controls */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ margin: 0, fontSize: 11, lineHeight: 1.55, color: "var(--text-muted)", fontFamily: "var(--ff-body)", flex: 1, minWidth: 240 }}>
                <T lang={lang}
                  en={<>Your current vote shares re-run thousands of times with random polling error, showing the <strong style={{ color: "var(--text-main)" }}>range</strong> and <strong style={{ color: "var(--text-main)" }}>odds</strong> for each party. The seat table above is the single fixed estimate; this is the spread around it.</>}
                  el={<>Τα τρέχοντα ποσοστά ψήφων επανεκτελούνται χιλιάδες φορές με τυχαίο σφάλμα δημοσκόπησης, δείχνοντας το <strong style={{ color: "var(--text-main)" }}>εύρος</strong> και τις <strong style={{ color: "var(--text-main)" }}>πιθανότητες</strong> για κάθε κόμμα. Ο πίνακας εδρών παραπάνω είναι η μοναδική σταθερή εκτίμηση· αυτό είναι το εύρος γύρω από αυτή.</>}
                />
              </p>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-end" }}>
                <div style={{ width: 150 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: 0.5 }}>{t("UNCERTAINTY")}</span>
                    <span style={{ fontSize: 10, ...S.mono, color: "#60A5FA" }}>±{sigma.toFixed(1)}</span>
                  </div>
                  <input type="range" min={0.5} max={6} step={0.5} value={sigma} onChange={(e) => setSigma(parseFloat(e.target.value))}
                    style={{ width: "100%", height: 5, borderRadius: 4, outline: "none", cursor: "pointer", background: `linear-gradient(to right,#60A5FA 0%,#60A5FA ${((sigma - 0.5) / 5.5) * 100}%,var(--border) ${((sigma - 0.5) / 5.5) * 100}%)` }} />
                </div>
                <select value={iterations} onChange={(e) => setIterations(parseInt(e.target.value))} style={{ ...S.editInput, cursor: "pointer", padding: "4px 6px", height: 26 }}>
                  <option value={2000}>{t("2k runs")}</option>
                  <option value={4000}>{t("4k runs")}</option>
                  <option value={10000}>{t("10k runs")}</option>
                  <option value={20000}>{t("20k runs")}</option>
                </select>
              </div>
            </div>

            {/* Headline */}
            <div style={{ padding: "10px 14px", background: "var(--btn-bg)", border: "1px solid var(--divider)", borderRadius: 6, fontSize: 12, lineHeight: 1.55, fontFamily: "var(--ff-body)" }}>
              {leader && <><strong style={{ color: leader.color }}>{tPartyName(lang, leader)}</strong> {fmtLeaderFirst(lang)} <strong>{pct(leader.pFirst)}</strong> {t("of runs.")} </>}
              {bestMaj && bestMaj.pSoloMajority >= 0.02
                ? <><strong>{tPartyName(lang, bestMaj)}</strong> {fmtOutrightMajority(lang)} <strong>{pct(bestMaj.pSoloMajority)}</strong> {t("of the time.")} </>
                : <>{t("A single-party majority is very unlikely.")} </>}
              {t("Hung parliament:")} <strong>{pct(mc.pHung)}</strong> ({inWords(mc.pHung, lang)}).
            </div>

            {/* Two columns: per-party odds + coalition arithmetic */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.35fr 1fr", gap: 18 }}>

              {/* Per-party odds */}
              <div>
                <div style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: 1, textTransform: "uppercase", fontFamily: "var(--ff-body)", marginBottom: 10 }}>{t("Odds & seat range per party")}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {mc.parties.filter((p) => p.p95 > 0 || p.mean > 0.5).map((p) => {
                    const left = (p.p5 / axisMax) * 100;
                    const width = Math.max(0.8, ((p.p95 - p.p5) / axisMax) * 100);
                    const med = (p.median / axisMax) * 100;
                    return (
                      <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, width: 78, flexShrink: 0 }}>
                          <div style={{ width: 3, height: 14, borderRadius: 2, background: p.color, flexShrink: 0 }} />
                          <span style={{ fontSize: 11, color: "var(--text-main)", fontWeight: 600, fontFamily: "var(--ff-body)" }}>{tPartyName(lang, p)}</span>
                        </div>
                        {/* seat range bar */}
                        <div style={{ flex: 1, position: "relative", height: 16, background: "var(--bg-up)", borderRadius: 4, overflow: "hidden" }}>
                          <div style={{ position: "absolute", left: `${(GR.MAJORITY / axisMax) * 100}%`, top: 0, bottom: 0, width: 1, background: "#F59E0B", opacity: 0.7, zIndex: 3 }} />
                          <div style={{ position: "absolute", left: `${left}%`, width: `${width}%`, top: 3, bottom: 3, background: `${p.color}55`, border: `1px solid ${p.color}`, borderRadius: 3, transition: `all 0.3s ${EASE_SPRING}` }} />
                          <div style={{ position: "absolute", left: `${med}%`, top: 1, bottom: 1, width: 2, background: p.color, zIndex: 2 }} />
                        </div>
                        <div style={{ width: 72, fontSize: 10, ...S.mono, textAlign: "right", flexShrink: 0 }}>
                          <span style={{ color: "var(--text-bright)", fontWeight: 700 }}>{p.median}</span>
                          <span style={{ color: "var(--text-dim)" }}> ({p.p5}–{p.p95})</span>
                        </div>
                        <div style={{ width: 34, fontSize: 10, ...S.mono, textAlign: "right", color: p.pFirst >= 0.01 ? "#60A5FA" : "var(--text-dim)", flexShrink: 0 }}>
                          {p.pFirst >= 0.005 ? pct(p.pFirst) : "—"}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ fontSize: 8, color: "var(--text-dim)", marginTop: 8, display: "flex", flexWrap: "wrap", gap: 12, fontFamily: "var(--ff-body)" }}>
                  <span>{t("bar = 90% range · tick = median seats")}</span>
                  <span style={{ color: "#F59E0B" }}>{fmtMajorityLine(lang, GR.MAJORITY)}</span>
                  <span style={{ color: "#60A5FA" }}>{t("right column = chance of finishing 1st")}</span>
                </div>
              </div>

              {/* Coalition arithmetic (user-driven only) */}
              <div>
                <div style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: 1, textTransform: "uppercase", fontFamily: "var(--ff-body)", marginBottom: 10 }}>{t("Coalition arithmetic")}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
                  {mc.parties.filter((p) => p.mean >= 0.5).map((p) => {
                    const active = coalition.includes(p.id);
                    return (
                      <button key={p.id} className="coalition-chip" onClick={() => toggle(p.id)}
                        style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 8px", borderRadius: 4, cursor: "pointer", background: active ? `${p.color}20` : "var(--btn-bg)", border: `1px solid ${active ? p.color : "var(--border)"}` }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: p.color }} />
                        <span style={{ fontSize: 9, color: active ? "var(--text-title)" : "var(--text-muted)", fontFamily: "var(--ff-body)" }}>{tPartyName(lang, p)}</span>
                      </button>
                    );
                  })}
                </div>
                {coalition.length > 0 && coalResult ? (
                  <div style={{ padding: "10px 14px", borderRadius: 6, border: `1px solid ${coalResult.pMajority >= 0.5 ? "#34D39955" : "#F8717155"}`, background: coalResult.pMajority >= 0.5 ? "#34D39912" : "#F8717112" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--ff-body)" }}>{fmtChanceOfReaching(lang, GR.MAJORITY)}</span>
                      <span style={{ fontSize: 20, fontWeight: 900, fontFamily: "var(--ff-head)", color: coalResult.pMajority >= 0.5 ? "#34D399" : "#F87171" }}>{pct(coalResult.pMajority)}</span>
                    </div>
                    <div style={{ fontSize: 9, color: "var(--text-dim)", marginTop: 3, fontFamily: "var(--ff-mono)" }}>{fmtMedianSeatsCombined(lang, coalResult.medianSeats)}</div>
                  </div>
                ) : (
                  <div style={{ fontSize: 10, color: "var(--text-dim)", fontFamily: "var(--ff-body)", fontStyle: "italic" }}>{t("Pick any parties to test if the numbers add up to a majority.")}</div>
                )}
                <div style={{ fontSize: 8, color: "var(--text-dim)", marginTop: 10, lineHeight: 1.5, fontFamily: "var(--ff-body)" }}>
                  <T lang={lang}
                    en={<>Pure seat arithmetic — this makes <strong>no</strong> assumption about which parties would actually agree to govern together. Greek coalitions are unpredictable (e.g. SYRIZA–ANEL in 2015), so who allies is your call, not the model's.</>}
                    el={<>Καθαρή αριθμητική εδρών — αυτό <strong>δεν</strong> κάνει καμία υπόθεση για ποια κόμματα θα συμφωνούσαν πραγματικά να κυβερνήσουν μαζί. Οι ελληνικές συμμαχίες είναι απρόβλεπτες (π.χ. ΣΥΡΙΖΑ–ΑΝΕΛ το 2015), οπότε ποιοι συνεργάζονται είναι δική σας επιλογή, όχι του μοντέλου.</>}
                  />
                </div>
              </div>
            </div>

            {/* Seat-distribution curves — the spread of outcomes per party */}
            {dist && (
              <div>
                <div style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: 1, textTransform: "uppercase", fontFamily: "var(--ff-body)", marginBottom: 10 }}>
                  {t("Seat distribution")} &nbsp;<span style={{ textTransform: "none", letterSpacing: 0, color: "var(--text-dim)" }}>{t("— how often each seat total comes up across all runs")}</span>
                </div>

                {/* Party selector (leader auto-included) */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
                  {mc.parties.filter((p) => p.mean >= 0.5).map((p) => {
                    const isLeader = p.id === dist.leaderId;
                    const active = dist.showIds.includes(p.id);
                    return (
                      <button key={p.id} className="coalition-chip" onClick={() => !isLeader && distToggle(p.id)}
                        title={isLeader ? t("Leading party — always shown") : undefined}
                        style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 8px", borderRadius: 4, cursor: isLeader ? "default" : "pointer", opacity: isLeader && !active ? 0.6 : 1, background: active ? `${p.color}20` : "var(--btn-bg)", border: `1px solid ${active ? p.color : "var(--border)"}` }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: p.color }} />
                        <span style={{ fontSize: 9, color: active ? "var(--text-title)" : "var(--text-muted)", fontFamily: "var(--ff-body)" }}>{tPartyName(lang, p)}{isLeader ? " ★" : ""}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Mode toggle */}
                {dist.series.length > 0 && (
                  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 6 }}>
                    <div style={{ display: "inline-flex", border: "1px solid var(--border)", borderRadius: 5, overflow: "hidden" }}>
                      {["line", "bars", "both"].map((m) => (
                        <button key={m} onClick={() => setDistMode(m)}
                          style={{ padding: "3px 10px", fontSize: 9, letterSpacing: 0.5, textTransform: "uppercase", cursor: "pointer", border: "none", fontFamily: "var(--ff-body)", background: distMode === m ? "var(--btn-bg-active, #60A5FA22)" : "transparent", color: distMode === m ? "#60A5FA" : "var(--text-dim)" }}>
                          {t(m)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* The chart */}
                {dist.series.length > 0 && (() => {
                  const VBW = chartW, VBH = 300, padL = 10, padR = 10, padT = 26, padB = 28;
                  const plotW = VBW - padL - padR, plotH = VBH - padT - padB, baseline = padT + plotH;
                  const maxH = plotH * 0.84;                       // leave headroom above peaks
                  const X = (seat) => padL + (seat / dist.distMax) * plotW;
                  const ticks = []; for (let t = 0; t <= dist.distMax; t += 50) ticks.push(t);
                  const barW = Math.max(0.8, (plotW / dist.distMax) * 0.9);
                  const showLine = distMode !== "bars";
                  const showBars = distMode !== "line";

                  const onMove = (e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    let seat = Math.round(((e.clientX - r.left) / r.width) * dist.distMax);
                    seat = Math.max(0, Math.min(dist.distMax, seat));
                    setHoverSeat((prev) => (prev === seat ? prev : seat));
                  };
                  const hovX = hoverSeat != null ? (X(hoverSeat) / VBW) * 100 : 0;

                  return (
                    <div style={{ position: "relative", background: "var(--bg-up)", border: "1px solid var(--divider)", borderRadius: 6, padding: "8px 6px 4px" }}>
                      <svg ref={setChartNode} viewBox={`0 0 ${VBW} ${VBH}`} preserveAspectRatio="none" style={{ width: "100%", height: VBH, display: "block", overflow: "visible" }}>
                        {/* gridlines + axis labels */}
                        {ticks.map((t) => (
                          <g key={t}>
                            <line x1={X(t)} y1={padT} x2={X(t)} y2={baseline} stroke="var(--border)" strokeWidth={1} opacity={0.35} />
                            <text x={X(t)} y={baseline + 16} textAnchor="middle" fontSize={10} fill="var(--text-dim)" fontFamily="var(--ff-mono)">{t}</text>
                          </g>
                        ))}
                        {/* 151 majority marker */}
                        {GR.MAJORITY <= dist.distMax && (
                          <g>
                            <line x1={X(GR.MAJORITY)} y1={padT - 4} x2={X(GR.MAJORITY)} y2={baseline} stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="3 3" opacity={0.85} />
                            <text x={X(GR.MAJORITY)} y={padT - 7} textAnchor="middle" fontSize={9} fill="#F59E0B" fontFamily="var(--ff-mono)">151</text>
                          </g>
                        )}
                        {/* baseline */}
                        <line x1={padL} y1={baseline} x2={VBW - padR} y2={baseline} stroke="var(--border)" strokeWidth={1} />

                        {/* bars */}
                        {showBars && dist.series.map((s) => (
                          <g key={`b-${s.id}`}>
                            {s.counts.map((c, seat) => c > 0 ? (
                              <rect key={seat} x={X(seat) - barW / 2} y={baseline - (c / s.peakRaw) * maxH} width={barW} height={(c / s.peakRaw) * maxH} fill={s.color} opacity={distMode === "both" ? 0.28 : 0.5} />
                            ) : null)}
                          </g>
                        ))}

                        {/* smoothed line + area */}
                        {showLine && dist.series.map((s) => {
                          const pts = s.sm.map((v, i) => [X(i), baseline - (v / s.peakSm) * maxH]);
                          const line = "M " + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L ");
                          const area = `M ${pts[0][0].toFixed(1)} ${baseline} L ` + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L ") + ` L ${pts[pts.length - 1][0].toFixed(1)} ${baseline} Z`;
                          return (
                            <g key={`l-${s.id}`}>
                              {distMode === "line" && <path d={area} fill={s.color} opacity={0.15} />}
                              <path d={line} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" />
                            </g>
                          );
                        })}

                        {/* median ticks + labels */}
                        {dist.series.map((s) => (
                          <g key={`m-${s.id}`}>
                            <line x1={X(s.median)} y1={baseline} x2={X(s.median)} y2={baseline - maxH - 2} stroke={s.color} strokeWidth={1} opacity={0.5} />
                            <text x={X(s.median)} y={baseline - maxH - 6} textAnchor="middle" fontSize={11} fontWeight={700} fill={s.color} fontFamily="var(--ff-mono)">{s.median}</text>
                          </g>
                        ))}

                        {/* hover guide + dots */}
                        {hoverSeat != null && (
                          <g pointerEvents="none">
                            <line x1={X(hoverSeat)} y1={padT - 4} x2={X(hoverSeat)} y2={baseline} stroke="var(--text-main)" strokeWidth={1} opacity={0.4} />
                            {dist.series.map((s) => {
                              const v = showLine ? s.sm[hoverSeat] / s.peakSm : s.counts[hoverSeat] / s.peakRaw;
                              return <circle key={`d-${s.id}`} cx={X(hoverSeat)} cy={baseline - v * maxH} r={3} fill={s.color} stroke="var(--bg-up)" strokeWidth={1} />;
                            })}
                          </g>
                        )}

                        {/* transparent hover capture */}
                        <rect x={padL} y={padT - 8} width={plotW} height={plotH + 8} fill="transparent" pointerEvents="all"
                          onMouseMove={onMove} onMouseLeave={() => setHoverSeat(null)} style={{ cursor: "crosshair" }} />
                      </svg>

                      {/* hover tooltip */}
                      {hoverSeat != null && (
                        <div style={{ position: "absolute", top: 6, left: `${hovX}%`, transform: `translateX(${hovX > 70 ? "-100%" : hovX < 30 ? "0%" : "-50%"})`, pointerEvents: "none", background: "var(--bg-card, #0d1424)", border: "1px solid var(--divider)", borderRadius: 6, padding: "6px 9px", boxShadow: "0 4px 14px rgba(0,0,0,0.4)", zIndex: 5, minWidth: 130 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-bright)", ...S.mono, marginBottom: 4 }}>{hoverSeat} {t("seats")}</div>
                          {dist.series.map((s) => {
                            const c = s.counts[hoverSeat] || 0;
                            return (
                              <div key={`t-${s.id}`} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 9, fontFamily: "var(--ff-body)", lineHeight: 1.5 }}>
                                <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                                <span style={{ color: "var(--text-main)", fontWeight: 600 }}>{tPartyName(lang, s)}</span>
                                <span style={{ color: "var(--text-dim)", ...S.mono, marginLeft: "auto" }}>{c.toLocaleString()} ({((c / mc.iterations) * 100).toFixed(1)}%)</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* legend */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, padding: "6px 4px 2px" }}>
                        {dist.series.map((s) => (
                          <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 9, height: 3, borderRadius: 2, background: s.color }} />
                            <span style={{ fontSize: 10, color: "var(--text-main)", fontWeight: 600, fontFamily: "var(--ff-body)" }}>{tPartyName(lang, s)}</span>
                            <span style={{ fontSize: 9, ...S.mono, color: "var(--text-dim)" }}>{t("median")} {s.median} · 90% {s.p5}–{s.p95}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
                <div style={{ fontSize: 8, color: "var(--text-dim)", marginTop: 8, lineHeight: 1.5, fontFamily: "var(--ff-body)" }}>
                  {fmtSeatDistFooter(lang, GR.MAJORITY)}
                </div>
              </div>
            )}

            <div style={{ fontSize: 8, color: "var(--text-dim)", borderTop: "1px solid var(--divider)", paddingTop: 10, lineHeight: 1.5, fontFamily: "var(--ff-body)" }}>
              {fmtMcMethodologyFooter(lang, mc.iterations)}
            </div>
          </div>
        )
      )}
    </div>
  );
}
