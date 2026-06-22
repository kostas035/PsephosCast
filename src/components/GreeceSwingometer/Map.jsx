// Map.jsx
import { memo, useRef, useState, useEffect, useMemo } from "react";
import * as d3 from "d3";
import { S, EASE_STD } from "./GreeceStyles";
import { IconEye, IconEyeOff, IconZoomReset } from "./GreeceIcons";
import { GR, GR_DISTRICT_DEMOGRAPHICS, grToLogit, grFromLogit } from "./greece-data.js";
import { GR_MUNI_DATA, GR_MUNI_PARTY_IDS } from "./greece-municipalities.js";
import { grNormStr, grMatchDistricts, grGetCentroidOffset, grExtractName } from "./greece-utils.js";

function buildPartyMap(parties) {
  const m = new Map();
  for (let i = 0; i < parties.length; i++) m.set(parties[i].id, parties[i]);
  return m;
}

function getDemoData(name, matchedDistricts) {
  if (!GR_DISTRICT_DEMOGRAPHICS) return null;
  const distId = matchedDistricts && matchedDistricts.length > 0 ? matchedDistricts[0].id : null;
  
  if (Array.isArray(GR_DISTRICT_DEMOGRAPHICS)) {
    return GR_DISTRICT_DEMOGRAPHICS.find(d => 
      (distId && d.id === distId) || 
      (d.name && grNormStr(d.name) === grNormStr(name)) ||
      (d.id && grNormStr(d.id) === grNormStr(name))
    );
  } else {
    if (distId && GR_DISTRICT_DEMOGRAPHICS[distId]) return GR_DISTRICT_DEMOGRAPHICS[distId];
    if (GR_DISTRICT_DEMOGRAPHICS[name]) return GR_DISTRICT_DEMOGRAPHICS[name];
    const nName = grNormStr(name);
    for (const key of Object.keys(GR_DISTRICT_DEMOGRAPHICS)) {
      if (grNormStr(key) === nName) return GR_DISTRICT_DEMOGRAPHICS[key];
    }
  }
  return null;
}

// 2021 census population per constituency (self-contained so the Population map mode
// never depends on a data-file export). Keyed by district id.
const GR_POP_2021 = { athens_a: 430362, athens_b1: 557407, athens_b2: 405623, athens_b3: 636474, piraeus_a: 182667, piraeus_b: 274730, east_attica: 403714, west_attica: 148548, thessaloniki_a: 568576, thessaloniki_b: 316369, chalkidiki: 104702, imathia: 136602, kilkis: 85885, pella: 138568, pieria: 123245, serres: 182226, evros: 134776, rhodope: 101767, xanthi: 107548, drama: 95701, kavala: 129872, kozani: 149733, kastoria: 48464, florina: 50921, grevena: 34538, ioannina: 163044, arta: 79776, preveza: 62769, thesprotia: 47947, larissa: 268451, magnesia: 181879, trikala: 139562, karditsa: 129171, aetolia_acarnania: 235371, boeotia: 109293, phthiotis: 151036, evrytania: 24545, euboea: 213179, phocis: 39800, corinthia: 136401, argolis: 93934, arcadia: 96092, laconia: 87104, messenia: 161953, elis: 168358, achaea: 296574, heraklion: 285528, chania: 144259, rethymno: 79801, lasithi: 73258, dodecanese: 180591, cyclades: 122738, lesbos: 97824, samos: 42202, chios: 52096, corfu: 97037, cephalonia: 41069, lefkada: 25365, zakynthos: 38340 };
function grDistrictPopulation(matched) {
  if (!matched || !matched.length) return null;
  let sum = 0, found = false;
  for (const d of matched) {
    const p = GR_POP_2021[d && d.id];
    if (typeof p === "number") { sum += p; found = true; }
  }
  return found ? sum : null;
}

function getFeatureFill(name, viewMode, seatData, partiesMap, minVal, maxVal, districtResults) {
  const n = name.toLowerCase();
  if (n.includes("athos") || n.includes("agion oros") || n.includes("agio oros")) return "var(--bg-up)";

  if (viewMode === "swingometer") {
    if (!seatData) return "var(--bg-up)";
    const entry = seatData.get(name);
    if (!entry) return "var(--bg-up)";
    if (entry.leaderColor) return entry.leaderColor + "BB";
    if (!entry.leader) return "var(--border)";
    const p = partiesMap.get(entry.leader);
    return p ? p.color + "BB" : "var(--border)";
  }

  if (viewMode === "margin_of_victory" || viewMode === "runner_up") {
    const matched = grMatchDistricts(name, districtResults);
    if (!matched.length) return "var(--bg-up)";
    const aggVotes = {};
    let totalSeats = 0;
    for (const d of matched) {
      totalSeats += d.seats;
      for (const pid of Object.keys(d.votes || {})) {
        aggVotes[pid] = (aggVotes[pid] || 0) + d.votes[pid] * d.seats;
      }
    }
    if (totalSeats === 0) return "var(--bg-up)";
    for (const pid of Object.keys(aggVotes)) aggVotes[pid] /= totalSeats;
    const sorted = Object.entries(aggVotes).sort((a, b) => b[1] - a[1]);
    
    if (viewMode === "margin_of_victory") {
      if (sorted.length < 1) return "var(--bg-up)";
      const winnerId = sorted[0][0];
      const margin = sorted[0][1] - (sorted[1]?.[1] ?? 0);
      const winner = partiesMap.get(winnerId);
      if (!winner) return "var(--bg-up)";
      const t = Math.min(1, margin / 40);
      const opacityHex = Math.round((0.2 + 0.8 * t) * 255).toString(16).padStart(2, "0");
      return winner.color + opacityHex;
    }
    
    if (viewMode === "runner_up") {
      if (sorted.length < 2) return "var(--bg-up)";
      const runnerUpId = sorted[1][0];
      const p = partiesMap.get(runnerUpId);
      return p ? p.color + "BB" : "var(--border)";
    }
  }

  const matched = grMatchDistricts(name, districtResults);

  if (viewMode === "population") {
    const pop = grDistrictPopulation(matched);
    if (pop == null) return "var(--bg-up)";
    const pct = maxVal === minVal ? 0.5 : (pop - minVal) / (maxVal - minVal);
    const r = Math.round(245 + (153 - 245) * pct);
    const g = Math.round(240 + (27 - 240) * pct);
    const b = Math.round(225 + (27 - 225) * pct);
    return `rgb(${r}, ${g}, ${b})`;
  }

  const demoData = getDemoData(name, matched);

  if (!demoData || demoData[viewMode] === undefined) return "var(--bg-up)";
  
  const val = demoData[viewMode];
  if (viewMode !== "primary_economy") {
    const num = parseFloat(val);
    if (isNaN(num)) return "var(--bg-up)";
    const pct = maxVal === minVal ? 0.5 : (num - minVal) / (maxVal - minVal);
    const r = Math.round(245 + (153 - 245) * pct);
    const g = Math.round(240 + (27 - 240) * pct);
    const b = Math.round(225 + (27 - 225) * pct);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    const strVal = String(val).toLowerCase();
    if (strVal.includes("service")) return "#EAB308";
    if (strVal.includes("agri") || strVal.includes("farm")) return "#22C55E";
    if (strVal.includes("indus") || strVal.includes("manuf") || strVal.includes("sec")) return "#3B82F6";
    if (strVal.includes("tour")) return "#EC4899";
    return "#8B5CF6";
  }
}

