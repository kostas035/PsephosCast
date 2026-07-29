// usa-control.jsx — left-hand swing-control panel: national vote-share
// sliders for every candidate on the ballot that year, plus real-data
// demographic-group sliders (each shows its actual 2024 exit-poll baseline
// split and lets you drag that specific group's vote choice toward either side).
import { useState, useMemo, useEffect, useRef, memo, useCallback } from "react";
import { USA_DEMO_GROUPS, USA_DEMO_RESET, USA_SCENARIO_LABELS, USA_CANDIDATE_DICT } from "./usa-data.js";
import { S, EASE_STD, IconColumns, IconPeople, IconLock } from "./usa-ui.jsx";

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
        <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
          <div style={{ width: 3, height: 16, borderRadius: 2, background: party.color, flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: "var(--text-main)", fontFamily: "var(--ff-body)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{party.label}</span>
          <button className="icon-btn" onClick={() => onToggleLock(party.id)} title={party.isLocked ? "Unlock" : "Lock"}
            style={{ background: "none", border: "none", color: party.isLocked ? "#F59E0B" : "var(--text-dim)", cursor: "pointer", padding: "2px 3px", display: "flex", alignItems: "center", borderRadius: 3, flexShrink: 0 }}>
            <IconLock locked={party.isLocked} size={11} />
          </button>
        </div>
        <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--ff-mono)", flexShrink: 0 }}>{localPct.toFixed(1)}%</span>
      </div>
      <input type="range" min={0} max={100} step={0.1} value={localPct} disabled={party.isLocked} onChange={handleChange}
        style={{ width: "100%", height: 5, background: `linear-gradient(to right,${party.color} 0%,${party.color} ${pctStyle}%,var(--border) ${pctStyle}%)`, borderRadius: 4, outline: "none", cursor: party.isLocked ? "not-allowed" : "pointer", opacity: party.isLocked ? 0.5 : 1 }} />
    </div>
  );
});

// Shows the group's real baseline vote split (updates live as you drag) and
// lets the slider shift THAT group's own choice toward Dem or GOP.
const DemoGroupSlider = memo(function DemoGroupSlider({ group, value, onChange }) {
  const [localVal, setLocalVal] = useState(value);
  const debounced = useRef(null);
  useEffect(() => { setLocalVal(value); }, [value]);
  useEffect(() => () => { if (debounced.current) clearTimeout(debounced.current); }, []);

  const handle = e => {
    const v = parseFloat(e.target.value);
    setLocalVal(v);
    if (debounced.current) clearTimeout(debounced.current);
    debounced.current = setTimeout(() => onChange(v), 120);
  };

  const baseMargin = group.baselineDemPct - group.baselineGopPct;
  const margin = baseMargin + (localVal / 10) * group.marginSwingMax;
  const dem = Math.max(0, Math.min(100, (100 + margin) / 2));
  const gop = Math.max(0, 100 - dem);
  const pct = ((localVal + 10) / 20) * 100;
  const demColor = USA_CANDIDATE_DICT.dem.color, gopColor = USA_CANDIDATE_DICT.gop.color;

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3, gap: 6 }}>
        <span style={{ fontSize: 10, color: "var(--text-main)", fontFamily: "var(--ff-body)", fontWeight: 600 }}>{group.label}</span>
        <span style={{ fontSize: 9, ...S.mono, whiteSpace: "nowrap" }}>
          <span style={{ color: demColor, fontWeight: 700 }}>{dem.toFixed(0)}% D</span>
          <span style={{ color: "var(--text-dim)" }}> / </span>
          <span style={{ color: gopColor, fontWeight: 700 }}>{gop.toFixed(0)}% R</span>
        </span>
      </div>
      <input type="range" min={-10} max={10} step={0.5} value={localVal} onChange={handle}
        style={{ width: "100%", height: 5, background: `linear-gradient(to right,${demColor} 0%,${demColor} ${pct}%,${gopColor} ${pct}%,${gopColor} 100%)`, borderRadius: 4, outline: "none", cursor: "pointer" }} />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 7, color: "var(--text-dim)", marginTop: 2, fontFamily: "var(--ff-body)" }}>
        <span>≈{(group.electorateShare * 100).toFixed(0)}% of electorate</span>
        <span>{group.source}</span>
      </div>
    </div>
  );
});

export const USAControlPanel = memo(function USAControlPanel({
  candidates, onPctChange, onToggleLock, demSliders, setDemSliders, scenarioYear, onScenarioChange, resetAll,
}) {
  const [tab, setTab] = useState("candidates");
  const totalPct = useMemo(() => candidates.reduce((s, c) => s + c.userPercentage, 0), [candidates]);
  const resetDemo = useCallback(() => setDemSliders({ ...USA_DEMO_RESET }), [setDemSliders]);

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
            <div style={{ fontSize: 8, color: "var(--text-dim)", marginBottom: 12, lineHeight: 1.5, fontFamily: "var(--ff-body)" }}>
              Real 2024 exit-poll baselines for each group — drag to test a realignment. Applied nationally, weighted by each group's approximate share of the electorate.
            </div>
            {USA_DEMO_GROUPS.map(group => (
              <DemoGroupSlider key={group.key} group={group} value={demSliders[group.key] ?? 0}
                onChange={v => setDemSliders(prev => ({ ...prev, [group.key]: v }))} />
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
