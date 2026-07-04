// greece-data.js
export const GR = {
  TOTAL_SEATS:   300,
  LIST_SEATS:    15,
  MAJORITY:      151,
  BONUS_TRIGGER: 25.0,
  BONUS_BASE:    20,
  BONUS_STEP:    0.5,
  BONUS_CAP:     50,
};

// Per-scenario majority-bonus formula. "flat" = unconditional 50 seats to the
// plurality winner (2015 "reinforced proportionality" and 2019 law); "sliding"
// = the June 2023 ramp (20 seats at 25% national share, +1 per 0.5pt, capped
// at 50 seats at 40%+). grCalcBonusSeats() reads this by scenarioId.
export const GR_BONUS_CONFIG = {
  "2012may": { trigger: 0,           base: 50,             step: Infinity,       cap: 50 },
  "2012":  { trigger: 0,             base: 50,             step: Infinity,       cap: 50 },
  "2015jan": { trigger: 0,           base: 50,             step: Infinity,       cap: 50 },
  "2015":  { trigger: 0,             base: 50,             step: Infinity,       cap: 50 },
  "2019":  { trigger: 0,             base: 50,             step: Infinity,       cap: 50 },
  "2023":  { trigger: GR.BONUS_TRIGGER, base: GR.BONUS_BASE, step: GR.BONUS_STEP, cap: GR.BONUS_CAP },
  "2026":  { trigger: GR.BONUS_TRIGGER, base: GR.BONUS_BASE, step: GR.BONUS_STEP, cap: GR.BONUS_CAP },
};

export function grToLogit(pct)  { const p=Math.max(0.001,Math.min(0.999,pct/100)); return Math.log(p/(1-p)); }
export function grFromLogit(lo) { return (1/(1+Math.exp(-lo)))*100; }

export const GR_IDEOLOGY_LABELS = {
  "-5":"Anarchist (-5)","-4":"Communist (-4)","-3":"Democratic Socialist (-3)","-2":"Soft Left (-2)",
  "-1":"Social Democratic (-1)","0":"Centrist (0)","1":"Center Right (1)","2":"Conservative (2)",
  "3":"Libertarian (3)","4":"Right Wing Populist (4)","5":"Far Right (5)",
};

export const GR_PARTY_DICT = {
  // --- GREEK PARTIS ---
  nd:         { name:"ND",         fullName:"New Democracy",              color:"#1b5cc7", ideology: 1, sensitivities:{ youth: -0.250, seniors:  0.450, urban:  0.050, education:  0.150, precarity: -0.400, gender:  0.050 } },
  syriza:     { name:"SYRIZA",     fullName:"SYRIZA - PS",                color:"#EF4444", ideology:-2, sensitivities:{ youth:  0.150, seniors: -0.250, urban:  0.050, education:  0.150, precarity:  0.200, gender:  0.100 } },
  pasok:      { name:"PASOK",      fullName:"PASOK - KINAL",              color:"#16A34A", ideology:-1, sensitivities:{ youth: -0.200, seniors:  0.350, urban: -0.400, education: -0.050, precarity: -0.100, gender:  0.100 } },
  kke:        { name:"KKE",        fullName:"Communist Party",            color:"#991B1B", ideology:-4, sensitivities:{ youth:  0.180, seniors:  0.100, urban:  0.250, education:  0.100, precarity:  0.300, gender: -0.050 } },
  el:         { name:"EL",         fullName:"Greek Solution",             color:"#6BB6E6", ideology: 4, sensitivities:{ youth: -0.250, seniors:  0.250, urban: -0.150, education: -0.250, precarity:  0.150, gender: -0.200 } },
  na:         { name:"NA",         fullName:"New Left",                   color:"#7C3AED", ideology:-3, sensitivities:{ youth: -0.050, seniors:  0.100, urban:  0.250, education:  0.400, precarity: -0.150, gender:  0.050 } },
  niki:       { name:"NIKI",       fullName:"NIKI",                       color:"#92400E", ideology: 3, sensitivities:{ youth: -0.150, seniors:  0.100, urban: -0.150, education: -0.200, precarity:  0.050, gender: -0.150 } },
  pe:         { name:"PE",         fullName:"Course of Freedom",          color:"#D946EF", ideology:-3, sensitivities:{ youth:  0.350, seniors: -0.200, urban:  0.050, education:  0.200, precarity:  0.100, gender:  0.200 } },
  mera25:     { name:"MeRA25",     fullName:"MeRA25",                     color:"#DC2626", ideology:-3, sensitivities:{ youth:  0.450, seniors: -0.150, urban:  0.150, education:  0.350, precarity:  0.150, gender:  0.000 } },
  spartans:   { name:"Spartans",   fullName:"Spartans",                   color:"#E9B460", ideology: 5, sensitivities:{ youth:  0.300, seniors: -0.200, urban: -0.050, education: -0.250, precarity:  0.500, gender: -0.350 } },
  gd:         { name:"GD",         fullName:"Golden Dawn",                color:"#374151", ideology: 5, sensitivities:{ youth:  0.200, seniors: -0.250, urban:  0.100, education: -0.300, precarity:  0.550, gender: -0.450 } },
  fl:         { name:"FL",         fullName:"Voice of Reason",            color:"#0094FF", ideology: 4, sensitivities:{ youth:  0.350, seniors: -0.150, urban:  0.100, education:  0.050, precarity:  0.100, gender: -0.300 } },
  pat:        { name:"PAT",        fullName:"Patriotic Coalition",        color:"#1E3A8A", ideology: 4, sensitivities:{ youth: -0.100, seniors:  0.200, urban: -0.100, education: -0.150, precarity:  0.100, gender: -0.150 } },
  elas:    { name:"ELAS",    fullName:"Greek Left Alliance",               color:"#A41F49", ideology:-2, sensitivities:{ youth:  0.150, seniors: -0.100, urban:  0.100, education:  0.250, precarity:  0.100, gender:  0.050 } },
  elpida:     { name:"ELPIDA",     fullName:"Hope For Democracy",         color:"#d9b24d", ideology: 1, sensitivities:{ youth:  0.350, seniors: -0.150, urban:  0.050, education:  0.150, precarity:  0.200, gender:  0.150 } },
  dpk:        { name: "DPK",       fullName:"Democrats Progressive Centre", color:"#ff6600", ideology: 0, sensitivities:{ youth:  0.410, seniors: -0.080, urban:  0.074, education:  0.250, precarity:  0.150, gender: -0.020 } },
samaras:    { name:"SAMARAS",    fullName:"Antonis Samaras Party",       color:"#172554", ideology: 2, sensitivities:{ youth: -0.200, seniors:  0.400, urban: -0.100, education: -0.050, precarity: -0.200, gender: -0.100 } },

  // --- 2015 ERA (not standing in later scenarios) ---
  potami:     { name:"POTAMI",     fullName:"To Potami",                  color:"#9C514A", ideology: 0, sensitivities:{ youth:  0.250, seniors: -0.150, urban:  0.350, education:  0.400, precarity: -0.150, gender:  0.100 } },
  anel:       { name:"ANEL",       fullName:"Independent Greeks",         color:"#38A3E7", ideology: 4, sensitivities:{ youth: -0.150, seniors:  0.300, urban: -0.350, education: -0.300, precarity:  0.350, gender: -0.250 } },
  ek:         { name:"EK",         fullName:"Union of Centrists",         color:"#FF7F50", ideology: 0, sensitivities:{ youth: -0.050, seniors:  0.150, urban: -0.100, education: -0.100, precarity:  0.100, gender: -0.050 } },
  lae:        { name:"LAE",        fullName:"Popular Unity",              color:"#B01740", ideology:-4, sensitivities:{ youth:  0.100, seniors: -0.100, urban:  0.100, education:  0.150, precarity:  0.250, gender:  0.050 } },
  // January 2015 only (gone by September 2015)
  kidiso:     { name:"KIDISO",     fullName:"Movement of Democratic Socialists", color:"#E70C21", ideology:-1, sensitivities:{ youth: -0.100, seniors:  0.200, urban:  0.100, education:  0.200, precarity: -0.150, gender:  0.050 } },
  teleia:     { name:"TELEIA",     fullName:"Teleia",                     color:"#64748B", ideology: 2, sensitivities:{ youth:  0.050, seniors: -0.050, urban:  0.200, education:  0.350, precarity: -0.350, gender: -0.050 } },

  // --- 2012 ONLY (not standing in later scenarios; stood in both May & June 2012) ---
  dimar:      { name:"DIMAR",      fullName:"Democratic Left",            color:"#FF4100", ideology:-2, sensitivities:{ youth:  0.150, seniors: -0.050, urban:  0.250, education:  0.350, precarity:  0.050, gender:  0.100 } },
  laos:       { name:"LAOS",       fullName:"Popular Orthodox Rally",     color:"#000080", ideology: 4, sensitivities:{ youth: -0.200, seniors:  0.300, urban: -0.250, education: -0.300, precarity:  0.200, gender: -0.200 } },
  prasinoi:   { name:"OP",         fullName:"Ecologist Greens",           color:"#90EE90", ideology: 0, sensitivities:{ youth:  0.300, seniors: -0.200, urban:  0.300, education:  0.350, precarity: -0.050, gender:  0.150 } },
  dxana:      { name:"DXANA",      fullName:"Recreate Greece",            color:"#F19914", ideology: 3, sensitivities:{ youth:  0.050, seniors: -0.050, urban:  0.250, education:  0.350, precarity: -0.300, gender: -0.050 } },
  // May 2012 only (merged into "dxana" for June 2012)
  disy:       { name:"DISY",       fullName:"Democratic Alliance",        color:"#f25c19", ideology: 0, sensitivities:{ youth: -0.050, seniors:  0.150, urban:  0.200, education:  0.250, precarity: -0.200, gender:  0.050 } },
  drasi:      { name:"DRASI",      fullName:"Drasi - Liberal Alliance",   color:"#f25c19", ideology: 2, sensitivities:{ youth:  0.050, seniors: -0.050, urban:  0.250, education:  0.300, precarity: -0.300, gender: -0.050 } },
  antarsya:   { name:"ANTARSYA",   fullName:"Anticapitalist Left Cooperation", color:"#7F1D1D", ideology:-4, sensitivities:{ youth:  0.350, seniors: -0.250, urban:  0.200, education:  0.200, precarity:  0.300, gender:  0.100 } },

  other:      { name:"OTH",        fullName:"Other Parties",              color:"#9CA3AF", ideology: 0, sensitivities:{ youth:  0.000, seniors:  0.000, urban:  0.000, education:  0.000, precarity:  0.000, gender:  0.000 } },

  // --- US EASTER EGGS ---
  us_dem:     { name:"DEM",        fullName:"Democratic Party (US)",      color:"#1D4ED8", ideology:-1, sensitivities:{ youth:  0.350, seniors: -0.150, urban:  0.550, education:  0.450, precarity:  0.100, gender:  0.300 } },
  us_rep:     { name:"GOP",        fullName:"Republican Party (US)",      color:"#E11D48", ideology: 3, sensitivities:{ youth: -0.200, seniors:  0.300, urban: -0.500, education: -0.350, precarity:  0.150, gender: -0.250 } }
};

export const GR_PARTY_LINEAGE = {
  na: "syriza", fl: "el", pe: "mera25", spartans: "gd", niki: "el", mera25: "syriza", elas: "syriza", elpida: "mera25",
};

export const GR_RAW_DISTRICTS = [
  { id:"athens_a",          name:"Athens A",          seats:13, lean:-1.5 },
  { id:"athens_b1",         name:"Athens B1 (North)", seats:16, lean: 1.8 },
  { id:"athens_b2",         name:"Athens B2 (West)",  seats:12, lean:-2.8 },
  { id:"athens_b3",         name:"Athens B3 (South)", seats:19, lean: 0.5 },
  { id:"piraeus_a",         name:"Piraeus A",         seats: 5, lean: 1.0 },
  { id:"piraeus_b",         name:"Piraeus B",         seats: 8, lean:-2.0 },
  { id:"east_attica",       name:"East Attica",       seats:12, lean: 2.5 },
  { id:"west_attica",       name:"West Attica",       seats: 4, lean:-0.5 },
  { id:"thessaloniki_a",    name:"Thessaloniki A",    seats:17, lean:-0.2 },
  { id:"thessaloniki_b",    name:"Thessaloniki B",    seats: 9, lean: 2.5 },
  { id:"chalkidiki",        name:"Chalkidiki",        seats: 3, lean: 4.0 },
  { id:"imathia",           name:"Imathia",           seats: 4, lean: 3.5 },
  { id:"kilkis",            name:"Kilkis",            seats: 3, lean: 4.2 },
  { id:"pella",             name:"Pella",             seats: 4, lean: 3.8 },
  { id:"pieria",            name:"Pieria",            seats: 4, lean: 4.5 },
  { id:"serres",            name:"Serres",            seats: 5, lean: 5.0 },
  { id:"evros",             name:"Evros",             seats: 4, lean: 4.8 },
  { id:"rhodope",           name:"Rhodope",           seats: 3, lean:-2.5 },
  { id:"xanthi",            name:"Xanthi",            seats: 3, lean:-2.0 },
  { id:"drama",             name:"Drama",             seats: 3, lean: 3.5 },
  { id:"kavala",            name:"Kavala",            seats: 4, lean: 3.2 },
  { id:"kozani",            name:"Kozani",            seats: 4, lean: 3.5 },
  { id:"kastoria",          name:"Kastoria",          seats: 1, lean: 5.0 },
  { id:"florina",           name:"Florina",           seats: 2, lean: 3.8 },
  { id:"grevena",           name:"Grevena",           seats: 1, lean: 4.5 },
  { id:"ioannina",          name:"Ioannina",          seats: 5, lean: 0.2 },
  { id:"arta",              name:"Arta",              seats: 2, lean:-1.8 },
  { id:"preveza",           name:"Preveza",           seats: 2, lean: 1.0 },
  { id:"thesprotia",        name:"Thesprotia",        seats: 1, lean: 2.2 },
  { id:"larissa",           name:"Larissa",           seats: 8, lean: 0.8 },
  { id:"magnesia",          name:"Magnesia",          seats: 5, lean:-0.5 },
  { id:"trikala",           name:"Trikala",           seats: 4, lean: 2.5 },
  { id:"karditsa",          name:"Karditsa",          seats: 4, lean: 3.5 },
  { id:"aetolia_acarnania", name:"Aetolia-Acarnania", seats: 7, lean: 0.8 },
  { id:"boeotia",           name:"Boeotia",           seats: 3, lean:-1.0 },
  { id:"phthiotis",         name:"Phthiotis",         seats: 4, lean: 3.5 },
  { id:"evrytania",         name:"Evrytania",         seats: 1, lean: 4.0 },
  { id:"euboea",            name:"Euboea",            seats: 6, lean:-0.5 },
  { id:"phocis",            name:"Phocis",            seats: 1, lean: 3.2 },
  { id:"corinthia",         name:"Corinthia",         seats: 4, lean: 3.0 },
  { id:"argolis",           name:"Argolis",           seats: 3, lean: 3.8 },
  { id:"arcadia",           name:"Arcadia",           seats: 3, lean: 4.2 },
  { id:"laconia",           name:"Laconia",           seats: 3, lean: 5.5 },
  { id:"messenia",          name:"Messenia",          seats: 5, lean: 3.5 },
  { id:"elis",              name:"Elis",              seats: 5, lean:-1.5 },
  { id:"achaea",            name:"Achaea",            seats: 9, lean:-3.0 },
  { id:"heraklion",         name:"Heraklion",         seats: 8, lean:-4.0 },
  { id:"chania",            name:"Chania",            seats: 4, lean:-3.5 },
  { id:"rethymno",          name:"Rehymno",           seats: 2, lean:-3.8 },
  { id:"lasithi",           name:"Lasithi",           seats: 2, lean:-2.5 },
  { id:"dodecanese",        name:"Dodecanese",        seats: 5, lean: 2.0 },
  { id:"cyclades",          name:"Cyclades",          seats: 4, lean: 2.8 },
  { id:"lesbos",            name:"Lesbos",            seats: 3, lean:-1.5 },
  { id:"samos",             name:"Samos",             seats: 1, lean:-1.5 },
  { id:"chios",             name:"Chios",             seats: 2, lean: 2.0 },
  { id:"corfu",             name:"Corfu",             seats: 3, lean:-1.5 },
  { id:"cephalonia",        name:"Cephalonia",        seats: 1, lean:-1.0 },
  { id:"lefkada",           name:"Lefkada",           seats: 1, lean: 1.5 },
  { id:"zakynthos",         name:"Zakynthos",         seats: 1, lean:-0.8 },
];

// ─────────────────────────────────────────────────────────────────────────────
//  Pre-2018 boundary map (56 constituencies), used by both 2015 scenarios
//  (January and September — same apportionment for both).
//  Athens B (undivided) and Attica (undivided) replace the post-Dec-2018 split
//  into Athens B1/B2/B3 and East/West Attica; every other constituency keeps
//  its current id (Thessaloniki A/B and Piraeus A/B split predate 2015).
//  Seat counts are the actual 2012-2015 apportionment set by Π.Δ. 4/2013 on the
//  2011 census: 288 constituency seats (300 − 12 State deputies, the pre-2019
//  split), NOT 285 as under the current 15-State-seat regime. Differs from the
//  current 59-district table in: Athens A 14 (now 13), Piraeus A 6 (now 5),
//  Thessaloniki A 16 (now 17), Thessaloniki B 9 (now 6), Arta 3 (now 2),
//  Achaea 8 (now 9), Kozani 5 (now 4), plus the merged Athens B (44) and
//  Attica (15).
// ─────────────────────────────────────────────────────────────────────────────
export const GR_RAW_DISTRICTS_2015 = [
  { id:"athens_a",          name:"Athens A",          seats:14, lean:-1.5 },
  { id:"athens_b",          name:"Athens B",          seats:44, lean: 0.1 },
  { id:"piraeus_a",         name:"Piraeus A",         seats: 6, lean: 1.0 },
  { id:"piraeus_b",         name:"Piraeus B",         seats: 8, lean:-2.0 },
  { id:"attica",            name:"Attica",            seats:15, lean: 1.75 },
  { id:"thessaloniki_a",    name:"Thessaloniki A",    seats:16, lean:-0.2 },
  { id:"thessaloniki_b",    name:"Thessaloniki B",    seats: 9, lean: 2.5 },
  { id:"chalkidiki",        name:"Chalkidiki",        seats: 3, lean: 4.0 },
  { id:"imathia",           name:"Imathia",           seats: 4, lean: 3.5 },
  { id:"kilkis",            name:"Kilkis",            seats: 3, lean: 4.2 },
  { id:"pella",             name:"Pella",             seats: 4, lean: 3.8 },
  { id:"pieria",            name:"Pieria",            seats: 4, lean: 4.5 },
  { id:"serres",            name:"Serres",            seats: 6, lean: 5.0 },
  { id:"evros",             name:"Evros",             seats: 4, lean: 4.8 },
  { id:"rhodope",           name:"Rhodope",           seats: 3, lean:-2.5 },
  { id:"xanthi",            name:"Xanthi",            seats: 3, lean:-2.0 },
  { id:"drama",             name:"Drama",             seats: 3, lean: 3.5 },
  { id:"kavala",            name:"Kavala",            seats: 4, lean: 3.2 },
  { id:"kozani",            name:"Kozani",            seats: 5, lean: 3.5 },
  { id:"kastoria",          name:"Kastoria",          seats: 2, lean: 5.0 },
  { id:"florina",           name:"Florina",           seats: 2, lean: 3.8 },
  { id:"grevena",           name:"Grevena",           seats: 1, lean: 4.5 },
  { id:"ioannina",          name:"Ioannina",          seats: 5, lean: 0.2 },
  { id:"arta",              name:"Arta",              seats: 3, lean:-1.8 },
  { id:"preveza",           name:"Preveza",           seats: 2, lean: 1.0 },
  { id:"thesprotia",        name:"Thesprotia",        seats: 2, lean: 2.2 },
  { id:"larissa",           name:"Larissa",           seats: 8, lean: 0.8 },
  { id:"magnesia",          name:"Magnesia",          seats: 6, lean:-0.5 },
  { id:"trikala",           name:"Trikala",           seats: 4, lean: 2.5 },
  { id:"karditsa",          name:"Karditsa",          seats: 4, lean: 3.5 },
  { id:"aetolia_acarnania", name:"Aetolia-Acarnania", seats: 7, lean: 0.8 },
  { id:"boeotia",           name:"Boeotia",           seats: 3, lean:-1.0 },
  { id:"phthiotis",         name:"Phthiotis",         seats: 5, lean: 3.5 },
  { id:"evrytania",         name:"Evrytania",         seats: 1, lean: 4.0 },
  { id:"euboea",            name:"Euboea",            seats: 6, lean:-0.5 },
  { id:"phocis",            name:"Phocis",            seats: 1, lean: 3.2 },
  { id:"corinthia",         name:"Corinthia",         seats: 4, lean: 3.0 },
  { id:"argolis",           name:"Argolis",           seats: 3, lean: 3.8 },
  { id:"arcadia",           name:"Arcadia",           seats: 3, lean: 4.2 },
  { id:"laconia",           name:"Laconia",           seats: 3, lean: 5.5 },
  { id:"messenia",          name:"Messenia",          seats: 5, lean: 3.5 },
  { id:"elis",              name:"Elis",              seats: 5, lean:-1.5 },
  { id:"achaea",            name:"Achaea",            seats: 8, lean:-3.0 },
  { id:"heraklion",         name:"Heraklion",         seats: 8, lean:-4.0 },
  { id:"chania",            name:"Chania",            seats: 4, lean:-3.5 },
  { id:"rethymno",          name:"Rehymno",           seats: 2, lean:-3.8 },
  { id:"lasithi",           name:"Lasithi",           seats: 2, lean:-2.5 },
  { id:"dodecanese",        name:"Dodecanese",        seats: 5, lean: 2.0 },
  { id:"cyclades",          name:"Cyclades",          seats: 4, lean: 2.8 },
  { id:"lesbos",            name:"Lesbos",            seats: 3, lean:-1.5 },
  { id:"samos",             name:"Samos",             seats: 1, lean:-1.5 },
  { id:"chios",             name:"Chios",             seats: 2, lean: 2.0 },
  { id:"corfu",             name:"Corfu",             seats: 3, lean:-1.5 },
  { id:"cephalonia",        name:"Cephalonia",        seats: 1, lean:-1.0 },
  { id:"lefkada",           name:"Lefkada",           seats: 1, lean: 1.5 },
  { id:"zakynthos",         name:"Zakynthos",         seats: 1, lean:-0.8 },
];

