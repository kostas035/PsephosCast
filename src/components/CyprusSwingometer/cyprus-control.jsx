// cyprus-control.jsx
// Left swing-control panel and its per-party row.
import { useState, useMemo, useEffect, useCallback, useRef, memo } from "react";
import { CY_IDEOLOGY_LABELS, CY_DEM_CONTROLS } from "./cyprus-data.js";
import { S, EASE_STD, IconGear, IconColumns, IconPeople, IconChevron, IconTrash, IconPlus, IconLock, Slider } from "./cyprus-ui.jsx";

export const CyPartyControlItem = memo(function CyPartyControlItem({ party, index, totalParties, onPctChange, onToggleLock, onEdit, onMove, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [localPct, setLocalPct] = useState(party.userPercentage);
  const debouncedChange = useRef(null);

  useEffect(() => { setLocalPct(party.userPercentage); }, [party.userPercentage]);
  useEffect(() => () => { if (debouncedChange.current) clearTimeout(debouncedChange.current); }, []);

  const handleSliderChange = (e) => {
    const val = parseFloat(e.target.value);
    setLocalPct(val); 
    if (debouncedChange.current) clearTimeout(debouncedChange.current);
    debouncedChange.current = setTimeout(() => { onPctChange(party.id, val); }, 150); 
  };

  const pctStyle = (localPct / 100) * 100;

  return (
    <div className="party-row" style={{ marginBottom: 10, padding: editing ? 10 : 0, background: editing ? "var(--btn-hover)" : "transparent", borderRadius: 6, border: editing ? "1px solid var(--border)" : "1px solid transparent", transition: `background 0.18s ${EASE_STD}, padding 0.18s ${EASE_STD}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 3, height: 16, borderRadius: 2, background: party.color, flexShrink: 0, transition: `background 0.2s ${EASE_STD}` }}/>
          <span style={{ fontSize: 11, color: "var(--text-main)", fontFamily: "var(--ff-body)", fontWeight: 600 }}>{party.fullName}</span>
          <button className="icon-btn" onClick={() => onToggleLock(party.id)} title={party.isLocked ? "Unlock Party" : "Lock Party"} style={{ background: "none", border: "none", color: party.isLocked ? "#F59E0B" : "var(--text-dim)", cursor: "pointer", padding: "2px 3px", display: "flex", alignItems: "center", borderRadius: 3 }}>
            <IconLock locked={party.isLocked} size={11}/>
          </button>
          <button className="icon-btn" onClick={() => setEditing(e => !e)} style={{ background: "none", border: "none", color: editing ? "#60A5FA" : "var(--text-dim)", cursor: "pointer", padding: "2px 3px", display: "flex", alignItems: "center", borderRadius: 3 }}><IconGear size={11}/></button>
        </div>
        <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--ff-mono)" }}>{localPct.toFixed(1)}%</span>
      </div>
      {editing && (
        <div style={{ display: "grid", gap: 7, marginTop: 8, marginBottom: 10, paddingBottom: 10, borderBottom: "1px dashed var(--border)" }}>
          <div style={{ display: "flex", gap: 6 }}>
            <input type="color" value={party.color} onChange={e => onEdit(party.id, "color", e.target.value)} style={{ width: 26, height: 26, padding: 2, border: "1px solid var(--border)", borderRadius: 4, cursor: "pointer", background: "var(--btn-bg)" }}/>
            <input type="text"  value={party.name}     onChange={e => onEdit(party.id, "name",     e.target.value)} style={{ ...S.editInput, width: 60 }}    placeholder="Abbr."/>
            <input type="text"  value={party.fullName} onChange={e => onEdit(party.id, "fullName", e.target.value)} style={{ ...S.editInput, flexGrow: 1 }} placeholder="Full Name"/>
          </div>
          <select value={party.ideology} onChange={e => onEdit(party.id, "ideology", parseInt(e.target.value))} style={{ ...S.editInput, width: "100%" }}>
            {Object.entries(CY_IDEOLOGY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 5, marginTop: 4 }}>
            <button onClick={() => onDelete(party.id)} style={{ background: "#EF44441A", color: "#EF4444", border: "1px solid #EF444444", padding: "3px 8px", borderRadius: 3, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 9, fontFamily: "var(--ff-body)", letterSpacing: 1, textTransform: "uppercase" }}><IconTrash size={10}/> Delete</button>
            <div style={{ display: "flex", gap: 5 }}>
              {[[-1, "up"], [1, "down"]].map(([dir, arrow]) => (
                <button key={dir} onClick={() => onMove(index, dir)} disabled={dir === -1 ? index === 0 : index === totalParties - 1} style={{ ...S.ghostBtn, padding: "3px 8px" }}><IconChevron dir={arrow} size={9}/></button>
              ))}
            </div>
          </div>
        </div>
      )}
      <input type="range" min={0} max={100} step={0.1} value={localPct} disabled={party.isLocked} onChange={handleSliderChange}
        style={{ width: "100%", height: 5, background: `linear-gradient(to right,${party.color} 0%,${party.color} ${pctStyle}%,var(--border) ${pctStyle}%)`, borderRadius: 4, outline: "none", cursor: party.isLocked ? "not-allowed" : "pointer", opacity: party.isLocked ? 0.5 : 1 }}
      />
    </div>
  );
});

export const CyControlPanel = memo(function CyControlPanel({
  parties, onPctChange, onToggleLock, onPartyEdit, onPartyMove, onPartyDelete, onPartyAdd,
  demSliders, setDemSliders, scenarioId, onScenarioChange, resetAll, threshold, setThreshold,
}) {
  const [tab, setTab]   = useState("parties");
  const totalPct        = useMemo(() => parties.reduce((s, p) => s + p.userPercentage, 0), [parties]);
  const resetDemo       = useCallback(() => setDemSliders({ youth:0, seniors:0, urban:0, education:0, migration:0, gender:0 }), [setDemSliders]);

  const TabBtn = useCallback(({ id, label, icon }) => (
    <button className="tab-btn icon-btn" onClick={() => setTab(id)} style={{ padding: "5px 10px", fontSize: 9, fontFamily: "var(--ff-body)", letterSpacing: 1.5, cursor: "pointer", borderRadius: 4, background: tab === id ? "var(--tab-active)" : "transparent", color: tab === id ? "#60A5FA" : "var(--text-dim)", border: tab === id ? "1px solid var(--border)" : "1px solid transparent", display: "flex", alignItems: "center", gap: 5, textTransform: "uppercase" }}>{icon}{label}</button>
  ), [tab]);

  return (
    <div style={{ ...S.card, height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ ...S.label, marginBottom: 12 }}>Swing Controls</div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 8, color: "var(--text-dim)", marginBottom: 5, fontFamily: "var(--ff-body)", letterSpacing: 1, textTransform: "uppercase" }}>Baseline</div>
        <select value={scenarioId} onChange={onScenarioChange} style={{ width: "100%", ...S.editInput, padding: "6px 8px", cursor: "pointer" }}>
          <option value="2026">May 2026 Legistlative</option>
          <option value="2021">May 2021 Legislative</option>
          <option value="2016">May 2016 Legislative</option>
        </select>
      </div>
      <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid var(--divider)" }}>
        <Slider label="Electoral Threshold (%)" value={threshold} min={0} max={10} step={0.25} onChange={setThreshold} color="#D97706"/>
        <div style={{ fontSize: 8, color: "var(--text-dim)", fontFamily: "var(--ff-body)", letterSpacing: 0.3, marginTop: 2 }}>Default Cyprus threshold: 3.6%</div>
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid var(--divider)" }}>
        <TabBtn id="parties" label="Parties"      icon={<IconColumns size={11}/>}/>
        <TabBtn id="demo"    label="Demographics" icon={<IconPeople  size={11}/>}/>
      </div>
      <div style={{ flexGrow: 1, overflowY: "auto", paddingRight: 4, scrollbarWidth: "thin" }}>
        {tab === "demo" && (
          <>
            {CY_DEM_CONTROLS.map(ctrl => (
              <div key={ctrl.key} style={{ marginBottom: 18 }}>
                <Slider label={ctrl.label} value={demSliders[ctrl.key]} min={-10} max={10} step={0.5} onChange={v => setDemSliders(prev => ({ ...prev, [ctrl.key]: v }))} color={ctrl.color}/>
                <div style={{ fontSize: 8, color: "var(--text-dim)", fontFamily: "var(--ff-body)", marginTop: 2, letterSpacing: 0.3 }}>{ctrl.tip}</div>
              </div>
            ))}
            <button className="icon-btn" onClick={resetDemo} style={{ ...S.ghostBtn, width: "100%", justifyContent: "center", marginTop: 8 }}>Reset Demographics</button>
          </>
        )}
        {tab === "parties" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "4px 8px", background: "var(--btn-bg)", borderRadius: 4, border: "1px solid var(--divider)" }}>
              <span style={{ fontSize: 8, color: "var(--text-dim)", fontFamily: "var(--ff-body)", letterSpacing: 1, textTransform: "uppercase" }}>Total (normalised)</span>
              <span style={{ fontSize: 9, ...S.mono, color: Math.abs(totalPct - 100) < 0.2 ? "#34D399" : "#F87171", transition: `color 0.2s ${EASE_STD}` }}>{totalPct.toFixed(1)}%</span>
            </div>
            {parties.map((p, i) => (
              <CyPartyControlItem key={p.id} party={p} index={i} totalParties={parties.length}
                onPctChange={onPctChange} onToggleLock={onToggleLock} onEdit={onPartyEdit} onMove={onPartyMove} onDelete={onPartyDelete}/>
            ))}
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              <button className="icon-btn" onClick={onPartyAdd} style={{ ...S.ghostBtn, flexGrow: 1, justifyContent: "center", borderStyle: "dashed" }}><IconPlus size={10}/> Add Party</button>
              <button className="icon-btn" onClick={resetAll}   style={{ ...S.ghostBtn, flexGrow: 1, justifyContent: "center" }}>Reset</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
});
