/**
 * REGION TEMPLATE
 * Copy this file, rename to regions/[your-region-id].js, fill in all fields.
 * Then add `import myRegion from "./[your-region-id].js"` to regions/index.js
 * and add `myRegion` to the REGIONS_DB object.
 */
export default {
  // Identity
  id: "template",          // Unique slug, used in URL hash and state keys (no spaces)
  name: "Region Name",     // Display name in the header and selector
  icon: "🏛️",              // Emoji for the region selector card
  color: "#60A5FA",        // Accent color for selector card border/icon
  available: false,        // Set to true to make it selectable in the UI

  // Council Seat Rules
  seatsTotal: 61,          // Total council seats including bonus
  bonusSeats: 37,          // Seats given to the first-round or runoff winner
  distributableSeats: 24,  // Seats distributed proportionally to opposition
  threshold: 3,            // Minimum % to qualify for any seats
  winThreshold: 43,        // % needed to win outright (avoid runoff)

  // Turnout
  baseTurnout: 52.4,       // Historical average turnout % for this region

  // Swing Model
  referencePop: 30000,     // Population reference for noise scaling. 
                           // Use median municipality population.
  baseShift: 9.0,          // Urban/rural swing intensity.
                           // High (8-10) for large metro regions (Thessaloniki, Athens).
                           // Medium (6-8) for mixed regions (Epirus, W. Macedonia).
                           // Low (4-6) for small homogeneous regions.

  // Map Source
  mapType: "url",          // "url" fetches from mapUrl; "inline" uses svgContent
  mapUrl: "https://...",   // Wikimedia Commons SVG URL (use "url" mapType)
  // svgContent: `...`,    // Raw SVG string (use "inline" mapType for custom SVGs)

  // SVG ID → Municipality Name Mapping
  // Open the SVG in a browser, inspect each <path> element, note its id attribute.
  svgMap: {
    path1234: "Municipality Name",    // One entry per colored region in the SVG.
  },

  // Municipality List
  // Must match keys in svgMap values AND keys in details below.
  munis: ["Municipality Name"],

  // Municipality Demographics
  details: {
    "Municipality Name": {
      pop: 50000,          // Population (use latest census)
      baseTurnout: 55.0,   // Municipality-level turnout % (can differ from regional avg)
      elasticity: 1.0,     // Swing sensitivity. Urban competitive: 1.0-1.2. Rural safe: 0.5-0.7.
      urbanization: 0.8,   // 0.0 (fully rural) to 1.0 (fully urban).
    },
  },

  // Starting Candidates
  // These are the baseline scenario loaded when the region is first selected.
  // Use most recent election results as starting percentages.
  candidates: [
    {
      id: "candidate_1",        // Unique ID (no spaces)
      name: "A. Surname",       // Display name (short form)
      party: "Party Name",      // Party/list affiliation shown under the name
      color: "#3B82F6",         // Hex color for this candidate
      percent: 55.0,            // Starting vote share (must sum to 100 across all candidates)
      ideology: 1,              // -4 (far left) to +4 (far right). Used for runoff redistribution.
      isLocked: false,          // Leave false
    },
  ],

  // Virtual Districts (optional)
  // Use when multiple small SVG shapes should be aggregated into one named district.
  // Common use: city-centre subdivisions that should show as "City X (Total)" in the panel.
  virtualDistricts: [
    {
      id: "City X (Total)",     // Name shown in MunicipalPanel
      sources: ["Sub-district 1", "Sub-district 2"], // Must match munis keys
    },
  ],
};