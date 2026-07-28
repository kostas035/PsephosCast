import { useState, useMemo, useEffect, useCallback, useTransition } from "react";
import { useNavigate } from "react-router-dom";

import {
  USA, USA_SCENARIOS, USA_SCENARIO_LABELS, USA_SCENARIO_TURNOUT, USA_DEM_RESET,
} from "./usa-data.js";
import { usAllocateElectoralVotes, usFmtVotes } from "./usa-engine.js";
import { STYLES, S, MeanderBar, IconArrowLeft, IconCamera } from "./usa-ui.jsx";
import { USAMap } from "./usa-map.jsx";
import { USAControlPanel } from "./usa-control.jsx";
import { USAElectoralBar, USAMetricsCards, USAResultsTable } from "./USAResults.jsx";
import USAMonteCarloPanel from "./USAMonteCarloPanel.jsx";
import USAMethodologyModal from "./USAMethodologyModal.jsx";
import PrivacyModal from "../PrivacyModal";
import CookiesModal from "../CookiesModal";

const HOWTO = [
  { icon: "🎚️", title: "Adjust the Vote", text: "Use the sliders on the left to change the national GOP/DEM/Other percentages. Every state's result updates instantly via a logit swing from the selected baseline — swing states move the most, safe states barely move." },
  { icon: "🔒", title: "Lock a Candidate", text: "Click the padlock to freeze a candidate's score so it won't shift automatically when you move the others." },
  { icon: "🗺️", title: "Explore the Map", text: "Hover any state (or flip on Counties for real county-level detail in the battleground/major states) to see its vote shares, margin, and electoral votes. Switch map modes to see margin of victory or demographic layers." },
  { icon: "🎲", title: "Monte Carlo Forecast", text: "Scroll down to see thousands of simulated elections around your numbers, showing the range of Electoral College outcomes and each close state's win probability." },
];

