import { S } from "./usa-ui.jsx";
import { USA, USA_COUNTY_DETAIL_STATES, USA_DEMO_GROUPS } from "./usa-data.js";

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
            The model has four layers: a <strong>national</strong> swing computed from your current vote shares (all candidates, not just the top two) versus the selected baseline; a <strong>county-level</strong> logit-swing pass applied to every one of the ~3,140 certified counties on the map; a <strong>bottom-up sum</strong> back up to each state's total (so every state number is literally the sum of its counties); and a winner-take-all <strong>electoral vote</strong> count on top. A Monte Carlo layer separately quantifies how much that count could move.
          </p>

          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "var(--text-dim)", borderBottom: "1px solid var(--divider)", paddingBottom: 6 }}>Part A · National → county swing → state totals</div>

          <Section step="A1" title="Logit swing, applied at the county level">
            <p style={{ margin: 0 }}>Your national vote-share change (computed across every candidate on the ballot, not just GOP/DEM) is mapped into every <strong>county's own real baseline</strong> in logit space, so shares stay between 0% and 100% and the same national swing moves a 90/10 county far less, in percentage points, than a 50/50 one — matching how real elections behave. State and national totals are then the literal sum of all their counties' swung vote counts — not a separate state-level calculation — so a county's real turnout and lean always show up correctly in its state's number.</p>
            <Mono>
              swing(c) = logit(nationalEffective(c)) − logit(nationalBase(c))<br/>
              countyShare(c) = logit⁻¹( logit(countyBase(c)) + swing(c) )<br/>
              stateVotes(c) = Σ<sub>county ∈ state</sub> countyShare(c) × countyTurnout
            </Mono>
            <p style={{ margin: "8px 0 0", color: "var(--text-muted)", fontSize: 13 }}>Alaska (reported by state house district) and DC (reported by ward) don't have a real county-equivalent breakdown in the underlying returns, so those two fall back to a direct state-level swing instead of a county sum.</p>
          </Section>

          <Section step="A2" title="Electoral vote allocation">
            <p style={{ margin: 0 }}>Each state's swung shares decide a single winner (the candidate with the largest share), who takes all of that state's electoral votes (48 states + DC). <strong>Maine and Nebraska</strong> actually split their electoral votes by congressional district — the model simplifies this to winner-take-all-by-state, which is the one place the engine departs from the real allocation rule. {USA.TOTAL_EV} electoral votes are in play; {USA.MAJORITY_EV} to win.</p>
          </Section>

          <Section step="A3" title="Local overrides">
            <p style={{ margin: 0 }}>Click any state or county on the map to pin it and drag its own <strong>Local Swing</strong> bar — this layers an additional, county- or state-specific logit shift on top of the national swing for that one entity only. For a county, the change is counted directly into its parent state's vote totals (and, from there, the national totals and EV count) exactly like editing one constituency on a traditional swingometer. Turn on <strong>Multi-Select</strong> to click several states or counties at once and drag one shared bar that sets the same local swing across the whole selection — a quick way to model a regional swing. Overrides can be cleared individually, per-selection, or all at once from the map toolbar.</p>
          </Section>

          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "var(--text-dim)", borderBottom: "1px solid var(--divider)", paddingBottom: 6 }}>Part B · Third-party candidates</div>
          <Section step="B1" title="Modelled state-level splits">
            <p style={{ margin: 0 }}>Beyond GOP and DEM, the 2024 scenario includes Jill Stein (Green), Chase Oliver (Libertarian), Robert F. Kennedy Jr., and Cornel West; the 2020 scenario includes Howie Hawkins (Green) and Jo Jorgensen (Libertarian). Each state's exact "other" vote pool (state total minus GOP minus DEM, certified to the vote) is split among these named candidates using their real national vote totals as weights, gated by which states they actually appeared on the ballot in — a candidate gets 0 in a state they weren't on the ballot in, and that share instead falls to a generic write-in/other-minor-candidate bucket. County-level minor-party detail isn't available from the source data, so each county's own "other" pool is split in the same proportions as its parent state.</p>
            <p style={{ margin: "8px 0 0", color: "var(--text-muted)", fontSize: 13 }}>This reproduces Stein's and the Libertarian nominee's real national totals almost exactly; RFK Jr.'s and West's modelled totals run somewhat under their real national count (roughly 20–45% low) because comprehensive, official state-by-state ballot-status data for those two candidates wasn't available — treat their numbers as indicative, not certified. Alaska's and New York's 2024 rows show no minor-party detail at all: the underlying county dataset's "total votes" figure for those two states equals GOP+DEM exactly, with no residual to allocate.</p>
          </Section>

          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "var(--text-dim)", borderBottom: "1px solid var(--divider)", paddingBottom: 6 }}>Part C · County map</div>
          <Section step="C1" title="Real county-level detail everywhere the geography allows">
            <p style={{ margin: 0 }}>Toggling "Counties" on renders all ~3,140 U.S. county boundaries (via the <code>us-atlas</code> TopoJSON dataset, with Connecticut's 8 old counties swapped out for its real 9 "planning region" county-equivalents — see below), each shaded and hoverable with its own real, certified 2024 or 2020 result. <strong>{USA_COUNTY_DETAIL_STATES.size} states</strong> have this real per-county join.</p>
            <p style={{ margin: "8px 0 0", color: "var(--text-muted)", fontSize: 13 }}><strong>Connecticut</strong> switched from 8 counties to 9 planning regions as its official county-equivalents in 2022; election results are reported under the new regions, but most off-the-shelf map geometry (including the one this app started from) still ships the old county shapes, which silently fail to match and render blank. This app re-projects the real planning-region boundaries (growella/us-counties-10m-topojson) into the map's own coordinate space so they align pixel-for-pixel with the rest of the country. <strong>Alaska</strong> has the geometry (real boroughs) but not the matching results — the state simply doesn't report its presidential vote by borough, only by its 40 state house districts, which don't nest into boroughs at all. Alaska's boroughs render with real shapes shaded by Alaska's statewide result, clearly flagged in the tooltip, and can't be individually overridden for that reason.</p>
          </Section>

          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "var(--text-dim)", borderBottom: "1px solid var(--divider)", paddingBottom: 6 }}>Part D · Demographic model</div>
          <Section step="D1" title="Real exit-poll baselines per group, geographically weighted">
            <p style={{ margin: 0 }}>The Demographics tab shows {USA_DEMO_GROUPS.length} voter groups (Hispanic/Latino, Black, White, Men, Women, Age 18–29, Age 65+, College Graduates), each labelled with its actual 2024 national vote split (AP VoteCast / Edison Research exit polling). Dragging a group's slider shifts that group's own internal Dem/GOP split — the displayed percentages update live. The resulting swing is scaled two ways: by that group's approximate share of the national electorate (so a full drag on "White" moves the topline far more than the same drag on "Black"), and, separately, by each county's own real Census composition for that group — a Hispanic-realignment drag moves a 90%-Hispanic South Texas county far more than a 2%-Hispanic West Virginia one, using the real per-county percentages described in Part D2 as the geographic weight.</p>
            <Mono>Δ<sub>county</sub>(c) = Σ<sub>group</sub> (slider<sub>group</sub> / 10) × sensitivity(c, group) × (countyPct<sub>group</sub> / nationalAvgPct<sub>group</sub>)</Mono>
          </Section>
          <Section step="D2" title="Map demographic &amp; ethnic-origin overlays — real county data">
            <p style={{ margin: 0 }}>Separate from the swing groups above: the map's mode menu also has plain data layers (population, density, college degree %, median household income, poverty rate, unemployment rate, senior population) with no election data involved, purely descriptive — plus an <strong>Ethnic Makeup</strong> layer. Selecting it first offers the four broad groups (Hispanic/Latino, White, Black, and Asian — all non-Hispanic-alone where applicable); White, Black, and Hispanic/Latino each drill down further into specific ancestries or countries of origin — German, Polish, Greek, Irish, Italian, Norwegian, and 15 more for White; Nigerian, Ethiopian, Ghanaian, Jamaican, Haitian, Trinidadian, and 10 more for Black; Mexican, Cuban, Puerto Rican, Salvadoran, Honduran, Colombian, and 12 more for Hispanic/Latino — sourced from the Census Bureau's 2018–2022 ACS 5-year Summary File, tables B04006 ("People Reporting Ancestry") and B03001 ("Hispanic or Latino Origin by Specific Origin"). Each is shown as % of that table's own county population, on the same 0–100 scale as everything else. Asian doesn't drill down further — that table doesn't carry Asian countries of origin. With Counties on, all of this renders at real county granularity almost everywhere (see Part C for the Connecticut/Alaska geography notes); with Counties off, each state is shaded by its own value from the same Census tables. The color scale's min/max is recomputed for whichever granularity and layer is on screen, so switching Counties on sharpens the gradient to the real county-to-county spread.</p>
          </Section>

          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "var(--text-dim)", borderBottom: "1px solid var(--divider)", paddingBottom: 6 }}>Part E · Monte Carlo forecast</div>
          <Section step="E1" title="Three-tier correlated error">
            <p style={{ margin: 0 }}>Each simulated run draws a shared <strong>national</strong> polling miss, a <strong>regional</strong> miss (Northeast / Midwest / South / West move somewhat together), and an <strong>idiosyncratic per-state</strong> miss scaled by that state's own revealed 2020→2024 volatility. All three draws come from a fat-tailed Student-t distribution, not a normal one, so genuinely surprising nights stay possible. This layer runs on the 51 state baselines (not the full county set, for speed) and does not include manual local overrides — it measures uncertainty around your national/demographic slider settings only.</p>
          </Section>

          <Section title="Scenarios & data sources">
            <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
              <li><strong>County-level returns (2024 &amp; 2020, all ~3,140 counties):</strong> tonmcg/US_County_Level_Election_Results_08-24 (GitHub), itself compiled from official state/county election-authority reporting. State and national totals are summed directly from this dataset — exact to the certified vote.</li>
              <li><strong>Third-party national vote totals:</strong> Wikipedia's "Third-party and independent candidates for the 2024 United States presidential election" and equivalent 2020 reporting; see Part B for how these become state-level splits.</li>
              <li><strong>Demographic group baselines</strong> (Demographics tab, vote-choice sliders): 2024 AP VoteCast and Edison Research national exit polling (see Part D1).</li>
              <li><strong>County &amp; state demographic overlays</strong> (map data layers, Part D2): JieYingWu/COVID-19_US_County-level_Summaries (GitHub), itself compiled from USDA Economic Research Service county-level datasets and Census Bureau Population Estimates Program (PEP) race/age/sex tables — 2018 vintage. State figures are a population-weighted average of that state's own counties from the same source, so state and county views stay on one consistent dataset.</li>
              <li><strong>Ethnic Makeup layer</strong> (map data layers, Part D2): Census Bureau 2018–2022 ACS 5-year Summary File, tables B04006 and B03001, fetched directly from the Bureau's public bulk-download servers (no API key). Each detailed-origin figure is that group's share of its own table's total reporting population.</li>
              <li><strong>Geography:</strong> <code>us-atlas</code> 10m TopoJSON (states and counties), pre-projected AlbersUSA so Alaska and Hawaii sit in their conventional map insets, with Connecticut's planning regions re-projected in from growella/us-counties-10m-topojson (see Part C1).</li>
            </ul>
          </Section>

          <section style={{ padding: 16, background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8 }}>
            <h4 style={{ margin: "0 0 8px", color: "#EF4444", fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }}>⚠ Known limitations</h4>
            <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: "var(--text-muted)" }}>
              <li>Maine's and Nebraska's congressional-district electoral-vote splits are simplified to winner-take-all-by-state.</li>
              <li>Alaska and DC don't have a real county-equivalent election-results breakdown and fall back to a uniform statewide estimate on the map, with local override editing disabled at the county level for Alaska.</li>
              <li>Named third-party (RFK Jr., West) state-level vote totals are a modelled approximation, not official per-state tallies — see Part B.</li>
              <li>County-level minor-party splits assume the same proportions as their parent state (no county-level named-candidate data exists in the source).</li>
              <li>Demographic sensitivities (Demographics tab) are calibrated modelling assumptions built around real exit-poll baselines, not coefficients estimated from individual-level survey microdata. The deterministic map/results layer weights them by real county geography (Part D1); the Monte Carlo forecast, which runs on the 51 state baselines only, still treats them as a uniform national swing.</li>
              <li>The map's population/income/education/poverty/unemployment data layers (Part D2) are 2018-vintage — the most recent free, no-registration county-level source available — so they trail the current-day picture, and Connecticut's 9 planning regions borrow their county-equivalent figures from a manual, approximate crosswalk to the old 8 counties.</li>
              <li>The Ethnic Makeup layer (Part D2) is 2018–2022 ACS 5-year data; small ancestry/origin groups in small counties are noisier estimates (wider ACS margins of error) and can legitimately read as 0% where a group has negligible reported population there, rather than missing data.</li>
              <li>The Monte Carlo layer models uncertainty around the national/demographic sliders only — it does not simulate uncertainty on top of manual local (county/state) overrides.</li>
              <li>State electoral outcomes are point estimates and can flip on a normal polling error, especially in single-digit states — the Monte Carlo layer exists to quantify that.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
