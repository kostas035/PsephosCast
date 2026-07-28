// USAResults.jsx — headline metric cards, the 538-seat Electoral College bar,
// and the full state-by-state results table. Mirrors the role cyprus-results.jsx
// plays in the Cyprus app, adapted for winner-take-all EV allocation instead
// of proportional seats.
import { memo, useMemo, useState } from "react";
import { USA, USA_STATE_NAMES, USA_CANDIDATE_DICT, USA_CANDIDATE_LABELS } from "./usa-data.js";
import { usFmtEV } from "./usa-engine.js";
import { S, EASE_SPRING, EASE_STD } from "./usa-ui.jsx";

export const USAElectoralBar = memo(function USAElectoralBar({ electionResult, scenarioYear }) {
  const { gopEV, demEV, otherEV, winnerId } = electionResult;
  const labels = USA_CANDIDATE_LABELS[scenarioYear] || { gop: "GOP", dem: "DEM" };
  const gopPct = (gopEV / USA.TOTAL_EV) * 100;
  const demPct = (demEV / USA.TOTAL_EV) * 100;
  const otherPct = (otherEV / USA.TOTAL_EV) * 100;
  const majorityPct = (USA.MAJORITY_EV / USA.TOTAL_EV) * 100;

  return (
    <div style={S.card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
        <span style={S.label}>Electoral College — {USA.TOTAL_EV} Votes</span>
        <span style={{ fontSize: 9, color: "var(--text-dim)", ...S.mono, letterSpacing: 1 }}>{USA.MAJORITY_EV} TO WIN</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "baseline" }}>
        <div>
          <span style={{ fontSize: 26, fontWeight: 900, color: USA_CANDIDATE_DICT.gop.color, fontFamily: "var(--ff-head)" }}>{usFmtEV(gopEV)}</span>
          <span style={{ fontSize: 10, color: "var(--text-dim)", marginLeft: 6, ...S.mono }}>{labels.gop.toUpperCase()}</span>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: 10, color: "var(--text-dim)", marginRight: 6, ...S.mono }}>{labels.dem.toUpperCase()}</span>
          <span style={{ fontSize: 26, fontWeight: 900, color: USA_CANDIDATE_DICT.dem.color, fontFamily: "var(--ff-head)" }}>{usFmtEV(demEV)}</span>
        </div>
      </div>
      <div style={{ position: "relative", height: 22, borderRadius: 5, overflow: "hidden", background: "var(--border)", display: "flex" }}>
        <div style={{ width: `${gopPct}%`, background: USA_CANDIDATE_DICT.gop.color, transition: `width 0.5s ${EASE_SPRING}` }} />
        <div style={{ width: `${otherPct}%`, background: USA_CANDIDATE_DICT.other.color, transition: `width 0.5s ${EASE_SPRING}` }} />
        <div style={{ width: `${demPct}%`, background: USA_CANDIDATE_DICT.dem.color, transition: `width 0.5s ${EASE_SPRING}` }} />
        <div style={{ position: "absolute", left: `${majorityPct}%`, top: 0, bottom: 0, width: 2, background: "#fff", boxShadow: "0 0 0 1px rgba(0,0,0,0.4)" }} title="270 to win" />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        <span style={{ fontSize: 9, color: "var(--text-muted)", ...S.mono }}>{winnerId === "gop" ? "GOP wins" : winnerId === "dem" ? "DEM wins" : "Deadlock — House decides"}</span>
        {otherEV > 0 && <span style={{ fontSize: 9, color: "var(--text-muted)", ...S.mono }}>{usFmtEV(otherEV)} other</span>}
      </div>
    </div>
  );
});