// ─────────────────────────────────────────────────────────────────────────────
//  June 2012 apportionment (56 pre-2018 constituencies, same undivided Athens B /
//  Attica as GR_RAW_DISTRICTS_2015, but a DIFFERENT seat count per constituency:
//  this is the pre-Π.Δ.4/2013 apportionment (2001 census, Π.Δ. 96/2007), the one
//  actually in force for the May and June 2012 elections, superseded by the 2011-
//  census numbers used from January 2015 on. Derived directly from the actual
//  elected-MP counts per constituency (list of members of the Hellenic
//  Parliament, 2012–2014 term) rather than from the decree text, so it is exact
//  by construction. Differs from GR_RAW_DISTRICTS_2015 in: Athens A 17 (vs 14),
//  Athens B 42 (vs 44), Attica 12 (vs 15), Piraeus A 6 (same), Thessaloniki A 16
//  (same), Thessaloniki B 7 (vs 9), Arta 3 (same), Achaea 9 (vs 8), Boeotia 4
//  (vs 3), Serres 7 (vs 6), Thesprotia 1 (vs 2).
// ─────────────────────────────────────────────────────────────────────────────
export const GR_RAW_DISTRICTS_2012 = [
  { id:"athens_a",          name:"Athens A",          seats:17, lean:-1.5 },
  { id:"athens_b",          name:"Athens B",          seats:42, lean: 0.1 },
  { id:"piraeus_a",         name:"Piraeus A",         seats: 6, lean: 1.0 },
  { id:"piraeus_b",         name:"Piraeus B",         seats: 8, lean:-2.0 },
  { id:"attica",            name:"Attica",            seats:12, lean: 1.75 },
  { id:"thessaloniki_a",    name:"Thessaloniki A",    seats:16, lean:-0.2 },
  { id:"thessaloniki_b",    name:"Thessaloniki B",    seats: 7, lean: 2.5 },
  { id:"chalkidiki",        name:"Chalkidiki",        seats: 3, lean: 4.0 },
  { id:"imathia",           name:"Imathia",           seats: 4, lean: 3.5 },
  { id:"kilkis",            name:"Kilkis",            seats: 3, lean: 4.2 },
  { id:"pella",             name:"Pella",             seats: 4, lean: 3.8 },
  { id:"pieria",            name:"Pieria",            seats: 4, lean: 4.5 },
  { id:"serres",            name:"Serres",            seats: 7, lean: 5.0 },
  { id:"evros",             name:"Evros",             seats: 4, lean: 4.8 },
  { id:"rhodope",           name:"Rhodope",           seats: 3, lean:-2.5 },
  { id:"xanthi",            name:"Xanthi",            seats: 3, lean:-2.0 },
  { id:"drama",             name:"Drama",             seats: 3, lean: 3.5 },
  { id:"kavala",            name:"Kavala",            seats: 4, lean: 3.2 },
  { id:"kozani",            name:"Kozani",            seats: 5, lean: 3.5 },
  { id:"kastoria",          name:"Kastoria",          seats: 2, lean: 5.0 },
  { id:"florina",           name:"Florina",           seats: 2, lean: 3.8 },
  { id:"grevena",           name:"Grevena",           seats: 1, lean: 4.5 },
  { id:"ioannina",          name:"Ioannina",          seats: 5, lean: 0.2 },
  { id:"arta",              name:"Arta",              seats: 3, lean:-1.8 },
  { id:"preveza",           name:"Preveza",           seats: 2, lean: 1.0 },
  { id:"thesprotia",        name:"Thesprotia",        seats: 1, lean: 2.2 },
  { id:"larissa",           name:"Larissa",           seats: 8, lean: 0.8 },
  { id:"magnesia",          name:"Magnesia",          seats: 5, lean:-0.5 },
  { id:"trikala",           name:"Trikala",           seats: 5, lean: 2.5 },
  { id:"karditsa",          name:"Karditsa",          seats: 5, lean: 3.5 },
  { id:"aetolia_acarnania", name:"Aetolia-Acarnania", seats: 8, lean: 0.8 },
  { id:"boeotia",           name:"Boeotia",           seats: 4, lean:-1.0 },
  { id:"phthiotis",         name:"Phthiotis",         seats: 5, lean: 3.5 },
  { id:"evrytania",         name:"Evrytania",         seats: 1, lean: 4.0 },
  { id:"euboea",            name:"Euboea",            seats: 6, lean:-0.5 },
  { id:"phocis",            name:"Phocis",            seats: 1, lean: 3.2 },
  { id:"corinthia",         name:"Corinthia",         seats: 4, lean: 3.0 },
  { id:"argolis",           name:"Argolis",           seats: 3, lean: 3.8 },
  { id:"arcadia",           name:"Arcadia",           seats: 3, lean: 4.2 },
  { id:"laconia",           name:"Laconia",           seats: 3, lean: 5.5 },
  { id:"messenia",          name:"Messenia",          seats: 5, lean: 3.5 },
  { id:"elis",              name:"Elis",              seats: 6, lean:-1.5 },
  { id:"achaea",            name:"Achaea",            seats: 9, lean:-3.0 },
  { id:"heraklion",         name:"Heraklion",         seats: 8, lean:-4.0 },
  { id:"chania",            name:"Chania",            seats: 4, lean:-3.5 },
  { id:"rethymno",          name:"Rehymno",           seats: 2, lean:-3.8 },
  { id:"lasithi",           name:"Lasithi",           seats: 2, lean:-2.5 },
  { id:"dodecanese",        name:"Dodecanese",        seats: 5, lean: 2.0 },
  { id:"cyclades",          name:"Cyclades",          seats: 3, lean: 2.8 },
  { id:"lesbos",            name:"Lesbos",            seats: 3, lean:-1.5 },
  { id:"samos",             name:"Samos",             seats: 1, lean:-1.5 },
  { id:"chios",             name:"Chios",             seats: 2, lean: 2.0 },
  { id:"corfu",             name:"Corfu",             seats: 3, lean:-1.5 },
  { id:"cephalonia",        name:"Cephalonia",        seats: 1, lean:-1.0 },
  { id:"lefkada",           name:"Lefkada",           seats: 1, lean: 1.5 },
  { id:"zakynthos",         name:"Zakynthos",         seats: 1, lean:-0.8 },
];

// scenarioId -> which raw district table to use. The pre-2018 scenarios diverge
// (56 constituencies, undivided Athens B / Attica); every other scenario keeps
// the current 59-map. 2012 further diverges from 2015/2015jan in per-constituency
// seat counts (different census apportionment — see GR_RAW_DISTRICTS_2012). Both
// 2012 elections (May and June) share the same apportionment — no time for a new
// decree in the six weeks between them.
export function grDistrictsForScenario(scenarioId) {
  if (scenarioId === "2012" || scenarioId === "2012may") return GR_RAW_DISTRICTS_2012;
  if (scenarioId === "2015" || scenarioId === "2015jan") return GR_RAW_DISTRICTS_2015;
  return GR_RAW_DISTRICTS;
}

// Which current (post-2018) district ids collapse into each 2015 constituency.
// Drives both the seat/vote-diff table below and the scenario-aware GeoJSON merge.
export const GR_2015_MERGE_GROUPS = {
  athens_b: ["athens_b1", "athens_b2", "athens_b3"],
  attica:   ["east_attica", "west_attica"],
};

// Static, derived-once comparison of September 2015 vs the current (June 2023)
// map's seat allocation. Only constituencies/regions with an actual difference
// are included (merged regions compare against the SUM of their current
// sub-districts). This does not change with swing/simulation — see Task 3.
export const GR_2015_SEAT_DIFF = (() => {
  const current2023ById = Object.fromEntries(GR_RAW_DISTRICTS.map(d => [d.id, d]));
  const rows = [];
  GR_RAW_DISTRICTS_2015.forEach(d2015 => {
    const mergedIds = GR_2015_MERGE_GROUPS[d2015.id];
    let seats2023, name2023;
    if (mergedIds) {
      seats2023 = mergedIds.reduce((sum, id) => sum + (current2023ById[id]?.seats || 0), 0);
      name2023 = mergedIds.map(id => current2023ById[id]?.name).join(" + ");
    } else if (current2023ById[d2015.id]) {
      seats2023 = current2023ById[d2015.id].seats;
      name2023 = current2023ById[d2015.id].name;
    } else {
      return;
    }
    const delta = d2015.seats - seats2023;
    if (delta !== 0) {
      rows.push({ id: d2015.id, name: d2015.name, name2023, seats2015: d2015.seats, seats2023, delta });
    }
  });
  return rows.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta) || a.name.localeCompare(b.name));
})();

export const GR_PREFECTURE_MAP = {
  islands: ["piraeus_b"], nison: ["piraeus_b"], nissos: ["piraeus_b"], νησων: ["piraeus_b"],
  ευρυτανια: ["evrytania"], evritania: ["evrytania"], euritania: ["evrytania"], eurytania: ["evrytania"],
  μεσσηνια: ["messenia"], messinia: ["messenia"], messenia: ["messenia"], messinias: ["messenia"], messenias: ["messenia"],
  πειραιας: ["piraeus_a", "piraeus_b"],
  αττικη: ["athens_a", "athens_b1", "athens_b2", "athens_b3", "piraeus_a", "piraeus_b", "east_attica", "west_attica"],
  λαρισα: ["larissa"], larisa: ["larissa"], larissa: ["larissa"],
  μαγνησια: ["magnesia"], magnisia: ["magnesia"], magnesia: ["magnesia"],
  κορινθια: ["corinthia"], korinthia: ["corinthia"], korinthos: ["corinthia"], corinthia: ["corinthia"],
  κυκλαδες: ["cyclades"], kyklades: ["cyclades"], kikladhes: ["cyclades"], cyclades: ["cyclades"],
  attica: ["athens_a", "athens_b1", "athens_b2", "athens_b3", "piraeus_a", "piraeus_b", "east_attica", "west_attica"],
  attiki: ["athens_a", "athens_b1", "athens_b2", "athens_b3", "piraeus_a", "piraeus_b", "east_attica", "west_attica"],
  
  // Specific District Mappings
  athensa: ["athens_a"],
  athensb1north: ["athens_b1"],
  athensb2west: ["athens_b2"],
  athensb3south: ["athens_b3"],
  piraeusa: ["piraeus_a"],
  piraeusb: ["piraeus_b"],
  thessalonikia: ["thessaloniki_a"],
  thessalonikib: ["thessaloniki_b"],
  
  eastattica: ["east_attica"], westattica: ["west_attica"],
  aetoliaacarnania: ["aetolia_acarnania"], aitoloakarnania: ["aetolia_acarnania"],
  achaea: ["achaea"], achaia: ["achaea"], boeotia: ["boeotia"], viotia: ["boeotia"],
  euboea: ["euboea"], evia: ["euboea"], phthiotis: ["phthiotis"], fthiotida: ["phthiotis"],
  phocis: ["phocis"], fokida: ["phocis"], elis: ["elis"], ilia: ["elis"],
  argolis: ["argolis"], arcadia: ["arcadia"], arkadia: ["arcadia"],
  laconia: ["laconia"], lakonia: ["laconia"],
  cephalonia: ["cephalonia"], kefalonia: ["cephalonia"], corfu: ["corfu"], kerkyra: ["corfu"],
  zakynthos: ["zakynthos"], lesbos: ["lesbos"], lesvos: ["lesbos"],
  dodecanese: ["dodecanese"], dodekanisa: ["dodecanese"], chania: ["chania"],
  rethymno: ["rethymno"], heraklion: ["heraklion"], irakleio: ["heraklion"], lasithi: ["lasithi"],
  evros: ["evros"], rhodope: ["rhodope"], rodopi: ["rhodope"], xanthi: ["xanthi"], drama: ["drama"], kavala: ["kavala"],
  serres: ["serres"], kilkis: ["kilkis"], pella: ["pella"], imathia: ["imathia"], pieria: ["pieria"],
  chalkidiki: ["chalkidiki"], halkidiki: ["chalkidiki"], kozani: ["kozani"], florina: ["florina"],
  kastoria: ["kastoria"], grevena: ["grevena"], ioannina: ["ioannina"], arta: ["arta"], preveza: ["preveza"],
  thesprotia: ["thesprotia"], trikala: ["trikala"], karditsa: ["karditsa"], samos: ["samos"], chios: ["chios"], lefkada: ["lefkada"],
};
export const GR_CENTROID_OFFSETS = [];

export function grBuildScenario(data) {
  let sum = 0;
  for(let i=0; i<data.length; i++) sum += data[i].pct;
  const res = [...data];
  if (sum < 99.9) { res.push({ id: "other", pct: Math.round((100 - sum) * 100) / 100 }); sum = 100; }
  return res.map(d => ({ ...GR_PARTY_DICT[d.id], id: d.id, basePercentage: (d.pct/sum)*100, userPercentage: (d.pct/sum)*100 }));
}

export const GR_SCENARIOS = {

  "2026": grBuildScenario([ { id:"nd", pct:28.9 }, { id:"elas", pct:15.3 }, { id:"pasok", pct:11.8 }, { id:"elpida", pct:11.1 }, { id:"kke", pct:6.9 }, { id:"el", pct:5.8 }, { id:"pe", pct:5.3 }, { id:"fl", pct:4.1 }, { id:"dpk", pct:2.7 }, { id:"mera25", pct:2.2 }, { id:"syriza", pct:1.2 }, { id:"niki", pct:0.6 }, { id:"na", pct:0.5 } ]),
  "2023": grBuildScenario([ { id:"nd", pct:40.560 },{ id:"syriza", pct:17.832 },{ id:"pasok", pct:11.840 }, { id:"kke", pct:7.693 },{ id:"spartans", pct:4.677 },{ id:"el", pct:4.439 }, { id:"niki", pct:3.703 },{ id:"pe", pct:3.174 },{ id:"mera25", pct:2.50 }, { id:"pat", pct:0.50 },{ id:"fl", pct:0.43 } ]),
  "2019": grBuildScenario([ { id:"nd", pct:39.85 },{ id:"syriza", pct:31.53 },{ id:"pasok", pct:8.10 }, { id:"kke", pct:5.30 },{ id:"el", pct:3.70 },{ id:"mera25", pct:3.44 }, { id:"gd", pct:2.93 },{ id:"pe", pct:1.46 } ]),
  // September 20, 2015 legislative election (national result; total valid votes 5,433,376).
  "2015": grBuildScenario([ { id:"syriza", pct:35.46 },{ id:"nd", pct:28.09 },{ id:"gd", pct:6.99 }, { id:"pasok", pct:6.29 },{ id:"kke", pct:5.55 },{ id:"potami", pct:4.09 }, { id:"anel", pct:3.69 },{ id:"ek", pct:3.44 },{ id:"lae", pct:2.86 } ]),
  // January 25, 2015 legislative election (national result; total valid votes 6,180,872).
  "2015jan": grBuildScenario([ { id:"syriza", pct:36.34 },{ id:"nd", pct:27.81 },{ id:"gd", pct:6.28 }, { id:"potami", pct:6.05 },{ id:"kke", pct:5.47 },{ id:"anel", pct:4.75 }, { id:"pasok", pct:4.68 },{ id:"kidiso", pct:2.47 },{ id:"ek", pct:1.79 },{ id:"teleia", pct:1.77 } ]),
  // June 17, 2012 legislative election (national result; total valid votes 6,155,464).
  "2012": grBuildScenario([ { id:"nd", pct:29.66 },{ id:"syriza", pct:26.89 },{ id:"pasok", pct:12.28 }, { id:"anel", pct:7.51 },{ id:"gd", pct:6.92 },{ id:"dimar", pct:6.25 }, { id:"kke", pct:4.50 },{ id:"dxana", pct:1.59 },{ id:"laos", pct:1.58 },{ id:"prasinoi", pct:0.88 } ]),
  // May 6, 2012 legislative election (national result; total valid votes 6,324,136).
  "2012may": grBuildScenario([ { id:"nd", pct:18.85 },{ id:"syriza", pct:16.79 },{ id:"pasok", pct:13.18 }, { id:"anel", pct:10.62 },{ id:"kke", pct:8.48 },{ id:"gd", pct:6.97 }, { id:"dimar", pct:6.11 },{ id:"prasinoi", pct:2.93 },{ id:"laos", pct:2.89 }, { id:"disy", pct:2.55 },{ id:"dxana", pct:2.15 },{ id:"drasi", pct:1.80 },{ id:"antarsya", pct:1.19 } ]),
};

export const GR_SCENARIO_LABELS  = { "2026":"May 2026 Polling", "2023":"June 2023", "2019":"July 2019", "2015":"September 2015", "2015jan":"January 2015", "2012":"June 2012", "2012may":"May 2012" };
export const GR_SCENARIO_TURNOUT = { "2026":5_500_000, "2023":5_273_699, "2019":5_769_542, "2015":5_433_376, "2015jan":6_180_872, "2012":6_155_464, "2012may":6_324_136 };
export const GR_TURNOUT_IS_ESTIMATE = { "2026":true };

