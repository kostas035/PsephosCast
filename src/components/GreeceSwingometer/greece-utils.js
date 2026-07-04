// greece-utils.js
import { GR, GR_PARTY_DICT, GR_PREFECTURE_MAP, GR_CENTROID_OFFSETS, grBuildScenario } from './greece-data.js';

export function grNormStr(s) { return s ? s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9\u03B1-\u03C9]/g,"") : ""; }
export function grFmtVotes(n) { return (!n && n !== 0) ? "—" : Math.round(n).toLocaleString(); }
export function grFmtVotesShort(n) { if(!n&&n!==0) return "—"; if(n>=1_000_000) return (n/1_000_000).toFixed(2)+"M"; if(n>=1_000) return (n/1_000).toFixed(0)+"K"; return Math.round(n).toLocaleString(); }

export function grExtractName(p) {
  if (!p) return "";
  return p.name || p.NAME_1 || p.NAME || p.NAME_2 || p.nomos || p.name_en || p.en_name || p.PER || "";
}

// Same as grExtractName, but prefers the GeoJSON's own `name_greek` property
// when rendering in Greek — the source files already carry an authoritative
// Greek name per feature, so there's no need for a separate translation map.
export function grExtractNameLocalized(p, lang) {
  if (lang === "el" && p && p.name_greek) return p.name_greek;
  return grExtractName(p);
}

export function grGetCentroidOffset(n) {
  for(let i=0; i<GR_CENTROID_OFFSETS.length; i++) {
    const keys = GR_CENTROID_OFFSETS[i][0];
    for(let j=0; j<keys.length; j++) if(n.includes(keys[j])) return GR_CENTROID_OFFSETS[i][1];
  }
  return [0,0];
}

export function grMatchDistricts(name, dr) {
  if (!name) return [];
  const norm = grNormStr(name);

  // Falls through to the fuzzy/exact matchers below when the mapped ids aren't
  // present in `dr` — e.g. the "2015" scenario's merged "Attica" polygon has no
  // athens_b1/b2/b3/east_attica/west_attica rows to match against.
  if (GR_PREFECTURE_MAP[norm]) {
    const mapped = dr.filter(d => GR_PREFECTURE_MAP[norm].includes(d.id));
    if (mapped.length) return mapped;
  }

  const SUB_MATCHES = {
    "evryt": ["evrytania"], "messen": ["messenia"], "messin": ["messenia"], "μεσσην": ["messenia"], 
    "mesin": ["messenia"], "mesen": ["messenia"], "μεσην": ["messenia"], "kalamat": ["messenia"],
    "argol": ["argolis"], "island": ["piraeus_b"], "kefal": ["cephalonia"], "magnis": ["magnesia"], 
    "laris": ["larissa"], "korinth": ["corinthia"], "kyklad": ["cyclades"], 
    "boeot": ["boeotia"], "achae": ["achaea"], "phthiot": ["phthiotis"], "euboe": ["euboea"], "elis": ["elis"],
    "hania": ["chania"], "irakl": ["heraklion"], "lasith": ["lasithi"], "rethym": ["rethymno"], "rhodop": ["rhodope"], "rodop": ["rhodope"]
  };
  
  for (let key in SUB_MATCHES) {
    if (norm.includes(key)) return dr.filter(d => SUB_MATCHES[key].includes(d.id));
  }
  
  return dr.filter(d => { 
    const rn = grNormStr(d.name); 
    return norm === rn || norm === d.id.replace(/_/g,"") || norm.includes(rn) || rn.includes(norm); 
  });
}

