// usa-map.jsx — the centerpiece D3 map: all 50 states + DC (real TopoJSON
// geometry from us-atlas, pre-projected AlbersUSA so Alaska/Hawaii sit in
// their conventional insets), with a State/County granularity toggle, a mode
// menu (swingometer / margin / demographic overlays), and click-to-pin local
// override editing (drag a county or state's own result independently of the
// national sliders — the change is a real vote-count shift that rolls up into
// its parent state's total).
//
// Perf note: hovering ~3,140 counties used to force React to re-render every
// <path> each time the active id changed (each path's fill/stroke/opacity
// read that state). Hover feedback now lives entirely in CSS (:hover), the
// path list is a memo()'d child that receives referentially-stable props, and
// "pinned" styling is toggled imperatively via classList — so mousing across
// the map never re-renders the geometry layer, only the small tooltip/panel
// subtrees that actually need to.
import { useState, useMemo, useEffect, useCallback, useRef, memo } from "react";
import * as d3 from "d3";
import { feature, mesh } from "topojson-client";
import statesTopology from "us-atlas/states-albers-10m.json";
import countiesTopology from "us-atlas/counties-albers-10m.json";
import ctRegions from "./usa-ct-regions.json";
import { USA_COUNTY_DEMOGRAPHICS, USA_STATE_DEMOGRAPHICS_2018 as USA_STATE_DEMOGRAPHICS } from "./usa-county-demographics.js";
import { USA_COUNTY_ETHNICITY, USA_STATE_ETHNICITY, USA_ETHNICITY_CATEGORIES } from "./usa-county-ethnicity.js";
import {
  USA_FIPS_TO_ABBR, USA_NON_STATE_FIPS, USA_STATE_NAMES,
  USA_CANDIDATE_DICT, USA_CANDIDATE_LABELS,
} from "./usa-data.js";
import { usCountyResult, usFmtVotesExact, usFmtEV } from "./usa-engine.js";
import {
  S, IconPlus, IconMinus, IconZoomReset, IconChevron, IconArrowLeft,
  IconBallot, IconBarChart, IconGraduate, IconDollar, IconUsers, IconLayers, IconMap, IconTrash, IconCheckSquare,
} from "./usa-ui.jsx";

// ---------------------------------------------------------------------------
// Static topology -> pre-rendered path strings, computed once at module load.
const rawPath = d3.geoPath();

const STATE_FEATURES = feature(statesTopology, statesTopology.objects.states).features
  .filter(f => !USA_NON_STATE_FIPS.has(f.id));
// us-atlas's bundled county topology still has Connecticut's 8 OLD counties
// (FIPS 09001-09015); Connecticut switched to 9 "planning region"
// county-equivalents in 2022 (FIPS 09110-09190), which is what election
// results are now reported under — so the old shapes are dropped here and
// replaced with real planning-region geometry (see rawdata/build-ct.mjs).
const COUNTY_FEATURES = feature(countiesTopology, countiesTopology.objects.counties).features
  .filter(f => !USA_NON_STATE_FIPS.has(String(f.id).slice(0, 2)) && !String(f.id).startsWith("09"));
const STATE_MESH_D  = rawPath(mesh(statesTopology, statesTopology.objects.states, (a, b) => a !== b));
const COUNTY_STATE_MESH_D = rawPath(mesh(countiesTopology, countiesTopology.objects.states, (a, b) => a !== b)) + " " + ctRegions.meshD;

const STATE_D  = Object.fromEntries(STATE_FEATURES.map(f => [f.id, rawPath(f)]));
const COUNTY_D = Object.fromEntries(COUNTY_FEATURES.map(f => [String(f.id).padStart(5, "0"), rawPath(f)]));
const COUNTY_NAME = Object.fromEntries(COUNTY_FEATURES.map(f => [String(f.id).padStart(5, "0"), f.properties?.name || "County"]));
for (const r of ctRegions.regions) { COUNTY_D[r.id] = r.d; COUNTY_NAME[r.id] = r.name; }
const ALL_COUNTY_IDS = [...Object.keys(COUNTY_D)];

// Merge the broad demographic layers with the detailed ethnicity layers into
// one lookup per county/state, computed once — the ethnicity keys (german,
// mexican, jamaican, ...) never collide with the demographic ones
// (bachelorPct, income, ...), so a plain spread is enough and `colorFor`
// below can treat every map mode as one flat field lookup.
const MERGED_COUNTY_DEMO = Object.fromEntries(
  Object.keys({ ...USA_COUNTY_DEMOGRAPHICS, ...USA_COUNTY_ETHNICITY }).map(fips => [
    fips, { ...USA_COUNTY_DEMOGRAPHICS[fips], ...USA_COUNTY_ETHNICITY[fips] },
  ])
);
const MERGED_STATE_DEMO = Object.fromEntries(
  Object.keys({ ...USA_STATE_DEMOGRAPHICS, ...USA_STATE_ETHNICITY }).map(abbr => [
    abbr, { ...USA_STATE_DEMOGRAPHICS[abbr], ...USA_STATE_ETHNICITY[abbr] },
  ])
);

const [BBOX_X0, BBOX_Y0, BBOX_X1, BBOX_Y1] = statesTopology.bbox;
const VIEW_BOX_X0 = BBOX_X0 - 12, VIEW_BOX_Y0 = BBOX_Y0 - 8;
const VIEW_BOX_W = BBOX_X1 - BBOX_X0 + 24, VIEW_BOX_H = BBOX_Y1 - BBOX_Y0 + 16;
const VIEW_BOX = `${VIEW_BOX_X0.toFixed(1)} ${VIEW_BOX_Y0.toFixed(1)} ${VIEW_BOX_W.toFixed(1)} ${VIEW_BOX_H.toFixed(1)}`;

