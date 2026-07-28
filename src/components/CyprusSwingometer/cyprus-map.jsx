// cyprus-map.jsx
import { useState, useMemo, useEffect, useCallback, useRef, memo } from "react";
import * as d3 from "d3";
import { CY_PATHS, CY_DISTRICT_DEMOGRAPHICS } from "./cyprus-data.js";
import { cyPackCenteredDots } from "./cyprus-engine.js";
import {
  S, EASE_STD, IconPlus, IconMinus, IconZoomReset, IconEye, IconEyeOff, IconChevron,
  IconBallot, IconBarChart, IconMedal, IconUsers, IconGlobe, IconCityscape, IconHome,
} from "./cyprus-ui.jsx";

const MAP_MODE_OPTIONS = [
  { id: "swingometer",         label: "Swingometer",           Icon: IconBallot },
  { id: "margin_of_victory",   label: "Margin of Victory",     Icon: IconBarChart },
  { id: "runner_up",           label: "Runner-Up Party",       Icon: IconMedal },
  { id: "population",          label: "Population (2021)",     Icon: IconUsers },
  { id: "foreign_citizens_pct",label: "Foreign Citizens (%)",  Icon: IconGlobe },
  { id: "urbanization_pct",    label: "Urbanization (%)",      Icon: IconCityscape },
  { id: "avg_household_size",  label: "Avg Household Size",    Icon: IconHome },
];

const LEGEND_LABELS = {
  population:           "Population (2021 Census)",
  foreign_citizens_pct:  "Foreign Citizens",
  urbanization_pct:      "Urbanization",
  avg_household_size:    "Avg Household Size",
};

function fmtDemoVal(viewMode, v) {
  if (v == null || isNaN(v)) return "N/A (No Census Data)";
  if (viewMode === "population") return Math.round(v).toLocaleString();
  if (viewMode === "avg_household_size") return v.toFixed(1);
  return `${v.toFixed(1)}%`;
}