export function grComputeFeatureSeatData(geoFeatures, districtResults, parties, electionResult) {
  if (!geoFeatures || !districtResults?.length || !electionResult?.results?.length) return new Map();
  const qualifyingIds = new Set(electionResult.results.map(r => r.id));
  const partyById = new Map(parties.map(p => [p.id, p]));
  const result = new Map();

  for (let i = 0; i < geoFeatures.features.length; i++) {
    const fname = grExtractName(geoFeatures.features[i].properties);
    if (fname.toLowerCase().includes("athos")) continue;
    const matched = grMatchDistricts(fname, districtResults);
    if (!matched.length) continue;

    let totalSeats = 0, totalLean = 0, aggVotes = {}, allAgg = {}, polySeatCounts = {};
    
    for (let j = 0; j < matched.length; j++) {
      const dist = matched[j];
      totalSeats += dist.seats; totalLean += dist.lean;
      
      // Use the engine's globally-balanced allocatedSeats, not a local re-derivation
      const alloc = dist.allocatedSeats || {};
      
      Object.keys(alloc).forEach(k => { 
        polySeatCounts[k] = (polySeatCounts[k] || 0) + alloc[k]; 
      });

      Object.keys(dist.votes || {}).forEach(k => { 
        if(qualifyingIds.has(k)) {
            aggVotes[k] = (aggVotes[k] || 0) + dist.votes[k]; 
            allAgg[k] = (allAgg[k] || 0) + dist.votes[k] * dist.seats; 
        }
      });
    }

    const dotParties = parties.filter(p => (polySeatCounts[p.id] || 0) > 0).sort((a,b) => a.ideology - b.ideology);
    const dots = [];
    dotParties.forEach(p => { for(let k = 0; k < polySeatCounts[p.id]; k++) dots.push(p); });
    
    let leaderId = null, maxAgg = -1;
    Object.keys(allAgg).forEach(k => { if(allAgg[k] > maxAgg) { maxAgg = allAgg[k]; leaderId = k; } });
    
    result.set(fname, { 
        dots, 
        totalSeats, 
        aggVotes, 
        allAgg, 
        leader: leaderId, 
        leaderColor: partyById.get(leaderId)?.color, 
        districts: matched, 
        lean: totalLean / matched.length, 
        seatCounts: polySeatCounts 
    });
  }
  return result;
}

export const GR_ROW_COUNTS = [22,27,32,37,42,47,52,41];
export const GR_ROW_RADII  = [105,130,155,180,205,230,255,278];
export const GR_HEMI_CX=310, GR_HEMI_CY=295, GR_HEMI_W=620, GR_HEMI_H=325;
export const GR_HEMI_POSITIONS = (() => {
  const pos = [];
  for (let row = 0; row < GR_ROW_COUNTS.length; row++) {
    for (let i = 0; i < GR_ROW_COUNTS[row]; i++) {
      const angle = Math.PI * (1 - i/(GR_ROW_COUNTS[row]-1));
      pos.push({ x:GR_HEMI_CX+GR_ROW_RADII[row]*Math.cos(angle), y:GR_HEMI_CY-GR_ROW_RADII[row]*Math.sin(angle), angle, r:GR_ROW_RADII[row] });
    }
  }
  return pos.sort((a,b) => b.angle-a.angle || a.r-b.r);
})();

export const DEFAULT_HIDDEN_PARTIES = ["SP", "NIKI", "PE", "M25", "FL", "NA", "DPK", "ELAS", "ELPIDA"];
export const PARTY_PATTERNS = [ {key:"ND", re:/\bN\.?D\.?\b|new democracy/i}, {key:"SYRIZA", re:/\bSYRIZA\b/i}, {key:"PASOK", re:/\bPASOK\b|\bKINAL\b/i}, {key:"KKE", re:/\bK\.?K\.?E\.?\b|communist/i}, {key:"SP", re:/\bSP\b|\bspartans\b/i}, {key:"EL", re:/\bE\.?L\.?\b|greek solution/i}, {key:"NIKI", re:/\bNIKI\b/i}, {key:"PE", re:/\bP\.?E\.?\b|course of freedom/i}, {key:"M25", re:/\bM(?:ERA)?25\b/i}, {key:"FL", re:/\bF\.?L\.?\b|voice of reason/i}, {key:"NA", re:/\bNA\b|new left/i}, {key:"DPK", re:/\bDPK\b|democrats/i}, {key:"ELPIDA", re:/\bELPIDA\b|\bKA\b|karystianou|elpid/i}, {key:"ELAS", re:/\bELAS\b|\bX\b|tsipras/i} ];
export const POLL_PARTIES_MAPPING = PARTY_PATTERNS.map(p => ({ key: p.key, dictKey: p.key.toLowerCase() === "m25" ? "mera25" : p.key.toLowerCase() === "sp" ? "spartans" : p.key.toLowerCase() === "dpk" ? "other" : p.key.toLowerCase() }));