const GrMapTooltipContent = memo(function GrMapTooltipContent({ info, partiesMap, electionResult, viewMode }) {
  const qualifyingIds = useMemo(() => new Set((electionResult?.results || []).map(r => r.id)), [electionResult]);

  const tooltipData = useMemo(() => {
    if (viewMode !== "swingometer" || !info.districts) return null;
    const { districts } = info;
    const allDots = [];
    let totalSeats = 0;
    const aggVotes = {};
    let leanSum = 0;

    const sortedIds = Array.from(partiesMap.keys()).sort((a, b) => (partiesMap.get(a)?.ideology || 0) - (partiesMap.get(b)?.ideology || 0));

    for (let i = 0; i < districts.length; i++) {
      const district = districts[i];
      totalSeats += district.seats;
      leanSum += district.lean;

      const keys = Object.keys(district.votes || {});
      for (let j = 0; j < keys.length; j++) {
        const pid = keys[j];
        if (qualifyingIds.has(pid)) aggVotes[pid] = (aggVotes[pid] || 0) + district.votes[pid] * district.seats;
      }

      const seatsMap = district.allocatedSeats || {};
      for (let j = 0; j < sortedIds.length; j++) {
        const pid = sortedIds[j];
        const count = seatsMap[pid] || 0;
        for (let k = 0; k < count; k++) allDots.push(pid);
      }
    }

    const aKeys = Object.keys(aggVotes);
    for (let i = 0; i < aKeys.length; i++) aggVotes[aKeys[i]] /= totalSeats;

    const seatsByParty = {};
    for (let i = 0; i < allDots.length; i++) {
      const pid = allDots[i];
      seatsByParty[pid] = (seatsByParty[pid] || 0) + 1;
    }

    return { allDots, totalSeats, aggVotes, avgLean: leanSum / districts.length, seatsByParty };
  }, [info, qualifyingIds, partiesMap, viewMode]);

  const demoData = useMemo(() => getDemoData(info.mapName, info.districts), [info.mapName, info.districts]);

  if (info.isDebug) {
    return (
      <>
        <h4 style={{ margin: "0 0 2px", fontSize: 12, color: "#F87171", fontFamily: "var(--ff-head)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>Unmapped Polygon</h4>
        <div style={{ fontSize: 9, color: "var(--text-muted)", ...S.mono, letterSpacing: 1 }}>RAW NAME: {info.mapName}</div>
      </>
    );
  }

  if (info.isAthos) {
    return (
      <>
        <h4 style={{ margin: "0 0 2px", fontSize: 12, color: "var(--text-title)", fontFamily: "var(--ff-head)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>Agio Oros (Mt. Athos)</h4>
        <div style={{ fontSize: 9, color: "var(--text-muted)", ...S.mono, letterSpacing: 1 }}>AUTONOMOUS — NO SEATS</div>
      </>
    );
  }

  const title = info.districts && info.districts.length > 1 ? `${info.mapName.toUpperCase()} (AGG.)` : (info.districts?.[0]?.name || info.mapName);

  if (viewMode === "population") {
    const pop = grDistrictPopulation(info.districts);
    return (
      <>
        <h4 style={{ margin: "0 0 4px", fontSize: 11, color: "var(--text-title)", fontFamily: "var(--ff-head)", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700 }}>{title}</h4>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10, ...S.mono, background: "rgba(234, 179, 8, 0.12)", padding: "3px 6px", borderRadius: 4, minWidth: 150, border: "1px solid rgba(234, 179, 8, 0.18)" }}>
          <span style={{ color: "#EAB308", fontWeight: 600 }}>Population (2021):</span>
          <span style={{ color: "var(--text-bright)", fontWeight: 700 }}>{pop != null ? pop.toLocaleString() : "\u2014"}</span>
        </div>
      </>
    );
  }

  if (viewMode === "margin_of_victory" || viewMode === "runner_up") {
    if (!info.districts || !info.districts.length) return null;
    const aggVotes = {};
    let totalSeats = 0;
    for (const d of info.districts) {
      totalSeats += d.seats;
      for (const pid of Object.keys(d.votes || {})) {
        aggVotes[pid] = (aggVotes[pid] || 0) + d.votes[pid] * d.seats;
      }
    }
    if (totalSeats === 0) return null;
    for (const pid of Object.keys(aggVotes)) aggVotes[pid] /= totalSeats;
    const sorted = Object.entries(aggVotes).sort((a, b) => b[1] - a[1]);
    const winner = sorted[0] ? partiesMap.get(sorted[0][0]) : null;
    const runnerUp = sorted[1] ? partiesMap.get(sorted[1][0]) : null;
    const margin = sorted.length >= 2 ? sorted[0][1] - sorted[1][1] : null;

    return (
      <>
        <h4 style={{ margin: "0 0 6px", fontSize: 11, color: "var(--text-title)", fontFamily: "var(--ff-head)", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700 }}>{title}</h4>
        {winner && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10, ...S.mono, marginBottom: 3 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: winner.color }} />
              <span style={{ color: winner.color, fontWeight: 700 }}>1st: {winner.name}</span>
            </div>
            <span style={{ color: "var(--text-bright)" }}>{sorted[0][1].toFixed(1)}%</span>
          </div>
        )}
        {runnerUp && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10, ...S.mono, marginBottom: 3 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: runnerUp.color }} />
              <span style={{ color: runnerUp.color, fontWeight: 600 }}>2nd: {runnerUp.name}</span>
            </div>
            <span style={{ color: "var(--text-bright)" }}>{sorted[1][1].toFixed(1)}%</span>
          </div>
        )}
        {margin !== null && viewMode === "margin_of_victory" && (
          <div style={{ fontSize: 9, color: "var(--text-muted)", ...S.mono, marginTop: 4, borderTop: "1px solid var(--border)", paddingTop: 4 }}>
            MARGIN: {margin.toFixed(1)}pp
          </div>
        )}
      </>
    );
  }

  if (viewMode !== "swingometer") {
    if (!demoData) {
      return (
        <>
          <h4 style={{ margin: "0 0 2px", fontSize: 11, color: "var(--text-title)", fontFamily: "var(--ff-head)", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700 }}>{title}</h4>
          <div style={{ fontSize: 9, color: "var(--text-muted)", ...S.mono }}>No data entry</div>
        </>
      );
    }

    const labelLabels = {
      age_over_65_pct: "Age 65+:",
      tertiary_edu_pct: "Tertiary Edu:",
      unemployment_rate: "Unemployment:",
      foreign_citizens_pct: "Foreign Citizens:",
      urbanization_pct: "Urbanization:",
      primary_economy: "Primary Econ:"
    };

    const val = demoData[viewMode];
    const displayValue = typeof val === "number" ? `${val.toFixed(1)}%` : String(val);

    return (
      <>
        <h4 style={{ margin: "0 0 4px", fontSize: 11, color: "var(--text-title)", fontFamily: "var(--ff-head)", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700 }}>{title}</h4>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10, ...S.mono, background: "rgba(234, 179, 8, 0.12)", padding: "3px 6px", borderRadius: 4, minWidth: 150, border: "1px solid rgba(234, 179, 8, 0.18)" }}>
          <span style={{ color: "#EAB308", fontWeight: 600 }}>{labelLabels[viewMode] || "Value:"}</span>
          <span style={{ color: "var(--text-bright)", fontWeight: 700 }}>{displayValue}</span>
        </div>
      </>
    );
  }

  if (!tooltipData) return null;
  const { allDots, totalSeats, aggVotes, avgLean, seatsByParty } = tooltipData;
  const leanColor = avgLean > 0.5 ? "#60A5FA" : avgLean < -0.5 ? "#F87171" : "var(--text-main)";
  const leanText = avgLean > 0.2 ? `RIGHT (+${avgLean.toFixed(1)})` : avgLean < -0.2 ? `LEFT (${avgLean.toFixed(1)})` : `SWING (${avgLean.toFixed(1)})`;

  return (
    <>
      <h4 style={{ margin: "0 0 2px", fontSize: 12, color: "var(--text-title)", fontFamily: "var(--ff-head)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>{title}</h4>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontSize: 9, color: "var(--text-muted)", ...S.mono, letterSpacing: 1 }}>{totalSeats} SEATS</div>
        <div style={{ fontSize: 9, color: leanColor, ...S.mono, letterSpacing: 1 }}>{leanText}</div>
      </div>
      
      <div style={{ display: "flex", flexWrap: "wrap", gap: 3, maxWidth: 150, marginBottom: 10 }}>
        {allDots.map((pid, i) => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: partiesMap.get(pid)?.color || "#4B5563" }} />)}
      </div>
      
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
        {Object.entries(aggVotes).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([pid, pct]) => {
          const p  = partiesMap.get(pid);
          const ps = seatsByParty[pid] || 0;
          return (
            <div key={pid} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10, ...S.mono }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: p?.color || "var(--text-muted)" }} />
                <span style={{ color: p?.color || "var(--text-main)" }}>{p?.name || pid}</span>
              </div>
              <span style={{ color: "var(--text-bright)" }}>{pct.toFixed(1)}%{ps > 0 ? ` (${ps})` : ""}</span>
            </div>
          );
        })}
      </div>
    </>
  );
});

