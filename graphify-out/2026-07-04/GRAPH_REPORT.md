# Graph Report - swingometer  (2026-07-04)

## Corpus Check
- 89 files · ~385,516 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 728 nodes · 1469 edges · 41 communities (34 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.54)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `017ea202`
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
- [[_COMMUNITY_greece-geo-2015.js|greece-geo-2015.js]]
- [[_COMMUNITY_CLAUDE|CLAUDE.md]]
- [[_COMMUNITY_MarginalSeats|MarginalSeats]]
- [[_COMMUNITY_PrefFlows|PrefFlows]]
- [[_COMMUNITY_PrimarySliders|PrimarySliders]]
- [[_COMMUNITY_StateBreakdown|StateBreakdown]]
- [[_COMMUNITY_anovaOneWay|anovaOneWay]]
- [[_COMMUNITY_finiteOnly|finiteOnly]]
- [[_COMMUNITY_greece-engine-pre2019.js|greece-engine-pre2019.js]]

## God Nodes (most connected - your core abstractions)
1. `S` - 19 edges
2. `useGreeceT()` - 18 edges
3. `mean()` - 17 edges
4. `MonteCarloPanel()` - 14 edges
5. `cleanRow()` - 13 edges
6. `S` - 10 edges
7. `GR` - 10 edges
8. `multipleOLS()` - 10 edges
9. `corrTest()` - 10 edges
10. `CY` - 9 edges

## Surprising Connections (you probably didn't know these)
- `grDistrictElectorate()` --calls--> `clamp()`  [INFERRED]
  src/components/GreeceSwingometer/greece-engine.js → src/components/AustraliaSwingometer/aus-demographics-adapter.js
- `GrPartyControlItem()` --calls--> `useGreeceT()`  [EXTRACTED]
  src/components/GreeceSwingometer/ControlPanel.jsx → src/components/GreeceSwingometer/GreeceTranslations.jsx
- `ControlPanel()` --calls--> `useGreeceT()`  [EXTRACTED]
  src/components/GreeceSwingometer/ControlPanel.jsx → src/components/GreeceSwingometer/GreeceTranslations.jsx
- `GreeceApp()` --calls--> `resolveTheme()`  [EXTRACTED]
  src/components/GreeceSwingometer/GreeceApp.jsx → src/components/GreeceSwingometer/GreeceThemes.js
- `GreeceApp()` --calls--> `useGreeceT()`  [EXTRACTED]
  src/components/GreeceSwingometer/GreeceApp.jsx → src/components/GreeceSwingometer/GreeceTranslations.jsx

## Import Cycles
- None detected.

## Communities (41 total, 7 thin omitted)

### Community 0 - "greece-stats.js"
Cohesion: 0.06
Nodes (70): BivariatePanel(), DescriptivesPanel(), GroupPanel(), RegressionPanel(), sectionTitleStyle, SwingPanel(), anova(), averageRanks() (+62 more)

### Community 1 - "GreeceRegionsApp.jsx"
Cohesion: 0.05
Nodes (39): PartyRow, SemiCircleChart(), IDEOLOGIES, IconArrowLeft, IconCamera, IconChevron, IconColumns, IconEye (+31 more)

### Community 2 - "greece-data.js"
Cohesion: 0.09
Nodes (33): buildAnalysisFrame(), ISLANDS, REGIONS, generateDerivedBaseline(), GR_2015_MERGE_GROUPS, GR_DISTRICT_BASELINES, GR_DISTRICT_DEMOGRAPHICS, GR_DISTRICT_POP (+25 more)

### Community 3 - "GreeceExport.jsx"
Cohesion: 0.06
Nodes (31): GR, grCoalitionProbability(), grRunMonteCarlo(), percentile(), randn(), studentT(), BG_OPTIONS, covered() (+23 more)

### Community 4 - "dependencies"
Cohesion: 0.06
Nodes (33): dependencies, d3, @fontsource/barlow-condensed, @fontsource/bebas-neue, @fontsource/crimson-pro, @fontsource/ibm-plex-mono, @fontsource-variable/material-symbols-outlined, html2canvas (+25 more)

### Community 5 - "GreeceApp.jsx"
Cohesion: 0.14
Nodes (21): HOWTO, IconBuilding(), IconCalendar(), IconCamera(), IconClose(), IconContrast(), IconDice(), IconEye() (+13 more)

