# PsephosCast — Electoral Swingometer

A swingometer answers one question: *if the vote moved by a few points, who actually wins?*
Drag a slider, and the seat count, the parliament chart, and the constituency map all update
live. The part that makes this different from the usual uniform-swing toy is that each country
isn't a rough approximation — it's a real implementation of that country's actual electoral
law: seat bonuses, thresholds, remainder allocation, district magic numbers, all of it. Feed it
an election's real percentages and it reproduces the real seat count. Move the sliders from
there and you're looking at what the law would actually do with a different result, not a guess.

This started as a personal project to understand Greek electoral law well enough to code it,
and grew from there to Cyprus and (not yet live) Australia.

## What it does

- **Sliders drive a real electoral system.** Adjust national vote share per party and the app
  re-runs the actual seat-allocation law for that country — not a linear seats-per-point
  extrapolation.
- **Geography isn't uniform.** A national swing doesn't move every district by the same amount.
  It's distributed through a logit-space swing model (below) plus, for Greece, a demographic
  layer that concentrates each swing where the relevant population actually lives.
- **Coalitions.** Build a hypothetical governing coalition and see whether the seats actually
  clear a majority.
- **Monte Carlo forecasting.** Instead of one fixed projection, run thousands of simulated
  elections with realistic (fat-tailed) polling error and see the *distribution* of plausible
  outcomes — win probabilities, not just a point estimate.
- **Live opinion polling**, pulled dynamically and averaged into a rolling baseline.
- **Regional drill-down** for Greece, down to individual municipalities, with its own local
  swing model per region.
- **A statistics workbench** (the Correlations page) — descriptives, regression, bivariate and
  group analysis over the demographic and voting data.
- **Export.** Compose a results graphic (map, hemicycle, tables, charts) on a resizable board
  and download it as an image, or export the underlying numbers as CSV/XLSX.

Everything runs client-side. No scenario, slider position, or exported file ever touches a
server — see the in-app Privacy Policy for specifics.

## How the electoral models work

Each country's simulator is built around two layers: a **deterministic engine** that
implements the actual law, and a **swing model** that decides how a national shift in support
plays out across districts.

### The swing model (logit space)

Vote shares are moved in [logit](https://en.wikipedia.org/wiki/Logit) space rather than
linearly. A party polling at 3% and one polling at 40% don't respond to "+5 points" the same
way — a linear model can push the small party negative or the large party past 100%. Logit
swing keeps every party's share bounded in (0, 100) and lets the same slider value mean
proportionally more to a small party than a large one, which is closer to how real swings
actually behave.

For Greece specifically, there's a second layer on top: each demographic slider (age, urban/
rural, education, economic precarity) is mapped to a real per-constituency ELSTAT statistic,
standardised into a population-weighted z-score against the national mean. That z-score
determines how much *harder* or *softer* the swing lands in a given constituency — concentrating
the effect where that demographic group is actually over- or under-represented, rather than
spreading it evenly across the map. Because the weighting is population-based and mean-zero,
this layer only redistributes the swing geographically; the national total is untouched.

### Greece — reinforced proportional representation

Implements the "reinforced proportional" system in force since June 2023 (P.D. 26/2012, Arts.
99–100, as amended by L.4859/2021), including:

- A sliding **winner's bonus** of extra seats (scaling with vote share above the trigger
  threshold), on top of the proportional pool.
- **State-seat allocation** by largest remainder among parties clearing the 3% national
  threshold, correctly excluding parties barred for not filing a state-deputy ballot.
- **Full constituency-level seat distribution**: single-seat constituencies by plurality,
  multi-seat constituencies through the actual multi-step remainder process the law specifies
  (first distribution, unused-remainder allocation, surplus stripping, and the cross-
  constituency absolute-remainder pass), so the map reconciles exactly with the national
  hemicycle — no fudge step.
