# Electoral Swingometer

An interactive election-simulation tool: adjust party vote shares with sliders and watch seat
projections, hemicycle/parliament charts, and maps update live. Built around real electoral
systems rather than generic uniform swing.

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
