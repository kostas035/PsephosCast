// usa-map.jsx — the centerpiece D3 map: all 50 states + DC (real TopoJSON
// geometry from us-atlas, pre-projected AlbersUSA so Alaska/Hawaii sit in
// their conventional insets), with a State/County granularity toggle and a
// mode menu (swingometer / margin of victory / demographic overlays),
// mirroring cyprus-map.jsx's structure and interaction model.
import { useState, useMemo, useEffect, useCallback, useRef, memo } from "react";
import * as d3 from "d3";
import { feature, mesh } from "topojson-client";
import statesTopology from "us-atlas/states-albers-10m.json";
import countiesTopology from "us-atlas/counties-albers-10m.json";
import {
  USA_FIPS_TO_ABBR, USA_NON_STATE_FIPS, USA_STATE_NAMES, USA_STATE_DEMOGRAPHICS,
  USA_CANDIDATE_DICT, USA_CANDIDATE_LABELS,
} from "./usa-data.js";
import { usCountyResult, usFmtVotes, usFmtEV } from "./usa-engine.js";
import {
  S, EASE_STD, IconPlus, IconMinus, IconZoomReset, IconChevron,
  IconBallot, IconBarChart, IconGraduate, IconDollar, IconUsers, IconLayers, IconMap,
} from "./usa-ui.jsx";

// ---------------------------------------------------------------------------
// Static topology -> pre-rendered path strings. The us-atlas "-albers-10m"
// files ship coordinates already projected into AlbersUSA pixel space (a
// ~1015x594 canvas with Alaska/Hawaii insets baked in), so d3.geoPath() runs
// with NO projection (identity) — this is computed once at module load, not
// per-render, since the topology itself never changes.
const rawPath = d3.geoPath();

const STATE_FEATURES = feature(statesTopology, statesTopology.objects.states).features
  .filter(f => !USA_NON_STATE_FIPS.has(f.id));
const COUNTY_FEATURES = feature(countiesTopology, countiesTopology.objects.counties).features
  .filter(f => !USA_NON_STATE_FIPS.has(String(f.id).slice(0, 2)));
const STATE_MESH_D  = rawPath(mesh(statesTopology, statesTopology.objects.states, (a, b) => a !== b));
const COUNTY_STATE_MESH_D = rawPath(mesh(countiesTopology, countiesTopology.objects.states, (a, b) => a !== b));

const STATE_D  = Object.fromEntries(STATE_FEATURES.map(f => [f.id, rawPath(f)]));
const STATE_CENTROID = Object.fromEntries(STATE_FEATURES.map(f => [f.id, rawPath.centroid(f)]));
const COUNTY_D = Object.fromEntries(COUNTY_FEATURES.map(f => [String(f.id).padStart(5, "0"), rawPath(f)]));

const [BBOX_X0, BBOX_Y0, BBOX_X1, BBOX_Y1] = statesTopology.bbox;
const VIEW_BOX = `${(BBOX_X0 - 12).toFixed(1)} ${(BBOX_Y0 - 8).toFixed(1)} ${(BBOX_X1 - BBOX_X0 + 24).toFixed(1)} ${(BBOX_Y1 - BBOX_Y0 + 16).toFixed(1)}`;

// ---------------------------------------------------------------------------
const MAP_MODE_OPTIONS = [
  { id: "swingometer",       label: "Swingometer",             Icon: IconBallot },
  { id: "margin_of_victory", label: "Margin of Victory",       Icon: IconBarChart },
  { id: "bachelorPct",       label: "College Degree (%)",      Icon: IconGraduate },
  { id: "income",            label: "Median Household Income", Icon: IconDollar },
  { id: "seniorPct",         label: "Senior Population (65+)", Icon: IconUsers },
  { id: "hispanicPct",       label: "Hispanic / Latino (%)",   Icon: IconUsers },
  { id: "whiteNHPct",        label: "White, Non-Hispanic (%)", Icon: IconUsers },
  { id: "foreignBornPct",    label: "Foreign-Born (%)",        Icon: IconUsers },
];
const LEGEND_LABELS = {
  bachelorPct: "College Degree (%)", income: "Median Household Income", seniorPct: "Senior Population (65+)",
  hispanicPct: "Hispanic / Latino (%)", whiteNHPct: "White, Non-Hispanic (%)", foreignBornPct: "Foreign-Born (%)",
};

