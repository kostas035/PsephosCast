// aus-demographics-adapter.js
// Produces AUS_DIVISION_DEMOGRAPHICS for all 150 AUS_DIVISIONS.
// Uses real data from aus-demographics.js where available (27 divisions),
// and synthesises plausible census estimates for the remaining 123 from
// the division's ALP 2PP, state, and type fields.

import { AUS_DEMOGRAPHICS } from "./aus-demographics.js";
import { AUS_DIVISIONS } from "./aus-data.js";

// State baseline profiles for synthesis
const STATE_PROFILE = {
  NSW: { uniBase: 32, vocBase: 22, ownBase: 62, rentBase: 28, rentAmt: 440, incomeBase: 88000, bornOSBase: 22, engOnlyBase: 68, indigBase: 1.2 },
  VIC: { uniBase: 34, vocBase: 20, ownBase: 60, rentBase: 30, rentAmt: 420, incomeBase: 86000, bornOSBase: 24, engOnlyBase: 66, indigBase: 0.9 },
  QLD: { uniBase: 26, vocBase: 26, ownBase: 64, rentBase: 26, rentAmt: 400, incomeBase: 82000, bornOSBase: 16, engOnlyBase: 76, indigBase: 2.1 },
  WA:  { uniBase: 28, vocBase: 26, ownBase: 66, rentBase: 26, rentAmt: 420, incomeBase: 96000, bornOSBase: 20, engOnlyBase: 74, indigBase: 1.8 },
  SA:  { uniBase: 30, vocBase: 24, ownBase: 66, rentBase: 26, rentAmt: 360, incomeBase: 80000, bornOSBase: 18, engOnlyBase: 76, indigBase: 1.1 },
  TAS: { uniBase: 22, vocBase: 30, ownBase: 60, rentBase: 28, rentAmt: 300, incomeBase: 68000, bornOSBase: 10, engOnlyBase: 90, indigBase: 5.2 },
  ACT: { uniBase: 58, vocBase: 12, ownBase: 58, rentBase: 34, rentAmt: 510, incomeBase: 120000, bornOSBase: 28, engOnlyBase: 67, indigBase: 1.5 },
  NT:  { uniBase: 22, vocBase: 25, ownBase: 38, rentBase: 44, rentAmt: 390, incomeBase: 72000, bornOSBase: 22, engOnlyBase: 52, indigBase: 28.0 },
};

