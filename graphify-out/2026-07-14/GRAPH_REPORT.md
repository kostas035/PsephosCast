# Graph Report - swingometer  (2026-07-13)

## Corpus Check
- 85 files · ~371,004 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 705 nodes · 1452 edges · 42 communities (38 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.59)
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
- [[_COMMUNITY_anovaOneWay|anovaOneWay]]
- [[_COMMUNITY_finiteOnly|finiteOnly]]
- [[_COMMUNITY_GreeceStyles.jsx|GreeceStyles.jsx]]
- [[_COMMUNITY_greece-crisis-economics-data.js|greece-crisis-economics-data.js]]
- [[_COMMUNITY_Hemicycle.jsx|Hemicycle.jsx]]

## God Nodes (most connected - your core abstractions)
1. `S` - 20 edges
2. `useGreeceT()` - 18 edges
3. `mean()` - 17 edges
4. `MonteCarloPanel()` - 14 edges
5. `cleanRow()` - 13 edges
6. `PsephosCast — Electoral Swingometer` - 11 edges
7. `S` - 10 edges
8. `GR` - 10 edges
9. `multipleOLS()` - 10 edges
10. `corrTest()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `kde()` --calls--> `quantile()`  [EXTRACTED]
  src/components/GreeceSwingometer/GreecePlots.jsx → src/components/GreeceSwingometer/greece-stats.js
- `GreeceApp()` --calls--> `resolveTheme()`  [EXTRACTED]
  src/components/GreeceSwingometer/GreeceApp.jsx → src/components/GreeceSwingometer/GreeceThemes.js
- `GreeceApp()` --calls--> `useGreeceT()`  [EXTRACTED]
  src/components/GreeceSwingometer/GreeceApp.jsx → src/components/GreeceSwingometer/GreeceTranslations.jsx
- `econHistFields()` --indirect_call--> `IconCalendar()`  [INFERRED]
  src/components/GreeceSwingometer/GreeceCorrelations.jsx → src/components/GreeceSwingometer/GreeceIcons.jsx
- `econHistFields()` --indirect_call--> `IconLineChart()`  [INFERRED]
  src/components/GreeceSwingometer/GreeceCorrelations.jsx → src/components/GreeceSwingometer/GreeceIcons.jsx

## Import Cycles
- None detected.

## Communities (42 total, 4 thin omitted)

### Community 0 - "greece-stats.js"
Cohesion: 0.10
Nodes (52): anova(), averageRanks(), betacf(), betai(), chiSqP(), chiSquareTable(), cleanRow(), corrPValue() (+44 more)

### Community 1 - "GreeceRegionsApp.jsx"
Cohesion: 0.13
Nodes (16): IconCamera, IconChevron, IconColumns, IconEye, IconEyeOff, IconMapPin, IconMinus, IconPeople (+8 more)

### Community 2 - "greece-data.js"
Cohesion: 0.06
Nodes (47): BLOCS, buildAnalysisFrame(), HIST_FIELD_ACCESSORS, ISLANDS, REGIONS, generateDerivedBaseline(), GR_2015_MERGE_GROUPS, GR_2015_SEAT_DIFF (+39 more)

### Community 3 - "GreeceExport.jsx"
Cohesion: 0.07
Nodes (24): BG_OPTIONS, covered(), ctrl, ExportBoard(), ExportGrid(), fmtOf(), fmtPct(), FORMATS (+16 more)

### Community 4 - "dependencies"
Cohesion: 0.06
Nodes (33): dependencies, d3, @fontsource/barlow-condensed, @fontsource/bebas-neue, @fontsource/crimson-pro, @fontsource/ibm-plex-mono, @fontsource-variable/material-symbols-outlined, html2canvas (+25 more)

### Community 5 - "GreeceApp.jsx"
Cohesion: 0.09
Nodes (34): HOWTO, econHistFields(), IconArrowLeft(), IconBallot(), IconBarChart(), IconBriefcase(), IconBuilding(), IconCalendar() (+26 more)

### Community 6 - "GreeceTranslations.jsx"
Cohesion: 0.05
Nodes (62): ControlPanel(), GR_DEM_CONTROLS, GrPartyControlItem(), GrPartyPicker(), GR_BONUS_CONFIG, grFmtVotes(), grFmtVotesShort(), IconChevron() (+54 more)

### Community 7 - "cyprus-ui.jsx"
Cohesion: 0.18
Nodes (16): CyControlPanel, CY_DEM_CONTROLS, CY_IDEOLOGY_LABELS, IconColumns, IconEye, IconEyeOff, IconGear, IconLock (+8 more)

### Community 8 - "App.jsx"
Cohesion: 0.15
Nodes (6): App(), CyprusApp, GreeceApp, GreeceCorrelations, GreeceRegionsApp, ErrorBoundary

### Community 9 - "aus-components.jsx"
Cohesion: 0.16
Nodes (9): DescriptivesPanel(), BoxPlot, Histogram, kde(), QQPlot, SVG, TREND_COLORS_DARK, TREND_COLORS_LIGHT (+1 more)

### Community 10 - "CyprusApp.jsx"
Cohesion: 0.14
Nodes (17): CY_DISTRICT_BASELINES, CY_DISTRICT_DEMOGRAPHICS, CY_PARTY_LINEAGE, CY_PATHS, CY_RAW_DISTRICTS, CY_ROW_COUNTS, CY_SCENARIO_LABELS, CY_SCENARIO_TURNOUT (+9 more)

### Community 11 - "Map.jsx"
Cohesion: 0.10
Nodes (19): GR_PARTY_DICT, grBuildScenario(), DEFAULT_HIDDEN_PARTIES, detectColumns(), finalisePolls(), GR_ROW_COUNTS, grAverageRecentPolls(), grComputeFeatureSeatData() (+11 more)

### Community 12 - "CyprusThemePicker.jsx"
Cohesion: 0.14
Nodes (18): CY_PARTY_DICT, IconCheck, CyprusThemePicker(), paletteColors(), PREVIEW_IDS, applyPartyPalette(), BLUEYELLOW, CONTRAST_VARS (+10 more)

### Community 13 - "greece-utils.js"
Cohesion: 0.09
Nodes (27): GR_DISTRICT_GDP, GR_GDP_YEAR_TYPE, GR_GDP_YEARS, GR_MUNI_DATA, GR_MUNI_PARTY_IDS, GR_DISTRICT_POPULATION_BY_YEAR, GR_POP_YEARS, grMatchDistricts() (+19 more)

### Community 14 - "GreeceCorrelations.jsx"
Cohesion: 0.11
Nodes (17): exportPDF(), ANALYSIS_MODULES, BASELINE_OPTIONS, BLOC_OPTIONS, DEMO_FIELDS, GreeceCorrelations(), PARTY_OPTIONS, sectionTitleStyle (+9 more)

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
Cohesion: 0.30
Nodes (12): ExportPreview(), sectionTitleStyle, CAVEATS, buildExportSheets(), downloadBlob(), exportCSV(), exportDoc(), exportXLSX() (+4 more)

### Community 20 - "ControlPanel.jsx"
Cohesion: 0.23
Nodes (7): BivariatePanel(), RegressionPanel(), buildReadout(), fmtP(), strengthBand(), CorrelationHeatmap, GreeceScatter()

### Community 21 - "aus-map.jsx"
Cohesion: 0.24
Nodes (3): CookiesModal(), PrivacyModal(), WelcomeScreen()

### Community 22 - "Electoral Swingometer"
Cohesion: 0.09
Nodes (21): Author, Cyprus — open-list PR with a district/national split, Data, Deployment, Disclaimer, Greece — reinforced proportional representation, How the electoral models work, Live routes (+13 more)

### Community 23 - "MonteCarloPanel.jsx"
Cohesion: 0.22
Nodes (4): IDEOLOGIES, EMTH_DETAILS_2023, REGIONS_DB, THESSALY_DETAILS_2023

### Community 24 - "AustraliaApp.jsx"
Cohesion: 0.32
Nodes (6): movementNote(), sectionTitleStyle, TrendBlock(), TrendPanel(), fmtR(), TrendLineChart

### Community 25 - "CyprusMonteCarloPanel.jsx"
Cohesion: 0.26
Nodes (8): cyCoalitionProbability(), cyNationalSeats(), cyRunMonteCarlo(), percentile(), randn(), studentT(), IconChevron, CyMonteCarloPanel

### Community 26 - "aus-data.js"
Cohesion: 0.36
Nodes (7): GR, grCoalitionProbability(), grRunMonteCarlo(), percentile(), randn(), studentT(), GridComposer()

### Community 27 - "aus-demographics-adapter.js"
Cohesion: 0.29
Nodes (6): CRETE_DETAILS_2014, CRETE_DETAILS_2019, CRETE_DETAILS_2023, CRETE_DISTRICT_2014, CRETE_DISTRICT_2019, CRETE_MUNICIPALITY_DISTRICTS

### Community 28 - "usePolls.js"
Cohesion: 0.25
Nodes (4): GreeceApp(), fmtNoPartiesThreshold(), PARTY_HEADER_PATTERNS, usePolls()

### Community 29 - "MonteCarloPanel.jsx"
Cohesion: 0.33
Nodes (6): GR_DISTRICT_ELECTORATE, GR_LEGACY, grIsPre2019Scenario(), grLegacyAllocateAllDistrictSeats(), grLegacyAllocateStateSeats(), grLegacyRunElection()

### Community 30 - "ResultsTable.jsx"
Cohesion: 0.33
Nodes (5): PartyRow, SemiCircleChart(), IconGear, IconLock, IconTrash

### Community 34 - "PrefFlows"
Cohesion: 0.50
Nodes (4): concatAsMultiPolygon(), GR_2015_GEO_MERGES, grScenarioGeoJson(), mergeFeatures()

### Community 41 - "GreeceStyles.jsx"
Cohesion: 0.29
Nodes (4): GroupPanel(), sectionTitleStyle, SwingPanel(), S

### Community 43 - "greece-crisis-economics-data.js"
Cohesion: 0.20
Nodes (7): gdpAcc, GR_GDP_PER_CAPITA_BY_REGION, GR_LONGTERM_UNEMPLOYMENT_BY_REGION, GR_YOUTH_UNEMPLOYMENT_BY_REGION, ltuAcc, YEARS, youthAcc

### Community 44 - "Hemicycle.jsx"
Cohesion: 0.40
Nodes (4): GR_HEMI_POSITIONS, GR_ROW_RADII, fmtMajorityCoalition(), GrCoalitionBuilder

## Knowledge Gaps
- **162 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+157 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `CookiesModal()` connect `aus-map.jsx` to `aus-engine.js`, `CyprusApp.jsx`, `GreeceApp.jsx`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._
- **Why does `PrivacyModal()` connect `aus-map.jsx` to `aus-engine.js`, `CyprusApp.jsx`, `GreeceApp.jsx`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._
- **Why does `S` connect `GreeceStyles.jsx` to `greece-data.js`, `GreeceExport.jsx`, `GreeceApp.jsx`, `GreeceTranslations.jsx`, `aus-components.jsx`, `Map.jsx`, `Hemicycle.jsx`, `greece-utils.js`, `GreeceCorrelations.jsx`, `ThemePicker.jsx`, `greece-stats-export.js`, `ControlPanel.jsx`, `AustraliaApp.jsx`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _162 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `greece-stats.js` be split into smaller, more focused modules?**
  _Cohesion score 0.10303030303030303 - nodes in this community are weakly interconnected._
- **Should `GreeceRegionsApp.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13071895424836602 - nodes in this community are weakly interconnected._
- **Should `greece-data.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05952380952380952 - nodes in this community are weakly interconnected._