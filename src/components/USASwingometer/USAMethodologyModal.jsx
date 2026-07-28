import { S } from "./usa-ui.jsx";
import { USA, USA_COUNTY_DETAIL_STATES, USA_STATE_NAMES } from "./usa-data.js";

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

const detailStates = [...USA_COUNTY_DETAIL_STATES].sort().map(a => USA_STATE_NAMES[a]).join(", ");

export default function USAMethodologyModal({ onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backdropFilter: "blur(4px)" }}>
      <div style={{ padding: 32, width: "100%", maxWidth: 720, maxHeight: "85vh", overflowY: "auto", background: "var(--bg-base, var(--bg-up))", borderRadius: 12, border: "1px solid var(--border)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", color: "var(--text-main)", fontFamily: "var(--ff-body)" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0, fontFamily: "var(--ff-head)", fontSize: 24, color: "var(--text-title)", letterSpacing: 1 }}>🇺🇸 METHODOLOGY</h2>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, letterSpacing: 1, textTransform: "uppercase" }}>How votes become {USA.TOTAL_EV} electoral votes — winner-take-all by state</div>
          </div>
          <button className="icon-btn" onClick={onClose} style={{ ...S.ghostBtn, border: "none", fontSize: 20 }}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24, fontSize: 14, lineHeight: 1.65 }}>

          <p style={{ margin: 0, color: "var(--text-muted)" }}>
            The model has three layers: a <strong>national</strong> swing computed from your current GOP/DEM/Other shares versus the selected baseline, a <strong>state-by-state</strong> logit-swing pass that reproduces each state's own partisan lean, and a winner-take-all <strong>electoral vote</strong> count on top. A Monte Carlo layer quantifies how much that count could move.
          </p>

          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "var(--text-dim)", borderBottom: "1px solid var(--divider)", paddingBottom: 6 }}>Part A · National → state swing</div>

          <Section step="A1" title="Logit swing">
            <p style={{ margin: 0 }}>Your national vote-share change is mapped into every state in <strong>logit space</strong> rather than by adding raw points, so shares stay between 0% and 100% and the same national swing moves a 90/10 state far less, in percentage points, than a 50/50 one — matching how real elections behave.</p>
            <Mono>
              swing(c) = logit(nationalEffective) − logit(nationalBase)<br/>
              stateShare(c) = logit⁻¹( logit(stateBase) + swing(c) )
            </Mono>
          </Section>

          <Section step="A2" title="Electoral vote allocation">
            <p style={{ margin: 0 }}>Each state's swung GOP/DEM shares decide a single winner, who takes all of that state's electoral votes (48 states + DC). <strong>Maine and Nebraska</strong> actually split their electoral votes by congressional district — the model simplifies this to winner-take-all-by-state, which is the one place the engine departs from the real allocation rule. {USA.TOTAL_EV} electoral votes are in play; {USA.MAJORITY_EV} to win.</p>
          </Section>

          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "var(--text-dim)", borderBottom: "1px solid var(--divider)", paddingBottom: 6 }}>Part B · County map</div>
          <Section step="B1" title="Two tiers of county data">
            <p style={{ margin: 0 }}>Toggling "Counties" on renders all ~3,140 U.S. county boundaries (via the <code>us-atlas</code> TopoJSON dataset). <strong>{detailStates}</strong> use certified county-level 2024 returns transcribed directly from official results — hovering one of their counties shows its real GOP/DEM percentages and vote total. Every other state's counties are shaded uniformly by that state's modelled statewide result, since only the statewide totals for those states were on hand; the map footnote and tooltip flag which mode you're looking at ("MODELLED" vs. a real vote count).</p>
          </Section>

          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "var(--text-dim)", borderBottom: "1px solid var(--divider)", paddingBottom: 6 }}>Part C · Demographic model</div>
          <Section step="C1" title="Six swing axes">
            <p style={{ margin: 0 }}>The Demographics tab moves the national electorate along six axes — college-educated turnout, senior turnout, urban/rural skew, Hispanic realignment, high-income suburbs, and the gender gap. Each candidate carries a calibrated sensitivity per axis (grounded in 2016–2024 exit-poll patterns, not estimated from individual-level data); a slider shifts every candidate's national share proportionally, then the field is renormalised to 100% before the state-by-state swing runs.</p>
            <Mono>Δ(c) = Σ_axis (slider_axis / 10) × sensitivity(c, axis)</Mono>
          </Section>

          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "var(--text-dim)", borderBottom: "1px solid var(--divider)", paddingBottom: 6 }}>Part D · Monte Carlo forecast</div>
          <Section step="D1" title="Three-tier correlated error">
            <p style={{ margin: 0 }}>Each simulated run draws a shared <strong>national</strong> polling miss, a <strong>regional</strong> miss (Northeast / Midwest / South / West move somewhat together), and an <strong>idiosyncratic per-state</strong> miss scaled by that state's own revealed 2020→2024 volatility — states that swung unusually hard get proportionally wider individual uncertainty. All three draws come from a fat-tailed Student-t distribution, not a normal one, so genuinely surprising nights stay possible. Every run then re-allocates all {USA.TOTAL_EV} electoral votes. The panel reports the electoral-vote distribution, win probability for each side, and per-state win odds for the closest contests.</p>
          </Section>

          <Section title="Scenarios & data sources">
            <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
              <li><strong>2024 baseline:</strong> {detailStates} are summed directly from certified county-level returns transcribed for this project — exact to the vote. The remaining states use statewide totals from AP/state-certified January 2025 reporting.</li>
              <li><strong>2020 baseline:</strong> statewide certified totals (Trump vs. Biden), used as the prior-cycle scenario and to derive each state's 2020→2024 "lean drift" that feeds the Monte Carlo's per-state volatility.</li>
              <li><strong>State demographics</strong> (college degree %, median income, senior %, Hispanic/Latino %, white non-Hispanic %, foreign-born %): ACS 5-year-style estimates, approximate to the nearest reporting unit. These are state-level only — no county-level demographic layer is offered, since it isn't part of the map's certified county dataset.</li>
              <li><strong>Geography:</strong> <code>us-atlas</code> 10m TopoJSON (states and counties), pre-projected AlbersUSA so Alaska and Hawaii sit in their conventional map insets.</li>
            </ul>
          </Section>

          <section style={{ padding: 16, background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8 }}>
            <h4 style={{ margin: "0 0 8px", color: "#EF4444", fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }}>⚠ Known limitations</h4>
            <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: "var(--text-muted)" }}>
              <li>Maine's and Nebraska's congressional-district electoral-vote splits are simplified to winner-take-all-by-state.</li>
              <li>Only {USA_COUNTY_DETAIL_STATES.size} states have certified county-level returns on hand; the rest render real county shapes shaded by a uniform statewide estimate.</li>
              <li>Demographic sensitivities are calibrated modelling assumptions, not coefficients estimated from individual-level survey microdata.</li>
              <li>State electoral outcomes are point estimates and can flip on a normal polling error, especially in single-digit states — the Monte Carlo layer exists to quantify that.</li>
              <li>The model assumes a uniform national swing applies to every state beyond its own historical lean; it does not model candidate-specific regional strength (e.g. a home-state effect).</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