// Clamp helper
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// Synthesise a full demographics record from division metadata
function synthesise(div) {
  const sp  = STATE_PROFILE[div.state] || STATE_PROFILE.NSW;
  const a2  = div.alp2PP; // ALP 2PP at 2022 baseline

  // Higher ALP 2PP → more working class, renters, lower income
  // Lower ALP 2PP  → more professionals, owners, higher income
  const leftness = clamp((a2 - 35) / 40, 0, 1); // 0 = safe LNP, 1 = safe ALP

  const uni       = clamp(Math.round(sp.uniBase + (1 - leftness) * 18 - leftness * 6), 8, 72);
  const voc       = clamp(Math.round(sp.vocBase + leftness * 8 - (1 - leftness) * 4),  8, 42);
  const yr12      = clamp(Math.round(14 + leftness * 4), 8, 26);
  const noQual    = clamp(100 - uni - voc - yr12, 5, 55);
  const prof      = clamp(Math.round(uni * 0.85), 12, 68);
  const trade     = clamp(Math.round(sp.vocBase * 0.7 + leftness * 6), 6, 34);
  const unemp     = clamp(parseFloat((2.2 + leftness * 6).toFixed(1)), 1.5, 12);
  const own       = clamp(Math.round(sp.ownBase - leftness * 14), 22, 80);
  const rent      = clamp(Math.round(sp.rentBase + leftness * 18), 14, 66);
  const rentAmt   = Math.round(sp.rentAmt + (1 - leftness) * 180 - leftness * 80);
  const income    = Math.round(sp.incomeBase + (1 - leftness) * 32000 - leftness * 18000);
  const bornOS    = clamp(Math.round(sp.bornOSBase + (1 - leftness) * 8 + leftness * 6), 4, 52);
  const engOnly   = clamp(Math.round(sp.engOnlyBase - bornOS * 0.6), 28, 96);
  const indig     = parseFloat(clamp(sp.indigBase + (div.state === "NT" ? 20 : 0), 0.2, 48).toFixed(1));
  const medAge    = Math.round(34 + (1 - leftness) * 10);
  const pop       = div.state === "NT" ? 64000 : div.state === "TAS" ? 74000 : 105000;

  // Derive 2PP from synthetic primaries (rough)
  const alpP = clamp(Math.round(28 + leftness * 18), 10, 55);
  const lnpP = clamp(Math.round(42 - leftness * 18), 10, 55);
  const grnP = clamp(Math.round(8 + (1 - Math.abs(leftness - 0.5) * 2) * 8), 2, 28);
  const indP = clamp(Math.round(100 - alpP - lnpP - grnP - 5), 0, 20);
  const onpP = 100 - alpP - lnpP - grnP - indP;
  const alpPref = alpP + grnP * 0.79 + indP * 0.58 + onpP * 0.35;
  const lnpPref = lnpP + grnP * 0.21 + indP * 0.42 + onpP * 0.65;
  const tot2pp  = alpPref + lnpPref;
  const alp2PP  = tot2pp > 0 ? parseFloat(((alpPref / tot2pp) * 100).toFixed(1)) : 50;

  let winner25 = alp2PP >= 50 ? "alp" : "lnp";
  if (div.type === "grn_alp" || div.type === "grn_lnp") winner25 = grnP > 28 ? "grn" : winner25;
  if (div.type === "ind_lnp") winner25 = "ind";
  if (div.type === "ind_alp") winner25 = "ind";

  const seifa = clamp(Math.round(2 + (1 - leftness) * 7), 1, 10);

  return {
    id:    div.id,
    name:  div.name,
    state: div.state,

    result25: {
      winner:     winner25,
      alpPrimary: alpP,
      lnpPrimary: lnpP,
      grnPrimary: grnP,
      onpPrimary: onpP,
      indPrimary: indP,
      alp2PP,
      margin:     parseFloat(Math.abs(alp2PP - 50).toFixed(1)),
      swing25v22: null,
      turnout:    91.8,
      informal:   5.2,
    },

    result22: {
      winner: div.alp2PP >= 50 ? "alp" : "lnp",
      alp2PP: parseFloat(div.alp2PP.toFixed(1)),
    },

    geo: {
      category:    div.state === "NT" || div.state === "TAS" ? "remote" :
                   a2 > 58 || a2 < 38 ? "outer_suburban" : "metropolitan",
      area_km2:    div.state === "NT" ? 145000 : div.state === "WA" && a2 < 42 ? 50000 :
                   div.state === "QLD" && a2 < 42 ? 12000 : 480,
      seifaDecile: seifa,
    },

    census: {
      population:       pop,
      medianAge:        `${medAge} years`,
      medianHhIncome:   Math.round(income / 52),

      noReligion:       clamp(Math.round(28 + uni * 0.35), 18, 58),
      christian:        clamp(Math.round(46 - uni * 0.18), 20, 62),
      catholic:         clamp(Math.round(18 - uni * 0.04), 8, 30),
      anglican:         10,
      otherChristian:   17,
      islam:            clamp(Math.round((100 - engOnly) * 0.12), 0, 20),
      buddhist:         clamp(Math.round((100 - engOnly) * 0.07), 0, 12),
      hindu:            clamp(Math.round((100 - engOnly) * 0.05), 0, 8),
      jewish:           1.2,

      bachelorOrHigher: uni,
      diplomaCert:      voc,
      year12:           yr12,
      noQualification:  noQual,

      ownedOutright:    Math.round(own * 0.44),
      ownedMortgage:    Math.round(own * 0.56),
      rented:           rent,
      medianMortgage:   Math.round(rentAmt * 5.4),
      medianRent:       rentAmt,

      age18to34:        clamp(Math.round(42 - medAge * 0.48), 16, 44),
      age35to54:        33,
      age55plus:        clamp(Math.round(medAge * 0.75), 18, 52),

      familyHousehold:  clamp(Math.round(56 + own * 0.12), 42, 72),
      lonePerson:       clamp(Math.round(22 - own * 0.04), 12, 32),

      bornAustralia:    100 - bornOS,
      bornOverseas:     bornOS,
      indigenous:       indig,
      notSpokenEnglish: 100 - engOnly,
      ancestryEnglish:  Math.round(engOnly * 0.48),
      ancestryChinese:  clamp(Math.round((100 - engOnly) * 0.14), 0, 18),
      ancestryIndian:   clamp(Math.round((100 - engOnly) * 0.09), 0, 12),
      ancestryItalian:  3.5,
      ancestryGreek:    2.1,
      ancestryVietnamese: clamp(Math.round((100 - engOnly) * 0.07), 0, 14),
      ancestryArabic:   clamp(Math.round((100 - engOnly) * 0.08), 0, 16),

      managers:         Math.round(prof * 0.24),
      professionals:    Math.round(prof * 0.68),
      techTrades:       trade,
      communityService: 10,
      clericalAdmin:    12,
      labourers:        clamp(Math.round(unemp * 1.4), 3, 18),
      machineryOperators: 6,
    },
  };
}

