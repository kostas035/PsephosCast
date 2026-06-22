import { S } from "./cyprus-ui.jsx";
import { CY } from "./cyprus-data.js";

const Mono = ({ children }) => (
  <div style={{ background: "var(--bg-mid)", padding: 12, borderRadius: 6, margin: "10px 0", border: "1px solid var(--border)", fontFamily: "var(--ff-mono, monospace)", fontSize: 12, lineHeight: 1.7, color: "var(--text-main)", overflowX: "auto" }}>{children}</div>
);
const Section = ({ step, title, children }) => (
  <section>
    <h4 style={{ margin: "0 0 8px", color: "var(--text-title)", fontSize: 16, display: "flex", gap: 8, alignItems: "baseline" }}>
      {step != null && <span style={{ fontSize: 11, fontFamily: "var(--ff-mono)", color: "#2563EB", letterSpacing: 1 }}>{step}</span>}{title}
    </h4>
    {children}
  </section>
);

export default function CyprusMethodologyModal({ onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backdropFilter: "blur(4px)" }}>
      <div style={{ padding: 32, width: "100%", maxWidth: 720, maxHeight: "85vh", overflowY: "auto", background: "var(--bg-base, var(--bg-up))", borderRadius: 12, border: "1px solid var(--border)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", color: "var(--text-main)", fontFamily: "var(--ff-body)" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0, fontFamily: "var(--ff-head)", fontSize: 24, color: "var(--text-title)", letterSpacing: 1 }}>🇨🇾 METHODOLOGY</h2>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, letterSpacing: 1, textTransform: "uppercase" }}>How votes become {CY.TOTAL_SEATS} seats — reinforced proportional representation, House of Representatives</div>
          </div>
          <button className="icon-btn" onClick={onClose} style={{ ...S.ghostBtn, border: "none", fontSize: 20 }}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24, fontSize: 14, lineHeight: 1.65 }}>

          <p style={{ margin: 0, color: "var(--text-muted)" }}>
            The model runs in two halves: a <strong>national</strong> calculation that fixes each party's total seats, and a <strong>district</strong> distribution that places those seats across the six constituencies. Both sit on top of a logit swing model that sets the district vote shares.
          </p>

          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "var(--text-dim)", borderBottom: "1px solid var(--divider)", paddingBottom: 6 }}>Part A · National seat totals</div>

          <Section step="A1" title="Electoral threshold">
            <p style={{ margin: 0 }}>A party must clear <strong>{CY.THRESHOLD}%</strong> of the valid national vote to win seats (adjustable in the panel). Parties below it are excluded and their shares drop out of the denominator; each surviving party's share is recomputed against the qualifying pool.</p>
          </Section>

          <Section step="A2" title="National target seats — Hare quota + largest remainder">
            <p style={{ margin: "0 0 8px" }}>The {CY.TOTAL_SEATS} seats are shared among qualifying parties by the Hare quota with largest remainder, on each party's share of the qualifying pool.</p>
            <Mono>
              quota = qualifyingPool% / {CY.TOTAL_SEATS}<br/>
              seats(p) = ⌊ share(p) / quota ⌋ + largestRemainderTopUp
            </Mono>
          </Section>

          <Section step="A3" title="Certified-result override (the three baselines)">
            <p style={{ margin: 0 }}>Because a quota run on rounded <em>percentages</em> can flip a marginal seat versus the official raw-vote count, when the inputs exactly match a historical scenario the engine pins the national totals to the <strong>certified results</strong> — 2026, 2021 and 2016 — so each baseline reproduces reality precisely. The moment you move any slider, the live Hare calculation takes over.</p>
          </Section>

          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "var(--text-dim)", borderBottom: "1px solid var(--divider)", paddingBottom: 6 }}>Part B · District distribution</div>

          <Section step="B1" title="First distribution (per-district Hare)">
            <p style={{ margin: 0 }}>Within each district a local Hare quota (district valid votes ÷ district seats) gives each party its whole number of seats. This is computed uncapped first, across all six districts.</p>
          </Section>
          <Section step="B2" title="Cap to the national target">
            <p style={{ margin: 0 }}>If a party's district seats sum to more than its national target, the surplus is stripped from the districts where it had the <em>smallest</em> fractional remainder — so it keeps the seats it most strongly earned.</p>
          </Section>
          <Section step="B3" title="Fill shortfalls, then a guarded fallback">
            <p style={{ margin: 0 }}>Remaining seats are awarded to the largest district remainders until every party reaches its national target. A final pass fills any still-empty district seats, but <strong>always checks the national cap first</strong> — so a party with a big local remainder can't steal a seat another party needs to reach its certified total.</p>
          </Section>

          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "var(--text-dim)", borderBottom: "1px solid var(--divider)", paddingBottom: 6 }}>Part C · How vote shares are set</div>

          <Section step="C1" title="District logit swing">
            <p style={{ margin: 0 }}>A national change is mapped onto each district in <strong>logit space</strong> rather than by adding raw points, so shares stay between 0% and 100% and swings compress correctly in very safe or very weak areas.</p>
            <Mono>
              swing(p) = logit(nationalEffective) − logit(nationalBase)<br/>
              districtShare(p) = logit⁻¹( logit(districtBase) + swing(p) )
            </Mono>
            <p style={{ margin: "8px 0 0", color: "var(--text-muted)", fontSize: 13 }}>District baselines are the real 2021 constituency results; other scenarios derive their geography by applying this swing from 2021, with successor/new parties inheriting a parent's geography through a lineage map.</p>
          </Section>

          <Section step="C2" title="Demographic model">
            <p style={{ margin: 0 }}>The Demographics tab moves voter blocs along six axes — youth and senior turnout, urban/coastal skew, education, migration concern and gender. Each party carries a calibrated sensitivity per axis; a slider shifts every party proportionally, then the field is renormalised to 100%.</p>
            <Mono>Δ(p) = Σ_axis (slider_axis / 10) × sensitivity(p, axis)</Mono>
          </Section>

          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "var(--text-dim)", borderBottom: "1px solid var(--divider)", paddingBottom: 6 }}>Part D · Monte Carlo forecast</div>
          <Section step="D1" title="Error model & outputs">
            <p style={{ margin: 0 }}>The current numbers are treated as the centre of a distribution. Each of ~4,000 iterations adds a shared "all-pollsters-wrong-together" shock plus a party-specific shock, both drawn from a fat-tailed Student-t, then re-runs the national Hare allocation. The panel reports each party's median seats with 90% and 50% intervals, the probability of finishing first, the probability of a 29-seat majority, how often parliament is hung, and the live probability that any chosen coalition reaches {CY.MAJORITY}.</p>
          </Section>

          <Section title="Scenarios & data sources">
            <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
              <li><strong>2026 / 2021 / 2016:</strong> official certified results (Statistical Service of Cyprus / Election Service).</li>
              <li><strong>District baselines:</strong> 2021 constituency results; other years derived by logit swing.</li>
            </ul>
          </Section>

          <section style={{ padding: 16, background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8 }}>
            <h4 style={{ margin: "0 0 8px", color: "#EF4444", fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }}>⚠ Known limitations</h4>
            <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: "var(--text-muted)" }}>
              <li>National allocation uses a Hare-quota approximation on percentages; the three official baselines are pinned to certified seat counts to absorb the small differences versus the exact statutory count.</li>
              <li>Demographic sensitivities and district swing behaviour are calibrated modelling assumptions (2021/2016 patterns), not coefficients estimated from individual-level data.</li>
              <li>Seat outputs are point estimates and can move several seats on a normal polling error — the Monte Carlo layer exists to quantify that.</li>
              <li>The model assumes uniform behaviour across constituencies for a given national change, beyond the historical district lean.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