// NEW DEMOGRAPHICS DATA
export const GR_DISTRICT_DEMOGRAPHICS = [
  { id: "athens_a", name: "Athens A", age_over_65_pct: 21.5, tertiary_edu_pct: 42.0, unemployment_rate: 9.5, foreign_citizens_pct: 14.5, urbanization_pct: 100.0, primary_economy: "Services" },
  { id: "athens_b1", name: "Athens B1 (North)", age_over_65_pct: 23.0, tertiary_edu_pct: 55.0, unemployment_rate: 7.5, foreign_citizens_pct: 6.0, urbanization_pct: 100.0, primary_economy: "Services & Commerce" },
  { id: "athens_b2", name: "Athens B2 (West)", age_over_65_pct: 20.5, tertiary_edu_pct: 28.0, unemployment_rate: 13.0, foreign_citizens_pct: 10.5, urbanization_pct: 100.0, primary_economy: "Retail & Light Industry" },
  { id: "athens_b3", name: "Athens B3 (South)", age_over_65_pct: 22.0, tertiary_edu_pct: 45.0, unemployment_rate: 8.5, foreign_citizens_pct: 7.5, urbanization_pct: 100.0, primary_economy: "Services & Tourism" },
  { id: "piraeus_a", name: "Piraeus A", age_over_65_pct: 22.5, tertiary_edu_pct: 32.0, unemployment_rate: 10.0, foreign_citizens_pct: 8.0, urbanization_pct: 100.0, primary_economy: "Maritime & Services" },
  { id: "piraeus_b", name: "Piraeus B", age_over_65_pct: 21.0, tertiary_edu_pct: 25.0, unemployment_rate: 14.0, foreign_citizens_pct: 9.5, urbanization_pct: 98.0, primary_economy: "Heavy Industry & Logistics" },
  { id: "east_attica", name: "East Attica", age_over_65_pct: 18.5, tertiary_edu_pct: 38.0, unemployment_rate: 9.0, foreign_citizens_pct: 7.0, urbanization_pct: 85.0, primary_economy: "Services & Aviation" },
  { id: "west_attica", name: "West Attica", age_over_65_pct: 17.5, tertiary_edu_pct: 22.0, unemployment_rate: 15.5, foreign_citizens_pct: 11.0, urbanization_pct: 80.0, primary_economy: "Heavy Industry & Logistics" },
  // Population-weighted averages of the sub-districts above — used only by the "2015" scenario's merged constituencies.
  { id: "athens_b", name: "Athens B", age_over_65_pct: 22.0, tertiary_edu_pct: 44.2, unemployment_rate: 9.3, foreign_citizens_pct: 7.7, urbanization_pct: 100.0, primary_economy: "Services & Commerce" },
  { id: "attica", name: "Attica", age_over_65_pct: 18.2, tertiary_edu_pct: 33.7, unemployment_rate: 10.7, foreign_citizens_pct: 8.1, urbanization_pct: 83.6, primary_economy: "Services & Industry" },
  { id: "thessaloniki_a", name: "Thessaloniki A", age_over_65_pct: 21.0, tertiary_edu_pct: 40.0, unemployment_rate: 11.5, foreign_citizens_pct: 9.0, urbanization_pct: 89.0, primary_economy: "Services & Commerce" },
  { id: "thessaloniki_b", name: "Thessaloniki B", age_over_65_pct: 20.0, tertiary_edu_pct: 30.0, unemployment_rate: 12.0, foreign_citizens_pct: 7.5, urbanization_pct: 75.0, primary_economy: "Agriculture & Light Industry" },
  { id: "chalkidiki", name: "Chalkidiki", age_over_65_pct: 23.5, tertiary_edu_pct: 24.0, unemployment_rate: 10.5, foreign_citizens_pct: 8.0, urbanization_pct: 45.0, primary_economy: "Tourism & Agriculture" },
  { id: "imathia", name: "Imathia", age_over_65_pct: 22.0, tertiary_edu_pct: 25.0, unemployment_rate: 13.5, foreign_citizens_pct: 6.5, urbanization_pct: 60.0, primary_economy: "Agriculture & Processing" },
  { id: "kilkis", name: "Kilkis", age_over_65_pct: 24.5, tertiary_edu_pct: 22.0, unemployment_rate: 12.5, foreign_citizens_pct: 5.5, urbanization_pct: 40.0, primary_economy: "Agriculture & Manufacturing" },
  { id: "pella", name: "Pella", age_over_65_pct: 23.0, tertiary_edu_pct: 23.0, unemployment_rate: 14.0, foreign_citizens_pct: 6.0, urbanization_pct: 50.0, primary_economy: "Agriculture & Food Processing" },
  { id: "pieria", name: "Pieria", age_over_65_pct: 22.5, tertiary_edu_pct: 26.0, unemployment_rate: 12.0, foreign_citizens_pct: 6.5, urbanization_pct: 65.0, primary_economy: "Tourism & Agriculture" },
  { id: "serres", name: "Serres", age_over_65_pct: 27.5, tertiary_edu_pct: 24.0, unemployment_rate: 14.5, foreign_citizens_pct: 4.5, urbanization_pct: 55.0, primary_economy: "Agriculture & Services" },
  { id: "evros", name: "Evros", age_over_65_pct: 24.0, tertiary_edu_pct: 27.0, unemployment_rate: 12.5, foreign_citizens_pct: 3.5, urbanization_pct: 65.0, primary_economy: "Agriculture & Public Sector" },
  { id: "rhodope", name: "Rhodope", age_over_65_pct: 22.0, tertiary_edu_pct: 25.0, unemployment_rate: 15.0, foreign_citizens_pct: 2.5, urbanization_pct: 55.0, primary_economy: "Agriculture" },
  { id: "xanthi", name: "Xanthi", age_over_65_pct: 19.5, tertiary_edu_pct: 26.0, unemployment_rate: 14.5, foreign_citizens_pct: 3.0, urbanization_pct: 60.0, primary_economy: "Agriculture & Education" },
  { id: "drama", name: "Drama", age_over_65_pct: 25.5, tertiary_edu_pct: 24.0, unemployment_rate: 15.5, foreign_citizens_pct: 4.0, urbanization_pct: 55.0, primary_economy: "Agriculture & Marble Extraction" },
  { id: "kavala", name: "Kavala", age_over_65_pct: 24.0, tertiary_edu_pct: 28.0, unemployment_rate: 13.0, foreign_citizens_pct: 5.0, urbanization_pct: 70.0, primary_economy: "Tourism & Industry" },
  { id: "kozani", name: "Kozani", age_over_65_pct: 23.5, tertiary_edu_pct: 29.0, unemployment_rate: 16.5, foreign_citizens_pct: 3.5, urbanization_pct: 65.0, primary_economy: "Energy & Agriculture" },
  { id: "kastoria", name: "Kastoria", age_over_65_pct: 26.5, tertiary_edu_pct: 25.0, unemployment_rate: 17.0, foreign_citizens_pct: 4.5, urbanization_pct: 50.0, primary_economy: "Agriculture & Fur Trade" },
  { id: "florina", name: "Florina", age_over_65_pct: 25.0, tertiary_edu_pct: 26.0, unemployment_rate: 18.0, foreign_citizens_pct: 4.0, urbanization_pct: 55.0, primary_economy: "Energy & Agriculture" },
  { id: "grevena", name: "Grevena", age_over_65_pct: 29.0, tertiary_edu_pct: 22.0, unemployment_rate: 14.5, foreign_citizens_pct: 3.5, urbanization_pct: 40.0, primary_economy: "Agriculture & Forestry" },
  { id: "ioannina", name: "Ioannina", age_over_65_pct: 23.0, tertiary_edu_pct: 32.0, unemployment_rate: 12.0, foreign_citizens_pct: 5.0, urbanization_pct: 65.0, primary_economy: "Education & Agriculture" },
  { id: "arta", name: "Arta", age_over_65_pct: 26.5, tertiary_edu_pct: 24.0, unemployment_rate: 13.5, foreign_citizens_pct: 4.0, urbanization_pct: 50.0, primary_economy: "Agriculture" },
  { id: "preveza", name: "Preveza", age_over_65_pct: 25.0, tertiary_edu_pct: 25.0, unemployment_rate: 12.5, foreign_citizens_pct: 5.0, urbanization_pct: 50.0, primary_economy: "Agriculture & Tourism" },
  { id: "thesprotia", name: "Thesprotia", age_over_65_pct: 24.5, tertiary_edu_pct: 23.0, unemployment_rate: 13.0, foreign_citizens_pct: 6.5, urbanization_pct: 45.0, primary_economy: "Logistics & Agriculture" },
  { id: "larissa", name: "Larissa", age_over_65_pct: 21.5, tertiary_edu_pct: 28.0, unemployment_rate: 11.5, foreign_citizens_pct: 6.0, urbanization_pct: 75.0, primary_economy: "Agriculture & Services" },
  { id: "magnesia", name: "Magnesia", age_over_65_pct: 23.5, tertiary_edu_pct: 27.0, unemployment_rate: 12.0, foreign_citizens_pct: 5.5, urbanization_pct: 70.0, primary_economy: "Industry & Tourism" },
  { id: "trikala", name: "Trikala", age_over_65_pct: 26.0, tertiary_edu_pct: 25.0, unemployment_rate: 13.0, foreign_citizens_pct: 4.0, urbanization_pct: 55.0, primary_economy: "Agriculture & Tourism" },
  { id: "karditsa", name: "Karditsa", age_over_65_pct: 27.0, tertiary_edu_pct: 24.0, unemployment_rate: 14.5, foreign_citizens_pct: 3.5, urbanization_pct: 50.0, primary_economy: "Agriculture" },
  { id: "aetolia_acarnania", name: "Aetolia-Acarnania", age_over_65_pct: 24.5, tertiary_edu_pct: 23.0, unemployment_rate: 14.5, foreign_citizens_pct: 5.0, urbanization_pct: 50.0, primary_economy: "Agriculture & Aquaculture" },
  { id: "boeotia", name: "Boeotia", age_over_65_pct: 22.5, tertiary_edu_pct: 24.0, unemployment_rate: 12.5, foreign_citizens_pct: 8.5, urbanization_pct: 65.0, primary_economy: "Heavy Industry & Agriculture" },
  { id: "phthiotis", name: "Phthiotis", age_over_65_pct: 26.5, tertiary_edu_pct: 25.0, unemployment_rate: 13.5, foreign_citizens_pct: 5.5, urbanization_pct: 60.0, primary_economy: "Agriculture & Services" },
  { id: "evrytania", name: "Evrytania", age_over_65_pct: 31.0, tertiary_edu_pct: 19.0, unemployment_rate: 15.0, foreign_citizens_pct: 4.0, urbanization_pct: 25.0, primary_economy: "Forestry & Tourism" },
  { id: "euboea", name: "Euboea", age_over_65_pct: 24.0, tertiary_edu_pct: 24.0, unemployment_rate: 13.0, foreign_citizens_pct: 6.5, urbanization_pct: 60.0, primary_economy: "Agriculture & Industry" },
  { id: "phocis", name: "Phocis", age_over_65_pct: 28.0, tertiary_edu_pct: 23.0, unemployment_rate: 12.0, foreign_citizens_pct: 6.0, urbanization_pct: 45.0, primary_economy: "Agriculture & Mining" },
  { id: "corinthia", name: "Corinthia", age_over_65_pct: 23.0, tertiary_edu_pct: 26.0, unemployment_rate: 12.0, foreign_citizens_pct: 7.5, urbanization_pct: 65.0, primary_economy: "Agriculture & Manufacturing" },
  { id: "argolis", name: "Argolis", age_over_65_pct: 24.5, tertiary_edu_pct: 25.0, unemployment_rate: 11.5, foreign_citizens_pct: 8.0, urbanization_pct: 55.0, primary_economy: "Agriculture & Tourism" },
  { id: "arcadia", name: "Arcadia", age_over_65_pct: 29.5, tertiary_edu_pct: 24.0, unemployment_rate: 13.5, foreign_citizens_pct: 5.0, urbanization_pct: 45.0, primary_economy: "Agriculture & Energy" },
  { id: "laconia", name: "Laconia", age_over_65_pct: 28.0, tertiary_edu_pct: 22.0, unemployment_rate: 12.0, foreign_citizens_pct: 7.0, urbanization_pct: 40.0, primary_economy: "Agriculture" },
  { id: "messenia", name: "Messenia", age_over_65_pct: 26.0, tertiary_edu_pct: 25.0, unemployment_rate: 12.5, foreign_citizens_pct: 6.5, urbanization_pct: 50.0, primary_economy: "Agriculture & Tourism" },
  { id: "elis", name: "Elis", age_over_65_pct: 26.5, tertiary_edu_pct: 21.0, unemployment_rate: 14.0, foreign_citizens_pct: 8.5, urbanization_pct: 45.0, primary_economy: "Agriculture & Tourism" },
  { id: "achaea", name: "Achaea", age_over_65_pct: 22.5, tertiary_edu_pct: 31.0, unemployment_rate: 13.5, foreign_citizens_pct: 5.5, urbanization_pct: 75.0, primary_economy: "Services & Education" },
  { id: "heraklion", name: "Heraklion", age_over_65_pct: 19.5, tertiary_edu_pct: 29.0, unemployment_rate: 9.5, foreign_citizens_pct: 6.5, urbanization_pct: 75.0, primary_economy: "Tourism & Agriculture" },
  { id: "chania", name: "Chania", age_over_65_pct: 20.5, tertiary_edu_pct: 30.0, unemployment_rate: 10.0, foreign_citizens_pct: 7.5, urbanization_pct: 70.0, primary_economy: "Tourism & Services" },
  { id: "rethymno", name: "Rethymno", age_over_65_pct: 19.0, tertiary_edu_pct: 28.0, unemployment_rate: 9.0, foreign_citizens_pct: 6.0, urbanization_pct: 60.0, primary_economy: "Tourism & Education" },
  { id: "lasithi", name: "Lasithi", age_over_65_pct: 22.5, tertiary_edu_pct: 26.0, unemployment_rate: 9.5, foreign_citizens_pct: 6.5, urbanization_pct: 55.0, primary_economy: "Tourism & Agriculture" },
  { id: "dodecanese", name: "Dodecanese", age_over_65_pct: 18.0, tertiary_edu_pct: 25.0, unemployment_rate: 8.5, foreign_citizens_pct: 8.5, urbanization_pct: 70.0, primary_economy: "Tourism" },
  { id: "cyclades", name: "Cyclades", age_over_65_pct: 20.0, tertiary_edu_pct: 26.0, unemployment_rate: 8.0, foreign_citizens_pct: 9.0, urbanization_pct: 60.0, primary_economy: "Tourism" },
  { id: "lesbos", name: "Lesbos", age_over_65_pct: 25.5, tertiary_edu_pct: 24.0, unemployment_rate: 14.5, foreign_citizens_pct: 7.5, urbanization_pct: 55.0, primary_economy: "Agriculture & Public Sector" },
  { id: "samos", name: "Samos", age_over_65_pct: 24.5, tertiary_edu_pct: 23.0, unemployment_rate: 13.0, foreign_citizens_pct: 8.0, urbanization_pct: 50.0, primary_economy: "Tourism & Agriculture" },
  { id: "chios", name: "Chios", age_over_65_pct: 23.5, tertiary_edu_pct: 26.0, unemployment_rate: 12.5, foreign_citizens_pct: 6.5, urbanization_pct: 60.0, primary_economy: "Maritime & Agriculture" },
  { id: "corfu", name: "Corfu", age_over_65_pct: 22.5, tertiary_edu_pct: 27.0, unemployment_rate: 10.5, foreign_citizens_pct: 8.5, urbanization_pct: 65.0, primary_economy: "Tourism" },
  { id: "cephalonia", name: "Cephalonia", age_over_65_pct: 26.0, tertiary_edu_pct: 26.0, unemployment_rate: 11.5, foreign_citizens_pct: 7.0, urbanization_pct: 55.0, primary_economy: "Tourism & Agriculture" },
  { id: "lefkada", name: "Lefkada", age_over_65_pct: 27.0, tertiary_edu_pct: 25.0, unemployment_rate: 11.0, foreign_citizens_pct: 6.5, urbanization_pct: 45.0, primary_economy: "Tourism" },
  { id: "zakynthos", name: "Zakynthos", age_over_65_pct: 21.5, tertiary_edu_pct: 24.0, unemployment_rate: 9.5, foreign_citizens_pct: 9.5, urbanization_pct: 50.0, primary_economy: "Tourism" }
];