// ---------------------------------------------------------------------------
const MAP_MODE_OPTIONS = [
  { id: "swingometer",       label: "Swingometer",             Icon: IconBallot },
  { id: "margin_of_victory", label: "Margin of Victory",       Icon: IconBarChart },
  { id: "pop",               label: "Population",              Icon: IconUsers },
  { id: "density",           label: "Population Density",      Icon: IconMap },
  { id: "bachelorPct",       label: "College Degree (%)",      Icon: IconGraduate },
  { id: "income",            label: "Median Household Income", Icon: IconDollar },
  { id: "povertyPct",        label: "Poverty Rate (%)",        Icon: IconDollar },
  { id: "unemploymentPct",   label: "Unemployment Rate (%)",   Icon: IconDollar },
  { id: "seniorPct",         label: "Senior Population (65+)", Icon: IconUsers },
];
// The four broad ethnic/racial categories — each directly selectable, and
// White/Black/Hispanic additionally drill down into specific ancestries /
// countries of origin (Census ACS "People Reporting Ancestry" and "Hispanic
// or Latino Origin by Specific Origin" tables — see rawdata/build-ethnicity.mjs).
// No detailed country-of-origin breakdown exists for Asian in that source, so
// it stays a single layer.
const ETHNIC_BROAD = [
  { id: "hispanicPct", label: "Hispanic / Latino (%)",   category: "hispanic" },
  { id: "whiteNHPct",  label: "White, Non-Hispanic (%)", category: "white" },
  { id: "blackNHPct",  label: "Black, Non-Hispanic (%)", category: "black" },
  { id: "asianNHPct",  label: "Asian, Non-Hispanic (%)", category: null },
];
const ETHNIC_LABEL_BY_ID = Object.fromEntries(ETHNIC_BROAD.map(o => [o.id, o.label]));
const ETHNIC_KEY_LABEL = Object.fromEntries(
  Object.values(USA_ETHNICITY_CATEGORIES).flat().map(o => [o.key, o.label])
);

const LEGEND_LABELS = {
  ...Object.fromEntries(MAP_MODE_OPTIONS.filter(o => !["swingometer", "margin_of_victory"].includes(o.id)).map(o => [o.id, o.label])),
  ...ETHNIC_LABEL_BY_ID,
  ...ETHNIC_KEY_LABEL,
};
function fmtDemoVal(mode, v) {
  if (v == null || isNaN(v)) return "N/A";
  if (mode === "income") return "$" + Math.round(v).toLocaleString();
  if (mode === "pop") return Math.round(v).toLocaleString();
  if (mode === "density") return Math.round(v).toLocaleString() + "/mi²";
  return `${v.toFixed(1)}%`;
}
function currentModeMeta(viewMode) {
  const flat = MAP_MODE_OPTIONS.find(o => o.id === viewMode);
  if (flat) return { label: flat.label, Icon: flat.Icon };
  const broad = ETHNIC_BROAD.find(o => o.id === viewMode);
  if (broad) return { label: broad.label, Icon: IconUsers };
  if (ETHNIC_KEY_LABEL[viewMode]) return { label: ETHNIC_KEY_LABEL[viewMode], Icon: IconUsers };
  return { label: "Swingometer", Icon: IconBallot };
}