function fmtDemoVal(mode, v) {
  if (v == null || isNaN(v)) return "N/A";
  if (mode === "income") return "$" + Math.round(v).toLocaleString();
  return `${v.toFixed(1)}%`;
}

const MapModeMenu = memo(function MapModeMenu({ viewMode, onChange }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDocDown = e => { if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false); };
    const onKey = e => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDocDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDocDown); document.removeEventListener("keydown", onKey); };
  }, [open]);
  const current = MAP_MODE_OPTIONS.find(o => o.id === viewMode) || MAP_MODE_OPTIONS[0];
  const CurrentIcon = current.Icon;
  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <button type="button" className="icon-btn" onClick={() => setOpen(v => !v)}
        style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--bg-mid)", color: "var(--text-main)", border: "1px solid var(--border)", borderRadius: 4, padding: "4px 8px", fontSize: 10, fontFamily: "var(--ff-body)", fontWeight: 600, cursor: "pointer", outline: "none" }}>
        <CurrentIcon size={12} /><span>{current.label}</span><IconChevron dir={open ? "up" : "down"} size={8} />
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", right: 0, zIndex: 30, background: "var(--bg-mid)", border: "1px solid var(--border)", borderRadius: 6, padding: 4, minWidth: 210, boxShadow: "0 16px 40px rgba(0,0,0,0.45)", display: "flex", flexDirection: "column", gap: 1 }}>
          {MAP_MODE_OPTIONS.map(opt => {
            const Icon = opt.Icon; const active = opt.id === viewMode;
            return (
              <button key={opt.id} type="button" className="icon-btn" onClick={() => { onChange(opt.id); setOpen(false); }}
                style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", background: active ? "var(--tab-active)" : "transparent", color: active ? "#60A5FA" : "var(--text-main)", border: "1px solid transparent", borderRadius: 4, padding: "6px 8px", fontSize: 10, fontFamily: "var(--ff-body)", fontWeight: active ? 700 : 500, cursor: "pointer" }}>
                <Icon size={13} /><span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
});

export const USAMap = memo(function USAMap({ electionResult, scenarioYear, hideControls = false }) {
  const [activeId, setActiveId] = useState(null);   // state abbr OR county fips
  const [showCounties, setShowCounties] = useState(false);
  const [viewMode, setViewMode] = useState("swingometer");

  const svgRef = useRef(null);
  const gRef = useRef(null);
  const zoomRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;
    const g = d3.select(gRef.current);
    let raf = null, latest = null;
    const apply = () => { raf = null; if (latest) g.attr("transform", latest); };
    const zoom = d3.zoom().scaleExtent([1, 12])
      .on("start", () => { g.style("will-change", "transform"); g.selectAll("path").attr("shape-rendering", "optimizeSpeed"); })
      .on("zoom", e => { latest = e.transform; if (!raf) raf = requestAnimationFrame(apply); })
      .on("end", () => { if (raf) { cancelAnimationFrame(raf); raf = null; } if (latest) g.attr("transform", latest); g.style("will-change", "auto"); g.selectAll("path").attr("shape-rendering", "geometricPrecision"); });
    d3.select(svgRef.current).call(zoom);
    zoomRef.current = zoom;
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, []);

  const handleZoomIn    = useCallback(() => d3.select(svgRef.current).transition().duration(250).call(zoomRef.current.scaleBy, 1.4), []);
  const handleZoomOut   = useCallback(() => d3.select(svgRef.current).transition().duration(250).call(zoomRef.current.scaleBy, 1 / 1.4), []);
  const handleResetZoom = useCallback(() => d3.select(svgRef.current).transition().duration(250).call(zoomRef.current.transform, d3.zoomIdentity), []);

  const isDemoMode = !["swingometer", "margin_of_victory"].includes(viewMode);

  const { minVal, maxVal } = useMemo(() => {
    if (!isDemoMode) return { minVal: 0, maxVal: 100 };
    const values = Object.values(USA_STATE_DEMOGRAPHICS).map(d => d[viewMode]).filter(v => typeof v === "number" && !isNaN(v));
    if (!values.length) return { minVal: 0, maxVal: 100 };
    return { minVal: Math.min(...values), maxVal: Math.max(...values) };
  }, [viewMode, isDemoMode]);

  const colorFor = useCallback((abbr, winner, margin) => {
    if (viewMode === "swingometer") {
      return (USA_CANDIDATE_DICT[winner]?.color || "#9CA3AF") + "CC";
    }
    if (viewMode === "margin_of_victory") {
      const t = Math.min(1, (margin ?? 0) / 25);
      const opacityHex = Math.round((0.28 + 0.72 * t) * 255).toString(16).padStart(2, "0");
      return (USA_CANDIDATE_DICT[winner]?.color || "#9CA3AF") + opacityHex;
    }
    const demoVal = USA_STATE_DEMOGRAPHICS[abbr]?.[viewMode];
    if (typeof demoVal !== "number") return "var(--border)";
    const pct = maxVal === minVal ? 0.5 : (demoVal - minVal) / (maxVal - minVal);
    const r = Math.round(226 + (30 - 226) * pct), g = Math.round(232 + (64 - 232) * pct), b = Math.round(240 + (175 - 240) * pct);
    return `rgb(${r}, ${g}, ${b})`;
  }, [viewMode, minVal, maxVal]);

  // Per-state derived render data.
  const stateData = useMemo(() => STATE_FEATURES.map(f => {
    const abbr = USA_FIPS_TO_ABBR[f.id];
    const res = electionResult.stateResults[abbr];
    if (!res) return null;
    return { fips: f.id, abbr, res, fill: colorFor(abbr, res.winner, res.margin), d: STATE_D[f.id], centroid: STATE_CENTROID[f.id] };
  }).filter(Boolean), [electionResult, colorFor]);

  // Per-county derived render data (only computed/rendered when the toggle is on).
  const countyData = useMemo(() => {
    if (!showCounties) return [];
    return COUNTY_FEATURES.map(f => {
      const fips = String(f.id).padStart(5, "0");
      const abbr = USA_FIPS_TO_ABBR[fips.slice(0, 2)];
      if (!abbr) return null;
      let winner, margin, fill;
      if (isDemoMode) {
        winner = electionResult.stateResults[abbr]?.winner;
        margin = electionResult.stateResults[abbr]?.margin;
        fill = colorFor(abbr, winner, margin);
      } else {
        const cr = usCountyResult(fips, electionResult.stateResults, electionResult.swing);
        if (!cr) return null;
        winner = cr.winner; margin = cr.margin;
        fill = colorFor(abbr, winner, margin);
      }
      return { fips, abbr, d: COUNTY_D[fips], fill };
    }).filter(Boolean);
  }, [showCounties, electionResult, colorFor, isDemoMode]);

  const activeState = useMemo(() => {
    if (!activeId || activeId.length !== 2) return null;
    return stateData.find(s => s.abbr === activeId) || null;
  }, [activeId, stateData]);

  const activeCounty = useMemo(() => {
    if (!activeId || activeId.length < 4) return null;
    const abbr = USA_FIPS_TO_ABBR[activeId.slice(0, 2)];
    if (!abbr) return null;
    const cr = usCountyResult(activeId, electionResult.stateResults, electionResult.swing);
    const feat = COUNTY_FEATURES.find(f => String(f.id).padStart(5, "0") === activeId);
    return cr ? { ...cr, name: feat?.properties?.name || "County" } : null;
  }, [activeId, electionResult]);

  const labels = USA_CANDIDATE_LABELS[scenarioYear] || { gop: "GOP", dem: "DEM" };

  return (
    <div style={{ ...S.card, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <span style={S.label}>Electoral Map</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button type="button" className="icon-btn" onClick={() => setShowCounties(v => !v)}
            style={{ display: "flex", alignItems: "center", gap: 6, background: showCounties ? "var(--tab-active)" : "var(--bg-mid)", color: showCounties ? "#60A5FA" : "var(--text-main)", border: "1px solid var(--border)", borderRadius: 4, padding: "4px 8px", fontSize: 10, fontFamily: "var(--ff-body)", fontWeight: 600, cursor: "pointer" }}>
            <IconLayers size={12} /><span>{showCounties ? "Counties: On" : "Counties: Off"}</span>
          </button>
          <MapModeMenu viewMode={viewMode} onChange={setViewMode} />
        </div>
      </div>

      <div style={{ position: "relative", width: "100%", background: "var(--map-bg)", borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)", touchAction: "none", height: 460 }}>
        {!hideControls && (
          <div style={{ position: "absolute", bottom: 12, left: 12, display: "flex", gap: 5, zIndex: 10 }}>
            <button onClick={handleZoomIn} style={{ ...S.ghostBtn, padding: "4px 8px", background: "var(--bg-mid)" }}><IconPlus size={12}/></button>
            <button onClick={handleZoomOut} style={{ ...S.ghostBtn, padding: "4px 8px", background: "var(--bg-mid)" }}><IconMinus size={12}/></button>
            <button onClick={handleResetZoom} style={{ ...S.ghostBtn, padding: "4px 8px", background: "var(--bg-mid)" }}><IconZoomReset size={12}/> Reset</button>
          </div>
        )}

        <svg ref={svgRef} viewBox={VIEW_BOX} style={{ width: "100%", height: "100%", display: "block", cursor: "grab" }}
          onMouseLeave={() => setActiveId(null)} onMouseDown={e => e.currentTarget.style.cursor = "grabbing"} onMouseUp={e => e.currentTarget.style.cursor = "grab"}
          onMouseMove={e => {
            if (!tooltipRef.current || hideControls) return;
            const x = e.clientX > window.innerWidth - 220 ? e.clientX - 200 : e.clientX + 15;
            tooltipRef.current.style.left = `${x}px`; tooltipRef.current.style.top = `${e.clientY + 15}px`;
          }}>
          <g ref={gRef}>
            {!showCounties && stateData.map(s => (
              <path key={s.fips} d={s.d} fill={s.fill}
                opacity={activeId === null ? 0.95 : (activeId === s.abbr ? 1 : 0.45)}
                stroke={activeId === s.abbr ? "var(--map-stroke-hover)" : "var(--bg-up)"} strokeWidth={activeId === s.abbr ? 2 : 0.75}
                strokeLinejoin="round" style={{ cursor: "pointer", transition: `fill 0.3s ${EASE_STD}, opacity 0.2s ease` }}
                onMouseEnter={() => { if (!hideControls) setActiveId(s.abbr); }} />
            ))}
            {showCounties && countyData.map(c => (
              <path key={c.fips} d={c.d} fill={c.fill}
                opacity={activeId === null ? 0.95 : (activeId === c.fips ? 1 : 0.5)}
                stroke={activeId === c.fips ? "var(--map-stroke-hover)" : "var(--map-stroke)"} strokeWidth={activeId === c.fips ? 1.3 : 0.25}
                strokeLinejoin="round" style={{ cursor: "pointer", transition: `fill 0.25s ${EASE_STD}, opacity 0.2s ease` }}
                onMouseEnter={() => { if (!hideControls) setActiveId(c.fips); }} />
            ))}
            <path d={showCounties ? COUNTY_STATE_MESH_D : STATE_MESH_D} fill="none" stroke="var(--bg-up)" strokeWidth={showCounties ? 1 : 0} strokeLinejoin="round" style={{ pointerEvents: "none" }} />
          </g>
        </svg>

        {isDemoMode && (
          <div style={{ position: "absolute", bottom: hideControls ? 16 : 50, left: 16, background: "var(--bg-mid)", border: "1px solid var(--border)", padding: "8px 10px", borderRadius: 6, zIndex: 10, pointerEvents: "none", maxWidth: 200 }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: "var(--text-dim)", marginBottom: 4, textTransform: "uppercase" }}>Legend: {LEGEND_LABELS[viewMode]}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ height: 6, width: 130, borderRadius: 2, background: "linear-gradient(to right, rgb(226,232,240), rgb(30,64,175))" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "var(--text-muted)", ...S.mono }}>
                <span>{fmtDemoVal(viewMode, minVal)}</span><span>{fmtDemoVal(viewMode, maxVal)}</span>
              </div>
            </div>
            {showCounties && <div style={{ fontSize: 8, color: "var(--text-muted)", marginTop: 5, lineHeight: 1.4 }}>State-level estimate shown per county — no county demographic data.</div>}
          </div>
        )}
        {!isDemoMode && showCounties && (
          <div style={{ position: "absolute", bottom: hideControls ? 16 : 50, left: 16, background: "var(--bg-mid)", border: "1px solid var(--border)", padding: "6px 9px", borderRadius: 6, zIndex: 10, pointerEvents: "none", maxWidth: 210, fontSize: 8, color: "var(--text-muted)", lineHeight: 1.4 }}>
            <IconMap size={10} style={{ verticalAlign: "-1px", marginRight: 4 }} />
            Solid counties = certified 2024 returns · lighter counties = modelled from statewide swing.
          </div>
        )}
      </div>

      <div ref={tooltipRef} style={{ ...S.tooltip, display: (activeState || activeCounty) ? "block" : "none", left: -9999, top: -9999 }}>
        {activeCounty ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 12, color: "var(--text-main)", fontWeight: 700, textTransform: "uppercase" }}>{activeCounty.name}, {activeCounty.abbr}</span>
              {!activeCounty.hasRealData && <span style={{ fontSize: 7, color: "var(--text-muted)", ...S.mono, letterSpacing: 0.5 }}>MODELLED</span>}
            </div>
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
              {["gop", "dem"].map(id => (
                <div key={id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10, ...S.mono }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: USA_CANDIDATE_DICT[id].color }} />
                    <span style={{ color: "var(--text-main)" }}>{labels[id]}</span>
                  </div>
                  <span style={{ color: "var(--text-main)", fontWeight: 600 }}>{activeCounty[id]?.toFixed(1)}%</span>
                </div>
              ))}
            </div>
            {activeCounty.totalVotes != null && (
              <div style={{ marginTop: 5, paddingTop: 5, borderTop: "1px dashed var(--border)", fontSize: 9, color: "var(--text-dim)", ...S.mono, display: "flex", justifyContent: "space-between" }}>
                <span>Votes cast (2024)</span><span>{usFmtVotes(activeCounty.totalVotes)}</span>
              </div>
            )}
          </>
        ) : activeState ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 13, color: "var(--text-main)", fontWeight: 700, textTransform: "uppercase" }}>{USA_STATE_NAMES[activeState.abbr]}</span>
              <span style={{ fontSize: 9, color: "var(--text-dim)", ...S.mono, letterSpacing: 1 }}>{usFmtEV(activeState.res.ev)} EV</span>
            </div>
            {viewMode === "swingometer" || viewMode === "margin_of_victory" ? (
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                {["gop", "dem", "other"].map(id => (
                  <div key={id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10, ...S.mono }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: USA_CANDIDATE_DICT[id].color }} />
                      <span style={{ color: "var(--text-main)" }}>{id === "other" ? "Other" : labels[id]}</span>
                    </div>
                    <span style={{ color: "var(--text-main)", fontWeight: 600 }}>{activeState.res[id]?.toFixed(1)}%</span>
                  </div>
                ))}
                <div style={{ marginTop: 3, paddingTop: 3, borderTop: "1px dashed var(--border)", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#EAB308", fontWeight: 600, fontSize: 9 }}>Margin:</span>
                  <span style={{ color: "var(--text-main)", fontWeight: 700, fontSize: 10, ...S.mono }}>{activeState.res.margin.toFixed(1)}pt</span>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10, ...S.mono, background: "rgba(234, 179, 8, 0.12)", padding: "3px 6px", borderRadius: 4, minWidth: 150, border: "1px solid rgba(234, 179, 8, 0.18)" }}>
                <span style={{ color: "#EAB308", fontWeight: 600 }}>Value:</span>
                <span style={{ color: "var(--text-main)", fontWeight: 700 }}>{fmtDemoVal(viewMode, USA_STATE_DEMOGRAPHICS[activeState.abbr]?.[viewMode])}</span>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
});