const MapTooltipPortal = memo(function MapTooltipPortal({ domRef, setterRef, partiesMap, electionResult, viewMode }) {
  const [info, setInfo] = useState(null);
  useEffect(() => { setterRef.current = setInfo; return () => { setterRef.current = null; }; }, [setterRef]);
  return (
    <div ref={domRef} style={{ ...S.tooltip, display: "none", left: -999, top: -999, ...viewMode !== "swingometer" ? { padding: "6px 10px" } : {}, willChange: "left, top" }}>
      {info && <GrMapTooltipContent info={info} partiesMap={partiesMap} electionResult={electionResult} viewMode={viewMode} />}
    </div>
  );
});

export default memo(function Map({ districtResults, parties, electionResult, isMobile, featureSeatData, geoCache, showDots = true, onToggleDots, showLabels = true, onToggleLabels, hideControls = false, isInset = false }) {
  const svgRef        = useRef(null);
  const zoomRef       = useRef(null);
  const pathFnRef     = useRef(null);
  const debounceRef   = useRef(null);
  const tooltipRef    = useRef(null);
  const tooltipSetRef = useRef(null);
  const featureMetaRef = useRef([]); // cached per-feature name/centroid/flags (built once at setup)

  const districtRef   = useRef(districtResults);
  const seatDataRef   = useRef(featureSeatData);
  const partiesMapRef = useRef(null);
  districtRef.current  = districtResults;
  seatDataRef.current  = featureSeatData;

  const [geoReady, setGeoReady] = useState(false);
  const [viewMode, setViewMode] = useState("swingometer");

  const partiesMap = useMemo(() => buildPartyMap(parties), [parties]);
  partiesMapRef.current = partiesMap;

  // ─────────────────────────────────────────────────────────────────────────
  // MUNICIPALITY BREAKDOWN (isolated). Active ONLY when viewMode==="municipality".
  // Own 333-polygon overlay on its own <svg>; never touches the constituency map,
  // its effects, dots, labels, tooltip or export path.
  // ─────────────────────────────────────────────────────────────────────────
  const muniSvgRef        = useRef(null);
  const muniZoomRef       = useRef(null);
  const muniTooltipRef    = useRef(null);
  const muniTooltipSetRef = useRef(null);
  const [muniGeo, setMuniGeo]           = useState(null);
  const [muniLoading, setMuniLoading]   = useState(false);
  const [muniError, setMuniError]       = useState(null);
  const [muniGeoReady, setMuniGeoReady] = useState(false);
  const [muniActive, setMuniActive]     = useState(null);
  muniTooltipSetRef.current = setMuniActive;

  useEffect(() => {
    if (isInset || viewMode !== "municipality" || muniGeo || muniLoading) return;
    setMuniLoading(true); setMuniError(null);
    fetch("/GreeceMun.json")
      .then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(j => { setMuniGeo(j); setMuniLoading(false); })
      .catch(err => { setMuniError(err.message || "load failed"); setMuniLoading(false); });
  }, [viewMode, muniGeo, muniLoading, isInset]);

  // Each municipality INHERITS its parent constituency's exact logit delta
  // (current vs scenario baseline) — Chalkidiki munis move like Chalkidiki, Boeotia
  // like Boeotia. Zero swing => delta 0 => every municipality shows its 2023 baseline.
  const muniFill = useMemo(() => {
    if (!muniGeo) return null;
    const matchCache = {};
    const matchD = (cname) => {
      if (cname in matchCache) return matchCache[cname];
      const m = grMatchDistricts(cname, districtResults)[0] || null;
      matchCache[cname] = m; return m;
    };
    const out = {};
    muniGeo.features.forEach(f => {
      const code = String((f.properties && f.properties.code) || "").trim();
      const rec = GR_MUNI_DATA[code];
      if (!rec) return;
      const D = matchD(rec.constituency);
      const muniBase = rec.baseVotes || {};
      // Swing EVERY party currently in play, not just the fixed 2023 list. The party
      // set is the union of the constituency's current parties (which includes new
      // ones like elas/elpida) and the municipality's own 2023 parties — so new
      // parties appear and move, and nothing is silently pinned.
      const ids = [];
      const seen = {};
      if (D && D.votes) Object.keys(D.votes).forEach(p => { if (!seen[p]) { seen[p] = 1; ids.push(p); } });
      Object.keys(muniBase).forEach(p => { if (!seen[p]) { seen[p] = 1; ids.push(p); } });

      const shares = {}; let total = 0;
      ids.forEach(pid => {
        const dCur  = D && D.votes ? D.votes[pid] : undefined;
        const dBase = D && D.baseVotes ? D.baseVotes[pid] : undefined;
        // How the parent constituency moved this party (logit space) = inherited swing.
        const delta = (dCur != null && dBase != null) ? (grToLogit(dCur) - grToLogit(dBase)) : 0;
        // Anchor on the municipality's own 2023 share when it has one; otherwise fall
        // back to the constituency baseline (a NEW party has no municipal history, so
        // it starts at the constituency level here, then swings with it).
        const mb = muniBase[pid];
        const anchor = (mb != null && mb > 0) ? mb
                     : (dBase != null ? dBase : (dCur != null ? dCur : 0));
        const val = anchor > 0 ? grFromLogit(grToLogit(anchor) + delta) : 0;
        shares[pid] = val; total += val;
      });
      if (total > 0) ids.forEach(pid => { shares[pid] = (shares[pid] / total) * 100; });
      let leaderId = null, leaderPct = -1;
      ids.forEach(pid => { if (shares[pid] > leaderPct) { leaderPct = shares[pid]; leaderId = pid; } });
      out[code] = { name: rec.name, constituency: rec.constituency, imputed: !!rec.imputed,
        shares, leaderId, leaderPct, color: (partiesMap.get(leaderId) && partiesMap.get(leaderId).color) || "var(--text-muted)" };
    });
    return out;
  }, [muniGeo, districtResults, partiesMap]);

  useEffect(() => {
    if (!muniGeo || !muniSvgRef.current) return;
    const W = 600, H = 700;
    const svg = d3.select(muniSvgRef.current);
    svg.selectAll("*").remove();
    muniGeo.features.forEach(feature => {
      if (d3.geoArea(feature) > 2 * Math.PI) {
        if (feature.geometry.type === "Polygon") feature.geometry.coordinates.forEach(r => r.reverse());
        else if (feature.geometry.type === "MultiPolygon") feature.geometry.coordinates.forEach(pp => pp.forEach(r => r.reverse()));
      }
    });
    const proj = d3.geoMercator(); const pathFn = d3.geoPath().projection(proj);
    proj.fitExtent([[16, 16], [W - 16, H - 16]], muniGeo);
    const g = svg.append("g").attr("class", "muni-root");
    let raf = null, latest = null;
    const apply = () => { raf = null; if (latest) g.attr("transform", latest); };
    const zoom = d3.zoom().scaleExtent([1, 12]).translateExtent([[0, 0], [W, H]])
      .on("start", () => { g.style("will-change", "transform"); g.selectAll("path").attr("shape-rendering", "optimizeSpeed"); })
      .on("zoom", e => { latest = e.transform; if (!raf) raf = requestAnimationFrame(apply); })
      .on("end", () => { if (raf) { cancelAnimationFrame(raf); raf = null; } if (latest) g.attr("transform", latest); g.style("will-change", "auto"); g.selectAll("path").attr("shape-rendering", "geometricPrecision"); });
    svg.call(zoom); muniZoomRef.current = zoom;
    g.selectAll("path.muni").data(muniGeo.features).enter().append("path")
      .attr("class", "muni").attr("d", pathFn)
      .attr("data-code", d => String((d.properties && d.properties.code) || "").trim())
      .attr("stroke", "var(--map-stroke)").attr("stroke-width", "0.4px")
      .style("cursor", "pointer").style("transition", `fill 0.3s ${EASE_STD}`)
      .on("mouseover", function (event, d) {
        const code = String((d.properties && d.properties.code) || "").trim();
        d3.select(this).attr("stroke", "var(--map-stroke-hover)").attr("stroke-width", "1.2px").style("stroke-opacity", 1);
        muniTooltipSetRef.current && muniTooltipSetRef.current(code);
        if (muniTooltipRef.current) muniTooltipRef.current.style.display = "block";
      })
      .on("mousemove", function (event) {
        if (!muniTooltipRef.current) return;
        let fx = event.clientX + 16, fy = event.clientY + 16;
        if (fx + 230 > window.innerWidth)  fx = event.clientX - 230;
        if (fy + 210 > window.innerHeight) fy = event.clientY - 210;
        muniTooltipRef.current.style.left = `${fx}px`; muniTooltipRef.current.style.top = `${fy}px`;
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke", "var(--map-stroke)").attr("stroke-width", "0.4px");
        muniTooltipSetRef.current && muniTooltipSetRef.current(null);
        if (muniTooltipRef.current) muniTooltipRef.current.style.display = "none";
      });
    setMuniGeoReady(true);
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [muniGeo]);

  useEffect(() => {
    if (!muniGeoReady || !muniFill || !muniSvgRef.current) return;
    d3.select(muniSvgRef.current).selectAll("path.muni")
      .attr("fill", function () { const c = this.getAttribute("data-code"); return (muniFill[c] && muniFill[c].color) || "var(--bg-up)"; });
  }, [muniGeoReady, muniFill]);

  const muniResetZoom = () => { if (muniSvgRef.current && muniZoomRef.current) d3.select(muniSvgRef.current).transition().duration(600).ease(d3.easeCubicInOut).call(muniZoomRef.current.transform, d3.zoomIdentity); };

  const { minVal, maxVal } = useMemo(() => {
    if (viewMode === "population") {
      const vals = Object.values(GR_POP_2021);
      return { minVal: Math.min(...vals), maxVal: Math.max(...vals) };
    }
    if (viewMode === "swingometer" || viewMode === "margin_of_victory" || viewMode === "runner_up" || !GR_DISTRICT_DEMOGRAPHICS) return { minVal: 0, maxVal: 100 };
    const dataArray = Array.isArray(GR_DISTRICT_DEMOGRAPHICS) ? GR_DISTRICT_DEMOGRAPHICS : Object.values(GR_DISTRICT_DEMOGRAPHICS);
    const values = dataArray.map(d => d[viewMode]).filter(v => typeof v === "number" && !isNaN(v));
    if (values.length === 0) return { minVal: 0, maxVal: 100 };
    return { minVal: Math.min(...values), maxVal: Math.max(...values) };
  }, [viewMode]);

  useEffect(() => {
    const W = 600, H = isInset ? 600 : 700;
    const svg  = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // D3 WINDING ORDER AUTO-FIX
    geoCache.features.forEach(feature => {
      if (d3.geoArea(feature) > 2 * Math.PI) {
        if (feature.geometry.type === "Polygon") {
          feature.geometry.coordinates.forEach(ring => ring.reverse());
        } else if (feature.geometry.type === "MultiPolygon") {
          feature.geometry.coordinates.forEach(poly => poly.forEach(ring => ring.reverse()));
        }
      }
    });

    let zooming = false; // true only during an active pan/zoom gesture
    const proj   = d3.geoMercator();
    const pathFn = d3.geoPath().projection(proj);
    proj.fitExtent([[20, 20], [W - 20, H - 20]], geoCache);
    pathFnRef.current = pathFn;

    const g = svg.append("g").attr("class", "map-root");

    // Smooth pan/zoom: coalesce the many zoom events into ONE transform-apply per
    // animation frame, GPU-promote the group only while interacting, and render the
    // paths in fast mode mid-gesture (crisp again on release). This is what removes
    // the drag/zoom jank without changing the static picture.
    let zoomRaf = null, latestT = null;
    zooming = false;
    const applyZoom = () => { zoomRaf = null; if (latestT) g.attr("transform", latestT); };
    zoomRef.current = d3.zoom()
      .scaleExtent([1, 10])
      .translateExtent([[0, 0], [W, H]])
      .on("start", () => {
        zooming = true;
        g.style("will-change", "transform");
        g.selectAll("path.prefecture").attr("shape-rendering", "optimizeSpeed");
      })
      .on("zoom", e => {
        latestT = e.transform;
        if (!zoomRaf) zoomRaf = requestAnimationFrame(applyZoom);
      })
      .on("end", () => {
        zooming = false;
        if (zoomRaf) { cancelAnimationFrame(zoomRaf); zoomRaf = null; }
        if (latestT) g.attr("transform", latestT);
        g.style("will-change", "auto");
        g.selectAll("path.prefecture").attr("shape-rendering", "geometricPrecision");
      });
    svg.call(zoomRef.current);

    g.selectAll("path.prefecture").data(geoCache.features).enter().append("path")
      .attr("class", "prefecture").attr("d", pathFn).attr("stroke", "var(--map-stroke)").attr("stroke-width", isInset ? "1px" : "0.7px")
      .style("cursor", "pointer").style("transition", `fill 0.3s ${EASE_STD}`)
      .on("mouseover", function (event, d) {
        if (zooming || (hideControls && !isInset)) return; 
        d3.select(this).attr("stroke", "var(--map-stroke-hover)").attr("stroke-width", "2px");
        const name = grExtractName(d.properties);
        const lowerName = name.toLowerCase();
        
        if (lowerName.includes("athos") || lowerName.includes("agion oros") || lowerName.includes("agio oros")) {
          tooltipSetRef.current?.({ isAthos: true });
        } else {
          const matched = grMatchDistricts(name, districtRef.current);
          if (matched.length) tooltipSetRef.current?.({ districts: matched, mapName: name, isAthos: false });
          else tooltipSetRef.current?.({ isDebug: true, mapName: name || "UNKNOWN PROPERTY" });
        }
        if (tooltipRef.current) tooltipRef.current.style.display = "block";
      })
      .on("mousemove", function (event) {
        if (zooming || !tooltipRef.current || (hideControls && !isInset)) return;
        const x = event.clientX, y = event.clientY;
        let fx = x + 16, fy = y + 16;
        if (fx + 210 > window.innerWidth)  fx = x - 210;
        if (fy + 190 > window.innerHeight) fy = y - 190;
        tooltipRef.current.style.left = `${fx}px`;
        tooltipRef.current.style.top  = `${fy}px`;
      })
      .on("mouseout", function () {
        if(hideControls && !isInset) return;
        d3.select(this).attr("stroke", "var(--map-stroke)").attr("stroke-width", isInset ? "1px" : "0.7px");
        tooltipSetRef.current?.(null);
        if (tooltipRef.current) tooltipRef.current.style.display = "none";
      });

    g.append("g").attr("class", "dots-layer");
    g.append("g").attr("class", "labels-layer");

    // Pre-compute static per-feature data ONCE. Centroids are the expensive part
    // and never change after the projection is fixed; names/flags are pure string
    // work. Caching them keeps the per-frame dots/labels loop free of geometry and
    // string costs (the main source of drag lag).
    featureMetaRef.current = geoCache.features.map(feature => {
      const fname = grExtractName(feature.properties);
      const lowerFname = fname.toLowerCase();
      const [offX, offY] = grGetCentroidOffset(grNormStr(fname));
      return {
        fname, lowerFname, centroid: pathFn.centroid(feature), offX, offY,
        isAthos: lowerFname.includes("athos") || lowerFname.includes("agion oros") || lowerFname.includes("agio oros"),
        isAttica: lowerFname.includes("athens") || lowerFname.includes("attica") || lowerFname.includes("piraeus") || lowerFname.includes("pireus"),
      };
    });
    setGeoReady(true);
    return () => { if (zoomRaf) cancelAnimationFrame(zoomRaf); };
  }, [geoCache, hideControls, isInset]);

  useEffect(() => {
    if (!geoReady || !svgRef.current) return;
    const _meta = featureMetaRef.current || [];
    d3.select(svgRef.current).selectAll("path.prefecture")
      .attr("fill", (d, i) => getFeatureFill((_meta[i] && _meta[i].fname) || grExtractName(d.properties), viewMode, featureSeatData, partiesMap, minVal, maxVal, districtResults));
  }, [geoReady, featureSeatData, partiesMap, viewMode, minVal, maxVal, districtResults]);

  useEffect(() => {
    if (!geoReady || !svgRef.current) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    debounceRef.current = setTimeout(() => {
      const svg = d3.select(svgRef.current);
      const pathFn = pathFnRef.current;
      if (!pathFn) return;
      if (!showDots && !showLabels) return; // nothing visible — skip the heavy build entirely
      const dotsLayer = svg.select("g.dots-layer");
      const labelsLayer = svg.select("g.labels-layer");
      const seatData = seatDataRef.current;
      const dotData = [];
      const labelData = [];

      (featureMetaRef.current || []).forEach(m => {
        const fname = m.fname;
        const lowerFname = m.lowerFname;
        if (m.isAthos) return;

        // Visual De-clutter: Prevent Attica overlay nodes from pushing localized dots/labels ON THE MAIN MAP
        if (!isInset && m.isAttica) return;
        
        const entry = seatData?.get(fname);
        if (!entry || !entry.dots.length) return;

        const centroid = m.centroid;
        if (!centroid || isNaN(centroid[0]) || isNaN(centroid[1])) return;

        const { dots } = entry;
        let offX = m.offX, offY = m.offY;

        let DOT_R = 2.8, GAP = 1.0, COLS = Math.min(dots.length, 5);
        let labelSize = null; // per-feature override (null = use default below)

        if (isInset) {
          // Athens-metro inset: bigger, readable dots + labels (was DOT_R 1.5 / 3.5px)
          DOT_R = 2.6; GAP = 0.9; COLS = Math.min(dots.length, 8);
          if (dots.length > 30) { DOT_R = 2.2; GAP = 0.7; COLS = 10; } // keep the densest blobs in check
          labelSize = "9px";

          // --- Attica wings: identify by district id (robust vs polygon name) ---
          const distIds = entry.districts.map(d => d.id);
          if (distIds.includes("east_attica")) {
            offX += 60;            // push RIGHT, out of the central cluster
            offY += 6;
            labelSize = "14px";    // MUCH larger
          } else if (distIds.includes("west_attica")) {
            offX -= 60;            // push LEFT
            offY += 6;
            labelSize = "12px";    // bigger
          }
        } else if (dots.length > 25) {
          DOT_R = 1.5; GAP = 0.5; COLS = 10;
        } else if (dots.length > 12) {
          DOT_R = 2.0; GAP = 0.6; COLS = 8;
        } else if (dots.length > 6) {
          COLS = 6;
        }

        if (!isInset && lowerFname.includes("thessaloniki b")) {
          offX += 20; 
          offY -= 2;  
          DOT_R = 1.6; 
          GAP = 0.4;
        }

        const STEP = DOT_R * 2 + GAP;
        const ROWS = Math.ceil(dots.length / COLS);
        const gridW = COLS * STEP - GAP;
        const gridH = ROWS * STEP - GAP;
        const cx = centroid[0] + offX, cy = centroid[1] + offY;
        const startX = cx - gridW / 2 + DOT_R;
        const startY = cy - gridH / 2 + DOT_R;
        const isBig = !isInset && (dots.length > 12 || lowerFname.includes("thessaloniki b"));

        const finalLabelSize = labelSize || (isBig ? "3.5px" : "5px");
        const labelGap = parseFloat(finalLabelSize) + 2; // clearance scales with font size

        labelData.push({ key: `${fname}__top`, x: cx, y: cy - gridH / 2 - labelGap, text: (entry.districts.length > 1 ? fname : entry.districts[0].name).toUpperCase().slice(0, isInset ? 14 : 10), size: finalLabelSize, ff: "var(--ff-body)", ls: "0.4", fill: "var(--text-bright)" });
        dots.forEach((dot, i) => dotData.push({ key: `${fname}__${i}`, cx: startX + (i % COLS) * STEP, cy: startY + Math.floor(i / COLS) * STEP, r: DOT_R, color: dot.color }));
      });

      dotsLayer.selectAll("circle.seat-dot").data(dotData, d => d.key).join(
        enter => enter.append("circle").attr("class", "seat-dot").attr("cx", d => d.cx).attr("cy", d => d.cy).attr("r", d => d.r).attr("fill", d => d.color).attr("opacity", 0).attr("pointer-events", "none").call(el => el.transition().duration(160).ease(d3.easeCubicOut).attr("opacity", 0.92)),
        update => update.attr("cx", d => d.cx).attr("cy", d => d.cy).attr("r", d => d.r).attr("fill", d => d.color).attr("opacity", 0.92),
        exit => exit.call(el => el.transition().duration(100).attr("opacity", 0).remove())
      );
      labelsLayer.selectAll("text.seat-label").data(labelData, d => d.key).join(
        enter => enter.append("text").attr("class", "seat-label").attr("x", d => d.x).attr("y", d => d.y).attr("text-anchor", "middle").attr("font-size", d => d.size).attr("font-family", d => d.ff).attr("letter-spacing", d => d.ls).attr("fill", d => d.fill).attr("pointer-events", "none").attr("font-weight", 600).text(d => d.text),
        update => update.attr("x", d => d.x).attr("y", d => d.y).attr("font-size", d => d.size).attr("fill", d => d.fill).text(d => d.text),
        exit => exit.remove()
      );
    }, 80);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [geoReady, featureSeatData, isInset, showDots, showLabels]);

  useEffect(() => {
    if (!geoReady || !svgRef.current) return;
    const sv = d3.select(svgRef.current);
    sv.select("g.dots-layer").style("display", showDots && viewMode === "swingometer" ? null : "none");
    sv.select("g.labels-layer").style("display", showLabels ? null : "none");
  }, [showDots, showLabels, geoReady, viewMode]);

  const listDots = useMemo(() => {
    if (!electionResult?.results?.length) return [];
    const dots = [];
    const sorted = [...electionResult.results].sort((a, b) => (partiesMap.get(a.id)?.ideology || 0) - (partiesMap.get(b.id)?.ideology || 0));
    
    sorted.forEach(m => {
      const listSeatCount = m.listSeats || 0;
      for (let k = 0; k < listSeatCount; k++) dots.push(m.id);
    });
    
    return dots;
  }, [electionResult, partiesMap]);

  return (
    <div style={isInset ? { position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column" } : { ...S.card, padding: 12, position: "relative", height: "100%", minHeight: isMobile ? 400 : 600, display: "flex", flexDirection: "column" }}>
      {!isInset && !hideControls && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={S.label}>Electoral Map</span>
          
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <select 
                value={viewMode} 
                onChange={(e) => setViewMode(e.target.value)}
                style={{ 
                  background: "var(--bg-mid, #1e293b)", 
                  color: "var(--text-main, #f8fafc)", 
                  border: "1px solid var(--border, #334155)", 
                  borderRadius: 4, 
                  padding: "4px 8px", 
                  fontSize: 10, 
                  fontFamily: "var(--ff-body)", 
                  fontWeight: 600,
                  cursor: "pointer",
                  outline: "none"
                }}
              >
                <option value="swingometer">🗳️ Swingometer</option>
                <option value="margin_of_victory">📊 Margin of Victory</option>
                <option value="runner_up">🥈 Runner-Up Party</option>
                <option value="age_over_65_pct">👴 Age 65+ (%)</option>
                <option value="tertiary_edu_pct">🎓 Tertiary Edu (%)</option>
                <option value="unemployment_rate">💼 Unemployment (%)</option>
                <option value="foreign_citizens_pct">🌐 Foreign Citizens (%)</option>
                <option value="urbanization_pct">🏙️ Urbanization (%)</option>
                <option value="primary_economy">🚜 Primary Economy</option>
                <option value="population">👥 Population (2021)</option>
                <option value="municipality">🏛️ Municipality Breakdown</option>
              </select>
            </div>

            {viewMode === "swingometer" && (
              <div style={{ display: "flex", alignItems: "center", background: "var(--btn-bg)", padding: "4px 8px", borderRadius: 4, border: "1px solid var(--border)", gap: 6 }}>
                <span style={{ fontSize: 8, color: "var(--text-muted)", fontFamily: "var(--ff-body)", letterSpacing: 1.2 }}>LIST ({GR.LIST_SEATS})</span>
                <div style={{ display: "flex", gap: 2 }}>
                  {listDots.map((pid, i) => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: partiesMap.get(pid)?.color || "var(--text-muted)" }} />)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ flexGrow: 1, position: "relative", overflow: "hidden", borderRadius: isInset ? 4 : 6, background: isInset ? "transparent" : "var(--map-bg)", border: isInset ? "none" : "1px solid var(--border)" }}>
        <svg ref={svgRef} viewBox={isInset ? "0 0 600 600" : "0 0 600 700"} style={{ width: "100%", height: "100%", display: "block" }} />

        {!isInset && viewMode === "municipality" && (
          <div style={{ position: "absolute", inset: 0, background: "var(--map-bg)", zIndex: 20 }}>
            <svg ref={muniSvgRef} viewBox="0 0 600 700" style={{ width: "100%", height: "100%", display: "block" }} />
            {(muniLoading || (!muniGeo && !muniError)) && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-dim)", fontFamily: "var(--ff-body)", fontSize: 12, letterSpacing: 1 }}>Loading municipalities…</div>
            )}
            {muniError && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#F87171", fontFamily: "var(--ff-body)", fontSize: 12, textAlign: "center", padding: 20 }}>Could not load municipality map ({muniError}). Ensure GreeceMun.json is in /public.</div>
            )}
            {muniGeo && (
              <div style={{ position: "absolute", top: 10, left: 12, zIndex: 21, pointerEvents: "none", background: "var(--bg-mid)", border: "1px solid var(--border)", borderRadius: 4, padding: "4px 8px", fontFamily: "var(--ff-body)" }}>
                <span style={{ fontSize: 8, fontWeight: 700, color: "var(--text-dim)", letterSpacing: 0.6, textTransform: "uppercase" }}>🏛️ Municipality Breakdown · 2023 · swings with sliders</span>
              </div>
            )}
            {muniGeo && !hideControls && (
              <div style={{ position: "absolute", bottom: 12, left: 12, zIndex: 21 }}>
                <button className="icon-btn" onClick={muniResetZoom} style={{ ...S.ghostBtn, background: "var(--bg-mid)" }}><IconZoomReset size={10} /> Reset</button>
              </div>
            )}
          </div>
        )}
      </div>

      {!isInset && viewMode !== "swingometer" && viewMode !== "municipality" && (
        <div style={{ 
          position: "absolute", 
          bottom: hideControls ? 16 : 90, 
          left: 18, 
          background: "var(--bg-mid, #1e293b)", 
          border: "1px solid var(--border, #334155)", 
          padding: "8px 10px", 
          borderRadius: 6, 
          boxShadow: "0 4px 12px rgba(0,0,0,0.25)", 
          zIndex: 10,
          fontFamily: "var(--ff-body)",
          pointerEvents: "none"
        }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: "var(--text-dim)", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Legend: {{
              margin_of_victory: "Margin of Victory",
              runner_up: "Runner-Up Party",
              age_over_65_pct: "Age 65+ (%)",
              tertiary_edu_pct: "Tertiary Edu (%)",
              unemployment_rate: "Unemployment Rate (%)",
              foreign_citizens_pct: "Foreign Citizens (%)",
              urbanization_pct: "Urbanization (%)",
              primary_economy: "Primary Economy"
            }[viewMode]}
          </div>
          
          {viewMode === "margin_of_victory" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ height: 6, width: 120, borderRadius: 2, background: "linear-gradient(to right, rgba(150,150,150,0.2), rgba(150,150,150,1))" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "var(--text-muted)", ...S.mono }}>
                <span>Tight race</span>
                <span>Safe seat</span>
              </div>
            </div>
          ) : viewMode === "runner_up" ? (
            <div style={{ fontSize: 8, color: "var(--text-muted)", ...S.mono }}>Color = 2nd place party</div>
          ) : viewMode !== "primary_economy" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ 
                height: 6, 
                width: 120, 
                borderRadius: 2, 
                background: "linear-gradient(to right, rgb(245, 240, 225), rgb(153, 27, 27))" 
              }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "var(--text-muted)", ...S.mono }}>
                <span>Min ({minVal.toFixed(1)}%)</span>
                <span>Max ({maxVal.toFixed(1)}%)</span>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: 8, ...S.mono }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: 1, background: "#EAB308" }} />
                <span>Services (Yellow)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: 1, background: "#22C55E" }} />
                <span>Agriculture (Green)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: 1, background: "#3B82F6" }} />
                <span>Industry (Blue)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: 1, background: "#EC4899" }} />
                <span>Tourism (Pink)</span>
              </div>
            </div>
          )}
        </div>
      )}

      {!isInset && !hideControls && viewMode !== "municipality" && (
        <div style={{ position: "absolute", bottom: 50, left: 18, display: "flex", gap: 6 }}>
          <button className="icon-btn" onClick={onToggleLabels} style={{ ...S.ghostBtn, background: "var(--bg-mid)" }}>
            {showLabels ? <IconEyeOff size={10} /> : <IconEye size={10} />} {showLabels ? "Hide names" : "District names"}
          </button>
          <button className="icon-btn" onClick={onToggleDots} style={{ ...S.ghostBtn, background: "var(--bg-mid)" }}>
            {showDots ? <IconEyeOff size={10} /> : <IconEye size={10} />} {showDots ? "Hide seats" : "Show seats"}
          </button>
          <button className="icon-btn" onClick={() => { if (svgRef.current && zoomRef.current) d3.select(svgRef.current).transition().duration(600).ease(d3.easeCubicInOut).call(zoomRef.current.transform, d3.zoomIdentity); }} style={{ ...S.ghostBtn, background: "var(--bg-mid)" }}>
            <IconZoomReset size={10} /> Reset
          </button>
        </div>
      )}

      {!isInset && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 10px", marginTop: 10, justifyContent: "center" }}>
          {parties.map(p => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 7, height: 7, borderRadius: 1, background: p.color }} />
              <span style={{ fontSize: 8, color: "var(--text-main)", fontFamily: "var(--ff-body)" }}>{p.name}</span>
            </div>
          ))}
        </div>
      )}
      
      {(!hideControls || isInset) && <MapTooltipPortal domRef={tooltipRef} setterRef={tooltipSetRef} partiesMap={partiesMap} electionResult={electionResult} viewMode={viewMode} />}

      <div ref={muniTooltipRef} style={{ ...S.tooltip, display: "none", left: -999, top: -999, willChange: "left, top" }}>
        {(() => {
          const d = muniActive && muniFill ? muniFill[muniActive] : null;
          if (!d) return null;
          const rows = Object.keys(d.shares).map(pid => ({ pid, pct: d.shares[pid] || 0, party: partiesMap.get(pid) }))
            .sort((a, b) => b.pct - a.pct).slice(0, 5);
          return (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, gap: 10 }}>
                <span style={{ fontSize: 12, color: "var(--text-title)", fontFamily: "var(--ff-body)", fontWeight: 700 }}>{d.name}{d.imputed ? " ≈" : ""}</span>
                <span style={{ fontSize: 8, color: "var(--text-dim)", ...S.mono, letterSpacing: 0.5, textTransform: "uppercase" }}>{d.constituency}</span>
              </div>
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
                {rows.map(r => (
                  <div key={r.pid} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10, ...S.mono }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: (r.party && r.party.color) || "var(--text-muted)" }} />
                      <span style={{ color: "var(--text-main)" }}>{(r.party && r.party.name) || r.pid}</span>
                    </div>
                    <span style={{ color: "var(--text-main)", fontWeight: 600 }}>{r.pct.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
              {d.imputed && <div style={{ marginTop: 6, fontSize: 8, color: "var(--text-dim)", fontFamily: "var(--ff-body)" }}>≈ estimated from constituency average (no 2023 row)</div>}
            </>
          );
        })()}
      </div>
    </div>
  );
});
