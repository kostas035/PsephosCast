# Electoral Swingometer

A "swingometer" answers the question *"what if the vote shifted by a few points?"* — drag a
slider to give a party more or less support, and instantly see who wins, how many seats each
party gets, and whether anyone reaches a majority. This project does that properly: instead of
a simplistic uniform national swing, each country runs on a faithful model of its **actual
electoral law** — seat bonuses, thresholds, proportional remainder allocation, district
quirks — so the numbers reflect what would genuinely happen, not a rough approximation.

What you can actually do with it:

- **Adjust vote shares with sliders** and watch the seat count, parliament hemicycle chart, and
  constituency map update live, under the real electoral system of each country.
- **Build hypothetical coalitions** and check whether the seats actually add up to a majority.
- **Run a Monte Carlo forecast** — thousands of simulated elections with realistic, fat-tailed
  polling error — to see the *range* of plausible outcomes and the odds of any given result,
  rather than trusting a single fixed projection.
- **Drill into individual regions** (currently Greek regions, down to municipality level) for
  more local detail than the national picture gives you.
- **Explore the statistics behind the numbers** — regression, correlation, and demographic
  breakdowns — on the Correlations page.
- **Export a scenario** as an image or data file to share. Everything above runs entirely in
  your browser; nothing is uploaded anywhere (see the in-app Privacy Policy for specifics).

It currently covers **Greece** (national and regional/municipal) and **Cyprus**, with an
Australian federal model already built but not yet wired into the live site (see below).

## Live simulators

| Route | Description |
|---|---|
| `/greece` | Greek parliamentary elections — full electoral law model (bonus seats for the winner, state-seat allocation by remainder, threshold elimination), constituency map, opinion poll tracking, Monte Carlo projections. |
| `/greece/correlations` | Statistical analysis of Greek results: regression, bivariate, descriptive, and group panels over demographic/voting data. |
| `/greece-regional` | Drill-down maps for individual Greek regions (Crete, Macedonia, Thessaly, Epirus, Eastern Macedonia & Thrace), with municipality-level swing modelling. |
| `/cyprus` | Cypriot parliamentary elections, with coalition-builder and Monte Carlo simulation. |

An Australian federal election simulator (`AustraliaSwingometer`) is fully built but not
currently wired into the router — see `src/App.jsx` if you want to re-enable it at `/australia`.

## Tech stack

- React 19 + Vite
- `react-router-dom` for routing, with route-level code splitting (`lazy`/`Suspense`)
- D3 + Recharts for charts and maps
- Tailwind v4
- `html2canvas` for image export of results
- Self-hosted fonts via `@fontsource`

## Getting started

```bash
npm install
npm run dev        # start the dev server
npm run build      # production build to dist/
npm run preview    # preview the production build locally
npm run lint        # eslint
```

## Project structure

```
src/
  App.jsx                      # routes
  components/
    WelcomeScreen.jsx          # landing page
    GreeceSwingometer/         # main Greek simulator (engine, data, map, stats, export)
    GreeceRegions/             # regional drill-down maps + per-region data files
    CyprusSwingometer/         # Cypriot simulator
    AustraliaSwingometer/      # Australian simulator (not currently routed)
```

Each country follows the same internal pattern: a `*-data.js` (results/demographics), a
`*-engine.js` (the actual electoral-system math), `*-montecarlo.js` (simulation), plus
`Map`, `ControlPanel`, theming, and modal components.

To add a new Greek region, see
[`src/components/GreeceRegions/regions/ADD_REGION_GUIDE.md`](src/components/GreeceRegions/regions/ADD_REGION_GUIDE.md).

## Deployment

Deployed via Vercel (`.vercel/`).