export const GR_DISTRICT_BASELINES = { "2023": {
    athens_a: { nd:43.27, syriza:19.97, pasok:6.86, kke:8.9, spartans:4.22, el:2.95, niki:2.63, pe:3.39, mera25:4.03, pat:0, fl:0, other:3.78 },
    athens_b1: { nd:47.32, syriza:16.95, pasok:7.64, kke:8.98, spartans:3.08, el:2.64, niki:2.73, pe:3.42, mera25:3.71, pat:0, fl:0, other:3.53 },
    athens_b2: { nd:34.66, syriza:21.13, pasok:8.92, kke:12.14, spartans:5.02, el:4.02, niki:2.81, pe:4.05, mera25:3.05, pat:0, fl:0, other:4.2 },
    athens_b3: { nd:42.32, syriza:18.66, pasok:7.91, kke:10.17, spartans:3.76, el:3.35, niki:2.73, pe:3.68, mera25:3.57, pat:0, fl:0, other:3.85 },
    piraeus_a: { nd:47.27, syriza:16.58, pasok:6.7, kke:8.02, spartans:4.57, el:3.54, niki:3.08, pe:3.92, mera25:2.57, pat:0, fl:0, other:3.75 },
    piraeus_b: { nd:37.24, syriza:19.36, pasok:7.6, kke:11.49, spartans:5.6, el:4.53, niki:3.01, pe:4.41, mera25:2.54, pat:0, fl:0, other:4.22 },
    east_attica: { nd:46.66, syriza:17.62, pasok:8.0, kke:7.19, spartans:4.88, el:4.6, niki:3.18, pe:3.63, mera25:2.6, pat:0, fl:0, other:1.64 },
    west_attica: { nd:39.74, syriza:15.83, pasok:8.04, kke:10.11, spartans:7.61, el:5.95, niki:3.44, pe:3.15, mera25:1.87, pat:0, fl:0, other:4.26 },
    thessaloniki_a: { nd:35.28, syriza:17.52, pasok:8.14, kke:8.17, spartans:5.03, el:7.97, niki:5.36, pe:4.44, mera25:3.36, pat:0, fl:0, other:4.73 },
    thessaloniki_b: { nd:40.11, syriza:13.58, pasok:9.85, kke:6.62, spartans:5.29, el:7.95, niki:6.49, pe:3.78, mera25:2.27, pat:0, fl:0, other:4.06 },
    chalkidiki: { nd:39.54, syriza:13.7, pasok:14.52, kke:4.67, spartans:5.55, el:6.3, niki:6.56, pe:3.13, mera25:2.16, pat:0, fl:0, other:3.87 },
    imathia: { nd:39.18, syriza:14.73, pasok:11.75, kke:5.98, spartans:5.81, el:8.21, niki:5.48, pe:3.14, mera25:1.79, pat:0, fl:0, other:3.93 },
    kilkis: { nd:39.63, syriza:12.63, pasok:14.32, kke:6.69, spartans:5.5, el:7.13, niki:6.98, pe:2.57, mera25:1.61, pat:0, fl:0, other:2.94 },
    pella: { nd:38.41, syriza:18.4, pasok:12.49, kke:3.75, spartans:5.13, el:7.65, niki:7.15, pe:2.65, mera25:1.29, pat:0, fl:0, other:3.08 },
    pieria: { nd:38.8, syriza:13.63, pasok:13.11, kke:5.13, spartans:5.56, el:7.0, niki:9.26, pe:2.63, mera25:1.67, pat:0, fl:0, other:3.21 },
    serres: { nd:45.64, syriza:12.88, pasok:11.45, kke:5.02, spartans:5.17, el:7.24, niki:4.69, pe:2.6, mera25:1.68, pat:0, fl:0, other:3.63 },
    evros: { nd:44.18, syriza:15.0, pasok:12.56, kke:3.78, spartans:5.46, el:8.72, niki:3.47, pe:1.76, mera25:1.38, pat:0, fl:0, other:3.69 },
    rhodope: { nd:28.89, syriza:33.6, pasok:19.0, kke:3.16, spartans:3.13, el:4.13, niki:2.65, pe:1.34, mera25:1.42, pat:0, fl:0, other:2.68 },
    xanthi: { nd:30.32, syriza:28.49, pasok:18.36, kke:3.22, spartans:4.4, el:3.98, niki:3.16, pe:2.19, mera25:1.62, pat:0, fl:0, other:4.26 },
    drama: { nd:39.39, syriza:13.27, pasok:15.25, kke:4.07, spartans:6.01, el:6.83, niki:6.33, pe:2.98, mera25:2.03, pat:0, fl:0, other:3.84 },
    kavala: { nd:42.69, syriza:14.15, pasok:12.38, kke:5.58, spartans:5.43, el:5.4, niki:5.53, pe:2.86, mera25:2.08, pat:0, fl:0, other:3.9 },
    kozani: { nd:36.69, syriza:17.48, pasok:14.75, kke:7.26, spartans:4.3, el:4.69, niki:6.27, pe:2.61, mera25:2.11, pat:0, fl:0, other:3.84 },
    kastoria: { nd:44.79, syriza:16.61, pasok:11.52, kke:4.09, spartans:4.78, el:5.32, niki:4.99, pe:2.39, mera25:2.33, pat:0, fl:0, other:3.18 },
    florina: { nd:34.42, syriza:21.81, pasok:15.12, kke:5.65, spartans:4.31, el:5.13, niki:5.37, pe:2.34, mera25:1.93, pat:0, fl:0, other:3.92 },
    grevena: { nd:39.81, syriza:17.98, pasok:16.47, kke:8.12, spartans:4.19, el:3.8, niki:3.37, pe:2.1, mera25:1.58, pat:0, fl:0, other:2.58 },
    ioannina: { nd:38.71, syriza:22.42, pasok:13.53, kke:8.01, spartans:3.49, el:3.06, niki:3.16, pe:2.18, mera25:2.2, pat:0, fl:0, other:3.24 },
    arta: { nd:37.5, syriza:28.94, pasok:10.84, kke:7.65, spartans:3.58, el:2.62, niki:2.36, pe:1.79, mera25:2.1, pat:0, fl:0, other:2.62 },
    preveza: { nd:41.58, syriza:20.95, pasok:15.01, kke:7.92, spartans:3.78, el:2.64, niki:1.83, pe:1.89, mera25:1.84, pat:0, fl:0, other:2.56 },
    thesprotia: { nd:43.33, syriza:19.13, pasok:15.07, kke:5.83, spartans:3.86, el:2.89, niki:2.34, pe:2.21, mera25:1.77, pat:0, fl:0, other:3.57 },
    larissa: { nd:39.35, syriza:17.53, pasok:12.25, kke:9.29, spartans:5.13, el:3.88, niki:4.1, pe:2.57, mera25:2.05, pat:0, fl:0, other:3.85 },
    magnesia: { nd:42.39, syriza:17.25, pasok:9.37, kke:7.9, spartans:4.9, el:4.09, niki:4.04, pe:3.67, mera25:2.62, pat:0, fl:0, other:3.77 },
    trikala: { nd:41.4, syriza:17.18, pasok:14.86, kke:8.6, spartans:3.97, el:2.94, niki:4.44, pe:1.85, mera25:1.64, pat:0, fl:0, other:3.12 },
    karditsa: { nd:43.09, syriza:16.67, pasok:16.58, kke:7.51, spartans:4.88, el:2.82, niki:2.74, pe:1.71, mera25:1.34, pat:0, fl:0, other:2.66 },
    aetolia_acarnania: { nd:38.85, syriza:21.64, pasok:14.2, kke:7.09, spartans:5.01, el:2.81, niki:3.96, pe:2.23, mera25:1.6, pat:0, fl:0, other:2.61 },
    boeotia: { nd:37.12, syriza:18.31, pasok:14.07, kke:8.89, spartans:5.37, el:4.35, niki:3.42, pe:3.12, mera25:2.05, pat:0, fl:0, other:3.3 },
    phthiotis: { nd:43.3, syriza:17.57, pasok:12.68, kke:7.24, spartans:5.21, el:3.91, niki:3.05, pe:2.22, mera25:1.67, pat:0, fl:0, other:3.15 },
    evrytania: { nd:41.22, syriza:19.51, pasok:15.98, kke:5.38, spartans:3.79, el:3.05, niki:4.43, pe:2.49, mera25:1.76, pat:0, fl:0, other:2.39 },
    euboea: { nd:38.63, syriza:17.77, pasok:12.99, kke:7.64, spartans:5.3, el:4.89, niki:3.21, pe:3.89, mera25:2.18, pat:0, fl:0, other:3.5 },
    phocis: { nd:44.65, syriza:16.1, pasok:11.6, kke:8.09, spartans:4.58, el:3.65, niki:2.77, pe:3.11, mera25:2.2, pat:0, fl:0, other:3.25 },
    corinthia: { nd:41.83, syriza:17.27, pasok:13.66, kke:4.37, spartans:5.64, el:4.26, niki:4.39, pe:3.16, mera25:2.32, pat:0, fl:0, other:3.1 },
    argolis: { nd:43.28, syriza:15.25, pasok:15.01, kke:5.26, spartans:5.39, el:3.87, niki:3.43, pe:2.52, mera25:2.47, pat:0, fl:0, other:3.52 },
    arcadia: { nd:41.51, syriza:16.86, pasok:16.28, kke:6.5, spartans:4.47, el:3.67, niki:2.86, pe:2.84, mera25:1.85, pat:0, fl:0, other:3.16 },
    laconia: { nd:47.83, syriza:12.8, pasok:14.77, kke:5.06, spartans:7.48, el:3.51, niki:2.25, pe:2.38, mera25:1.41, pat:0, fl:0, other:2.51 },
    messenia: { nd:43.71, syriza:17.5, pasok:11.14, kke:7.44, spartans:5.96, el:3.81, niki:2.59, pe:2.57, mera25:2.28, pat:0, fl:0, other:3.0 },
    elis: { nd:37.45, syriza:20.13, pasok:19.74, kke:5.48, spartans:4.59, el:3.77, niki:2.2, pe:2.88, mera25:1.27, pat:0, fl:0, other:2.49 },
    achaea: { nd:34.04, syriza:23.2, pasok:13.7, kke:7.57, spartans:4.19, el:3.9, niki:4.33, pe:3.51, mera25:2.38, pat:0, fl:0, other:3.18 },
    heraklion: { nd:35.16, syriza:20.52, pasok:22.98, kke:5.5, spartans:3.77, el:2.23, niki:2.03, pe:2.44, mera25:2.51, pat:0, fl:0, other:2.86 },
    chania: { nd:40.52, syriza:18.44, pasok:11.21, kke:8.42, spartans:4.64, el:3.1, niki:2.73, pe:3.71, mera25:3.05, pat:0, fl:0, other:4.18 },
    rethymno: { nd:36.67, syriza:18.71, pasok:25.71, kke:4.08, spartans:2.99, el:2.2, niki:2.78, pe:2.63, mera25:1.69, pat:0, fl:0, other:2.54 },
    lasithi: { nd:39.75, syriza:14.62, pasok:25.58, kke:4.76, spartans:2.94, el:2.57, niki:2.08, pe:2.52, mera25:2.36, pat:0, fl:0, other:2.82 },
    dodecanese: { nd:46.97, syriza:13.07, pasok:14.52, kke:4.34, spartans:5.81, el:4.46, niki:3.03, pe:2.95, mera25:1.56, pat:0, fl:0, other:3.29 },
    cyclades: { nd:46.68, syriza:14.14, pasok:12.44, kke:5.74, spartans:3.99, el:3.93, niki:2.96, pe:3.75, mera25:2.59, pat:0, fl:0, other:3.78 },
    lesbos: { nd:39.81, syriza:13.49, pasok:14.69, kke:14.64, spartans:4.11, el:3.47, niki:2.84, pe:2.06, mera25:1.46, pat:0, fl:0, other:3.43 },
    samos: { nd:36.05, syriza:14.88, pasok:9.93, kke:17.69, spartans:3.85, el:5.18, niki:2.17, pe:3.35, mera25:2.44, pat:0, fl:0, other:4.46 },
    chios: { nd:46.49, syriza:10.52, pasok:19.89, kke:6.67, spartans:3.59, el:2.97, niki:2.48, pe:2.4, mera25:1.8, pat:0, fl:0, other:3.19 },
    corfu: { nd:36.74, syriza:18.56, pasok:12.06, kke:8.74, spartans:5.36, el:3.34, niki:2.38, pe:6.39, mera25:2.98, pat:0, fl:0, other:3.45 },
    cephalonia: { nd:38.15, syriza:19.69, pasok:10.44, kke:12.36, spartans:4.9, el:2.92, niki:1.96, pe:3.86, mera25:1.96, pat:0, fl:0, other:3.76 },
    lefkada: { nd:41.71, syriza:17.52, pasok:12.39, kke:11.8, spartans:3.46, el:1.98, niki:1.91, pe:2.71, mera25:2.92, pat:0, fl:0, other:3.6 },
    zakynthos: { nd:39.21, syriza:16.4, pasok:13.47, kke:12.82, spartans:5.17, el:2.88, niki:1.87, pe:2.92, mera25:2.22, pat:0, fl:0, other:3.04 },
  },
  "2019": {
    athens_a:         { nd:42.32, syriza:31.29, pasok:5.16, kke:6.37, el:2.58, mera25:3.84, gd:3.09, pe:1.51 },
    athens_b1:        { nd:45.81, syriza:28.22, pasok:5.59, kke:6.19, el:2.54, mera25:4.15, gd:2.0,  pe:1.39 },
    athens_b2:        { nd:29.69, syriza:38.6,  pasok:6.0,  kke:8.65, el:3.51, mera25:4.28, gd:3.16, pe:1.73 },
    athens_b3:        { nd:39.49, syriza:32.03, pasok:5.72, kke:7.13, el:2.99, mera25:4.44, gd:2.42, pe:1.51 },
    piraeus_a:        { nd:43.73, syriza:29.72, pasok:4.94, kke:5.51, el:3.39, mera25:3.88, gd:3.18, pe:1.7  },
    piraeus_b:        { nd:30.19, syriza:38.22, pasok:5.09, kke:8.02, el:4.2,  mera25:4.4,  gd:3.69, pe:2.06 },
    east_attica:      { nd:43.13, syriza:29.6,  pasok:5.03, kke:4.96, el:4.85, mera25:3.87, gd:3.16, pe:1.61 },
    west_attica:      { nd:34.28, syriza:36.24, pasok:5.24, kke:5.93, el:5.24, mera25:3.2,  gd:4.62, pe:1.58 },
    thessaloniki_a:   { nd:35.52, syriza:31.31, pasok:6.05, kke:5.3,  el:5.39, mera25:4.76, gd:3.92, pe:2.19 },
    thessaloniki_b:   { nd:43.02, syriza:25.14, pasok:6.65, kke:4.61, el:5.65, mera25:4.06, gd:4.2,  pe:1.72 },
    chalkidiki:       { nd:42.59, syriza:24.32, pasok:10.37, kke:3.14, el:4.33, mera25:3.81, gd:5.26, pe:1.91 },
    imathia:          { nd:41.92, syriza:26.98, pasok:8.24, kke:4.68, el:5.63, mera25:3.06, gd:4.04, pe:1.71 },
    kilkis:           { nd:42.35, syriza:23.22, pasok:11.21, kke:5.05, el:5.16, mera25:2.7,  gd:5.24, pe:1.4  },
    pella:            { nd:42.29, syriza:28.52, pasok:9.31, kke:2.59, el:5.6,  mera25:2.5,  gd:3.59, pe:1.6  },
    pieria:           { nd:47.45, syriza:23.33, pasok:8.52, kke:3.98, el:5.73, mera25:2.78, gd:3.21, pe:1.5  },
    serres:           { nd:48.04, syriza:23.25, pasok:8.68, kke:3.41, el:6.11, mera25:3.13, gd:2.94, pe:1.09 },
    evros:            { nd:44.99, syriza:27.55, pasok:8.17, kke:2.95, el:5.86, mera25:2.39, gd:3.52, pe:0.81 },
    rhodope:          { nd:37.84, syriza:27.17, pasok:21.94, kke:4.25, el:2.57, mera25:1.38, gd:2.17, pe:0.54 },
    xanthi:           { nd:36.78, syriza:39.6,  pasok:8.78, kke:2.19, el:3.44, mera25:2.35, gd:2.62, pe:1.08 },
    drama:            { nd:43.9,  syriza:22.72, pasok:12.31, kke:2.78, el:6.7,  mera25:3.1,  gd:2.96, pe:1.57 },
    kavala:           { nd:42.55, syriza:26.2,  pasok:8.48, kke:4.18, el:5.86, mera25:3.13, gd:3.35, pe:1.59 },
    kozani:           { nd:39.39, syriza:31.39, pasok:10.3, kke:4.64, el:4.01, mera25:2.96, gd:2.54, pe:1.39 },
    kastoria:         { nd:50.23, syriza:27.1,  pasok:7.0,  kke:2.53, el:2.73, mera25:2.98, gd:0.0,  pe:1.01 },
    florina:          { nd:39.02, syriza:35.51, pasok:6.24, kke:3.07, el:7.27, mera25:2.78, gd:2.37, pe:1.1  },
    grevena:          { nd:43.16, syriza:29.49, pasok:9.89, kke:5.82, el:2.74, mera25:2.32, gd:2.87, pe:0.84 },
    ioannina:         { nd:37.42, syriza:36.3,  pasok:9.53, kke:4.99, el:2.34, mera25:2.79, gd:1.94, pe:1.02 },
    arta:             { nd:38.99, syriza:39.94, pasok:8.44, kke:4.83, el:1.43, mera25:1.98, gd:1.5,  pe:0.66 },
    preveza:          { nd:43.47, syriza:34.38, pasok:8.25, kke:5.49, el:1.39, mera25:2.07, gd:1.65, pe:0.78 },
    thesprotia:       { nd:41.14, syriza:31.54, pasok:13.28, kke:3.73, el:1.81, mera25:2.5,  gd:1.61, pe:0.79 },
    larissa:          { nd:39.3,  syriza:31.25, pasok:8.79, kke:6.25, el:4.34, mera25:2.81, gd:2.82, pe:1.19 },
    magnesia:         { nd:38.76, syriza:32.16, pasok:6.58, kke:5.33, el:4.34, mera25:3.78, gd:3.89, pe:1.49 },
    trikala:          { nd:44.4,  syriza:29.54, pasok:9.71, kke:6.07, el:2.85, mera25:2.05, gd:1.82, pe:0.84 },
    karditsa:         { nd:44.91, syriza:30.45, pasok:9.42, kke:5.6,  el:2.49, mera25:1.87, gd:2.29, pe:0.75 },
    aetolia_acarnania:{ nd:40.95, syriza:33.89, pasok:10.24, kke:4.93, el:1.69, mera25:2.13, gd:2.74, pe:0.89 },
    boeotia:          { nd:36.25, syriza:32.27, pasok:9.7,  kke:7.01, el:3.39, mera25:3.41, gd:3.23, pe:1.44 },
    phthiotis:        { nd:43.79, syriza:31.64, pasok:7.59, kke:4.38, el:3.19, mera25:2.58, gd:2.82, pe:1.38 },
    evrytania:        { nd:48.87, syriza:29.54, pasok:9.94, kke:2.79, el:2.14, mera25:1.84, gd:1.61, pe:0.85 },
    euboea:           { nd:36.61, syriza:34.91, pasok:8.53, kke:4.98, el:4.16, mera25:3.14, gd:2.64, pe:1.96 },
    phocis:           { nd:44.75, syriza:29.16, pasok:7.35, kke:6.04, el:3.01, mera25:3.0,  gd:2.62, pe:1.23 },
    corinthia:        { nd:41.8,  syriza:30.73, pasok:8.47, kke:2.8,  el:4.11, mera25:3.68, gd:3.41, pe:1.53 },
    argolis:          { nd:43.43, syriza:24.99, pasok:14.84, kke:3.56, el:3.25, mera25:3.12, gd:2.68, pe:1.15 },
    arcadia:          { nd:42.56, syriza:30.14, pasok:10.81, kke:4.54, el:2.75, mera25:2.67, gd:2.58, pe:1.07 },
    laconia:          { nd:49.91, syriza:19.63, pasok:14.39, kke:3.57, el:3.19, mera25:2.01, gd:3.64, pe:1.0  },
    messenia:         { nd:44.37, syriza:30.66, pasok:6.85, kke:4.69, el:3.35, mera25:3.02, gd:2.86, pe:1.0  },
    elis:             { nd:36.03, syriza:34.82, pasok:14.79, kke:3.62, el:2.88, mera25:2.21, gd:2.4,  pe:1.28 },
    achaea:           { nd:32.43, syriza:40.27, pasok:8.91, kke:5.45, el:3.24, mera25:3.14, gd:2.12, pe:1.6  },
    heraklion:        { nd:30.15, syriza:43.22, pasok:11.38, kke:3.57, el:2.18, mera25:4.03, gd:1.51, pe:1.0  },
    chania:           { nd:34.05, syriza:37.35, pasok:6.54, kke:5.02, el:3.13, mera25:4.85, gd:2.45, pe:2.42 },
    rethymno:         { nd:36.55, syriza:36.99, pasok:9.82, kke:3.33, el:2.3,  mera25:3.45, gd:1.72, pe:2.25 },
    lasithi:          { nd:34.32, syriza:34.57, pasok:15.4, kke:2.93, el:2.64, mera25:3.08, gd:1.52, pe:1.32 },
    dodecanese:       { nd:41.28, syriza:29.73, pasok:10.37, kke:3.2,  el:3.87, mera25:3.01, gd:3.69, pe:1.7  },
    cyclades:         { nd:43.55, syriza:28.32, pasok:8.52, kke:4.2,  el:2.88, mera25:4.1,  gd:2.78, pe:1.85 },
    lesbos:           { nd:38.99, syriza:29.01, pasok:8.57, kke:10.04, el:2.62, mera25:2.25, gd:3.48, pe:1.04 },
    samos:            { nd:34.13, syriza:29.08, pasok:6.85, kke:14.47, el:3.3,  mera25:2.81, gd:3.55, pe:1.93 },
    chios:            { nd:45.65, syriza:22.14, pasok:14.94, kke:4.78, el:2.43, mera25:2.89, gd:2.98, pe:1.36 },
    corfu:            { nd:35.14, syriza:34.41, pasok:7.5,  kke:6.99, el:2.4,  mera25:4.84, gd:3.18, pe:2.13 },
    cephalonia:       { nd:37.94, syriza:32.45, pasok:5.82, kke:9.52, el:2.49, mera25:3.45, gd:2.99, pe:1.78 },
    lefkada:          { nd:44.37, syriza:28.19, pasok:9.6,  kke:8.16, el:1.3,  mera25:2.81, gd:1.83, pe:1.04 },
    zakynthos:        { nd:41.91, syriza:31.44, pasok:5.37, kke:9.04, el:2.21, mera25:3.32, gd:2.36, pe:1.22 },
  },
  // September 2015 — full official-results-derived vote shares for all 56
  // pre-2018 constituencies (party vote %; "other" is auto-filled to 100% by
  // the normalisation pass below, same as every other scenario here).
  "2015": {
    athens_a:          { syriza:31.5463, nd:31.1155, gd:6.9149, pasok:4.6790, kke:5.8253, potami:5.7320, anel:3.3710, ek:3.3855, lae:3.5745 },
    athens_b:          { syriza:35.2087, nd:27.3806, gd:5.6412, pasok:4.6418, kke:6.7972, potami:5.5857, anel:3.8683, ek:3.6093, lae:3.1307 },
    piraeus_a:         { syriza:33.6285, nd:29.4526, gd:7.8187, pasok:4.4040, kke:5.1394, potami:4.2105, anel:4.2549, ek:4.3665, lae:2.9567 },
    piraeus_b:         { syriza:42.0183, nd:18.3167, gd:8.4001, pasok:4.0156, kke:7.9434, potami:3.1482, anel:4.7020, ek:3.7686, lae:3.7746 },
    attica:            { syriza:36.4672, nd:27.1114, gd:8.6831, pasok:4.0797, kke:5.1648, potami:4.3562, anel:4.2917, ek:3.1407, lae:2.8569 },
    thessaloniki_a:    { syriza:35.8138, nd:25.2909, gd:7.2662, pasok:4.3164, kke:5.3099, potami:4.8410, anel:3.8597, ek:6.7814, lae:2.6905 },
    thessaloniki_b:    { syriza:32.8838, nd:29.5035, gd:8.4354, pasok:4.7437, kke:4.8135, potami:3.8623, anel:3.8837, ek:6.0052, lae:2.3328 },
    chalkidiki:        { syriza:32.9034, nd:33.2947, gd:7.2218, pasok:7.0604, kke:3.2872, potami:3.0573, anel:3.5954, ek:4.1547, lae:2.4589 },
    imathia:           { syriza:34.2758, nd:27.5627, gd:9.2569, pasok:6.8340, kke:5.1356, potami:2.9017, anel:3.5745, ek:3.9588, lae:3.1511 },
    kilkis:            { syriza:30.8912, nd:32.4141, gd:9.4733, pasok:7.0584, kke:5.9805, potami:2.1978, anel:3.0915, ek:4.2041, lae:1.9187 },
    pella:             { syriza:33.2582, nd:31.5466, gd:9.4205, pasok:6.6865, kke:3.6509, potami:2.2773, anel:2.8890, ek:4.7956, lae:2.2761 },
    pieria:            { syriza:32.4307, nd:32.6799, gd:7.4311, pasok:6.6226, kke:4.4506, potami:2.7493, anel:3.8401, ek:4.2679, lae:2.8919 },
    serres:            { syriza:29.0782, nd:35.2087, gd:7.9065, pasok:6.9970, kke:3.6434, potami:3.3670, anel:4.9544, ek:4.1335, lae:1.8539 },
    evros:             { syriza:31.8733, nd:33.6997, gd:8.7087, pasok:6.8286, kke:2.9613, potami:3.0328, anel:4.9808, ek:3.2295, lae:1.5844 },
    rhodope:           { syriza:39.3502, nd:22.7399, gd:5.4581, pasok:4.5605, kke:2.0757, potami:17.0772, anel:3.3148, ek:2.0427, lae:1.2325 },
    xanthi:            { syriza:49.6100, nd:23.8283, gd:5.5941, pasok:4.1002, kke:2.6429, potami:2.7283, anel:3.9070, ek:2.9842, lae:1.4538 },
    drama:             { syriza:29.7238, nd:31.8726, gd:7.0881, pasok:8.5477, kke:3.1025, potami:5.7942, anel:3.6842, ek:4.3399, lae:2.3797 },
    kavala:            { syriza:32.3979, nd:31.0458, gd:7.7989, pasok:6.9460, kke:4.3557, potami:3.1333, anel:4.1742, ek:4.3106, lae:2.7493 },
    kozani:            { syriza:33.8601, nd:27.8881, gd:6.1989, pasok:7.7849, kke:5.4286, potami:3.3161, anel:5.2153, ek:3.5782, lae:2.7943 },
    kastoria:          { syriza:28.9570, nd:36.9414, gd:8.5606, pasok:6.0397, kke:3.0730, potami:3.4880, anel:3.7418, ek:4.2083, lae:2.2705 },
    florina:           { syriza:37.8404, nd:30.2756, gd:6.7350, pasok:6.1070, kke:4.3095, potami:2.5537, anel:3.4957, ek:2.8036, lae:2.6882 },
    grevena:           { syriza:34.5068, nd:32.1539, gd:5.6082, pasok:9.3620, kke:6.2368, potami:2.8333, anel:2.8737, ek:2.7255, lae:1.4054 },
    ioannina:          { syriza:39.5200, nd:28.3325, gd:4.7500, pasok:7.3586, kke:5.5045, potami:3.5489, anel:2.5166, ek:2.5294, lae:2.2943 },
    arta:              { syriza:40.7562, nd:30.7691, gd:4.2078, pasok:7.0790, kke:5.7206, potami:2.1964, anel:2.3074, ek:1.8873, lae:2.6209 },
    preveza:           { syriza:35.4498, nd:32.4540, gd:5.0806, pasok:8.0206, kke:6.7574, potami:3.1607, anel:2.1630, ek:1.7299, lae:2.4285 },
    thesprotia:        { syriza:37.1222, nd:31.3940, gd:4.7161, pasok:9.1558, kke:4.4361, potami:3.0974, anel:2.3329, ek:2.0279, lae:2.4083 },
    larissa:           { syriza:34.9297, nd:27.9920, gd:7.0460, pasok:6.2525, kke:7.2485, potami:3.5424, anel:3.8699, ek:3.2516, lae:2.4353 },
    magnesia:          { syriza:36.0562, nd:26.1798, gd:8.4648, pasok:4.7876, kke:6.2360, potami:3.2835, anel:4.1583, ek:2.9883, lae:3.3223 },
    trikala:           { syriza:35.8007, nd:30.8083, gd:5.6464, pasok:7.3364, kke:7.1077, potami:3.0636, anel:2.8535, ek:2.7348, lae:1.8409 },
    karditsa:          { syriza:35.7353, nd:30.8547, gd:7.3371, pasok:7.1638, kke:6.4803, potami:2.4484, anel:2.9018, ek:2.3645, lae:1.9422 },
    aetolia_acarnania: { syriza:35.1241, nd:30.7050, gd:6.9983, pasok:8.4873, kke:6.0468, potami:2.5184, anel:2.6305, ek:1.9534, lae:2.5127 },
    boeotia:           { syriza:37.6890, nd:23.2964, gd:7.7017, pasok:6.6593, kke:6.9978, potami:3.4673, anel:3.7583, ek:2.3505, lae:4.4385 },
    phthiotis:         { syriza:34.6241, nd:31.0491, gd:7.7690, pasok:6.7297, kke:4.7796, potami:2.8240, anel:3.6710, ek:2.2697, lae:3.0933 },
    evrytania:         { syriza:33.4656, nd:34.3254, gd:4.6958, pasok:9.6046, kke:2.9394, potami:4.4753, anel:2.2781, ek:2.2266, lae:2.1678 },
    euboea:            { syriza:39.9397, nd:23.9690, gd:7.9265, pasok:6.5337, kke:5.3864, potami:3.2387, anel:3.9633, ek:2.9465, lae:2.8782 },
    phocis:            { syriza:32.9805, nd:32.1592, gd:7.0957, pasok:6.5368, kke:6.2447, potami:3.0398, anel:3.3319, ek:2.1465, lae:2.5445 },
    corinthia:         { syriza:35.0399, nd:29.6471, gd:8.6600, pasok:6.9585, kke:3.0945, potami:3.2799, anel:3.3497, ek:3.1897, lae:3.0234 },
    argolis:           { syriza:29.5110, nd:33.7152, gd:8.5452, pasok:9.5938, kke:4.2365, potami:3.3683, anel:2.5058, ek:2.3956, lae:2.8819 },
    arcadia:           { syriza:30.6737, nd:33.8129, gd:6.7514, pasok:9.9132, kke:4.9042, potami:3.1234, anel:2.7568, ek:2.4774, lae:2.5857 },
    laconia:           { syriza:23.0673, nd:37.5426, gd:11.4420, pasok:12.4106, kke:4.1016, potami:2.4733, anel:2.3418, ek:1.9512, lae:2.1824 },
    messenia:          { syriza:30.5040, nd:35.4561, gd:8.0983, pasok:5.9389, kke:5.4305, potami:2.8942, anel:2.3922, ek:2.7297, lae:3.3427 },
    elis:              { syriza:37.3055, nd:26.9173, gd:7.5863, pasok:10.7538, kke:4.6198, potami:2.1942, anel:3.2259, ek:1.9676, lae:2.9478 },
    achaea:            { syriza:41.4677, nd:22.3742, gd:5.5547, pasok:7.6331, kke:5.8191, potami:3.3704, anel:4.4230, ek:2.6408, lae:3.4826 },
    heraklion:         { syriza:45.2069, nd:20.3345, gd:3.9375, pasok:9.7225, kke:4.2403, potami:4.0002, anel:3.4599, ek:2.2031, lae:2.6924 },
    chania:            { syriza:41.6691, nd:19.3980, gd:6.1228, pasok:6.5679, kke:5.4546, potami:6.2661, anel:3.6656, ek:2.4471, lae:3.9876 },
    rethymno:          { syriza:38.1265, nd:27.3739, gd:4.0435, pasok:10.3146, kke:3.3664, potami:4.8886, anel:2.5994, ek:2.1922, lae:2.7012 },
    lasithi:           { syriza:39.1933, nd:25.9793, gd:3.9456, pasok:11.3418, kke:3.2571, potami:4.6626, anel:2.3932, ek:2.1172, lae:3.4892 },
    dodecanese:        { syriza:34.5400, nd:28.1260, gd:8.0525, pasok:9.4949, kke:3.3981, potami:3.0260, anel:4.4751, ek:2.9969, lae:2.6472 },
    cyclades:          { syriza:33.6777, nd:31.2834, gd:6.1885, pasok:6.8359, kke:4.4354, potami:3.9879, anel:3.3932, ek:3.4706, lae:3.0958 },
    lesbos:            { syriza:29.0233, nd:28.5459, gd:7.7839, pasok:7.6936, kke:10.6833, potami:3.3178, anel:4.3408, ek:2.3446, lae:3.1279 },
    samos:             { syriza:31.0142, nd:22.4750, gd:7.6594, pasok:6.0565, kke:16.1352, potami:2.4361, anel:5.4475, ek:2.4277, lae:3.0536 },
    chios:             { syriza:27.9097, nd:32.5773, gd:5.8247, pasok:13.1118, kke:5.0332, potami:3.6560, anel:3.1094, ek:3.2087, lae:2.6870 },
    corfu:             { syriza:40.5868, nd:22.1920, gd:7.5518, pasok:5.6857, kke:7.0550, potami:2.9935, anel:3.1740, ek:2.7535, lae:5.0345 },
    cephalonia:        { syriza:33.9469, nd:27.5488, gd:7.3763, pasok:5.7490, kke:10.1164, potami:3.4865, anel:2.3089, ek:2.5870, lae:3.3613 },
    lefkada:           { syriza:30.6814, nd:32.0049, gd:5.2651, pasok:7.8685, kke:10.4792, potami:2.5744, anel:2.3780, ek:2.1598, lae:3.3307 },
    zakynthos:         { syriza:36.1564, nd:27.5129, gd:6.7277, pasok:6.4590, kke:10.2010, potami:2.7369, anel:1.8611, ek:1.8163, lae:3.9610 },
  },
  // January 25, 2015 — official-results-derived vote shares for all 56 pre-2018
  // constituencies (party vote %; "other" is auto-filled to 100% by the
  // normalisation pass below, same as every other scenario here).
  "2015jan": {
    athens_a:          { syriza:33.6072, nd:30.0733, gd:7.0537, potami:7.2326, kke:6.0447, anel:4.3964, pasok:3.4701, kidiso:2.1868, ek:1.6754, teleia:1.3767 },
    athens_b:          { syriza:37.0853, nd:25.6626, gd:5.7268, potami:7.6656, kke:6.9348, anel:4.9030, pasok:3.3985, kidiso:2.0671, ek:1.7780, teleia:1.8012 },
    piraeus_a:         { syriza:34.3981, nd:29.6005, gd:7.4390, potami:6.3630, kke:5.2693, anel:5.3276, pasok:3.3480, kidiso:1.7015, ek:1.8435, teleia:2.0007 },
    piraeus_b:         { syriza:42.0566, nd:18.9664, gd:7.8036, potami:5.5262, kke:8.1763, anel:5.5643, pasok:3.1328, kidiso:1.4826, ek:1.7718, teleia:2.6311 },
    attica:            { syriza:37.0879, nd:25.9054, gd:8.4395, potami:6.1164, kke:5.3592, anel:5.9293, pasok:3.0089, kidiso:1.6103, ek:1.3992, teleia:2.4389 },
    thessaloniki_a:    { syriza:34.1193, nd:24.8426, gd:7.0733, potami:7.0007, kke:5.6112, anel:5.5809, pasok:4.1167, kidiso:1.3345, ek:5.1245, teleia:1.9387 },
    thessaloniki_b:    { syriza:31.6357, nd:29.2217, gd:7.9114, potami:6.0045, kke:5.0428, anel:5.8854, pasok:4.2877, kidiso:1.1625, ek:4.0490, teleia:1.9030 },
    chalkidiki:        { syriza:33.5148, nd:32.9962, gd:6.2421, potami:4.5376, kke:3.2275, anel:5.2134, pasok:7.1907, kidiso:0.9701, ek:2.6331, teleia:1.3230 },
    imathia:           { syriza:33.9413, nd:28.8711, gd:7.4774, potami:5.0133, kke:4.9247, anel:5.3788, pasok:5.2727, kidiso:1.8732, ek:2.5165, teleia:2.0789 },
    kilkis:            { syriza:29.4047, nd:33.0082, gd:8.5971, potami:3.6920, kke:5.9396, anel:4.1428, pasok:6.7675, kidiso:1.4329, ek:2.6559, teleia:1.4542 },
    pella:             { syriza:32.1234, nd:34.0162, gd:7.5629, potami:4.5116, kke:3.4911, anel:3.7088, pasok:5.8005, kidiso:1.8518, ek:2.6567, teleia:1.5709 },
    pieria:            { syriza:30.0128, nd:34.0748, gd:7.8187, potami:3.8686, kke:4.2519, anel:5.5650, pasok:4.9407, kidiso:2.6176, ek:2.4667, teleia:1.9678 },
    serres:            { syriza:26.2364, nd:37.4412, gd:6.4327, potami:5.7092, kke:3.7813, anel:5.5019, pasok:6.1958, kidiso:1.7366, ek:2.1400, teleia:1.6238 },
    evros:             { syriza:26.6937, nd:37.0755, gd:7.4994, potami:5.3617, kke:3.2640, anel:5.3238, pasok:6.5469, kidiso:2.2079, ek:1.7316, teleia:1.5891 },
    rhodope:           { syriza:48.5317, nd:20.5609, gd:4.8884, potami:12.6968, kke:1.8435, anel:2.6810, pasok:3.3291, kidiso:2.3337, ek:0.8075, teleia:0.7548 },
    xanthi:            { syriza:45.4264, nd:23.5589, gd:4.7879, potami:4.5125, kke:2.3878, anel:4.0591, pasok:6.4453, kidiso:3.9414, ek:1.3076, teleia:1.2364 },
    drama:             { syriza:26.6928, nd:34.5061, gd:5.9882, potami:8.3390, kke:3.0443, anel:5.0498, pasok:7.2593, kidiso:1.8941, ek:2.4323, teleia:1.8847 },
    kavala:            { syriza:31.2691, nd:31.2092, gd:7.1145, potami:5.5397, kke:4.2697, anel:5.8704, pasok:6.1154, kidiso:1.6816, ek:2.5681, teleia:1.8387 },
    kozani:            { syriza:33.1081, nd:28.1276, gd:5.2888, potami:5.7512, kke:5.2388, anel:6.7281, pasok:6.4659, kidiso:2.5383, ek:2.0839, teleia:1.7596 },
    kastoria:          { syriza:27.0771, nd:38.7813, gd:7.6713, potami:5.2437, kke:3.6293, anel:4.0845, pasok:4.8431, kidiso:2.9647, ek:1.9967, teleia:1.4960 },
    florina:           { syriza:36.2899, nd:35.0199, gd:5.0074, potami:3.5601, kke:3.7606, anel:3.9408, pasok:4.7691, kidiso:1.9733, ek:1.3805, teleia:1.6130 },
    grevena:           { syriza:31.4819, nd:33.1605, gd:5.8264, potami:3.8120, kke:6.7315, anel:2.6178, pasok:8.1170, kidiso:3.4678, ek:1.2069, teleia:1.2154 },
    ioannina:          { syriza:39.5685, nd:28.2292, gd:4.3438, potami:5.4927, kke:5.5447, anel:3.1556, pasok:5.5858, kidiso:3.1860, ek:1.1970, teleia:1.0725 },
    arta:              { syriza:44.1366, nd:30.0423, gd:3.7588, potami:3.3678, kke:5.1083, anel:2.4926, pasok:5.2650, kidiso:2.5978, ek:0.7303, teleia:0.7502 },
    preveza:           { syriza:37.9412, nd:31.7743, gd:4.6264, potami:4.3401, kke:6.1897, anel:2.7617, pasok:5.4574, kidiso:3.0657, ek:0.8032, teleia:1.0287 },
    thesprotia:        { syriza:35.9014, nd:37.6102, gd:3.6783, potami:4.3091, kke:3.7620, anel:2.4265, pasok:5.4644, kidiso:3.1892, ek:0.8110, teleia:0.6404 },
    larissa:           { syriza:36.1440, nd:27.1501, gd:6.4460, potami:5.7442, kke:6.9343, anel:4.3193, pasok:4.4876, kidiso:2.6056, ek:1.3960, teleia:2.3044 },
    magnesia:          { syriza:40.2782, nd:24.9671, gd:6.8969, potami:4.4333, kke:5.6300, anel:5.2721, pasok:3.7565, kidiso:1.8085, ek:1.3102, teleia:3.4792 },
    trikala:           { syriza:36.1610, nd:32.6016, gd:4.6388, potami:4.0559, kke:6.7732, anel:3.0353, pasok:4.0615, kidiso:3.5207, ek:1.0893, teleia:1.6933 },
    karditsa:          { syriza:38.9074, nd:30.0220, gd:6.4221, potami:3.5987, kke:6.0093, anel:3.3415, pasok:5.1237, kidiso:2.3469, ek:0.8268, teleia:1.5960 },
    aetolia_acarnania: { syriza:36.5200, nd:29.2073, gd:6.4201, potami:4.1347, kke:5.6558, anel:3.3105, pasok:6.0503, kidiso:4.8111, ek:0.8327, teleia:1.2308 },
    boeotia:           { syriza:41.5509, nd:22.6911, gd:6.6498, potami:4.5719, kke:6.9605, anel:4.8347, pasok:4.2174, kidiso:2.5022, ek:1.0581, teleia:2.2189 },
    phthiotis:         { syriza:35.7280, nd:29.0881, gd:6.2428, potami:3.9669, kke:4.2479, anel:6.0710, pasok:3.5757, kidiso:3.4099, ek:0.9403, teleia:4.1228 },
    evrytania:         { syriza:37.1338, nd:32.6967, gd:4.3797, potami:6.9931, kke:2.9006, anel:3.2237, pasok:4.3150, kidiso:3.9632, ek:1.0123, teleia:1.2708 },
    euboea:            { syriza:40.5147, nd:23.7004, gd:6.9563, potami:5.2668, kke:4.9848, anel:5.1318, pasok:5.3113, kidiso:2.4030, ek:1.2083, teleia:2.3419 },
    phocis:            { syriza:34.7746, nd:31.7616, gd:6.5464, potami:4.1165, kke:5.9321, anel:4.0186, pasok:5.0047, kidiso:2.7586, ek:0.9861, teleia:2.0191 },
    corinthia:         { syriza:36.7735, nd:29.8310, gd:7.2920, potami:5.5202, kke:2.9541, anel:4.1309, pasok:4.5801, kidiso:2.6582, ek:1.6830, teleia:2.0216 },
    argolis:           { syriza:32.2899, nd:33.7575, gd:7.3233, potami:5.0236, kke:3.5917, anel:2.9140, pasok:6.6455, kidiso:3.1854, ek:1.0629, teleia:1.7959 },
    arcadia:           { syriza:30.1323, nd:36.1321, gd:5.8305, potami:4.9497, kke:4.3525, anel:2.6457, pasok:8.2019, kidiso:3.1065, ek:1.0783, teleia:1.2257 },
    laconia:           { syriza:26.5100, nd:35.7860, gd:10.4708, potami:3.6579, kke:3.9571, anel:2.7365, pasok:10.9957, kidiso:2.0648, ek:0.7085, teleia:1.1306 },
    messenia:          { syriza:31.7631, nd:37.9566, gd:7.1994, potami:4.0481, kke:4.9364, anel:2.6839, pasok:4.2889, kidiso:2.6773, ek:0.9499, teleia:1.0599 },
    elis:              { syriza:37.8885, nd:26.8979, gd:6.0365, potami:3.7999, kke:4.1684, anel:3.7493, pasok:8.1425, kidiso:4.8286, ek:0.7189, teleia:1.6261 },
    achaea:            { syriza:43.0651, nd:20.5933, gd:4.8208, potami:5.3328, kke:5.5097, anel:5.8496, pasok:3.8942, kidiso:5.8749, ek:1.2466, teleia:1.5225 },
    heraklion:         { syriza:47.8458, nd:18.5332, gd:2.8052, potami:7.8693, kke:3.8912, anel:4.3732, pasok:5.9062, kidiso:5.0929, ek:0.9974, teleia:1.1210 },
    chania:            { syriza:43.0654, nd:19.8112, gd:4.2883, potami:12.1621, kke:4.7988, anel:5.7496, pasok:2.8704, kidiso:2.0885, ek:1.1933, teleia:1.3479 },
    rethymno:          { syriza:39.5468, nd:24.7310, gd:3.1064, potami:9.4560, kke:3.2138, anel:4.5785, pasok:6.0548, kidiso:4.5743, ek:0.9624, teleia:0.9035 },
    lasithi:           { syriza:43.4958, nd:24.8443, gd:2.8067, potami:8.0315, kke:2.9067, anel:3.1453, pasok:6.4883, kidiso:4.8498, ek:0.9181, teleia:1.0090 },
    dodecanese:        { syriza:33.2631, nd:32.5922, gd:5.5314, potami:4.8624, kke:3.3361, anel:5.3188, pasok:7.7810, kidiso:2.2729, ek:1.4069, teleia:1.7457 },
    cyclades:          { syriza:35.1180, nd:31.5862, gd:5.0676, potami:6.7641, kke:4.1470, anel:4.9916, pasok:4.8864, kidiso:1.9581, ek:1.5358, teleia:1.7739 },
    lesbos:            { syriza:32.9369, nd:30.3933, gd:4.6638, potami:4.2641, kke:10.8120, anel:5.2980, pasok:5.1176, kidiso:1.8638, ek:0.9345, teleia:1.1858 },
    samos:             { syriza:36.1691, nd:24.8540, gd:5.5356, potami:3.9517, kke:15.0788, anel:3.6517, pasok:4.0717, kidiso:2.0038, ek:1.1359, teleia:1.0399 },
    chios:             { syriza:27.1145, nd:38.8866, gd:4.6922, potami:6.3171, kke:5.5255, anel:2.4326, pasok:6.8299, kidiso:2.5640, ek:1.2403, teleia:1.5160 },
    corfu:             { syriza:44.9083, nd:21.8928, gd:5.7041, potami:4.8341, kke:6.9336, anel:5.5615, pasok:3.8799, kidiso:2.3539, ek:1.1939, teleia:0.9315 },
    cephalonia:        { syriza:38.2489, nd:28.9210, gd:6.0480, potami:3.8874, kke:9.3366, anel:3.6748, pasok:4.4427, kidiso:1.4317, ek:1.0022, teleia:0.8721 },
    lefkada:           { syriza:36.0029, nd:28.8936, gd:4.6822, potami:4.4177, kke:9.5430, anel:3.5712, pasok:4.9931, kidiso:3.1281, ek:0.9788, teleia:1.0317 },
    zakynthos:         { syriza:42.9883, nd:24.0043, gd:4.7898, potami:7.5176, kke:8.6660, anel:2.7279, pasok:3.9189, kidiso:2.0107, ek:0.6105, teleia:0.9007 },
  },
  // June 17, 2012 — full official-results-derived vote shares for all 56
  // pre-2018 constituencies (party vote %; "other" is auto-filled to 100% by
  // the normalisation pass below, same as every other scenario here).
  "2012": {
    athens_a:          { nd:30.9205, syriza:26.9576, pasok:8.7227, anel:6.3150, gd:7.8077, dimar:7.3674, kke:4.7365, dxana:2.4368, laos:1.8792, prasinoi:0.9271 },
    athens_b:          { nd:26.2213, syriza:31.4311, pasok:8.5439, anel:7.3769, gd:6.3761, dimar:7.7165, kke:5.3641, dxana:2.3123, laos:1.6862, prasinoi:1.0366 },
    piraeus_a:         { nd:29.6763, syriza:28.1489, pasok:8.4401, anel:8.8195, gd:8.2321, dimar:6.3211, kke:3.9339, dxana:1.6578, laos:1.8533, prasinoi:0.9726 },
    piraeus_b:         { nd:18.6273, syriza:36.3134, pasok:7.9388, anel:9.3458, gd:9.2758, dimar:5.7277, kke:6.5680, dxana:1.0468, laos:1.9920, prasinoi:1.0697 },
    attica:            { nd:26.4495, syriza:30.1935, pasok:7.7045, anel:9.5043, gd:9.9615, dimar:5.6208, kke:4.0911, dxana:1.8782, laos:1.8927, prasinoi:0.8961 },
    thessaloniki_a:    { nd:27.7457, syriza:26.9527, pasok:10.2297, anel:8.9198, gd:6.7843, dimar:7.4480, kke:4.4991, dxana:2.2740, laos:2.1421, prasinoi:0.9105 },
    thessaloniki_b:    { nd:31.9096, syriza:23.3969, pasok:11.1226, anel:9.1558, gd:7.7472, dimar:6.1195, kke:4.1012, dxana:1.8726, laos:1.9514, prasinoi:0.6971 },
    chalkidiki:        { nd:34.8952, syriza:22.4785, pasok:14.6392, anel:8.7717, gd:6.1976, dimar:5.3414, kke:2.7053, dxana:1.2150, laos:1.3606, prasinoi:0.6298 },
    imathia:           { nd:30.1574, syriza:23.6289, pasok:14.8636, anel:8.8049, gd:7.9203, dimar:4.9124, kke:4.2886, dxana:1.0474, laos:1.7515, prasinoi:0.6458 },
    kilkis:            { nd:36.1366, syriza:19.0216, pasok:14.2693, anel:7.1095, gd:7.7911, dimar:4.6690, kke:5.3820, dxana:1.3051, laos:1.8579, prasinoi:0.6188 },
    pella:             { nd:35.8482, syriza:18.3562, pasok:17.1754, anel:7.5477, gd:7.3465, dimar:5.2644, kke:2.7450, dxana:0.9965, laos:1.8586, prasinoi:0.5814 },
    pieria:            { nd:35.8545, syriza:18.5778, pasok:14.9889, anel:8.7327, gd:6.9794, dimar:5.7254, kke:3.4921, dxana:1.3930, laos:1.9516, prasinoi:0.6699 },
    serres:            { nd:40.1414, syriza:16.3403, pasok:14.8953, anel:7.6795, gd:7.1331, dimar:4.6032, kke:3.1798, dxana:1.3021, laos:2.1158, prasinoi:0.7658 },
    evros:             { nd:39.8173, syriza:14.9135, pasok:16.6582, anel:8.1039, gd:6.7398, dimar:4.7741, kke:2.6467, dxana:1.3069, laos:1.5565, prasinoi:0.8332 },
    rhodope:           { nd:27.2848, syriza:19.7547, pasok:20.5420, anel:4.2656, gd:4.1904, dimar:17.7426, kke:1.9298, dxana:0.8869, laos:1.0718, prasinoi:0.6832 },
    xanthi:            { nd:26.4826, syriza:38.5615, pasok:9.7446, anel:7.1339, gd:4.8909, dimar:4.3285, kke:3.3461, dxana:1.3069, laos:1.2080, prasinoi:0.7724 },
    drama:             { nd:35.8072, syriza:17.4260, pasok:16.7662, anel:10.0487, gd:5.8403, dimar:5.1238, kke:2.2290, dxana:1.8401, laos:2.0851, prasinoi:0.7838 },
    kavala:            { nd:34.5853, syriza:21.1506, pasok:14.8634, anel:8.3454, gd:6.6467, dimar:5.1547, kke:3.4870, dxana:1.4828, laos:1.5942, prasinoi:0.7902 },
    kozani:            { nd:31.7222, syriza:23.3260, pasok:14.3796, anel:8.6450, gd:5.9457, dimar:5.7187, kke:4.4142, dxana:1.1410, laos:1.4503, prasinoi:0.8991 },
    kastoria:          { nd:39.1224, syriza:17.4488, pasok:14.1270, anel:10.0109, gd:7.5648, dimar:4.0376, kke:2.3283, dxana:1.7062, laos:1.6398, prasinoi:0.3926 },
    florina:           { nd:33.9818, syriza:23.7218, pasok:15.9809, anel:6.8945, gd:5.6579, dimar:4.6365, kke:3.6839, dxana:0.9325, laos:1.3915, prasinoi:0.7632 },
    grevena:           { nd:35.3926, syriza:18.5215, pasok:19.3367, anel:4.5789, gd:5.3388, dimar:5.6118, kke:6.0353, dxana:1.2348, laos:1.6305, prasinoi:0.6926 },
    ioannina:          { nd:32.3646, syriza:27.1508, pasok:14.0680, anel:5.0872, gd:4.5926, dimar:6.3179, kke:4.9061, dxana:1.3942, laos:1.0622, prasinoi:0.7624 },
    arta:              { nd:35.8272, syriza:29.1489, pasok:12.8255, anel:4.8637, gd:4.4287, dimar:4.2288, kke:4.8637, dxana:0.6878, laos:0.8152, prasinoi:0.5624 },
    preveza:           { nd:34.1076, syriza:26.2279, pasok:14.8127, anel:4.7484, gd:5.5469, dimar:4.8840, kke:5.4364, dxana:0.9266, laos:0.7910, prasinoi:0.5826 },
    thesprotia:        { nd:34.2338, syriza:23.3169, pasok:17.4964, anel:5.3612, gd:5.2719, dimar:5.5812, kke:3.4253, dxana:1.4320, laos:1.0557, prasinoi:0.8388 },
    larissa:           { nd:30.4651, syriza:25.1212, pasok:12.7689, anel:7.1237, gd:6.5042, dimar:5.7864, kke:6.2356, dxana:1.3731, laos:1.9369, prasinoi:0.8614 },
    magnesia:          { nd:27.7781, syriza:30.6870, pasok:9.5837, anel:8.1427, gd:7.4313, dimar:5.9625, kke:4.7997, dxana:1.3812, laos:1.5615, prasinoi:0.8093 },
    trikala:           { nd:33.4668, syriza:22.8372, pasok:14.6498, anel:5.5807, gd:5.5632, dimar:7.1500, kke:6.2453, dxana:1.1010, laos:0.8817, prasinoi:0.6953 },
    karditsa:          { nd:34.4507, syriza:25.0401, pasok:13.5179, anel:5.3490, gd:6.5858, dimar:4.5659, kke:5.7617, dxana:0.8784, laos:1.2658, prasinoi:0.6069 },
    aetolia_acarnania: { nd:32.6469, syriza:25.2633, pasok:14.9033, anel:5.3046, gd:7.5944, dimar:4.9429, kke:4.9158, dxana:1.0011, laos:0.9135, prasinoi:0.6294 },
    boeotia:           { nd:24.3251, syriza:30.6634, pasok:11.5194, anel:8.3598, gd:8.7682, dimar:5.9938, kke:4.6856, dxana:1.2075, laos:1.5260, prasinoi:0.7678 },
    phthiotis:         { nd:33.2933, syriza:24.4566, pasok:13.6722, anel:7.4312, gd:7.6446, dimar:4.9840, kke:3.3689, dxana:1.2049, laos:1.5413, prasinoi:0.7908 },
    evrytania:         { nd:38.8239, syriza:20.6953, pasok:17.9662, anel:5.1787, gd:5.3216, dimar:5.6075, kke:2.2352, dxana:1.0851, laos:1.0981, prasinoi:0.7797 },
    euboea:            { nd:24.6443, syriza:29.8177, pasok:12.0623, anel:9.2761, gd:8.5512, dimar:5.4842, kke:4.0832, dxana:1.0640, laos:2.2748, prasinoi:0.7952 },
    phocis:            { nd:33.6031, syriza:23.0513, pasok:12.4737, anel:7.6616, gd:7.0518, dimar:5.3480, kke:4.9562, dxana:1.3268, laos:1.6299, prasinoi:0.6431 },
    corinthia:         { nd:31.0054, syriza:24.6741, pasok:14.2121, anel:6.9098, gd:9.9912, dimar:5.4702, kke:2.1681, dxana:1.3841, laos:1.5711, prasinoi:0.7894 },
    argolis:           { nd:36.2732, syriza:21.4873, pasok:14.4405, anel:5.5289, gd:9.4412, dimar:4.7609, kke:3.0785, dxana:1.4110, laos:1.1528, prasinoi:0.7400 },
    arcadia:           { nd:34.6443, syriza:22.9397, pasok:14.5018, anel:5.7161, gd:7.3255, dimar:5.5345, kke:3.7235, dxana:1.3371, laos:1.7310, prasinoi:0.7432 },
    laconia:           { nd:40.9898, syriza:17.4728, pasok:14.5951, anel:4.8091, gd:10.8672, dimar:3.7384, kke:3.5408, dxana:1.1109, laos:1.2456, prasinoi:0.5616 },
    messenia:          { nd:41.5938, syriza:21.5514, pasok:11.6487, anel:4.1053, gd:7.7571, dimar:4.4393, kke:4.1339, dxana:1.0437, laos:1.3610, prasinoi:0.6745 },
    elis:              { nd:30.4460, syriza:26.2079, pasok:16.5457, anel:6.0410, gd:7.6082, dimar:5.1284, kke:3.4972, dxana:0.7785, laos:1.0468, prasinoi:0.8253 },
    achaea:            { nd:25.6552, syriza:32.1743, pasok:13.4941, anel:6.7310, gd:5.9266, dimar:6.3741, kke:4.3586, dxana:1.1476, laos:1.1741, prasinoi:1.0439 },
    heraklion:         { nd:20.0530, syriza:33.6141, pasok:18.6077, anel:8.0059, gd:3.4512, dimar:7.8605, kke:2.9762, dxana:1.6029, laos:0.8471, prasinoi:1.2855 },
    chania:            { nd:20.4280, syriza:33.7658, pasok:13.7683, anel:8.3659, gd:5.4826, dimar:6.9334, kke:3.7638, dxana:2.1115, laos:1.7520, prasinoi:1.5241 },
    rethymno:          { nd:24.0956, syriza:28.2343, pasok:21.7721, anel:6.8488, gd:4.1323, dimar:6.6331, kke:2.3961, dxana:1.5568, laos:1.1190, prasinoi:1.1874 },
    lasithi:           { nd:26.7582, syriza:27.0699, pasok:23.8173, anel:6.2782, gd:2.5937, dimar:5.6526, kke:2.0861, dxana:1.9503, laos:0.7926, prasinoi:1.0976 },
    dodecanese:        { nd:32.3769, syriza:22.8780, pasok:16.6788, anel:9.5473, gd:5.9676, dimar:4.7301, kke:2.6417, dxana:1.3509, laos:0.9158, prasinoi:1.2094 },
    cyclades:          { nd:30.6106, syriza:26.6666, pasok:11.4488, anel:9.6395, gd:5.5176, dimar:7.4689, kke:2.8932, dxana:1.6204, laos:0.9943, prasinoi:0.9833 },
    lesbos:            { nd:27.7461, syriza:23.1122, pasok:14.1630, anel:7.9741, gd:5.2676, dimar:5.4604, kke:10.7492, dxana:0.8788, laos:1.2103, prasinoi:1.0780 },
    samos:             { nd:24.6116, syriza:25.4951, pasok:10.7855, anel:5.6836, gd:5.9339, dimar:4.5535, kke:18.2912, dxana:0.8614, laos:0.7877, prasinoi:0.8687 },
    chios:             { nd:34.1848, syriza:18.4299, pasok:19.0162, anel:5.7651, gd:5.0488, dimar:7.8093, kke:4.0219, dxana:1.1980, laos:1.5213, prasinoi:1.1029 },
    corfu:             { nd:24.3697, syriza:34.2110, pasok:10.5493, anel:6.9767, gd:6.5570, dimar:5.4358, kke:7.0609, dxana:1.1828, laos:0.8976, prasinoi:1.0402 },
    cephalonia:        { nd:27.6638, syriza:30.7439, pasok:10.1493, anel:5.8724, gd:7.5873, dimar:4.4578, kke:8.7675, dxana:1.2954, laos:1.0569, prasinoi:0.8307 },
    lefkada:           { nd:31.1703, syriza:26.8208, pasok:11.7737, anel:4.5609, gd:6.0855, dimar:5.3488, kke:8.5453, dxana:1.5630, laos:0.8007, prasinoi:0.8135 },
    zakynthos:         { nd:28.3366, syriza:34.7450, pasok:11.7323, anel:4.0930, gd:5.5434, dimar:4.2135, kke:7.5619, dxana:0.9985, laos:0.9641, prasinoi:0.7317 },
  },
  // May 6, 2012 — full official-results-derived vote shares for all 56
  // pre-2018 constituencies (party vote %; "other" is auto-filled to 100% by
  // the normalisation pass below, same as every other scenario here).
  "2012may": {
    athens_a:          { nd:15.7897, syriza:19.1205, pasok:9.7054, anel:8.9840, kke:8.5813, gd:8.7660, dimar:5.9914, prasinoi:3.0769, laos:3.1873, disy:2.4902, dxana:3.3679, drasi:4.3477, antarsya:1.5090 },
    athens_b:          { nd:12.3969, syriza:21.8175, pasok:9.0720, anel:11.0064, kke:9.6395, gd:6.7122, dimar:6.6050, prasinoi:3.4515, laos:2.7754, disy:2.0505, dxana:3.7688, drasi:3.4381, antarsya:1.4934 },
    piraeus_a:         { nd:16.6518, syriza:19.1646, pasok:8.6029, anel:12.5506, kke:7.6646, gd:8.8792, dimar:6.1144, prasinoi:3.3497, laos:3.2896, disy:1.7817, dxana:2.7639, drasi:1.9523, antarsya:1.0521 },
    piraeus_b:         { nd:9.7684, syriza:23.8537, pasok:8.1565, anel:12.4037, kke:12.2914, gd:9.4946, dimar:5.8674, prasinoi:3.5076, laos:3.0170, disy:1.4438, dxana:1.6363, drasi:0.8043, antarsya:1.1003 },
    attica:            { nd:13.7135, syriza:19.4014, pasok:8.2410, anel:13.5343, kke:8.7121, gd:9.7031, dimar:5.3289, prasinoi:3.0281, laos:3.6611, disy:2.2931, dxana:3.0199, drasi:2.4690, antarsya:1.0685 },
    thessaloniki_a:    { nd:14.8061, syriza:17.4561, pasok:10.4245, anel:11.5735, kke:9.3109, gd:6.9138, dimar:7.4452, prasinoi:3.2544, laos:3.7301, disy:1.6563, dxana:2.5598, drasi:2.4829, antarsya:1.0726 },
    thessaloniki_b:    { nd:20.0103, syriza:14.4222, pasok:11.2267, anel:12.0431, kke:8.8491, gd:7.8512, dimar:6.8126, prasinoi:2.6051, laos:3.8742, disy:1.3166, dxana:2.0846, drasi:1.9536, antarsya:0.7699 },
    chalkidiki:        { nd:23.1581, syriza:14.5074, pasok:15.8328, anel:12.8960, kke:5.8766, gd:6.3552, dimar:5.9517, prasinoi:2.1722, laos:2.7670, disy:1.8494, dxana:1.2433, drasi:1.0196, antarsya:0.9601 },
    imathia:           { nd:21.3893, syriza:12.9757, pasok:16.4209, anel:12.4511, kke:9.0249, gd:7.7038, dimar:5.9585, prasinoi:2.1166, laos:3.1321, disy:1.2175, dxana:0.9435, drasi:0.9012, antarsya:1.0271 },
    kilkis:            { nd:26.6211, syriza:10.6536, pasok:15.0219, anel:9.4939, kke:9.7494, gd:8.1842, dimar:5.4209, prasinoi:2.1956, laos:3.2070, disy:1.5224, dxana:1.0527, drasi:0.7574, antarsya:0.6656 },
    pella:             { nd:27.1588, syriza:9.9747, pasok:18.8466, anel:9.7710, kke:6.1046, gd:7.5767, dimar:6.5212, prasinoi:2.1408, laos:3.1274, disy:1.2149, dxana:1.3199, drasi:0.7993, antarsya:1.3641 },
    pieria:            { nd:27.1933, syriza:9.6761, pasok:16.0001, anel:12.3644, kke:7.0920, gd:6.7004, dimar:6.3827, prasinoi:1.9791, laos:3.7236, disy:1.4784, dxana:0.9555, drasi:1.3624, antarsya:0.5604 },
    serres:            { nd:30.0560, syriza:9.1495, pasok:15.9424, anel:10.6862, kke:6.1268, gd:6.7727, dimar:4.8036, prasinoi:2.5149, laos:3.5685, disy:1.8884, dxana:1.3157, drasi:1.0484, antarsya:0.7475 },
    evros:             { nd:28.7452, syriza:7.3786, pasok:18.5541, anel:11.1576, kke:5.3270, gd:6.0857, dimar:5.0321, prasinoi:2.3109, laos:3.5366, disy:2.8062, dxana:1.2173, drasi:0.7892, antarsya:1.0683 },
    rhodope:           { nd:18.2636, syriza:9.4028, pasok:26.7132, anel:5.4316, kke:4.5190, gd:3.7446, dimar:3.8724, prasinoi:1.4458, laos:2.4600, disy:17.9483, dxana:1.3426, drasi:0.5289, antarsya:0.3531 },
    xanthi:            { nd:21.8226, syriza:24.1292, pasok:12.4893, anel:7.7313, kke:4.7036, gd:4.2994, dimar:5.0144, prasinoi:1.8284, laos:2.5600, disy:5.5002, dxana:1.4648, drasi:0.7980, antarsya:0.7045 },
    drama:             { nd:25.6805, syriza:9.9688, pasok:17.7474, anel:12.1976, kke:4.9584, gd:5.0892, dimar:5.8306, prasinoi:2.4993, laos:3.4056, disy:2.0490, dxana:2.2600, drasi:1.2734, antarsya:0.7325 },
    kavala:            { nd:24.1101, syriza:14.2649, pasok:16.4996, anel:10.4574, kke:6.5910, gd:6.9938, dimar:5.5274, prasinoi:2.7314, laos:2.9928, disy:1.1790, dxana:1.9756, drasi:0.9889, antarsya:0.5284 },
    kozani:            { nd:23.2570, syriza:14.9911, pasok:14.5322, anel:10.8013, kke:8.3382, gd:5.7574, dimar:6.7021, prasinoi:2.7158, laos:2.6473, disy:1.5435, dxana:1.1733, drasi:1.1183, antarsya:1.2089 },
    kastoria:          { nd:29.7654, syriza:11.1987, pasok:12.8696, anel:13.5895, kke:5.2557, gd:7.5576, dimar:3.9492, prasinoi:1.3450, laos:2.8560, disy:1.6857, dxana:1.5228, drasi:1.5435, antarsya:1.0665 },
    florina:           { nd:29.5913, syriza:13.1591, pasok:16.3426, anel:9.0581, kke:7.9755, gd:5.6117, dimar:4.6941, prasinoi:2.3834, laos:2.2911, disy:1.7036, dxana:0.9875, drasi:0.8169, antarsya:1.0378 },
    grevena:           { nd:27.0028, syriza:10.3169, pasok:19.4828, anel:7.0979, kke:10.7850, gd:5.6054, dimar:5.9200, prasinoi:2.0680, laos:2.6051, disy:2.0219, dxana:1.0397, drasi:0.8824, antarsya:1.1932 },
    ioannina:          { nd:22.8983, syriza:17.6130, pasok:16.2098, anel:7.7953, kke:8.6635, gd:4.2257, dimar:5.9035, prasinoi:2.4835, laos:2.4542, disy:2.4996, dxana:1.4023, drasi:1.4856, antarsya:1.7592 },
    arta:              { nd:28.2815, syriza:21.6654, pasok:14.4082, anel:7.0334, kke:8.4332, gd:4.4954, dimar:3.8410, prasinoi:1.6388, laos:1.4340, disy:2.7276, dxana:0.9105, drasi:0.5671, antarsya:1.2917 },
    preveza:           { nd:26.3957, syriza:15.1001, pasok:16.8709, anel:8.0511, kke:9.6672, gd:5.9438, dimar:5.4329, prasinoi:2.1049, laos:1.7414, disy:1.7905, dxana:0.9481, drasi:0.8228, antarsya:1.6308 },
    thesprotia:        { nd:24.7986, syriza:13.8544, pasok:19.9276, anel:8.3932, kke:6.0576, gd:5.8390, dimar:6.0451, prasinoi:2.3044, laos:2.1451, disy:1.4145, dxana:1.0585, drasi:1.6736, antarsya:1.8516 },
    larissa:           { nd:21.0521, syriza:14.1290, pasok:14.2614, anel:9.8265, kke:10.9838, gd:6.0497, dimar:6.3320, prasinoi:3.0364, laos:4.0301, disy:1.4962, dxana:1.6761, drasi:1.1706, antarsya:1.3748 },
    magnesia:          { nd:20.1238, syriza:17.9973, pasok:9.9198, anel:10.7488, kke:9.5679, gd:7.0116, dimar:5.9881, prasinoi:2.7086, laos:3.0258, disy:1.3923, dxana:2.8109, drasi:0.8332, antarsya:0.9770 },
    trikala:           { nd:25.2255, syriza:11.9736, pasok:17.1299, anel:7.6236, kke:10.9434, gd:4.8998, dimar:8.5960, prasinoi:2.0878, laos:2.3190, disy:2.3569, dxana:1.0775, drasi:0.9367, antarsya:1.1995 },
    karditsa:          { nd:27.8629, syriza:14.2960, pasok:15.1677, anel:9.3500, kke:9.9035, gd:6.0209, dimar:4.3672, prasinoi:2.1291, laos:2.1302, disy:1.7892, dxana:1.2138, drasi:0.6649, antarsya:0.9290 },
    aetolia_acarnania: { nd:24.1074, syriza:15.3441, pasok:16.9479, anel:7.5228, kke:8.5247, gd:7.9168, dimar:5.4467, prasinoi:2.1089, laos:1.7490, disy:2.1791, dxana:0.9570, drasi:1.3932, antarsya:1.2937 },
    boeotia:           { nd:14.7821, syriza:19.4097, pasok:11.9564, anel:11.9564, kke:9.1177, gd:8.1964, dimar:6.6971, prasinoi:2.5268, laos:2.6697, disy:3.2765, dxana:1.5452, drasi:1.2031, antarsya:1.5124 },
    phthiotis:         { nd:24.5723, syriza:15.8493, pasok:14.8500, anel:10.7900, kke:6.4765, gd:7.3058, dimar:4.7401, prasinoi:2.5980, laos:2.5923, disy:2.1534, dxana:1.4838, drasi:0.9984, antarsya:0.9053 },
    evrytania:         { nd:20.9584, syriza:12.2170, pasok:18.9899, anel:6.2315, kke:4.1400, gd:4.1892, dimar:5.3088, prasinoi:1.7963, laos:1.5256, disy:18.2825, dxana:1.1196, drasi:0.8981, antarsya:0.8059 },
    euboea:            { nd:14.5135, syriza:18.5251, pasok:12.7994, anel:13.7956, kke:8.2941, gd:8.5782, dimar:6.1492, prasinoi:2.7116, laos:4.2132, disy:1.6563, dxana:1.3759, drasi:1.0516, antarsya:0.9384 },
    phocis:            { nd:22.3282, syriza:14.5603, pasok:13.2307, anel:12.8477, kke:8.7181, gd:7.3054, dimar:4.9100, prasinoi:2.1859, laos:2.1750, disy:1.4416, dxana:2.0233, drasi:1.5933, antarsya:0.9358 },
    corinthia:         { nd:21.2197, syriza:14.6866, pasok:15.4296, anel:9.2272, kke:4.4780, gd:11.9893, dimar:5.5209, prasinoi:2.9136, laos:2.9040, disy:1.4319, dxana:1.7414, drasi:1.3429, antarsya:1.1743 },
    argolis:           { nd:28.4162, syriza:12.8017, pasok:13.8950, anel:8.0345, kke:5.9098, gd:9.9032, dimar:5.6810, prasinoi:2.5378, laos:2.0023, disy:1.6828, dxana:1.6145, drasi:1.4222, antarsya:1.7989 },
    arcadia:           { nd:25.6028, syriza:14.6490, pasok:16.0850, anel:9.0956, kke:6.7292, gd:7.7772, dimar:5.3602, prasinoi:2.1910, laos:3.2048, disy:1.1951, dxana:1.7139, drasi:1.4790, antarsya:1.4002 },
    laconia:           { nd:32.8773, syriza:10.8471, pasok:15.3755, anel:8.0780, kke:5.9793, gd:10.1871, dimar:3.7461, prasinoi:1.9299, laos:2.4089, disy:1.2372, dxana:1.7059, drasi:1.1338, antarsya:0.9994 },
    messenia:          { nd:33.6022, syriza:13.3288, pasok:13.7411, anel:5.9856, kke:7.3306, gd:8.1588, dimar:4.4114, prasinoi:2.1380, laos:2.7199, disy:0.9436, dxana:1.4181, drasi:0.9490, antarsya:1.6689 },
    elis:              { nd:22.9983, syriza:15.1030, pasok:18.6971, anel:9.0499, kke:7.0242, gd:7.8457, dimar:5.5044, prasinoi:2.6580, laos:1.9597, disy:1.5023, dxana:1.2605, drasi:0.7565, antarsya:1.2566 },
    achaea:            { nd:17.5385, syriza:21.8210, pasok:14.1123, anel:8.8398, kke:7.9146, gd:6.3155, dimar:5.8269, prasinoi:3.4586, laos:2.6919, disy:1.4224, dxana:1.4054, drasi:1.2308, antarsya:1.2346 },
    heraklion:         { nd:9.1305, syriza:15.9048, pasok:19.2324, anel:12.8152, kke:6.4688, gd:2.6280, dimar:9.3118, prasinoi:4.2463, laos:1.7065, disy:8.1074, dxana:2.5600, drasi:0.9074, antarsya:1.2696 },
    chania:            { nd:8.4370, syriza:17.1911, pasok:13.9222, anel:9.9300, kke:7.4670, gd:4.2840, dimar:6.8075, prasinoi:4.9094, laos:2.7580, disy:13.4003, dxana:1.4764, drasi:0.8643, antarsya:1.6471 },
    rethymno:          { nd:13.0638, syriza:14.5794, pasok:20.3718, anel:9.4700, kke:4.2380, gd:2.9842, dimar:6.2425, prasinoi:3.5201, laos:1.7733, disy:12.8654, dxana:1.7713, drasi:0.7588, antarsya:0.8611 },
    lasithi:           { nd:14.0851, syriza:13.9687, pasok:23.0987, anel:8.4159, kke:4.5288, gd:2.6654, dimar:6.6492, prasinoi:3.9223, laos:1.7161, disy:8.4709, dxana:3.9838, drasi:2.0699, antarsya:0.8833 },
    dodecanese:        { nd:18.5720, syriza:11.1289, pasok:16.9922, anel:17.8120, kke:5.9544, gd:6.1330, dimar:5.9649, prasinoi:4.4136, laos:2.1156, disy:1.6178, dxana:1.3395, drasi:0.7277, antarsya:0.5842 },
    cyclades:          { nd:17.4110, syriza:17.1453, pasok:11.2527, anel:12.9271, kke:6.4581, gd:6.3028, dimar:8.6258, prasinoi:3.1241, laos:2.5219, disy:2.1214, dxana:2.9579, drasi:1.4647, antarsya:0.9837 },
    lesbos:            { nd:18.6310, syriza:14.6857, pasok:13.5322, anel:11.8520, kke:16.7880, gd:4.6638, dimar:5.5015, prasinoi:3.3299, laos:2.1345, disy:1.5884, dxana:0.8329, drasi:0.7942, antarsya:1.3758 },
    samos:             { nd:17.1548, syriza:14.2671, pasok:11.9041, anel:8.5216, kke:24.7349, gd:5.0794, dimar:4.9008, prasinoi:2.5007, laos:2.1471, disy:0.8187, dxana:0.9526, drasi:0.8856, antarsya:1.1945 },
    chios:             { nd:24.1624, syriza:10.8858, pasok:18.7816, anel:7.1382, kke:7.2313, gd:4.1854, dimar:9.3147, prasinoi:4.6387, laos:3.3409, disy:1.6642, dxana:1.0495, drasi:1.7419, antarsya:1.1674 },
    corfu:             { nd:18.2984, syriza:19.4004, pasok:11.8359, anel:8.9498, kke:12.8177, gd:7.2713, dimar:5.6601, prasinoi:3.4851, laos:2.1846, disy:1.3806, dxana:1.0715, drasi:0.9690, antarsya:1.4831 },
    cephalonia:        { nd:18.0252, syriza:18.8824, pasok:11.7136, anel:7.9775, kke:15.0291, gd:7.8683, dimar:4.3668, prasinoi:2.4664, laos:1.9489, disy:1.2939, dxana:1.8033, drasi:1.4718, antarsya:1.3545 },
    lefkada:           { nd:25.2539, syriza:16.0276, pasok:13.9903, anel:6.7766, kke:13.2086, gd:5.5518, dimar:4.3516, prasinoi:2.3574, laos:1.3479, disy:1.0525, dxana:1.6865, drasi:1.2248, antarsya:3.0836 },
    zakynthos:         { nd:21.0388, syriza:16.0279, pasok:15.6025, anel:5.3809, kke:13.1822, gd:6.1126, dimar:4.9768, prasinoi:2.4501, laos:2.0588, disy:1.7780, dxana:1.2251, drasi:5.4660, antarsya:1.2846 },
  },
};

