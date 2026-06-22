import { useState, useCallback, useRef, useEffect } from "react";
import { S, EASE_STD, Slider } from "./GreeceStyles";
import { IconGear, IconTrash, IconChevron, IconColumns, IconPeople } from "./GreeceIcons";
import { GR_IDEOLOGY_LABELS, GR_SCENARIO_LABELS } from "./greece-data.js";

const GR_DEM_CONTROLS = [
  { key: "youth",     label: "Youth Turnout (18–34)",  color: "#7C3AED", tip: "Negative = youth abstain · Positive = youth mobilised" },
  { key: "seniors",   label: "Senior Turnout (55+)",   color: "#EA580C", tip: "Negative = seniors abstain · Positive = seniors mobilised" },
  { key: "urban",     label: "Urban / Rural Skew",     color: "#0891B2", tip: "Negative = rural surge · Positive = urban surge" },
  { key: "education", label: "Education Gradient",     color: "#10B981", tip: "Negative = low-education turnout · Positive = high-education turnout" },
  { key: "precarity", label: "Economic Precarity",     color: "#EF4444", tip: "Negative = stable electorate · Positive = precarious/unemployed mobilised" },
  { key: "gender",    label: "Gender Representation",  color: "#EC4899", tip: "Negative = higher male turnout · Positive = higher female turnout" },
];

