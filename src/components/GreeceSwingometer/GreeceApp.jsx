import { useState, useMemo, useEffect, useCallback, useTransition } from "react";
import { useNavigate } from "react-router-dom";
import { GlobalStyles, S, MeanderBar } from "./GreeceStyles";
import {
  IconArrowLeft, IconCamera, IconPalette, IconBuilding, IconFlagGR, IconFlagCY,
  IconClose, IconCalendar, IconSliders, IconLock, IconPencil, IconScale,
  IconRefresh, IconPeople, IconMap, IconEye, IconLineChart, IconBarChart,
  IconDice, IconHandshake, IconNewspaper, IconContrast, IconRuler
} from "./GreeceIcons";
import ThemePicker from "./ThemePicker";
import { resolveTheme, applyPartyPalette, DEFAULT_PALETTE } from "./GreeceThemes.js";

import { 
  GR_SCENARIOS, GR_SCENARIO_LABELS, GR_SCENARIO_TURNOUT, 
  GR_TURNOUT_IS_ESTIMATE, GR_RAW_DISTRICTS 
} from "./greece-data.js";
import { 
  grDistrictBaseVotes, grApplySwing, grRunElection, grAllocateAllDistrictSeats, grDistrictElectorate 
} from "./greece-engine.js";
import { grComputeFeatureSeatData, grAverageRecentPolls, grScenarioFromPollAverage } from "./greece-utils.js";
import usePolls from "./usePolls.js";

import ControlPanel from "./ControlPanel";
import Hemicycle, { GrCoalitionBuilder } from "./Hemicycle";
import ResultsTable, { GrMetricsCards } from "./ResultsTable";
import Map from "./Map"; 
import OpinionPolls from "./OpinionPolls";
import MethodologyModal from "./MethodologyModal";
import PrivacyModal from "../PrivacyModal";
import MonteCarloPanel from "./MonteCarloPanel";
import GreeceExportModal from "./GreeceExport.jsx";

// Import BOTH GeoJSONs
import greeceGeoJson from "./greece-prefectures.json";
import atticaGeoJson from "./attica-prefectures.json";

