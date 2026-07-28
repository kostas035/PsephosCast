# Graph Report - swingometer  (2026-07-14)

## Corpus Check
- 93 files · ~399,261 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 781 nodes · 1612 edges · 43 communities (38 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.61)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `12b5fb8a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_greece-stats.js|greece-stats.js]]
- [[_COMMUNITY_GreeceRegionsApp.jsx|GreeceRegionsApp.jsx]]
- [[_COMMUNITY_greece-data.js|greece-data.js]]
- [[_COMMUNITY_GreeceExport.jsx|GreeceExport.jsx]]
- [[_COMMUNITY_dependencies|dependencies]]
- [[_COMMUNITY_GreeceApp.jsx|GreeceApp.jsx]]
- [[_COMMUNITY_GreeceTranslations.jsx|GreeceTranslations.jsx]]
- [[_COMMUNITY_cyprus-ui.jsx|cyprus-ui.jsx]]
- [[_COMMUNITY_App.jsx|App.jsx]]
- [[_COMMUNITY_aus-components.jsx|aus-components.jsx]]
- [[_COMMUNITY_CyprusApp.jsx|CyprusApp.jsx]]
- [[_COMMUNITY_Map.jsx|Map.jsx]]
- [[_COMMUNITY_CyprusThemePicker.jsx|CyprusThemePicker.jsx]]
- [[_COMMUNITY_greece-utils.js|greece-utils.js]]
- [[_COMMUNITY_GreeceCorrelations.jsx|GreeceCorrelations.jsx]]
- [[_COMMUNITY_cyprus-components.jsx|cyprus-components.jsx]]
- [[_COMMUNITY_ThemePicker.jsx|ThemePicker.jsx]]
- [[_COMMUNITY_aus-engine.js|aus-engine.js]]
- [[_COMMUNITY_S|S]]
- [[_COMMUNITY_greece-stats-export.js|greece-stats-export.js]]
- [[_COMMUNITY_ControlPanel.jsx|ControlPanel.jsx]]
- [[_COMMUNITY_aus-map.jsx|aus-map.jsx]]
- [[_COMMUNITY_Electoral Swingometer|Electoral Swingometer]]
- [[_COMMUNITY_MonteCarloPanel.jsx|MonteCarloPanel.jsx]]
- [[_COMMUNITY_AustraliaApp.jsx|AustraliaApp.jsx]]
- [[_COMMUNITY_CyprusMonteCarloPanel.jsx|CyprusMonteCarloPanel.jsx]]
- [[_COMMUNITY_aus-data.js|aus-data.js]]
- [[_COMMUNITY_aus-demographics-adapter.js|aus-demographics-adapter.js]]
- [[_COMMUNITY_usePolls.js|usePolls.js]]
- [[_COMMUNITY_MonteCarloPanel.jsx|MonteCarloPanel.jsx]]
- [[_COMMUNITY_ResultsTable.jsx|ResultsTable.jsx]]
- [[_COMMUNITY_CLAUDE|CLAUDE.md]]
- [[_COMMUNITY_MarginalSeats|MarginalSeats]]
- [[_COMMUNITY_PrefFlows|PrefFlows]]
- [[_COMMUNITY_smoke-nonzero.mjs|smoke-nonzero.mjs]]
- [[_COMMUNITY_ControlPanel.jsx|ControlPanel.jsx]]
- [[_COMMUNITY_anovaOneWay|anovaOneWay]]
- [[_COMMUNITY_finiteOnly|finiteOnly]]
- [[_COMMUNITY_GreeceStyles.jsx|GreeceStyles.jsx]]
- [[_COMMUNITY_greece-crisis-economics-data.js|greece-crisis-economics-data.js]]

## God Nodes (most connected - your core abstractions)
1. `S` - 20 edges
2. `useGreeceT()` - 18 edges
3. `mean()` - 17 edges
4. `MonteCarloPanel()` - 14 edges
5. `grDistrictsForScenario()` - 13 edges
6. `cleanRow()` - 13 edges
7. `runScenario()` - 11 edges
8. `PsephosCast — Electoral Swingometer` - 11 edges
9. `S` - 10 edges
10. `GR` - 10 edges

## Surprising Connections (you probably didn't know these)
- `grDistrictElectorate()` --calls--> `logit()`  [INFERRED]
  src/components/GreeceSwingometer/greece-engine.js → scripts/calibrate-sensitivities.mjs
- `runScenario()` --calls--> `grDistrictsForScenario()`  [EXTRACTED]
  scripts/lib/engine-runner.mjs → src/components/GreeceSwingometer/greece-data.js
- `runScenario()` --calls--> `grAllocateAllDistrictSeats()`  [EXTRACTED]
  scripts/lib/engine-runner.mjs → src/components/GreeceSwingometer/greece-engine.js
- `runScenario()` --calls--> `grRunElection()`  [EXTRACTED]
  scripts/lib/engine-runner.mjs → src/components/GreeceSwingometer/greece-engine.js
- `logit()` --calls--> `grToLogit()`  [EXTRACTED]
  scripts/calibrate-sensitivities.mjs → src/components/GreeceSwingometer/greece-data.js

## Import Cycles
- None detected.

## Communities (43 total, 5 thin omitted)

### Community 0 - "greece-stats.js"
Cohesion: 0.10
Nodes (52): anova(), averageRanks(), betacf(), betai(), chiSqP(), chiSquareTable(), cleanRow(), corrPValue() (+44 more)

### Community 1 - "GreeceRegionsApp.jsx"
Cohesion: 0.13
Nodes (16): IconCamera, IconChevron, IconColumns, IconEye, IconEyeOff, IconMapPin, IconMinus, IconPeople (+8 more)

### Community 2 - "greece-data.js"
Cohesion: 0.09
Nodes (27): BLOCS, buildAnalysisFrame(), HIST_FIELD_ACCESSORS, ISLANDS, REGIONS, generateDerivedBaseline(), GR_2015_MERGE_GROUPS, GR_2015_SEAT_DIFF (+19 more)

### Community 3 - "GreeceExport.jsx"
Cohesion: 0.06
Nodes (31): GR, grCoalitionProbability(), grRunMonteCarlo(), percentile(), randn(), studentT(), BG_OPTIONS, covered() (+23 more)

### Community 4 - "dependencies"
Cohesion: 0.06
Nodes (33): dependencies, d3, @fontsource/barlow-condensed, @fontsource/bebas-neue, @fontsource/crimson-pro, @fontsource/ibm-plex-mono, @fontsource-variable/material-symbols-outlined, html2canvas (+25 more)

### Community 5 - "GreeceApp.jsx"
Cohesion: 0.13
Nodes (23): HOWTO, IconArrowLeft(), IconBriefcase(), IconBuilding(), IconCamera(), IconClose(), IconContrast(), IconDice() (+15 more)

### Community 6 - "GreeceTranslations.jsx"
Cohesion: 0.06
Nodes (54): GrPartyControlItem(), GrPartyPicker(), GR_BONUS_CONFIG, GR_HEMI_POSITIONS, GR_ROW_RADII, grFmtVotes(), grFmtVotesShort(), CONTROL_PANEL (+46 more)

### Community 7 - "cyprus-ui.jsx"
Cohesion: 0.18
Nodes (16): CyControlPanel, CY_DEM_CONTROLS, CY_IDEOLOGY_LABELS, IconColumns, IconEye, IconEyeOff, IconGear, IconLock (+8 more)

### Community 8 - "App.jsx"
Cohesion: 0.14
Nodes (7): App(), CyprusApp, GreeceApp, GreeceCorrelations, GreeceRegionsApp, WelcomeScreen(), ErrorBoundary

### Community 9 - "aus-components.jsx"
Cohesion: 0.09
Nodes (22): BivariatePanel(), DescriptivesPanel(), RegressionPanel(), movementNote(), sectionTitleStyle, TrendBlock(), TrendPanel(), buildReadout() (+14 more)

### Community 10 - "CyprusApp.jsx"
Cohesion: 0.14
Nodes (17): CY_DISTRICT_BASELINES, CY_DISTRICT_DEMOGRAPHICS, CY_PARTY_LINEAGE, CY_PATHS, CY_RAW_DISTRICTS, CY_ROW_COUNTS, CY_SCENARIO_LABELS, CY_SCENARIO_TURNOUT (+9 more)

### Community 11 - "Map.jsx"
Cohesion: 0.08
Nodes (28): GR_CENTROID_OFFSETS, GR_PARTY_DICT, GR_PREFECTURE_MAP, grBuildScenario(), concatAsMultiPolygon(), GR_2015_GEO_MERGES, grScenarioGeoJson(), mergeFeatures() (+20 more)

### Community 12 - "CyprusThemePicker.jsx"
Cohesion: 0.14
Nodes (18): CY_PARTY_DICT, IconCheck, CyprusThemePicker(), paletteColors(), PREVIEW_IDS, applyPartyPalette(), BLUEYELLOW, CONTRAST_VARS (+10 more)

### Community 13 - "greece-utils.js"
Cohesion: 0.09
Nodes (24): GR_MUNI_DATA, GR_MUNI_PARTY_IDS, IconBallot(), IconBarChart(), IconCoins(), IconElder(), IconEyeOff(), IconMedal() (+16 more)

### Community 14 - "GreeceCorrelations.jsx"
Cohesion: 0.10
Nodes (21): ANALYSIS_MODULES, BASELINE_OPTIONS, BLOC_OPTIONS, DEMO_FIELDS, econHistFields(), GreeceCorrelations(), PARTY_OPTIONS, sectionTitleStyle (+13 more)

### Community 15 - "cyprus-components.jsx"
Cohesion: 0.18
Nodes (9): CyCoalitionBuilder, CyPartyControlItem, CY, CY_HEMI_POSITIONS, CY_ROW_RADII, CyHemicycle, CyDistrictMap, S (+1 more)

### Community 16 - "ThemePicker.jsx"
Cohesion: 0.15
Nodes (17): IconCheck(), applyPartyPalette(), BLUEYELLOW, CONTRAST_VARS, DARK_VARS, GR_MONO_PATTERNS, LIGHT_VARS, MONO (+9 more)

### Community 17 - "aus-engine.js"
Cohesion: 0.22
Nodes (7): IconArrowLeft, IconMoon, DARK_VARS, LIGHT_VARS, MeanderBar, S, Slider

### Community 18 - "S"
Cohesion: 0.19
Nodes (11): CY_DISTRICT_OFFICIAL_SEATS, cyFromLogit(), cyToLogit(), generateDerivedBaseline(), cyAllocateAllSeats(), cyApplySwing(), cyFmtVotes(), cyFmtVotesShort() (+3 more)

### Community 19 - "greece-stats-export.js"
Cohesion: 0.36
Nodes (11): CAVEATS, buildExportSheets(), downloadBlob(), exportCSV(), exportDoc(), exportPDF(), exportXLSX(), fileStamp() (+3 more)

### Community 20 - "ControlPanel.jsx"
Cohesion: 0.11
Nodes (22): d2012, d2023, clamp(), demographicsCache, GDPPC_MAX, GDPPC_MIN, gdpPerCapitaForDistrict(), GR_DEMO_AXES (+14 more)

### Community 22 - "Electoral Swingometer"
Cohesion: 0.09
Nodes (21): Author, Cyprus — open-list PR with a district/national split, Data, Deployment, Disclaimer, Greece — reinforced proportional representation, How the electoral models work, Live routes (+13 more)

### Community 23 - "MonteCarloPanel.jsx"
Cohesion: 0.22
Nodes (4): IDEOLOGIES, EMTH_DETAILS_2023, REGIONS_DB, THESSALY_DETAILS_2023

### Community 24 - "AustraliaApp.jsx"
Cohesion: 0.11
Nodes (16): baseVotes2019ByDistrict, blended, clampP(), districts, fits, K_GRID, logit(), nat2019 (+8 more)

### Community 25 - "CyprusMonteCarloPanel.jsx"
Cohesion: 0.26
Nodes (8): cyCoalitionProbability(), cyNationalSeats(), cyRunMonteCarlo(), percentile(), randn(), studentT(), IconChevron, CyMonteCarloPanel

### Community 26 - "aus-data.js"
Cohesion: 0.12
Nodes (16): districts, elect, official, officialById, officialSeats, partyIds, perDistrictTotal, perPartyErrors (+8 more)

### Community 27 - "aus-demographics-adapter.js"
Cohesion: 0.29
Nodes (6): CRETE_DETAILS_2014, CRETE_DETAILS_2019, CRETE_DETAILS_2023, CRETE_DISTRICT_2014, CRETE_DISTRICT_2019, CRETE_MUNICIPALITY_DISTRICTS

### Community 28 - "usePolls.js"
Cohesion: 0.25
Nodes (4): GreeceApp(), fmtNoPartiesThreshold(), PARTY_HEADER_PATTERNS, usePolls()

### Community 29 - "MonteCarloPanel.jsx"
Cohesion: 0.18
Nodes (16): baseline, baselinePath, current, __dirname, write, ZERO_SLIDERS, computeEffectiveParties(), FIXED_SCENARIO_IDS (+8 more)

### Community 30 - "ResultsTable.jsx"
Cohesion: 0.33
Nodes (5): PartyRow, SemiCircleChart(), IconGear, IconLock, IconTrash

### Community 34 - "PrefFlows"
Cohesion: 0.21
Nodes (13): GR_DISTRICT_TURNOUT, GR_MULTIPLIERS, GR_STATE_BALLOT_EXCLUDED, grDistrictsForScenario(), grDemographicsForScenario(), grDemoZForScenario(), grAllocateAllDistrictSeats(), grAllocateStateSeats() (+5 more)

### Community 35 - "smoke-nonzero.mjs"
Cohesion: 0.17
Nodes (11): afflu, athensA0, athensAff, evrytania0, evrytaniaS, natSenior, natZero, senior (+3 more)

### Community 36 - "ControlPanel.jsx"
Cohesion: 0.18
Nodes (10): ControlPanel(), GR_DEM_CONTROLS, GR_IDEOLOGY_LABELS, GR_SCENARIO_LABELS, IconColumns(), IconGear(), IconPeople(), IconPlus() (+2 more)

### Community 41 - "GreeceStyles.jsx"
Cohesion: 0.15
Nodes (11): ExportPreview(), sectionTitleStyle, GroupPanel(), sectionTitleStyle, SwingPanel(), IconChevron(), Dropdown, GlobalStyles (+3 more)

### Community 43 - "greece-crisis-economics-data.js"
Cohesion: 0.20
Nodes (7): gdpAcc, GR_GDP_PER_CAPITA_BY_REGION, GR_LONGTERM_UNEMPLOYMENT_BY_REGION, GR_YOUTH_UNEMPLOYMENT_BY_REGION, ltuAcc, YEARS, youthAcc

## Knowledge Gaps
- **210 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+205 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `CookiesModal()` connect `aus-map.jsx` to `aus-engine.js`, `CyprusApp.jsx`, `GreeceApp.jsx`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Why does `PrivacyModal()` connect `aus-map.jsx` to `aus-engine.js`, `CyprusApp.jsx`, `GreeceApp.jsx`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Why does `S` connect `GreeceStyles.jsx` to `GreeceExport.jsx`, `ControlPanel.jsx`, `GreeceApp.jsx`, `GreeceTranslations.jsx`, `aus-components.jsx`, `Map.jsx`, `greece-utils.js`, `GreeceCorrelations.jsx`, `ThemePicker.jsx`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _210 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `greece-stats.js` be split into smaller, more focused modules?**
  _Cohesion score 0.10303030303030303 - nodes in this community are weakly interconnected._
- **Should `GreeceRegionsApp.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13071895424836602 - nodes in this community are weakly interconnected._
- **Should `greece-data.js` be split into smaller, more focused modules?**
  _Cohesion score 0.08901515151515152 - nodes in this community are weakly interconnected._