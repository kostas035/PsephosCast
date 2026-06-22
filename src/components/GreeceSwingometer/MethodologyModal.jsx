import { S } from "./GreeceStyles";
import { GR } from "./greece-data.js";

/* Small presentational helpers so the long document stays readable. */
const Mono = ({ children }) => (
  <div style={{ background: "var(--bg-mid)", padding: 12, borderRadius: 6, margin: "10px 0", border: "1px solid var(--border)", fontFamily: "var(--ff-mono, monospace)", fontSize: 12, lineHeight: 1.7, color: "var(--text-main)", overflowX: "auto" }}>
    {children}
  </div>
);

const Section = ({ step, title, children }) => (
  <section>
    <h4 style={{ margin: "0 0 8px", color: "var(--text-title)", fontSize: 16, display: "flex", alignItems: "baseline", gap: 8 }}>
      {step != null && <span style={{ fontSize: 11, fontFamily: "var(--ff-mono)", color: "#60A5FA", letterSpacing: 1 }}>{step}</span>}
      {title}
    </h4>
    {children}
  </section>
);

export default function MethodologyModal({ onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backdropFilter: "blur(4px)" }}>
      <div style={{ padding: 32, width: "100%", maxWidth: 720, maxHeight: "85vh", overflowY: "auto", background: "var(--bg-base)", borderRadius: 12, border: "1px solid var(--border)", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)", color: "var(--text-main)", fontFamily: "var(--ff-body)" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0, fontFamily: "var(--ff-head)", fontSize: 24, color: "var(--text-title)", letterSpacing: 1 }}>🇬🇷 METHODOLOGY</h2>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, letterSpacing: 1, textTransform: "uppercase" }}>
              How votes become 300 seats — reinforced proportional system (Law 4804/2021), constituency distribution per P.D. 26/2012, arts. 99–100
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} style={{ ...S.ghostBtn, border: "none", fontSize: 20 }}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24, fontSize: 14, lineHeight: 1.65 }}>

          {/* Intro */}
          <p style={{ margin: 0, color: "var(--text-muted)" }}>
            Every result is produced by the <strong style={{ color: "var(--text-title)" }}>actual legal procedure</strong>, not an optimiser or a curve-fit. Fed exact data it reproduces the official per-constituency seat table. The pipeline has two halves: a <strong>national</strong> calculation that fixes each party's total seats, and a <strong>constituency</strong> distribution that places those seats across the 59 electoral districts. Both run on top of two swing models that decide the vote shares in the first place.
          </p>

          {/* ── PART A — NATIONAL SEAT TOTALS ─────────────────────────── */}
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "var(--text-dim)", borderBottom: "1px solid var(--divider)", paddingBottom: 6 }}>Part A · National seat totals</div>

          <Section step="A1" title="Electoral threshold">
            <p style={{ margin: 0 }}>
              A party must clear <strong>{GR.BONUS_TRIGGER >= 0 ? "3%" : ""}3%</strong> of the valid national vote to win any seats (adjustable 0–10% in the panel). Parties below it are removed entirely — their votes are <em>not</em> transferred, they simply leave the denominator. Each surviving party's share is then recomputed against the <strong>qualifying pool</strong> only, which is why the "After Threshold" column always exceeds the raw vote share.
            </p>
            <Mono>
              qualifying = {"{"} parties with nationalShare ≥ threshold {"}"}<br/>
              qualifyingPool = Σ nationalShare(qualifying)<br/>
              finalShare(p) = nationalShare(p) / qualifyingPool
            </Mono>
          </Section>

          <Section step="A2" title="Winner's bonus (reinforced proportionality)">
            <p style={{ margin: 0 }}>
              The first-placed party receives a sliding bonus of seats on top of its proportional entitlement, scaled to its vote share. Below {GR.BONUS_TRIGGER}% the bonus is zero (pure proportional); at {GR.BONUS_TRIGGER}% it is {GR.BONUS_BASE} seats and rises by one seat per extra {GR.BONUS_STEP} of a percentage point, capped at {GR.BONUS_CAP}.
            </p>
            <Mono>
              bonus = 0&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if winnerShare &lt; {GR.BONUS_TRIGGER}%<br/>
              bonus = min({GR.BONUS_BASE} + ⌊(winnerShare − {GR.BONUS_TRIGGER}) ÷ {GR.BONUS_STEP}⌋, {GR.BONUS_CAP})&nbsp;&nbsp; otherwise<br/>
              <span style={{ color: "var(--text-dim)" }}>→ {GR.BONUS_BASE} seats at {GR.BONUS_TRIGGER}%, {GR.BONUS_CAP} seats at ~40%+</span>
            </Mono>
          </Section>

          <Section step="A3" title="Proportional allocation — Hare quota + largest remainder">
            <p style={{ margin: "0 0 8px" }}>
              The proportional pool — all {GR.TOTAL_SEATS} seats minus the winner's bonus — is shared out by the <strong>Hare quota with the largest-remainder</strong> method (the method named in the law), using each party's share of the qualifying pool.
            </p>
            <ol style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
              <li><strong>Integer seats:</strong> each party takes ⌊ share × poolSeats ⌋.</li>
              <li><strong>Remainders:</strong> the leftover seats go one-by-one to the largest fractional remainders until the pool is exhausted.</li>
              <li><strong>Bonus added last:</strong> the winner's bonus seats are added to its proportional total.</li>
            </ol>
            <Mono>
              poolSeats = {GR.TOTAL_SEATS} − bonus<br/>
              rawSeats(p) = finalShare(p) × poolSeats<br/>
              seats(p) = ⌊rawSeats(p)⌋ + largestRemainderTopUp&nbsp;&nbsp;(+ bonus if winner)
            </Mono>
          </Section>

          <Section step="A4" title="The 15 State (Επικρατείας) seats">
            <p style={{ margin: 0 }}>
              Of every party's total, a portion is filled from the nationwide <strong>State list</strong> rather than in a constituency. These {GR.LIST_SEATS} seats are split among qualifying parties by the same Hare quota + largest-remainder rule applied to national shares. A party that filed no State-Deputy ballot is barred from them and its entitlement passes to the next-largest remainder — this is how the model reproduces, for example, the Spartans' exclusion in June 2023 (P.D. 26/2012; AP 174/2023). The State seats are a <em>subset</em> of a party's total, not an addition: the remainder of its total is what it must win across the districts.
            </p>
            <Mono>
              listQuota = qualifyingPool / {GR.LIST_SEATS}<br/>
              constituencyTarget(p) = totalSeats(p) − listSeats(p)
            </Mono>
          </Section>

          {/* ── PART B — CONSTITUENCY DISTRIBUTION ────────────────────── */}
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "var(--text-dim)", borderBottom: "1px solid var(--divider)", paddingBottom: 6 }}>Part B · Constituency distribution (arts. 99–100)</div>

          <p style={{ margin: 0, color: "var(--text-muted)" }}>
            Each party now has a national constituency target (total minus State seats). The law places those seats across the 59 districts in a fixed order of operations — reproduced here exactly, with no repair or "fudge" step. Every district fills to its magnitude and every party lands on its national target, so the map always reconciles with the hemicycle.
          </p>

          <Section step="B1" title="Single-seat constituencies — plurality">
            <p style={{ margin: 0 }}>The leading qualifying party takes the seat outright, whatever the margin.</p>
          </Section>

          <Section step="B2" title="First distribution (πρώτη κατανομή), multi-seat constituencies">
            <p style={{ margin: 0 }}>
              Each party wins a whole seat for every full <em>electoral measure</em> its local vote contains, where the measure is the constituency's valid votes divided by its seats. Because the model carries vote <em>shares</em>, this is simply:
            </p>
            <Mono>
              seats₀(p, d) = ⌊ localShare(p, d) × magnitude(d) ⌋<br/>
              <span style={{ color: "var(--text-dim)" }}>e.g. a party needs ≥ 2⁄3 ≈ 66.7% to take 2 of 3 seats here outright</span>
            </Mono>
            <p style={{ margin: 0 }}>Most second and third seats are therefore decided in the remainder steps below, not here.</p>
          </Section>

          <Section step="B3" title="§100.7 — small constituencies (2- and 3-seat)">
            <p style={{ margin: 0 }}>
              Leftover seats in 2- and 3-seat districts are awarded one-by-one to the largest <strong>local remainders</strong>. If this pushes a party past its national constituency target, the surplus is stripped back — from the 3-seat then the 2-seat districts where that party's remainder is smallest — and those freed seats fall through to the next step.
            </p>
          </Section>

          <Section step="B4" title="§100.8 — large constituencies (4+ seats), smallest party first">
            <p style={{ margin: 0 }}>
              The remaining seats are filled party-by-party from the <strong>smallest</strong> national vote total up to the <strong>largest</strong>. Each party takes one seat per district in turn, ordered by its <em>absolute</em> remainder, repeating in passes until every party reaches its target and every seat is placed. Because the cross-district comparison is on absolute remainders, it is weighted by each district's valid-vote size (votes ÷ seats).
            </p>
            <p style={{ margin: "8px 0 0" }}>
              The crucial consequence: the largest party is served <em>last</em>, so it sweeps the leftover seats in the districts no smaller party claimed. This is exactly why a dominant party takes all four seats in one district yet only one of three in another — an emergent property of the real law, not a rule we hand-coded.
            </p>
          </Section>

          <Section step="B5" title="Per-district vote weight & the turnout slider">
            <p style={{ margin: 0 }}>
              The absolute-remainder comparison in B4 needs a real size for each district. Priority: a scenario's exact valid votes if known, else registered voters × turnout, else 2021 census population × turnout. The <strong>National Turnout</strong> slider shifts the national valid-vote rate in <em>logit</em> space, so a change lands non-uniformly across districts (a flat multiplier would cancel out of the seat maths entirely) and reshuffles only the genuinely marginal seats. At a shift of 0 it returns each scenario's real weights, so 2023 reproduces exactly.
            </p>
          </Section>

          {/* ── PART C — SWING MODELS ─────────────────────────────────── */}
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "var(--text-dim)", borderBottom: "1px solid var(--divider)", paddingBottom: 6 }}>Part C · How the vote shares are set</div>

          <Section step="C1" title="Demographic swing model">
            <p style={{ margin: 0 }}>
              Instead of moving parties one at a time, the Demographics tab moves whole voter blocs along six axes — youth turnout, senior turnout, urban/rural skew, education, economic precarity and gender. Each party carries a calibrated sensitivity coefficient on each axis; pushing a slider shifts every party at once by an amount proportional to that coefficient, after which the field is renormalised to 100%.
            </p>
            <Mono>
              Δ(p) = Σ_axis (slider_axis / 10) × sensitivity(p, axis)<br/>
              effectiveShare(p) = normalise( userShare(p) + Δ(p) )
            </Mono>
            <p style={{ margin: "8px 0 0" }}>
              The effect is also <strong>geographic</strong>. Five of the axes map to real per-constituency ELSTAT measures (65+ share, urbanisation, tertiary education, unemployment), standardised into population-weighted z-scores. On top of the uniform national swing, each party gets a local nudge proportional to how over- or under-represented that group is in the district — so a rise in senior turnout lifts senior-leaning parties more in older constituencies (Evrytania, Serres, Arcadia) than in young ones (the Dodecanese, East Attica). Because the z-scores are population-weighted they are nationally mean-zero, so this only redistributes the swing across the map; the national total is unchanged.
            </p>
          </Section>

          <Section step="C2" title="District-level logit swing">
            <p style={{ margin: 0 }}>
              The national swing is mapped onto each district in <strong>logit space</strong>, not by adding raw percentage points. This keeps every district between 0% and 100% and correctly compresses swings where a party is already very strong or very weak. A damping factor scales the swing by the party's local baseline:
            </p>
            <Mono>
              swing(p) = logit(effectiveShare p) − logit(baseShare p)&nbsp;&nbsp;<span style={{ color: "var(--text-dim)" }}>// national, in logit space</span><br/>
              damping = max(0.25, 1 − ((localBase − 5) ÷ 60) × 0.75)<br/>
              localShare(p, d) = logit⁻¹( logit(localBase) + swing(p) × damping )
            </Mono>
            <p style={{ margin: 0 }}>
              For a locally dominant party (base &gt; 65%) the damping floors at 0.25×, preventing absurd ceilings; for a micro-party (base &lt; 5%) it intentionally exceeds 1.0×, so a national surge can realistically push it over 3% in its strongholds. Each district is then renormalised to 100%.
            </p>
            <p style={{ margin: "8px 0 0", color: "var(--text-muted)", fontSize: 13 }}>
              District baselines come from the real 2023 constituency results; other scenarios derive their district shape by applying this same logit swing from 2023 to the new national totals, and successor/new parties inherit a parent party's geography through a lineage map.
            </p>
          </Section>

          {/* ── PART D — MONTE CARLO ──────────────────────────────────── */}
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "var(--text-dim)", borderBottom: "1px solid var(--divider)", paddingBottom: 6 }}>Part D · Monte Carlo forecast</div>

          <p style={{ margin: 0, color: "var(--text-muted)" }}>
            A single seat projection hides how much a result can move on a normal polling error. The Monte Carlo layer treats your current numbers as the <em>centre</em> of a distribution, perturbs them thousands of times by a realistic error, and re-runs the full seat engine above on every draw — so each simulated parliament obeys the same threshold, bonus and §99–100 rules.
          </p>

          <Section step="D1" title="The error model">
            <p style={{ margin: 0 }}>
              On each of ~5,000 iterations every party is shifted by two shocks: a <strong>common</strong> shock shared by all parties (the "all pollsters wrong in the same direction" risk) and a party-specific <strong>idiosyncratic</strong> shock. Both are drawn from a <strong>Student-t</strong> distribution (≈5 degrees of freedom) rather than a normal, so the occasional large miss — the fat tail real forecasters worry about — actually shows up. The split between the two is the correlation parameter (≈0.35), and the error scales mildly with party size, so a 30% party can miss by more points than a 3% party.
            </p>
            <Mono>
              sizeScale(p) = 0.5 + min(1.5, share(p) / 20)<br/>
              shared(p)&nbsp;&nbsp;= t₅ × σ × correlation × sizeScale(p)<br/>
              idio(p)&nbsp;&nbsp;&nbsp;&nbsp;= t₅ × σ × (1 − correlation) × sizeScale(p)<br/>
              draw(p)&nbsp;&nbsp;&nbsp;= max(0, share(p) + shared(p) + idio(p))<br/>
              <span style={{ color: "var(--text-dim)" }}>σ ≈ 2.5 pts · correlation ≈ 0.35 · iterations ≈ 5000</span>
            </Mono>
          </Section>

          <Section step="D2" title="What it reports">
            <p style={{ margin: 0 }}>
              For each party the simulation records its full seat distribution and summarises it as a median with 90% and 50% intervals (the p5–p95 and p25–p75 bands), plus the share of simulations in which it finishes first and the share in which it wins an outright 151-seat majority. It also reports how often parliament is hung. The complete seat matrix from every draw is kept, so the <strong>coalition builder</strong> can return the probability that any chosen set of parties reaches 151 instantly, without re-simulating.
            </p>
            <Mono>
              per party → median, p5 · p25 · p75 · p95, min/max, P(first), P(majority)<br/>
              overall&nbsp;&nbsp; → P(hung parliament)<br/>
              coalition → P(Σ seats ≥ {GR.MAJORITY}) from the stored matrix
            </Mono>
          </Section>

          {/* ── Scenarios & sources ───────────────────────────────────── */}
          <Section title="Scenarios & data sources">
            <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
              <li><strong>May 2026 Polling Average:</strong> a live per-party average of the most recent published polls, scraped from Wikipedia.</li>
              <li><strong>June 2023 Legislative:</strong> official Ministry of the Interior final results (5,273,699 valid votes).</li>
              <li><strong>July 2019 Legislative:</strong> official Ministry of the Interior final results (5,769,542 valid votes).</li>
            </ul>
          </Section>

          {/* ── Limitations (corrected) ───────────────────────────────── */}
          <section style={{ padding: 16, background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: 8 }}>
            <h4 style={{ margin: "0 0 8px", color: "#EF4444", fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }}>⚠ Known limitations</h4>
            <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: "var(--text-muted)" }}>
              <li>The demographic sensitivities and district swing multipliers are <strong>modelling assumptions</strong> calibrated on 2019 and 2023 patterns, not coefficients estimated from individual-level survey microdata. Brand-new parties without electoral history are approximated through the lineage map and should be read with caution.</li>
              <li>Seat outputs are point estimates and genuinely sensitive: a ±1-point national polling error can move the winner's seat count by 5–15 seats. The Monte Carlo layer exists precisely to quantify this.</li>
              <li>The model assumes voters behave identically on the constituency ballot and the State-list ballot; in reality a minority split their vote between the two.</li>
              <li>The §100.8 cross-district ranking is exact only when fed an election's true per-constituency valid votes; for hypothetical scenarios it uses census/turnout proxies, so a handful of genuinely marginal seats may differ from an official count.</li>
            </ul>
          </section>

          <p style={{ margin: 0, color: "var(--text-dim)", fontSize: 12, fontStyle: "italic" }}>
            The map renders all 59 official electoral constituencies, including the urban splits (Athens A, B1, B2, B3; Thessaloniki A, B; Piraeus A, B), with a dedicated Athens metropolitan inset. Mount Athos carries no parliamentary seat and is excluded from the seat maths.
          </p>

        </div>
      </div>
    </div>
  );
}
