import { memo } from "react";
import { S, EASE_STD } from "./GreeceStyles";
import { GR_2015_SEAT_DIFF } from "./greece-data.js";
import { useGreeceT } from "./GreeceTranslations.jsx";

// Static comparison of the September 2015 constituency map against the current
// (June 2023) map's seat allocation — see GR_2015_SEAT_DIFF in greece-data.js,
// which derives this list once from the two apportionment tables. It does not
// depend on swing/simulation state, so this component takes no election props.
export default memo(function SeatAllocationDiff({ lang }) {
  const t = useGreeceT(lang);
  const rows = GR_2015_SEAT_DIFF;

  return (
    <div style={S.card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <div style={S.label}>{t("Seat Allocation: 2015 vs Current Map")}</div>
      </div>
      <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--ff-body)", lineHeight: 1.5, marginBottom: 12 }}>
        {t("Constituencies whose seat count differs between the September 2015 map (56 constituencies) and the current post-2018 map (59 constituencies). Athens B and Attica compare against the combined seat totals of their current sub-districts. Only differences are shown.")}
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 420 }}>
          <thead><tr>
            {[t("Region"), t("2015 Seats"), t("Current Seats"), t("Δ")].map(h => (
              <th key={h} style={{ fontSize: 8, color: "var(--text-dim)", letterSpacing: 1.5, fontFamily: "var(--ff-body)", textAlign: h === t("Region") ? "left" : "right", padding: "4px 8px 8px", borderBottom: "1px solid var(--border)", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {rows.length > 0 ? rows.map((r, idx) => (
              <tr key={r.id} style={{ borderBottom: "1px solid var(--border)", background: idx % 2 ? "var(--table-stripe)" : "transparent" }}>
                <td style={{ padding: "7px 8px" }}>
                  <div style={{ fontSize: 12, color: "var(--text-bright)", fontFamily: "var(--ff-body)", fontWeight: 600 }}>{r.name}</div>
                  {r.name2023 !== r.name && (
                    <div style={{ fontSize: 9, color: "var(--text-muted)", fontFamily: "var(--ff-body)" }}>
                      {t("vs.")} {r.name2023}
                    </div>
                  )}
                </td>
                <td style={{ fontSize: 13, color: "var(--text-main)", ...S.mono, textAlign: "right", padding: "7px 8px" }}>{r.seats2015}</td>
                <td style={{ fontSize: 13, color: "var(--text-main)", ...S.mono, textAlign: "right", padding: "7px 8px" }}>{r.seats2023}</td>
                <td style={{ fontSize: 13, fontWeight: 700, ...S.mono, textAlign: "right", padding: "7px 8px", color: r.delta > 0 ? "#22C55E" : "#EF4444", transition: `color 0.3s ${EASE_STD}` }}>
                  {r.delta > 0 ? `+${r.delta}` : r.delta}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} style={{ padding: "20px 10px", textAlign: "center", color: "var(--text-muted)", fontFamily: "var(--ff-body)" }}>
                  {t("No seat allocation differences found.")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});
