import { useState } from "react";
import { S } from "../GreeceStyles";
import { Histogram, QQPlot, BoxPlot } from "../GreecePlots.jsx";
import { fmtP } from "../greece-stats.js";

export default function DescriptivesPanel({ data, viz }) {
  const [cfg, setCfg] = useState({ open: false, histColor: "#3B82F6", qqColor: "#10B981", boxColor: "#F59E0B" });
  if (!data) return null;

  return (
    <div style={{ ...S.card, padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, borderBottom: "1px solid var(--divider)", paddingBottom: 10 }}>
        <span style={{ ...S.label, color: "#3B82F6", fontWeight: 700, letterSpacing: 1.5 }}>Module: Descriptives & Normality</span>
        <button onClick={() => setCfg({ ...cfg, open: !cfg.open })} style={{ background: cfg.open ? "var(--bg-up)" : "transparent", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: 14, transition: "all 0.2s" }}>⚙️</button>
      </div>

      {cfg.open && (
        <div style={{ background: "var(--bg-base)", padding: "12px 16px", borderRadius: 6, marginBottom: 20, border: "1px solid var(--border)", display: "flex", gap: 24, flexWrap: "wrap" }}>
          <label style={{ fontSize: 11, color: "var(--text-main)", display: "flex", alignItems: "center", gap: 8, fontWeight: 600 }}>
            Histogram Color:
            <input type="color" value={cfg.histColor} onChange={e => setCfg({ ...cfg, histColor: e.target.value })} style={{ cursor: "pointer", padding: 0, border: "none", width: 24, height: 24, borderRadius: 4 }} />
          </label>
          <label style={{ fontSize: 11, color: "var(--text-main)", display: "flex", alignItems: "center", gap: 8, fontWeight: 600 }}>
            Q-Q Plot Color:
            <input type="color" value={cfg.qqColor} onChange={e => setCfg({ ...cfg, qqColor: e.target.value })} style={{ cursor: "pointer", padding: 0, border: "none", width: 24, height: 24, borderRadius: 4 }} />
          </label>
          <label style={{ fontSize: 11, color: "var(--text-main)", display: "flex", alignItems: "center", gap: 8, fontWeight: 600 }}>
            Box Plot Color:
            <input type="color" value={cfg.boxColor} onChange={e => setCfg({ ...cfg, boxColor: e.target.value })} style={{ cursor: "pointer", padding: 0, border: "none", width: 24, height: 24, borderRadius: 4 }} />
          </label>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        {Object.entries(data).map(([col, stats]) => (
          <div key={col} style={{ border: "1px solid var(--border)", borderRadius: 6, padding: 12, background: "var(--bg-mid)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-title)", marginBottom: 8, borderBottom: "1px solid var(--divider)", paddingBottom: 4 }}>
              Variable: {col.replace("base_", "")}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: "var(--ff-mono)", color: "var(--text-main)", marginBottom: 4 }}>
              <span>Mean: {stats.mean?.toFixed(2) ?? "—"}</span>
              <span>Med: {stats.median?.toFixed(2) ?? "—"}</span>
              <span>SD: {stats.sd?.toFixed(2) ?? "—"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontFamily: "var(--ff-mono)", color: "var(--text-dim)", marginBottom: 4 }}>
              <span>Min/Max: {stats.min?.toFixed(1) ?? "—"} / {stats.max?.toFixed(1) ?? "—"}</span>
              <span>IQR: {stats.iqr?.toFixed(2) ?? "—"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontFamily: "var(--ff-mono)", color: "var(--text-dim)", marginBottom: 4 }}>
              <span>CV: {stats.cv?.toFixed(1) ?? "—"}%</span>
              <span>95% CI: [{stats.ciMean?.[0]?.toFixed(1) ?? "—"}, {stats.ciMean?.[1]?.toFixed(1) ?? "—"}]</span>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontFamily: "var(--ff-mono)", color: "var(--text-dim)", marginTop: 6, borderTop: "1px dashed var(--border)", paddingTop: 4 }}>
              <span>Skew: {stats.skew !== null ? stats.skew?.toFixed(2) : "—"}</span>
              <span>Kurt: {stats.kurt !== null ? stats.kurt?.toFixed(2) : "—"}</span>
            </div>
            
            <div style={{ fontSize: 10, fontFamily: "var(--ff-mono)", color: "var(--text-dim)", marginTop: 4 }}>
              {stats.isBinary ? (
                <span style={{ fontStyle: "italic", opacity: 0.8 }}>Normality tests skipped (binary variable)</span>
              ) : (
                <span>S-W W={stats.shapiro?.W?.toFixed(3) ?? "—"} (p={fmtP(stats.shapiro?.p)}) · KS D={stats.ks?.D?.toFixed(3) ?? "—"} (p≈{fmtP(stats.ks?.p)})</span>
              )}
            </div>

            <div style={{ marginTop: 8, fontSize: 10, fontFamily: "var(--ff-body)", color: "var(--text-dim)" }}>
              {stats.isBinary ? (
                <span style={{ opacity: 0.7 }}>No outliers (binary variable)</span>
              ) : stats.outlierList && stats.outlierList.length > 0 ? (
                <span style={{ color: "#EF4444" }}><strong>Outliers (1.5×IQR):</strong> {stats.outlierList.map(o => `${o.label} (${o.stat?.toFixed(2)})`).join(", ")}</span>
              ) : <span style={{ opacity: 0.7 }}>No outliers (1.5×IQR rule)</span>}
            </div>
            
            {viz.distributions && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginTop: 16, paddingTop: 16, borderTop: '1px dashed var(--border)' }}>
                <Histogram values={stats.raw || []} color={cfg.histColor} xLabel={col.replace("base_", "")} height={120} />
                <QQPlot values={stats.raw || []} color={cfg.qqColor} title="Q-Q Plot" height={120} />
                <BoxPlot values={stats.raw || []} color={cfg.boxColor} title="Box Plot" height={120} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
