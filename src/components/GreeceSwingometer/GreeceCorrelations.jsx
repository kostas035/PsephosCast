import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GlobalStyles, S, MeanderBar } from "./GreeceStyles";
import {
  IconArrowLeft, IconElder, IconGraduation, IconBriefcase, IconGlobe,
  IconCityscape, IconPeople, IconBallot, IconIsland, IconOffice,
  IconMicroscope, IconGear, IconRocket, IconClipboard, IconDocument,
  IconBarChart, IconDatabase
} from "./GreeceIcons";
import { resolveTheme } from "./GreeceThemes.js";

import { buildAnalysisFrame, BLOCS } from "./greece-analysis-data.js";
import { pearson, spearman, kendallTau, describe, shapiroWilk, multipleOLS, tTest, mannWhitneyU, anova, tukeyHSD, kruskalWallis, olsFit, corrPValue, fisherCI, ksLilliefors, outliers, buildReadout } from "./greece-stats.js";
import { exportCSV, exportDoc, exportXLSX, exportPDF } from "./greece-stats-export.js";

import DescriptivesPanel from "./correlations/DescriptivesPanel.jsx";
import BivariatePanel from "./correlations/BivariatePanel.jsx";
import GroupPanel from "./correlations/GroupPanel.jsx";
import RegressionPanel from "./correlations/RegressionPanel.jsx";
import SwingPanel from "./correlations/SwingPanel.jsx";
import ExportPreview from "./correlations/ExportPreview.jsx";

//  One unified accent. The page used to mix blue (sections), green (covariates)
//  and purple (methods) all at once, which is what made it read as noisy. Every
//  interactive accent now resolves to the app's signature blue.
const ACCENT       = "#3B82F6";
const ACCENT_DEEP  = "#2563EB";
const ACCENT_LIGHT = "#60A5FA";
const ACCENT_TINT  = "rgba(59, 130, 246, 0.15)";
const ACCENT_SOFT  = "rgba(59, 130, 246, 0.08)";

// Shared chip styling for every selectable token (blocs, parties, covariates).
const chipStyle = (selected, { icon = false } = {}) => ({
  display: icon ? "flex" : "inline-flex",
  alignItems: "center",
  gap: icon ? 6 : 0,
  padding: icon ? "6px 11px" : "6px 11px",
  borderRadius: 6,
  border: `1px solid ${selected ? ACCENT : "var(--border)"}`,
  background: selected ? ACCENT_TINT : "var(--btn-bg)",
  color: selected ? ACCENT_LIGHT : "var(--text-muted)",
  fontSize: 11.5,
  fontWeight: 600,
  fontFamily: "var(--ff-body)",
  whiteSpace: "nowrap",
  cursor: "pointer",
  transition: "all 0.15s ease"
});

const DEMO_FIELDS = [
  { field: "age_over_65_pct", label: "Age 65+", Icon: IconElder },
  { field: "tertiary_edu_pct", label: "Tertiary Education", Icon: IconGraduation },
  { field: "unemployment_rate", label: "Unemployment", Icon: IconBriefcase },
  { field: "foreign_citizens_pct", label: "Foreign Citizens", Icon: IconGlobe },
  { field: "urbanization_pct", label: "Urbanisation (%)", Icon: IconCityscape },
  { field: "population_size", label: "Total Population (2021)", Icon: IconPeople },
  { field: "turnout_pct", label: "Turnout Rate (%)", Icon: IconBallot },
  { field: "is_island", label: "Is Island (1/0)", Icon: IconIsland },
  { field: "is_urban", label: "Is Urban Center (1/0)", Icon: IconOffice }
];

const BLOC_OPTIONS = ["Radical & Broad Left", "Social Democracy & Center", "Conservative & Center-Right", "Radical Right & Nationalist"];

const PARTY_OPTIONS = [
  "ND", "SYRIZA", "PASOK", "KKE", "EL", "NA", "NIKI", "PE", "MeRA25",
  "Spartans", "FL", "ELAS", "ELPIDA", "DPK", "GD",
  // 2015 (both) / 2012 (both) era parties — not standing in later scenarios.
  "POTAMI", "ANEL", "EK", "LAE", "KIDISO", "TELEIA",
  "DIMAR", "LAOS", "OP", "DXANA", "DISY", "DRASI", "ANTARSYA"
];

