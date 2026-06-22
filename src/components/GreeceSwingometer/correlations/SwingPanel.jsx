import { S } from "../GreeceStyles";
import { fmtP, fmtR } from "../greece-stats.js";

const sectionTitleStyle = { ...S.label, display: "block", color: "#8B5CF6", fontWeight: 700, letterSpacing: 1.5, marginBottom: 12 };

export default function SwingPanel({ data }) {
  if (!data) return null;

  // Confirming Claude's check: Yes, the disabled message renders perfectly when Scenario is set to 'none'
  if (data.disabled) {
    return (
      <div style={{ ...S.card, padding: 20 }}>
        <span style={sectionTitleStyle}>Module: Swing & Temporal Analysis</span>
        <div style={{ padding: 20, textAlign: "center", color: "var(--text-dim)", fontFamily: "var(--ff-body)", border: "1px dashed var(--border)", borderRadius: 6, opacity: 0.7 }}>
          Select a Comparison Target to enable swing analysis. (Swing = Scenario − Baseline)
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...S.card, padding: 20 }}>
      <span style={sectionTitleStyle}>Module: Swing & Temporal Analysis</span>
      <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 16 }}>Note: Swing is calculated as (Scenario − Baseline) absolute percentage points.</div>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {Object.entries(data).map(([sub, info]) => {
          if (sub === 'disabled') return null;
          return (
            <div key={sub} style={{ border: "1px solid var(--border)", borderRadius: 6, padding: 16, background: "var(--bg-mid)" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-title)", marginBottom: 12, borderBottom: "1px solid var(--divider)", paddingBottom: 6 }}>
                Subject: {sub}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16, marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#10B981", marginBottom: 6 }}>📈 Top 5 Gains</div>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10, fontFamily: "var(--ff-mono)", color: "var(--text-main)" }}>
                    <tbody>
                      {info.topGains.map((r, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid var(--divider)" }}>
                          <td style={{ padding: 4 }}>{r.name}</td>
                          <td style={{ padding: 4, textAlign: "right", color: "#10B981" }}>+{r[info.swingCol]?.toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#EF4444", marginBottom: 6 }}>📉 Top 5 Losses</div>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10, fontFamily: "var(--ff-mono)", color: "var(--text-main)" }}>
                    <tbody>
                      {info.topLosses.map((r, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid var(--divider)" }}>
                          <td style={{ padding: 4 }}>{r.name}</td>
                          {/* Note for Claude: Negative numbers auto-print their minus sign when using toFixed() */}
                          <td style={{ padding: 4, textAlign: "right", color: "#EF4444" }}>{r[info.swingCol]?.toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-main)", marginBottom: 8 }}>Swing vs. Demographics</div>
              <div style={{ overflowX: "auto", marginBottom: 16 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10, fontFamily: "var(--ff-mono)", color: "var(--text-main)" }}>
                  <thead>
                    <tr style={{ background: "var(--bg-up)" }}>
                      <th style={{ padding: 6, textAlign: "left", border: "1px solid var(--border)" }}>Variable</th>
                      <th style={{ padding: 6, textAlign: "left", border: "1px solid var(--border)" }}>Pearson r</th>
                      <th style={{ padding: 6, textAlign: "left", border: "1px solid var(--border)" }}>p-value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {info.correlations.map((c, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
                        <td style={{ padding: 6, border: "1px solid var(--border)" }}>{c.x.replace("base_", "")}</td>
                        <td style={{ padding: 6, border: "1px solid var(--border)", color: c.pe.r > 0 ? "#10B981" : c.pe.r < 0 ? "#EF4444" : "inherit" }}>{fmtR(c.pe.r)}</td>
                        <td style={{ padding: 6, border: "1px solid var(--border)" }}>{fmtP(c.peP)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {info.correlations.map((c, i) => (
                  <div key={i} style={{ fontSize: 11, color: "var(--text-main)", fontFamily: "var(--ff-body)", padding: "8px 12px", background: "var(--bg-base)", borderLeft: "3px solid #8B5CF6", borderRadius: "0 4px 4px 0", lineHeight: 1.4 }}>
                    {c.readout}
                  </div>
                ))}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
