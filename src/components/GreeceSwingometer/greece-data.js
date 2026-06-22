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
  el:         { name:"EL",         fullName:"Greek Solution",             color:"#6BB6E6", ideology: 3, sensitivities:{ youth: -0.250, seniors:  0.250, urban: -0.150, education: -0.250, precarity:  0.150, gender: -0.200 } },
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
};

export const GR_SCENARIO_LABELS  = { "2026":"May 2026 Polling", "2023":"June 2023", "2019":"July 2019" };
export const GR_SCENARIO_TURNOUT = { "2026":5_500_000, "2023":5_273_699, "2019":5_769_542 };
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
  }
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

export const GR_DISTRICT_POP = { athens_a:430362, athens_b1:557407, athens_b2:405623, athens_b3:636474, piraeus_a:182667, piraeus_b:274730, east_attica:403714, west_attica:148548, thessaloniki_a:568576, thessaloniki_b:316369, chalkidiki:104702, imathia:136602, kilkis:85885, pella:138568, pieria:123245, serres:182226, evros:134776, rhodope:101767, xanthi:107548, drama:95701, kavala:129872, kozani:149733, kastoria:48464, florina:50921, grevena:34538, ioannina:163044, arta:79776, preveza:62769, thesprotia:47947, larissa:268451, magnesia:181879, trikala:139562, karditsa:129171, aetolia_acarnania:235371, boeotia:109293, phthiotis:151036, evrytania:24545, euboea:213179, phocis:39800, corinthia:136401, argolis:93934, arcadia:96092, laconia:87104, messenia:161953, elis:168358, achaea:296574, heraklion:285528, chania:144259, rethymno:79801, lasithi:73258, dodecanese:180591, cyclades:122738, lesbos:97824, samos:42202, chios:52096, corfu:97037, cephalonia:41069, lefkada:25365, zakynthos:38340 };

export const GR_DISTRICT_REGISTERED = { athens_a:461126, athens_b1:517490, athens_b2:368423, athens_b3:611098, piraeus_a:188526, piraeus_b:267597, east_attica:372792, west_attica:134892, thessaloniki_a:533828, thessaloniki_b:298404, chalkidiki:103802, imathia:134945, kilkis:101234, pella:145074, pieria:131383, serres:220885, evros:163523, rhodope:118451, xanthi:120540, drama:113994, kavala:142042, kozani:160101, kastoria:61818, florina:87213, grevena:40176, ioannina:169865, arta:76764, preveza:66037, thesprotia:62141, larissa:251840, magnesia:174972, trikala:144122, karditsa:125868, aetolia_acarnania:234323, boeotia:105163, phthiotis:143722, evrytania:29607, euboea:199635, phocis:41649, corinthia:139566, argolis:94378, arcadia:122300, laconia:122102, messenia:191340, elis:166599, achaea:281055, heraklion:259363, chania:147020, rethymno:73554, lasithi:69324, dodecanese:199774, cyclades:128612, lesbos:130311, samos:50797, chios:63148, corfu:106539, cephalonia:54600, lefkada:28876, zakynthos:41218 };

