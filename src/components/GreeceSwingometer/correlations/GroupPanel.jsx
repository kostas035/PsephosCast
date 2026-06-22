import { useState } from "react";
import { S } from "../GreeceStyles";
import { fmtP } from "../greece-stats.js";

// Standard Academic Significance Stars
const getStars = (p) => {
  if (p == null || isNaN(p)) return "";
  if (p < 0.001) return <span style={{ color: "#10B981", fontWeight: 900 }}>***</span>;
  if (p < 0.01) return <span style={{ color: "#3B82F6", fontWeight: 700 }}>**</span>;
  if (p < 0.05) return <span style={{ color: "#F59E0B", fontWeight: 700 }}>*</span>;
  return "";
};

export default function GroupPanel({ data }) {
  const [cfg, setCfg] = useState({ open: false, showBars: true, color: "#8B5CF6" });
  if (!data) return null;

  // Render a visual bar for the mean comparisons
  const GroupBar = ({ label, mean, maxMean, color }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
      <div style={{ width: 80, fontSize: 10, textAlign: "right", color: "var(--text-main)" }}>{label}</div>
      <div style={{ flex: 1, background: "var(--bg-base)", borderRadius: 3, height: 12, overflow: "hidden", border: "1px solid var(--border)" }}>
        <div style={{ width: `${(mean / (maxMean || 1)) * 100}%`, background: color, height: "100%", transition: "width 0.5s ease" }} />
      </div>
      <div style={{ width: 40, fontSize: 10, fontFamily: "var(--ff-mono)", color: "var(--text-dim)" }}>{mean?.toFixed(1)}%</div>
    </div>
  );

  const renderFactor = (factorData, title) => {
    // GUARD: Safely exit if the group analysis returned null (e.g., < 2 groups valid)
    if (!factorData) return null; 
    
    const { anova, kw, tukey } = factorData;
    return (
      <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px dashed var(--border)" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-main)", marginBottom: 8 }}>📊 {title}</div>
        
        {/* GUARD: Optional chaining added to all ANOVA and KW properties */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 10, fontFamily: "var(--ff-mono)", color: "var(--text-dim)", marginBottom: 12 }}>
          <span>ANOVA: F({anova?.dfb}, {anova?.dfw}) = {anova?.F?.toFixed(2)} (p={fmtP(anova?.p)}{getStars(anova?.p)})</span>
          <span>η² = {anova?.etaSquared?.toFixed(3)}</span>
          <span>Kruskal-Wallis: H = {kw?.H?.toFixed(2)} (p={fmtP(kw?.p)}{getStars(kw?.p)})</span>
        </div>
        
        {tukey && tukey.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10, fontFamily: "var(--ff-mono)", color: "var(--text-main)" }}>
              <thead>
                <tr style={{ background: "var(--bg-up)" }}>
                  <th style={{ padding: 4, textAlign: "left", border: "1px solid var(--border)" }}>Tukey HSD Pair</th>
                  <th style={{ padding: 4, textAlign: "left", border: "1px solid var(--border)" }}>Mean Diff</th>
                  <th style={{ padding: 4, textAlign: "left", border: "1px solid var(--border)" }}>p-value</th>
                </tr>
              </thead>
              <tbody>
                {tukey.map((t, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
                    <td style={{ padding: 4, border: "1px solid var(--border)" }}>{t.pair}</td>
                    <td style={{ padding: 4, border: "1px solid var(--border)" }}>{t.diff?.toFixed(3)}</td>
                    <td style={{ padding: 4, border: "1px solid var(--border)", color: t.p < 0.05 ? "#10B981" : "inherit" }}>
                      {fmtP(t.p)} {getStars(t.p)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ ...S.card, padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, borderBottom: "1px solid var(--divider)", paddingBottom: 10 }}>
        <span style={{ ...S.label, color: "#3B82F6", fontWeight: 700, letterSpacing: 1.5 }}>Module: Group Comparisons</span>
        <button onClick={() => setCfg({ ...cfg, open: !cfg.open })} style={{ background: cfg.open ? "var(--bg-up)" : "transparent", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: 14 }}>⚙️</button>
      </div>

      {cfg.open && (
        <div style={{ background: "var(--bg-base)", padding: "12px 16px", borderRadius: 6, marginBottom: 20, border: "1px solid var(--border)", display: "flex", gap: 24 }}>
          <label style={{ fontSize: 11, color: "var(--text-main)", display: "flex", alignItems: "center", gap: 8, fontWeight: 600, cursor: "pointer" }}>
            <input type="checkbox" checked={cfg.showBars} onChange={() => setCfg({ ...cfg, showBars: !cfg.showBars })} />
            Render Inline Mean Bar Charts
          </label>
          <label style={{ fontSize: 11, color: "var(--text-main)", display: "flex", alignItems: "center", gap: 8, fontWeight: 600 }}>
            Bar Color:
            <input type="color" value={cfg.color} onChange={e => setCfg({ ...cfg, color: e.target.value })} style={{ cursor: "pointer", padding: 0, border: "none", width: 24, height: 24, borderRadius: 4 }} />
          </label>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        {Object.entries(data).map(([y, tests]) => {
          const maxIsl = Math.max(tests.island.t.meanA || 0, tests.island.t.meanB || 0);
          const maxUrb = Math.max(tests.urban.t.meanA || 0, tests.urban.t.meanB || 0);
          return (
            <div key={y} style={{ border: "1px solid var(--border)", borderRadius: 6, padding: 12, background: "var(--bg-mid)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-title)", marginBottom: 8, borderBottom: "1px solid var(--divider)", paddingBottom: 4 }}>
                Dependent Variable: {y.replace("base_", "")}
              </div>
              
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-main)", marginBottom: 4 }}>🏝️ Islands vs Mainland</div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontFamily: "var(--ff-mono)", color: "var(--text-dim)" }}>
                  <span>Cohen's d: {tests.island.t.cohenD?.toFixed(2) ?? "—"}</span>
                  <span>Welch t p-val: {fmtP(tests.island.t.p)} {getStars(tests.island.t.p)}</span>
                </div>
                {cfg.showBars && (
                  <div style={{ marginTop: 8, padding: 8, background: "rgba(0,0,0,0.1)", borderRadius: 4 }}>
                    <GroupBar label="Islands" mean={tests.island.t.meanA} maxMean={maxIsl} color={cfg.color} />
                    <GroupBar label="Mainland" mean={tests.island.t.meanB} maxMean={maxIsl} color="var(--text-dim)" />
                  </div>
                )}
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-main)", marginBottom: 4 }}>🏢 Urban vs Rural</div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontFamily: "var(--ff-mono)", color: "var(--text-dim)" }}>
                  <span>Cohen's d: {tests.urban.t.cohenD?.toFixed(2) ?? "—"}</span>
                  <span>Welch t p-val: {fmtP(tests.urban.t.p)} {getStars(tests.urban.t.p)}</span>
                </div>
                {cfg.showBars && (
                  <div style={{ marginTop: 8, padding: 8, background: "rgba(0,0,0,0.1)", borderRadius: 4 }}>
                    <GroupBar label="Urban (>70%)" mean={tests.urban.t.meanA} maxMean={maxUrb} color={cfg.color} />
                    <GroupBar label="Rural" mean={tests.urban.t.meanB} maxMean={maxUrb} color="var(--text-dim)" />
                  </div>
                )}
              </div>

              {/* GUARD: Optional chaining checks if the analysis object actually exists before rendering */}
              {tests?.byRegion && renderFactor(tests.byRegion, "By Administrative Region")}
              {tests?.byEconomy && renderFactor(tests.byEconomy, "By Primary Economy (District Level)")}
            </div>
          );
        })}
      </div>
      
      {/* Universal Legend */}
      <div style={{ fontSize: 9, color: "var(--text-dim)", marginTop: 12, textAlign: "right", fontFamily: "var(--ff-body)" }}>
        Significance: <span style={{color:"#10B981"}}>***</span> p&lt;0.001, <span style={{color:"#3B82F6"}}>**</span> p&lt;0.01, <span style={{color:"#F59E0B"}}>*</span> p&lt;0.05
      </div>
    </div>
  );
}