export const GR_MULTIPLIERS = {
  athens_a:          { nd:0.82, syriza:1.35, pasok:0.89, kke:1.41, el:0.83, na:1.40, mera25:1.52, pe:1.20, fl:0.90, niki:0.78 },
  athens_b1:         { nd:1.04, syriza:0.94, pasok:0.78, kke:0.94, el:1.02, na:1.10, mera25:1.28, pe:0.88, fl:1.00, niki:0.84 },
  athens_b2:         { nd:0.77, syriza:1.28, pasok:0.77, kke:1.58, el:1.08, na:1.35, mera25:1.42, pe:1.10, fl:0.78, niki:0.70 },
  athens_b3:         { nd:1.00, syriza:1.00, pasok:0.83, kke:1.02, el:0.97, na:1.10, mera25:1.18, pe:0.92, fl:0.97, niki:0.82 },
  piraeus_a:         { nd:1.02, syriza:0.88, pasok:0.71, kke:1.01, el:1.32, na:0.90, mera25:1.08, pe:0.88, fl:1.00, niki:0.87, spartans:1.10 },
  piraeus_b:         { nd:0.81, syriza:1.15, pasok:0.69, kke:1.49, el:1.22, na:1.15, mera25:1.28, pe:0.98, fl:0.78, niki:0.73, spartans:1.10 },
  east_attica:       { nd:1.09, syriza:0.83, pasok:0.80, kke:0.87, el:1.31, na:0.75, mera25:1.01, pe:0.79, fl:1.05, niki:0.92, spartans:1.12 },
  west_attica:       { nd:0.89, syriza:1.08, pasok:0.75, kke:1.41, el:1.53, na:0.95, mera25:1.18, pe:0.95, fl:0.78, niki:0.76, spartans:1.27 },
  thessaloniki_a:    { nd:0.84, syriza:1.04, pasok:0.79, kke:1.18, el:1.42, na:0.95, mera25:1.18, pe:1.01, fl:0.89, niki:1.35 },
  thessaloniki_b:    { nd:1.01, syriza:0.80, pasok:0.72, kke:0.88, el:1.82, na:0.75, mera25:0.95, pe:0.82, fl:0.98, niki:1.68 },
  chalkidiki:        { nd:1.36, syriza:0.50, pasok:0.78, kke:0.55, el:1.44, na:0.45, mera25:0.68, pe:0.57, fl:0.83, niki:1.57 },
  imathia:           { nd:1.30, syriza:0.57, pasok:0.83, kke:0.66, el:1.62, na:0.45, mera25:0.61, pe:0.63, fl:0.78, niki:1.73 },
  kilkis:            { nd:1.42, syriza:0.45, pasok:0.91, kke:0.51, el:1.49, na:0.40, mera25:0.51, pe:0.47, fl:0.69, niki:1.87 },
  pella:             { nd:1.37, syriza:0.53, pasok:0.86, kke:0.60, el:1.58, na:0.42, mera25:0.57, pe:0.57, fl:0.69, niki:1.65 },
  pieria:            { nd:1.43, syriza:0.48, pasok:0.77, kke:0.56, el:1.46, na:0.40, mera25:0.57, pe:0.54, fl:0.69, niki:1.95 },
  serres:            { nd:1.53, syriza:0.42, pasok:0.69, kke:0.49, el:1.33, na:0.35, mera25:0.51, pe:0.47, fl:0.69, niki:1.38 },
  evros:             { nd:1.50, syriza:0.44, pasok:0.77, kke:0.51, el:1.60, na:0.35, mera25:0.51, pe:0.47, fl:0.69, niki:1.49 },
  rhodope:           { nd:0.61, syriza:1.41, pasok:2.22, kke:0.36, el:0.70, na:0.40, mera25:0.74, pe:0.88, fl:0.55, niki:0.49, elpida:0.71, elas:1.76 },
  xanthi:            { nd:0.68, syriza:1.22, pasok:2.03, kke:0.45, el:0.81, na:0.45, mera25:0.68, pe:0.92, fl:0.55, niki:0.57, elpida:0.61, elas:1.53 },
  drama:             { nd:1.36, syriza:0.48, pasok:0.88, kke:0.55, el:1.51, na:0.40, mera25:0.57, pe:0.54, fl:0.69, niki:1.60 },
  kavala:            { nd:1.35, syriza:0.51, pasok:0.78, kke:0.62, el:1.40, na:0.42, mera25:0.64, pe:0.57, fl:0.69, niki:1.35 },
  kozani:            { nd:1.34, syriza:0.55, pasok:0.74, kke:0.68, el:1.37, na:0.42, mera25:0.61, pe:0.60, fl:0.78, niki:1.41 },
  kastoria:          { nd:1.49, syriza:0.40, pasok:0.68, kke:0.45, el:1.53, na:0.35, mera25:0.51, pe:0.47, fl:0.69, niki:1.63 },
  florina:           { nd:1.38, syriza:0.51, pasok:0.75, kke:0.53, el:1.46, na:0.38, mera25:0.54, pe:0.54, fl:0.69, niki:1.49 },
  grevena:           { nd:1.44, syriza:0.45, pasok:0.71, kke:0.49, el:1.40, na:0.35, mera25:0.51, pe:0.50, fl:0.69, niki:1.41 },
  ioannina:          { nd:1.02, syriza:1.02, pasok:1.00, kke:0.94, el:0.92, na:0.75, mera25:0.95, pe:0.98, fl:0.78, niki:0.76 },
  arta:              { nd:0.94, syriza:1.36, pasok:1.02, kke:1.01, el:0.86, na:0.75, mera25:1.01, pe:1.10, fl:0.69, niki:0.68 },
  preveza:           { nd:1.10, syriza:0.98, pasok:1.08, kke:0.88, el:0.88, na:0.65, mera25:0.85, pe:0.88, fl:0.69, niki:0.76 },
  thesprotia:        { nd:1.24, syriza:0.79, pasok:1.06, kke:0.68, el:0.92, na:0.55, mera25:0.68, pe:0.76, fl:0.69, niki:0.81 },
  larissa:           { nd:1.08, syriza:0.83, pasok:0.91, kke:1.05, el:1.40, na:0.65, mera25:0.85, pe:0.79, fl:0.89, niki:1.11 },
  magnesia:          { nd:0.97, syriza:0.97, pasok:0.80, kke:1.27, el:1.33, na:0.75, mera25:0.95, pe:0.88, fl:0.78, niki:0.95 },
  trikala:           { nd:1.24, syriza:0.72, pasok:0.95, kke:0.55, el:1.08, na:0.55, mera25:0.68, pe:0.73, fl:0.78, niki:0.95 },
  karditsa:          { nd:1.35, syriza:0.57, pasok:0.91, kke:0.55, el:1.02, na:0.48, mera25:0.61, pe:0.66, fl:0.69, niki:0.87 },
  aetolia_acarnania: { nd:1.05, syriza:0.89, pasok:1.19, kke:1.01, el:1.02, na:0.65, mera25:0.85, pe:0.88, fl:0.78, niki:0.81 },
  boeotia:           { nd:0.92, syriza:1.13, pasok:1.00, kke:1.37, el:1.10, na:0.75, mera25:1.01, pe:0.92, fl:0.78, niki:0.84 },
  phthiotis:         { nd:1.34, syriza:0.55, pasok:0.80, kke:0.75, el:1.31, na:0.45, mera25:0.64, pe:0.60, fl:0.78, niki:1.33 },
  evrytania:         { nd:1.48, syriza:0.48, pasok:0.97, kke:0.55, el:1.02, na:0.38, mera25:0.54, pe:0.57, fl:0.69, niki:0.95 },
  euboea:            { nd:0.98, syriza:1.02, pasok:0.97, kke:1.27, el:1.24, na:0.75, mera25:0.95, pe:0.88, fl:0.83, niki:0.87 },
  phocis:            { nd:1.38, syriza:0.53, pasok:0.91, kke:0.68, el:1.08, na:0.45, mera25:0.61, pe:0.60, fl:0.69, niki:1.03 },
  corinthia:         { nd:1.30, syriza:0.59, pasok:0.78, kke:0.77, el:1.40, na:0.45, mera25:0.74, pe:0.63, fl:0.83, niki:1.30 },
  argolis:           { nd:1.38, syriza:0.52, pasok:0.80, kke:0.68, el:1.37, na:0.42, mera25:0.68, pe:0.60, fl:0.78, niki:1.22 },
  arcadia:           { nd:1.43, syriza:0.48, pasok:0.83, kke:0.62, el:1.31, na:0.40, mera25:0.61, pe:0.57, fl:0.75, niki:1.14 },
  laconia:           { nd:1.54, syriza:0.42, pasok:0.74, kke:0.53, el:1.24, na:0.35, mera25:0.51, pe:0.50, fl:0.89, niki:1.03 },
  messenia:          { nd:1.39, syriza:0.55, pasok:0.80, kke:0.62, el:1.17, na:0.40, mera25:0.61, pe:0.63, fl:0.78, niki:0.95 },
  elis:              { nd:0.95, syriza:0.94, pasok:1.93, kke:0.94, el:0.86, na:0.55, mera25:0.74, pe:0.79, fl:0.69, niki:0.76 },
  achaea:            { nd:0.80, syriza:1.39, pasok:1.06, kke:1.20, el:1.02, na:0.85, mera25:1.08, pe:1.10, fl:0.78, niki:0.81 },
  heraklion:         { nd:0.79, syriza:1.26, pasok:1.73, kke:0.88, el:0.72, na:0.85, mera25:1.28, pe:1.01, fl:0.69, niki:0.68 },
  chania:            { nd:0.92, syriza:1.11, pasok:1.37, kke:0.97, el:0.68, na:0.85, mera25:1.18, pe:1.73, fl:0.69, niki:0.62 },
  rethymno:          { nd:0.88, syriza:1.15, pasok:1.84, kke:0.84, el:0.65, na:0.80, mera25:1.08, pe:1.10, fl:0.61, niki:0.60 },
  lasithi:           { nd:0.90, syriza:1.08, pasok:1.70, kke:0.88, el:0.70, na:0.80, mera25:1.01, pe:1.01, fl:0.61, niki:0.62 },
  dodecanese:        { nd:1.29, syriza:0.61, pasok:1.08, kke:0.59, el:1.31, na:0.55, mera25:0.68, pe:0.69, fl:0.78, niki:1.08, spartans:0.97 },
  cyclades:          { nd:1.35, syriza:0.53, pasok:0.83, kke:0.55, el:1.24, na:0.50, mera25:0.61, pe:0.63, fl:0.78, niki:1.03 },
  lesbos:            { nd:0.92, syriza:0.94, pasok:1.23, kke:1.80, el:0.95, na:0.85, mera25:0.95, pe:1.10, fl:0.69, niki:0.76 },
  samos:             { nd:0.84, syriza:0.98, pasok:1.08, kke:2.13, el:0.91, na:0.85, mera25:1.01, pe:1.01, fl:0.69, niki:0.68 },
  chios:             { nd:1.30, syriza:0.53, pasok:1.37, kke:0.79, el:1.02, na:0.55, mera25:0.74, pe:0.79, fl:0.69, niki:0.87 },
  corfu:             { nd:0.91, syriza:1.21, pasok:1.06, kke:1.40, el:0.79, na:0.80, mera25:1.18, pe:1.42, fl:0.69, niki:0.68 },
  cephalonia:        { nd:0.99, syriza:1.04, pasok:0.97, kke:1.33, el:0.86, na:0.75, mera25:1.01, pe:1.10, fl:0.69, niki:0.68 },
  lefkada:           { nd:1.20, syriza:0.76, pasok:0.95, kke:1.11, el:0.95, na:0.65, mera25:0.74, pe:0.88, fl:0.69, niki:0.81 },
  zakynthos:         { nd:1.05, syriza:0.91, pasok:1.06, kke:1.24, el:0.91, na:0.75, mera25:1.01, pe:1.01, fl:0.69, niki:0.76 },
};