// Build the full array
// For the 27 divisions that have real AUS_DEMOGRAPHICS data, use that.
// For all others, synthesise from division metadata.

export const AUS_DIVISION_DEMOGRAPHICS = AUS_DIVISIONS.map(div => {
  const real = AUS_DEMOGRAPHICS[div.id];

  if (!real) {
    // No real data — synthesise from division electoral profile
    return synthesise(div);
  }

  // Real data available — map it to the panel's expected structure
  const pv    = real.pastVote || {};
  const alpP  = pv.alp || 0;
  const lnpP  = pv.lnp || 0;
  const grnP  = pv.grn || 0;
  const indP  = pv.ind || 0;
  const onpP  = pv.onp || 0;
  const edu   = real.education || {};
  const wf    = real.workforce || {};
  const hou   = real.housing   || {};

  let winner25 = "lnp";
  let maxV = lnpP;
  if (alpP > maxV) { winner25 = "alp"; maxV = alpP; }
  if (grnP > maxV) { winner25 = "grn"; maxV = grnP; }
  if (indP > maxV) { winner25 = "ind"; maxV = indP; }

  const alpPref = alpP + grnP * 0.79 + indP * 0.58 + onpP * 0.35;
  const lnpPref = lnpP + grnP * 0.21 + indP * 0.42 + onpP * 0.65;
  const tot2pp  = alpPref + lnpPref;
  const alp2PP  = tot2pp > 0 ? parseFloat(((alpPref / tot2pp) * 100).toFixed(1)) : 50;

  const uni  = edu.university  || 30;
  const voc  = edu.vocational  || 20;
  const yr12 = edu.highSchool  || 14;

  return {
    id:    div.id,
    name:  div.name,
    state: div.state,

    result25: {
      winner:     winner25,
      alpPrimary: alpP,
      lnpPrimary: lnpP,
      grnPrimary: grnP,
      onpPrimary: onpP,
      indPrimary: indP,
      alp2PP,
      margin:     parseFloat(Math.abs(alp2PP - 50).toFixed(1)),
      swing25v22: null,
      turnout:    92.4,
      informal:   5.1,
    },

    result22: {
      winner: div.alp2PP >= 50 ? "alp" : "lnp",
      alp2PP: parseFloat(div.alp2PP.toFixed(1)),
    },

    geo: {
      category:    div.state === "NSW" || div.state === "VIC" || div.state === "QLD"
                   ? "metropolitan" : "regional",
      area_km2:    div.state === "NT" ? 150000 : div.state === "WA" ? 40000 : 500,
      seifaDecile: clamp(Math.round((100 - (wf.unemployed || 5) * 3) / 10), 1, 10),
    },

    census: {
      population:       real.population || 105000,
      medianAge:        real.medianAge  || "38 years",
      medianHhIncome:   real.medianIncome ? Math.round(real.medianIncome / 52) : 1600,

      noReligion:       clamp(Math.round(30 + uni * 0.38), 18, 58),
      christian:        clamp(Math.round(45 - uni * 0.18), 20, 62),
      catholic:         clamp(Math.round(18 - uni * 0.04), 8, 30),
      anglican:         10,
      otherChristian:   17,
      islam:            clamp(Math.round((100 - (real.speaksEnglishOnly || 68)) * 0.12), 0, 20),
      buddhist:         clamp(Math.round((100 - (real.speaksEnglishOnly || 68)) * 0.07), 0, 12),
      hindu:            clamp(Math.round((100 - (real.speaksEnglishOnly || 68)) * 0.05), 0, 8),
      jewish:           1.2,

      bachelorOrHigher: uni,
      diplomaCert:      voc,
      year12:           yr12,
      noQualification:  clamp(100 - uni - voc - yr12, 5, 55),

      ownedOutright:    Math.round((hou.ownerOccupied || 55) * 0.44),
      ownedMortgage:    Math.round((hou.ownerOccupied || 55) * 0.56),
      rented:           hou.renting   || 28,
      medianMortgage:   Math.round((hou.medianRent || 400) * 5.4),
      medianRent:       hou.medianRent || 400,

      age18to34:        clamp(Math.max(15, Math.round(42 - (parseInt(real.medianAge) || 38) * 0.5)), 14, 44),
      age35to54:        33,
      age55plus:        clamp(Math.round((parseInt(real.medianAge) || 38) * 0.78), 18, 52),

      familyHousehold:  clamp(Math.round(56 + (hou.ownerOccupied || 55) * 0.12), 42, 72),
      lonePerson:       clamp(Math.round(22 - (hou.ownerOccupied || 55) * 0.04), 12, 32),

      bornAustralia:    Math.round(100 - (real.bornOverseas || 20)),
      bornOverseas:     real.bornOverseas || 20,
      indigenous:       real.indigenousAustralian || 1,
      notSpokenEnglish: Math.round(100 - (real.speaksEnglishOnly || 68)),
      ancestryEnglish:  Math.round((real.speaksEnglishOnly || 68) * 0.48),
      ancestryChinese:  clamp(Math.round((100 - (real.speaksEnglishOnly || 68)) * 0.14), 0, 18),
      ancestryIndian:   clamp(Math.round((100 - (real.speaksEnglishOnly || 68)) * 0.09), 0, 12),
      ancestryItalian:  3.5,
      ancestryGreek:    2.1,
      ancestryVietnamese: clamp(Math.round((100 - (real.speaksEnglishOnly || 68)) * 0.07), 0, 14),
      ancestryArabic:   clamp(Math.round((100 - (real.speaksEnglishOnly || 68)) * 0.08), 0, 16),

      managers:         Math.round((wf.professional || 35) * 0.24),
      professionals:    Math.round((wf.professional || 35) * 0.68),
      techTrades:       wf.tradesperson || 15,
      communityService: 10,
      clericalAdmin:    12,
      labourers:        clamp(Math.round((wf.unemployed || 5) * 1.4), 3, 18),
      machineryOperators: 6,
    },
  };
});

export default AUS_DIVISION_DEMOGRAPHICS;