import { useState } from "react";
import { S } from "../GreeceStyles";
import GreeceScatter from "../GreeceScatter.jsx";
import { QQPlot } from "../GreecePlots.jsx";
import { fmtP } from "../greece-stats.js";

// Standard Academic Significance Stars
const getStars = (p) => {
  if (p == null || isNaN(p)) return "";
  if (p < 0.001) return <span style={{ color: "#10B981", fontWeight: 900 }}>***</span>;
  if (p < 0.01) return <span style={{ color: "#3B82F6", fontWeight: 700 }}>**</span>;
  if (p < 0.05) return <span style={{ color: "#F59E0B", fontWeight: 700 }}>*</span>;
  return "";
};

export default function RegressionPanel({ data, meta, frame, viz }) {
  const [cfg, setCfg] = useState({ open: false, showActualVsPredicted: true });
  if (!data) return null;

  return (
    <div style={{ ...S.card, padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, borderBottom: "1px solid var(--divider)", paddingBottom: 10 }}>
        <span style={{ ...S.label, color: "#3B82F6", fontWeight: 700, letterSpacing: 1.5 }}>Module: Multiple OLS Regression Diagnostics</span>
        {viz.residuals && <button onClick={() => setCfg({ ...cfg, open: !cfg.open })} style={{ background: cfg.open ? "var(--bg-up)" : "transparent", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: 14 }}>⚙️</button>}
      </div>

      {cfg.open && viz.residuals && (
        <div style={{ background: "var(--bg-base)", padding: "12px 16px", borderRadius: 6, marginBottom: 20, border: "1px solid var(--border)", display: "flex", gap: 24 }}>
          <label style={{ fontSize: 11, color: "var(--text-main)", display: "flex", alignItems: "center", gap: 8, fontWeight: 600, cursor: "pointer" }}>
            <input type="checkbox" checked={cfg.showActualVsPredicted} onChange={() => setCfg({ ...cfg, showActualVsPredicted: !cfg.showActualVsPredicted })} />
            Render 'Actual vs. Predicted' Model Accuracy Chart
          </label>
        </div>
      )}

      {meta.vars.length > frame.length / 10 && (
        <div style={{ background: "rgba(245, 158, 11, 0.1)", border: "1px solid #F59E0B", color: "#D97706", padding: "10px", borderRadius: "6px", fontSize: "11px", marginBottom: "16px", fontFamily: "var(--ff-body)", fontWeight: 600 }}>
          ⚠ {meta.vars.length} predictors on {frame.length} units — read Adjusted R², not R². Risk of over-fitting.
        </div>
      )}

      {Object.entries(data).map(([y, model]) => {
        const predictors = ["Intercept", ...meta.vars];
        
        const highVifs = [];
        if (model.vif) {
          model.vif.forEach((v, i) => {
             if (v > 5) highVifs.push(`${meta.vars[i].replace("base_", "")} (${v.toFixed(1)})`);
          });
        }

        return (
          <div key={y} style={{ border: "1px solid var(--border)", borderRadius: 6, padding: 12, background: "var(--bg-mid)", marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-title)" }}>Dependent Variable: {y.replace("base_", "")}</div>
            
            {highVifs.length > 0 && (
              <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid #EF4444", color: "#B91C1C", padding: "8px 10px", borderRadius: "4px", fontSize: "11px", marginTop: "10px", fontFamily: "var(--ff-body)", fontWeight: 600 }}>
                ⚠ High Multicollinearity (VIF &gt; 5) detected in: {highVifs.join(", ")}. Coefficients may be unreliable. Try removing overlapping predictors.
              </div>
            )}

            <div style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--ff-mono)", marginTop: 8, display: "flex", gap: 16 }}>
              <span>Adj R²: {model.adjR2?.toFixed(3) || "Err"}</span>
              <span>F-Stat: {model.fStat?.toFixed(2)} (p={model.fP?.toFixed(3) || "Err"})</span>
              <span>Durbin-Watson: {model.durbinWatson?.toFixed(2)}</span>
            </div>
            
            <div style={{ overflowX: "auto", marginTop: 12, marginBottom: 8 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10, fontFamily: "var(--ff-mono)", color: "var(--text-main)" }}>
                <thead>
                  <tr style={{ background: "var(--bg-up)" }}>
                    <th style={{ padding: 6, textAlign: "left", border: "1px solid var(--border)" }}>Predictor</th>
                    <th style={{ padding: 6, textAlign: "right", border: "1px solid var(--border)" }}>Beta Coef</th>
                    <th style={{ padding: 6, textAlign: "right", border: "1px solid var(--border)" }}>Std. Error</th>
                    <th style={{ padding: 6, textAlign: "right", border: "1px solid var(--border)" }}>t-Stat</th>
                    <th style={{ padding: 6, textAlign: "left", border: "1px solid var(--border)" }}>p-value</th>
                    <th style={{ padding: 6, textAlign: "right", border: "1px solid var(--border)" }}>VIF</th>
                  </tr>
                </thead>
                <tbody>
                  {predictors.map((pred, i) => {
                    const b = model.coefficients?.[i];
                    const se = model.standardErrors?.[i];
                    const t = model.tStats?.[i];
                    const p = model.pValues?.[i];
                    const vif = i === 0 ? null : model.vif?.[i - 1];
                    
                    return (
                      <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
                        <td style={{ padding: 6, border: "1px solid var(--border)", fontWeight: i === 0 ? 400 : 700 }}>
                          {pred.replace("base_", "")}
                        </td>
                        <td style={{ padding: 6, textAlign: "right", border: "1px solid var(--border)", color: b > 0 ? "#10B981" : b < 0 ? "#EF4444" : "inherit" }}>
                          {b !== undefined ? b.toFixed(4) : "—"}
                        </td>
                        <td style={{ padding: 6, textAlign: "right", border: "1px solid var(--border)" }}>
                          {se !== undefined ? se.toFixed(4) : "—"}
                        </td>
                        <td style={{ padding: 6, textAlign: "right", border: "1px solid var(--border)" }}>
                          {t !== undefined ? t.toFixed(2) : "—"}
                        </td>
                        <td style={{ padding: 6, textAlign: "left", border: "1px solid var(--border)" }}>
                          {p !== undefined ? fmtP(p) : "—"} {p !== undefined ? getStars(p) : ""}
                        </td>
                        <td style={{ padding: 6, textAlign: "right", border: "1px solid var(--border)", color: vif > 5 ? "#EF4444" : "inherit" }}>
                          {vif !== null && vif !== undefined ? vif.toFixed(2) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {viz.residuals && model.residuals && model.fitted && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginTop: 16, paddingTop: 16, borderTop: '1px dashed var(--border)' }}>
                {cfg.showActualVsPredicted && (
                  <div>
                    <div style={{ fontSize: 11, textAlign: 'center', marginBottom: 6, color: 'var(--text-main)', fontWeight: 600 }}>Actual vs Predicted Model Fit</div>
                    <GreeceScatter 
                      points={model.residuals.map((r, idx) => ({ 
                        x: model.fitted[idx], 
                        y: model.fitted[idx] + r,
                        label: frame[model.rowIndex[idx]]?.name || `pt-${idx}` 
                      }))}
                      xLabel="Predicted Value" 
                      yLabel="Actual Value" 
                      height={150} 
                    />
                  </div>
                )}
                <div>
                  <div style={{ fontSize: 11, textAlign: 'center', marginBottom: 6, color: 'var(--text-main)', fontWeight: 600 }}>Residuals vs Fitted</div>
                  <GreeceScatter 
                    points={model.residuals.map((r, idx) => ({ x: model.fitted[idx], y: r, label: frame[model.rowIndex[idx]]?.name || `pt-${idx}` }))}
                    xLabel="Fitted Values" yLabel="Residuals" height={150} zeroLine={true}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 11, textAlign: 'center', marginBottom: 6, color: 'var(--text-main)', fontWeight: 600 }}>Q-Q Plot (Residuals)</div>
                  <QQPlot values={model.residuals} color="#8B5CF6" title="Residuals Q-Q" height={150} />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