export const GR_DISTRICT_TURNOUT = {
  "2023": { athens_a:0, athens_b1:0, athens_b2:0, athens_b3:0, piraeus_a:0, piraeus_b:0, east_attica:0, west_attica:0, thessaloniki_a:0, thessaloniki_b:0, chalkidiki:0, imathia:0, kilkis:0, pella:0, pieria:0, serres:0, evros:0, rhodope:0, xanthi:0, drama:0, kavala:0, kozani:0, kastoria:0, florina:0, grevena:0, ioannina:0, arta:0, preveza:0, thesprotia:0, larissa:0, magnesia:0, trikala:0, karditsa:0, aetolia_acarnania:0, boeotia:0, phthiotis:0, evrytania:0, euboea:0, phocis:0, corinthia:0, argolis:0, arcadia:0, laconia:0, messenia:0, elis:0, achaea:0, heraklion:0, chania:0, rethymno:0, lasithi:0, dodecanese:0, cyclades:0, lesbos:0, samos:0, chios:0, corfu:0, cephalonia:0, lefkada:0, zakynthos:0 },
  "2019": { athens_a:0, athens_b1:0, athens_b2:0, athens_b3:0, piraeus_a:0, piraeus_b:0, east_attica:0, west_attica:0, thessaloniki_a:0, thessaloniki_b:0, chalkidiki:0, imathia:0, kilkis:0, pella:0, pieria:0, serres:0, evros:0, rhodope:0, xanthi:0, drama:0, kavala:0, kozani:0, kastoria:0, florina:0, grevena:0, ioannina:0, arta:0, preveza:0, thesprotia:0, larissa:0, magnesia:0, trikala:0, karditsa:0, aetolia_acarnania:0, boeotia:0, phthiotis:0, evrytania:0, euboea:0, phocis:0, corinthia:0, argolis:0, arcadia:0, laconia:0, messenia:0, elis:0, achaea:0, heraklion:0, chania:0, rethymno:0, lasithi:0, dodecanese:0, cyclades:0, lesbos:0, samos:0, chios:0, corfu:0, cephalonia:0, lefkada:0, zakynthos:0 },
  "2026": { athens_a:0, athens_b1:0, athens_b2:0, athens_b3:0, piraeus_a:0, piraeus_b:0, east_attica:0, west_attica:0, thessaloniki_a:0, thessaloniki_b:0, chalkidiki:0, imathia:0, kilkis:0, pella:0, pieria:0, serres:0, evros:0, rhodope:0, xanthi:0, drama:0, kavala:0, kozani:0, kastoria:0, florina:0, grevena:0, ioannina:0, arta:0, preveza:0, thesprotia:0, larissa:0, magnesia:0, trikala:0, karditsa:0, aetolia_acarnania:0, boeotia:0, phthiotis:0, evrytania:0, euboea:0, phocis:0, corinthia:0, argolis:0, arcadia:0, laconia:0, messenia:0, elis:0, achaea:0, heraklion:0, chania:0, rethymno:0, lasithi:0, dodecanese:0, cyclades:0, lesbos:0, samos:0, chios:0, corfu:0, cephalonia:0, lefkada:0, zakynthos:0 }
};

// Optional: exact valid-vote COUNTS per constituency, per scenario. If present for a
// district, it overrides the population×turnout estimate and makes the §8 ranking exact.
export const GR_DISTRICT_VALID_VOTES = {
  "2023": { athens_a:219108, athens_b1:322021, athens_b2:206177, athens_b3:350880, piraeus_a:93353, piraeus_b:136708, east_attica:223582, west_attica:71096, thessaloniki_a:290372, thessaloniki_b:178438, chalkidiki:57582, imathia:74601, kilkis:48988, pella:79149, pieria:70184, serres:99419, evros:76538, rhodope:54623, xanthi:55237, drama:52794, kavala:69997, kozani:83907, kastoria:27188, florina:28899, grevena:19418, ioannina:88908, arta:42248, preveza:34062, thesprotia:27031, larissa:143764, magnesia:95863, trikala:75998, karditsa:67475, aetolia_acarnania:117551, boeotia:57876, phthiotis:83681, evrytania:12055, euboea:108917, phocis:21713, corinthia:75793, argolis:51360, arcadia:52382, laconia:47237, messenia:89339, elis:79694, achaea:152287, heraklion:155125, chania:78758, rethymno:43725, lasithi:39453, dodecanese:90496, cyclades:66558, lesbos:52863, samos:22709, chios:28498, corfu:49778, cephalonia:20886, lefkada:13611, zakynthos:19956 }
};

// Parties that qualified (>3%) but did NOT legally file a State-Deputy (Επικρατείας)
// ballot, so they are barred from State seats; their seat passes to the next party by
// remainder. June 2023: "Spartans" filed no state ballot (Areios Pagos decision 174/2023).
export const GR_STATE_BALLOT_EXCLUDED = { "2023": ["spartans"] };