// Epirus Region
// Oct 2023 Round 1 — Kachrimanis won outright (>50%).
//
// Every municipality carries a baseVote entry so the swing model has real
// geographic variation to work with, instead of a flat national swing.
// baseVote keys must match candidate IDs: kachrimanis, stefos, zoumpas,
//   prentzas, rizopoulos, georgopoulos, galatas

export default {
  id: "epirus",
  icon: "🏔️",
  color: "#34D399",
  available: true,
  baseShift: 7.0,
  name: "Epirus Region",
  seatsTotal: 45,
  bonusSeats: 27,
  distributableSeats: 18,
  threshold: 3,
  baseTurnout: 57.2,
  winThreshold: 50,  // Greek law: 50%+1 needed to win round 1
  referencePop: 15000,
  mapType: "url",
  mapUrl: "https://upload.wikimedia.org/wikipedia/commons/7/70/2010_Epirus_-_municipalities.svg",

  munis: [
    "Konitsa", "Pogoni", "Zagori", "Metsovo", "Zitsa", "Ioannina", "Ioannina City",
    "Dodoni", "North Tzoumerka", "Filiates", "Igoumenitsa", "Souli", "Parga", "Preveza",
    "Ziros", "Arta", "Nikolaos Skoufas", "Georgios Karaiskakis", "Central Tzoumerka",
  ],

  // Municipality Demographics + Geographic Vote Baselines
  // baseVote reflects 2023 Round 1 geographic distribution.
  // Mountain communities lean more strongly toward Kachrimanis (ND/center-right).
  // Urban areas (Ioannina City, Preveza, Arta, Igoumenitsa) are more competitive.
  details: {
    "Arta": {
      pop: 41833, baseTurnout: 52.3, elasticity: 0.95, urbanization: 0.8,
      baseVote: { kachrimanis: 50.0, stefos: 14.0, zoumpas: 11.0, prentzas: 9.0, rizopoulos: 9.0, georgopoulos: 5.5, galatas: 1.5 }
    },
    "Central Tzoumerka": {
      pop: 5562, baseTurnout: 54.1, elasticity: 0.65, urbanization: 0.1,
      baseVote: { kachrimanis: 63.0, stefos: 10.0, zoumpas: 8.0, prentzas: 6.0, rizopoulos: 7.0, georgopoulos: 5.0, galatas: 1.0 }
    },
    "Ioannina City": {
      pop: 64896, baseTurnout: 59.8, elasticity: 1.15, urbanization: 1.0,
      baseVote: { kachrimanis: 49.0, stefos: 16.0, zoumpas: 11.0, prentzas: 9.0, rizopoulos: 8.0, georgopoulos: 5.0, galatas: 2.0 }
    },
    "Dodoni": {
      pop: 7258, baseTurnout: 53.2, elasticity: 0.70, urbanization: 0.2,
      baseVote: { kachrimanis: 60.0, stefos: 11.0, zoumpas: 8.0, prentzas: 7.0, rizopoulos: 8.0, georgopoulos: 5.0, galatas: 1.0 }
    },
    "Filiates": {
      pop: 6351, baseTurnout: 52.0, elasticity: 0.60, urbanization: 0.2,
      baseVote: { kachrimanis: 62.0, stefos: 11.0, zoumpas: 8.0, prentzas: 7.0, rizopoulos: 7.0, georgopoulos: 4.0, galatas: 1.0 }
    },
    "Georgios Karaiskakis": {
      pop: 5321, baseTurnout: 55.5, elasticity: 0.60, urbanization: 0.1,
      baseVote: { kachrimanis: 56.0, stefos: 12.0, zoumpas: 9.0, prentzas: 8.0, rizopoulos: 8.0, georgopoulos: 6.0, galatas: 1.0 }
    },
    "Igoumenitsa": {
      pop: 25709, baseTurnout: 50.2, elasticity: 1.00, urbanization: 0.7,
      baseVote: { kachrimanis: 49.0, stefos: 15.0, zoumpas: 11.0, prentzas: 9.0, rizopoulos: 9.0, georgopoulos: 5.0, galatas: 2.0 }
    },
    "Ioannina": {
      pop: 113094, baseTurnout: 57.1, elasticity: 1.10, urbanization: 0.9,
      baseVote: { kachrimanis: 52.0, stefos: 13.0, zoumpas: 10.0, prentzas: 9.0, rizopoulos: 8.0, georgopoulos: 6.0, galatas: 2.0 }
    },
    "Konitsa": {
      pop: 5325, baseTurnout: 60.3, elasticity: 0.75, urbanization: 0.3,
      baseVote: { kachrimanis: 65.0, stefos: 9.0, zoumpas: 8.0, prentzas: 6.0, rizopoulos: 7.0, georgopoulos: 4.0, galatas: 1.0 }
    },
    "Metsovo": {
      pop: 5429, baseTurnout: 58.4, elasticity: 0.80, urbanization: 0.4,
      baseVote: { kachrimanis: 70.0, stefos: 8.0, zoumpas: 7.0, prentzas: 5.0, rizopoulos: 6.0, georgopoulos: 3.0, galatas: 1.0 }
    },
    "North Tzoumerka": {
      pop: 5075, baseTurnout: 53.9, elasticity: 0.65, urbanization: 0.1,
      baseVote: { kachrimanis: 64.0, stefos: 10.0, zoumpas: 8.0, prentzas: 6.0, rizopoulos: 7.0, georgopoulos: 4.0, galatas: 1.0 }
    },
    "Nikolaos Skoufas": {
      pop: 11411, baseTurnout: 58.0, elasticity: 0.80, urbanization: 0.4,
      baseVote: { kachrimanis: 52.0, stefos: 13.0, zoumpas: 10.0, prentzas: 8.0, rizopoulos: 9.0, georgopoulos: 6.0, galatas: 2.0 }
    },
    "Parga": {
      pop: 10771, baseTurnout: 51.8, elasticity: 0.90, urbanization: 0.5,
      baseVote: { kachrimanis: 46.0, stefos: 16.0, zoumpas: 12.0, prentzas: 8.0, rizopoulos: 10.0, georgopoulos: 6.0, galatas: 2.0 }
    },
    "Pogoni": {
      pop: 6859, baseTurnout: 53.3, elasticity: 0.60, urbanization: 0.1,
      baseVote: { kachrimanis: 64.0, stefos: 10.0, zoumpas: 8.0, prentzas: 7.0, rizopoulos: 7.0, georgopoulos: 3.0, galatas: 1.0 }
    },
    "Preveza": {
      pop: 30893, baseTurnout: 55.5, elasticity: 1.05, urbanization: 0.8,
      baseVote: { kachrimanis: 48.0, stefos: 15.0, zoumpas: 11.0, prentzas: 9.0, rizopoulos: 9.0, georgopoulos: 6.0, galatas: 2.0 }
    },
    "Souli": {
      pop: 8767, baseTurnout: 50.0, elasticity: 0.70, urbanization: 0.2,
      baseVote: { kachrimanis: 57.0, stefos: 12.0, zoumpas: 9.0, prentzas: 8.0, rizopoulos: 8.0, georgopoulos: 5.0, galatas: 1.0 }
    },
    "Zagori": {
      pop: 3384, baseTurnout: 45.1, elasticity: 0.50, urbanization: 0.0,
      baseVote: { kachrimanis: 68.0, stefos: 9.0, zoumpas: 7.0, prentzas: 5.0, rizopoulos: 6.0, georgopoulos: 4.0, galatas: 1.0 }
    },
    "Zitsa": {
      pop: 13830, baseTurnout: 50.4, elasticity: 0.85, urbanization: 0.4,
      baseVote: { kachrimanis: 57.0, stefos: 12.0, zoumpas: 9.0, prentzas: 8.0, rizopoulos: 8.0, georgopoulos: 5.0, galatas: 1.0 }
    },
    "Ziros": {
      pop: 13071, baseTurnout: 52.0, elasticity: 0.80, urbanization: 0.3,
      baseVote: { kachrimanis: 56.0, stefos: 13.0, zoumpas: 9.0, prentzas: 8.0, rizopoulos: 8.0, georgopoulos: 5.0, galatas: 1.0 }
    },
  },

  // Candidates — 2023 Round 1
  candidates: [
    { id: "kachrimanis",  name: "A. Kachrimanis",    party: "Aksiopioti Ipirou",     color: "#3B82F6", percent: 54.72, ideology:  1, isLocked: false },
    { id: "stefos",       name: "I. Stefos",          party: "Koino ton Ipiroton",    color: "#EF4444", percent: 12.52, ideology: -2, isLocked: false },
    { id: "zoumpas",      name: "S. Zoumpas",         party: "Ipeiros Oli",           color: "#10B981", percent:  9.16, ideology: -1, isLocked: false },
    { id: "prentzas",     name: "G. Prentzas",        party: "Laiki Syspeirosi",      color: "#DC2626", percent:  8.33, ideology: -3, isLocked: false },
    { id: "rizopoulos",   name: "S. Rizopoulos",      party: "Orizontes Ipirou",      color: "#8B5CF6", percent:  7.95, ideology:  0, isLocked: false },
    { id: "georgopoulos", name: "L. Georgopoulos",    party: "Fos",                   color: "#F59E0B", percent:  5.44, ideology:  2, isLocked: false },
    { id: "galatas",      name: "Z. Galatas",         party: "ARISTERA",              color: "#D946EF", percent:  1.89, ideology: -3, isLocked: false },
  ],

  // SVG Map
  svgMap: {
    path3845: "Ioannina", path3843: "Ioannina City", path3899: "Dodoni", path3801: "Konitsa",
    path3839: "Metsovo", path3814: "Pogoni", path3896: "North Tzoumerka", path3836: "Zagori",
    path3893: "Zitsa", path3911: "Arta", path3917: "Arta", path3905: "Georgios Karaiskakis",
    path3902: "Central Tzoumerka", path3908: "Nikolaos Skoufas", path3936: "Preveza", path3929: "Ziros",
    path3941: "Parga", path3939: "Parga", path3947: "Igoumenitsa", path3944: "Souli", path3981: "Filiates",
  },

  // Scenarios
  scenarios: {
    "2019": {
      name: "May 2019 (Round 1)",
      note: "Kachrimanis won R1 outright. Tsoumanis (SYRIZA) was the main opposition.",
      // No details override — engine falls back to 2023 geographic baseline, applying
      // logit-space swing from 2023 → 2019 global shares. Tsoumanis uses global fallback.
      candidates: [
        { id: "kachrimanis",  name: "A. Kachrimanis",    party: "Aksiopioti Ipirou",       color: "#3B82F6", percent: 55.31, isLocked: false, ideology:  1 },
        { id: "tsoumanis",    name: "T. Tsoumanis",       party: "SYRIZA / IPEIROS MPROSTA",color: "#F43F5E", percent: 19.82, isLocked: false, ideology: -2 },
        { id: "prentzas",     name: "G. Prentzas",        party: "Laiki Syspeirosi",        color: "#DC2626", percent:  9.58, isLocked: false, ideology: -3 },
        { id: "rizopoulos",   name: "S. Rizopoulos",      party: "Orizontes Ipirou",        color: "#8B5CF6", percent:  7.19, isLocked: false, ideology:  0 },
        { id: "georgopoulos", name: "L. Georgopoulos",    party: "Fos",                     color: "#F59E0B", percent:  5.48, isLocked: false, ideology:  2 },
        { id: "galatas",      name: "Z. Galatas",         party: "ARISTERA",                color: "#D946EF", percent:  2.62, isLocked: false, ideology: -3 },
      ]
    }
  },
};