// Real, completed elections (as opposed to "2026", a live polling projection —
// that one only ever makes sense as a Comparison Target, never a Baseline).
const BASELINE_OPTIONS = [
  { key: "2023", label: "Real 2023 June Shares" },
  { key: "2019", label: "Real 2019 July Shares" },
  { key: "2015", label: "Real 2015 September Shares" },
  { key: "2015jan", label: "Real 2015 January Shares" },
  { key: "2012", label: "Real 2012 June Shares" },
  { key: "2012may", label: "Real 2012 May Shares" },
];

const ANALYSIS_MODULES = [
  { id: "descriptives", label: "Descriptives & Normality", desc: "Mean, Min/Max, IQR, CV%, 95% CIs, Skew, Kurtosis, Shapiro-Wilk" },
  { id: "bivariate", label: "Bivariate Association", desc: "Pearson r, Spearman ρ rank, Kendall τ cross-checks" },
  { id: "group", label: "Group Comparisons", desc: "ANOVA, Kruskal-Wallis, t-Test & MW U across regions/economies/splits" },
  { id: "regression", label: "OLS Linear Regression Models", desc: "Multivariable coefficients, Adjusted R², VIF Multicollinearity, Durbin-Watson" },
  { id: "swing", label: "Swing & Temporal Analysis", desc: "Absolute swing correlations, biggest movers, demographic shifts" }
];

const selectStyle = {
  background: "var(--bg-base)", color: "var(--text-main)", border: "1px solid var(--border)",
  borderRadius: 6, padding: "8px 12px", fontSize: 12, fontFamily: "var(--ff-body)",
  fontWeight: 600, cursor: "pointer", outline: "none", width: "100%", transition: "all 0.15s ease"
};

const sectionTitleStyle = { ...S.label, display: "block", color: ACCENT, fontWeight: 700, letterSpacing: 1.5, marginBottom: 12 };

