// AustraliaApp.jsx
import {
  useState, useMemo, useCallback, useTransition, useEffect, useRef, memo
} from "react";
import { STYLES, S, MeanderBar, IconSun, IconMoon, IconX, EASE_STD } from "./aus-ui.jsx";
import { AUS, AUS_PARTIES, AUS_SCENARIOS, AUS_DIVISIONS } from "./aus-data.js";
import {
  ausComputeNational2PP, ausProjectSeats, ausSeatCounts,
  ausStateBreakdown, ausMarginalSeats, ausPartyColor, ausPartyLabel, ausFmt2PP
} from "./aus-engine.js";
import {
  AusHemicycle, AusMetricsCards, AusResultsTable,
  AusStateBreakdown, AusSlidersPanel, AusSeatsOnLine,
} from "./aus-components.jsx";
import { AusMap } from "./aus-map.jsx";
import { MY_SVG_MAP } from "./map-code.js";
import { AusDemographicsPanel } from "./aus-demographics-panel.jsx";
import { AUS_DIVISION_DEMOGRAPHICS } from "./aus-demographics-adapter.js";

// Primary redistribution
function defaultPrefFlows() {
  const flows = {};
  AUS_PARTIES.filter(p => p.id !== "alp" && p.id !== "lnp").forEach(p => {
    flows[p.id] = { toAlp: p.prefToAlp * 100, toLnp: p.prefToLnp * 100 };
  });
  return flows;
}

function redistributePrimaries(prev, changedId, newValue, locked) {
  const PARTIES  = AUS_PARTIES.map(p => p.id);
  const CAP      = Object.fromEntries(AUS_PARTIES.map(p => [p.id, p.maxPrimary ?? 60]));
  const hardLocked  = new Set([...locked].filter(id => id !== changedId));
  const hardTotal   = PARTIES
    .filter(id => hardLocked.has(id) && id !== changedId)
    .reduce((s, id) => s + (prev[id] ?? 0), 0);
  // Clamp changed party to its cap and available headroom
  const clamped = Math.max(0, Math.min(CAP[changedId] ?? 60, Math.min(100 - hardTotal, newValue)));
  const updated = { ...prev, [changedId]: clamped };
  const availableForOthers = Math.max(0, 100 - hardTotal - clamped);
  const floatIds   = PARTIES.filter(id => !hardLocked.has(id) && id !== changedId);
  const floatTotal = floatIds.reduce((s, id) => s + (prev[id] ?? 0), 0);
  if (floatTotal > 0) {
    floatIds.forEach(id => {
      const raw = (prev[id] ?? 0) * (availableForOthers / floatTotal);
      updated[id] = Math.max(0, Math.min(CAP[id] ?? 60, raw));
    });
  }
  return updated;
}

