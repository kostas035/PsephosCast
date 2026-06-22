import { S } from "../GreeceStyles";
import { buildExportSheets } from "../greece-stats-export.js";

const sectionTitleStyle = { ...S.label, display: "block", color: "#10B981", fontWeight: 700, letterSpacing: 1.5, marginBottom: 12 };

export default function ExportPreview({ reportData }) {
  if (!reportData) return null;

  return (
    <div style={{ ...S.card, padding: 20, marginTop: 24, border: "1px solid #10B981" }} className="hide-on-print">
      <span style={sectionTitleStyle}>🗄️ Export Data Preview (What you are downloading)</span>
      <p style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 16 }}>
        The export now includes the full flat data matrix used in the analysis, so results can be reproduced in SPSS/R.
      </p>
      
      {Object.entries(buildExportSheets(reportData)).map(([sheetName, rows]) => (
        <div key={sheetName} style={{ marginBottom: 24, overflowX: "auto" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-title)", marginBottom: 8, padding: "4px 8px", background: "var(--bg-up)", display: "inline-block", borderRadius: 4 }}>
            Sheet: {sheetName}
          </div>
          {rows.length > 0 && (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10, fontFamily: "var(--ff-mono)", color: "var(--text-main)", minWidth: 600 }}>
              <thead>
                <tr>
                  {Object.keys(rows[0]).map(key => (
                    <th key={key} style={{ padding: 6, border: "1px solid var(--border)", background: "var(--bg-mid)", textAlign: "left", color: "var(--text-bright)" }}>
                      {key.replace(/_/g, " ")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
                    {Object.values(row).map((val, j) => (
                      <td key={j} style={{ padding: 6, border: "1px solid var(--border)" }}>
                        {typeof val === "number" && isFinite(val) ? val.toFixed(4) : (val || "—")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  );
}
