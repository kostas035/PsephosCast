// ─── GreeceRegionsApp.jsx ─────────────────────────────────────────────────────
import {
  useState, useMemo, useCallback, useTransition, useEffect,
} from "react";
import { REGIONS_DB }          from "./data.js";
import { computeMunicipalData } from "./utils.js";
import { S, STYLES, Slider, MeanderBar, EASE_STD, EASE_SPRING } from "./styles.jsx";
import {
  IconArrowLeft, IconSun, IconMoon, IconCamera,
  IconPlus, IconZoomReset, MeanderBar as _MB,
} from "./icons.jsx";
import { PartyRow, SemiCircleChart } from "./components.jsx";
import MapViewer from "./MapViewer.jsx";
import PrivacyModal from "../PrivacyModal";

// ─── MunicipalPanel ───────────────────────────────────────────────────────────
function MunicipalPanel({ sortedMunis, municipalData, config, turnoutDelta }) {
  const [selectedMuni, setSelectedMuni] = useState(sortedMunis[0] || "");

  useEffect(() => {
    if (!sortedMunis.includes(selectedMuni)) setSelectedMuni(sortedMunis[0] || "");
  }, [sortedMunis, selectedMuni]);

  if (!selectedMuni || !municipalData[selectedMuni]) return null;

  const data    = municipalData[selectedMuni];
  const details = config.details[selectedMuni];
  const turnout = Math.min(100, Math.max(0, details.baseTurnout + turnoutDelta));
  const estVotes = ((details.pop * (turnout / 100)) / 1000).toFixed(1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ ...S.card, padding: "12px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={S.label}>Municipality</div>
          <select
            value={selectedMuni}
            onChange={(e) => setSelectedMuni(e.target.value)}
            style={{ ...S.editInput, maxWidth: 185, cursor: "pointer", fontSize: 11 }}
          >
            {sortedMunis.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-title)", fontFamily: "var(--ff-head)", letterSpacing: 0.3, marginBottom: 2 }}>
            {selectedMuni}
          </div>
          <div style={{ fontSize: 10, color: "var(--text-dim)", fontFamily: "var(--ff-mono)" }}>
            ~{estVotes}k est. votes · {turnout.toFixed(1)}% turnout
          </div>
        </div>

        {/* Stacked bar */}
        <div style={{ width: "100%", height: 8, display: "flex", borderRadius: 4, overflow: "hidden", background: "var(--bg-up)", marginBottom: 14 }}>
          {data.map((c) => (
            <div key={c.id} style={{ width: `${c.localPercent}%`, backgroundColor: c.color, transition: `width 0.3s ${EASE_STD}` }} />
          ))}
        </div>

        {/* Candidate rows */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {data.map((c, i) => (
            <div key={c.id} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "7px 0",
              borderBottom: i < data.length - 1 ? "1px solid var(--border)" : "none",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 7, height: 7, borderRadius: "50%", background: c.color,
                  boxShadow: `0 0 5px ${c.color}88`, flexShrink: 0,
                }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-main)", fontFamily: "var(--ff-body)", lineHeight: 1.2 }}>
                    {c.name}
                  </div>
                  {c.party && (
                    <div style={{ fontSize: 9, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 0.6, marginTop: 1 }}>
                      {c.party}
                    </div>
                  )}
                </div>
              </div>
              <span style={{ fontSize: 14, fontWeight: 800, fontFamily: "var(--ff-mono)", color: c.color, letterSpacing: -0.5 }}>
                {c.localPercent.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Municipality chip strip */}
      <div className="hide-scroll" style={{ overflowX: "auto", paddingBottom: 4 }}>
        <div style={{ display: "flex", gap: 6, width: "max-content" }}>
          {sortedMunis.map((m) => {
            const isActive = m === selectedMuni;
            const winner   = municipalData[m]?.[0];
            return (
              <button
                key={m}
                onClick={() => setSelectedMuni(m)}
                style={{
                  padding:      "5px 11px",
                  borderRadius: 20,
                  fontSize:     10,
                  fontFamily:   "var(--ff-body)",
                  fontWeight:   isActive ? 700 : 500,
                  letterSpacing: 0.3,
                  cursor:       "pointer",
                  whiteSpace:   "nowrap",
                  background:   isActive ? (winner?.color + "22" || "var(--tab-active)") : "var(--bg-mid)",
                  border:       isActive ? `1.5px solid ${winner?.color || "#60A5FA"}` : "1px solid var(--border)",
                  color:        isActive ? (winner?.color || "#60A5FA") : "var(--text-muted)",
                  transition:   `all 0.15s ${EASE_STD}`,
                }}
              >
                {m}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent, size = "lg" }) {
  return (
    <div style={{
      background:   "var(--bg-mid)",
      border:       `1px solid ${accent}30`,
      borderRadius: 10,
      padding:      "12px 16px",
      position:     "relative",
      overflow:     "hidden",
      flexShrink:   0,
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(to right, transparent, ${accent}, transparent)` }} />
      <div style={{ ...S.label, marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: size === "lg" ? 26 : 18, fontWeight: 900, color: accent,
        lineHeight: 1, fontFamily: "var(--ff-head)", letterSpacing: -0.5 }}>
        {value}
      </div>
      <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4,
        fontFamily: "var(--ff-body)", fontWeight: 500 }}>
        {sub}
      </div>
    </div>
  );
}

// ─── ScenarioPicker ───────────────────────────────────────────────────────────
function ScenarioPicker({ regionId, selectedScenario, onSelect }) {
  const options = useMemo(() => {
    const base  = [{ value: "2023", label: "Oct 2023", note: "Latest election" }];
    const extra = Object.entries(REGIONS_DB[regionId]?.scenarios || {})
      .sort(([a], [b]) => parseInt(b) - parseInt(a))
      .map(([key, val]) => ({ value: key, label: val.name, note: val.note || "" }));
    return [...base, ...extra];
  }, [regionId]);

  return (
    <div style={{ marginTop: 14, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
      <div style={{ ...S.label, marginBottom: 8 }}>Election Baseline</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {options.map((opt) => {
          const isActive = selectedScenario === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onSelect(opt.value)}
              className="icon-btn"
              style={{
                width:        "100%",
                display:      "flex",
                alignItems:   "center",
                gap:          8,
                padding:      "8px 10px",
                borderRadius: 6,
                border:       isActive ? "1.5px solid #60A5FA" : "1px solid var(--border)",
                background:   isActive ? "var(--tab-active)" : "var(--bg-up)",
                cursor:       "pointer",
                textAlign:    "left",
                transition:   `all 0.15s ${EASE_STD}`,
              }}
            >
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: isActive ? "#60A5FA" : "var(--text-muted)",
                flexShrink: 0,
                boxShadow: isActive ? "0 0 6px #60A5FA88" : "none",
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: isActive ? "#60A5FA" : "var(--text-main)", fontFamily: "var(--ff-body)" }}>
                  {opt.label}
                </div>
                {opt.note && (
                  <div style={{ fontSize: 9, color: "var(--text-dim)", marginTop: 1, lineHeight: 1.3, fontFamily: "var(--ff-body)" }}>
                    {opt.note.length > 60 ? opt.note.slice(0, 60) + "…" : opt.note}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function GreeceRegionsApp({ isMobile, theme, setTheme, onBack }) {
  const [regionId,          setRegionId]          = useState("crete");
  const [selectedScenario,  setSelectedScenario]  = useState("2023");
  const [activeTab,         setActiveTab]         = useState("round1");
  const [candidates,        setCandidates]        = useState(() =>
    JSON.parse(JSON.stringify(REGIONS_DB["crete"].candidates))
  );
  const [round2Candidates,  setRound2Candidates]  = useState([]);
  const [turnoutDelta,      setTurnoutDelta]      = useState(0);
  const [accurateRedist,    setAccurateRedist]    = useState(false);
  const [mapCenter,         setMapCenter]         = useState(true);
  const [showHowToUse,      setShowHowToUse]      = useState(false);
  const [showPrivacy,       setShowPrivacy]       = useState(false);
  const [showRegionSel,     setShowRegionSel]     = useState(false);
  const [exportImageUrl,    setExportImageUrl]    = useState(null);
  const [showExportPreview, setShowExportPreview] = useState(false);
  const [isGeneratingExport, setIsGeneratingExport] = useState(false);
  const [isPending,         startTransition]      = useTransition();

  // ── Build active config from scenario ──────────────────────────────────────
  const config = useMemo(() => {
    const base = REGIONS_DB[regionId];
    if (!base) return null;
    const sc   = base.scenarios?.[selectedScenario];
    return sc
      ? { ...base, candidates: sc.candidates, details: sc.details || base.details, scenarioName: sc.name, scenarioNote: sc.note }
      : { ...base, scenarioName: "Oct 2023", scenarioNote: "" };
  }, [regionId, selectedScenario]);

  // ── Apply global styles / theme ────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    let el = document.getElementById("app-styles");
    if (!el) { el = document.createElement("style"); el.id = "app-styles"; document.head.appendChild(el); }
    el.innerHTML = STYLES;
  }, [theme]);

  // ── Reload candidates when scenario / region changes ──────────────────────
  useEffect(() => {
    if (config?.candidates) {
      setCandidates(JSON.parse(JSON.stringify(config.candidates)));
      setTurnoutDelta(0);
      setActiveTab("round1");
    }
  }, [selectedScenario, regionId]);

  const loadRegion = useCallback((id) => {
    const conf = REGIONS_DB[id];
    if (!conf) return;
    setRegionId(id);
    setSelectedScenario("2023");
    setCandidates(JSON.parse(JSON.stringify(conf.candidates)));
    setTurnoutDelta(0);
    setActiveTab("round1");
    setShowRegionSel(false);
  }, []);

  const handleReset = useCallback(() => {
    if (config?.candidates) {
      setCandidates(JSON.parse(JSON.stringify(config.candidates)));
      setTurnoutDelta(0);
      if (activeTab === "round2") setActiveTab("round1");
    }
  }, [config, activeTab]);

  const activeCandidates = activeTab === "round1" ? candidates : round2Candidates;
  const pendingClass     = isPending ? "results-pending" : "results-ready";

  // ── Round 2 redistribution ─────────────────────────────────────────────────
  const recalcRound2 = useCallback((baseCands, isAccurate) => {
    const sorted = [...baseCands].sort((a, b) => b.percent - a.percent);
    const top2   = sorted.slice(0, 2);
    const sum    = top2.reduce((a, b) => a + b.percent, 0);
    let r2       = top2.map((c) => ({ ...c, percent: sum > 0 ? (c.percent / sum) * 100 : 50 }));

    if (isAccurate) {
      let [c1, c2] = top2;
      let s1 = c1.percent, s2 = c2.percent;
      sorted.slice(2).forEach((el) => {
        const v  = el.percent * 0.9;
        const d1 = Math.abs(el.ideology - c1.ideology);
        const d2 = Math.abs(el.ideology - c2.ideology);
        if (d1 === d2) { s1 += v / 2; s2 += v / 2; }
        else if (d1 < d2) s1 += v * 0.78;
        else              s2 += v * 0.78;
      });
      const total = s1 + s2;
      r2 = [{ ...c1, percent: (s1 / total) * 100 }, { ...c2, percent: (s2 / total) * 100 }];
    }
    setRound2Candidates(r2);
  }, []);

  const handleSwitchTab = (tab) => {
    if (tab === "round2") recalcRound2(candidates, accurateRedist);
    setActiveTab(tab);
  };

  // ── Compute results ────────────────────────────────────────────────────────
  const r1Data = useMemo(() => {
    if (!config) return [];
    return computeMunicipalData(config, candidates, turnoutDelta).aggregateData;
  }, [config, candidates, turnoutDelta]);

  const { municipalData, aggregateData } = useMemo(() => {
    if (!config) return { municipalData: {}, aggregateData: [] };
    return computeMunicipalData(config, activeCandidates, turnoutDelta);
  }, [config, activeCandidates, turnoutDelta]);

  const r1Sorted    = useMemo(() => [...r1Data].sort((a, b) => b.percent - a.percent),    [r1Data]);
  const totalSorted = useMemo(() => [...aggregateData].sort((a, b) => b.percent - a.percent), [aggregateData]);

  // ── Seat allocation ────────────────────────────────────────────────────────
  const seatData = useMemo(() => {
    if (!config || !r1Sorted.length || !totalSorted.length) return [];
    const { seatsTotal, bonusSeats, distributableSeats, threshold, winThreshold } = config;

    let winnerId = null;
    let hasBonus = false;

    if (activeTab === "round2") {
      winnerId = totalSorted[0]?.id;
      hasBonus = true;
    } else if (r1Sorted[0]?.percent >= winThreshold) {
      winnerId = r1Sorted[0].id;
      hasBonus = true;
    }

    const eligible = r1Data.filter((c) => c.percent >= threshold);
    const seats    = Object.fromEntries(r1Data.map((c) => [c.id, 0]));

    const processSeats = (pool, quota, count) => {
      if (quota <= 0) return;
      let rem = count;
      pool.forEach((c) => { const s = Math.floor(c.percent / (quota / count)); seats[c.id] = s; rem -= s; });
      if (rem > 0) {
        pool
          .map((c) => ({ id: c.id, r: c.percent % (quota / count) }))
          .sort((a, b) => b.r - a.r).slice(0, rem)
          .forEach(({ id }) => seats[id]++);
      }
    };

    if (!hasBonus) {
      const totalPct = eligible.reduce((a, c) => a + c.percent, 0);
      processSeats(eligible, totalPct, seatsTotal);
    } else {
      const opp     = eligible.filter((c) => c.id !== winnerId);
      const oppTotal = opp.reduce((a, c) => a + c.percent, 0);
      processSeats(opp, oppTotal, distributableSeats);
      seats[winnerId] = (seats[winnerId] || 0) + bonusSeats;
    }

    return r1Data
      .map((c) => ({ ...c, seats: seats[c.id] || 0 }))
      .sort((a, b) => b.seats - a.seats);
  }, [r1Data, r1Sorted, totalSorted, config, activeTab]);

  // ── Vote change handler (proportional rebalancing) ─────────────────────────
  const handleVoteChange = useCallback((id, newPct) => {
    startTransition(() => {
      const isR1  = activeTab === "round1";
      const list  = isR1 ? [...candidates] : [...round2Candidates];
      const idx   = list.findIndex((c) => c.id === id);
      if (idx === -1) return;

      const lockedTotal  = list.reduce((s, p, i) => s + (i !== idx && p.isLocked ? p.percent : 0), 0);
      const unlockedCnt  = list.filter((_, i) => i !== idx && !list[i].isLocked).length;
      if (unlockedCnt === 0) return;

      const finalPct = Math.max(0, Math.min(100 - lockedTotal, newPct));
      const oldPct   = list[idx].percent;
      if (finalPct === oldPct) return;

      const oldRem = 100 - oldPct - lockedTotal;
      const newRem = 100 - finalPct - lockedTotal;

      const newList = list.map((p, i) => {
        if (i === idx)    return { ...p, percent: finalPct };
        if (p.isLocked)   return p;
        if (oldRem <= 0.0001) return { ...p, percent: p.percent + newRem / unlockedCnt };
        return { ...p, percent: p.percent * (newRem / oldRem) };
      });

      if (isR1) setCandidates(newList);
      else      setRound2Candidates(newList);
    });
  }, [candidates, round2Candidates, activeTab]);

  const handleToggleLock   = useCallback((id) => {
    const setter = activeTab === "round1" ? setCandidates : setRound2Candidates;
    setter((prev) => prev.map((p) => p.id === id ? { ...p, isLocked: !p.isLocked } : p));
  }, [activeTab]);

  const handlePartyEdit    = useCallback((id, field, val) => {
    if (activeTab === "round1")
      setCandidates((prev) => prev.map((p) => p.id === id ? { ...p, [field]: val } : p));
  }, [activeTab]);

  const addCandidate       = useCallback(() => {
    setCandidates((prev) => [...prev, {
      id: Math.random().toString(36).slice(2, 11),
      name: "New List", party: "Ind.", color: "#94a3b8",
      percent: 0, ideology: 0, isLocked: false,
    }]);
  }, []);

  const removeCandidate    = useCallback((id) => {
    setCandidates((prev) => {
      const target = prev.find((c) => c.id === id);
      const arr    = prev.filter((c) => c.id !== id);
      if (arr.length > 0 && target?.percent > 0) {
        const sum = arr.reduce((a, b) => a + b.percent, 0);
        return arr.map((c) => ({ ...c, percent: c.percent + target.percent * (c.percent / (sum || 1)) }));
      }
      return arr;
    });
  }, []);

  // ── Export ─────────────────────────────────────────────────────────────────
  const handleGeneratePreview = async () => {
    setIsGeneratingExport(true);
    const el = document.getElementById("export-container");
    if (!el) { setIsGeneratingExport(false); return; }
    el.style.display = "flex";
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(el, {
        backgroundColor: theme === "dark" ? "#0b1120" : "#f8fafc",
        scale: 2, useCORS: true, logging: false,
      });
      setExportImageUrl(canvas.toDataURL("image/png"));
      setShowExportPreview(true);
    } catch {
      alert("Export failed. Ensure html2canvas is installed.");
    } finally {
      el.style.display = "none";
      setIsGeneratingExport(false);
    }
  };

  const handleDownloadExport = () => {
    if (!exportImageUrl) return;
    const a = document.createElement("a");
    a.href     = exportImageUrl;
    a.download = `${config.id}_${selectedScenario}_simulation.png`;
    a.click();
    setShowExportPreview(false);
  };

  if (!config) return (
    <div style={{ padding: 60, color: "var(--text-dim)", textAlign: "center", fontFamily: "var(--ff-body)" }}>
      Loading region data…
    </div>
  );

  const winner      = activeTab === "round1"
    ? r1Sorted.find((c) => c.percent >= config.winThreshold) : null;
  const sortedMunis = Object.keys(municipalData).sort(
    (a, b) => (config.details[b]?.pop || 0) - (config.details[a]?.pop || 0)
  );
  const totalPct = activeCandidates.reduce((s, p) => s + p.percent, 0);
  const isNonBaseline = selectedScenario !== "2023";

  // ── Top stat cards ─────────────────────────────────────────────────────────
  const topCards = totalSorted.length > 0 ? [
    {
      label:  activeTab === "round1" ? "Leading List" : "Runoff Winner",
      value:  `${totalSorted[0].percent.toFixed(1)}%`,
      sub:    totalSorted[0].name,
      accent: totalSorted[0].color,
    },
    {
      label:  "Council Seats",
      value:  seatData.find((s) => s.id === totalSorted[0].id)?.seats || 0,
      sub:    bonusActive() ? `incl. ${config.bonusSeats} bonus` : "proportional dist.",
      accent: totalSorted[0].color,
    },
    {
      label:  "Avg. Turnout",
      value:  `${Math.max(0, config.baseTurnout + turnoutDelta).toFixed(1)}%`,
      sub:    `${turnoutDelta > 0 ? "+" : ""}${turnoutDelta.toFixed(1)}% from baseline`,
      accent: "#60A5FA",
    },
    {
      label:  "Round 1 Result",
      value:  (winner || activeTab === "round2") ? "WIN" : "RUNOFF",
      sub:    winner
        ? `cleared ${config.winThreshold}% threshold`
        : activeTab === "round2"
          ? "won in runoff"
          : `below ${config.winThreshold}% — use Runoff tab`,
      accent: (winner || activeTab === "round2") ? "#34D399" : "#F59E0B",
    },
  ] : [];

  function bonusActive() {
    return (activeTab === "round2") || !!(winner);
  }

  // ── Column definitions ─────────────────────────────────────────────────────
  const ChartColumn = (
    <div className={pendingClass} style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
      {/* Council Projection */}
      <div style={S.card}>
        <div style={{ ...S.label, marginBottom: 12 }}>Council Projection</div>
        <SemiCircleChart
          data={seatData}
          totalSeats={config.seatsTotal}
          majorityReq={Math.floor(config.seatsTotal / 2) + 1}
        />
      </div>

      {/* Seat Allocation Table */}
      <div style={S.card}>
        <div style={{ ...S.label, marginBottom: 10 }}>Seat Allocation</div>
        <div style={{ display: "flex", height: 7, width: "100%", borderRadius: 4, overflow: "hidden", marginBottom: 14, background: "var(--bg-up)" }}>
          {seatData.map((c) => c.seats > 0 && (
            <div key={c.id} style={{
              width:      `${(c.seats / config.seatsTotal) * 100}%`,
              background: c.color,
              transition: `width 0.3s ${EASE_STD}`,
            }} />
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {seatData.filter((c) => c.seats > 0).map((c) => (
            <div key={c.id} style={{
              display:        "flex",
              justifyContent: "space-between",
              alignItems:     "center",
              padding:        "7px 8px",
              borderRadius:   6,
              background:     "var(--bg-up)",
              border:         "1px solid var(--border)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%", background: c.color,
                  boxShadow: `0 0 6px ${c.color}66`,
                }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-main)", fontFamily: "var(--ff-body)" }}>
                    {c.name}
                  </div>
                  <div style={{ fontSize: 9, color: "var(--text-dim)", fontFamily: "var(--ff-mono)", marginTop: 1 }}>
                    {c.percent.toFixed(1)}%
                    {c.votes ? ` · ${Math.round(c.votes).toLocaleString()} votes` : ""}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                <span style={{ fontSize: 20, fontWeight: 900, fontFamily: "var(--ff-mono)", color: c.color, lineHeight: 1, letterSpacing: -1 }}>
                  {c.seats}
                </span>
                <span style={{ fontSize: 8, color: "var(--text-dim)", fontFamily: "var(--ff-body)" }}>
                  seats
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bonus explanation */}
        {bonusActive() && (
          <div style={{
            marginTop: 10, padding: "8px 10px", borderRadius: 6,
            background: "var(--bonus-bg)", border: "1px solid var(--bonus-border)",
          }}>
            <div style={{ fontSize: 9, color: "var(--text-main)", fontFamily: "var(--ff-body)", lineHeight: 1.5 }}>
              <strong>Bonus Seat Rule:</strong> Winner receives {config.bonusSeats} seats automatically (3/5 of {config.seatsTotal}).
              Remaining {config.distributableSeats} distributed by Hare quota among lists ≥{config.threshold}%.
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const MapCol = (
    <div className={pendingClass} style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
      <MapViewer
        config={config}
        municipalData={municipalData}
        turnoutDelta={turnoutDelta}
        resetKey={regionId}
      />
      <MunicipalPanel
        sortedMunis={sortedMunis}
        municipalData={municipalData}
        config={config}
        turnoutDelta={turnoutDelta}
      />
    </div>
  );

  return (
    <div style={{
      width: "100%", minHeight: "100vh",
      padding: isMobile ? "10px" : "16px 24px",
      overflowX: "hidden", margin: 0,
      backgroundColor: "var(--bg-up)", color: "var(--text-main)",
    }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 16 }}>
        <div style={{
          display: "flex", alignItems: "flex-start",
          justifyContent: "space-between", marginBottom: 10,
          flexWrap: "wrap", gap: 10,
        }}>
          {/* Left: nav + title */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <button className="icon-btn" onClick={onBack}
                style={{ ...S.ghostBtn, padding: "5px 9px", justifyContent: "flex-start" }}>
                <IconArrowLeft size={12} /> Back
              </button>
              <button className="icon-btn" onClick={() => setMapCenter((p) => !p)}
                style={{ ...S.ghostBtn, padding: "5px 9px", justifyContent: "flex-start" }}>
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>
                </svg> Layout
              </button>
              <button className="icon-btn" onClick={() => setShowHowToUse(true)}
                style={{ ...S.ghostBtn, padding: "5px 9px", justifyContent: "flex-start" }}>
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg> Help
              </button>
              <button className="icon-btn" onClick={() => setShowPrivacy(true)}
                style={{ ...S.ghostBtn, padding: "5px 9px", justifyContent: "flex-start" }}>
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg> Privacy
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: isMobile ? 24 : 30 }}>{config.icon || "🏛️"}</span>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <div style={{
                    fontSize: isMobile ? 17 : 22, fontWeight: 900,
                    fontFamily: "var(--ff-head)", letterSpacing: 2,
                    color: "var(--text-title)", lineHeight: 1,
                    textTransform: "uppercase",
                  }}>
                    {config.name}
                  </div>
                  {isNonBaseline && (
                    <span className="scenario-badge" style={{ color: "#F59E0B", borderColor: "#F59E0B55", background: "#F59E0B11" }}>
                      {config.scenarioName}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: 2.5, marginTop: 4, textTransform: "uppercase", fontFamily: "var(--ff-body)", fontWeight: 600 }}>
                  Regional Council · {config.seatsTotal} seats · {config.winThreshold}% win threshold
                </div>
              </div>
            </div>
          </div>

          {/* Centre: Change Region pill */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexGrow: 1, padding: "0 8px" }}>
            <button
              onClick={() => setShowRegionSel(true)}
              style={{
                background: "var(--bg-mid)", border: "1px solid var(--border)",
                borderRadius: 24, padding: "7px 18px",
                color: "var(--text-title)", fontFamily: "var(--ff-body)",
                fontSize: 13, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 7,
                transition: `all 0.15s ${EASE_STD}`,
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <span>🗺️</span> Change Region
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
          </div>

          {/* Right: status + controls */}
          <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: isPending ? "#F59E0B" : "#22C55E",
                animation: isPending ? "pulseAmber 2s infinite" : "pulse 2s infinite",
              }} />
              <span style={{ fontSize: 8, color: "var(--text-dim)", fontFamily: "var(--ff-mono)", letterSpacing: 1 }}>
                {isPending ? "COMPUTING…" : "LIVE SIMULATION"}
              </span>
            </div>
            <div style={{ display: "flex", gap: 5 }}>
              <button className="icon-btn" onClick={handleGeneratePreview}
                style={{ ...S.ghostBtn, opacity: isGeneratingExport ? 0.6 : 1, cursor: isGeneratingExport ? "wait" : "pointer" }}
                disabled={isGeneratingExport}
              >
                <IconCamera size={10} />
                {isGeneratingExport ? "…" : "Export"}
              </button>
              <button className="icon-btn"
                onClick={() => setTheme((t) => t === "dark" ? "light" : "dark")}
                style={S.ghostBtn}
              >
                {theme === "dark" ? <IconSun size={10} /> : <IconMoon size={10} />}
                {theme === "dark" ? "Light" : "Dark"}
              </button>
            </div>
          </div>
        </div>
        <MeanderBar />
      </div>

      {/* ── Stat cards ────────────────────────────────────────────────────────── */}
      {topCards.length > 0 && (
        <div className={pendingClass} style={{
          display: "grid",
          gridTemplateColumns: `repeat(${isMobile ? 2 : 4}, 1fr)`,
          gap: 10, marginBottom: 16,
        }}>
          {topCards.map((c, i) => <StatCard key={i} {...c} />)}
        </div>
      )}

      {/* ── Three-column body ─────────────────────────────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "minmax(0,1fr)" : "290px minmax(0,1.5fr) minmax(0,1.5fr)",
        gap: 14, width: "100%", alignItems: "start",
      }}>

        {/* ── Left panel: controls ─────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Round tabs + settings */}
          <div style={S.card}>
            <div style={{ ...S.label, marginBottom: 10 }}>Election Settings</div>

            {/* Round tabs */}
            <div style={{ display: "flex", gap: 4, marginBottom: 12, padding: 3, background: "var(--bg-up)", borderRadius: 6, border: "1px solid var(--border)" }}>
              {["round1", "round2"].map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => handleSwitchTab(tab)}
                    style={{
                      flex: 1, padding: "6px 0",
                      fontSize: 10, fontFamily: "var(--ff-body)", fontWeight: 700,
                      letterSpacing: 1.2, borderRadius: 4,
                      background:  isActive ? "var(--tab-active)" : "transparent",
                      color:       isActive ? "#60A5FA" : "var(--text-dim)",
                      border:      isActive ? "1px solid #60A5FA44" : "1px solid transparent",
                      textTransform: "uppercase", cursor: "pointer",
                      transition:  `all 0.15s ${EASE_STD}`,
                    }}
                  >
                    {tab === "round1" ? "1st Round" : "Runoff"}
                  </button>
                );
              })}
            </div>

            <Slider
              label="Turnout Shift"
              value={turnoutDelta} min={-20} max={20} step={0.5}
              onChange={setTurnoutDelta} color="#60A5FA" isPct
            />

            {/* Ideology redistribution toggle */}
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, cursor: "pointer" }}>
              <div style={{
                position: "relative", width: 30, height: 16,
                background: accurateRedist ? "#60A5FA" : "var(--bg-up)",
                border: "1px solid var(--border)", borderRadius: 10,
                transition: `background 0.2s ${EASE_STD}`,
              }}>
                <div style={{
                  position: "absolute", top: 1,
                  left: accurateRedist ? 15 : 1,
                  width: 12, height: 12,
                  background: "#fff", borderRadius: "50%",
                  transition: `left 0.2s ${EASE_SPRING}`,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                }} />
              </div>
              <input
                type="checkbox" style={{ display: "none" }}
                checked={accurateRedist}
                onChange={(e) => {
                  setAccurateRedist(e.target.checked);
                  if (activeTab === "round2") recalcRound2(candidates, e.target.checked);
                }}
              />
              <span style={{ fontSize: 9, color: "var(--text-muted)", fontFamily: "var(--ff-body)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2 }}>
                Ideology Redistribution
              </span>
            </label>

            {/* Scenario picker */}
            <ScenarioPicker
              regionId={regionId}
              selectedScenario={selectedScenario}
              onSelect={setSelectedScenario}
            />
          </div>

          {/* Candidate sliders */}
          <div style={S.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={S.label}>Vote Shares</div>
              <div style={{ display: "flex", gap: 5 }}>
                <button onClick={handleReset} className="icon-btn" style={{ ...S.ghostBtn, padding: "3px 7px" }}>
                  <IconZoomReset size={9} /> Reset
                </button>
                {activeTab === "round1" && (
                  <button onClick={addCandidate} className="icon-btn" style={{ ...S.ghostBtn, padding: "3px 7px" }}>
                    <IconPlus size={9} /> Add
                  </button>
                )}
              </div>
            </div>

            {/* Total % indicator */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: 10, padding: "5px 8px",
              background: "var(--bg-up)", borderRadius: 5, border: "1px solid var(--border)",
            }}>
              <span style={{ fontSize: 9, color: "var(--text-dim)", fontFamily: "var(--ff-body)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
                Total
              </span>
              <span style={{
                fontSize: 11, fontWeight: 700, fontFamily: "var(--ff-mono)",
                color: Math.abs(totalPct - 100) < 0.2 ? "#34D399" : "#F87171",
              }}>
                {totalPct.toFixed(1)}%
              </span>
            </div>

            {activeCandidates.map((c) => (
              <PartyRow
                key={c.id} party={c}
                isEditingAllowed={activeTab === "round1"}
                onPctChange={handleVoteChange}
                onToggleLock={handleToggleLock}
                onEdit={handlePartyEdit}
                onDelete={removeCandidate}
              />
            ))}
          </div>
        </div>

        {/* ── Centre / Right columns (swappable) ────────────────────────────── */}
        {mapCenter ? MapCol : ChartColumn}
        {mapCenter ? ChartColumn : MapCol}
      </div>

      {/* ── Region Selector Modal ─────────────────────────────────────────────── */}
      {showRegionSel && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.7)", display: "flex",
          alignItems: "center", justifyContent: "center",
          padding: 24, backdropFilter: "blur(6px)",
        }}>
          <div style={{
            padding: 24, width: "100%", maxWidth: 560,
            background: "var(--bg-base)", borderRadius: 14,
            border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 26 }}>🗺️</span>
                <h3 style={{ margin: 0, fontFamily: "var(--ff-head)", fontSize: 20, color: "var(--text-title)", fontWeight: 800 }}>
                  Select a Region
                </h3>
              </div>
              <button className="icon-btn" onClick={() => setShowRegionSel(false)}
                style={{ ...S.ghostBtn, border: "none", background: "transparent", fontSize: 16 }}>✕</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
              {Object.values(REGIONS_DB).map((r) => (
                <button
                  key={r.id}
                  onClick={() => r.available && loadRegion(r.id)}
                  className="icon-btn"
                  style={{
                    ...S.card, textAlign: "left",
                    cursor:    r.available ? "pointer" : "not-allowed",
                    opacity:   r.available ? 1 : 0.45,
                    border:    regionId === r.id ? `2px solid ${r.color || "#60A5FA"}` : "1px solid var(--border)",
                    transition: "all 0.18s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 8,
                      background: `${r.color || "#60A5FA"}18`,
                      color: r.color || "#60A5FA",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
                    }}>
                      {r.icon || "🏛️"}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-title)", fontFamily: "var(--ff-head)" }}>
                        {r.name}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 2 }}>
                        {r.available ? `${r.munis?.length || 0} Municipalities` : "Coming Soon"}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Privacy Policy Modal ─────────────────────────────────────────────── */}
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}

      {/* ── How to Use Modal ─────────────────────────────────────────────────── */}
      {showHowToUse && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.7)", display: "flex",
          alignItems: "center", justifyContent: "center",
          padding: 24, backdropFilter: "blur(6px)",
        }}>
          <div style={{
            padding: 24, width: "100%", maxWidth: 480,
            background: "var(--bg-base)", borderRadius: 14,
            border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontFamily: "var(--ff-head)", fontSize: 20, color: "var(--text-title)", fontWeight: 800 }}>
                How to Use
              </h3>
              <button className="icon-btn" onClick={() => setShowHowToUse(false)}
                style={{ ...S.ghostBtn, border: "none", background: "transparent", fontSize: 16 }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: 13, lineHeight: 1.6, color: "var(--text-main)", fontFamily: "var(--ff-body)" }}>
              <p style={{ margin: 0 }}><strong>Adjust Votes:</strong> Drag the sliders to change a list's share. Other unlisted candidates automatically rebalance proportionally (unless locked).</p>
              <p style={{ margin: 0 }}><strong>Simulate a Runoff:</strong> Switch to the <em>Runoff</em> tab. Enable Ideology Redistribution to model where eliminated voters flow based on left–right proximity.</p>
              <p style={{ margin: 0 }}><strong>Explore History:</strong> Switch the baseline scenario to replay 2019 or 2014. The 2014 scenario starts below 50% — use the Runoff tab to complete it.</p>
              <p style={{ margin: 0 }}><strong>Map:</strong> Hover over municipalities to see local vote shares. The map dynamically updates as you move sliders.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Export Preview Modal ───────────────────────────────────────────────── */}
      {showExportPreview && exportImageUrl && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.8)", display: "flex",
          flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: 24, backdropFilter: "blur(6px)",
        }}>
          <div style={{
            padding: 20, width: "100%", maxWidth: 1000, maxHeight: "92vh",
            display: "flex", flexDirection: "column", gap: 14,
            background: "var(--bg-base)", borderRadius: 14,
            border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontFamily: "var(--ff-head)", fontSize: 18, color: "var(--text-title)", fontWeight: 800 }}>
                Export Preview
              </h3>
              <button className="icon-btn" onClick={() => setShowExportPreview(false)}
                style={{ ...S.ghostBtn, border: "none", background: "transparent" }}>
                ✕ Close
              </button>
            </div>
            <div style={{ flex: 1, overflow: "hidden", border: "1px solid var(--border)", borderRadius: 8, background: "var(--bg-up)", display: "flex", justifyContent: "center", alignItems: "center", minHeight: 0 }}>
              <img src={exportImageUrl} alt="Export" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 6 }} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button className="icon-btn" onClick={() => setShowExportPreview(false)} style={{ ...S.ghostBtn, padding: "8px 16px" }}>
                Cancel
              </button>
              <button onClick={handleDownloadExport} style={{
                background: "#2563EB", color: "#fff", border: "none", borderRadius: 6,
                padding: "8px 20px", cursor: "pointer", fontFamily: "var(--ff-body)",
                fontWeight: 700, fontSize: 13,
              }}>
                Download PNG
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Hidden export target ──────────────────────────────────────────────── */}
      <div id="export-container" style={{
        position: "fixed", top: -9999, left: -9999, width: 1200, height: 750,
        background: "var(--bg-base)", display: "none", padding: 24,
        gap: 24, boxSizing: "border-box", zIndex: -100,
      }}>
        <div style={{ flex: 1.5, height: "100%", display: "flex", flexDirection: "column" }}>
          <MapViewer config={config} municipalData={municipalData} turnoutDelta={turnoutDelta} resetKey={regionId} />
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
          <SemiCircleChart data={seatData} totalSeats={config.seatsTotal} majorityReq={Math.floor(config.seatsTotal / 2) + 1} />
        </div>
      </div>
    </div>
  );
}