// Urban Insets Component
const InsetPanel = memo(function InsetPanel({ inset, projected, setHovered, setTooltipPos, onDivisionClick }) {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current || !projected?.length) return;
    const byId = {};
    projected.forEach(d => {
      byId[d.id] = d;
      if (d.name) byId[d.name.toLowerCase().replace(/\s+/g, '-')] = d;
    });
    mountRef.current.querySelectorAll('[data-division-id]').forEach(el => {
      const id  = el.getAttribute('data-division-id');
      const div = byId[id];
      if (div) {
        let vectors = [el];
        if (el.tagName.toLowerCase() === "g") {
          const ch = Array.from(el.querySelectorAll("path, polygon, rect, circle"));
          if (ch.length > 0) vectors = ch;
        }
        vectors.forEach(v => {
          v.style.fill        = ausPartyColor(div.winner);
          v.style.fillOpacity = "0.9";
          v.style.stroke      = "var(--border)";
          v.style.strokeWidth = "0.5";
          v.style.cursor      = "pointer";
          v.style.transition  = `fill 0.18s ${EASE_STD}`;
        });
      }
    });
  }, [projected]);

  useEffect(() => {
    if (!mountRef.current || !projected?.length) return;
    const byId = {};
    projected.forEach(d => {
      byId[d.id] = d;
      if (d.name) byId[d.name.toLowerCase().replace(/\s+/g, '-')] = d;
    });

    const highlight = (el, on) => {
      let vectors = [el];
      if (el.tagName.toLowerCase() === "g") {
        const ch = Array.from(el.querySelectorAll("path, polygon, rect, circle"));
        if (ch.length > 0) vectors = ch;
      }
      vectors.forEach(v => {
        v.style.fillOpacity = on ? "1"   : "0.9";
        v.style.stroke      = on ? "var(--map-stroke-hov)" : "var(--border)";
        v.style.strokeWidth = on ? "1.5" : "0.5";
      });
    };

    const handleMouseOver = e => {
      const el = e.target.closest('g[data-division-id]');
      if (el) {
        const id  = el.getAttribute('data-division-id');
        const div = byId[id];
        if (div) {
          highlight(el, true);
          setHovered(div);
          setTooltipPos({ x: e.clientX, y: e.clientY });
        }
      }
    };
    const handleMouseOut = e => {
      const el = e.target.closest('g[data-division-id]');
      if (el) { highlight(el, false); setHovered(null); }
    };
    const handleMouseMove = e => {
      if (e.target.closest('g[data-division-id]')) setTooltipPos({ x: e.clientX, y: e.clientY });
    };
    const handleClick = e => {
      const el = e.target.closest('g[data-division-id]');
      if (el) {
        const id  = el.getAttribute('data-division-id');
        const div = byId[id];
        if (div && onDivisionClick) onDivisionClick(div);
      }
    };

    const node = mountRef.current;
    node.addEventListener('mouseover',  handleMouseOver);
    node.addEventListener('mouseout',   handleMouseOut);
    node.addEventListener('mousemove',  handleMouseMove);
    node.addEventListener('click',      handleClick);
    return () => {
      node.removeEventListener('mouseover',  handleMouseOver);
      node.removeEventListener('mouseout',   handleMouseOut);
      node.removeEventListener('mousemove',  handleMouseMove);
      node.removeEventListener('click',      handleClick);
    };
  }, [projected, setHovered, setTooltipPos, onDivisionClick]);

  return (
    <div style={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ fontSize: 9, fontFamily: 'var(--ff-mono)', letterSpacing: 1, color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
        {inset.label}
      </div>
      <div
        ref={mountRef}
        dangerouslySetInnerHTML={{
          __html: `<svg viewBox="${inset.viewBox}" width="100%" height="100%" style="display:block;">${inset.divisions.join('')}</svg>`
        }}
        style={{ width: inset.panelWidth, height: inset.panelHeight, background: 'var(--map-bg)', border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden' }}
      />
    </div>
  );
});

const AusUrbanInsets = memo(function AusUrbanInsets({ insets, projected, onDivisionClick }) {
  const [hovered,    setHovered]    = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 8px", justifyContent: "center", paddingTop: 4 }}>
        {insets.map(inset => (
          <InsetPanel key={inset.id} inset={inset} projected={projected}
            setHovered={setHovered} setTooltipPos={setTooltipPos} onDivisionClick={onDivisionClick} />
        ))}
      </div>
      {hovered && (
        <div style={{ ...S.tooltip, position: "fixed", left: tooltipPos.x + 14, top: tooltipPos.y - 60, zIndex: 99999, pointerEvents: 'none' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-title)", marginBottom: 3 }}>
            {hovered.name} <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 400, color: "var(--text-muted)" }}>{hovered.state}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: ausPartyColor(hovered.winner) }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: ausPartyColor(hovered.winner) }}>{ausPartyLabel(hovered.winner).toUpperCase()} Lead</span>
          </div>
          <div style={{ fontSize: 10.5, color: "var(--text-dim)", fontFamily: "var(--ff-mono)" }}>Projected 2PP: {ausFmt2PP(hovered.proj2PP)}</div>
          <div style={{ fontSize: 8.5, color: "var(--text-dim)", marginTop: 3, fontFamily: "var(--ff-mono)" }}>Click for demographics →</div>
        </div>
      )}
    </div>
  );
});