function generateDerivedBaseline(targetScenario) {
  const derived = {};
  const targetParties = GR_SCENARIOS[targetScenario];
  const base2023 = GR_SCENARIOS["2023"];
  const distKeys = Object.keys(GR_DISTRICT_BASELINES["2023"]);

  for (let i = 0; i < distKeys.length; i++) {
    const distId = distKeys[i];
    const dist2023 = GR_DISTRICT_BASELINES["2023"][distId];
    const newDist = {};

    for (let j = 0; j < targetParties.length; j++) {
      const tp = targetParties[j];
      if (tp.id === "other") continue;

      let lineageId = tp.id;
      if (dist2023[lineageId] === undefined && GR_PARTY_LINEAGE[tp.id]) lineageId = GR_PARTY_LINEAGE[tp.id];

      const bp = base2023.find(p => p.id === lineageId) || { basePercentage: 0.1 };
      const bpPct = Math.max(0.001, bp.basePercentage);
      const targetPct = Math.max(0.001, tp.basePercentage);
      const logitSwing = grToLogit(targetPct) - grToLogit(bpPct);
      const distBasePct = Math.max(0.001, dist2023[lineageId] || bpPct);
      newDist[tp.id] = grFromLogit(grToLogit(distBasePct) + logitSwing);
    }
    derived[distId] = newDist;
  }
  return derived;
}

