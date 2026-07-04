import { useState, useMemo, useEffect, useCallback, useTransition } from "react";
import { useNavigate } from "react-router-dom";

import {
  CY, CY_SCENARIOS, CY_SCENARIO_LABELS, CY_SCENARIO_TURNOUT,
  CY_TURNOUT_IS_ESTIMATE, CY_RAW_DISTRICTS, DEM_RESET, CY_DISTRICT_BASELINES
} from "./cyprus-data.js";
import { cyAllocateAllSeats, cyApplySwing } from "./cyprus-engine.js";
import { STYLES, S, MeanderBar, IconArrowLeft, IconCamera, IconPalette } from "./cyprus-ui.jsx";
import {
  CyMetricsCards, CyControlPanel, CyHemicycle,
  CyResultsTable, CyDistrictMap, CyCoalitionBuilder,
} from "./cyprus-components.jsx";
import { resolveTheme, applyPartyPalette, DEFAULT_PALETTE } from "./CyprusThemes.js";
import CyprusThemePicker from "./CyprusThemePicker.jsx";
import CyprusMethodologyModal from "./CyprusMethodologyModal.jsx";
import PrivacyModal from "../PrivacyModal";
import CyMonteCarloPanel from "./CyprusMonteCarloPanel.jsx";

export default function CyprusApp({ isMobile, theme = "dark", setTheme }) {
  const navigate = useNavigate();
  const [scenarioId, setScenarioId] = useState("2026");
  const [parties,    setParties]    = useState(CY_SCENARIOS["2026"]);
  const [demSliders, setDemSliders] = useState(DEM_RESET);
  const [threshold,  setThreshold]  = useState(CY.THRESHOLD);
  const [isPending,  startTransition] = useTransition();

  // Self-owned theme + data palette (decoupled, like the Greek model).
  const [cyTheme, setCyTheme]   = useState(() => resolveTheme(theme).id);
  const [cyPalette, setCyPalette] = useState(DEFAULT_PALETTE);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showMethodology, setShowMethodology] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const themeDef = resolveTheme(cyTheme);
  const selectTheme = useCallback((id) => {
    const t = resolveTheme(id);
    setCyTheme(t.id);
    if (typeof setTheme === "function") setTheme(t.base);
  }, [setTheme]);
  const [mapCenter,  setMapCenter]  = useState(true);
  const [showHowToUse, setShowHowToUse] = useState(false);
  const [showExportPreview, setShowExportPreview] = useState(false);
  const [exportImageUrl, setExportImageUrl] = useState(null);
  const [isGeneratingExport, setIsGeneratingExport] = useState(false);

  const turnout    = CY_SCENARIO_TURNOUT[scenarioId]    ?? 0;
  const isEstimate = !!CY_TURNOUT_IS_ESTIMATE[scenarioId];

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themeDef.base);
    const styleEl = document.getElementById("cyprus-styles");
    if (!styleEl) {
      const style = document.createElement("style");
      style.id        = "cyprus-styles";
      style.innerHTML = STYLES;
      document.head.appendChild(style);
    } else {
      styleEl.innerHTML = STYLES;
    }
  }, [themeDef.base]);

  const handleScenarioChange = useCallback(e => {
    const id = e.target.value;
    setScenarioId(id);
    setParties(CY_SCENARIOS[id]);
    setDemSliders(DEM_RESET);
  }, []);

  const handleToggleLock = useCallback(id => {
    setParties(prev => prev.map(p => p.id === id ? { ...p, isLocked: !p.isLocked } : p));
  }, []);

  const handlePctChange = useCallback((id, newPct) => {
    startTransition(() => {
      setParties(prev => {
        const targetIdx = prev.findIndex(p => p.id === id);
        if (targetIdx === -1) return prev;
        
        const targetParty = prev[targetIdx];
        const oldPct = targetParty.userPercentage;
        
        let lockedTotal = 0;
        let unlockedCount = 0;
        prev.forEach((p, i) => {
          if (i !== targetIdx) {
            if (p.isLocked) lockedTotal += p.userPercentage;
            else unlockedCount++;
          }
        });

        if (unlockedCount === 0) return prev;

        const maxAllowed = 100;
        const finalPct = Math.max(0, Math.min(maxAllowed, newPct, 100 - lockedTotal));
        
        if (finalPct === oldPct) return prev;
        
        const oldRem = 100 - oldPct - lockedTotal;
        const newRem = 100 - finalPct - lockedTotal;
        
        return prev.map((p, i) => {
          if (i === targetIdx) return { ...p, userPercentage: finalPct };
          if (p.isLocked) return p;
          
          if (oldRem <= 0.0001) {
            return { ...p, userPercentage: p.userPercentage + (newRem / unlockedCount) };
          } else {
            return { ...p, userPercentage: p.userPercentage * (newRem / oldRem) };
          }
        });
      });
    });
  }, [startTransition]);

  const handlePartyEdit   = useCallback((id, field, value) => setParties(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p)), []);
  const handlePartyMove   = useCallback((index, dir) => setParties(prev => { const arr = [...prev]; if (index + dir < 0 || index + dir >= arr.length) return arr; [arr[index], arr[index + dir]] = [arr[index + dir], arr[index]]; return arr; }), []);
  const handleDeleteParty = useCallback(id => setParties(prev => { const target = prev.find(p => p.id === id); const arr = prev.filter(p => p.id !== id); if (arr.length > 0 && target?.userPercentage > 0) { const add = target.userPercentage / arr.length; return arr.map(p => ({ ...p, userPercentage: p.userPercentage + add })); } return arr; }), []);
  const handleAddParty    = useCallback(() => setParties(prev => [...prev, { id: `cy_custom_${Date.now()}`, name: "NEW", fullName: "New Party", color: "#D97706", ideology: 0, basePercentage: 0, userPercentage: 0, isLocked: false, sensitivities: { youth:0, seniors:0, urban:0, education:0, migration:0, gender:0 } }]), []);
  
  const resetAll = useCallback(() => {
    setParties(CY_SCENARIOS[scenarioId]);
    setDemSliders(DEM_RESET);
    setThreshold(CY.THRESHOLD);
  }, [scenarioId]);

  const handleGeneratePreview = async () => {
    setIsGeneratingExport(true);
    const exportEl = document.getElementById("cy-export-container");
    if (!exportEl) { setIsGeneratingExport(false); return; }
    exportEl.style.display = "flex";
    
    try {
      const html2canvasModule = await import("html2canvas");
      const html2canvas = html2canvasModule.default || html2canvasModule;
      const canvas = await html2canvas(exportEl, {
        backgroundColor: themeDef.base === "dark" ? "#0f172a" : "#f8fafc",
        scale: 2, useCORS: true, logging: false
      });
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
    link.download = `Cyprus_Election_Export_${scenarioId}.png`;
    link.click();
    setShowExportPreview(false);
  };

  const effectiveParties = useMemo(() => {
    let preNormalized = parties.map(p => {
      const s = p.sensitivities || {};
      let youthCoef = s.youth || 0;
      if (p.id === "adk" && demSliders.youth > 5) youthCoef *= 1.2;

      const delta = (demSliders.youth / 10) * youthCoef + (demSliders.seniors / 10) * (s.seniors || 0) + (demSliders.urban / 10) * (s.urban || 0) + (demSliders.education / 10) * (s.education || 0) + (demSliders.migration / 10) * (s.migration || 0) + (demSliders.gender / 10) * (s.gender || 0);
      return { ...p, effectivePct: Math.max(0.3, p.userPercentage + delta) };
    });

    const sum = preNormalized.reduce((acc, p) => acc + p.effectivePct, 0);
    if (sum > 0) preNormalized = preNormalized.map(p => ({ ...p, effectivePct: (p.effectivePct / sum) * 100 }));
    return preNormalized;
  }, [parties, demSliders]);

  // Colour-blind palettes recolour the DATA; visuals read these, the control panel keeps real colours.
  const displayParties = useMemo(() => applyPartyPalette(parties, cyPalette), [parties, cyPalette]);
  const displayEffectiveParties = useMemo(() => applyPartyPalette(effectiveParties, cyPalette), [effectiveParties, cyPalette]);

  const districtResults = useMemo(() => {
    const base = CY_SCENARIOS[scenarioId];
    return CY_RAW_DISTRICTS.map(d => {
      const districtSeats = d.seats[scenarioId] || d.seats["2026"];
      const baseVotes = CY_DISTRICT_BASELINES[scenarioId][d.id];
      const distParams = { ...d, seats: districtSeats, baseVotes };
      return cyApplySwing(distParams, effectiveParties, base);
    });
  }, [effectiveParties, scenarioId]);

  const isBaseline = useMemo(() => {
    const base = CY_SCENARIOS[scenarioId];
    if (!base) return false;
    for (const p of parties) {
      const bp = base.find(x => x.id === p.id);
      if (!bp || Math.abs(p.userPercentage - bp.basePercentage) > 0.01) return false;
    }
    if (demSliders.youth !== 0 || demSliders.seniors !== 0 || demSliders.urban !== 0 || demSliders.education !== 0 || demSliders.migration !== 0 || demSliders.gender !== 0) return false;
    return true;
  }, [parties, scenarioId, demSliders]);

  const electionResult = useMemo(() => cyAllocateAllSeats(effectiveParties, districtResults, threshold, scenarioId, isBaseline, turnout), [effectiveParties, districtResults, threshold, scenarioId, isBaseline, turnout]);
  const pendingClass = isPending ? "results-pending" : "results-ready";

  const ParliamentColumn = (
    <div className={pendingClass} style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
      <CyHemicycle electionResult={electionResult} parties={displayParties}/>
      <CyResultsTable electionResult={electionResult} parties={displayParties} turnout={turnout} isEstimate={isEstimate} threshold={threshold}/>
    </div>
  );

  const MapColumn = (
    <div className={pendingClass} style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
      <CyDistrictMap districtResults={districtResults} parties={displayParties} electionResult={electionResult}/>
      <CyCoalitionBuilder electionResult={electionResult} parties={displayParties}/>
    </div>
  );

  return (
    <div style={{ ...themeDef.vars, padding: isMobile ? "12px" : "16px 24px", width: "100%", minHeight: "100vh", boxSizing: "border-box", overflowX: "hidden", margin: 0, backgroundColor: "var(--bg-up)", color: "var(--text-main)" }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <button className="icon-btn" onClick={() => navigate('/')} style={{ ...S.ghostBtn, padding: "6px 10px", width: "100%", justifyContent: "flex-start" }}><IconArrowLeft size={12}/> All Countries</button>
              <button className="icon-btn" onClick={() => setMapCenter(prev => !prev)} style={{ ...S.ghostBtn, padding: "6px 10px", width: "100%", justifyContent: "flex-start" }}>
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg> Layout
              </button>
              <button className="icon-btn" onClick={() => setShowHowToUse(true)} style={{ ...S.ghostBtn, padding: "6px 10px", width: "100%", justifyContent: "flex-start" }}>
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> How to Use
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 28 }}>🇨🇾</span>
              <div>
                <div style={{ fontSize: isMobile ? 18 : 24, fontWeight: 900, fontFamily: "var(--ff-head)", letterSpacing: 2, color: "var(--text-title)", lineHeight: 1 }}>CYPRUS SWINGOMETER</div>
                <div style={{ fontSize: 9, color: "var(--text-dim)", fontFamily: "var(--ff-body)", letterSpacing: 3, marginTop: 3, textTransform: "uppercase" }}>House of Representatives · 56 Seats · {threshold}% Threshold</div>
              </div>
            </div>
          </div>

          {/* Country switcher bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexGrow: 1, padding: "0 10px" }}>
            <button 
              onClick={() => navigate('/greece')}
              style={{
                background: "var(--bg-mid)",
                border: "1px solid var(--border)",
                borderRadius: "24px",
                padding: "8px 20px",
                color: "var(--text-title)",
                fontFamily: "var(--ff-body)",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: "all 0.2s",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = "#2563EB"; e.currentTarget.style.color = "#2563EB"; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-title)"; }}
            >
              <span>🇬🇷</span>
              Greece Electoral Swingometer
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, justifyContent: "flex-end", marginBottom: 5 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: isPending ? "#F59E0B" : "#22C55E", boxShadow: isPending ? "0 0 6px #F59E0B" : "0 0 6px #22C55E", animation: "pulse 2s infinite" }}/>
              <span style={{ fontSize: 8, color: "var(--text-dim)", ...S.mono, letterSpacing: 1 }}>{isPending ? "COMPUTING…" : `LIVE — ${CY_SCENARIO_LABELS[scenarioId]}`}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
              <button className="icon-btn" onClick={handleGeneratePreview} style={{ ...S.ghostBtn, opacity: isGeneratingExport ? 0.6 : 1, cursor: isGeneratingExport ? "wait" : "pointer" }} disabled={isGeneratingExport}>
                {isGeneratingExport ? <span style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: "50%", border: "2px solid currentColor", borderTopColor: "transparent", animation: "spin 1s linear infinite" }} /> Generating...</span> : <><IconCamera size={10}/> Export</>}
              </button>
              <button className="icon-btn" onClick={() => setShowMethodology(true)} style={S.ghostBtn}>
                <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg> Methodology
              </button>
              <button className="icon-btn" onClick={() => setShowThemePicker(true)} style={S.ghostBtn}>
                <IconPalette size={10}/> Theme
              </button>
            </div>
          </div>
        </div>
        <MeanderBar/>
      </div>

      <div className={pendingClass}><CyMetricsCards electionResult={electionResult} parties={displayParties} isMobile={isMobile} turnout={turnout} isEstimate={isEstimate}/></div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "300px 1fr 300px", gap: 16, alignItems: "start", width: "100%" }}>
        <CyControlPanel
          parties={parties} onPctChange={handlePctChange} onToggleLock={handleToggleLock}
          onPartyEdit={handlePartyEdit} onPartyMove={handlePartyMove}
          onPartyDelete={handleDeleteParty} onPartyAdd={handleAddParty}
          demSliders={demSliders} setDemSliders={setDemSliders}
          scenarioId={scenarioId} onScenarioChange={handleScenarioChange}
          resetAll={resetAll} threshold={threshold} setThreshold={setThreshold}
        />
        {mapCenter ? MapColumn : ParliamentColumn}
        {mapCenter ? ParliamentColumn : MapColumn}
      </div>

      <div className={pendingClass} style={{ marginTop: 16 }}>
        <CyMonteCarloPanel effectiveParties={displayEffectiveParties} parties={displayParties} threshold={threshold} turnout={turnout} isMobile={isMobile} />
      </div>

      <div style={{ marginTop: 18 }}>
        <MeanderBar/>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, flexDirection: isMobile ? "column" : "row", gap: 5 }}>
          <span style={{ fontSize: 8, color: "var(--text-dim)", ...S.mono, letterSpacing: 1 }}>LOGIT SWING MODEL · LEAN COEFF {CY.LEAN_COEFF} · PRIMARY BONUS {CY.PRIMARY_BONUS}×</span>
          <span style={{ fontSize: 8, color: "var(--text-dim)", ...S.mono, letterSpacing: 1, textAlign: "right", maxWidth: "60%" }}>
            6 DISTRICTS · HISTORICAL BASELINES FROM CYSTAT 2021/2016 · 2026 COEFFICIENTS CALIBRATED VIA UCY POST-ELECTORAL POLLING
          </span>
        </div>
      </div>

      <footer style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--divider)", display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ fontSize: 9, color: "var(--text-dim)", fontFamily: "var(--ff-body)", letterSpacing: 0.4, lineHeight: 1.6, textAlign: isMobile ? "center" : "left" }}>
          PsephosCast.gr · a non-commercial academic project by Konstantinos Davakos<br/>
          Department of Economics, University of Ioannina
        </div>
        <button className="icon-btn" onClick={() => setShowPrivacy(true)} style={S.ghostBtn}>Privacy Policy</button>
      </footer>

      {showThemePicker && <CyprusThemePicker current={cyTheme} onSelect={selectTheme} currentPalette={cyPalette} onSelectPalette={setCyPalette} onClose={() => setShowThemePicker(false)} isMobile={isMobile} />}
      {showMethodology && <CyprusMethodologyModal onClose={() => setShowMethodology(false)} />}
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}

      {showHowToUse && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? 12 : 24, backdropFilter: "blur(4px)" }}>
          <div style={{ padding: 24, width: "100%", maxWidth: 500, background: "var(--bg-base, var(--bg-up))", borderRadius: 12, border: "1px solid var(--border)", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" color="var(--text-title)"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                <h3 style={{ margin: 0, fontFamily: "var(--ff-head)", fontSize: 20, color: "var(--text-title)", letterSpacing: 0.5 }}>How to Use the Swingometer</h3>
              </div>
              <button className="icon-btn" onClick={() => setShowHowToUse(false)} style={{ ...S.ghostBtn, border: "none" }}>✕</button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 16, fontSize: 13, lineHeight: 1.5, color: "var(--text-main)", fontFamily: "var(--ff-body)" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: 12, background: "var(--bg-mid)", borderRadius: 8, border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 20, lineHeight: 1 }}>🎚️</div>
                <div><strong style={{ color: "var(--text-title)", display: "block", marginBottom: 2 }}>Adjust the Vote</strong> Use the sliders on the left to change a party's national percentage. All 56 seats update instantly across the 6 districts based on historical performance baselines.</div>
              </div>
              
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: 12, background: "var(--bg-mid)", borderRadius: 8, border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 20, lineHeight: 1 }}>🔒</div>
                <div><strong style={{ color: "var(--text-title)", display: "block", marginBottom: 2 }}>Lock Parties</strong> Click the padlock icon next to a party to freeze its score. This prevents it from automatically shifting when you move other sliders.</div>
              </div>
              
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: 12, background: "var(--bg-mid)", borderRadius: 8, border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 20, lineHeight: 1 }}>🗺️</div>
                <div><strong style={{ color: "var(--text-title)", display: "block", marginBottom: 2 }}>Explore the Map</strong> Hover over the map to see seat allocations per district. Use the map's dropdown to view background demographics like "Tertiary Edu".</div>
              </div>
            </div>
            
            <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setShowHowToUse(false)} style={{ background: "#2563EB", color: "#fff", border: "none", borderRadius: 6, padding: "8px 24px", cursor: "pointer", fontFamily: "var(--ff-body)", fontWeight: 600 }}>Let's Go!</button>
            </div>
          </div>
        </div>
      )}

      {showExportPreview && exportImageUrl && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.75)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: isMobile ? 12 : 24, backdropFilter: "blur(4px)" }}>
          <div style={{ padding: 20, width: "100%", maxWidth: 1000, maxHeight: "95vh", display: "flex", flexDirection: "column", gap: 16, background: "var(--bg-base, var(--bg-up))", borderRadius: 12, border: "1px solid var(--border)", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <IconCamera size={20} color="var(--text-title)" />
                <h3 style={{ margin: 0, fontFamily: "var(--ff-head)", fontSize: 20, color: "var(--text-title)", letterSpacing: 0.5 }}>Export Preview</h3>
              </div>
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

      {/* Hidden Export Container */}
      <div id="cy-export-container" style={{ position: "fixed", top: -9999, left: -9999, width: 1200, height: 800, background: "var(--bg-up)", display: "none", padding: 24, gap: 24, boxSizing: "border-box", zIndex: -100 }}>
        <div style={{ flex: 1.5, height: "100%", display: "flex", flexDirection: "column" }}>
          <CyDistrictMap districtResults={districtResults} parties={displayParties} electionResult={electionResult} hideControls={true} />
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
          {electionResult?.results?.length > 0 && <CyHemicycle electionResult={electionResult} parties={displayParties} />}
          <CyResultsTable electionResult={electionResult} parties={displayParties} turnout={turnout} isEstimate={isEstimate} threshold={threshold} />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `@keyframes spin { 100% { transform: rotate(360deg); } }`}} />
    </div>
  );
}