### Community 6 - "GreeceTranslations.jsx"
Cohesion: 0.08
Nodes (28): GrPartyControlItem(), GR_BONUS_CONFIG, grFmtVotes(), grFmtVotesShort(), CONTROL_PANEL, fmtBelowThreshold(), fmtInclBonus(), fmtSeatsOfNeeded() (+20 more)

### Community 7 - "cyprus-ui.jsx"
Cohesion: 0.13
Nodes (21): CY_DEM_CONTROLS, CY_DISTRICT_DEMOGRAPHICS, CY_IDEOLOGY_LABELS, CY_PATHS, IconArrowLeft, IconCamera, IconColumns, IconEye (+13 more)

### Community 8 - "App.jsx"
Cohesion: 0.11
Nodes (8): App(), CyprusApp, GreeceApp, GreeceCorrelations, GreeceRegionsApp, PrivacyModal(), WelcomeScreen(), ErrorBoundary

### Community 9 - "aus-components.jsx"
Cohesion: 0.11
Nodes (20): AusHemicycle, AusMetricsCards, AusResultsTable, AusSeatsOnLine, AusSlidersPanel, AusStateBreakdown, National2PP, SeatTally (+12 more)

### Community 10 - "CyprusApp.jsx"
Cohesion: 0.16
Nodes (18): CY_DISTRICT_BASELINES, CY_PARTY_LINEAGE, CY_RAW_DISTRICTS, CY_ROW_COUNTS, CY_SCENARIO_LABELS, CY_SCENARIO_TURNOUT, CY_SCENARIOS, CY_TURNOUT_IS_ESTIMATE (+10 more)

### Community 11 - "Map.jsx"
Cohesion: 0.15
Nodes (16): GR_MUNI_DATA, GR_MUNI_PARTY_IDS, grMatchDistricts(), grNormStr(), IconEyeOff(), IconZoomReset(), fmtLean(), fmtMinMax() (+8 more)

### Community 12 - "CyprusThemePicker.jsx"
Cohesion: 0.14
Nodes (18): CY_PARTY_DICT, IconCheck, CyprusThemePicker(), paletteColors(), PREVIEW_IDS, applyPartyPalette(), BLUEYELLOW, CONTRAST_VARS (+10 more)

### Community 13 - "greece-utils.js"
Cohesion: 0.11
Nodes (19): GR_CENTROID_OFFSETS, GR_PREFECTURE_MAP, grBuildScenario(), detectColumns(), finalisePolls(), GR_HEMI_POSITIONS, GR_ROW_COUNTS, GR_ROW_RADII (+11 more)

### Community 14 - "GreeceCorrelations.jsx"
Cohesion: 0.08
Nodes (23): ANALYSIS_MODULES, BLOC_OPTIONS, DEMO_FIELDS, GreeceCorrelations(), PARTY_OPTIONS, sectionTitleStyle, selectStyle, IconArrowLeft() (+15 more)

### Community 15 - "cyprus-components.jsx"
Cohesion: 0.15
Nodes (13): CyCoalitionBuilder, CyControlPanel, CyPartyControlItem, CY, CY_HEMI_POSITIONS, CY_ROW_RADII, cyFmtVotesShort(), CyHemicycle (+5 more)

### Community 16 - "ThemePicker.jsx"
Cohesion: 0.14
Nodes (18): GR_PARTY_DICT, IconCheck(), applyPartyPalette(), BLUEYELLOW, CONTRAST_VARS, DARK_VARS, GR_MONO_PATTERNS, LIGHT_VARS (+10 more)

### Community 17 - "aus-engine.js"
Cohesion: 0.13
Nodes (15): ausComputeNational2PP(), ausMarginalSeats(), ausProjectSeats(), ausSeatCounts(), ausStateBreakdown(), buildMatrix(), CALIBRATION, computeLocalPrimaries() (+7 more)

### Community 18 - "S"
Cohesion: 0.13
Nodes (13): GR_2015_SEAT_DIFF, DEFAULT_HIDDEN_PARTIES, POLL_PARTIES_MAPPING, GlobalStyles, MeanderBar, S, Slider, T() (+5 more)

