// ─── cyprus-map.jsx ───────────────────────────────────────────────────────────
import { useState, useMemo, useEffect, useCallback, useRef, memo } from "react";
import * as d3 from "d3";
import { CY_PATHS, CY_DISTRICT_DEMOGRAPHICS } from "./cyprus-data.js";
import { cyPackCenteredDots } from "./cyprus-engine.js";
import { S, EASE_STD, IconPlus, IconMinus, IconZoomReset, IconEye, IconEyeOff } from "./cyprus-ui.jsx";

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

  const { minVal, maxVal } = useMemo(() => {
    if (viewMode === "swingometer") return { minVal: 0, maxVal: 100 };
    const values = Object.values(CY_DISTRICT_DEMOGRAPHICS).map(d => d[viewMode]).filter(v => typeof v === "number" && !isNaN(v));
    if (values.length === 0) return { minVal: 0, maxVal: 100 };
    return { minVal: Math.min(...values), maxVal: Math.max(...values) };
  }, [viewMode]);

  const districtData = useMemo(() => districtResults.map(d => {
    const filtered = Object.fromEntries(Object.entries(d.votes).filter(([pid]) => qualifyingIds.has(pid)));
    const seatsMap = electionResult?.districtSeats?.[d.id] || {};
    const sortedByVotes = Object.entries(filtered).sort((a, b) => b[1] - a[1]);
    const leaderId = sortedByVotes.length > 0 ? sortedByVotes[0][0] : null;
    
    let fillColor = "var(--bg-up)";
    if (viewMode === "swingometer") {
      fillColor = parties.find(p => p.id === leaderId)?.color + "BB" || "var(--border)";
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
    return { ...d, filteredVotes: filtered, seatsMap, fillColor };
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

  return (
    <div style={{ ...S.card, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={S.label}>Electoral Map</span>
        <select 
          value={viewMode} onChange={(e) => setViewMode(e.target.value)}
          style={{ background: "var(--bg-mid)", color: "var(--text-main)", border: "1px solid var(--border)", borderRadius: 4, padding: "4px 8px", fontSize: 10, fontFamily: "var(--ff-body)", fontWeight: 600, cursor: "pointer", outline: "none" }}
        >
          <option value="swingometer">🗳️ Swingometer</option>
          <option value="foreign_citizens_pct">🌐 Foreign Citizens (%)</option>
          <option value="urbanization_pct">🏙️ Urbanization (%)</option>
          <option value="avg_household_size">🏠 Avg Household Size</option>
        </select>
      </div>

      <div style={{ position: "relative", width: "100%", background: "var(--map-bg)", borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)", touchAction: "none", height: 420 }}>
        {!hideControls && (
          <div style={{ position: "absolute", bottom: 12, left: 12, display: "flex", gap: 5, zIndex: 10 }}>
            <button onClick={handleZoomIn} style={{ ...S.ghostBtn, padding: "4px 8px", background: "var(--bg-mid)" }}><IconPlus size={12}/></button>
            <button onClick={handleZoomOut} style={{ ...S.ghostBtn, padding: "4px 8px", background: "var(--bg-mid)" }}><IconMinus size={12}/></button>
            <button onClick={handleResetZoom} style={{ ...S.ghostBtn, padding: "4px 8px", background: "var(--bg-mid)" }}><IconZoomReset size={12}/> Reset</button>
          </div>
        )}
        {!hideControls && (
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
          <div style={{ position: "absolute", bottom: hideControls ? 16 : 50, left: 16, background: "var(--bg-mid)", border: "1px solid var(--border)", padding: "8px 10px", borderRadius: 6, zIndex: 10, pointerEvents: "none" }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: "var(--text-dim)", marginBottom: 4, textTransform: "uppercase" }}>
              Legend: {{ foreign_citizens_pct: "Foreign Citizens", urbanization_pct: "Urbanization", avg_household_size: "Avg Household Size" }[viewMode]}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ height: 6, width: 120, borderRadius: 2, background: "linear-gradient(to right, rgb(245, 240, 225), rgb(153, 27, 27))" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "var(--text-muted)", ...S.mono }}>
                <span>Min ({minVal.toFixed(viewMode === 'avg_household_size' ? 2 : 1)}{viewMode === 'avg_household_size' ? '' : '%'})</span>
                <span>Max ({maxVal.toFixed(viewMode === 'avg_household_size' ? 2 : 1)}{viewMode === 'avg_household_size' ? '' : '%'})</span>
              </div>
            </div>
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
        ) : activeDistrict && (
          <>
            <h4 style={{ margin: "0 0 4px", fontSize: 11, color: "var(--text-title)", fontFamily: "var(--ff-head)", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700 }}>{activeDistrict.name}</h4>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10, ...S.mono, background: "rgba(234, 179, 8, 0.12)", padding: "3px 6px", borderRadius: 4, minWidth: 150, border: "1px solid rgba(234, 179, 8, 0.18)" }}>
              <span style={{ color: "#EAB308", fontWeight: 600 }}>Value:</span>
              <span style={{ color: "var(--text-bright)", fontWeight: 700 }}>
                {typeof CY_DISTRICT_DEMOGRAPHICS[activeDistrict.id][viewMode] === "number" ? `${CY_DISTRICT_DEMOGRAPHICS[activeDistrict.id][viewMode].toFixed(viewMode === 'avg_household_size' ? 2 : 1)}${viewMode === 'avg_household_size' ? '' : '%'}` : "N/A (No Census Data)"}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
});