GR_DISTRICT_BASELINES["2026"] = generateDerivedBaseline("2026");

const scenarioKeys = Object.keys(GR_DISTRICT_BASELINES);
for (let i = 0; i < scenarioKeys.length; i++) {
  const scenario = GR_DISTRICT_BASELINES[scenarioKeys[i]];
  const districtKeys = Object.keys(scenario);
  for (let j = 0; j < districtKeys.length; j++) {
    const d = scenario[districtKeys[j]];
    let sum = 0;
    const pKeys = Object.keys(d);
    for (let k = 0; k < pKeys.length; k++) { if (pKeys[k] !== 'other') sum += d[pKeys[k]]; }
    if (sum < 100) d['other'] = Math.round((100 - sum) * 100) / 100;
    else { const factor = 100 / sum; for (let k = 0; k < pKeys.length; k++) d[pKeys[k]] = Math.round((d[pKeys[k]] * factor) * 100) / 100; d['other'] = 0; }
  }
}

// athens_b / attica keys (below, in both tables) are only ever looked up by the
// "2015" scenario's merged constituencies; they are the population/registered
// sums of their 2018+ sub-districts (athens_b1+b2+b3, east_attica+west_attica)
// and don't affect the current 59-district scenarios, which never reference them.
export const GR_DISTRICT_POP = { athens_a:430362, athens_b:557407+405623+636474, athens_b1:557407, athens_b2:405623, athens_b3:636474, piraeus_a:182667, piraeus_b:274730, attica:403714+148548, east_attica:403714, west_attica:148548, thessaloniki_a:568576, thessaloniki_b:316369, chalkidiki:104702, imathia:136602, kilkis:85885, pella:138568, pieria:123245, serres:182226, evros:134776, rhodope:101767, xanthi:107548, drama:95701, kavala:129872, kozani:149733, kastoria:48464, florina:50921, grevena:34538, ioannina:163044, arta:79776, preveza:62769, thesprotia:47947, larissa:268451, magnesia:181879, trikala:139562, karditsa:129171, aetolia_acarnania:235371, boeotia:109293, phthiotis:151036, evrytania:24545, euboea:213179, phocis:39800, corinthia:136401, argolis:93934, arcadia:96092, laconia:87104, messenia:161953, elis:168358, achaea:296574, heraklion:285528, chania:144259, rethymno:79801, lasithi:73258, dodecanese:180591, cyclades:122738, lesbos:97824, samos:42202, chios:52096, corfu:97037, cephalonia:41069, lefkada:25365, zakynthos:38340 };