const IconLock = ({ locked, size = 11 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {locked ? (
      <>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </>
    ) : (
      <>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
      </>
    )}
  </svg>
);

function GrPartyControlItem({ party, index, totalParties, onPctChange, onToggleLock, onEdit, onMove, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [localPct, setLocalPct] = useState(party.userPercentage);
  const debouncedChange = useRef(null);

  // Sync from top down if the scenario resets or constraints force a change
  useEffect(() => { setLocalPct(party.userPercentage); }, [party.userPercentage]);

  // Cleanup timeout to prevent memory leaks if component unmounts quickly
  useEffect(() => {
    return () => {
      if (debouncedChange.current) clearTimeout(debouncedChange.current);
    };
  }, []);

  const handleSliderChange = (e) => {
    const val = parseFloat(e.target.value);
    setLocalPct(val); // Instant UI update
    if (debouncedChange.current) clearTimeout(debouncedChange.current);
    debouncedChange.current = setTimeout(() => {
      onPctChange(party.id, val); // Heavy engine update 150ms later
    }, 150); 
  };

  const pctStyle = (localPct / 100) * 100;

  return (
    <div className="party-row" style={{ marginBottom: 10, padding: editing ? 10 : 0, background: editing ? "var(--btn-hover)" : "transparent", borderRadius: 6, border: editing ? "1px solid var(--border)" : "1px solid transparent" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 3, height: 16, borderRadius: 2, background: party.color, flexShrink: 0, transition: `background 0.2s ${EASE_STD}` }}/>
          <span style={{ fontSize: 11, color: "var(--text-main)", fontFamily: "var(--ff-body)", fontWeight: 600 }}>{party.fullName}</span>
          
          {/* Lock Button */}
          <button className="icon-btn" onClick={() => onToggleLock(party.id)} title={party.isLocked ? "Unlock Party" : "Lock Party"} style={{ background: "none", border: "none", color: party.isLocked ? "#F59E0B" : "var(--text-dim)", cursor: "pointer", padding: "2px 3px", display: "flex", alignItems: "center", borderRadius: 3 }}>
            <IconLock locked={party.isLocked} size={11}/>
          </button>
          
          <button className="icon-btn" onClick={() => setEditing(!editing)} style={{ background: "none", border: "none", color: editing ? "#60A5FA" : "var(--text-dim)", cursor: "pointer", padding: "2px 3px", display: "flex", alignItems: "center", borderRadius: 3 }}><IconGear size={11}/></button>
        </div>
        <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--ff-mono)" }}>{localPct.toFixed(1)}%</span>
      </div>

      {editing && (
        <div style={{ display: "grid", gap: 7, marginTop: 8, marginBottom: 10, paddingBottom: 10, borderBottom: "1px dashed var(--border)" }}>
          <div style={{ display: "flex", gap: 6 }}>
            <input type="color" value={party.color} onChange={e => onEdit(party.id, "color", e.target.value)} style={{ width: 26, height: 26, padding: 2, border: "1px solid var(--border)", borderRadius: 4, cursor: "pointer", background: "var(--btn-bg)" }}/>
            <input type="text" value={party.name} onChange={e => onEdit(party.id, "name", e.target.value)} style={{ ...S.editInput, width: 60 }} placeholder="Abbr."/>
            <input type="text" value={party.fullName} onChange={e => onEdit(party.id, "fullName", e.target.value)} style={{ ...S.editInput, flexGrow: 1 }} placeholder="Full Name"/>
          </div>
          <select value={party.ideology} onChange={e => onEdit(party.id, "ideology", parseInt(e.target.value))} style={{ ...S.editInput, width: "100%" }}>
            {Object.entries(GR_IDEOLOGY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 5, marginTop: 4 }}>
            <button onClick={() => onDelete(party.id)} style={{ background: "#EF44441A", color: "#EF4444", border: "1px solid #EF444444", padding: "3px 8px", borderRadius: 3, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 9, fontFamily: "var(--ff-body)", letterSpacing: 1, textTransform: "uppercase" }}><IconTrash size={10}/> Delete</button>
            <div style={{ display: "flex", gap: 5 }}>
              {[[-1, "up"], [1, "down"]].map(([dir, arrow]) => (
                <button key={dir} className="icon-btn" onClick={() => onMove(index, dir)} disabled={dir === -1 ? index === 0 : index === totalParties - 1} style={{ ...S.ghostBtn, padding: "3px 8px" }}><IconChevron dir={arrow} size={9}/></button>
              ))}
            </div>
          </div>
        </div>
      )}

      <input
        type="range" min={0} max={100} step={0.1} value={localPct}
        disabled={party.isLocked}
        onChange={handleSliderChange}
        style={{ 
          width: "100%", height: 5, borderRadius: 4, outline: "none", 
          cursor: party.isLocked ? "not-allowed" : "pointer", 
          background: `linear-gradient(to right,${party.color} 0%,${party.color} ${pctStyle}%,var(--border) ${pctStyle}%)`,
          opacity: party.isLocked ? 0.5 : 1
        }}
      />
    </div>
  );
}

export default function ControlPanel({ parties, onPctChange, onToggleLock, onPartyEdit, onPartyMove, onPartyDelete, demSliders, setDemSliders, scenarioId, onScenarioChange, resetAll, threshold, setThreshold, turnoutShift, setTurnoutShift }) {
  const [tab, setTab] = useState("parties");
  let totalPct = 0;
  for (let i = 0; i < parties.length; i++) totalPct += parties[i].userPercentage;

  const resetDem = useCallback(() => setDemSliders({ youth: 0, seniors: 0, urban: 0, education: 0, precarity: 0, gender: 0 }), [setDemSliders]);

  const TabBtn = ({ id, label, icon }) => (
    <button className="tab-btn icon-btn" onClick={() => setTab(id)} style={{ padding: "5px 10px", fontSize: 9, fontFamily: "var(--ff-body)", letterSpacing: 1.5, cursor: "pointer", borderRadius: 4, background: tab === id ? "var(--tab-active)" : "transparent", color: tab === id ? "#60A5FA" : "var(--text-dim)", border: tab === id ? "1px solid var(--border)" : "1px solid transparent", display: "flex", alignItems: "center", gap: 5, textTransform: "uppercase" }}>{icon}{label}</button>
  );

  return (
    <div style={{ ...S.card, height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ ...S.label, marginBottom: 12 }}>Swing Controls</div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 8, color: "var(--text-dim)", marginBottom: 5, fontFamily: "var(--ff-body)", letterSpacing: 1, textTransform: "uppercase" }}>Baseline</div>
        <select value={scenarioId} onChange={onScenarioChange} style={{ width: "100%", ...S.editInput, padding: "6px 8px", cursor: "pointer" }}>
          <option value="2026">May 2026 Polling Average</option>
          <option value="2023">June 2023 Legislative</option>
          <option value="2019">July 2019 Legislative</option>
        </select>
      </div>
      <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid var(--divider)" }}>
        <Slider label="Electoral Threshold (%)" value={threshold} min={0} max={10} step={0.5} onChange={setThreshold} color="#F59E0B"/>
        <Slider label={`National Turnout ${turnoutShift > 0 ? "+" : ""}${turnoutShift} pts`} value={turnoutShift} min={-15} max={15} step={0.5} onChange={setTurnoutShift} color="#06B6D4"/>
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid var(--divider)" }}>
        <TabBtn id="parties" label="Parties"      icon={<IconColumns size={11}/>}/>
        <TabBtn id="demo"    label="Demographics" icon={<IconPeople  size={11}/>}/>
      </div>
      <div style={{ flexGrow: 1, overflowY: "auto", paddingRight: 4 }}>
        {tab === "demo" && (
          <>
            {GR_DEM_CONTROLS.map(ctrl => (
              <div key={ctrl.key} style={{ marginBottom: 18 }}>
                <Slider label={ctrl.label} value={demSliders[ctrl.key]} min={-10} max={10} step={0.5} onChange={v => setDemSliders(prev => ({ ...prev, [ctrl.key]: v }))} color={ctrl.color}/>
                <div style={{ fontSize: 8, color: "var(--text-dim)", fontFamily: "var(--ff-body)", marginTop: 2, letterSpacing: 0.3 }}>{ctrl.tip}</div>
              </div>
            ))}
            <button className="icon-btn" onClick={resetDem} style={{ ...S.ghostBtn, width: "100%", justifyContent: "center", marginTop: 8 }}>Reset Demographics</button>
          </>
        )}
        {tab === "parties" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "4px 8px", background: "var(--btn-bg)", borderRadius: 4, border: "1px solid var(--divider)" }}>
              <span style={{ fontSize: 8, color: "var(--text-dim)", fontFamily: "var(--ff-body)", letterSpacing: 1, textTransform: "uppercase" }}>Total (normalised)</span>
              <span style={{ fontSize: 9, ...S.mono, color: Math.abs(totalPct - 100) < 0.2 ? "#34D399" : "#F87171", transition: `color 0.2s ${EASE_STD}` }}>{totalPct.toFixed(1)}%</span>
            </div>
            {parties.map((p, i) => (
              <GrPartyControlItem 
                key={p.id} 
                party={p} 
                index={i} 
                totalParties={parties.length} 
                onPctChange={onPctChange} 
                onToggleLock={onToggleLock}
                onEdit={onPartyEdit} 
                onMove={onPartyMove} 
                onDelete={onPartyDelete}
              />
            ))}
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              <button className="icon-btn" onClick={resetAll} style={{ ...S.ghostBtn, flexGrow: 1, justifyContent: "center" }}>Reset to Baseline</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
