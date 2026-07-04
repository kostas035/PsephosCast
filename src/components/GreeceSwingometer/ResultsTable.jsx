import { memo } from "react";
import { S, EASE_SPRING, EASE_STD } from "./GreeceStyles";
import { GR, GR_PARTY_DICT, GR_BONUS_CONFIG } from "./greece-data.js";
import { grFmtVotesShort, grFmtVotes } from "./greece-utils.js";
import { useGreeceT, T, fmtNoPartiesThreshold, fmtInclBonus, fmtSeatsOfNeeded, fmtTotalVotes, fmtBelowThreshold, tPartyName, tPartyFullName } from "./GreeceTranslations.jsx";

const SEATS_BY_SCENARIO = {
  "2023": { nd: 158, syriza: 47, pasok: 32, kke: 21, spartans: 12, el: 12, niki: 10, pe: 8 },
  "2019": { nd: 158, syriza: 86, pasok: 22, kke: 15, el: 10, mera25: 9 },
  "2015": { syriza: 145, nd: 75, gd: 18, pasok: 17, kke: 15, potami: 11, anel: 10, ek: 9 },
  "2015jan": { syriza: 149, nd: 76, gd: 17, potami: 17, kke: 15, anel: 13, pasok: 13 },
  "2012": { nd: 129, syriza: 71, pasok: 33, anel: 20, gd: 18, dimar: 17, kke: 12 },
  "2012may": { nd: 108, syriza: 52, pasok: 41, anel: 33, kke: 26, gd: 21, dimar: 19 },
};

const DELTA_LABELS = { "2019": "Seats (vs '19)", "2015": "Seats (vs '15)", "2015jan": "Seats (vs Jan '15)", "2012": "Seats (vs '12)", "2012may": "Seats (vs May '12)" };