export function parseWikiDate(dateStr, currentYear) {
  const match = dateStr.match(/\b(202\d)\b/);
  const text = dateStr.replace(match ? match[1] : "", "").trim();
  const m = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].findIndex(m=>m.toLowerCase()===(text.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*/i)?.[1]||"Jan").toLowerCase());
  const dMatch = text.match(/\d+/g);
  return { timestamp: new Date(match?parseInt(match[1],10):currentYear, m>=0?m:0, dMatch?parseInt(dMatch[dMatch.length-1],10):15).getTime(), year: match?parseInt(match[1],10):currentYear, label: dateStr };
}
export function cellText(td) { return td.textContent.replace(/\[.*?\]/g,"").replace(/%/g,"").trim(); }
export function cellLabel(td) { return `${td.textContent} ${Array.from(td.querySelectorAll("img,a")).map(e=>`${e.alt||""} ${e.title||""}`).join(" ")}`.replace(/\[.*?\]/g,""); }
export function detectColumns(table) {
  const map = {};
  Array.from(table.querySelectorAll("tr")).slice(0,3).forEach(tr => {
    let col = 0;
    Array.from(tr.querySelectorAll("th,td")).forEach(c => {
      const lbl = cellLabel(c).toUpperCase(), span = parseInt(c.getAttribute("colspan"))||1;
      if (!map.pollster && /FIRM|POLLSTER/.test(lbl)) map.pollster = col;
      if (!map.dateStr && /DATE|FIELDWORK/.test(lbl)) map.dateStr = col;
      if (!map.sample_size && /SAMPLE|SIZE/.test(lbl)) map.sample_size = col;
      PARTY_PATTERNS.forEach(({key, re}) => { if (!map[key] && re.test(lbl)) map[key] = col; });
      col += span;
    });
  }); return map;
}
export function parseRows(table, map, currentYear) {
  if (map.ND === undefined || map.pollster === undefined) return [];
  let polls = [], lastTs = Infinity;
  Array.from(table.querySelectorAll("tr")).slice(1).forEach(tr => {
    const cells = Array.from(tr.querySelectorAll("td,th")); if (cells.length < 3) return;
    const flat = []; cells.forEach(c => { const span=parseInt(c.getAttribute("colspan"))||1; const t=cellText(c); for(let i=0;i<span;i++) flat.push(t); });
    const get = k => map[k]!==undefined ? flat[map[k]]||"" : "";
    const p = get("pollster"), d = get("dateStr");
    if (!p || !d || !/\d/.test(d) || /election|result/i.test(p)) return;
    const {timestamp:ts, year} = parseWikiDate(d, currentYear);
    if (year) currentYear = year;
    const time = ts > lastTs + 86400000*7 ? lastTs - 1 : ts; lastTs = time;
    const poll = { pollster: p, timestamp: time, dateLabel: d, sample_size: parseInt(get("sample_size").replace(/,/g,""))||null };
    PARTY_PATTERNS.forEach(({key}) => { const v=parseFloat(get(key).replace(",",".")); poll[key]=isNaN(v)?null:v; });
    if (poll.ND !== null || poll.SYRIZA !== null) polls.push(poll);
  }); return polls;
}
export function finalisePolls(polls) {
  polls.sort((a,b) => a.timestamp - b.timestamp);
  for (let i=1; i<polls.length; i++) if (polls[i].timestamp <= polls[i-1].timestamp) polls[i].timestamp = polls[i-1].timestamp + 1;
  return polls;
}
/* Live polling → dynamic baseline
 * Shared Wikipedia fetch (used by both OpinionPolls and the live 2026 baseline),
 * plus a rolling per-party average that feeds the "May 2026 Polling" scenario. */