const MapModeMenu = memo(function MapModeMenu({ viewMode, onChange }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDocDown = (e) => { if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDocDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDocDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const current = MAP_MODE_OPTIONS.find(o => o.id === viewMode) || MAP_MODE_OPTIONS[0];
  const CurrentIcon = current.Icon;

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <button
        type="button" className="icon-btn" onClick={() => setOpen(v => !v)}
        style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--bg-mid)", color: "var(--text-main)", border: "1px solid var(--border)", borderRadius: 4, padding: "4px 8px", fontSize: 10, fontFamily: "var(--ff-body)", fontWeight: 600, cursor: "pointer", outline: "none" }}
      >
        <CurrentIcon size={12} />
        <span>{current.label}</span>
        <IconChevron dir={open ? "up" : "down"} size={8} />
      </button>

      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", right: 0, zIndex: 30, background: "var(--bg-mid)", border: "1px solid var(--border)", borderRadius: 6, padding: 4, minWidth: 200, boxShadow: "0 16px 40px rgba(0,0,0,0.45)", display: "flex", flexDirection: "column", gap: 1 }}>
          {MAP_MODE_OPTIONS.map(opt => {
            const Icon = opt.Icon;
            const active = opt.id === viewMode;
            return (
              <button
                key={opt.id} type="button" className="icon-btn"
                onClick={() => { onChange(opt.id); setOpen(false); }}
                style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", background: active ? "var(--tab-active)" : "transparent", color: active ? "#60A5FA" : "var(--text-main)", border: "1px solid transparent", borderRadius: 4, padding: "6px 8px", fontSize: 10, fontFamily: "var(--ff-body)", fontWeight: active ? 700 : 500, cursor: "pointer" }}
              >
                <Icon size={13} />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
});

export const CyDistrictMap = memo(function CyDistrictMap({ districtResults, parties, electionResult, hideControls = false }) {
  const [activeId, setActiveId] = useState(null);
  const [showSeats, setShowSeats] = useState(true);
  const [viewMode, setViewMode] = useState("swingometer");
  const [districtCenters, setDistrictCenters] = useState(null);

  const svgRef = useRef(null);
  const gRef = useRef(null);
  const zoomRef = useRef(null);
  const tooltipRef = useRef(null);

  const qualifyingIds = useMemo(() => new Set((electionResult?.results || []).map(r => r.id)), [electionResult]);

  useEffect(() => {
    const newCenters = {};
    districtResults.forEach(d => {
      const el = document.getElementById(`cy-path-${d.id}`);
      if (el) {
        const bbox = el.getBBox();
        let cx = bbox.x + bbox.width / 2;
        let cy = bbox.y + bbox.height / 2;
        if (d.id === "famagusta") { cx -= 40; cy += 10; }
        if (d.id === "nicosia")   { cx += 15; cy += 15; }
        if (d.id === "limassol")  { cx += 5;  cy -= 5;  }
        if (d.id === "paphos")    { cx += 10; cy += 10; }
        if (d.id === "larnaca")   { cx += 10; cy -= 5;  }
        newCenters[d.id] = { cx, cy };
      }
    });
    setDistrictCenters(newCenters);
  }, []);

  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;
    // Smooth pan/zoom: coalesce the many zoom events into ONE transform-apply per
    // animation frame, GPU-promote the group while interacting, and render paths in
    // fast mode mid-gesture (crisp again on release).
    const g = d3.select(gRef.current);
    let raf = null, latest = null;
    const apply = () => { raf = null; if (latest) g.attr("transform", latest); };
    const zoom = d3.zoom().scaleExtent([0.5, 5])
      .on("start", () => { g.style("will-change", "transform"); g.selectAll("path").attr("shape-rendering", "optimizeSpeed"); })
      .on("zoom", e => { latest = e.transform; if (!raf) raf = requestAnimationFrame(apply); })
      .on("end", () => { if (raf) { cancelAnimationFrame(raf); raf = null; } if (latest) g.attr("transform", latest); g.style("will-change", "auto"); g.selectAll("path").attr("shape-rendering", "geometricPrecision"); });
    d3.select(svgRef.current).call(zoom);
    zoomRef.current = zoom;
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, []);

  const handleZoomIn    = useCallback(() => d3.select(svgRef.current).transition().duration(250).call(zoomRef.current.scaleBy, 1.3), []);
  const handleZoomOut   = useCallback(() => d3.select(svgRef.current).transition().duration(250).call(zoomRef.current.scaleBy, 1 / 1.3), []);
  const handleResetZoom = useCallback(() => d3.select(svgRef.current).transition().duration(250).call(zoomRef.current.transform, d3.zoomIdentity), []);

  const isGradientMode = viewMode !== "swingometer" && viewMode !== "margin_of_victory" && viewMode !== "runner_up";

  const { minVal, maxVal } = useMemo(() => {
    if (!isGradientMode) return { minVal: 0, maxVal: 100 };
    const values = Object.values(CY_DISTRICT_DEMOGRAPHICS).map(d => d[viewMode]).filter(v => typeof v === "number" && !isNaN(v));
    if (values.length === 0) return { minVal: 0, maxVal: 100 };
    return { minVal: Math.min(...values), maxVal: Math.max(...values) };
  }, [viewMode, isGradientMode]);

  const districtData = useMemo(() => districtResults.map(d => {
    const filtered = Object.fromEntries(Object.entries(d.votes).filter(([pid]) => qualifyingIds.has(pid)));
    const seatsMap = electionResult?.districtSeats?.[d.id] || {};
    const sortedByVotes = Object.entries(filtered).sort((a, b) => b[1] - a[1]);
    const leaderId = sortedByVotes.length > 0 ? sortedByVotes[0][0] : null;
    const runnerUpId = sortedByVotes.length > 1 ? sortedByVotes[1][0] : null;
    const margin = sortedByVotes.length > 0 ? (sortedByVotes[0][1] - (sortedByVotes[1]?.[1] ?? 0)) : null;

    let fillColor = "var(--bg-up)";
    if (viewMode === "swingometer") {
      fillColor = parties.find(p => p.id === leaderId)?.color + "BB" || "var(--border)";
    } else if (viewMode === "margin_of_victory") {
      const winner = parties.find(p => p.id === leaderId);
      if (winner && margin != null) {
        const t = Math.min(1, margin / 40);
        const opacityHex = Math.round((0.25 + 0.75 * t) * 255).toString(16).padStart(2, "0");
        fillColor = winner.color + opacityHex;
      } else {
        fillColor = "var(--border)";
      }
    } else if (viewMode === "runner_up") {
      const runner = parties.find(p => p.id === runnerUpId);
      fillColor = runner ? runner.color + "BB" : "var(--border)";
    } else {
      const demoVal = CY_DISTRICT_DEMOGRAPHICS[d.id]?.[viewMode];
      if (typeof demoVal === "number") {
        const pct = maxVal === minVal ? 0.5 : (demoVal - minVal) / (maxVal - minVal);
        const r = Math.round(245 + (153 - 245) * pct);
        const g = Math.round(240 + (27 - 240) * pct);
        const b = Math.round(225 + (27 - 225) * pct);
        fillColor = `rgb(${r}, ${g}, ${b})`;
      } else {
        fillColor = "var(--border)"; // Gray out Kyrenia when missing census data
      }
    }
    return { ...d, filteredVotes: filtered, seatsMap, fillColor, leaderId, runnerUpId, margin };
  }), [districtResults, qualifyingIds, parties, viewMode, minVal, maxVal, electionResult.districtSeats]);

  const dotLayouts = useMemo(() => {
    if (!districtCenters) return {};
    const layouts = {};
    districtData.forEach(d => {
      if (!districtCenters[d.id]) return;
      const dots = [];
      parties.filter(p => (d.seatsMap[p.id] || 0) > 0).sort((a, b) => a.ideology - b.ideology).forEach(p => {
        for (let i = 0; i < d.seatsMap[p.id]; i++) dots.push(p);
      });
      layouts[d.id] = cyPackCenteredDots(dots, 6, 2.5);
    });
    return layouts;
  }, [districtData, districtCenters, parties]);

  const activeDistrict = useMemo(() => activeId ? districtData.find(d => d.id === activeId) : null, [activeId, districtData]);
  const top5Parties = useMemo(() => {
    if (!activeDistrict) return [];
    return [...parties].map(p => ({ p, pct: activeDistrict.votes[p.id] || 0 })).sort((a, b) => b.pct - a.pct).slice(0, 5);
  }, [activeDistrict, parties]);

  const activeWinner   = useMemo(() => activeDistrict ? parties.find(p => p.id === activeDistrict.leaderId) : null, [activeDistrict, parties]);
  const activeRunnerUp = useMemo(() => activeDistrict ? parties.find(p => p.id === activeDistrict.runnerUpId) : null, [activeDistrict, parties]);

  return (
    <div style={{ ...S.card, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={S.label}>Electoral Map</span>
        <MapModeMenu viewMode={viewMode} onChange={setViewMode} />
      </div>

      <div style={{ position: "relative", width: "100%", background: "var(--map-bg)", borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)", touchAction: "none", height: 420 }}>
        {!hideControls && (
          <div style={{ position: "absolute", bottom: 12, left: 12, display: "flex", gap: 5, zIndex: 10 }}>
            <button onClick={handleZoomIn} style={{ ...S.ghostBtn, padding: "4px 8px", background: "var(--bg-mid)" }}><IconPlus size={12}/></button>
            <button onClick={handleZoomOut} style={{ ...S.ghostBtn, padding: "4px 8px", background: "var(--bg-mid)" }}><IconMinus size={12}/></button>
            <button onClick={handleResetZoom} style={{ ...S.ghostBtn, padding: "4px 8px", background: "var(--bg-mid)" }}><IconZoomReset size={12}/> Reset</button>
          </div>
        )}
        {!hideControls && viewMode === "swingometer" && (
          <div style={{ position: "absolute", bottom: 12, right: 12, zIndex: 10 }}>
            <button onClick={() => setShowSeats(s=>!s)} style={{ ...S.ghostBtn, padding: "6px 10px", background: "var(--bg-mid)" }}>
              {showSeats ? <><IconEyeOff size={12}/> Hide Seats</> : <><IconEye size={12}/> Show Seats</>}
            </button>
          </div>
        )}

        <svg ref={svgRef} viewBox="-20 0 680 370" style={{ width: "100%", height: "100%", display: "block", cursor: "grab" }}
          onMouseLeave={() => setActiveId(null)} onMouseDown={e => e.currentTarget.style.cursor = "grabbing"} onMouseUp={e => e.currentTarget.style.cursor = "grab"}
          onMouseMove={e => {
            if (!tooltipRef.current || hideControls) return;
            const x = e.clientX > window.innerWidth - 220 ? e.clientX - 200 : e.clientX + 15;
            tooltipRef.current.style.left = `${x}px`; tooltipRef.current.style.top = `${e.clientY + 15}px`;
          }}>
          <g ref={gRef}>
            {districtData.map(d => (
              <path key={d.id} id={`cy-path-${d.id}`} d={CY_PATHS[d.id]} fill={d.fillColor} opacity={activeId === null ? 0.9 : (activeId === d.id ? 1 : 0.4)}
                stroke={activeId === d.id ? "var(--text-main)" : "var(--map-stroke)"} strokeWidth={activeId === d.id ? 3 : 1}
                strokeLinejoin="round" style={{ cursor: "pointer", transition: `fill 0.3s ${EASE_STD}, opacity 0.2s ease` }}
                onMouseEnter={() => { if(!hideControls) setActiveId(d.id); }} />
            ))}
            {showSeats && viewMode === "swingometer" && districtCenters && districtData.map(d => {
              const center = districtCenters[d.id];
              const layout = dotLayouts[d.id];
              if (!center || !layout?.length) return null;
              return (
                <g key={`dots-${d.id}`} transform={`translate(${center.cx}, ${center.cy})`} style={{ pointerEvents: "none", transition: "opacity 0.2s", opacity: (activeId === null || activeId === d.id) ? 1 : 0.25 }}>
                  {layout.map((item, i) => <circle key={i} cx={item.x} cy={item.y} r={6} fill={item.party.color} stroke="var(--bg-mid)" strokeWidth={1.5}/>)}
                </g>
              );
            })}
          </g>
        </svg>

        {viewMode !== "swingometer" && (
          <div style={{ position: "absolute", bottom: hideControls ? 16 : 50, left: 16, background: "var(--bg-mid)", border: "1px solid var(--border)", padding: "8px 10px", borderRadius: 6, zIndex: 10, pointerEvents: "none", maxWidth: 190 }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: "var(--text-dim)", marginBottom: 4, textTransform: "uppercase" }}>
              Legend: {viewMode === "margin_of_victory" ? "Margin of Victory" : viewMode === "runner_up" ? "Runner-Up Party" : LEGEND_LABELS[viewMode]}
            </div>
            {viewMode === "margin_of_victory" ? (
              <div style={{ fontSize: 9, color: "var(--text-muted)", ...S.mono, lineHeight: 1.5 }}>Shaded by winning party's color · darker = wider margin</div>
            ) : viewMode === "runner_up" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {parties.filter(p => districtData.some(d => d.runnerUpId === p.id)).map(p => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 9, ...S.mono, color: "var(--text-muted)" }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: p.color }}/>{p.name}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <div style={{ height: 6, width: 120, borderRadius: 2, background: "linear-gradient(to right, rgb(245, 240, 225), rgb(153, 27, 27))" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "var(--text-muted)", ...S.mono }}>
                  <span>Min ({fmtDemoVal(viewMode, minVal)})</span>
                  <span>Max ({fmtDemoVal(viewMode, maxVal)})</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div ref={tooltipRef} style={{ ...S.tooltip, display: activeDistrict ? "block" : "none", padding: viewMode === "swingometer" ? "12px 14px" : "8px 10px", left: -9999, top: -9999 }}>
        {activeDistrict && viewMode === "swingometer" ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "var(--text-main)", fontFamily: "var(--ff-body)", fontWeight: 700, textTransform: "uppercase" }}>{activeDistrict.name}</span>
              <span style={{ fontSize: 9, color: "var(--text-dim)", ...S.mono, letterSpacing: 1 }}>{activeDistrict.seats} SEATS</span>
            </div>
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
              {top5Parties.map(item => {
                const ps = activeDistrict.seatsMap[item.p.id] || 0;
                return (
                  <div key={item.p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10, ...S.mono }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: item.p.color }}/>
                      <span style={{ color: "var(--text-main)" }}>{item.p.name}</span>
                    </div>
                    <span style={{ color: "var(--text-main)", fontWeight: 600 }}>{item.pct.toFixed(1)}%{ps > 0 ? ` (${ps})` : ""}</span>
                  </div>
                );
              })}
            </div>
          </>
        ) : activeDistrict && viewMode === "margin_of_victory" ? (
          <>
            <h4 style={{ margin: "0 0 6px", fontSize: 11, color: "var(--text-title)", fontFamily: "var(--ff-head)", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700 }}>{activeDistrict.name}</h4>
            {activeWinner ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: 10, ...S.mono }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <span style={{ color: activeWinner.color, fontWeight: 700 }}>{activeWinner.name}</span>
                  <span style={{ color: "var(--text-bright)" }}>{(activeDistrict.filteredVotes[activeWinner.id] || 0).toFixed(1)}%</span>
                </div>
                {activeRunnerUp && (
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, color: "var(--text-muted)" }}>
                    <span>{activeRunnerUp.name}</span>
                    <span>{(activeDistrict.filteredVotes[activeRunnerUp.id] || 0).toFixed(1)}%</span>
                  </div>
                )}
                <div style={{ marginTop: 3, paddingTop: 3, borderTop: "1px dashed var(--border)", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#EAB308", fontWeight: 600 }}>Margin:</span>
                  <span style={{ color: "var(--text-bright)", fontWeight: 700 }}>{activeDistrict.margin != null ? `${activeDistrict.margin.toFixed(1)}pp` : "—"}</span>
                </div>
              </div>
            ) : <span style={{ fontSize: 10, color: "var(--text-muted)" }}>No qualifying parties</span>}
          </>
        ) : activeDistrict && viewMode === "runner_up" ? (
          <>
            <h4 style={{ margin: "0 0 6px", fontSize: 11, color: "var(--text-title)", fontFamily: "var(--ff-head)", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700 }}>{activeDistrict.name}</h4>
            {activeRunnerUp ? (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10, ...S.mono, background: "rgba(234, 179, 8, 0.12)", padding: "3px 6px", borderRadius: 4, minWidth: 150, border: "1px solid rgba(234, 179, 8, 0.18)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5, color: activeRunnerUp.color, fontWeight: 700 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: activeRunnerUp.color }}/>{activeRunnerUp.name}
                </span>
                <span style={{ color: "var(--text-bright)", fontWeight: 700 }}>{(activeDistrict.filteredVotes[activeRunnerUp.id] || 0).toFixed(1)}%</span>
              </div>
            ) : <span style={{ fontSize: 10, color: "var(--text-muted)" }}>No runner-up</span>}
          </>
        ) : activeDistrict && (
          <>
            <h4 style={{ margin: "0 0 4px", fontSize: 11, color: "var(--text-title)", fontFamily: "var(--ff-head)", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700 }}>{activeDistrict.name}</h4>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10, ...S.mono, background: "rgba(234, 179, 8, 0.12)", padding: "3px 6px", borderRadius: 4, minWidth: 150, border: "1px solid rgba(234, 179, 8, 0.18)" }}>
              <span style={{ color: "#EAB308", fontWeight: 600 }}>Value:</span>
              <span style={{ color: "var(--text-bright)", fontWeight: 700 }}>
                {fmtDemoVal(viewMode, CY_DISTRICT_DEMOGRAPHICS[activeDistrict.id]?.[viewMode])}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
});
