// usePolls.js
import { useState, useEffect, useCallback } from "react";

/* Build a chronological timestamp from a Wikipedia date string.
 * We grab the LAST "DD Month YYYY" in the string, i.e. the fieldwork END date,
 * which also resolves ranges cleanly:
 *   "28 May–3 Jun 2026" -> 3 Jun 2026 | "8 - 12 Jun 2026" -> 12 Jun 2026
 *   "21–27 Apr 2026"    -> 27 Apr 2026 | "May 2026" -> 15 May 2026 (mid-month) */
function parsePollTimestamp(dateStr) {
  if (!dateStr) return null;
  const dayMatches = [...dateStr.matchAll(/(\d{1,2})\s+([A-Za-z]+)\.?\s+(\d{4})/g)];
  if (dayMatches.length) {
    const m = dayMatches[dayMatches.length - 1];
    const t = new Date(`${m[1]} ${m[2]} ${m[3]}`).getTime();
    if (!isNaN(t)) return t;
  }
  const moMatch = dateStr.match(/([A-Za-z]+)\.?\s+(\d{4})/);
  if (moMatch) {
    const t = new Date(`15 ${moMatch[1]} ${moMatch[2]}`).getTime();
    if (!isNaN(t)) return t;
  }
  return null;
}

/* Map a Wikipedia column header to the canonical party key the rest of the app
 * uses (these MUST match POLL_PARTIES_MAPPING in greece-utils.js, which feeds
 * both the chart and the last-10 → 2026-scenario average). Handles the layout
 * differences between Wikipedia's tables: the historical table heads Tsipras's
 * column "X", the new table heads it "ELAS"; MeRA25 vs M25; "Sp." vs SP; etc. */
const PARTY_HEADER_PATTERNS = [
  ["ND",     /^ND$|NEWDEMOCRACY/],
  ["SYRIZA", /SYRIZA/],
  ["PASOK",  /PASOK|KINAL/],
  ["KKE",    /KKE/],
  ["SP",     /^SP$|SPART/],
  ["EL",     /^EL$|GREEKSOLUTION|ELLINIKILYSI/],
  ["NIKI",   /NIKI/],
  ["PE",     /^PE$|COURSEOFFREEDOM|PLEFSI/],
  ["M25",    /MERA25|^M25$|MERA/],
  ["FL",     /^FL$|VOICEOFREASON|FONILOGIKIS|FONI/],
  ["NA",     /^NA$|NEWLEFT|NEAARISTERA/],
  ["DPK",    /^DPK$|DIMOKRAT/],
  ["ELPIDA", /ELPIDA|KARYSTIANOU|HOPE/],
  ["ELAS",   /^ELAS$|TSIPRAS|^X$/],
];
function toCanonicalKey(header) {
  const h = (header || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  for (const [key, re] of PARTY_HEADER_PATTERNS) if (re.test(h)) return key;
  return null;
}

// Extract the leading percentage from a cell (ignoring any seat count printed
// after it, e.g. "28.6 119" -> 28.6). Returns null for "–"/"-"/empty.
function parsePct(text) {
  const clean = (text || "").replace(/\[.*?\]/g, "").replace(/%/g, "").trim();
  if (!clean || clean === "-" || clean === "–" || clean === "—") return null;
  const m = clean.match(/\d+(?:[.,]\d+)?/);
  return m ? parseFloat(m[0].replace(",", ".")) : null;
}

export default function usePolls() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [source, setSource] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const res = await fetch("https://en.wikipedia.org/w/api.php?action=parse&page=Opinion_polling_for_the_next_Greek_parliamentary_election&prop=text&format=json&origin=*");
      const data = await res.json();
      const doc = new DOMParser().parseFromString(data.parse.text["*"], "text/html");

      const tables = Array.from(doc.querySelectorAll("table.wikitable"));
      const parsedPolls = [];

      // Read EVERY poll table on the page, not just the first. Wikipedia splits
      // pre/post-launch polls across separate tables with different columns;
      // reading only one is what made an entire month vanish.
      for (const table of tables) {
        const rows = Array.from(table.querySelectorAll("tr"));

        // Find this table's header row (first row naming ND and SYRIZA).
        const headerIdx = rows.findIndex(r => {
          const t = r.textContent.toUpperCase();
          return t.includes("ND") && t.includes("SYRIZA");
        });
        if (headerIdx === -1) continue;                       // not a poll table
        if (rows[headerIdx].textContent.toUpperCase().includes("AGGREGAT")) continue; // skip aggregator table

        // Build canonical key per column index for THIS table.
        const headerCells = Array.from(rows[headerIdx].querySelectorAll("th, td"));
        const colKey = headerCells.map(c => toCanonicalKey(c.textContent.replace(/\[.*?\]/g, "").trim()));

        for (let i = headerIdx + 1; i < rows.length; i++) {
          const row = rows[i];
          if (row.classList.contains("sortbottom")) continue;

          const cells = Array.from(row.querySelectorAll("td, th"));
          if (cells.length < 4) continue;                     // sub-headers / color rows

          const pollster = cells[0]?.textContent.replace(/\[.*?\]/g, "").trim();
          const dateStr  = cells[1]?.textContent.trim();
          if (!pollster || !dateStr || dateStr.toLowerCase().includes("election")) continue;

          const timestamp = parsePollTimestamp(dateStr);
          if (timestamp == null) continue;

          const poll = {
            pollster,
            timestamp,
            dateLabel: dateStr,
            sample_size: cells[2]?.textContent.trim().replace(/,/g, "") || null,
          };

          for (let j = 3; j < cells.length; j++) {
            const key = colKey[j];
            if (!key) continue;                               // date/sample/lead/unknown column
            const val = parsePct(cells[j]?.textContent);
            if (val != null) poll[key] = val;
          }

          // Keep only rows that actually carried a vote share.
          if (poll.ND != null || poll.SYRIZA != null) parsedPolls.push(poll);
        }
      }

      if (parsedPolls.length === 0) throw new Error("No polls could be parsed");

      // De-dupe (same firm + date) in case a poll appears in two tables.
      const seen = new Set();
      const deduped = parsedPolls.filter(p => {
        const sig = `${p.pollster.toLowerCase()}|${p.dateLabel}`;
        if (seen.has(sig)) return false;
        seen.add(sig);
        return true;
      });

      // Sort ASCENDING (oldest first → newest LAST). This is the contract the
      // last-10 average relies on (slice(-10) = the 10 newest polls).
      deduped.sort((a, b) => a.timestamp - b.timestamp);

      console.info(
        `[polls] ${deduped.length} polls across ${tables.length} table(s), ` +
        `${new Date(deduped[0].timestamp).toLocaleDateString("en-GB")} … ` +
        `${new Date(deduped[deduped.length - 1].timestamp).toLocaleDateString("en-GB")}`
      );

      setPolls(deduped);
      setSource("Wikipedia (Live API)");
    } catch (err) {
      console.error("Wikipedia fetch failed:", err);
      setPolls([]);
      setError(true);
      setSource("Offline [Fallback]");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  return { polls, loading, error, source, reload };
}