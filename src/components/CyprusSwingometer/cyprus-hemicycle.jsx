// cyprus-hemicycle.jsx
import { useState, useMemo, useEffect, memo } from "react";
import { CY, CY_HEMI_POSITIONS, CY_HEMI_W, CY_HEMI_H, CY_HEMI_CX, CY_HEMI_CY, CY_ROW_RADII } from "./cyprus-data.js";
import { S, EASE_OUT, EASE_STD } from "./cyprus-ui.jsx";

export const CyHemicycle = memo(function CyHemicycle({ electionResult, parties }) {
  const { results } = electionResult;
  const [rendered, setRendered] = useState(false);

  const seatKey = results ? results.map(r => `${r.id}:${r.seats}`).join("|") : "";
  useEffect(() => {
    setRendered(false);
    const t = setTimeout(() => setRendered(true), 30);
    return () => clearTimeout(t);
  }, [seatKey]);

  const seatColors = useMemo(() => {
    if (!results?.length) return Array(CY.TOTAL_SEATS).fill("transparent");
    const sorted = [...results].sort((a, b) => (
      (parties.find(p => p.id === a.id)?.ideology ?? 0) - (parties.find(p => p.id === b.id)?.ideology ?? 0)
    ));
    const colors = [];
    sorted.forEach(r => {
      const p = parties.find(x => x.id === r.id);
      for (let i = 0; i < r.seats; i++) colors.push(p?.color ?? "var(--text-muted)");
    });
    while (colors.length < CY.TOTAL_SEATS) colors.push("transparent");
    return colors;
  }, [results, parties]);

  const hasMajority = results?.length ? results[0].seats >= CY.MAJORITY : false;
  const winnerColor = results?.length ? (parties.find(p => p.id === results[0].id)?.color || "#60A5FA") : "#60A5FA";
  const majorityPos = CY_HEMI_POSITIONS[CY.MAJORITY - 1];

  return (
    <div style={{ ...S.card, paddingTop: 10, paddingBottom: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 16px 4px" }}>
        <span style={S.label}>House of Representatives</span>
        <span style={{ fontSize: 9, ...S.mono, color: hasMajority ? "#34D399" : "#F87171", letterSpacing: 1, transition: `color 0.3s ${EASE_STD}` }}>
          {hasMajority ? "● Majority secured" : "○ No majority"}
        </span>
      </div>
      <svg viewBox={`0 0 ${CY_HEMI_W} ${CY_HEMI_H}`} style={{ width: "100%", display: "block" }}>
        {CY_ROW_RADII.map(r => (
          <path key={r} d={`M ${CY_HEMI_CX - r} ${CY_HEMI_CY} A ${r} ${r} 0 0 1 ${CY_HEMI_CX + r} ${CY_HEMI_CY}`} fill="none" stroke="var(--hemi-stroke)" strokeWidth={1}/>
        ))}
        <line x1={CY_HEMI_CX} y1={CY_HEMI_CY - 175} x2={CY_HEMI_CX} y2={CY_HEMI_CY} stroke="var(--border)" strokeWidth={1}/>
        {majorityPos && (
          <>
            <line x1={CY_HEMI_CX} y1={CY_HEMI_CY} x2={majorityPos.x} y2={majorityPos.y} stroke="#F59E0B" strokeWidth={0.5} strokeDasharray="3,3" opacity={0.5}/>
            <circle cx={majorityPos.x} cy={majorityPos.y} r={7} fill="none" stroke="#F59E0B" strokeWidth={0.8} strokeDasharray="3,2" opacity={0.7}/>
            <text x={majorityPos.x + 10} y={majorityPos.y + 3} fontSize={8} fill="#F59E0B" fontFamily="var(--ff-mono)" opacity={0.9} fontWeight="600">29</text>
          </>
        )}
        {CY_HEMI_POSITIONS.map((pos, i) => (
          <circle key={i} cx={pos.x} cy={pos.y} r={5}
            fill={seatColors[i] === "transparent" ? "var(--btn-bg)" : seatColors[i]}
            opacity={seatColors[i] === "transparent" ? 0 : rendered ? 0.93 : 0}
            style={{ transition: `opacity 0.35s ${EASE_OUT} ${Math.min(i * 0.003, 0.45)}s` }}/>
        ))}
        {hasMajority && <circle cx={CY_HEMI_CX} cy={CY_HEMI_CY} r={14} fill={winnerColor} opacity={0.07}/>}
        {["Left", "Center", "Right"].map((label, i) => (
          <text key={label} x={i === 0 ? 30 : i === 1 ? CY_HEMI_CX : CY_HEMI_W - 30} y={CY_HEMI_CY + 14} fontSize={8} fill="var(--text-dim)" fontFamily="var(--ff-body)" letterSpacing={1.5} textAnchor={i === 0 ? "start" : i === 1 ? "middle" : "end"}>{label}</text>
        ))}
      </svg>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px 14px", padding: "0 16px 10px", justifyContent: "center" }}>
        {(results || []).map(r => {
          const p = parties.find(x => x.id === r.id);
          return (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: p?.color || "var(--text-muted)" }}/>
              <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--ff-body)" }}>
                {p?.name} <strong style={{ color: p?.color || "var(--text-title)", fontSize: 12 }}>{r.seats}</strong>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});