const MapModeMenu = memo(function MapModeMenu({ viewMode, onChange }) {
  const [open, setOpen] = useState(false);
  // "top" | "broad" (the 4 ethnic groups) | "specific" (drilled into one group)
  const [panel, setPanel] = useState("top");
  const [broadCategory, setBroadCategory] = useState(null);
  const rootRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDocDown = e => { if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false); };
    const onKey = e => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDocDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDocDown); document.removeEventListener("keydown", onKey); };
  }, [open]);
  // Reset the drill-down state whenever the menu closes, so it always reopens at the top.
  useEffect(() => { if (!open) { setPanel("top"); setBroadCategory(null); } }, [open]);

  const select = id => { onChange(id); setOpen(false); };
  const current = currentModeMeta(viewMode);
  const CurrentIcon = current.Icon;

  const itemStyle = active => ({ display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", background: active ? "var(--tab-active)" : "transparent", color: active ? "#60A5FA" : "var(--text-main)", border: "1px solid transparent", borderRadius: 4, padding: "6px 8px", fontSize: 10, fontFamily: "var(--ff-body)", fontWeight: active ? 700 : 500, cursor: "pointer" });

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <button type="button" className="icon-btn" onClick={() => setOpen(v => !v)}
        style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--bg-mid)", color: "var(--text-main)", border: "1px solid var(--border)", borderRadius: 4, padding: "4px 8px", fontSize: 10, fontFamily: "var(--ff-body)", fontWeight: 600, cursor: "pointer", outline: "none" }}>
        <CurrentIcon size={12} /><span>{current.label}</span><IconChevron dir={open ? "up" : "down"} size={8} />
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", right: 0, zIndex: 30, background: "var(--bg-mid)", border: "1px solid var(--border)", borderRadius: 6, padding: 4, minWidth: 230, maxHeight: 340, overflowY: "auto", boxShadow: "0 16px 40px rgba(0,0,0,0.45)", display: "flex", flexDirection: "column", gap: 1 }}>
          {panel === "top" && MAP_MODE_OPTIONS.map(opt => {
            const Icon = opt.Icon; const active = opt.id === viewMode;
            return (
              <button key={opt.id} type="button" className="icon-btn" onClick={() => select(opt.id)} style={itemStyle(active)}>
                <Icon size={13} /><span>{opt.label}</span>
              </button>
            );
          })}
          {panel === "top" && (
            <button type="button" className="icon-btn" onClick={() => setPanel("broad")}
              style={itemStyle(ETHNIC_BROAD.some(o => o.id === viewMode) || !!ETHNIC_KEY_LABEL[viewMode])}>
              <IconUsers size={13} /><span style={{ flex: 1 }}>Ethnic Makeup</span><span style={{ opacity: 0.6 }}>›</span>
            </button>
          )}

          {panel === "broad" && (
            <>
              <button type="button" className="icon-btn" onClick={() => setPanel("top")}
                style={{ display: "flex", alignItems: "center", gap: 6, width: "100%", textAlign: "left", background: "transparent", color: "var(--text-dim)", border: "none", borderRadius: 4, padding: "6px 8px", fontSize: 9, fontFamily: "var(--ff-body)", letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", marginBottom: 2 }}>
                <IconArrowLeft size={11} /><span>Ethnic Makeup</span>
              </button>
              {ETHNIC_BROAD.map(opt => {
                const active = opt.id === viewMode;
                return (
                  <div key={opt.id} style={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <button type="button" className="icon-btn" onClick={() => select(opt.id)} style={{ ...itemStyle(active), flex: 1 }}>
                      <IconUsers size={13} /><span>{opt.label}</span>
                    </button>
                    {opt.category && (
                      <button type="button" className="icon-btn" title={`Specific ${opt.label.split(",")[0].split(" /")[0]} origins`}
                        onClick={() => { setBroadCategory(opt.category); setPanel("specific"); }}
                        style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: 4, color: "var(--text-dim)", cursor: "pointer", padding: "6px 7px", flexShrink: 0 }}>
                        ›
                      </button>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {panel === "specific" && broadCategory && (
            <>
              <button type="button" className="icon-btn" onClick={() => setPanel("broad")}
                style={{ display: "flex", alignItems: "center", gap: 6, width: "100%", textAlign: "left", background: "transparent", color: "var(--text-dim)", border: "none", borderRadius: 4, padding: "6px 8px", fontSize: 9, fontFamily: "var(--ff-body)", letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", marginBottom: 2 }}>
                <IconArrowLeft size={11} /><span>{ETHNIC_BROAD.find(o => o.category === broadCategory)?.label}</span>
              </button>
              {(USA_ETHNICITY_CATEGORIES[broadCategory] || []).map(opt => {
                const active = opt.key === viewMode;
                return (
                  <button key={opt.key} type="button" className="icon-btn" onClick={() => select(opt.key)} style={itemStyle(active)}>
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
});

// Memoized geometry layer: props are referentially stable across hover/pin
// changes (only the parent's data-dependent useMemo output changes them), so
// this never re-renders on mouse movement.
const GeoLayer = memo(function GeoLayer({ items, onEnter, onClick }) {
  return (
    <g className="usa-geo-layer">
      {items.map(it => (
        <path key={it.id} id={`usa-geo-${it.id}`} data-id={it.id} d={it.d} fill={it.fill}
          className="usa-geo-path" strokeWidth={it.isCounty ? 0.25 : 0.75}
          onMouseEnter={onEnter} onClick={onClick} />
      ))}
    </g>
  );
});

export const USAMap = memo(function USAMap({
  electionResult, scenarioYear, hideControls = false,
  countyOverrides = {}, stateOverrides = {}, onSetCountyOverride, onSetStateOverride, onClearAllOverrides,
  countyTurnout = {}, stateTurnout = {}, onSetCountyTurnout, onSetStateTurnout,
  demSliders = null, baseCandidates = null,
}) {
  const [activeId, setActiveId] = useState(null);      // hover preview: state abbr OR county fips
  const [pinnedItems, setPinnedItems] = useState([]);   // click-to-edit selection: [{ kind: "state"|"county", id }]
  const [multiSelect, setMultiSelect] = useState(false);
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
    // scaleExtent min = 1 means you can never zoom out past the initial fit;
    // translateExtent (in the SVG's own viewBox units — d3.pointer is
    // SVG-aware and reports coordinates in that space automatically) pins
    // panning to the map's own bounds, so at scale 1 there's nowhere to pan
    // at all and the view snaps back to exactly where it started.
    const zoom = d3.zoom().scaleExtent([1, 12])
      .translateExtent([[VIEW_BOX_X0, VIEW_BOX_Y0], [VIEW_BOX_X0 + VIEW_BOX_W, VIEW_BOX_Y0 + VIEW_BOX_H]])
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

  // Stable event handlers (refs avoid stale closures without changing identity).
  const hideControlsRef = useRef(hideControls); hideControlsRef.current = hideControls;
  const handleEnter = useCallback(e => {
    if (hideControlsRef.current) return;
    setActiveId(e.currentTarget.dataset.id);
  }, []);
  const multiSelectRef = useRef(multiSelect); multiSelectRef.current = multiSelect;
  const handleClick = useCallback(e => {
    if (hideControlsRef.current) return;
    const id = e.currentTarget.dataset.id;
    const kind = id.length === 2 ? "state" : "county";
    setPinnedItems(prev => {
      // States and counties can never be selected together — starting a
      // selection of one kind always clears any selection of the other.
      const sameKind = prev.every(p => p.kind === kind);
      const base = sameKind ? prev : [];
      const idx = base.findIndex(p => p.id === id);
      if (multiSelectRef.current) {
        if (idx !== -1) return base.filter((_, i) => i !== idx);
        return [...base, { kind, id }];
      }
      if (idx !== -1 && base.length === 1) return [];
      return [{ kind, id }];
    });
  }, []);

  // Tooltip follows the cursor via `transform` (compositor-only) instead of
  // `left`/`top` (which force a synchronous layout on every single mousemove
  // event), and coalesces to at most one write per animation frame — this was
  // the main source of hover jank, independent of any React re-render cost.
  const tooltipRafRef = useRef(null);
  const latestPosRef = useRef({ x: -9999, y: -9999 });
  const handleTooltipMove = useCallback(e => {
    if (hideControlsRef.current) return;
    latestPosRef.current = { x: e.clientX, y: e.clientY };
    if (tooltipRafRef.current) return;
    tooltipRafRef.current = requestAnimationFrame(() => {
      tooltipRafRef.current = null;
      if (!tooltipRef.current) return;
      const { x: clientX, y: clientY } = latestPosRef.current;
      const x = clientX > window.innerWidth - 220 ? clientX - 200 : clientX + 15;
      const y = clientY + 15;
      tooltipRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
  }, []);
  useEffect(() => () => { if (tooltipRafRef.current) cancelAnimationFrame(tooltipRafRef.current); }, []);

  const isDemoMode = !["swingometer", "margin_of_victory"].includes(viewMode);

  // The color scale's min/max is drawn from whichever granularity is on
  // screen, so switching Counties on sharpens the gradient to real county
  // variation instead of the flatter state-level spread.
  const { minVal, maxVal } = useMemo(() => {
    if (!isDemoMode) return { minVal: 0, maxVal: 100 };
    const source = showCounties ? Object.values(MERGED_COUNTY_DEMO) : Object.values(MERGED_STATE_DEMO);
    const values = source.map(d => d[viewMode]).filter(v => typeof v === "number" && !isNaN(v));
    if (!values.length) return { minVal: 0, maxVal: 100 };
    return { minVal: Math.min(...values), maxVal: Math.max(...values) };
  }, [viewMode, isDemoMode, showCounties]);

  const colorFor = useCallback((winner, margin, demoRecord) => {
    if (viewMode === "swingometer") {
      return (USA_CANDIDATE_DICT[winner]?.color || "#9CA3AF") + "CC";
    }
    if (viewMode === "margin_of_victory") {
      const t = Math.min(1, (margin ?? 0) / 25);
      const opacityHex = Math.round((0.28 + 0.72 * t) * 255).toString(16).padStart(2, "0");
      return (USA_CANDIDATE_DICT[winner]?.color || "#9CA3AF") + opacityHex;
    }
    const demoVal = demoRecord?.[viewMode];
    if (typeof demoVal !== "number") return "var(--border)";
    const pct = maxVal === minVal ? 0.5 : (demoVal - minVal) / (maxVal - minVal);
    const r = Math.round(226 + (30 - 226) * pct), g = Math.round(232 + (64 - 232) * pct), b = Math.round(240 + (175 - 240) * pct);
    return `rgb(${r}, ${g}, ${b})`;
  }, [viewMode, minVal, maxVal]);

  // Per-state derived render data — depends only on real data, never on hover/pin.
  const stateItems = useMemo(() => STATE_FEATURES.map(f => {
    const abbr = USA_FIPS_TO_ABBR[f.id];
    const res = electionResult.stateResults[abbr];
    if (!res) return null;
    return { id: abbr, fill: colorFor(res.winner, res.margin, MERGED_STATE_DEMO[abbr]), d: STATE_D[f.id], isCounty: false };
  }).filter(Boolean), [electionResult, colorFor]);

  const countyItems = useMemo(() => {
    if (!showCounties) return [];
    return ALL_COUNTY_IDS.map(fips => {
      const abbr = USA_FIPS_TO_ABBR[fips.slice(0, 2)];
      if (!abbr) return null;
      let fill;
      if (isDemoMode) {
        const res = electionResult.stateResults[abbr];
        const demoRecord = MERGED_COUNTY_DEMO[fips] || MERGED_STATE_DEMO[abbr];
        fill = colorFor(res?.winner, res?.margin, demoRecord);
      } else {
        const cr = usCountyResult(fips, scenarioYear, electionResult.swing, countyOverrides[fips], {
          demSliders, baseCandidates, turnoutPct: countyTurnout[fips],
        });
        fill = cr ? colorFor(cr.winner, cr.margin) : "var(--border)";
      }
      return { id: fips, fill, d: COUNTY_D[fips], isCounty: true };
    }).filter(Boolean);
  }, [showCounties, electionResult, colorFor, isDemoMode, scenarioYear, countyOverrides, countyTurnout, demSliders, baseCandidates]);

  const items = showCounties ? countyItems : stateItems;

  // Imperatively (re)apply the "pinned" outline — never touches the 3,000+
  // unrelated paths, so it costs nothing on the hot hover/drag path.
  const prevPinnedDomIdsRef = useRef([]);
  useEffect(() => {
    for (const oldId of prevPinnedDomIdsRef.current) {
      document.getElementById(`usa-geo-${oldId}`)?.classList.remove("usa-geo-pinned");
    }
    const domIds = pinnedItems.map(p => p.id);
    for (const domId of domIds) document.getElementById(`usa-geo-${domId}`)?.classList.add("usa-geo-pinned");
    prevPinnedDomIdsRef.current = domIds;
  }, [pinnedItems, items]);

  const activeState = useMemo(() => (activeId && activeId.length === 2) ? electionResult.stateResults[activeId] : null, [activeId, electionResult]);
  const activeCounty = useMemo(() => {
    if (!activeId || activeId.length < 4) return null;
    return usCountyResult(activeId, scenarioYear, electionResult.swing, countyOverrides[activeId], {
      demSliders, baseCandidates, turnoutPct: countyTurnout[activeId],
    });
  }, [activeId, scenarioYear, electionResult, countyOverrides, demSliders, baseCandidates, countyTurnout]);

  const labels = USA_CANDIDATE_LABELS[scenarioYear] || { gop: "GOP", dem: "DEM" };
  const candidateIds = electionResult.candidateIds || ["gop", "dem", "other"];

  return (
    <div style={{ ...S.card, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <span style={S.label}>Electoral Map</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {Object.keys(countyOverrides).length + Object.keys(stateOverrides).length + Object.keys(countyTurnout).length + Object.keys(stateTurnout).length > 0 && (
            <button type="button" className="icon-btn" onClick={onClearAllOverrides}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--bg-mid)", color: "#F87171", border: "1px solid var(--border)", borderRadius: 4, padding: "4px 8px", fontSize: 10, fontFamily: "var(--ff-body)", fontWeight: 600, cursor: "pointer" }}>
              <IconTrash size={11} /><span>Clear {Object.keys(countyOverrides).length + Object.keys(stateOverrides).length + Object.keys(countyTurnout).length + Object.keys(stateTurnout).length} Local Edits</span>
            </button>
          )}
          <button type="button" className="icon-btn" onClick={() => setShowCounties(v => !v)}
            style={{ display: "flex", alignItems: "center", gap: 6, background: showCounties ? "var(--tab-active)" : "var(--bg-mid)", color: showCounties ? "#60A5FA" : "var(--text-main)", border: "1px solid var(--border)", borderRadius: 4, padding: "4px 8px", fontSize: 10, fontFamily: "var(--ff-body)", fontWeight: 600, cursor: "pointer" }}>
            <IconLayers size={12} /><span>{showCounties ? "Counties: On" : "Counties: Off"}</span>
          </button>
          <button type="button" className="icon-btn" onClick={() => setMultiSelect(v => !v)} title="Select several states/counties to batch-edit their local swing together"
            style={{ display: "flex", alignItems: "center", gap: 6, background: multiSelect ? "var(--tab-active)" : "var(--bg-mid)", color: multiSelect ? "#60A5FA" : "var(--text-main)", border: "1px solid var(--border)", borderRadius: 4, padding: "4px 8px", fontSize: 10, fontFamily: "var(--ff-body)", fontWeight: 600, cursor: "pointer" }}>
            <IconCheckSquare size={12} /><span>Multi-Select: {multiSelect ? "On" : "Off"}</span>
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
          onMouseMove={handleTooltipMove}>
          <g ref={gRef}>
            <GeoLayer items={items} onEnter={handleEnter} onClick={handleClick} />
            <path d={showCounties ? COUNTY_STATE_MESH_D : STATE_MESH_D} fill="none" stroke="var(--bg-up)" strokeWidth={showCounties ? 1.8 : 1.5} strokeLinejoin="round" style={{ pointerEvents: "none" }} />
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
          </div>
        )}
      </div>

      <div ref={tooltipRef} style={{ ...S.tooltip, display: (activeState || activeCounty) ? "block" : "none", left: 0, top: 0, transform: "translate3d(-9999px, -9999px, 0)", willChange: "transform" }}>
        {activeCounty ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 12, color: "var(--text-main)", fontWeight: 700, textTransform: "uppercase" }}>{COUNTY_NAME[activeCounty.fips]}, {activeCounty.abbr}</span>
              {activeCounty.isStatewide ? <span style={{ fontSize: 7, color: "#fbbf24", ...S.mono, letterSpacing: 0.5 }}>STATEWIDE</span>
                : activeCounty.overridePts !== 0 && <span style={{ fontSize: 7, color: "#fbbf24", ...S.mono, letterSpacing: 0.5 }}>OVERRIDDEN</span>}
            </div>
            {!isDemoMode ? (
              <>
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
                  {["gop", "dem"].map(id => (
                    <div key={id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10, ...S.mono }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: USA_CANDIDATE_DICT[id].color }} />
                        <span style={{ color: "var(--text-main)" }}>{labels[id]}</span>
                      </div>
                      <span style={{ color: "var(--text-main)", fontWeight: 600 }}>{usFmtVotesExact(activeCounty.votes[id])} · {activeCounty.pct[id]?.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 5, paddingTop: 5, borderTop: "1px dashed var(--border)", fontSize: 9, color: "var(--text-dim)", ...S.mono, display: "flex", justifyContent: "space-between" }}>
                  <span>Total votes</span><span>{usFmtVotesExact(activeCounty.totalVotes)}</span>
                </div>
              </>
            ) : (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10, ...S.mono, background: "rgba(234, 179, 8, 0.12)", padding: "3px 6px", borderRadius: 4, minWidth: 150, border: "1px solid rgba(234, 179, 8, 0.18)" }}>
                <span style={{ color: "#EAB308", fontWeight: 600 }}>Value:</span>
                <span style={{ color: "var(--text-main)", fontWeight: 700 }}>
                  {fmtDemoVal(viewMode, (MERGED_COUNTY_DEMO[activeCounty.fips] || MERGED_STATE_DEMO[activeCounty.abbr])?.[viewMode])}
                  {!MERGED_COUNTY_DEMO[activeCounty.fips]?.[viewMode] && <span style={{ fontSize: 7, color: "var(--text-dim)", marginLeft: 4 }}>(state)</span>}
                </span>
              </div>
            )}
            <div style={{ marginTop: 4, fontSize: 8, color: "var(--text-dim)", fontStyle: "italic" }}>Click to pin &amp; edit locally</div>
          </>
        ) : activeState ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 13, color: "var(--text-main)", fontWeight: 700, textTransform: "uppercase" }}>{USA_STATE_NAMES[activeId]}</span>
              <span style={{ fontSize: 9, color: "var(--text-dim)", ...S.mono, letterSpacing: 1 }}>{usFmtEV(activeState.ev)} EV</span>
            </div>
            {viewMode === "swingometer" || viewMode === "margin_of_victory" ? (
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                {candidateIds.map(id => (
                  <div key={id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10, ...S.mono }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: USA_CANDIDATE_DICT[id].color }} />
                      <span style={{ color: "var(--text-main)" }}>{id === "other" ? "Other" : labels[id]}</span>
                    </div>
                    <span style={{ color: "var(--text-main)", fontWeight: 600 }}>{usFmtVotesExact(activeState.votes[id])} · {activeState[id]?.toFixed(1)}%</span>
                  </div>
                ))}
                <div style={{ marginTop: 3, paddingTop: 3, borderTop: "1px dashed var(--border)", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#EAB308", fontWeight: 600, fontSize: 9 }}>Margin:</span>
                  <span style={{ color: "var(--text-main)", fontWeight: 700, fontSize: 10, ...S.mono }}>{activeState.margin.toFixed(1)}pt</span>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10, ...S.mono, background: "rgba(234, 179, 8, 0.12)", padding: "3px 6px", borderRadius: 4, minWidth: 150, border: "1px solid rgba(234, 179, 8, 0.18)" }}>
                <span style={{ color: "#EAB308", fontWeight: 600 }}>Value:</span>
                <span style={{ color: "var(--text-main)", fontWeight: 700 }}>{fmtDemoVal(viewMode, MERGED_STATE_DEMO[activeId]?.[viewMode])}</span>
              </div>
            )}
            <div style={{ marginTop: 4, fontSize: 8, color: "var(--text-dim)", fontStyle: "italic" }}>Click to pin &amp; edit locally</div>
          </>
        ) : null}
      </div>

      {pinnedItems.length === 1 && (
        <PinnedEditor
          pinned={pinnedItems[0]} scenarioYear={scenarioYear} electionResult={electionResult}
          countyOverrides={countyOverrides} stateOverrides={stateOverrides}
          onSetCountyOverride={onSetCountyOverride} onSetStateOverride={onSetStateOverride}
          countyTurnout={countyTurnout} stateTurnout={stateTurnout}
          onSetCountyTurnout={onSetCountyTurnout} onSetStateTurnout={onSetStateTurnout}
          demSliders={demSliders} baseCandidates={baseCandidates}
          onClose={() => setPinnedItems([])}
        />
      )}
      {pinnedItems.length > 1 && (
        <BatchEditor
          items={pinnedItems} scenarioYear={scenarioYear} electionResult={electionResult}
          countyOverrides={countyOverrides} stateOverrides={stateOverrides}
          onSetCountyOverride={onSetCountyOverride} onSetStateOverride={onSetStateOverride}
          countyTurnout={countyTurnout} stateTurnout={stateTurnout}
          onSetCountyTurnout={onSetCountyTurnout} onSetStateTurnout={onSetStateTurnout}
          demSliders={demSliders} baseCandidates={baseCandidates}
          onRemoveItem={(kind, id) => setPinnedItems(prev => prev.filter(p => !(p.kind === kind && p.id === id)))}
          onClose={() => setPinnedItems([])}
        />
      )}
    </div>
  );
});

// Persistent below-the-map panel for the clicked (pinned) state/county — full
// candidate breakdown with real vote counts and the local-swing override bar.
const PinnedEditor = memo(function PinnedEditor({
  pinned, scenarioYear, electionResult, countyOverrides, stateOverrides, onSetCountyOverride, onSetStateOverride,
  countyTurnout, stateTurnout, onSetCountyTurnout, onSetStateTurnout, demSliders, baseCandidates, onClose,
}) {
  const labels = USA_CANDIDATE_LABELS[scenarioYear] || { gop: "GOP", dem: "DEM" };
  const isCounty = pinned.kind === "county";
  const overridePts = isCounty ? (countyOverrides[pinned.id] || 0) : (stateOverrides[pinned.id] || 0);
  const turnoutPct = isCounty ? (countyTurnout[pinned.id] || 0) : (stateTurnout[pinned.id] || 0);
  const [localPts, setLocalPts] = useState(overridePts);
  const [localTurnout, setLocalTurnout] = useState(turnoutPct);
  const debounced = useRef(null);
  const debouncedTurnout = useRef(null);
  useEffect(() => { setLocalPts(overridePts); }, [overridePts, pinned.id]);
  useEffect(() => { setLocalTurnout(turnoutPct); }, [turnoutPct, pinned.id]);

  const data = useMemo(() => {
    if (isCounty) {
      const cr = usCountyResult(pinned.id, scenarioYear, electionResult.swing, overridePts, { demSliders, baseCandidates, turnoutPct });
      if (!cr) return null;
      return { name: `${COUNTY_NAME[pinned.id]}, ${cr.abbr}`, stateName: USA_STATE_NAMES[cr.abbr], ev: null, ids: Object.keys(cr.pct), pct: cr.pct, votes: cr.votes, total: cr.totalVotes, winner: cr.winner, isStatewide: cr.isStatewide };
    }
    const sr = electionResult.stateResults[pinned.id];
    if (!sr) return null;
    const ids = electionResult.candidateIds || Object.keys(sr.votes || {});
    const pct = {}; ids.forEach(id => pct[id] = sr[id]);
    return { name: USA_STATE_NAMES[pinned.id], ev: sr.ev, ids, pct, votes: sr.votes, total: sr.totalVotes, winner: sr.winner };
  }, [pinned, scenarioYear, electionResult, overridePts, isCounty, demSliders, baseCandidates, turnoutPct]);

  const handleChange = useCallback(val => {
    setLocalPts(val);
    if (debounced.current) clearTimeout(debounced.current);
    debounced.current = setTimeout(() => {
      if (isCounty) onSetCountyOverride?.(pinned.id, val);
      else onSetStateOverride?.(pinned.id, val);
    }, 150);
  }, [isCounty, pinned.id, onSetCountyOverride, onSetStateOverride]);

  const handleTurnoutChange = useCallback(val => {
    setLocalTurnout(val);
    if (debouncedTurnout.current) clearTimeout(debouncedTurnout.current);
    debouncedTurnout.current = setTimeout(() => {
      if (isCounty) onSetCountyTurnout?.(pinned.id, val);
      else onSetStateTurnout?.(pinned.id, val);
    }, 150);
  }, [isCounty, pinned.id, onSetCountyTurnout, onSetStateTurnout]);

  if (!data) return null;
  const pct = Math.min(100, Math.max(0, ((localPts + 30) / 60) * 100));
  const turnoutBarPct = Math.min(100, Math.max(0, ((localTurnout + 50) / 100) * 100));

  return (
    <div style={{ background: "var(--bg-up)", border: "1px solid #fbbf2455", borderRadius: 8, padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-main)", textTransform: "uppercase" }}>{data.name}</span>
          {data.ev != null && <span style={{ fontSize: 9, color: "var(--text-dim)", ...S.mono }}>{usFmtEV(data.ev)} EV</span>}
          {data.isStatewide && <span style={{ fontSize: 7, color: "#fbbf24", ...S.mono, letterSpacing: 0.5 }}>STATEWIDE FALLBACK</span>}
        </div>
        <button className="icon-btn" onClick={onClose} style={{ ...S.ghostBtn, padding: "3px 8px" }}>✕ Close</button>
      </div>
      {data.isStatewide && (
        <div style={{ fontSize: 9, color: "var(--text-dim)", marginBottom: 10, lineHeight: 1.4, padding: "6px 8px", background: "var(--bg-mid)", borderRadius: 4 }}>
          Alaska reports results by state house district, not by borough, so no real per-borough number exists — this shows Alaska's statewide result instead. A local edit here would only preview against that statewide number, not a real borough count, so editing is disabled; pin Alaska itself to change its result.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
        {data.ids.map(id => {
          const c = USA_CANDIDATE_DICT[id];
          const barW = Math.max(0, Math.min(100, data.pct[id] || 0));
          return (
            <div key={id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 100, flexShrink: 0, fontSize: 10, color: "var(--text-main)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{id === "other" ? "Other" : labels[id] || c.name}</div>
              <div style={{ flex: 1, height: 12, background: "var(--bg-mid)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: `${barW}%`, height: "100%", background: c.color, transition: "width 0.2s" }} />
              </div>
              <div style={{ width: 150, textAlign: "right", fontSize: 10, ...S.mono, color: "var(--text-dim)", flexShrink: 0 }}>
                {usFmtVotesExact(data.votes[id])} · <span style={{ color: "var(--text-main)", fontWeight: 700 }}>{(data.pct[id] || 0).toFixed(1)}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {!data.isStatewide && (
        <div style={{ borderTop: "1px dashed var(--border)", paddingTop: 10, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: 1, textTransform: "uppercase" }}>Turnout (total votes cast)</span>
            <span style={{ fontSize: 10, ...S.mono, color: localTurnout === 0 ? "var(--text-dim)" : "var(--text-main)" }}>
              {localTurnout > 0 ? "+" : ""}{localTurnout.toFixed(0)}% · {usFmtVotesExact(data.total)}
            </span>
          </div>
          <input type="range" min={-50} max={50} step={1} value={localTurnout} onChange={e => handleTurnoutChange(parseFloat(e.target.value))}
            style={{ width: "100%", height: 6, borderRadius: 3, outline: "none", cursor: "pointer", background: `linear-gradient(to right, var(--border) 0%, var(--border) ${turnoutBarPct}%, #a78bfa ${turnoutBarPct}%, #a78bfa 100%)` }} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3, fontSize: 8, color: "var(--text-muted)", ...S.mono }}>
            <span>−50%</span><span>0</span><span>+50%</span>
          </div>
          {localTurnout !== 0 && (
            <button className="icon-btn" onClick={() => handleTurnoutChange(0)} style={{ ...S.ghostBtn, marginTop: 8, width: "100%", justifyContent: "center" }}>
              <IconTrash size={10} /> Reset Turnout
            </button>
          )}
          <div style={{ marginTop: 6, fontSize: 8, color: "var(--text-dim)", lineHeight: 1.4 }}>
            Scales this {isCounty ? "county" : "state"}'s total votes cast without changing its GOP/DEM split — a turnout surge or slump changes how much weight it carries in the {isCounty ? "state" : "national"} total.
          </div>
        </div>
      )}

      {!data.isStatewide && (
        <div style={{ borderTop: "1px dashed var(--border)", paddingTop: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: 1, textTransform: "uppercase" }}>Local Swing (this {isCounty ? "county" : "state"} only)</span>
            <span style={{ fontSize: 10, ...S.mono, color: localPts === 0 ? "var(--text-dim)" : localPts > 0 ? USA_CANDIDATE_DICT.gop.color : USA_CANDIDATE_DICT.dem.color }}>
              {localPts > 0 ? "+" : ""}{localPts.toFixed(0)}pt {localPts !== 0 ? (localPts > 0 ? "GOP" : "DEM") : ""}
            </span>
          </div>
          <input type="range" min={-30} max={30} step={1} value={localPts} onChange={e => handleChange(parseFloat(e.target.value))}
            style={{ width: "100%", height: 6, borderRadius: 3, outline: "none", cursor: "pointer", background: `linear-gradient(to right, ${USA_CANDIDATE_DICT.dem.color} 0%, ${USA_CANDIDATE_DICT.dem.color} ${pct}%, ${USA_CANDIDATE_DICT.gop.color} ${pct}%, ${USA_CANDIDATE_DICT.gop.color} 100%)` }} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3, fontSize: 8, color: "var(--text-muted)", ...S.mono }}>
            <span>−30 (DEM)</span><span>0</span><span>+30 (GOP)</span>
          </div>
          {localPts !== 0 && (
            <button className="icon-btn" onClick={() => handleChange(0)} style={{ ...S.ghostBtn, marginTop: 8, width: "100%", justifyContent: "center" }}>
              <IconTrash size={10} /> Clear This Override
            </button>
          )}
          {isCounty && (
            <div style={{ marginTop: 8, fontSize: 8, color: "var(--text-dim)", lineHeight: 1.4 }}>
              This shift is counted directly into {data.stateName || "the state"}'s statewide total, on top of the national swing.
            </div>
          )}
        </div>
      )}
    </div>
  );
});

// Multi-select panel: one shared "Local Swing" bar sets the SAME override on
// every selected state/county at once (a batch regional swing), plus a
// compact per-item list to review or drop individual entries.
const BatchEditor = memo(function BatchEditor({
  items, scenarioYear, electionResult, countyOverrides, stateOverrides, onSetCountyOverride, onSetStateOverride,
  countyTurnout, stateTurnout, onSetCountyTurnout, onSetStateTurnout, demSliders, baseCandidates, onRemoveItem, onClose,
}) {
  const [batchPts, setBatchPts] = useState(0);
  const [batchTurnout, setBatchTurnout] = useState(0);
  const debounced = useRef(null);
  const debouncedTurnout = useRef(null);
  const labels = USA_CANDIDATE_LABELS[scenarioYear] || { gop: "GOP", dem: "DEM" };

  const rows = useMemo(() => items.map(item => {
    const isCounty = item.kind === "county";
    if (isCounty) {
      const cr = usCountyResult(item.id, scenarioYear, electionResult.swing, countyOverrides[item.id], {
        demSliders, baseCandidates, turnoutPct: countyTurnout[item.id],
      });
      if (!cr) return null;
      return { ...item, name: `${COUNTY_NAME[item.id]}, ${cr.abbr}`, winner: cr.winner, margin: cr.margin, disabled: cr.isStatewide, currentPts: countyOverrides[item.id] || 0, currentTurnout: countyTurnout[item.id] || 0 };
    }
    const sr = electionResult.stateResults[item.id];
    if (!sr) return null;
    return { ...item, name: USA_STATE_NAMES[item.id], winner: sr.winner, margin: sr.margin, disabled: false, currentPts: stateOverrides[item.id] || 0, currentTurnout: stateTurnout[item.id] || 0 };
  }).filter(Boolean), [items, scenarioYear, electionResult, countyOverrides, stateOverrides, countyTurnout, stateTurnout, demSliders, baseCandidates]);

  const handleChange = useCallback(val => {
    setBatchPts(val);
    if (debounced.current) clearTimeout(debounced.current);
    debounced.current = setTimeout(() => {
      for (const r of rows) {
        if (r.disabled) continue;
        if (r.kind === "county") onSetCountyOverride?.(r.id, val);
        else onSetStateOverride?.(r.id, val);
      }
    }, 150);
  }, [rows, onSetCountyOverride, onSetStateOverride]);

  const handleTurnoutChange = useCallback(val => {
    setBatchTurnout(val);
    if (debouncedTurnout.current) clearTimeout(debouncedTurnout.current);
    debouncedTurnout.current = setTimeout(() => {
      for (const r of rows) {
        if (r.disabled) continue;
        if (r.kind === "county") onSetCountyTurnout?.(r.id, val);
        else onSetStateTurnout?.(r.id, val);
      }
    }, 150);
  }, [rows, onSetCountyTurnout, onSetStateTurnout]);

  const pct = Math.min(100, Math.max(0, ((batchPts + 30) / 60) * 100));
  const turnoutBarPct = Math.min(100, Math.max(0, ((batchTurnout + 50) / 100) * 100));
  const editableCount = rows.filter(r => !r.disabled).length;

  return (
    <div style={{ background: "var(--bg-up)", border: "1px solid #fbbf2455", borderRadius: 8, padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-main)", textTransform: "uppercase" }}>{rows.length} Selected</span>
        <button className="icon-btn" onClick={onClose} style={{ ...S.ghostBtn, padding: "3px 8px" }}>✕ Close All</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12, maxHeight: 180, overflowY: "auto" }}>
        {rows.map(r => {
          const c = USA_CANDIDATE_DICT[r.winner];
          return (
            <div key={`${r.kind}:${r.id}`} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 6px", background: "var(--bg-mid)", borderRadius: 4, opacity: r.disabled ? 0.55 : 1 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: c?.color || "var(--text-dim)", flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 10, color: "var(--text-main)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name}{r.disabled ? " (statewide only)" : ""}</span>
              <span style={{ fontSize: 9, ...S.mono, color: "var(--text-dim)", flexShrink: 0 }}>
                {r.margin?.toFixed(1)}pt{r.currentPts ? ` · ${r.currentPts > 0 ? "+" : ""}${r.currentPts}pt` : ""}{r.currentTurnout ? ` · ${r.currentTurnout > 0 ? "+" : ""}${r.currentTurnout}% turnout` : ""}
              </span>
              <button className="icon-btn" onClick={() => onRemoveItem(r.kind, r.id)} style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", padding: 2, flexShrink: 0 }} title="Remove from selection">✕</button>
            </div>
          );
        })}
      </div>

      <div style={{ borderTop: "1px dashed var(--border)", paddingTop: 10, marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: 1, textTransform: "uppercase" }}>Turnout (all {editableCount} selected)</span>
          <span style={{ fontSize: 10, ...S.mono, color: batchTurnout === 0 ? "var(--text-dim)" : "var(--text-main)" }}>{batchTurnout > 0 ? "+" : ""}{batchTurnout.toFixed(0)}%</span>
        </div>
        <input type="range" min={-50} max={50} step={1} value={batchTurnout} onChange={e => handleTurnoutChange(parseFloat(e.target.value))}
          style={{ width: "100%", height: 6, borderRadius: 3, outline: "none", cursor: "pointer", background: `linear-gradient(to right, var(--border) 0%, var(--border) ${turnoutBarPct}%, #a78bfa ${turnoutBarPct}%, #a78bfa 100%)` }} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3, fontSize: 8, color: "var(--text-muted)", ...S.mono }}>
          <span>−50%</span><span>0</span><span>+50%</span>
        </div>
        {batchTurnout !== 0 && (
          <button className="icon-btn" onClick={() => handleTurnoutChange(0)} style={{ ...S.ghostBtn, marginTop: 8, width: "100%", justifyContent: "center" }}>
            <IconTrash size={10} /> Reset Turnout
          </button>
        )}
      </div>

      <div style={{ borderTop: "1px dashed var(--border)", paddingTop: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: 1, textTransform: "uppercase" }}>Local Swing (all {editableCount} selected)</span>
          <span style={{ fontSize: 10, ...S.mono, color: batchPts === 0 ? "var(--text-dim)" : batchPts > 0 ? USA_CANDIDATE_DICT.gop.color : USA_CANDIDATE_DICT.dem.color }}>
            {batchPts > 0 ? "+" : ""}{batchPts.toFixed(0)}pt {batchPts !== 0 ? (batchPts > 0 ? "GOP" : "DEM") : ""}
          </span>
        </div>
        <input type="range" min={-30} max={30} step={1} value={batchPts} onChange={e => handleChange(parseFloat(e.target.value))}
          style={{ width: "100%", height: 6, borderRadius: 3, outline: "none", cursor: "pointer", background: `linear-gradient(to right, ${USA_CANDIDATE_DICT.dem.color} 0%, ${USA_CANDIDATE_DICT.dem.color} ${pct}%, ${USA_CANDIDATE_DICT.gop.color} ${pct}%, ${USA_CANDIDATE_DICT.gop.color} 100%)` }} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3, fontSize: 8, color: "var(--text-muted)", ...S.mono }}>
          <span>−30 (DEM)</span><span>0</span><span>+30 (GOP)</span>
        </div>
        {batchPts !== 0 && (
          <button className="icon-btn" onClick={() => handleChange(0)} style={{ ...S.ghostBtn, marginTop: 8, width: "100%", justifyContent: "center" }}>
            <IconTrash size={10} /> Clear This Batch Override
          </button>
        )}
        <div style={{ marginTop: 8, fontSize: 8, color: "var(--text-dim)", lineHeight: 1.4 }}>
          Dragging sets every selected {items.some(i => i.kind === "county") ? "county" : "state"} to the same local swing at once — labels are {labels.gop}/{labels.dem} unless noted.
        </div>
      </div>
    </div>
  );
});