const HOWTO = [
  { s: "Getting started" },
  { Icon: IconCalendar, title: "Pick a scenario", text: "Top-left dropdown. Start from a real election \u2014 July 2019, the actual June 2023 result, or the May 2026 polling average. Every number begins from that election\u2019s real data." },
  { Icon: IconSliders, title: "Change the vote", text: "On the Parties tab, drag any party\u2019s slider to set its national %. The engine instantly recomputes all 300 seats and 59 districts, and the other parties rebalance so the total stays 100%." },
  { Icon: IconLock, title: "Lock a party", text: "Click the padlock next to a party to freeze its score so it won\u2019t move when you drag the others \u2014 for asking \u201Cwhat if only this one changes?\u201D" },
  { Icon: IconPencil, title: "Edit parties", text: "Rename a party, change its colour, reorder the list, or remove one \u2014 handy for testing hypothetical or brand-new parties." },
  { Icon: IconScale, title: "Electoral threshold", text: "The bar a party must clear nationally to win any seats (really 3%). Slide it to see how the result changes if the cut-off were higher or lower." },
  { Icon: IconRefresh, title: "Reset", text: "\u201CReset to Baseline\u201D puts every party back to the scenario\u2019s real numbers." },

  { s: "Demographic swings" },
  { Icon: IconPeople, title: "Swing voter groups, not parties", text: "The Demographics tab moves whole voter blocs instead of single parties: Youth & Senior turnout, Urban/Rural skew, Education, Economic Precarity, and Gender. Pushing one shifts every party at once based on who its voters are \u2014 e.g. a youth surge helps youth-leaning parties across all 59 districts simultaneously." },

  { s: "The map" },
  { Icon: IconMap, title: "Hover any district", text: "See who wins its seats, the local vote shares, and the fight for the final seat." },
  { Icon: IconPalette, title: "Map views", text: "The dropdown above the map changes what the colours mean: Swingometer (who leads), Margin of Victory, and Runner-Up \u2014 plus data layers like Age 65+, Tertiary Education, Unemployment, Foreign Citizens, Urbanisation, Primary Economy, and Population (2021)." },
  { Icon: IconEye, title: "Map controls", text: "Toggle the seat dots and district names on or off, and reset the zoom, with the buttons on the map." },

  { s: "Reading the result" },
  { Icon: IconBuilding, title: "Hemicycle", text: "The parliament itself \u2014 each dot is one of the 300 seats, coloured by party, with a marker at the 151-seat majority line." },
  { Icon: IconBarChart, title: "Results table", text: "Every party\u2019s vote %, total seats, and how those split between constituency seats (won in districts) and the 15 nationwide \u201CState\u201D seats." },
  { Icon: IconLineChart, title: "Metric cards", text: "The headlines at a glance: the winner, whether anyone has a majority, the winner\u2019s bonus seats, and turnout." },

  { s: "Forecasting tools" },
  { Icon: IconDice, title: "Monte Carlo forecast", text: "Runs thousands of simulated elections around your numbers, adding realistic polling error, to show each party\u2019s likely seat range and its chance of finishing first \u2014 because one fixed prediction hides how uncertain a real forecast is." },
  { Icon: IconHandshake, title: "Coalition builder", text: "Tick a set of parties to instantly check whether their combined seats reach the 151 needed to govern." },
  { Icon: IconNewspaper, title: "Opinion polls", text: "The recent published polls the May 2026 baseline is built from." },

  { s: "Share & settings" },
  { Icon: IconCamera, title: "Export an image", text: "The camera button opens a composer \u2014 a 2\u00D72 grid where you drop in any panels you want (the map, the Athens zoom, the parliament makeup, either Monte Carlo forecast view, or a date-ranged poll chart), resize each one, and save the result as one shareable image." },
  { Icon: IconContrast, title: "Theme & colours", text: "The Theme button opens an appearance picker \u2014 dark, a soft daylight mode, high contrast, and a colour-blind-safe palette that recolours the map, parliament and tables." },
  { Icon: IconRuler, title: "Methodology", text: "Opens the full step-by-step breakdown of how votes become seats under Greek law \u2014 the exact algorithm behind every number." },
];