// Demographics Modal
const DemographicsModal = memo(function DemographicsModal({ division, projected, onClose }) {
  // Find the live projected data for this division
  const projDiv = projected?.find(d => d.id === division?.id);
  // Find demographics data
  const demogId = division?.id;

  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 10000,
        background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
    >
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border-light)",
        borderRadius: 12, width: "min(780px, 96vw)", maxHeight: "92vh",
        display: "flex", flexDirection: "column",
        boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
        animation: "tooltipIn 0.18s cubic-bezier(0,0,0.2,1)",
      }}>
        {/* Modal header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px", borderBottom: "1px solid var(--border)", flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {projDiv && (
              <div style={{ width: 10, height: 10, borderRadius: 3, background: ausPartyColor(projDiv.winner), flexShrink: 0 }} />
            )}
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-title)", fontFamily: "var(--ff-head)" }}>
              {division?.name} Demographics
            </span>
            <span style={{ fontSize: 9, color: "var(--text-dim)", fontFamily: "var(--ff-mono)", letterSpacing: 1, background: "var(--bg-mid)", padding: "2px 6px", borderRadius: 3, border: "1px solid var(--border)" }}>
              {division?.state}
            </span>
          </div>
          <button
            onClick={onClose}
            className="icon-btn"
            style={{ ...S.ghostBtn, width: 26, height: 26, padding: 0, justifyContent: "center", alignItems: "center" }}
          >
            <IconX size={13} />
          </button>
        </div>

        {/* Projected result banner */}
        {projDiv && (
          <div style={{
            padding: "8px 16px", borderBottom: "1px solid var(--border)", flexShrink: 0,
            background: ausPartyColor(projDiv.winner) + "14",
            display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
          }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: ausPartyColor(projDiv.winner), fontFamily: "var(--ff-mono)", letterSpacing: 1 }}>
              PROJECTED: {ausPartyLabel(projDiv.winner)} WINS
            </span>
            {projDiv.finalTwo && (
              <span style={{ fontSize: 9, color: "var(--text-muted)", fontFamily: "var(--ff-mono)" }}>
                Final 2: {ausPartyLabel(projDiv.finalTwo[0])} {projDiv.proj2PP?.toFixed(1)}% — {ausPartyLabel(projDiv.finalTwo[1])} {(100 - projDiv.proj2PP).toFixed(1)}%
              </span>
            )}
            <span style={{ fontSize: 9, color: "var(--text-muted)", fontFamily: "var(--ff-mono)" }}>
              Margin: {projDiv.flipDistance?.toFixed(1) ?? "—"}pp
            </span>
          </div>
        )}

        {/* Demographics content */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          <AusDemographicsPanel
            divisionId={demogId}
            allDemographics={AUS_DIVISION_DEMOGRAPHICS}
            compact={false}
          />
        </div>
      </div>
    </div>
  );
});

// Tab definitions
const TABS = [
  { id: "results",   label: "Results"   },
  { id: "states",    label: "States"    },
  { id: "marginals", label: "Marginals" },
];