export const GR_DISTRICT_REGISTERED = { athens_a:461126, athens_b:517490+368423+611098, athens_b1:517490, athens_b2:368423, athens_b3:611098, piraeus_a:188526, piraeus_b:267597, attica:372792+134892, east_attica:372792, west_attica:134892, thessaloniki_a:533828, thessaloniki_b:298404, chalkidiki:103802, imathia:134945, kilkis:101234, pella:145074, pieria:131383, serres:220885, evros:163523, rhodope:118451, xanthi:120540, drama:113994, kavala:142042, kozani:160101, kastoria:61818, florina:87213, grevena:40176, ioannina:169865, arta:76764, preveza:66037, thesprotia:62141, larissa:251840, magnesia:174972, trikala:144122, karditsa:125868, aetolia_acarnania:234323, boeotia:105163, phthiotis:143722, evrytania:29607, euboea:199635, phocis:41649, corinthia:139566, argolis:94378, arcadia:122300, laconia:122102, messenia:191340, elis:166599, achaea:281055, heraklion:259363, chania:147020, rethymno:73554, lasithi:69324, dodecanese:199774, cyclades:128612, lesbos:130311, samos:50797, chios:63148, corfu:106539, cephalonia:54600, lefkada:28876, zakynthos:41218 };

export const GR_DISTRICT_TURNOUT = {
  "2023": { athens_a:0, athens_b1:0, athens_b2:0, athens_b3:0, piraeus_a:0, piraeus_b:0, east_attica:0, west_attica:0, thessaloniki_a:0, thessaloniki_b:0, chalkidiki:0, imathia:0, kilkis:0, pella:0, pieria:0, serres:0, evros:0, rhodope:0, xanthi:0, drama:0, kavala:0, kozani:0, kastoria:0, florina:0, grevena:0, ioannina:0, arta:0, preveza:0, thesprotia:0, larissa:0, magnesia:0, trikala:0, karditsa:0, aetolia_acarnania:0, boeotia:0, phthiotis:0, evrytania:0, euboea:0, phocis:0, corinthia:0, argolis:0, arcadia:0, laconia:0, messenia:0, elis:0, achaea:0, heraklion:0, chania:0, rethymno:0, lasithi:0, dodecanese:0, cyclades:0, lesbos:0, samos:0, chios:0, corfu:0, cephalonia:0, lefkada:0, zakynthos:0 },
  "2019": { athens_a:0, athens_b1:0, athens_b2:0, athens_b3:0, piraeus_a:0, piraeus_b:0, east_attica:0, west_attica:0, thessaloniki_a:0, thessaloniki_b:0, chalkidiki:0, imathia:0, kilkis:0, pella:0, pieria:0, serres:0, evros:0, rhodope:0, xanthi:0, drama:0, kavala:0, kozani:0, kastoria:0, florina:0, grevena:0, ioannina:0, arta:0, preveza:0, thesprotia:0, larissa:0, magnesia:0, trikala:0, karditsa:0, aetolia_acarnania:0, boeotia:0, phthiotis:0, evrytania:0, euboea:0, phocis:0, corinthia:0, argolis:0, arcadia:0, laconia:0, messenia:0, elis:0, achaea:0, heraklion:0, chania:0, rethymno:0, lasithi:0, dodecanese:0, cyclades:0, lesbos:0, samos:0, chios:0, corfu:0, cephalonia:0, lefkada:0, zakynthos:0 },
  "2026": { athens_a:0, athens_b1:0, athens_b2:0, athens_b3:0, piraeus_a:0, piraeus_b:0, east_attica:0, west_attica:0, thessaloniki_a:0, thessaloniki_b:0, chalkidiki:0, imathia:0, kilkis:0, pella:0, pieria:0, serres:0, evros:0, rhodope:0, xanthi:0, drama:0, kavala:0, kozani:0, kastoria:0, florina:0, grevena:0, ioannina:0, arta:0, preveza:0, thesprotia:0, larissa:0, magnesia:0, trikala:0, karditsa:0, aetolia_acarnania:0, boeotia:0, phthiotis:0, evrytania:0, euboea:0, phocis:0, corinthia:0, argolis:0, arcadia:0, laconia:0, messenia:0, elis:0, achaea:0, heraklion:0, chania:0, rethymno:0, lasithi:0, dodecanese:0, cyclades:0, lesbos:0, samos:0, chios:0, corfu:0, cephalonia:0, lefkada:0, zakynthos:0 }
};

// Optional: exact valid-vote COUNTS per constituency, per scenario. If present for a
// district, it overrides the population×turnout estimate and makes the §8 ranking exact.
// athens_b / attica keys are the sums of their post-2018 sub-districts (b1+b2+b3,
// east+west) — only ever looked up by the 2015 scenarios' merged 56-district map, so
// the §8 cross-district measure stays on ONE consistent scale (valid votes) instead of
// mixing valid votes with registered rolls, which roughly doubled the merged districts'
// remainder weights and misplaced their marginal seats.
export const GR_DISTRICT_VALID_VOTES = {
  "2023": { athens_b:322021+206177+350880, attica:223582+71096, athens_a:219108, athens_b1:322021, athens_b2:206177, athens_b3:350880, piraeus_a:93353, piraeus_b:136708, east_attica:223582, west_attica:71096, thessaloniki_a:290372, thessaloniki_b:178438, chalkidiki:57582, imathia:74601, kilkis:48988, pella:79149, pieria:70184, serres:99419, evros:76538, rhodope:54623, xanthi:55237, drama:52794, kavala:69997, kozani:83907, kastoria:27188, florina:28899, grevena:19418, ioannina:88908, arta:42248, preveza:34062, thesprotia:27031, larissa:143764, magnesia:95863, trikala:75998, karditsa:67475, aetolia_acarnania:117551, boeotia:57876, phthiotis:83681, evrytania:12055, euboea:108917, phocis:21713, corinthia:75793, argolis:51360, arcadia:52382, laconia:47237, messenia:89339, elis:79694, achaea:152287, heraklion:155125, chania:78758, rethymno:43725, lasithi:39453, dodecanese:90496, cyclades:66558, lesbos:52863, samos:22709, chios:28498, corfu:49778, cephalonia:20886, lefkada:13611, zakynthos:19956 },
  "2015": { athens_a:248622, athens_b:892894, piraeus_a:101295, piraeus_b:150213, attica:290000, thessaloniki_a:302358, thessaloniki_b:181758, chalkidiki:61328, imathia:79368, kilkis:54828, pella:82554, pieria:72237, serres:111819, evros:83882, rhodope:60607, xanthi:57436, drama:56729, kavala:75511, kozani:88145, kastoria:29157, florina:31210, grevena:22271, ioannina:93578, arta:45939, preveza:35783, thesprotia:27862, larissa:149589, magnesia:100593, trikala:80884, karditsa:73885, aetolia_acarnania:123172, boeotia:63220, phthiotis:89484, evrytania:13608, euboea:115662, phocis:23620, corinthia:78753, argolis:52638, arcadia:57277, laconia:50175, messenia:93637, elis:85588, achaea:160368, heraklion:154919, chania:78869, rethymno:42241, lasithi:38777, dodecanese:89227, cyclades:64571, lesbos:54253, samos:23644, chios:28173, corfu:53749, cephalonia:21569, lefkada:13751, zakynthos:20096 },
  "2015jan": { athens_a:283936, athens_b:1026555, piraeus_a:118309, piraeus_b:178405, attica:337698, thessaloniki_a:346880, thessaloniki_b:205679, chalkidiki:69993, imathia:91396, kilkis:60997, pella:95043, pieria:82175, serres:124956, evros:89860, rhodope:66505, xanthi:64621, drama:63725, kavala:85276, kozani:99909, kastoria:32954, florina:34409, grevena:23531, ioannina:102008, arta:50389, preveza:39469, thesprotia:31074, larissa:169981, magnesia:115400, trikala:90238, karditsa:81640, aetolia_acarnania:141944, boeotia:73055, phthiotis:100708, evrytania:13928, euboea:132584, phocis:25556, corinthia:91264, argolis:61530, arcadia:63802, laconia:54485, messenia:105481, elis:98766, achaea:185944, heraklion:177169, chania:89919, rethymno:47483, lasithi:44002, dodecanese:102994, cyclades:68435, lesbos:59286, samos:25002, chios:31201, corfu:61728, cephalonia:23049, lefkada:15121, zakynthos:23425 },
  "2012": { athens_a:287997, athens_b:998870, piraeus_a:119678, piraeus_b:174346, attica:322603, thessaloniki_a:339580, thessaloniki_b:201698, chalkidiki:69382, imathia:90893, kilkis:63675, pella:94426, pieria:82701, serres:129410, evros:94572, rhodope:69229, xanthi:64733, drama:65322, kavala:87066, kozani:100879, kastoria:33114, florina:34854, grevena:25268, ioannina:102708, arta:51031, preveza:39824, thesprotia:31355, larissa:164956, magnesia:115404, trikala:91189, karditsa:82875, aetolia_acarnania:140445, boeotia:73459, phthiotis:101666, evrytania:15390, euboea:133548, phocis:27057, corinthia:91971, argolis:60808, arcadia:64992, laconia:57163, messenia:108081, elis:98394, achaea:181250, heraklion:171999, chania:87331, rethymno:46826, lasithi:44917, dodecanese:103191, cyclades:72514, lesbos:61223, samos:27166, chios:31552, corfu:61720, cephalonia:24317, lefkada:15611, zakynthos:23235 },
  "2012may": { athens_a:291786, athens_b:1024000, piraeus_a:123086, piraeus_b:180777, attica:329245, thessaloniki_a:348303, thessaloniki_b:206134, chalkidiki:70619, imathia:94538, kilkis:65358, pella:97206, pieria:85293, serres:133920, evros:95289, rhodope:68820, xanthi:66289, drama:67300, kavala:88378, kozani:103728, kastoria:33754, florina:35747, grevena:26064, ioannina:105615, arta:52720, preveza:40715, thesprotia:32026, larissa:172900, magnesia:118218, trikala:95126, karditsa:87080, aetolia_acarnania:146714, boeotia:76302, phthiotis:105273, evrytania:16256, euboea:136928, phocis:27678, corinthia:94351, argolis:62929, arcadia:67274, laconia:58034, messenia:110850, elis:102973, achaea:188488, heraklion:178085, chania:90826, rethymno:48891, lasithi:45509, dodecanese:105266, cyclades:73396, lesbos:62074, samos:26873, chios:32207, corfu:62437, cephalonia:24732, lefkada:16247, zakynthos:23509 },
};

// Parties that qualified (>3%) but did NOT legally file a State-Deputy (Επικρατείας)
// ballot, so they are barred from State seats; their seat passes to the next party by
// remainder. June 2023: "Spartans" filed no state ballot (Areios Pagos decision 174/2023).
export const GR_STATE_BALLOT_EXCLUDED = { "2023": ["spartans"] };