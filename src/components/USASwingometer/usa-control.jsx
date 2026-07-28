// usa-control.jsx — left-hand swing-control panel: national vote-share
// sliders for GOP/DEM/Other plus the six demographic-swing sliders. Simpler
// than cyprus-control.jsx's per-party editor since the two-line, three-bucket
// structure (gop/dem/other) is fixed by the real-world electoral system —
// there's no "add/delete/reorder a candidate" concept here.
import { useState, useMemo, useEffect, useRef, memo, useCallback } from "react";
import { USA_DEM_CONTROLS, USA_DEM_RESET, USA_SCENARIO_LABELS } from "./usa-data.js";
import { S, EASE_STD, IconColumns, IconPeople, IconLock, Slider } from "./usa-ui.jsx";

const USAPartyControlItem = memo(function USAPartyControlItem({ party, onPctChange, onToggleLock }) {
  const [localPct, setLocalPct] = useState(party.userPercentage);
  const debounced = useRef(null);

  useEffect(() => { setLocalPct(party.userPercentage); }, [party.userPercentage]);
  useEffect(() => () => { if (debounced.current) clearTimeout(debounced.current); }, []);

  const handleChange = e => {
    const val = parseFloat(e.target.value);
    setLocalPct(val);
    if (debounced.current) clearTimeout(debounced.current);
    debounced.current = setTimeout(() => onPctChange(party.id, val), 150);
  };

  const pctStyle = Math.min(100, Math.max(0, localPct));

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 3, height: 16, borderRadius: 2, background: party.color, flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: "var(--text-main)", fontFamily: "var(--ff-body)", fontWeight: 600 }}>{party.label}</span>
          <button className="icon-btn" onClick={() => onToggleLock(party.id)} title={party.isLocked ? "Unlock" : "Lock"}
            style={{ background: "none", border: "none", color: party.isLocked ? "#F59E0B" : "var(--text-dim)", cursor: "pointer", padding: "2px 3px", display: "flex", alignItems: "center", borderRadius: 3 }}>
            <IconLock locked={party.isLocked} size={11} />
          </button>
        </div>
        <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--ff-mono)" }}>{localPct.toFixed(1)}%</span>
      </div>
      <input type="range" min={0} max={100} step={0.1} value={localPct} disabled={party.isLocked} onChange={handleChange}
        style={{ width: "100%", height: 5, background: `linear-gradient(to right,${party.color} 0%,${party.color} ${pctStyle}%,var(--border) ${pctStyle}%)`, borderRadius: 4, outline: "none", cursor: party.isLocked ? "not-allowed" : "pointer", opacity: party.isLocked ? 0.5 : 1 }} />
    </div>
  );
});

export const USAControlPanel = memo(function USAControlPanel({
  candidates, onPctChange, onToggleLock, demSliders, setDemSliders, scenarioYear, onScenarioChange, resetAll,
}) {
  const [tab, setTab] = useState("candidates");
  const totalPct = useMemo(() => candidates.reduce((s, c) => s + c.userPercentage, 0), [candidates]);
  const resetDemo = useCallback(() => setDemSliders({ ...USA_DEM_RESET }), [setDemSliders]);

  const TabBtn = useCallback(({ id, label, icon }) => (
    <button className="tab-btn icon-btn" onClick={() => setTab(id)}
      style={{ padding: "5px 10px", fontSize: 9, fontFamily: "var(--ff-body)", letterSpacing: 1.5, cursor: "pointer", borderRadius: 4, background: tab === id ? "var(--tab-active)" : "transparent", color: tab === id ? "#60A5FA" : "var(--text-dim)", border: tab === id ? "1px solid var(--border)" : "1px solid transparent", display: "flex", alignItems: "center", gap: 5, textTransform: "uppercase" }}>
      {icon}{label}
    </button>
  ), [tab]);

  return (
    <div style={{ ...S.card, height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ ...S.label, marginBottom: 12 }}>Swing Controls</div>

      <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid var(--divider)" }}>
        <div style={{ fontSize: 8, color: "var(--text-dim)", marginBottom: 5, fontFamily: "var(--ff-body)", letterSpacing: 1, textTransform: "uppercase" }}>Baseline Cycle</div>
        <select value={scenarioYear} onChange={onScenarioChange} style={{ width: "100%", ...S.editInput, padding: "6px 8px", cursor: "pointer" }}>
          {Object.entries(USA_SCENARIO_LABELS).map(([y, label]) => <option key={y} value={y}>{label}</option>)}
        </select>
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid var(--divider)" }}>
        <TabBtn id="candidates"  label="Candidates"    icon={<IconColumns size={11} />} />
        <TabBtn id="demo"        label="Demographics"  icon={<IconPeople size={11} />} />
      </div>

      <div style={{ flexGrow: 1, overflowY: "auto", paddingRight: 4, scrollbarWidth: "thin" }}>
        {tab === "demo" && (
          <>
            {USA_DEM_CONTROLS.map(ctrl => (
              <div key={ctrl.key} style={{ marginBottom: 18 }}>
                <Slider label={ctrl.label} value={demSliders[ctrl.key]} min={-10} max={10} step={0.5}
                  onChange={v => setDemSliders(prev => ({ ...prev, [ctrl.key]: v }))} color={ctrl.color} />
                <div style={{ fontSize: 8, color: "var(--text-dim)", fontFamily: "var(--ff-body)", marginTop: 2, letterSpacing: 0.3 }}>{ctrl.tip}</div>
              </div>
            ))}
            <button className="icon-btn" onClick={resetDemo} style={{ ...S.ghostBtn, width: "100%", justifyContent: "center", marginTop: 8 }}>Reset Demographics</button>
          </>
        )}
        {tab === "candidates" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "4px 8px", background: "var(--btn-bg)", borderRadius: 4, border: "1px solid var(--divider)" }}>
              <span style={{ fontSize: 8, color: "var(--text-dim)", fontFamily: "var(--ff-body)", letterSpacing: 1, textTransform: "uppercase" }}>Total (normalised)</span>
              <span style={{ fontSize: 9, ...S.mono, color: Math.abs(totalPct - 100) < 0.2 ? "#34D399" : "#F87171", transition: `color 0.2s ${EASE_STD}` }}>{totalPct.toFixed(1)}%</span>
            </div>
            {candidates.map(c => (
              <USAPartyControlItem key={c.id} party={c} onPctChange={onPctChange} onToggleLock={onToggleLock} />
            ))}
            <button className="icon-btn" onClick={resetAll} style={{ ...S.ghostBtn, width: "100%", justifyContent: "center", marginTop: 8 }}>Reset to Baseline</button>
          </>
        )}
      </div>
    </div>
  );
});