- Older pre-2019 electoral law is modelled separately for historical scenarios (2012, 2015),
  since the seat-bonus rules changed substantially since then.

Feed it a real election's percentages and it reproduces the official seat table per
constituency; move the sliders and it applies the same law to the hypothetical result.

### Cyprus — open-list PR with a district/national split

56 seats split between district-level allocation and a national top-up pass, with its own
threshold and remainder rules, plus a coalition builder for checking hypothetical governing
majorities.

### Australia — simulated preferential count (built, not yet live)

Rather than approximating two-party-preferred swing directly, this one simulates the actual
count: candidates are eliminated from the bottom up, preferences flow according to historical
party-preference matrices, until two remain — a genuine division-level two-candidate-preferred
result. Divisions with entrenched independents or strong regional parties ("local kings") carry
their own baseline that only partially follows the national swing, since a personal vote doesn't
move like a party vote does.

### Monte Carlo layer

On top of the deterministic engine, the probabilistic layer perturbs the *current* national
percentages thousands of times using a Student-t error distribution (rather than Normal) so
that occasional large polling misses are represented realistically, re-runs the real seat
engine on every draw, and summarises the resulting distribution — seat-count ranges, win
probabilities, coalition odds.

## Data

Baseline scenarios come from official sources — the Hellenic Ministry of Interior, ELSTAT, and
the Cyprus Ministry of Interior for historical results and demographics. Live opinion-polling
averages are fetched at runtime via the Wikimedia Foundation REST API (Wikipedia's polling
tables), under CC BY-SA.

## Live routes

| Route | What's there |
|---|---|
| `/` | Landing page / country picker |
| `/greece` | Greek national election simulator — full electoral law model, constituency map, opinion polling, Monte Carlo |
| `/greece/correlations` | Statistics workbench over Greek demographic/voting data |
| `/greece-regional` | Municipality-level drill-down for individual Greek regions (Crete, Macedonia, Thessaly, Epirus, Eastern Macedonia & Thrace) |
| `/cyprus` | Cypriot parliamentary election simulator, with coalition builder and Monte Carlo |

The Australian simulator is fully built but not currently wired into the router — see
`src/App.jsx` and `src/components/AustraliaSwingometer/` if you want to re-enable it at
`/australia`.

## Tech stack

- React 19 + Vite
- `react-router-dom`, with route-level code splitting (`lazy`/`Suspense`)
- D3 + Recharts for the maps and charts
- Tailwind v4
- `html2canvas` for image export
- Self-hosted fonts via `@fontsource`

## Running it locally

```bash
npm install
npm run dev        # dev server
npm run build      # production build to dist/
npm run preview    # preview the production build
npm run lint        # eslint
```

## Project layout

```
src/
  App.jsx                      # routes
  components/
    WelcomeScreen.jsx          # landing page
    GreeceSwingometer/         # national Greek simulator: engine, data, map, stats, export
    GreeceRegions/             # regional drill-down maps + per-region data files
    CyprusSwingometer/         # Cypriot simulator
    AustraliaSwingometer/      # Australian simulator (not currently routed)
```

Each country follows the same rough shape: a `*-data.js` (historical results, party metadata,
demographics), a `*-engine.js` (the electoral-law math itself), `*-montecarlo.js` (the
probabilistic layer), plus `Map`, control-panel, theming, and modal components specific to
that country's UI.

To add a new Greek region, see
[`src/components/GreeceRegions/regions/ADD_REGION_GUIDE.md`](src/components/GreeceRegions/regions/ADD_REGION_GUIDE.md).

## Deployment

Deployed via Vercel.

## Disclaimer

This is an independent, non-commercial academic project — not an official forecast from any
government, party, or pollster. It's built for educational and illustrative purposes; treat the
outputs as "what the law would do with this hypothetical result," not a prediction.

## Author

Konstantinos Davakos — Department of Economics, University of Ioannina.
Feedback / methodology questions: kostasdabakos@gmail.com
