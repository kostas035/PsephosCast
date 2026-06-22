// ─── aus-demographics-panel.jsx ──────────────────────────────────────────────
// Drop-in demographics panel for AustraliaApp.jsx
// Shows census breakdown for the currently hovered/selected division.
//
// INTEGRATION — 4 steps:
//
// 1. In AustraliaApp.jsx, add state near the other useState hooks:
//      const [selectedDiv, setSelectedDiv] = useState(null);
//
// 2. Pass a callback into AusMap:
//      <AusMap projected={projected} svgContent={MY_SVG_MAP.mainSVG}
//              onDivisionSelect={setSelectedDiv} />
//
// 3. In aus-map.jsx, in the onOver handler, add:
//      if (props.onDivisionSelect) props.onDivisionSelect(byId[id]);
//    and in onOut:
//      // leave selected as-is on mouseout (panel stays until next hover)
//    OR pass both hover setter and click setter — see note below.
//
// 4. Add this to the right column tabs in AustraliaApp.jsx:
//      import { AusDemographicsPanel } from "./aus-demographics-panel.jsx";
//      import { AUS_DIVISION_DEMOGRAPHICS } from "./aus-demographics.js";
//      // Add tab entry: { id: "demographics", label: "Demographics" }
//      // In tab content:
//      {activeTab === "demographics" && (
//        <AusDemographicsPanel
//          divisionId={selectedDiv?.id}
//          allDemographics={AUS_DIVISION_DEMOGRAPHICS}
//        />
//      )}
//
// SIMPLER ALTERNATIVE — no tab needed, just render always in right column:
//      <AusDemographicsPanel
//        divisionId={selectedDiv?.id}
//        allDemographics={AUS_DIVISION_DEMOGRAPHICS}
//        compact={true}
//      />
// ─────────────────────────────────────────────────────────────────────────────

import { memo } from "react";
import { S } from "./aus-ui.jsx";
import { ausPartyColor, ausPartyLabel } from "./aus-engine.js";

