// cyprus-results.jsx
// Seat-distribution table + headline metric cards.
import { memo } from "react";
import { CY } from "./cyprus-data.js";
import { cyFmtVotes, cyFmtVotesShort } from "./cyprus-engine.js";
import { S, EASE_SPRING, EASE_STD } from "./cyprus-ui.jsx";

export const CyResultsTable = memo(function CyResultsTable({ electionResult, parties, turnout, isEstimate, threshold }) {
  const { results, eliminated, eliminatedDetail } = electionResult;
  if (!results?.length) return null;
  return (
    <div style={S.card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={S.label}>Seat Distribution</div>
        {turnout > 0 && <div style={{ fontSize: 9, color: "var(--text-dim)", ...S.mono, letterSpacing: 1 }}>{isEstimate ? "EST. " : ""}{cyFmtVotesShort(turnout)} votes</div>}
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 440 }}>
          <thead>
            <tr>
              {["Party", "Vote %", "After Threshold", turnout ? "Votes" : null, "Seats", "Share"]
                .filter(Boolean)
                .map(h => (
                  <th key={h} style={{ fontSize: 8, color: "var(--text-dim)", letterSpacing: 1.5, fontFamily: "var(--ff-body)", textAlign: h === "Party" ? "left" : "right", padding: "4px 8px 8px", borderBottom: "1px solid var(--border)", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
            </tr>
          </thead>
          <tbody>
            {results.map((r, idx) => {
              const p = parties.find(x => x.id === r.id);
              const barW = (r.seats / CY.TOTAL_SEATS) * 100;

              return (
                <tr key={r.id} style={{ borderBottom: "1px solid var(--border)", background: idx % 2 ? "var(--table-stripe)" : "transparent" }}>
                  <td style={{ padding: "7px 8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <div style={{ width: 3, height: 20, borderRadius: 2, background: p?.color ?? "var(--text-muted)", flexShrink: 0 }}/>
                      <span style={{ fontSize: 12, color: "var(--text-bright)", fontFamily: "var(--ff-body)", fontWeight: 600 }}>{p?.name}</span>
                      <span style={{ fontSize: 9, color: "var(--text-muted)", fontFamily: "var(--ff-body)" }}>{p?.fullName}</span>
                      {r.isWinner && <span style={{ fontSize: 7, color: "#D97706", background: "var(--bonus-bg)", padding: "1px 6px", borderRadius: 3, fontFamily: "var(--ff-body)", letterSpacing: 1.2, border: "1px solid var(--bonus-border)" }}>FIRST</span>}
                    </div>
                  </td>
                  <td style={{ fontSize: 11, color: "var(--text-muted)", ...S.mono, textAlign: "right", padding: "7px 8px" }}>{(r.nationalPct ?? 0).toFixed(2)}%</td>
                  <td style={{ fontSize: 11, color: "var(--text-main)",  ...S.mono, textAlign: "right", padding: "7px 8px" }}>{(r.finalPct    ?? 0).toFixed(2)}%</td>
                  {turnout > 0 && <td style={{ fontSize: 10, color: "var(--text-main)", ...S.mono, textAlign: "right", padding: "7px 8px", whiteSpace: "nowrap" }}>{cyFmtVotes(r.votes)}</td>}
                  <td style={{ padding: "7px 8px" }}>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "flex-end", gap: 5 }}>
                      <span style={{ fontSize: 18, fontWeight: 800, color: p?.color ?? "var(--text-title)", fontFamily: "var(--ff-head)", lineHeight: 1 }}>{r.seats}</span>
                    </div>
                  </td>
                  <td style={{ padding: "7px 8px", width: 100 }}>
                    <div style={{ background: "var(--bg-up)", borderRadius: 2, height: 5, overflow: "hidden", marginBottom: 2 }}>
                      <div style={{ background: p?.color ?? "var(--text-muted)", height: "100%", width: `${barW}%`, borderRadius: 2, transition: `width 0.45s ${EASE_SPRING}` }}/>
                    </div>
                    <div style={{ fontSize: 8, color: "var(--text-dim)", ...S.mono, textAlign: "right" }}>{barW.toFixed(1)}%</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {(eliminatedDetail?.length > 0 || eliminated?.length > 0) && (
        <div style={{ marginTop: 8, padding: "8px 12px", background: "var(--elim-bg)", borderRadius: 4, border: "1px solid var(--elim-border)" }}>
          <div style={{ fontSize: 9, color: "#7F1D1D", fontFamily: "var(--ff-body)", letterSpacing: 0.5 }}>
            <strong style={{ color: "#DC2626" }}>Below {threshold}%:</strong> {eliminated?.join(", ")} — redistributed
          </div>
        </div>
      )}
    </div>
  );
});

export const CyMetricsCards = memo(function CyMetricsCards({ electionResult, parties, isMobile, turnout, isEstimate }) {
  const { results } = electionResult;
  if (!results?.length) return null;
  const winner = results[0];
  const wp     = parties.find(p => p.id === winner.id);
  const hasMaj = winner.seats >= CY.MAJORITY;
  const cards  = [
    { label: "First Place",      value: `${winner.nationalPct?.toFixed(1)}%`, sub: wp?.fullName || winner.name,                   accent: wp?.color || "#fff"  },
    { label: "Winner Seats",     value: winner.seats,                          sub: `${CY.TOTAL_SEATS} total seats`,               accent: wp?.color || "#fff"  },
    { label: "Turnout (est.)",   value: cyFmtVotesShort(turnout),              sub: isEstimate ? "projected estimate" : "actual votes cast", accent: "#3B82F6" },
    { label: hasMaj ? "Majority" : "Seats Short",
      value: hasMaj ? `+${winner.seats - CY.MAJORITY}` : `${CY.MAJORITY - winner.seats}`,
      sub:   hasMaj ? `${winner.seats} of ${CY.MAJORITY} needed` : "coalition required",
      accent: hasMaj ? "#34D399" : "#F87171" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: 10, marginBottom: 14 }}>
      {cards.map((c, i) => (
        <div key={i} style={{ background: "var(--bg-mid)", border: `1px solid ${c.accent}33`, borderRadius: 10, padding: "12px 16px", position: "relative", overflow: "hidden", transition: `border-color 0.35s ${EASE_STD}` }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(to right,transparent,${c.accent},transparent)`, transition: `opacity 0.35s ${EASE_STD}` }}/>
          <div style={{ ...S.label, marginBottom: 6 }}>{c.label}</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: c.accent, lineHeight: 1, fontFamily: "var(--ff-head)", letterSpacing: -0.5, transition: `color 0.3s ${EASE_STD}` }}>{c.value}</div>
          <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 5, fontFamily: "var(--ff-body)" }}>{c.sub}</div>
        </div>
      ))}
    </div>
  );
});