export default function GreeceApp({ isMobile, theme, setTheme }) {
  const navigate = useNavigate();

  // Read memory if coming from Correlations, otherwise load defaults
  const [scenarioId, setScenarioId] = useState(() => {
    const saved = typeof window !== 'undefined' ? sessionStorage.getItem('gr_state_scenarioId') : null;
    return saved ? JSON.parse(saved) : "2026";
  });
  const [parties, setParties] = useState(() => {
    const saved = typeof window !== 'undefined' ? sessionStorage.getItem('gr_state_parties') : null;
    return saved ? JSON.parse(saved) : GR_SCENARIOS["2026"];
  });
  const [demSliders, setDemSliders] = useState(() => {
    const saved = typeof window !== 'undefined' ? sessionStorage.getItem('gr_state_demSliders') : null;
    return saved ? JSON.parse(saved) : { youth: 0, seniors: 0, urban: 0, education: 0, precarity: 0, gender: 0 };
  });
  const [threshold, setThreshold] = useState(() => {
    const saved = typeof window !== 'undefined' ? sessionStorage.getItem('gr_state_threshold') : null;
    return saved ? JSON.parse(saved) : 3.0;
  });
  const [turnoutShift, setTurnoutShift] = useState(() => {
    const saved = typeof window !== 'undefined' ? sessionStorage.getItem('gr_state_turnoutShift') : null;
    return saved ? JSON.parse(saved) : 0;
  });

  // Silently save everything to memory as you tweak the app
  useEffect(() => {
    sessionStorage.setItem('gr_state_scenarioId', JSON.stringify(scenarioId));
    sessionStorage.setItem('gr_state_parties', JSON.stringify(parties));
    sessionStorage.setItem('gr_state_demSliders', JSON.stringify(demSliders));
    sessionStorage.setItem('gr_state_threshold', JSON.stringify(threshold));
    sessionStorage.setItem('gr_state_turnoutShift', JSON.stringify(turnoutShift));
  }, [scenarioId, parties, demSliders, threshold, turnoutShift]);

  const [isPending, startTransition] = useTransition();

  // Self-owned theme (dark / soft light / high-contrast / colour-blind).
  const [grTheme, setGrTheme] = useState(() => resolveTheme(theme).id);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const themeDef = resolveTheme(grTheme);
  const selectTheme = useCallback((id) => {
    const t = resolveTheme(id);
    setGrTheme(t.id);
    if (typeof setTheme === "function") setTheme(t.base); // keep the page shell’s light/dark in step
  }, [setTheme]);

  // Data palette (party colours) — independent of the chrome theme above.
  const [grPalette, setGrPalette] = useState(DEFAULT_PALETTE);

  const { polls, loading: pollsLoading, error: pollsError, source: pollsSource, reload: reloadPolls } = usePolls();

  const liveScenario2026 = useMemo(() => {
    const avg = grAverageRecentPolls(polls);
    if (!avg) return null;
    if (avg.ELAS == null && avg.ELPIDA == null) return null; 
    return grScenarioFromPollAverage(avg);
  }, [polls]);

  const scenarioBase = useCallback(
    (id) => (id === "2026" && liveScenario2026 ? liveScenario2026 : GR_SCENARIOS[id]),
    [liveScenario2026]
  );

  useEffect(() => {
    if (liveScenario2026 && scenarioId === "2026" && parties === GR_SCENARIOS["2026"]) {
      setParties(liveScenario2026);
    }
  }, [liveScenario2026, scenarioId, parties]);
  
  const geoFeatures = greeceGeoJson;
  const atticaGeoFeatures = atticaGeoJson;
  
  const [showMethodology, setShowMethodology] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showHowToUse, setShowHowToUse] = useState(false);
  const [showDots, setShowDots] = useState(true);
  const [showLabels, setShowLabels] = useState(true); 
  const [mapCenter, setMapCenter] = useState(true); 

  const [showExport, setShowExport] = useState(false);

  const turnout = GR_SCENARIO_TURNOUT[scenarioId] ?? 0;
  const isEstimate = !!GR_TURNOUT_IS_ESTIMATE[scenarioId];
  const pendingClass = isPending ? "results-pending" : "results-ready";

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
  }, []);

  const handleScenarioChange = useCallback(e => {
    const id = e.target.value;
    setScenarioId(id);
    setParties(scenarioBase(id));
    setDemSliders({ youth: 0, seniors: 0, urban: 0, education: 0, precarity: 0, gender: 0 });
  }, [scenarioBase]);

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
        
        const isOther = targetParty.id.toLowerCase().includes("other") || targetParty.name.toLowerCase().includes("other");
        
        let lockedTotal = 0;
        let unlockedCount = 0;
        prev.forEach((p, i) => {
          if (i !== targetIdx) {
            if (p.isLocked) lockedTotal += p.userPercentage;
            else unlockedCount++;
          }
        });

        if (unlockedCount === 0) return prev;

        const maxAllowed = isOther ? 88 : 100;
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

  const handlePartyEdit = useCallback((id, field, value) => { setParties(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p)); }, []);
  const handlePartyMove = useCallback((index, dir) => { setParties(prev => { if (index + dir < 0 || index + dir >= prev.length) return prev; const arr = [...prev]; [arr[index], arr[index + dir]] = [arr[index + dir], arr[index]]; return arr; }); }, []);
  const handleDeleteParty = useCallback(id => { setParties(prev => { let target = null; const arr = prev.filter(p => { if (p.id === id) { target = p; return false; } return true; }); if (arr.length > 0 && target?.userPercentage > 0) { const add = target.userPercentage / arr.length; return arr.map(p => ({ ...p, userPercentage: p.userPercentage + add })); } return arr; }); }, []);
  const resetAll = useCallback(() => { setParties(scenarioBase(scenarioId)); setDemSliders({ youth: 0, seniors: 0, urban: 0, education: 0, precarity: 0, gender: 0 }); setThreshold(3.0); setTurnoutShift(0); }, [scenarioId, scenarioBase]);

  const handleApplyPollToProjection = useCallback((avg) => {
    if (!avg) return;
    try {
      const scenario = grScenarioFromPollAverage(avg);
      if (scenario && scenario.length) {
        setScenarioId("2026");
        setParties(scenario);
        setDemSliders({ youth: 0, seniors: 0, urban: 0, education: 0, precarity: 0, gender: 0 });
        if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (e) {
      console.error("Failed to apply poll to projection:", e);
    }
  }, []);

  const effectiveParties = useMemo(() => {
    return parties.map(p => {
      const s = p.sensitivities || {};
      return { ...p, effectivePct: Math.max(0, p.userPercentage + (demSliders.youth / 10) * (s.youth || 0) + (demSliders.seniors / 10) * (s.seniors || 0) + (demSliders.urban / 10) * (s.urban || 0) + (demSliders.education / 10) * (s.education || 0) + (demSliders.precarity / 10) * (s.precarity || 0) + (demSliders.gender / 10) * (s.gender || 0)) };
    });
  }, [parties, demSliders]);

  const displayParties = useMemo(() => applyPartyPalette(parties, grPalette), [parties, grPalette]);
  const displayEffectiveParties = useMemo(() => applyPartyPalette(effectiveParties, grPalette), [effectiveParties, grPalette]);

  const baseDistrictData = useMemo(() => GR_RAW_DISTRICTS.map(d => ({ ...d, baseVotes: grDistrictBaseVotes(scenarioBase(scenarioId), d, scenarioId) })), [scenarioId, scenarioBase]);
  
  const { districtResults, electionResult } = useMemo(() => {
    const dResults = baseDistrictData.map(d => grApplySwing(d, effectiveParties, scenarioBase(scenarioId), demSliders));
    const eResult = grRunElection(effectiveParties, threshold, turnout, scenarioId);
    const elect = grDistrictElectorate(scenarioId, turnoutShift);
    dResults.forEach(d => { if (elect[d.id] != null) d.electorate = elect[d.id]; });
    grAllocateAllDistrictSeats(dResults, eResult);
    return { districtResults: dResults, electionResult: eResult };
  }, [baseDistrictData, effectiveParties, demSliders, scenarioId, threshold, turnout, turnoutShift, scenarioBase]);

  const featureSeatData = useMemo(() => grComputeFeatureSeatData(geoFeatures, districtResults, displayParties, electionResult), [geoFeatures, districtResults, displayParties, electionResult]);
  const atticaFeatureSeatData = useMemo(() => grComputeFeatureSeatData(atticaGeoFeatures, districtResults, displayParties, electionResult), [atticaGeoFeatures, districtResults, displayParties, electionResult]);

  const ParliamentColumn = (
    <div className={pendingClass} style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
      {electionResult?.results?.length > 0 ? (
        <Hemicycle electionResult={electionResult} parties={displayParties} />
      ) : (
        <div style={{ ...S.card, padding: 40, textAlign: "center", display: "flex", flexDirection: "column", gap: 10, alignItems: "center", justifyContent: "center", minHeight: 250, color: "var(--text-dim)", fontFamily: "var(--ff-body)" }}>
          <IconBuilding size={36} />
          <span style={{ letterSpacing: 1.5, textTransform: "uppercase", fontSize: 12, fontWeight: 700, color: "var(--text-main)" }}>Parliament Empty</span>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>No parties passed the {threshold}% threshold.</span>
        </div>
      )}
      <ResultsTable electionResult={electionResult} parties={displayParties} turnout={turnout} isEstimate={isEstimate} threshold={threshold} scenarioId={scenarioId} />
    </div>
  );

  const MapColumn = (
    <div className={pendingClass} style={{ display: "flex", flexDirection: "column", minWidth: 0, gap: 12 }}>
      <Map districtResults={districtResults} parties={displayParties} electionResult={electionResult} featureSeatData={featureSeatData} isMobile={isMobile} geoCache={geoFeatures} showDots={showDots} onToggleDots={() => setShowDots(!showDots)} showLabels={showLabels} onToggleLabels={() => setShowLabels(!showLabels)} />
      
      <div style={{ ...S.card, padding: 12, display: "flex", flexDirection: "column", minHeight: 350, position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={S.label}>Athens Metropolitan Area</span>
        </div>
        <div style={{ flexGrow: 1, position: "relative", overflow: "hidden", borderRadius: 6, background: "var(--map-bg)", border: "1px solid var(--border)", display: "flex", alignItems: "stretch", justifyContent: "stretch" }}>
          <Map 
            districtResults={districtResults} parties={displayParties} electionResult={electionResult} 
            featureSeatData={atticaFeatureSeatData} isMobile={isMobile} geoCache={atticaGeoFeatures} 
            showDots={showDots} showLabels={showLabels} isInset={true}
          />
        </div>
      </div>

      <GrCoalitionBuilder electionResult={electionResult} parties={displayParties}/>
    </div>
  );

  return (
    <div style={{ ...themeDef.vars, boxSizing: "border-box", padding: isMobile ? "10px" : "16px 24px", width: "100%", maxWidth: "100vw", overflowX: "hidden", minHeight: "100vh", backgroundColor: "var(--bg-base)", color: "var(--text-main)" }}>
      <GlobalStyles />
      
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 10 }}>
          
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <button className="icon-btn" onClick={() => navigate('/')} style={{ ...S.ghostBtn, padding: "6px 10px", width: "100%", justifyContent: "flex-start" }}>
                <IconArrowLeft size={12}/> All Countries
              </button>
              <button className="icon-btn" onClick={() => setMapCenter(prev => !prev)} style={{ ...S.ghostBtn, padding: "6px 10px", width: "100%", justifyContent: "flex-start" }}>
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <line x1="9" y1="3" x2="9" y2="21"/>
                </svg>
                Layout
              </button>
              <button className="icon-btn" onClick={() => setShowHowToUse(true)} style={{ ...S.ghostBtn, padding: "6px 10px", width: "100%", justifyContent: "flex-start" }}>
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                How to Use
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <IconFlagGR size={30} />
              <div>
                <div style={{ fontSize: isMobile ? 18 : 24, fontWeight: 900, fontFamily: "var(--ff-head)", letterSpacing: 2, color: "var(--text-title)", lineHeight: 1, wordBreak: "break-word" }}>GREECE SWINGOMETER</div>
                <div style={{ fontSize: 9, color: "var(--text-dim)", fontFamily: "var(--ff-body)", letterSpacing: 3, marginTop: 3, textTransform: "uppercase" }}>Hellenic Parliament · 300 Seats · Proportional</div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexGrow: 1, padding: "0 10px" }}>
            <button 
              onClick={() => navigate('/cyprus')}
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
              <IconFlagCY size={20} />
              Cyprus Electoral Swingometer
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
              <button className="icon-btn" onClick={() => setShowMethodology(true)} style={S.ghostBtn}>
                <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg> Methodology
              </button>

              <button 
                className="icon-btn" 
                onClick={() => setShowExport(true)} 
                style={S.ghostBtn}
              >
                <IconCamera size={10}/> Export
              </button>

              <button className="icon-btn" onClick={() => setShowThemePicker(true)} style={S.ghostBtn}>
                <IconPalette size={10}/> Theme
              </button>
            </div>
          </div>
        </div>
        <MeanderBar />
      </div>

      <div className={pendingClass}>
        <GrMetricsCards electionResult={electionResult} parties={displayParties} isMobile={isMobile} turnout={turnout} isEstimate={isEstimate} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "minmax(0, 1fr)" : "300px minmax(0, 1fr) 300px", gap: 16, width: "100%", maxWidth: "100%" }}>
        <ControlPanel 
          parties={parties} 
          demSliders={demSliders} 
          scenarioId={scenarioId} 
          threshold={threshold} 
          onPctChange={handlePctChange} 
          onToggleLock={handleToggleLock} 
          setDemSliders={setDemSliders} 
          onScenarioChange={handleScenarioChange} 
          setThreshold={setThreshold} 
          turnoutShift={turnoutShift} 
          setTurnoutShift={setTurnoutShift} 
          resetAll={resetAll} 
          onPartyEdit={handlePartyEdit} 
          onPartyMove={handlePartyMove} 
          onPartyDelete={handleDeleteParty} 
        />
        
        {mapCenter ? MapColumn : ParliamentColumn}
        {mapCenter ? ParliamentColumn : MapColumn}
      </div>

      <div className={pendingClass} style={{ marginTop: 16 }}>
        <MonteCarloPanel effectiveParties={displayEffectiveParties} parties={displayParties} threshold={threshold} turnout={turnout} isMobile={isMobile} />
      </div>

      <div style={{ marginTop: 16 }}><OpinionPolls polls={polls} loading={pollsLoading} error={pollsError} source={pollsSource} reload={reloadPolls} onApplyPoll={handleApplyPollToProjection} /></div>
      <div style={{ marginTop: 18 }}><MeanderBar/></div>

      <footer style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--divider)", display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ fontSize: 9, color: "var(--text-dim)", fontFamily: "var(--ff-body)", letterSpacing: 0.4, lineHeight: 1.6, textAlign: isMobile ? "center" : "left" }}>
          Psephos Swingometer · a non-commercial academic project by Konstantinos Davakos<br/>
          Department of Economics, University of Ioannina
        </div>
        <button className="icon-btn" onClick={() => setShowPrivacy(true)} style={S.ghostBtn}>Privacy Policy</button>
      </footer>

      {showMethodology && <MethodologyModal onClose={() => setShowMethodology(false)} />}
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}

      {showHowToUse && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? 12 : 24, backdropFilter: "blur(4px)" }}>
          <div style={{ padding: 24, width: "100%", maxWidth: 640, background: "var(--bg-base)", borderRadius: 12, border: "1px solid var(--border)", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" color="var(--text-title)"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                <h3 style={{ margin: 0, fontFamily: "var(--ff-head)", fontSize: 20, color: "var(--text-title)", letterSpacing: 0.5 }}>How to Use the Swingometer</h3>
              </div>
              <button className="icon-btn" onClick={() => setShowHowToUse(false)} style={{ ...S.ghostBtn, border: "none" }}><IconClose size={16} /></button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13, lineHeight: 1.5, color: "var(--text-main)", fontFamily: "var(--ff-body)", maxHeight: "62vh", overflowY: "auto", paddingRight: 6 }}>
              {HOWTO.map((it, i) => it.s ? (
                <div key={i} style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--text-dim)", marginTop: i === 0 ? 0 : 10, marginBottom: 0 }}>{it.s}</div>
              ) : (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: 12, background: "var(--bg-mid)", borderRadius: 8, border: "1px solid var(--border)" }}>
                <div style={{ width: 24, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-title)" }}>{it.Icon ? <it.Icon size={18} /> : null}</div>
                  <div><strong style={{ color: "var(--text-title)", display: "block", marginBottom: 2 }}>{it.title}</strong> {it.text}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
              <button 
                onClick={() => setShowHowToUse(false)} 
                style={{ background: "#2563EB", color: "#fff", border: "none", borderRadius: 6, padding: "8px 24px", cursor: "pointer", fontFamily: "var(--ff-body)", fontWeight: 600 }}
              >
                Let's Go!
              </button>
            </div>
          </div>
        </div>
      )}

      {showThemePicker && (
        <ThemePicker current={grTheme} onSelect={selectTheme} currentPalette={grPalette} onSelectPalette={setGrPalette} onClose={() => setShowThemePicker(false)} isMobile={isMobile} />
      )}

    <GreeceExportModal
        open={showExport}
        onClose={() => setShowExport(false)}
        isMobile={isMobile}
        theme={themeDef.base}
        ctx={{
          districtResults, parties: displayParties, electionResult, featureSeatData, geoFeatures,
          atticaFeatureSeatData, atticaGeoFeatures,
          effectiveParties: displayEffectiveParties, threshold, turnout, scenarioId,
          showDots, showLabels, polls,
        }}
      />

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}