// ── Bar component ─────────────────────────────────────────────────────────────
const Bar = memo(function Bar({ label, value, max, color = "var(--text-dim)", suffix = "%" }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div style={{ marginBottom: 5 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
        <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--ff-body)" }}>{label}</span>
        <span style={{ fontSize: 10, fontFamily: "var(--ff-mono)", color: "var(--text-main)" }}>
          {typeof value === "number" ? value.toFixed(1) : value}{suffix}
        </span>
      </div>
      <div style={{ height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`, background: color,
          borderRadius: 2, transition: "width 0.3s ease",
        }}/>
      </div>
    </div>
  );
});

// ── Section header ─────────────────────────────────────────────────────────────
const SectionHead = memo(function SectionHead({ label }) {
  return (
    <div style={{
      fontSize: 8, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700,
      color: "var(--text-dim)", fontFamily: "var(--ff-body)",
      marginTop: 14, marginBottom: 6, paddingBottom: 4,
      borderBottom: "1px solid var(--border)",
    }}>
      {label}
    </div>
  );
});

// ── Stat pill ──────────────────────────────────────────────────────────────────
const StatPill = memo(function StatPill({ label, value }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      background: "var(--bg-mid)", border: "1px solid var(--border)",
      borderRadius: 6, padding: "6px 10px", flex: "1 1 80px",
    }}>
      <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--ff-mono)", color: "var(--text-title)" }}>
        {value}
      </span>
      <span style={{ fontSize: 8, color: "var(--text-dim)", letterSpacing: 1, textTransform: "uppercase", marginTop: 2, textAlign: "center" }}>
        {label}
      </span>
    </div>
  );
});

// ── Main panel ────────────────────────────────────────────────────────────────
export const AusDemographicsPanel = memo(function AusDemographicsPanel({
  divisionId,       // string — matches AUS_DIVISION_DEMOGRAPHICS[].id
  allDemographics,  // AUS_DIVISION_DEMOGRAPHICS array
  compact = false,  // if true, shorter layout for sidebar
}) {
  const demog = divisionId
    ? allDemographics.find(d => d.id === divisionId)
    : null;

  // ── Empty state ──────────────────────────────────────────────────────────
  if (!demog) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", padding: "32px 16px", gap: 8,
        color: "var(--text-dim)", textAlign: "center",
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
          <line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
        </svg>
        <div style={{ fontSize: 11, fontFamily: "var(--ff-body)" }}>
          Hover or click a division on the map
        </div>
        <div style={{ fontSize: 9, color: "var(--text-muted)", fontFamily: "var(--ff-mono)", letterSpacing: 1 }}>
          DEMOGRAPHIC BREAKDOWN APPEARS HERE
        </div>
      </div>
    );
  }

  const { name, state, result25, result22, geo, census } = demog;
  const c = census;

  // Party color for winner badge
  const winColor = ausPartyColor(result25.winner);

  // Format helpers — coerce to number first so strings never crash .toFixed()
  const fmt = (n, dec = 1) => { const v = parseFloat(n); return isNaN(v) ? "—" : v.toFixed(dec); };
  const fmtK = (n) => { const v = parseFloat(n); if (isNaN(v)) return "—"; return v >= 1000 ? `$${(v/1000).toFixed(1)}k` : `$${v}`; };
  const fmtPop = (n) => { const v = parseFloat(n); if (isNaN(v)) return "—"; return v >= 1000000 ? (v/1000000).toFixed(2)+"M" : (v/1000).toFixed(1)+"k"; };

  return (
    <div style={{
      padding: compact ? "10px 12px" : "14px 16px",
      overflowY: "auto",
      maxHeight: compact ? "none" : "calc(92vh - 120px)",
      fontSize: 11,
    }}>

      {/* ── Division header ─────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text-title)", fontFamily: "var(--ff-head)" }}>
            {name}
          </div>
          <div style={{ fontSize: 9, color: "var(--text-dim)", fontFamily: "var(--ff-mono)", letterSpacing: 1.5, marginTop: 2 }}>
            {state} · {geo.category.replace("_", " ").toUpperCase()} · {geo.area_km2.toLocaleString()} km²
          </div>
        </div>
        <div style={{
          background: winColor + "22", border: `1px solid ${winColor}55`,
          color: winColor, borderRadius: 5, padding: "4px 10px",
          fontSize: 11, fontWeight: 700, fontFamily: "var(--ff-mono)", letterSpacing: 1,
        }}>
          {ausPartyLabel(result25.winner)}
        </div>
      </div>

      {/* ── Key stats row ────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        <StatPill label="Population" value={fmtPop(c.population)} />
        <StatPill label="Median Age" value={c.medianAge} />
        <StatPill label="HH Income/wk" value={fmtK(c.medianHhIncome)} />
        <StatPill label="SEIFA Decile" value={geo.seifaDecile + "/10"} />
      </div>

      {/* ── 2025 Election ───────────────────────────────────────────────── */}
      <SectionHead label="2025 Election Results" />
      <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
        {[
          { id: "alp", v: result25.alpPrimary },
          { id: "lnp", v: result25.lnpPrimary },
          { id: "grn", v: result25.grnPrimary },
          { id: "onp", v: result25.onpPrimary },
          { id: "ind", v: result25.indPrimary },
        ].filter(x => x.v > 0).map(({ id, v }) => (
          <div key={id} style={{
            flex: "0 0 auto", display: "flex", flexDirection: "column", alignItems: "center",
            background: ausPartyColor(id) + "18", border: `1px solid ${ausPartyColor(id)}44`,
            borderRadius: 5, padding: "4px 8px",
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: ausPartyColor(id), fontFamily: "var(--ff-mono)" }}>
              {fmt(v)}%
            </span>
            <span style={{ fontSize: 8, color: "var(--text-dim)", letterSpacing: 1 }}>
              {ausPartyLabel(id)}
            </span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 4, fontSize: 10, color: "var(--text-muted)" }}>
        <span>2PP ALP: <span style={{ color: ausPartyColor("alp"), fontWeight: 700 }}>{fmt(result25.alp2PP)}%</span></span>
        {result25.margin != null && (
          <span>Margin: <span style={{ color: "var(--text-main)", fontWeight: 700 }}>{fmt(result25.margin)}pp</span></span>
        )}
        {result25.swing25v22 != null && (
          <span>Swing: <span style={{ color: result25.swing25v22 >= 0 ? ausPartyColor("alp") : ausPartyColor("lnp"), fontWeight: 700 }}>
            {result25.swing25v22 > 0 ? "+" : ""}{fmt(result25.swing25v22)}pp
          </span></span>
        )}
      </div>
      <div style={{ fontSize: 9, color: "var(--text-muted)", marginBottom: 2, fontFamily: "var(--ff-mono)" }}>
        Turnout {fmt(result25.turnout)}% · Informal {fmt(result25.informal)}%
        {result22?.winner && (
          <> · 2022: <span style={{ color: ausPartyColor(result22.winner) }}>{ausPartyLabel(result22.winner)}</span> ({fmt(result22.alp2PP)}% ALP 2PP)</>
        )}
      </div>

      {/* ── Religion ─────────────────────────────────────────────────────── */}
      <SectionHead label="Religion (% population)" />
      <Bar label="No Religion"        value={c.noReligion}    max={70} color="#64748b" />
      <Bar label="Christian (total)"  value={c.christian}     max={70} color="#7C3AED" />
      <Bar label="  Catholic"         value={c.catholic}      max={35} color="#9333ea" />
      <Bar label="  Anglican"         value={c.anglican}      max={25} color="#a855f7" />
      <Bar label="  Other Christian"  value={c.otherChristian}max={35} color="#c084fc" />
      <Bar label="Islam"              value={c.islam}         max={25} color="#0284c7" />
      <Bar label="Buddhist"           value={c.buddhist}      max={15} color="#f59e0b" />
      <Bar label="Hindu"              value={c.hindu}         max={10} color="#f97316" />
      <Bar label="Jewish"             value={c.jewish}        max={8}  color="#d97706" />

      {/* ── Education ────────────────────────────────────────────────────── */}
      <SectionHead label="Education (% persons 15+)" />
      <Bar label="Bachelor or Higher" value={c.bachelorOrHigher} max={70} color="#0ea5e9" />
      <Bar label="Diploma / Cert"     value={c.diplomaCert}     max={35} color="#38bdf8" />
      <Bar label="Year 12"            value={c.year12}          max={45} color="#7dd3fc" />
      <Bar label="No Qualification"   value={c.noQualification} max={55} color="#475569" />

      {/* ── Housing ──────────────────────────────────────────────────────── */}
      <SectionHead label="Housing Tenure (% dwellings)" />
      <Bar label="Owned Outright"  value={c.ownedOutright} max={55} color="#22c55e" />
      <Bar label="Mortgage"        value={c.ownedMortgage} max={55} color="#86efac" />
      <Bar label="Rented"          value={c.rented}        max={70} color="#ef4444" />
      <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap", marginBottom: 2 }}>
        <StatPill label="Median Mortgage/mo" value={fmtK(c.medianMortgage)} />
        <StatPill label="Median Rent/wk"     value={fmtK(c.medianRent)} />
      </div>

      {/* ── Age & Household ──────────────────────────────────────────────── */}
      <SectionHead label="Age Profile (% population)" />
      <Bar label="18–34"  value={c.age18to34} max={50} color="#06b6d4" />
      <Bar label="35–54"  value={c.age35to54} max={40} color="#0891b2" />
      <Bar label="55+"    value={c.age55plus} max={50} color="#164e63" />
      <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap", marginBottom: 2 }}>
        <StatPill label="Family Households" value={fmt(c.familyHousehold)+"%"} />
        <StatPill label="Lone Person"       value={fmt(c.lonePerson)+"%"} />
      </div>

      {/* ── Ancestry & Culture ───────────────────────────────────────────── */}
      <SectionHead label="Ancestry & Cultural Diversity" />
      <Bar label="Born in Australia"    value={c.bornAustralia}     max={100} color="#22c55e" />
      <Bar label="Born Overseas"        value={c.bornOverseas}      max={65}  color="#f97316" />
      <Bar label="Indigenous"           value={c.indigenous}         max={25}  color="#a16207" />
      <Bar label="Non-English at home"  value={c.notSpokenEnglish}  max={65}  color="#7c3aed" />
      {!compact && (
        <>
          <Bar label="English ancestry"   value={c.ancestryEnglish}   max={55} color="#64748b" />
          <Bar label="Chinese ancestry"   value={c.ancestryChinese}   max={25} color="#ef4444" />
          <Bar label="Indian ancestry"    value={c.ancestryIndian}    max={15} color="#f97316" />
          <Bar label="Italian ancestry"   value={c.ancestryItalian}   max={12} color="#22c55e" />
          <Bar label="Greek ancestry"     value={c.ancestryGreek}     max={10} color="#3b82f6" />
          <Bar label="Vietnamese ancestry"value={c.ancestryVietnamese}max={18} color="#ec4899" />
          <Bar label="Arabic ancestry"    value={c.ancestryArabic}    max={20} color="#8b5cf6" />
        </>
      )}

      {/* ── Occupation ───────────────────────────────────────────────────── */}
      {!compact && (
        <>
          <SectionHead label="Occupation (% employed)" />
          <Bar label="Managers"          value={c.managers}          max={30} color="#0ea5e9" />
          <Bar label="Professionals"     value={c.professionals}     max={55} color="#38bdf8" />
          <Bar label="Tech & Trades"     value={c.techTrades}        max={25} color="#f59e0b" />
          <Bar label="Community Service" value={c.communityService}  max={18} color="#22c55e" />
          <Bar label="Clerical & Admin"  value={c.clericalAdmin}     max={18} color="#a78bfa" />
          <Bar label="Labourers"         value={c.labourers}         max={20} color="#ef4444" />
          <Bar label="Machinery Ops"     value={c.machineryOperators}max={15} color="#f97316" />
        </>
      )}

      <div style={{ height: 12 }}/>
    </div>
  );
});

export default AusDemographicsPanel;
