import { useState, useMemo } from "react";
import { S } from "../GreeceStyles";
import { CorrelationHeatmap } from "../GreecePlots.jsx";
import GreeceScatter from "../GreeceScatter.jsx";
import { fmtP, fmtR, buildReadout } from "../greece-stats.js";

// Standard Academic Significance Stars
const getStars = (p) => {
  if (p == null || isNaN(p)) return "";
  if (p < 0.001) return <span style={{ color: "#10B981", fontWeight: 900 }}>***</span>;
  if (p < 0.01) return <span style={{ color: "#3B82F6", fontWeight: 700 }}>**</span>;
  if (p < 0.05) return <span style={{ color: "#F59E0B", fontWeight: 700 }}>*</span>;
  return "";
};

export default function BivariatePanel({ data, meta, frame, viz, DEMO_FIELDS }) {
  const [cfg, setCfg] = useState({ open: false, showTrendline: true });
  const [sigOnly, setSigOnly] = useState(false);
  const [sortDir, setSortDir] = useState(null); // null | "desc" | "asc" — by |Pearson r|

  const displayPairs = useMemo(() => {
    if (!data) return [];
    let rows = sigOnly ? data.pairs.filter(p => p.pearsonP < 0.05) : data.pairs;
    if (sortDir) {
      rows = [...rows].sort((a, b) => {
        const d = Math.abs(b.pearson.r || 0) - Math.abs(a.pearson.r || 0);
        return sortDir === "desc" ? d : -d;
      });
    }
    return rows;
  }, [data, sigOnly, sortDir]);

  if (!data) return null;

  const cycleSortDir = () => setSortDir(prev => (prev === null ? "desc" : prev === "desc" ? "asc" : null));

  return (
    <div style={{ ...S.card, padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, borderBottom: "1px solid var(--divider)", paddingBottom: 10 }}>
        <span style={{ ...S.label, color: "#3B82F6", fontWeight: 700, letterSpacing: 1.5 }}>Module: Bivariate Association Matrix</span>
        <button onClick={() => setCfg({ ...cfg, open: !cfg.open })} style={{ background: cfg.open ? "var(--bg-up)" : "transparent", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: 14 }}>⚙️</button>
      </div>

      {cfg.open && (
        <div style={{ background: "var(--bg-base)", padding: "12px 16px", borderRadius: 6, marginBottom: 20, border: "1px solid var(--border)", display: "flex", gap: 24, flexWrap: "wrap" }}>
          {viz.scatter && (
            <label style={{ fontSize: 11, color: "var(--text-main)", display: "flex", alignItems: "center", gap: 8, fontWeight: 600, cursor: "pointer" }}>
              <input type="checkbox" checked={cfg.showTrendline} onChange={() => setCfg({ ...cfg, showTrendline: !cfg.showTrendline })} />
              Render OLS Trendline in Scatters
            </label>
          )}
          <label style={{ fontSize: 11, color: "var(--text-main)", display: "flex", alignItems: "center", gap: 8, fontWeight: 600, cursor: "pointer" }}>
            <input type="checkbox" checked={sigOnly} onChange={() => setSigOnly(v => !v)} />
            Significant only (p&lt;0.05)
          </label>
        </div>
      )}

      {viz.heatmap && <CorrelationHeatmap matrix={data.matrix} yLabels={meta.subjects} xLabels={DEMO_FIELDS.filter(d => meta.vars.includes(d.field)).map(d => d.label)} />}

      <div style={{ marginTop: 20, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10, fontFamily: "var(--ff-mono)", color: "var(--text-main)" }}>
          <thead>
            <tr style={{ background: "var(--bg-up)" }}>
              <th style={{ padding: 6, textAlign: "left", border: "1px solid var(--border)" }}>Dependent (Y)</th>
              <th style={{ padding: 6, textAlign: "left", border: "1px solid var(--border)" }}>Independent (X)</th>
              <th onClick={cycleSortDir} title="Click to sort by |r|" style={{ padding: 6, textAlign: "left", border: "1px solid var(--border)", cursor: "pointer", userSelect: "none" }}>
                Pearson r (p, 95% CI) {sortDir === "desc" ? "▼|r|" : sortDir === "asc" ? "▲|r|" : ""}
              </th>
              <th style={{ padding: 6, textAlign: "left", border: "1px solid var(--border)" }}>Spearman ρ (p)</th>
              <th style={{ padding: 6, textAlign: "left", border: "1px solid var(--border)" }}>Kendall τ (p-val)</th>
            </tr>
          </thead>
          <tbody>
            {displayPairs.map((p, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
                <td style={{ padding: 6, border: "1px solid var(--border)", fontWeight: 700 }}>{p.y.replace("base_", "")}</td>
                <td style={{ padding: 6, border: "1px solid var(--border)" }}>{p.x.replace("base_", "")}</td>
                <td style={{ padding: 6, border: "1px solid var(--border)", color: p.pearson.r > 0 ? "#10B981" : p.pearson.r < 0 ? "#EF4444" : "var(--text-main)" }}>
                  {fmtR(p.pearson.r)} (p={fmtP(p.pearsonP)}{getStars(p.pearsonP)}, 95% CI [{fmtR(p.ci[0])}, {fmtR(p.ci[1])}])
                </td>
                <td style={{ padding: 6, border: "1px solid var(--border)" }}>
                  {fmtR(p.spearman.rho)} (p={fmtP(p.spearmanP)}{getStars(p.spearmanP)})
                </td>
                <td style={{ padding: 6, border: "1px solid var(--border)" }}>
                  {fmtR(p.kendall.tau)} (p={fmtP(p.kendall.p)}{getStars(p.kendall.p)})
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ fontSize: 9, color: "var(--text-dim)", marginTop: 6, textAlign: "right", fontFamily: "var(--ff-body)" }}>
          Significance: <span style={{color:"#10B981"}}>***</span> p&lt;0.001, <span style={{color:"#3B82F6"}}>**</span> p&lt;0.01, <span style={{color:"#F59E0B"}}>*</span> p&lt;0.05
        </div>
      </div>

      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        {displayPairs.map((p, i) => (
          <div key={`readout-${i}`} style={{ fontSize: 11, color: "var(--text-main)", fontFamily: "var(--ff-body)", padding: "10px 14px", background: "var(--bg-mid)", borderLeft: "3px solid #3B82F6", borderRadius: "0 6px 6px 0", lineHeight: 1.5 }}>
            {buildReadout({ n: p.pearson.n, r: p.pearson.r, rP: p.pearsonP, rho: p.spearman.rho, ols: p.ols }, { partyName: p.y.replace("base_", ""), demoLabel: p.x.replace("base_", ""), unitLabel: meta.unit === "region" ? "regions" : "districts", baselineLabel: meta.baselineKey })}
          </div>
        ))}
      </div>

      {viz.scatter && (
        <div style={{ marginTop: 24 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-title)", display: "block", marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid var(--divider)" }}>Bivariate Scatters</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {displayPairs.map((p, i) => {
              const pts = [];
              frame.forEach(row => {
                if (typeof row[p.x] === 'number' && isFinite(row[p.x]) && typeof row[p.y] === 'number' && isFinite(row[p.y])) {
                  pts.push({ x: row[p.x], y: row[p.y], label: row.name });
                }
              });
              return (
                <div key={i} style={{ border: '1px solid var(--border)', padding: 12, borderRadius: 6, background: 'var(--bg-mid)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textAlign: 'center', marginBottom: 8, color: 'var(--text-main)' }}>{p.y.replace("base_", "")} vs {p.x.replace("base_", "")}</div>
                  <GreeceScatter points={pts} ols={cfg.showTrendline ? p.ols : null} xLabel={p.x.replace("base_", "")} yLabel={p.y.replace("base_", "")} height={200} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