export const GrMetricsCards = memo(function GrMetricsCards({ electionResult, parties, isMobile, turnout, isEstimate, lang }) {
  const t = useGreeceT(lang);
  const { results = [], bonusSeats = 0 } = electionResult || {};
  const winner = results[0];
  let wp = winner ? parties.find(x => x.id === winner.id) : null;
  const hasMaj = winner ? winner.seats >= GR.MAJORITY : false;

  const cards = [
    {
      label: t("First Place"),
      value: winner ? `${winner.nationalPct?.toFixed(1)}%` : t("None"),
      sub: (wp ? tPartyFullName(lang, wp) : null) || (winner ? tPartyName(lang, winner) : null) || t("No qualifying party"),
      accent: wp?.color || "var(--text-muted)"
    },
    {
      label: t("Winner Seats"),
      value: winner ? winner.seats : 0,
      sub: bonusSeats > 0 ? fmtInclBonus(lang, bonusSeats) : t("no bonus seats"),
      accent: wp?.color || "var(--text-muted)"
    },
    {
      label: t("Turnout (est.)"),
      value: grFmtVotesShort(turnout),
      sub: isEstimate ? t("projected estimate") : t("actual votes cast"),
      accent: "#60A5FA"
    },
    {
      label: hasMaj ? t("Majority") : t("Seats Short"),
      value: winner ? (hasMaj ? `+${winner.seats - GR.MAJORITY}` : `${GR.MAJORITY - winner.seats}`) : GR.MAJORITY,
      sub: hasMaj ? fmtSeatsOfNeeded(lang, winner.seats, GR.MAJORITY) : t("coalition required"),
      accent: hasMaj ? "#34D399" : "#F87171"
    },
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

export default memo(function ResultsTable({ electionResult, parties, turnout, isEstimate, threshold, scenarioId, lang }) {
  const t = useGreeceT(lang);
  const { results = [], eliminated = [], eliminatedDetail = [], bonusSeats = 0, winnerPct = 0, proportionalPool = 0 } = electionResult || {};

  const baseline = SEATS_BY_SCENARIO[scenarioId] || SEATS_BY_SCENARIO["2023"];
  const deltaLabel = t(DELTA_LABELS[scenarioId] || "Seats (vs '23)");

  return (
    <div style={S.card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={S.label}>{t("Seat Distribution")}</div>
        {turnout > 0 && <div style={{ fontSize: 9, color: "var(--text-dim)", ...S.mono, letterSpacing: 1 }}>{isEstimate ? "EST. " : ""}{fmtTotalVotes(lang, grFmtVotesShort(turnout))}</div>}
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: turnout ? 500 : 440 }}>
          <thead><tr>
            {[t("Party"), t("Vote %"), t("After Threshold"), turnout ? t("Votes") : null, deltaLabel, t("Bonus"), t("Share")].filter(Boolean).map(h => (
              <th key={h} style={{ fontSize: 8, color: "var(--text-dim)", letterSpacing: 1.5, fontFamily: "var(--ff-body)", textAlign: h === t("Party") ? "left" : "right", padding: "4px 8px 8px", borderBottom: "1px solid var(--border)", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {results.length > 0 ? (
              results.map((r, idx) => {
                let p = parties.find(x => x.id === r.id);
                const barW = (r.seats / GR.TOTAL_SEATS) * 100;
                
                // FIX: Fall back to lowercase matching to match your SEATS_BY_SCENARIO registry definition
                const partyKey = r.id ? r.id.toLowerCase() : "";
                const baselineSeats = baseline[partyKey] || 0;
                const delta = r.seats - baselineSeats;

                return (
                  <tr key={r.id} style={{ borderBottom: "1px solid var(--border)", background: idx % 2 ? "var(--table-stripe)" : "transparent" }}>
                    <td style={{ padding: "7px 8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <div style={{ width: 3, height: 20, borderRadius: 2, background: p?.color ?? "var(--text-muted)", flexShrink: 0 }}/>
                        <span style={{ fontSize: 12, color: "var(--text-bright)", fontFamily: "var(--ff-body)", fontWeight: 600 }}>{tPartyName(lang, p)}</span>
                        <span style={{ fontSize: 9, color: "var(--text-muted)", fontFamily: "var(--ff-body)" }}>{tPartyFullName(lang, p)}</span>
                        {r.isWinner && <span style={{ fontSize: 7, color: "#D97706", background: "var(--bonus-bg)", padding: "1px 6px", borderRadius: 3, fontFamily: "var(--ff-body)", letterSpacing: 1.2, border: "1px solid var(--bonus-border)" }}>{t("FIRST")}</span>}
                      </div>
                    </td>
                    <td style={{ fontSize: 11, color: "var(--text-muted)", ...S.mono, textAlign: "right", padding: "7px 8px" }}>{(r.nationalPct ?? 0).toFixed(2)}%</td>
                    <td style={{ fontSize: 11, color: "var(--text-main)", ...S.mono, textAlign: "right", padding: "7px 8px" }}>{(r.finalPct ?? 0).toFixed(2)}%</td>
                    {turnout > 0 && <td style={{ fontSize: 10, color: "var(--text-main)", ...S.mono, textAlign: "right", padding: "7px 8px", whiteSpace: "nowrap" }}>{grFmtVotes(r.votes)}</td>}
                    
                    <td style={{ padding: "7px 8px" }}>
                      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "flex-end", gap: 5 }}>
                        <span style={{ fontSize: 18, fontWeight: 800, color: p?.color ?? "var(--text-title)", fontFamily: "var(--ff-head)", lineHeight: 1 }}>{r.seats}</span>
                        {delta !== 0 ? (
                          <span style={{ fontSize: 10, color: delta > 0 ? "#22C55E" : "#EF4444", ...S.mono, fontWeight: 700 }}>
                            {delta > 0 ? `+${delta}` : delta}
                          </span>
                        ) : (
                          <span style={{ fontSize: 10, color: "var(--text-dim)", ...S.mono, fontWeight: 700 }}>—</span>
                        )}
                      </div>
                    </td>

                    <td style={{ fontSize: 11, ...S.mono, textAlign: "right", padding: "7px 8px", color: (r.bonusSeats ?? 0) > 0 ? "#F59E0B" : "var(--text-dim)" }}>{(r.bonusSeats ?? 0) > 0 ? `+${r.bonusSeats}` : "—"}</td>
                    <td style={{ padding: "7px 8px", width: 100 }}>
                      <div style={{ background: "var(--bg-up)", borderRadius: 2, height: 5, overflow: "hidden", marginBottom: 2 }}>
                        <div style={{ background: p?.color ?? "var(--text-muted)", height: "100%", width: `${barW}%`, borderRadius: 2, transition: `width 0.45s ${EASE_SPRING}` }}/>
                      </div>
                      <div style={{ fontSize: 8, color: "var(--text-dim)", ...S.mono, textAlign: "right" }}>{barW.toFixed(1)}%</div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={turnout ? 7 : 6} style={{ padding: "30px 10px", textAlign: "center", color: "var(--text-muted)", fontFamily: "var(--ff-body)" }}>
                  {fmtNoPartiesThreshold(lang, threshold)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {bonusSeats > 0 && (
        <div style={{ marginTop: 12, padding: "8px 12px", background: "var(--bonus-bg)", borderRadius: 4, border: "1px solid var(--bonus-border)", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#F59E0B", flexShrink: 0 }}/>
          <div style={{ fontSize: 9, color: "#92400E", fontFamily: "var(--ff-body)", letterSpacing: 0.5, lineHeight: 1.5 }}>
            {GR_BONUS_CONFIG[scenarioId]?.step === Infinity ? (
              <T lang={lang}
                en={<><strong style={{ color: "#D97706" }}>{bonusSeats} bonus seats</strong> — Winner at {winnerPct?.toFixed(1)}% (flat bonus, pre-2019 law) | Proportional pool: {proportionalPool} seats</>}
                el={<><strong style={{ color: "#D97706" }}>{bonusSeats} έδρες πριμοδότησης</strong> — Ο νικητής στο {winnerPct?.toFixed(1)}% (σταθερή πριμοδότηση, νόμος προ 2019) | Αναλογική δεξαμενή: {proportionalPool} έδρες</>}
              />
            ) : (
              <T lang={lang}
                en={<><strong style={{ color: "#D97706" }}>{bonusSeats} bonus seats</strong> — Winner at {winnerPct?.toFixed(1)}% ({GR.BONUS_BASE} base +{bonusSeats - GR.BONUS_BASE} extra) | Proportional pool: {proportionalPool} seats</>}
                el={<><strong style={{ color: "#D97706" }}>{bonusSeats} έδρες πριμοδότησης</strong> — Ο νικητής στο {winnerPct?.toFixed(1)}% ({GR.BONUS_BASE} βάση +{bonusSeats - GR.BONUS_BASE} επιπλέον) | Αναλογική δεξαμενή: {proportionalPool} έδρες</>}
              />
            )}
          </div>
        </div>
      )}
      {(eliminatedDetail?.length > 0 || eliminated?.length > 0) && (
        <div style={{ marginTop: 8, padding: "8px 12px", background: "var(--elim-bg)", borderRadius: 4, border: "1px solid var(--elim-border)" }}>
          <div style={{ fontSize: 9, color: "#7F1D1D", fontFamily: "var(--ff-body)", letterSpacing: 0.5, marginBottom: eliminatedDetail?.length && turnout ? 4 : 0 }}>
            <strong style={{ color: "#DC2626" }}>{fmtBelowThreshold(lang, threshold)}</strong> {(eliminatedDetail?.length ? eliminatedDetail.map(p => tPartyName(lang, p)) : eliminated)?.join(", ")} — {t("redistributed")}
          </div>
          {eliminatedDetail?.length > 0 && turnout > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 12px", marginTop: 4 }}>
              {eliminatedDetail.map(p => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, ...S.mono, color: "var(--text-muted)" }}>
                  <span style={{ color: GR_PARTY_DICT[p.id]?.color || "var(--text-muted)" }}>{tPartyName(lang, p)}</span>
                  <span>{grFmtVotes(p.votes)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
});
