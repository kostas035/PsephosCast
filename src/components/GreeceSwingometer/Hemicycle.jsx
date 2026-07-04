import { memo, useState, useEffect, useMemo, useCallback } from "react";
import { S, EASE_OUT, EASE_SPRING, EASE_STD } from "./GreeceStyles";
import { GR } from "./greece-data.js";
import { GR_HEMI_POSITIONS, GR_ROW_RADII, GR_HEMI_CX, GR_HEMI_CY, GR_HEMI_W, GR_HEMI_H } from "./greece-utils.js";
import { useGreeceT, fmtMajorityCoalition, tPartyName } from "./GreeceTranslations.jsx";

export const GrCoalitionBuilder = memo(function GrCoalitionBuilder({ electionResult, parties, lang }) {
  const t = useGreeceT(lang);
  const [coalition, setCoalition] = useState([]);
  const toggle = useCallback(id => setCoalition(c => c.includes(id) ? c.filter(x => x !== id) : [...c, id]), []);
  const clear  = useCallback(() => setCoalition([]), []);
  const { results } = electionResult;
  if (!results?.length) return null;

  const validResults = results.filter(r => r.seats > 0);
  const activeIds    = coalition.filter(id => validResults.some(r => r.id === id));
  const totalSeats   = activeIds.reduce((sum, id) => sum + (validResults.find(x => x.id === id)?.seats ?? 0), 0);
  const hasMajority  = totalSeats >= GR.MAJORITY;
  const progress     = Math.min(100, (totalSeats / GR.TOTAL_SEATS) * 100);

  return (
    <div style={{ ...S.card, marginTop: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={S.label}>{t("Coalition Builder")}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, ...S.mono, color: hasMajority ? "#34D399" : "#F87171", transition: `color 0.3s ${EASE_STD}` }}>{totalSeats} / {GR.MAJORITY}</span>
          {coalition.length > 0 && <button className="icon-btn" onClick={clear} style={{ ...S.ghostBtn, padding: "2px 6px", fontSize: 8 }}>{t("Clear")}</button>}
        </div>
      </div>
      <div style={{ height: 6, background: "var(--coalition-bg)", borderRadius: 3, overflow: "hidden", marginBottom: 12, border: "1px solid var(--border)", position: "relative" }}>
        <div style={{ position: "absolute", left: `${(GR.MAJORITY / GR.TOTAL_SEATS) * 100}%`, top: 0, bottom: 0, width: 2, background: "#F59E0B", zIndex: 10 }}/>
        <div style={{ height: "100%", width: `${progress}%`, background: hasMajority ? "#34D399" : "#60A5FA", transition: `width 0.4s ${EASE_SPRING}, background 0.3s ${EASE_STD}` }}/>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {validResults.map(r => {
          let p = parties.find(x => x.id === r.id);
          const isActive = activeIds.includes(r.id);
          return (
            <button key={r.id} className="coalition-chip" onClick={() => toggle(r.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", borderRadius: 4, cursor: "pointer", background: isActive ? `${p?.color}20` : "var(--btn-bg)", border: `1px solid ${isActive ? p?.color : "var(--border)"}` }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: p?.color || "#fff" }}/>
              <span style={{ fontSize: 9, color: isActive ? "var(--text-title)" : "var(--text-muted)", fontFamily: "var(--ff-body)", letterSpacing: 0.5 }}>{tPartyName(lang, p)} <span style={S.mono}>{r.seats}</span></span>
            </button>
          );
        })}
      </div>
      {hasMajority && (
        <div style={{ marginTop: 10, padding: "6px 10px", background: "#34D39910", border: "1px solid #34D39930", borderRadius: 4, fontSize: 9, color: "#34D399", fontFamily: "var(--ff-body)", letterSpacing: 0.5, animation: `tooltipIn 0.25s ${EASE_OUT} both` }}>
          {fmtMajorityCoalition(lang, totalSeats, activeIds.length)}
        </div>
      )}
    </div>
  );
});

export default memo(function Hemicycle({ electionResult, parties, lang }) {
  const t = useGreeceT(lang);
  const { results } = electionResult;
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    setRendered(false);
    const t = setTimeout(() => setRendered(true), 30);
    return () => clearTimeout(t);
  }, [results]);

  const seatColors = useMemo(() => {
    if (!results?.length) return Array(GR.TOTAL_SEATS).fill("transparent");
    const sorted = [...results].sort((a, b) => ((parties.find(x => x.id === a.id)?.ideology ?? 0) - (parties.find(x => x.id === b.id)?.ideology ?? 0)));
    const colors = [];
    for (let i = 0; i < sorted.length; i++) {
      let p = parties.find(x => x.id === sorted[i].id);
      for (let j = 0; j < sorted[i].seats; j++) colors.push(p?.color ?? "var(--text-muted)");
    }
    while (colors.length < GR.TOTAL_SEATS) colors.push("transparent");
    return colors;
  }, [results, parties]);

  const hasMajority = results?.length ? results[0].seats >= GR.MAJORITY : false;
  let winnerColor = "#60A5FA";
  if (results?.length) {
    let p = parties.find(x => x.id === results[0].id);
    if(p) winnerColor = p.color;
  }

  const majorityPos = GR_HEMI_POSITIONS[GR.MAJORITY - 1];

  return (
    <div style={{ ...S.card, paddingTop: 10, paddingBottom: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 16px 4px" }}>
        <span style={S.label}>{t("Hellenic Parliament")}</span>
        <span style={{ fontSize: 9, ...S.mono, color: hasMajority ? "#34D399" : "#F87171", letterSpacing: 1, transition: `color 0.3s ${EASE_STD}` }}>
          {hasMajority ? t("● Majority secured") : t("○ No majority")}
        </span>
      </div>
      <svg viewBox={`0 0 ${GR_HEMI_W} ${GR_HEMI_H}`} style={{ width: "100%", display: "block" }}>
        {GR_ROW_RADII.map(r => (
          <path key={r} d={`M ${GR_HEMI_CX - r} ${GR_HEMI_CY} A ${r} ${r} 0 0 1 ${GR_HEMI_CX + r} ${GR_HEMI_CY}`} fill="none" stroke="var(--hemi-stroke)" strokeWidth={1}/>
        ))}
        <line x1={GR_HEMI_CX} y1={GR_HEMI_CY - 292} x2={GR_HEMI_CX} y2={GR_HEMI_CY} stroke="var(--border)" strokeWidth={1}/>
        {majorityPos && (<>
          <line x1={GR_HEMI_CX} y1={GR_HEMI_CY} x2={majorityPos.x} y2={majorityPos.y} stroke="#F59E0B" strokeWidth={0.5} strokeDasharray="3,3" opacity={0.5}/>
          <circle cx={majorityPos.x} cy={majorityPos.y} r={9} fill="none" stroke="#F59E0B" strokeWidth={0.8} strokeDasharray="3,2" opacity={0.7}/>
          <text x={majorityPos.x + 12} y={majorityPos.y + 3} fontSize={8} fill="#F59E0B" fontFamily="var(--ff-mono)" opacity={0.9} fontWeight="600">151</text>
        </>)}
        {GR_HEMI_POSITIONS.map((pos, i) => (
          <circle
            key={i} cx={pos.x} cy={pos.y} r={4.4}
            fill={seatColors[i] === "transparent" ? "var(--btn-bg)" : seatColors[i]}
            opacity={seatColors[i] === "transparent" ? 0 : rendered ? 0.93 : 0}
            style={{ transition: `opacity 0.35s ${EASE_OUT} ${Math.min(i * 0.0015, 0.45)}s` }}
          />
        ))}
        {hasMajority && <circle cx={GR_HEMI_CX} cy={GR_HEMI_CY} r={18} fill={winnerColor} opacity={0.07}/>}
        {["Left", "Center", "Right"].map((label, i) => (
          <text key={label} x={i === 0 ? 40 : i === 1 ? GR_HEMI_CX : GR_HEMI_W - 40} y={GR_HEMI_CY + 15} fontSize={8} fill="var(--text-dim)" fontFamily="var(--ff-body)" letterSpacing={1.5} textAnchor={i === 0 ? "start" : i === 1 ? "middle" : "end"}>{t(label)}</text>
        ))}
      </svg>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px 14px", padding: "0 16px 10px", justifyContent: "center" }}>
        {(results || []).map(r => {
          let p = parties.find(x => x.id === r.id);
          return (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: p?.color || "var(--text-muted)" }}/>
              <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--ff-body)" }}>
                {tPartyName(lang, p)} <strong style={{ color: p?.color || "var(--text-title)", fontSize: 12 }}>{r.seats}</strong>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});