// Number of most-recent polls to average for the dynamic baseline.
// 10 ≈ ~3–4 weeks of Greek polling: enough to absorb a single rogue poll / house
// effect, while staying responsive in a fast-moving field. Bump to 15 for a
// calmer/longer average, or switch grAverageRecentPolls to a date cutoff for a
// true time-window aggregate.
export const POLL_WINDOW = 10;

const GR_WIKI_POLLS_URL =
  "https://en.wikipedia.org/w/api.php?action=parse&page=Opinion_polling_for_the_next_Greek_parliamentary_election&format=json&prop=text&origin=*";

// Canonical fetch+parse. Returns { source, polls } with polls sorted ascending
// by timestamp (most recent last). Throws on network/parse failure.
export async function grFetchPolls() {
  const res = await fetch(GR_WIKI_POLLS_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const doc = new DOMParser().parseFromString(json.parse.text["*"], "text/html");
  let allPolls = [], currentYear = new Date().getFullYear();
  for (const table of Array.from(doc.querySelectorAll("table.wikitable"))) {
    const colMap = detectColumns(table);
    const rows   = parseRows(table, colMap, currentYear);
    if (rows.length) { currentYear = new Date(rows[rows.length - 1].timestamp).getFullYear(); allPolls = allPolls.concat(rows); }
  }
  if (!allPolls.length) throw new Error("No polls found");
  const MIN_DATE = new Date(2024, 10, 21).getTime();
  const filtered = allPolls.filter(p => p.timestamp >= MIN_DATE);
  return {
    source: "Live Wikipedia: Opinion polling for the next Greek parliamentary election",
    polls: finalisePolls(filtered.length ? filtered : allPolls),
  };
}

// Average the most-recent `window` polls, PER PARTY: each party is averaged only
// over the polls (within the window) that actually report it. This is exactly
// the "use as many as they have within the last N" rule — so brand-new parties
// (a handful of polls) and fading parties (sparse) are both handled cleanly.
// Returns a map keyed by poll key (ND, PASOK, ELAS, ELPIDA, …) plus _meta.
export function grAverageRecentPolls(polls, window = POLL_WINDOW) {
  if (!polls || !polls.length) return null;
  const recent = polls.slice(-window);              // most-recent N (polls are ascending)
  const out = { _meta: { windowRequested: window, pollsUsed: recent.length } };
  POLL_PARTIES_MAPPING.forEach(({ key }) => {
    let sum = 0, n = 0;
    for (const poll of recent) {
      const v = poll[key];
      if (v != null && !isNaN(v)) { sum += v; n++; }
    }
    if (n > 0) out[key] = sum / n;                  // mean over reporting polls only
  });
  return out;
}

// Convert a poll-key average into a scenario array (same shape as GR_SCENARIOS
// entries) via grBuildScenario, which normalises to 100% and adds "Other".
// Resolves each poll key to its real party-dict id where one exists (so e.g.
// DPK → "dpk", ELAS → "elas"), falling back to the legend's dictKey otherwise.
export function grScenarioFromPollAverage(avgByKey) {
  if (!avgByKey) return null;
  const data = [];
  POLL_PARTIES_MAPPING.forEach(({ key, dictKey }) => {
    const pct = avgByKey[key];
    if (pct == null || pct <= 0) return;
    const lower = key.toLowerCase();
    const id = GR_PARTY_DICT[lower] ? lower : dictKey;   // prefer real id, else legend mapping
    if (id === "other" || !GR_PARTY_DICT[id]) return;    // unmapped → folded into auto "Other"
    data.push({ id, pct });
  });
  if (!data.length) return null;
  data.sort((a, b) => b.pct - a.pct);
  return grBuildScenario(data);
}