### Community 19 - "greece-stats-export.js"
Cohesion: 0.25
Nodes (14): ExportPreview(), sectionTitleStyle, BLOCS, CAVEATS, buildExportSheets(), downloadBlob(), exportCSV(), exportDoc() (+6 more)

### Community 20 - "ControlPanel.jsx"
Cohesion: 0.18
Nodes (10): ControlPanel(), GR_DEM_CONTROLS, GR_IDEOLOGY_LABELS, GR_SCENARIO_LABELS, IconChevron(), IconColumns(), IconGear(), IconPeople() (+2 more)

### Community 21 - "aus-map.jsx"
Cohesion: 0.15
Nodes (12): AusDemographicsPanel, Bar, SectionHead, StatPill, ausFmt2PP(), ausPartyColor(), ausPartyLabel(), AusMap (+4 more)

### Community 22 - "Electoral Swingometer"
Cohesion: 0.14
Nodes (12): Deployment, Electoral Swingometer, Getting started, Live simulators, Project structure, Tech stack, 1. Setup the File, 2. Finding & Prepping the Map (+4 more)

### Community 23 - "MonteCarloPanel.jsx"
Cohesion: 0.27
Nodes (13): fmtAboutXIn10(), fmtChanceOfReaching(), fmtLeaderFirst(), fmtMajorityLine(), fmtMcMethodologyFooter(), fmtMedianSeatsCombined(), fmtOutrightMajority(), fmtRunsLabel() (+5 more)

### Community 24 - "AustraliaApp.jsx"
Cohesion: 0.19
Nodes (10): AustraliaApp(), AusUrbanInsets, defaultPrefFlows(), DemographicsModal, InsetPanel, TABS, cleanSVG(), ELECTORATE_ALIASES (+2 more)

### Community 25 - "CyprusMonteCarloPanel.jsx"
Cohesion: 0.26
Nodes (8): cyCoalitionProbability(), cyNationalSeats(), cyRunMonteCarlo(), percentile(), randn(), studentT(), IconChevron, CyMonteCarloPanel

### Community 26 - "aus-data.js"
Cohesion: 0.18
Nodes (5): AUS, AUS_PARTIES, AUS_SCENARIOS, ausFromLogit(), ausToLogit()

### Community 27 - "aus-demographics-adapter.js"
Cohesion: 0.28
Nodes (7): AUS_DIVISIONS, AUS_DIVISION_DEMOGRAPHICS, clamp(), STATE_PROFILE, synthesise(), AUS_DEMOGRAPHICS, grDistrictElectorate()

### Community 28 - "usePolls.js"
Cohesion: 0.25
Nodes (4): GreeceApp(), fmtNoPartiesThreshold(), PARTY_HEADER_PATTERNS, usePolls()

### Community 30 - "greece-geo-2015.js"
Cohesion: 0.50
Nodes (4): concatAsMultiPolygon(), GR_2015_GEO_MERGES, grScenarioGeoJson(), mergeFeatures()

### Community 41 - "greece-engine-pre2019.js"
Cohesion: 0.33
Nodes (6): GR_DISTRICT_ELECTORATE, GR_LEGACY, grIsPre2019Scenario(), grLegacyAllocateAllDistrictSeats(), grLegacyAllocateStateSeats(), grLegacyRunElection()

## Knowledge Gaps
- **157 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+152 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `grDistrictElectorate()` connect `aus-demographics-adapter.js` to `greece-data.js`, `GreeceApp.jsx`?**
  _High betweenness centrality (0.192) - this node is a cross-community bridge._
- **Why does `PrivacyModal()` connect `App.jsx` to `GreeceRegionsApp.jsx`, `CyprusApp.jsx`, `GreeceApp.jsx`?**
  _High betweenness centrality (0.182) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _157 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `greece-stats.js` be split into smaller, more focused modules?**
  _Cohesion score 0.056669339748730285 - nodes in this community are weakly interconnected._
- **Should `GreeceRegionsApp.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05141242937853107 - nodes in this community are weakly interconnected._
- **Should `greece-data.js` be split into smaller, more focused modules?**
  _Cohesion score 0.08846153846153847 - nodes in this community are weakly interconnected._
- **Should `GreeceExport.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06448202959830866 - nodes in this community are weakly interconnected._