export default function USAApp({ isMobile, theme = "dark", setTheme }) {
  const navigate = useNavigate();
  const [scenarioYear, setScenarioYear] = useState("2024");
  const [candidates, setCandidates] = useState(USA_SCENARIOS["2024"]);
  const [demSliders, setDemSliders] = useState(USA_DEM_RESET);
  const [isPending, startTransition] = useTransition();

  const [showMethodology, setShowMethodology] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showCookies, setShowCookies] = useState(false);
  const [showHowToUse, setShowHowToUse] = useState(false);
  const [mapCenter, setMapCenter] = useState(true);
  const [showExportPreview, setShowExportPreview] = useState(false);
  const [exportImageUrl, setExportImageUrl] = useState(null);
  const [isGeneratingExport, setIsGeneratingExport] = useState(false);

  const turnout = USA_SCENARIO_TURNOUT[scenarioYear] ?? 0;

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    const styleEl = document.getElementById("usa-styles");
    if (!styleEl) {
      const style = document.createElement("style");
      style.id = "usa-styles";
      style.innerHTML = STYLES;
      document.head.appendChild(style);
    } else {
      styleEl.innerHTML = STYLES;
    }
  }, [theme]);

  const handleScenarioChange = useCallback(e => {
    const year = e.target.value;
    setScenarioYear(year);
    setCandidates(USA_SCENARIOS[year]);
    setDemSliders({ ...USA_DEM_RESET });
  }, []);

  const handleToggleLock = useCallback(id => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, isLocked: !c.isLocked } : c));
  }, []);

  const handlePctChange = useCallback((id, newPct) => {
    startTransition(() => {
      setCandidates(prev => {
        const targetIdx = prev.findIndex(c => c.id === id);
        if (targetIdx === -1) return prev;
        const target = prev[targetIdx];
        const oldPct = target.userPercentage;

        let lockedTotal = 0, unlockedCount = 0;
        prev.forEach((c, i) => {
          if (i !== targetIdx) {
            if (c.isLocked) lockedTotal += c.userPercentage;
            else unlockedCount++;
          }
        });
        if (unlockedCount === 0) return prev;

        const finalPct = Math.max(0, Math.min(100, newPct, 100 - lockedTotal));
        if (finalPct === oldPct) return prev;

        const oldRem = 100 - oldPct - lockedTotal;
        const newRem = 100 - finalPct - lockedTotal;

        return prev.map((c, i) => {
          if (i === targetIdx) return { ...c, userPercentage: finalPct };
          if (c.isLocked) return c;
          if (oldRem <= 0.0001) return { ...c, userPercentage: c.userPercentage + (newRem / unlockedCount) };
          return { ...c, userPercentage: c.userPercentage * (newRem / oldRem) };
        });
      });
    });
  }, [startTransition]);

  const resetAll = useCallback(() => {
    setCandidates(USA_SCENARIOS[scenarioYear]);
    setDemSliders({ ...USA_DEM_RESET });
  }, [scenarioYear]);

  const effectiveCandidates = useMemo(() => {
    let pre = candidates.map(c => {
      const s = c.sensitivities || {};
      const delta = (demSliders.college / 10) * (s.college || 0) + (demSliders.seniors / 10) * (s.seniors || 0)
        + (demSliders.urban / 10) * (s.urban || 0) + (demSliders.hispanic / 10) * (s.hispanic || 0)
        + (demSliders.income / 10) * (s.income || 0) + (demSliders.gender / 10) * (s.gender || 0);
      return { ...c, effectivePct: Math.max(0.05, c.userPercentage + delta) };
    });
    const sum = pre.reduce((s, c) => s + c.effectivePct, 0);
    if (sum > 0) pre = pre.map(c => ({ ...c, effectivePct: (c.effectivePct / sum) * 100 }));
    return pre;
  }, [candidates, demSliders]);

  const electionResult = useMemo(
    () => usAllocateElectoralVotes(effectiveCandidates, scenarioYear, USA_SCENARIOS[scenarioYear]),
    [effectiveCandidates, scenarioYear]
  );

  const pendingClass = isPending ? "results-pending" : "results-ready";

  const handleGeneratePreview = async () => {
    setIsGeneratingExport(true);
    const exportEl = document.getElementById("usa-export-container");
    if (!exportEl) { setIsGeneratingExport(false); return; }
    exportEl.style.display = "flex";
    try {
      const html2canvasModule = await import("html2canvas");
      const html2canvas = html2canvasModule.default || html2canvasModule;
      const canvas = await html2canvas(exportEl, { backgroundColor: theme === "dark" ? "#0f172a" : "#f8fafc", scale: 2, useCORS: true, logging: false });
      setExportImageUrl(canvas.toDataURL("image/png"));
      setShowExportPreview(true);
    } catch (err) {
      console.error("Export preview failed:", err);
      alert("Failed to generate preview. Ensure html2canvas is installed.");
    } finally {
      exportEl.style.display = "none";
      setIsGeneratingExport(false);
    }
  };

  const handleDownloadExport = () => {
    if (!exportImageUrl) return;
    const link = document.createElement("a");
    link.href = exportImageUrl;
    link.download = `USA_Election_Export_${scenarioYear}.png`;
    link.click();
    setShowExportPreview(false);
  };

  const MapColumn = (
    <div className={pendingClass} style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
      <USAMap electionResult={electionResult} scenarioYear={scenarioYear} />
      <USAResultsTable electionResult={electionResult} scenarioYear={scenarioYear} />
    </div>
  );

  const ResultsColumn = (
    <div className={pendingClass} style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
      <USAElectoralBar electionResult={electionResult} scenarioYear={scenarioYear} />
    </div>
  );

  return (
    <div style={{ padding: isMobile ? "12px" : "16px 24px", width: "100%", minHeight: "100vh", boxSizing: "border-box", overflowX: "hidden", margin: 0, backgroundColor: "var(--bg-up)", color: "var(--text-main)" }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <button className="icon-btn" onClick={() => navigate('/')} style={{ ...S.ghostBtn, padding: "6px 10px", width: "100%", justifyContent: "flex-start" }}><IconArrowLeft size={12} /> All Countries</button>
              <button className="icon-btn" onClick={() => setMapCenter(v => !v)} style={{ ...S.ghostBtn, padding: "6px 10px", width: "100%", justifyContent: "flex-start" }}>
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="9" y1="3" x2="9" y2="21" /></svg> Layout
              </button>
              <button className="icon-btn" onClick={() => setShowHowToUse(true)} style={{ ...S.ghostBtn, padding: "6px 10px", width: "100%", justifyContent: "flex-start" }}>
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg> How to Use
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 28 }}>🇺🇸</span>
              <div>
                <div style={{ fontSize: isMobile ? 18 : 24, fontWeight: 900, fontFamily: "var(--ff-head)", letterSpacing: 2, color: "var(--text-title)", lineHeight: 1 }}>USA SWINGOMETER</div>
                <div style={{ fontSize: 9, color: "var(--text-dim)", fontFamily: "var(--ff-body)", letterSpacing: 3, marginTop: 3, textTransform: "uppercase" }}>Electoral College · {USA.TOTAL_EV} Votes · {USA.MAJORITY_EV} To Win · {usFmtVotes(turnout)} Votes Cast</div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexGrow: 1, padding: "0 10px", gap: 10, flexWrap: "wrap" }}>
            <button onClick={() => navigate('/greece')} style={{ background: "var(--bg-mid)", border: "1px solid var(--border)", borderRadius: 24, padding: "8px 20px", color: "var(--text-title)", fontFamily: "var(--ff-body)", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
              onMouseOver={e => { e.currentTarget.style.borderColor = "#2563EB"; e.currentTarget.style.color = "#2563EB"; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-title)"; }}>
              <span>🇬🇷</span> Greece
            </button>
            <button onClick={() => navigate('/cyprus')} style={{ background: "var(--bg-mid)", border: "1px solid var(--border)", borderRadius: 24, padding: "8px 20px", color: "var(--text-title)", fontFamily: "var(--ff-body)", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
              onMouseOver={e => { e.currentTarget.style.borderColor = "#2563EB"; e.currentTarget.style.color = "#2563EB"; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-title)"; }}>
              <span>🇨🇾</span> Cyprus
            </button>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, justifyContent: "flex-end", marginBottom: 5 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: isPending ? "#F59E0B" : "#22C55E", boxShadow: isPending ? "0 0 6px #F59E0B" : "0 0 6px #22C55E" }} />
              <span style={{ fontSize: 8, color: "var(--text-dim)", ...S.mono, letterSpacing: 1 }}>{isPending ? "COMPUTING…" : `LIVE — ${USA_SCENARIO_LABELS[scenarioYear]}`}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
              <button className="icon-btn" onClick={handleGeneratePreview} style={{ ...S.ghostBtn, opacity: isGeneratingExport ? 0.6 : 1, cursor: isGeneratingExport ? "wait" : "pointer" }} disabled={isGeneratingExport}>
                {isGeneratingExport ? "Generating…" : <><IconCamera size={10} /> Export</>}
              </button>
              <button className="icon-btn" onClick={() => setShowMethodology(true)} style={S.ghostBtn}>
                <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg> Methodology
              </button>
              {typeof setTheme === "function" && (
                <button className="icon-btn" onClick={() => setTheme(t => t === "dark" ? "light" : "dark")} style={S.ghostBtn} title="Toggle theme">
                  {theme === "dark"
                    ? <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
                    : <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>} Theme
                </button>
              )}
            </div>
          </div>
        </div>
        <MeanderBar />
      </div>

      <div className={pendingClass}><USAMetricsCards electionResult={electionResult} scenarioYear={scenarioYear} isMobile={isMobile} /></div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "300px 1fr 300px", gap: 16, alignItems: "start", width: "100%" }}>
        <USAControlPanel
          candidates={candidates} onPctChange={handlePctChange} onToggleLock={handleToggleLock}
          demSliders={demSliders} setDemSliders={setDemSliders}
          scenarioYear={scenarioYear} onScenarioChange={handleScenarioChange} resetAll={resetAll}
        />
        {mapCenter ? MapColumn : ResultsColumn}
        {mapCenter ? ResultsColumn : MapColumn}
      </div>

      <div className={pendingClass} style={{ marginTop: 16 }}>
        <USAMonteCarloPanel effectiveCandidates={effectiveCandidates} baseCandidates={USA_SCENARIOS[scenarioYear]} scenarioYear={scenarioYear} isMobile={isMobile} />
      </div>

      <div style={{ marginTop: 18 }}>
        <MeanderBar />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, flexDirection: isMobile ? "column" : "row", gap: 5 }}>
          <span style={{ fontSize: 8, color: "var(--text-dim)", ...S.mono, letterSpacing: 1 }}>LOGIT SWING MODEL · {USA.TOTAL_EV} ELECTORAL VOTES · WINNER-TAKE-ALL BY STATE</span>
          <span style={{ fontSize: 8, color: "var(--text-dim)", ...S.mono, letterSpacing: 1, textAlign: "right", maxWidth: "60%" }}>
            CERTIFIED COUNTY RETURNS + STATEWIDE TOTALS 2024/2020 · US-ATLAS TOPOJSON GEOGRAPHY
          </span>
        </div>
      </div>

      <footer style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--divider)", display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ fontSize: 9, color: "var(--text-dim)", fontFamily: "var(--ff-body)", letterSpacing: 0.4, lineHeight: 1.6, textAlign: isMobile ? "center" : "left" }}>
          PsephosCast · a non-commercial academic project by Konstantinos Davakos
        </div>
        <button className="icon-btn" onClick={() => setShowPrivacy(true)} style={S.ghostBtn}>Privacy Policy</button>
        <button className="icon-btn" onClick={() => setShowCookies(true)} style={S.ghostBtn}>Cookies Policy</button>
      </footer>

      {showMethodology && <USAMethodologyModal onClose={() => setShowMethodology(false)} />}
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
      {showCookies && <CookiesModal onClose={() => setShowCookies(false)} />}

      {showHowToUse && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? 12 : 24, backdropFilter: "blur(4px)" }}>
          <div style={{ padding: 24, width: "100%", maxWidth: 520, background: "var(--bg-base, var(--bg-up))", borderRadius: 12, border: "1px solid var(--border)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontFamily: "var(--ff-head)", fontSize: 20, color: "var(--text-title)", letterSpacing: 0.5 }}>How to Use the Swingometer</h3>
              <button className="icon-btn" onClick={() => setShowHowToUse(false)} style={{ ...S.ghostBtn, border: "none" }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, fontSize: 13, lineHeight: 1.5, color: "var(--text-main)", fontFamily: "var(--ff-body)" }}>
              {HOWTO.map((h, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: 12, background: "var(--bg-mid)", borderRadius: 8, border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 20, lineHeight: 1 }}>{h.icon}</div>
                  <div><strong style={{ color: "var(--text-title)", display: "block", marginBottom: 2 }}>{h.title}</strong> {h.text}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setShowHowToUse(false)} style={{ background: "#2563EB", color: "#fff", border: "none", borderRadius: 6, padding: "8px 24px", cursor: "pointer", fontFamily: "var(--ff-body)", fontWeight: 600 }}>Let's Go!</button>
            </div>
          </div>
        </div>
      )}

      {showExportPreview && exportImageUrl && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.75)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: isMobile ? 12 : 24, backdropFilter: "blur(4px)" }}>
          <div style={{ padding: 20, width: "100%", maxWidth: 1000, maxHeight: "95vh", display: "flex", flexDirection: "column", gap: 16, background: "var(--bg-base, var(--bg-up))", borderRadius: 12, border: "1px solid var(--border)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontFamily: "var(--ff-head)", fontSize: 20, color: "var(--text-title)" }}>Export Preview</h3>
              <button className="icon-btn" onClick={() => setShowExportPreview(false)} style={S.ghostBtn}>✕ Close</button>
            </div>
            <div style={{ flex: 1, overflow: "hidden", border: "1px solid var(--border)", borderRadius: 8, background: "var(--bg-up)", display: "flex", justifyContent: "center", alignItems: "center", minHeight: 0 }}>
              <img src={exportImageUrl} alt="Export Preview" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 8 }} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 4 }}>
              <button className="icon-btn" onClick={() => setShowExportPreview(false)} style={{ ...S.ghostBtn, padding: "8px 16px" }}>Cancel</button>
              <button className="icon-btn" onClick={handleDownloadExport} style={{ background: "#2563EB", color: "#fff", border: "none", borderRadius: 6, padding: "8px 16px", cursor: "pointer", fontFamily: "var(--ff-body)", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}><IconCamera size={14} /> Download Image</button>
            </div>
          </div>
        </div>
      )}

      <div id="usa-export-container" style={{ position: "fixed", top: -9999, left: -9999, width: 1200, height: 800, background: "var(--bg-up)", display: "none", padding: 24, gap: 24, boxSizing: "border-box", zIndex: -100 }}>
        <div style={{ flex: 1.5, height: "100%", display: "flex", flexDirection: "column" }}>
          <USAMap electionResult={electionResult} scenarioYear={scenarioYear} hideControls={true} />
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
          <USAElectoralBar electionResult={electionResult} scenarioYear={scenarioYear} />
          <USAResultsTable electionResult={electionResult} scenarioYear={scenarioYear} />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { 100% { transform: rotate(360deg); } }` }} />
    </div>
  );
}