export const USAMetricsCards = memo(function USAMetricsCards({ electionResult, scenarioYear, isMobile }) {
  const { gopEV, demEV, winnerId, nationalPct, tippingPoint, majorityReached } = electionResult;
  const labels = USA_CANDIDATE_LABELS[scenarioYear] || { gop: "GOP", dem: "DEM" };
  const winnerEV = winnerId === "gop" ? gopEV : demEV;
  const winnerColor = winnerId === "gop" ? USA_CANDIDATE_DICT.gop.color : USA_CANDIDATE_DICT.dem.color;
  const winnerLabel = winnerId === "gop" ? labels.gop : labels.dem;
  const popMargin = (nationalPct.gop ?? 0) - (nationalPct.dem ?? 0);

  const cards = [
    { label: "Projected Winner", value: winnerLabel, sub: `${usFmtEV(winnerEV)} electoral votes`, accent: winnerColor },
    { label: "National Popular Vote", value: `${Math.abs(popMargin).toFixed(1)}pt`, sub: `${popMargin >= 0 ? labels.gop : labels.dem} leads nationally`, accent: popMargin >= 0 ? USA_CANDIDATE_DICT.gop.color : USA_CANDIDATE_DICT.dem.color },
    { label: "Tipping-Point State", value: tippingPoint ? tippingPoint.abbr : "—", sub: tippingPoint ? `${USA_STATE_NAMES[tippingPoint.abbr]} · ${tippingPoint.margin.toFixed(1)}pt` : "n/a", accent: "#EAB308" },
    { label: majorityReached ? "Majority" : "EV Short", value: majorityReached ? `+${winnerEV - USA.MAJORITY_EV}` : `${USA.MAJORITY_EV - winnerEV}`, sub: `${winnerEV} of ${USA.MAJORITY_EV} needed`, accent: majorityReached ? "#34D399" : "#F87171" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: 10, marginBottom: 14 }}>
      {cards.map((c, i) => (
        <div key={i} style={{ background: "var(--bg-mid)", border: `1px solid ${c.accent}33`, borderRadius: 10, padding: "12px 16px", position: "relative", overflow: "hidden", transition: `border-color 0.35s ${EASE_STD}` }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(to right,transparent,${c.accent},transparent)` }} />
          <div style={{ ...S.label, marginBottom: 6 }}>{c.label}</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: c.accent, lineHeight: 1.15, fontFamily: "var(--ff-head)", letterSpacing: -0.3, transition: `color 0.3s ${EASE_STD}` }}>{c.value}</div>
          <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 5, fontFamily: "var(--ff-body)" }}>{c.sub}</div>
        </div>
      ))}
    </div>
  );
});

export const USAResultsTable = memo(function USAResultsTable({ electionResult, scenarioYear }) {
  const [sortBy, setSortBy] = useState("margin");
  const labels = USA_CANDIDATE_LABELS[scenarioYear] || { gop: "GOP", dem: "DEM" };

  const rows = useMemo(() => {
    const arr = Object.values(electionResult.stateResults);
    const sorted = [...arr].sort((a, b) => {
      if (sortBy === "margin") return a.margin - b.margin;
      if (sortBy === "ev") return b.ev - a.ev;
      return USA_STATE_NAMES[a.abbr].localeCompare(USA_STATE_NAMES[b.abbr]);
    });
    return sorted;
  }, [electionResult, sortBy]);

  return (
    <div style={S.card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={S.label}>State-by-State Results</span>
        <div style={{ display: "flex", gap: 4 }}>
          {[["margin", "Closest"], ["ev", "By EV"], ["name", "A–Z"]].map(([id, l]) => (
            <button key={id} onClick={() => setSortBy(id)}
              style={{ fontSize: 8, padding: "3px 7px", borderRadius: 3, border: "1px solid var(--border)", cursor: "pointer", background: sortBy === id ? "var(--tab-active)" : "transparent", color: sortBy === id ? "#60A5FA" : "var(--text-dim)", fontFamily: "var(--ff-body)", letterSpacing: 1, textTransform: "uppercase" }}>{l}</button>
          ))}
        </div>
      </div>
      <div style={{ overflowX: "auto", maxHeight: 420, overflowY: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 460 }}>
          <thead>
            <tr>
              {["State", "EV", labels.gop, labels.dem, "Margin"].map(h => (
                <th key={h} style={{ position: "sticky", top: 0, background: "var(--bg-mid)", fontSize: 8, color: "var(--text-dim)", letterSpacing: 1.5, fontFamily: "var(--ff-body)", textAlign: h === "State" ? "left" : "right", padding: "4px 8px 8px", borderBottom: "1px solid var(--border)", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => {
              const winnerColor = USA_CANDIDATE_DICT[r.winner]?.color;
              return (
                <tr key={r.abbr} style={{ borderBottom: "1px solid var(--border)", background: idx % 2 ? "var(--table-stripe)" : "transparent" }}>
                  <td style={{ padding: "6px 8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <div style={{ width: 3, height: 16, borderRadius: 2, background: winnerColor, flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: "var(--text-main)", fontFamily: "var(--ff-body)", fontWeight: 600 }}>{USA_STATE_NAMES[r.abbr]}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 11, color: "var(--text-main)", ...S.mono, textAlign: "right", padding: "6px 8px", fontWeight: 700 }}>{r.ev}</td>
                  <td style={{ fontSize: 10, color: USA_CANDIDATE_DICT.gop.color, ...S.mono, textAlign: "right", padding: "6px 8px" }}>{r.gop.toFixed(1)}%</td>
                  <td style={{ fontSize: 10, color: USA_CANDIDATE_DICT.dem.color, ...S.mono, textAlign: "right", padding: "6px 8px" }}>{r.dem.toFixed(1)}%</td>
                  <td style={{ fontSize: 10, color: "var(--text-main)", ...S.mono, textAlign: "right", padding: "6px 8px", fontWeight: 700 }}>{r.margin.toFixed(1)}pt</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});