export default function GreeceCorrelations({ isMobile, theme }) {
  const navigate = useNavigate();
  const themeDef = resolveTheme(theme);

  const [units, setUnits] = useState(["district"]);
  const [baselineKey, setBaselineKey] = useState("2023");
  const [scenarioKey, setScenarioKey] = useState("none");
  const [selectedSubjects, setSelectedSubjects] = useState(["ND"]);
  const [selectedVars, setSelectedVars] = useState(["age_over_65_pct"]);
  const [activeModules, setActiveModules] = useState(["bivariate", "group", "swing"]);
  
  const [vizOptions, setVizOptions] = useState({ scatter: true, distributions: false, heatmap: true, residuals: false });
  
  const [isComputing, setIsComputing] = useState(false);
  const [reportData, setReportData] = useState(null);

  const toggleArray = (arr, setArr, val, requireOne = false) => {
    setArr(prev => {
      if (prev.includes(val)) return requireOne && prev.length === 1 ? prev : prev.filter(x => x !== val);
      return [...prev, val];
    });
  };

  const toggleViz = (key) => setVizOptions(prev => ({ ...prev, [key]: !prev[key] }));

  const runEngine = () => {
    setIsComputing(true);
    setTimeout(() => {
      try {
        const unitToRun = units[0]; 
        
        let liveParties = null;
        let liveSliders = null;
        
        if (scenarioKey === "custom") {
          const savedParties = typeof window !== 'undefined' ? sessionStorage.getItem('gr_state_parties') : null;
          const savedSliders = typeof window !== 'undefined' ? sessionStorage.getItem('gr_state_demSliders') : null;
          if (savedParties) liveParties = JSON.parse(savedParties);
          if (savedSliders) liveSliders = JSON.parse(savedSliders);
        }

        const frame = buildAnalysisFrame(unitToRun, baselineKey, scenarioKey, liveParties, liveSliders);
        
        const yCols = selectedSubjects.map(sub => BLOC_OPTIONS.includes(sub) ? `base_${sub}` : `base_${sub.toLowerCase()}`);
        const xCols = selectedVars;

        let results = { frame, meta: { unit: unitToRun, baselineKey, scenarioKey, subjects: selectedSubjects, vars: selectedVars } };

        if (activeModules.includes("descriptives")) {
          const desc = {};
          [...xCols, ...yCols].forEach(col => {
            const vals = frame.map(d => d[col]).filter(v => typeof v === "number" && isFinite(v));
            // Binary/dummy variables skip the normality tests below
            const isBinary = new Set(vals).size <= 2;
            desc[col] = { 
              ...describe(vals), 
              shapiro: isBinary ? null : shapiroWilk(vals), 
              ks: isBinary ? null : ksLilliefors(vals),
              outlierList: isBinary ? [] : outliers(frame.map(d => d[col]), frame.map(d => d.name), "iqr"),
              raw: vals,
              isBinary // Pass the flag to the UI
            };
          });
          results.descriptives = desc;
        }

        if (activeModules.includes("bivariate")) {
          const matrix = [];
          const pairs = [];
          yCols.forEach(y => {
            const row = [];
            xCols.forEach(x => {
              const xRaw = frame.map(d => d[x]);
              const yRaw = frame.map(d => d[y]);
              
              const pe = pearson(xRaw, yRaw);
              const sp = spearman(xRaw, yRaw);
              const kt = kendallTau(xRaw, yRaw);
              
              row.push(pe.r);
              
              pairs.push({
                y, x,
                pearson: pe, spearman: sp, kendall: kt,
                pearsonP: corrPValue(pe.r, pe.n),
                ci: fisherCI(pe.r, pe.n),
                spearmanP: corrPValue(sp.rho, sp.n),
                ols: olsFit(xRaw, yRaw) 
              });
            });
            matrix.push(row);
          });
          results.bivariate = { matrix, pairs };
        }

        if (activeModules.includes("group")) {
          const grp = {};
          
          const bucketAndTest = (field, yField) => {
            const groups = {};
            frame.forEach(row => {
              const val = row[yField];
              const cat = row[field];
              if (typeof val === 'number' && isFinite(val) && cat) {
                if (!groups[cat]) groups[cat] = [];
                groups[cat].push(val);
              }
            });
            const validGroups = Object.keys(groups).filter(k => groups[k].length >= 2);
            if (validGroups.length < 2) return null;
            const groupArrays = validGroups.map(k => groups[k]);
            const aov = anova(groupArrays);
            const kw = kruskalWallis(groupArrays);
            const tukey = tukeyHSD(groupArrays, aov, validGroups);
            return { anova: aov, kw, tukey, labels: validGroups };
          };

          yCols.forEach(y => {
            grp[y] = {
              island: {
                t: tTest(frame.filter(d => d.is_island === 1).map(d => d[y]), frame.filter(d => d.is_island === 0).map(d => d[y])),
                u: mannWhitneyU(frame.filter(d => d.is_island === 1).map(d => d[y]), frame.filter(d => d.is_island === 0).map(d => d[y]))
              },
              urban: {
                t: tTest(frame.filter(d => d.is_urban === 1).map(d => d[y]), frame.filter(d => d.is_urban === 0).map(d => d[y])),
                u: mannWhitneyU(frame.filter(d => d.is_urban === 1).map(d => d[y]), frame.filter(d => d.is_urban === 0).map(d => d[y]))
              },
              byRegion: bucketAndTest('region', y)
            };
            if (unitToRun === 'district') {
              grp[y].byEconomy = bucketAndTest('primary_economy', y);
            }
          });
          results.group = grp;
        }

        if (activeModules.includes("regression") && xCols.length > 0) {
          const regs = {};
          yCols.forEach(y => {
            const yVec = frame.map(d => d[y]);
            const xMat = frame.map(d => xCols.map(x => d[x]));
            regs[y] = multipleOLS(yVec, xMat);
          });
          results.regression = regs;
        }

        if (activeModules.includes("swing")) {
          if (scenarioKey === "none") {
            results.swing = { disabled: true };
          } else {
            const swg = {};
            selectedSubjects.forEach(sub => {
              const key = BLOC_OPTIONS.includes(sub) ? sub : sub.toLowerCase();
              const swingCol = `swing_abs_${key}`;
              
              const validRows = frame.filter(r => typeof r[swingCol] === 'number' && isFinite(r[swingCol]));
              const sorted = [...validRows].sort((a, b) => b[swingCol] - a[swingCol]);
              
              const gains = sorted.filter(r => r[swingCol] > 0);
              const losses = sorted.filter(r => r[swingCol] < 0);
              
              const topGains = gains.slice(0, 5);
              const topLosses = losses.slice(-5).reverse();

              const correlations = [];
              xCols.forEach(x => {
                const xRaw = frame.map(d => d[x]);
                const yRaw = frame.map(d => d[swingCol]);
                
                const pe = pearson(xRaw, yRaw);
                const sp = spearman(xRaw, yRaw);
                const peP = corrPValue(pe.r, pe.n);
                const ols = olsFit(xRaw, yRaw);
                
                const readout = buildReadout(
                  { n: pe.n, r: pe.r, rP: peP, rho: sp.rho, ols },
                  { partyName: sub + " Swing", demoLabel: x.replace("base_", ""), unitLabel: unitToRun === "region" ? "regions" : "districts", baselineLabel: baselineKey }
                );
                
                correlations.push({ x, pe, peP, readout, swingCol });
              });
              swg[sub] = { topGains, topLosses, correlations, swingCol };
            });
            results.swing = swg;
          }
        }

        setReportData(results);
      } catch (err) {
        console.error("Engine Computation Error:", err);
      }
      setIsComputing(false);
    }, 150);
  };

  return (
    <div style={{ ...themeDef.vars, boxSizing: "border-box", padding: isMobile ? "12px" : "20px 32px", width: "100%", minHeight: "100vh", backgroundColor: "var(--bg-base)", color: "var(--text-main)" }}>
      <GlobalStyles />
      <div id="report-header" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="icon-btn hide-on-print" onClick={() => navigate("/greece")} style={{ ...S.ghostBtn, padding: "8px 12px" }}>
              <IconArrowLeft size={12} /> Return to Swingometer
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ display: "flex", alignItems: "center", color: "var(--text-title)" }}><IconMicroscope size={26} /></span>
              <div>
                <div style={{ fontSize: isMobile ? 18 : 24, fontWeight: 900, fontFamily: "var(--ff-head)", letterSpacing: 2, color: "var(--text-title)", lineHeight: 1 }}>DETAILED ANALYSIS ENGINE</div>
                <div style={{ fontSize: 9, color: "var(--text-dim)", fontFamily: "var(--ff-body)", letterSpacing: 3, marginTop: 4, textTransform: "uppercase" }}>Deterministic Econometrics &amp; Report Generator</div>
              </div>
            </div>
          </div>
        </div>
        <MeanderBar />
      </div>

      <div className="hide-on-print" style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "3fr 2fr", gap: 20, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ ...S.card, background: "var(--bg-mid)", padding: 18 }}>
            <span style={sectionTitleStyle}>1. Data Frame Environment</span>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 16, marginTop: 8 }}>
              <div>
                <label style={{ ...S.label, display: "block", marginBottom: 6 }}>Unit Layer</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["district", "region"].map(u => (
                    <button key={u} onClick={() => toggleArray(units, setUnits, u, true)}
                      style={{ flex: 1, padding: "8px 0", borderRadius: 6, border: `1px solid ${units.includes(u) ? ACCENT : "var(--border)"}`, background: units.includes(u) ? ACCENT_TINT : "var(--btn-bg)", color: units.includes(u) ? ACCENT_LIGHT : "var(--text-muted)", fontWeight: 700, fontSize: 11, cursor: "pointer", textTransform: "uppercase", transition: "all 0.15s ease" }}>
                      {u === "district" ? "Districts" : "Regions"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ ...S.label, display: "block", marginBottom: 6 }}>Baseline Source</label>
                <select style={selectStyle} value={baselineKey} onChange={e => setBaselineKey(e.target.value)}>
                  {BASELINE_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ ...S.label, display: "block", marginBottom: 6 }}>Comparison Target</label>
                <select style={selectStyle} value={scenarioKey} onChange={e => setScenarioKey(e.target.value)}>
                  <option value="none">Static Analysis (Baseline)</option>
                  <option value="2026">May 2026 Polling</option>
                  {BASELINE_OPTIONS.filter(o => o.key !== baselineKey).map(o => <option key={o.key} value={o.key}>{o.label} (swing)</option>)}
                  <option value="custom">Active Swingometer Configuration</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ ...S.card, background: "var(--bg-mid)", padding: 18 }}>
            <span style={sectionTitleStyle}>2. Target Vectors &amp; Covariates</span>
            <div style={{ marginBottom: 16 }}>
              <label style={{ ...S.label, display: "block", marginBottom: 8 }}>Dependent Subjects</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                {BLOC_OPTIONS.map(b => (
                  <button key={b} onClick={() => toggleArray(selectedSubjects, setSelectedSubjects, b)}
                    style={chipStyle(selectedSubjects.includes(b))}>{b}</button>
                ))}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {PARTY_OPTIONS.map(p => (
                  <button key={p} onClick={() => toggleArray(selectedSubjects, setSelectedSubjects, p)}
                    style={chipStyle(selectedSubjects.includes(p))}>{p}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ ...S.label, display: "block", marginBottom: 8 }}>Independent Variables</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {DEMO_FIELDS.map(d => (
                  <button key={d.field} onClick={() => toggleArray(selectedVars, setSelectedVars, d.field)}
                    style={chipStyle(selectedVars.includes(d.field), { icon: true })}>
                    <d.Icon size={14} />{d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ ...S.card, background: "var(--bg-mid)", padding: 18 }}>
            <span style={sectionTitleStyle}>3. Execution Engine Suite</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8, marginBottom: 16 }}>
              {ANALYSIS_MODULES.map(mod => (
                <div key={mod.id} style={{ padding: "11px 13px", borderRadius: 6, border: `1px solid ${activeModules.includes(mod.id) ? ACCENT : "var(--border)"}`, background: activeModules.includes(mod.id) ? ACCENT_SOFT : "var(--bg-base)", display: "flex", flexDirection: "column", gap: 10, transition: "all 0.15s ease" }}>
                  <div onClick={() => toggleArray(activeModules, setActiveModules, mod.id)} style={{ display: 'flex', gap: 11, cursor: 'pointer' }}>
                    <div style={{ marginTop: 1, width: 15, height: 15, borderRadius: 3, border: `2px solid ${activeModules.includes(mod.id) ? ACCENT : "var(--text-dim)"}`, background: activeModules.includes(mod.id) ? ACCENT : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {activeModules.includes(mod.id) && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                    </div>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: activeModules.includes(mod.id) ? ACCENT_LIGHT : "var(--text-main)", fontFamily: "var(--ff-body)", lineHeight: 1.2 }}>{mod.label}</div>
                      <div style={{ fontSize: 10, color: "var(--text-dim)", fontFamily: "var(--ff-body)", marginTop: 3, lineHeight: 1.4 }}>{mod.desc}</div>
                    </div>
                  </div>
                  
                  {activeModules.includes(mod.id) && (
                    <div style={{ marginLeft: 26, display: "flex", flexDirection: "column", gap: 6, borderLeft: `2px solid ${ACCENT}33`, paddingLeft: 10 }}>
                       {mod.id === 'descriptives' && (
                          <label style={{ fontSize: 11, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                             <input type="checkbox" checked={vizOptions.distributions} onChange={() => toggleViz('distributions')} />
                             distributions (Histograms + Q–Q + Box plots per variable)
                          </label>
                       )}
                       {mod.id === 'bivariate' && (
                          <>
                          <label style={{ fontSize: 11, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                             <input type="checkbox" checked={vizOptions.heatmap} onChange={() => toggleViz('heatmap')} />
                             Correlation heatmap
                          </label>
                          <label style={{ fontSize: 11, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                             <input type="checkbox" checked={vizOptions.scatter} onChange={() => toggleViz('scatter')} />
                             Labelled scatter per pair
                          </label>
                          </>
                       )}
                       {mod.id === 'regression' && (
                          <label style={{ fontSize: 11, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                             <input type="checkbox" checked={vizOptions.residuals} onChange={() => toggleViz('residuals')} />
                             Residual-vs-fitted + Q–Q of residuals
                          </label>
                       )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button onClick={runEngine} disabled={isComputing} style={{ width: "100%", background: isComputing ? "var(--btn-bg)" : ACCENT_DEEP, color: isComputing ? "var(--text-muted)" : "#fff", border: "none", padding: "12px", borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: isComputing ? "not-allowed" : "pointer", boxShadow: isComputing ? "none" : "0 4px 12px rgba(37,99,235,0.25)", transition: "all 0.15s ease" }}>
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {isComputing ? <><IconGear size={15} /> Processing...</> : <><IconRocket size={15} /> Run Analytics &amp; Generate Matrix</>}
              </span>
            </button>
          </div>

          <div style={{ ...S.card, background: "var(--bg-mid)", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            <span style={S.label}>Document Distribution Output</span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <button className="icon-btn" onClick={() => exportPDF("report-content")} disabled={!reportData} style={{ ...S.ghostBtn, justifyContent: "center", padding: "8px", opacity: !reportData ? 0.5 : 1 }}><IconClipboard size={14} /> PDF Report</button>
              <button className="icon-btn" onClick={() => exportDoc(reportData)} disabled={!reportData} style={{ ...S.ghostBtn, justifyContent: "center", padding: "8px", opacity: !reportData ? 0.5 : 1 }}><IconDocument size={14} /> Word (DOCX)</button>
              <button className="icon-btn" onClick={() => exportXLSX(reportData)} disabled={!reportData} style={{ ...S.ghostBtn, justifyContent: "center", padding: "8px", opacity: !reportData ? 0.5 : 1 }}><IconBarChart size={14} /> Sheets (XLSX)</button>
              <button className="icon-btn" onClick={() => exportCSV(reportData)} disabled={!reportData} style={{ ...S.ghostBtn, justifyContent: "center", padding: "8px", opacity: !reportData ? 0.5 : 1 }}><IconDatabase size={14} /> Flat CSV Matrix</button>
            </div>
          </div>
        </div>
      </div>

      <div id="report-content" style={{ marginTop: 24 }}>
        <div className="print-only-logo" style={{ textAlign: "center", marginBottom: "20px" }}>
          <img src="/correlationslogo.png" style={{ height: "80px" }} alt="PsephosCast.gr Logo" />
        </div>

        {!reportData ? (
          <div className="hide-on-print" style={{ ...S.card, padding: 60, textAlign: "center", color: "var(--text-dim)", fontFamily: "var(--ff-body)", border: "2px dashed var(--border)" }}>
            <div style={{ marginBottom: 8, display: "flex", justifyContent: "center", color: "var(--text-dim)" }}><IconBarChart size={36} /></div>
            <div style={{ fontSize: 14, color: "var(--text-main)", fontWeight: 700, letterSpacing: 0.5 }}>DETERMINISTIC PROCESSING PIPELINE IDLE</div>
            <div style={{ fontSize: 11, marginTop: 4, color: "var(--text-muted)", maxWidth: 450, margin: "4px auto 0" }}>Select parameters and hit Compute.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <DescriptivesPanel data={reportData.descriptives} viz={vizOptions} />
            <BivariatePanel data={reportData.bivariate} meta={reportData.meta} frame={reportData.frame} viz={vizOptions} DEMO_FIELDS={DEMO_FIELDS} />
            <GroupPanel data={reportData.group} />
            <RegressionPanel data={reportData.regression} meta={reportData.meta} frame={reportData.frame} viz={vizOptions} />
            <SwingPanel data={reportData.swing} />
            <ExportPreview reportData={reportData} />
          </div>
        )}

        <div className="print-only-logo footer-logo" style={{ textAlign: "center", marginTop: "40px", paddingTop: "20px", borderTop: "1px solid #e5e7eb", pageBreakInside: "avoid" }}>
          <img src="/correlationslogo.png" style={{ height: "60px" }} alt="PsephosCast.gr Logo" />
          <p style={{ fontSize: "10px", color: "#6b7280", marginTop: "8px" }}>Generated by the Greece Electoral Swingometer</p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .print-only-logo { display: none; }
        
        @media print {
          body { background: white !important; color: black !important; }
          .hide-on-print { display: none !important; }
          .app-wrapper, #root { background: white !important; }
          * { box-shadow: none !important; text-shadow: none !important; }
          #report-content { page-break-before: auto; }
          
          .print-only-logo { display: block !important; }
          .footer-logo { break-inside: avoid; }
        }
      `}} />
    </div>
  );
}
