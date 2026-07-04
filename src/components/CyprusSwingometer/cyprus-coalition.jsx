// cyprus-coalition.jsx
import { useState, useCallback, memo } from "react";
import { CY } from "./cyprus-data.js";
import { S, EASE_OUT, EASE_SPRING, EASE_STD } from "./cyprus-ui.jsx";

export const CyCoalitionBuilder = memo(function CyCoalitionBuilder({ electionResult, parties }) {
  const [coalition, setCoalition] = useState([]);
  const toggle = useCallback(id => setCoalition(c => c.includes(id) ? c.filter(x => x !== id) : [...c, id]), []);
  const clear  = useCallback(() => setCoalition([]), []);
  const { results } = electionResult;
  if (!results?.length) return null;

  const validResults = results.filter(r => r.seats > 0);
  const activeIds    = coalition.filter(id => validResults.some(r => r.id === id));
  const totalSeats   = activeIds.reduce((sum, id) => sum + (validResults.find(x => x.id === id)?.seats ?? 0), 0);
  const hasMajority  = totalSeats >= CY.MAJORITY;
  const progress     = Math.min(100, (totalSeats / CY.TOTAL_SEATS) * 100);

  return (
    <div style={{ ...S.card, marginTop: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={S.label}>Coalition Builder</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, ...S.mono, color: hasMajority ? "#34D399" : "#F87171", transition: `color 0.3s ${EASE_STD}` }}>{totalSeats} / {CY.MAJORITY}</span>
          {coalition.length > 0 && <button className="icon-btn" onClick={clear} style={{ ...S.ghostBtn, padding: "2px 6px", fontSize: 8 }}>Clear</button>}
        </div>
      </div>
      <div style={{ height: 6, background: "var(--coalition-bg)", borderRadius: 3, overflow: "hidden", marginBottom: 12, border: "1px solid var(--border)", position: "relative" }}>
        <div style={{ position: "absolute", left: `${(CY.MAJORITY / CY.TOTAL_SEATS) * 100}%`, top: 0, bottom: 0, width: 2, background: "#F59E0B", zIndex: 10 }}/>
        <div style={{ height: "100%", width: `${progress}%`, background: hasMajority ? "#34D399" : "#3B82F6", transition: `width 0.4s ${EASE_SPRING}, background 0.3s ${EASE_STD}` }}/>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {validResults.map(r => {
          const p        = parties.find(x => x.id === r.id);
          const isActive = activeIds.includes(r.id);
          return (
            <button key={r.id} className="coalition-chip" onClick={() => toggle(r.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", borderRadius: 4, cursor: "pointer", background: isActive ? `${p?.color}20` : "var(--btn-bg)", border: `1px solid ${isActive ? p?.color : "var(--border)"}` }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: p?.color || "#fff" }}/>
              <span style={{ fontSize: 9, color: isActive ? "var(--text-title)" : "var(--text-muted)", fontFamily: "var(--ff-body)", letterSpacing: 0.5 }}>
                {p?.name} <span style={S.mono}>{r.seats}</span>
              </span>
            </button>
          );
        })}
      </div>
      {hasMajority && (
        <div style={{ marginTop: 10, padding: "6px 10px", background: "#34D39910", border: "1px solid #34D39930", borderRadius: 4, fontSize: 9, color: "#34D399", fontFamily: "var(--ff-body)", letterSpacing: 0.5, animation: `tooltipIn 0.25s ${EASE_OUT} both` }}>
          ✓ Majority coalition — {totalSeats} seats with {activeIds.length} {activeIds.length === 1 ? "party" : "parties"}
        </div>
      )}
    </div>
  );
});