// Root App
export default function AustraliaApp() {
  const [theme,        setTheme]       = useState("dark");
  const [scenarioId,   setScenarioId]  = useState("2025");
  const [primaries,    setPrimaries]   = useState(() => ({ ...AUS_SCENARIOS[0].basePrimaries }));
  const [prefFlows,    setPrefFlows]   = useState(defaultPrefFlows);
  const [locked,       setLocked]      = useState(() => new Set());
  const [activeTab,    setActiveTab]   = useState("results");
  const [isMobile,     setIsMobile]    = useState(false);
  // Demographics modal state
  const [clickedDiv,   setClickedDiv]  = useState(null); // division that was clicked — opens modal

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1150);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const scenario = useMemo(
    () => AUS_SCENARIOS.find(s => s.id === scenarioId) ?? AUS_SCENARIOS[0],
    [scenarioId],
  );

  const handleScenarioChange = useCallback((id) => {
    const sc = AUS_SCENARIOS.find(s => s.id === id);
    if (!sc) return;
    setScenarioId(id);
    setPrimaries({ ...sc.basePrimaries });
    setLocked(new Set());
  }, []);

  const handlePrimaryChange = useCallback((partyId, newValue) => {
    startTransition(() => {
      setPrimaries(prev => redistributePrimaries(prev, partyId, newValue, locked));
    });
  }, [locked]);

  const handleToggleLock = useCallback((partyId) => {
    setLocked(prev => {
      const next = new Set(prev);
      next.has(partyId) ? next.delete(partyId) : next.add(partyId);
      return next;
    });
  }, []);

  const handlePrefChange = useCallback((partyId, newFlow) => {
    startTransition(() => {
      setPrefFlows(prev => ({ ...prev, [partyId]: newFlow }));
    });
  }, []);

  const national2PP = useMemo(
    () => ausComputeNational2PP(primaries, prefFlows),
    [primaries, prefFlows],
  );

  const projected = useMemo(() =>
    ausProjectSeats(
      AUS_DIVISIONS,
      primaries,
      scenario.basePrimaries,
      prefFlows,
    ),
    [primaries, scenario.basePrimaries, prefFlows],
  );

  const counts    = useMemo(() => ausSeatCounts(projected),       [projected]);
  const stateData = useMemo(() => ausStateBreakdown(projected),   [projected]);
  const marginals = useMemo(() => ausMarginalSeats(projected, 20),[projected]);

  const readyClass = isPending ? "results-pending" : "results-ready";

  // Division click handler — opens modal
  const handleDivisionClick = useCallback((div) => {
    setClickedDiv(div);
  }, []);

  return (
    <div style={{ padding: isMobile ? "12px" : "16px 24px", width: "100%", minHeight: "100vh", boxSizing: "border-box", overflowX: "hidden", margin: 0, backgroundColor: "var(--bg-up)", color: "var(--text-main)" }}>
      <style dangerouslySetInnerHTML={{ __html: STYLES }}/>

      {/* Demographics Modal */}
      {clickedDiv && (
        <DemographicsModal
          division={clickedDiv}
          projected={projected}
          onClose={() => setClickedDiv(null)}
        />
      )}

      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 28 }}>🇦🇺</span>
            <div>
              <div style={{ fontSize: isMobile ? 18 : 24, fontWeight: 900, fontFamily: "var(--ff-head)", letterSpacing: 2, color: "var(--text-title)", lineHeight: 1 }}>AUSTRALIA SWINGOMETER</div>
              <div style={{ fontSize: 9, color: "var(--text-dim)", fontFamily: "var(--ff-body)", letterSpacing: 3, marginTop: 3, textTransform: "uppercase" }}>House of Representatives · 150 Seats · 76 For Majority</div>
            </div>
          </div>

          {/* Scenario tabs */}
          <div style={{ display: "flex", gap: 3, background: "var(--bg-mid)", padding: 3, borderRadius: 6, border: "1px solid var(--border)" }}>
            {AUS_SCENARIOS.map(sc => (
              <button key={sc.id} onClick={() => handleScenarioChange(sc.id)}
                className={`icon-btn${scenarioId === sc.id ? " scenario-tab-active" : ""}`}
                style={{ ...S.ghostBtn, fontSize: 10, padding: "6px 14px", border: "none",
                  fontWeight: scenarioId === sc.id ? 700 : 400,
                  color: scenarioId === sc.id ? "var(--text-title)" : "var(--text-muted)",
                  background: scenarioId === sc.id ? "var(--bg-card)" : "transparent" }}>
                {sc.label}
              </button>
            ))}
          </div>

          {/* Status + theme toggle */}
          <div style={{ textAlign: "right" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, justifyContent: "flex-end", marginBottom: 5 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: isPending ? "#F59E0B" : "#22C55E", boxShadow: isPending ? "0 0 6px #F59E0B" : "0 0 6px #22C55E" }}/>
              <span style={{ fontSize: 8, color: "var(--text-dim)", fontFamily: "var(--ff-mono)", letterSpacing: 1 }}>{isPending ? "COMPUTING…" : `LIVE — ${scenario.fullLabel}`}</span>
            </div>
            <button className="icon-btn" onClick={() => setTheme(t => t === "dark" ? "light" : "dark")} style={{ ...S.ghostBtn, padding: "5px 10px" }}>
              {theme === "dark" ? <IconSun size={11}/> : <IconMoon size={11}/>} {theme === "dark" ? "Light" : "Dark"}
            </button>
          </div>
        </div>
        <MeanderBar/>
      </div>

      {/* Metrics Row */}
      <div className={readyClass}>
        <AusMetricsCards counts={counts} national2PP={national2PP} scenario={scenario} base2PP={scenario.base2PP} />
      </div>

      {/* 3-Column Grid */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "280px 1fr 440px", gap: 16, alignItems: "start", width: "100%" }}>

        {/* Left Column: Sliders */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <AusSlidersPanel
            primaries={primaries} lockedParties={locked}
            onPrimaryChange={handlePrimaryChange} onToggleLock={handleToggleLock}
            prefFlows={prefFlows} onPrefChange={handlePrefChange}
            national2PP={national2PP} base2PP={scenario.base2PP} scenario={scenario}
          />
        </div>

        {/* Center Column: Map */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          <div style={{ ...S.card, padding: 0, height: "calc(100vh - 175px)", minHeight: 580, position: "relative", display: "flex", flexDirection: "column" }}>
            <AusMap
              projected={projected}
              svgContent={MY_SVG_MAP.mainSVG}
              onDivisionClick={handleDivisionClick}
            />
          </div>
        </div>

        {/* Right Column: Charts + Data */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>

          {/* Hemicycle */}
          <div style={{ ...S.card, padding: "12px 12px 4px" }} className={readyClass}>
            <AusHemicycle projected={projected} counts={counts} majority={scenario.majority}/>
          </div>

          {/* Urban Insets */}
          {MY_SVG_MAP.insets && MY_SVG_MAP.insets.length > 0 && (
            <div style={{ ...S.card, padding: "12px" }} className={readyClass}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, paddingLeft: 4 }}>
                Urban Centers
              </div>
              <AusUrbanInsets insets={MY_SVG_MAP.insets} projected={projected} onDivisionClick={handleDivisionClick} />
            </div>
          )}

          {/* Data Tabs */}
          <div style={{ display: "flex", gap: 2, borderBottom: "1px solid var(--border)", paddingBottom: 1 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} className="icon-btn"
                style={{ ...S.ghostBtn, fontSize: 10, padding: "6px 14px", borderRadius: 0,
                  borderBottom: activeTab === t.id ? "2px solid var(--text-main)" : "2px solid transparent",
                  borderLeft: "none", borderRight: "none", borderTop: "none",
                  color: activeTab === t.id ? "var(--text-title)" : "var(--text-muted)",
                  fontWeight: activeTab === t.id ? 700 : 400, background: "transparent" }}>
                {t.label}
              </button>
            ))}
          </div>

          <div className={readyClass} style={{ overflowY: "auto", maxHeight: "calc(100vh - 580px)" }}>
            {activeTab === "results"   && <AusResultsTable counts={counts} primaries={primaries} scenario={scenario}/>}
            {activeTab === "states"    && <AusStateBreakdown stateData={stateData}/>}
            {activeTab === "marginals" && <AusSeatsOnLine marginals={marginals}/>}
          </div>
        </div>

      </div>

      {/* Footer */}
      <div style={{ marginTop: 18 }}>
        <MeanderBar/>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8 }}>
          <span style={{ fontSize: 8, color: "var(--text-dim)", fontFamily: "var(--ff-mono)", letterSpacing: 1 }}>LOGIT COEFFICIENT METRICS · SYSTEM STABLE</span>
          <span style={{ fontSize: 8, color: "var(--text-dim)", fontFamily: "var(--ff-mono)", letterSpacing: 1, textAlign: "right" }}>150 ELECTORAL DIVISIONS · CLICK ANY DIVISION FOR DEMOGRAPHICS</span>
        </div>
      </div>
    </div>
  );
}
