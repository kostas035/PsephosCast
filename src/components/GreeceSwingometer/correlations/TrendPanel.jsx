import { S } from "../GreeceStyles";
import { TrendLineChart } from "../GreecePlots.jsx";
import { fmtP, fmtR } from "../greece-stats.js";

const sectionTitleStyle = { ...S.label, display: "block", color: "#3B82F6", fontWeight: 700, letterSpacing: 1.5, marginBottom: 12 };

// Standard Academic Significance Stars
const getStars = (p) => {
  if (p == null || isNaN(p)) return "";
  if (p < 0.001) return <span style={{ color: "#10B981", fontWeight: 900 }}>***</span>;
  if (p < 0.01) return <span style={{ color: "#3B82F6", fontWeight: 700 }}>**</span>;
  if (p < 0.05) return <span style={{ color: "#F59E0B", fontWeight: 700 }}>*</span>;
  return "";
};

function movementNote(xLabels, values) {
  const idxs = values.map((v, i) => [i, v]).filter(([, v]) => typeof v === "number" && isFinite(v));
  if (idxs.length < 2) return null;
  const [firstI, firstR] = idxs[0];
  const [lastI, lastR] = idxs[idxs.length - 1];
  const delta = lastR - firstR;
  const dir = Math.abs(delta) < 0.05 ? "stayed roughly stable" : delta > 0 ? "strengthened" : "weakened";
  return `${xLabels[firstI]} → ${xLabels[lastI]}: r ${fmtR(firstR)} → ${fmtR(lastR)} (${dir}, Δ=${fmtR(delta)})`;
}

function TrendBlock({ title, block, isDark }) {
  if (!block) return null;
  return (
    <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px dashed var(--border)" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-main)", marginBottom: 8 }}>{title}</div>
      <TrendLineChart series={block.series} xLabels={block.xLabels} isDark={isDark} />
      <div style={{ marginTop: 12, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10, fontFamily: "var(--ff-mono)", color: "var(--text-main)" }}>
          <thead>
            <tr style={{ background: "var(--bg-up)" }}>
              <th style={{ padding: 6, textAlign: "left", border: "1px solid var(--border)" }}>Series</th>
              {block.xLabels.map((lbl, i) => <th key={i} style={{ padding: 6, textAlign: "right", border: "1px solid var(--border)" }}>{lbl}</th>)}
            </tr>
          </thead>
          <tbody>
            {block.series.map((s, si) => (
              <tr key={si} style={{ background: si % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
                <td style={{ padding: 6, border: "1px solid var(--border)", fontWeight: 700 }}>{s.label}</td>
                {block.xLabels.map((_, i) => {
                  const v = s.values[i], meta = s.meta?.[i];
                  return (
                    <td key={i} style={{ padding: 6, textAlign: "right", border: "1px solid var(--border)", color: v > 0 ? "#10B981" : v < 0 ? "#EF4444" : "inherit" }}>
                      {typeof v === "number" ? <>{fmtR(v)}{meta ? getStars(meta.p) : ""}</> : "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
        {block.series.map((s, si) => {
          const note = movementNote(block.xLabels, s.values);
          if (!note) return null;
          return (
            <div key={si} style={{ fontSize: 11, color: "var(--text-main)", fontFamily: "var(--ff-body)", padding: "8px 12px", background: "var(--bg-base)", borderLeft: "3px solid #3B82F6", borderRadius: "0 4px 4px 0", lineHeight: 1.4 }}>
              <strong>{s.label}</strong> — {note}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TrendPanel({ data, isDark = true }) {
  if (!data) return null;

  if (data.disabled) {
    return (
      <div style={{ ...S.card, padding: 20 }}>
        <span style={sectionTitleStyle}>Module: Temporal Trend Analysis</span>
        <div style={{ padding: 20, textAlign: "center", color: "var(--text-dim)", fontFamily: "var(--ff-body)", border: "1px dashed var(--border)", borderRadius: 6, opacity: 0.7 }}>
          Pick 2+ elections and/or 2+ crisis years above to see how these correlations move over time.
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...S.card, padding: 20 }}>
      <span style={sectionTitleStyle}>Module: Temporal Trend Analysis</span>
      <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 4 }}>
        Each line tracks the Pearson r between one Subject and one Independent Variable as the underlying election or crisis-year changes — not a single static number.
      </div>
      <TrendBlock title="📊 Across Elections (real baselines)" block={data.elections} isDark={isDark} />
      <TrendBlock title="📈 Across Crisis Years (2009–2019)" block={data.years} isDark={isDark} />
      <div style={{ fontSize: 9, color: "var(--text-dim)", marginTop: 12, textAlign: "right", fontFamily: "var(--ff-body)" }}>
        Significance: <span style={{color:"#10B981"}}>***</span> p&lt;0.001, <span style={{color:"#3B82F6"}}>**</span> p&lt;0.01, <span style={{color:"#F59E0B"}}>*</span> p&lt;0.05
      </div>
    </div>
  );
}
