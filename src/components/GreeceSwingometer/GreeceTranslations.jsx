// GreeceTranslations.jsx
// ─────────────────────────────────────────────────────────────────────────────
//  English → Greek dictionary + helpers for the Greek swingometer's UI
//  (GreeceApp, ControlPanel, ResultsTable, Hemicycle, MonteCarloPanel,
//  OpinionPolls, ThemePicker, Map, MethodologyModal).
//
//  Design: every component already has its English text hardcoded as JSX
//  string literals. Rather than inventing a parallel set of semantic keys,
//  GR_EL is keyed by the EXACT English string itself, so retrofitting a
//  component is just wrapping the existing literal in `t(...)`:
//
//      <button>Layout</button>   →   <button>{t("Layout")}</button>
//
//  `t()` looks the string up only when lang === "el"; in English mode (or for
//  any string not yet in the dictionary) it returns the original text
//  untouched, so English can never go stale or fall back to a missing key.
//
//  Sentences with a number/variable in the middle (e.g. "Below 3% threshold")
//  can't be flat dictionary keys, so those get a small `fmt*` function instead.
//  Paragraphs that mix plain text with inline <strong>/<em> JSX (mostly in the
//  Methodology modal) use the <T> component, which just switches between the
//  original English JSX and a hand-written Greek replacement.
// ─────────────────────────────────────────────────────────────────────────────

export const GR_LANGUAGES = { en: "EN", el: "ΕΛ" };

export function useGreeceT(lang) {
  return (text) => (lang === "el" && GR_EL[text] != null) ? GR_EL[text] : text;
}

// For paragraphs where the English version has inline <strong>/<em> markup that
// isn't worth re-deriving from a flat string. `en` is the original JSX as-is;
// `el` is a hand-translated replacement (plain text or its own JSX).
export function T({ lang, en, el }) {
  return lang === "el" ? (el ?? en) : en;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Party names — keyed by party id (greece-data.js GR_PARTY_DICT), not by the
   English string, since users can rename a party in the edit panel. A
   renamed/custom party has no Greek translation available and simply falls
   back to whatever the user typed, in either language.
   ═══════════════════════════════════════════════════════════════════════════ */
export const GR_PARTY_NAMES_EL = {
  nd:       { name: "ΝΔ",        fullName: "Νέα Δημοκρατία" },
  syriza:   { name: "ΣΥΡΙΖΑ",    fullName: "ΣΥΡΙΖΑ - Προοδευτική Συμφωνία" },
  pasok:    { name: "ΠΑΣΟΚ",     fullName: "ΠΑΣΟΚ - Κίνημα Αλλαγής" },
  kke:      { name: "ΚΚΕ",       fullName: "Κομμουνιστικό Κόμμα Ελλάδας" },
  el:       { name: "ΕΛ",        fullName: "Ελληνική Λύση" },
  na:       { name: "ΝΑ",        fullName: "Νέα Αριστερά" },
  niki:     { name: "ΝΙΚΗ",      fullName: "Νίκη" },
  pe:       { name: "ΠΕ",        fullName: "Πλεύση Ελευθερίας" },
  mera25:   { name: "ΜέΡΑ25",    fullName: "ΜέΡΑ25" },
  spartans: { name: "Σπαρτιάτες", fullName: "Σπαρτιάτες" },
  gd:       { name: "ΧΑ",        fullName: "Χρυσή Αυγή" },
  fl:       { name: "ΦΛ",        fullName: "Φωνή Λογικής" },
  pat:      { name: "ΠΣ",        fullName: "Πατριωτική Συμμαχία" },
  elas:     { name: "ΕΛΑΣ",      fullName: "Συμμαχία Ελληνικής Αριστεράς" },
  elpida:   { name: "ΕΛΠΙΔΑ",    fullName: "Ελπίδα για τη Δημοκρατία" },
  dpk:      { name: "ΔΠΚ",       fullName: "Δημοκράτες Προοδευτικό Κέντρο" },
  samaras:  { name: "ΣΑΜΑΡΑΣ",   fullName: "Κόμμα Αντώνη Σαμαρά" },
  potami:   { name: "ΠΟΤΑΜΙ",    fullName: "Το Ποτάμι" },
  anel:     { name: "ΑΝΕΛ",      fullName: "Ανεξάρτητοι Έλληνες" },
  ek:       { name: "ΕΚ",        fullName: "Ένωση Κεντρώων" },
  lae:      { name: "ΛΑΕ",       fullName: "Λαϊκή Ενότητα" },
  kidiso:   { name: "ΚΙΔΗΣΟ",    fullName: "Κίνημα Δημοκρατών Σοσιαλιστών" },
  teleia:   { name: "ΤΕΛΕΙΑ",    fullName: "Τελεία" },
  dimar:    { name: "ΔΗΜΑΡ",     fullName: "Δημοκρατική Αριστερά" },
  laos:     { name: "ΛΑΟΣ",      fullName: "Λαϊκός Ορθόδοξος Συναγερμός" },
  prasinoi: { name: "ΟΠ",        fullName: "Οικολόγοι Πράσινοι" },
  dxana:    { name: "ΔΞ",        fullName: "Δημιουργία Ξανά" },
  disy:     { name: "ΔΗΣΥ",      fullName: "Δημοκρατική Συμμαχία" },
  drasi:    { name: "ΔΡΑΣΗ",     fullName: "Δράση - Φιλελεύθερη Συμμαχία" },
  antarsya: { name: "ΑΝΤΑΡΣΥΑ",  fullName: "Αντικαπιταλιστική Αριστερή Συνεργασία" },
  other:    { name: "ΑΛΛΑ",      fullName: "Άλλα Κόμματα" },
  us_dem:   { name: "ΔΗΜ",       fullName: "Δημοκρατικό Κόμμα (ΗΠΑ)" },
  us_rep:   { name: "ΡΕΠ",       fullName: "Ρεπουμπλικανικό Κόμμα (ΗΠΑ)" },
};

export function tPartyName(lang, party) {
  if (!party) return party;
  return (lang === "el" && GR_PARTY_NAMES_EL[party.id]) ? GR_PARTY_NAMES_EL[party.id].name : party.name;
}
export function tPartyFullName(lang, party) {
  if (!party) return party;
  return (lang === "el" && GR_PARTY_NAMES_EL[party.id]) ? GR_PARTY_NAMES_EL[party.id].fullName : party.fullName;
}
// For places that only have an id + a fallback label (e.g. poll-chart legend chips).
export function tPartyNameById(lang, id, fallback) {
  return (lang === "el" && GR_PARTY_NAMES_EL[id]) ? GR_PARTY_NAMES_EL[id].name : fallback;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Electoral district / constituency names — keyed by id (greece-data.js
   GR_RAW_DISTRICTS). The map's own GeoJSON files separately carry a
   `name_greek` property per feature (see grExtractNameLocalized in
   greece-utils.js) for the polygon labels themselves.
   ═══════════════════════════════════════════════════════════════════════════ */
export const GR_DISTRICT_NAMES_EL = {
  athens_a: "Α' Αθηνών", athens_b1: "Β1' Αθηνών (Βόρειος Τομέας)", athens_b2: "Β2' Αθηνών (Δυτικός Τομέας)",
  athens_b3: "Β3' Αθηνών (Νότιος Τομέας)", athens_b: "Β' Αθηνών", piraeus_a: "Α' Πειραιώς", piraeus_b: "Β' Πειραιώς",
  east_attica: "Ανατολική Αττική", west_attica: "Δυτική Αττική", attica: "Αττική",
  thessaloniki_a: "Α' Θεσσαλονίκης", thessaloniki_b: "Β' Θεσσαλονίκης",
  chalkidiki: "Χαλκιδική", imathia: "Ημαθία", kilkis: "Κιλκίς", pella: "Πέλλα", pieria: "Πιερία",
  serres: "Σέρρες", evros: "Έβρος", rhodope: "Ροδόπη", xanthi: "Ξάνθη", drama: "Δράμα", kavala: "Καβάλα",
  kozani: "Κοζάνη", kastoria: "Καστοριά", florina: "Φλώρινα", grevena: "Γρεβενά",
  ioannina: "Ιωάννινα", arta: "Άρτα", preveza: "Πρέβεζα", thesprotia: "Θεσπρωτία",
  larissa: "Λάρισα", magnesia: "Μαγνησία", trikala: "Τρίκαλα", karditsa: "Καρδίτσα",
  aetolia_acarnania: "Αιτωλοακαρνανία", boeotia: "Βοιωτία", phthiotis: "Φθιώτιδα", evrytania: "Ευρυτανία",
  euboea: "Εύβοια", phocis: "Φωκίδα", corinthia: "Κορινθία", argolis: "Αργολίδα", arcadia: "Αρκαδία",
  laconia: "Λακωνία", messenia: "Μεσσηνία", elis: "Ηλεία", achaea: "Αχαΐα",
  heraklion: "Ηράκλειο", chania: "Χανιά", rethymno: "Ρέθυμνο", lasithi: "Λασίθι",
  dodecanese: "Δωδεκάνησα", cyclades: "Κυκλάδες", lesbos: "Λέσβος", samos: "Σάμος", chios: "Χίος",
  corfu: "Κέρκυρα", cephalonia: "Κεφαλληνία", lefkada: "Λευκάδα", zakynthos: "Ζάκυνθος",
};

export function tDistrictName(lang, district) {
  if (!district) return district;
  return (lang === "el" && GR_DISTRICT_NAMES_EL[district.id]) ? GR_DISTRICT_NAMES_EL[district.id] : district.name;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Party ideology labels (greece-data.js GR_IDEOLOGY_LABELS) — used in the
   ControlPanel "edit party" dropdown.
   ═══════════════════════════════════════════════════════════════════════════ */
export const GR_IDEOLOGY_LABELS_EL = {
  "-5": "Αναρχικός (-5)", "-4": "Κομμουνιστής (-4)", "-3": "Δημοκρατικός Σοσιαλιστής (-3)",
  "-2": "Ήπια Αριστερά (-2)", "-1": "Σοσιαλδημοκρατικός (-1)", "0": "Κεντρώος (0)",
  "1": "Κεντροδεξιός (1)", "2": "Συντηρητικός (2)", "3": "Φιλελεύθερος-Λιμπερταριανός (3)",
  "4": "Δεξιός Λαϊκιστής (4)", "5": "Ακροδεξιός (5)",
};
export function tIdeologyLabel(lang, value, fallback) {
  return (lang === "el" && GR_IDEOLOGY_LABELS_EL[value]) ? GR_IDEOLOGY_LABELS_EL[value] : fallback;
}

/* ═══════════════════════════════════════════════════════════════════════════
   GreeceApp.jsx
   ═══════════════════════════════════════════════════════════════════════════ */
const GREECE_APP = {
  "All Countries": "Όλες οι Χώρες",
  "Layout": "Διάταξη",
  "How to Use": "Οδηγίες Χρήσης",
  "GREECE SWINGOMETER": "ΕΚΛΟΓΟΜΕΤΡΟ ΕΛΛΑΔΑΣ",
  "Hellenic Parliament · 300 Seats · Proportional": "Ελληνική Βουλή · 300 Έδρες · Αναλογική",
  "Cyprus Electoral Swingometer": "Εκλογόμετρο Κύπρου",
  "Methodology": "Μεθοδολογία",
  "Export": "Εξαγωγή",
  "Theme": "Θέμα",
  "Parliament Empty": "Άδεια Βουλή",
  "PsephosCast.gr · a non-commercial academic project by Konstantinos Davakos":
    "PsephosCast.gr · μη κερδοσκοπικό ακαδημαϊκό έργο του Κωνσταντίνου Δαβάκου",
  "Department of Economics, University of Ioannina": "Τμήμα Οικονομικών Επιστημών, Πανεπιστήμιο Ιωαννίνων",
  "Privacy Policy": "Πολιτική Απορρήτου",
  "How to Use the Swingometer": "Πώς να Χρησιμοποιήσετε το Σουίνγκομετρο",
  "Let's Go!": "Πάμε!",

  // ── HOWTO modal: section headers ──
  "Getting started": "Ξεκινώντας",
  "Demographic swings": "Δημογραφικές Μετατοπίσεις",
  "The map": "Ο Χάρτης",
  "Reading the result": "Διαβάζοντας το Αποτέλεσμα",
  "Forecasting tools": "Εργαλεία Πρόβλεψης",
  "Share & settings": "Κοινή Χρήση & Ρυθμίσεις",

  // ── HOWTO modal: item titles ──
  "Pick a scenario": "Επιλέξτε ένα σενάριο",
  "Change the vote": "Αλλάξτε την ψήφο",
  "Lock a party": "Κλειδώστε ένα κόμμα",
  "Edit parties": "Επεξεργαστείτε κόμματα",
  "Electoral threshold": "Εκλογικό όριο",
  "Reset": "Επαναφορά",
  "Swing voter groups, not parties": "Μετατοπίστε ομάδες ψηφοφόρων, όχι κόμματα",
  "Hover any district": "Περάστε το ποντίκι πάνω από μια περιφέρεια",
  "Map views": "Προβολές χάρτη",
  "Map controls": "Χειριστήρια χάρτη",
  "Hemicycle": "Ημικύκλιο",
  "Results table": "Πίνακας αποτελεσμάτων",
  "Metric cards": "Κάρτες δεικτών",
  "Monte Carlo forecast": "Πρόβλεψη Μόντε Κάρλο",
  "Coalition builder": "Δημιουργός συνασπισμού",
  "Opinion polls": "Δημοσκοπήσεις",
  "Export an image": "Εξαγωγή εικόνας",
  "Theme & colours": "Θέμα & χρώματα",

  // ── HOWTO modal: item body text ──
  "Top-left dropdown. Start from a real election — July 2019, the actual June 2023 result, or the May 2026 polling average. Every number begins from that election’s real data.":
    "Πάνω αριστερά. Ξεκινήστε από μια πραγματική εκλογή — τον Ιούλιο 2019, το πραγματικό αποτέλεσμα του Ιουνίου 2023, ή τον μέσο όρο δημοσκοπήσεων Μαΐου 2026. Κάθε αριθμός ξεκινά από τα πραγματικά δεδομένα αυτής της εκλογής.",
  "On the Parties tab, drag any party’s slider to set its national %. The engine instantly recomputes all 300 seats and 59 districts, and the other parties rebalance so the total stays 100%.":
    "Στην καρτέλα Κόμματα, σύρετε τον ρυθμιστή ενός κόμματος για να ορίσετε το εθνικό του ποσοστό. Ο μηχανισμός υπολογίζει αμέσως εκ νέου όλες τις 300 έδρες και τις 59 περιφέρειες, και τα υπόλοιπα κόμματα αναπροσαρμόζονται ώστε το σύνολο να παραμένει 100%.",
  "Click the padlock next to a party to freeze its score so it won’t move when you drag the others — for asking “what if only this one changes?”":
    "Πατήστε το λουκέτο δίπλα σε ένα κόμμα για να «παγώσετε» το ποσοστό του ώστε να μη μετακινείται όταν σύρετε τα άλλα — για να ρωτήσετε «τι θα γινόταν αν άλλαζε μόνο αυτό;»",
  "Rename a party, change its colour, reorder the list, or remove one — handy for testing hypothetical or brand-new parties.":
    "Μετονομάστε ένα κόμμα, αλλάξτε το χρώμα του, αναδιατάξτε τη λίστα, ή αφαιρέστε ένα — χρήσιμο για τη δοκιμή υποθετικών ή ολοκαίνουργιων κομμάτων.",
  "The bar a party must clear nationally to win any seats (really 3%). Slide it to see how the result changes if the cut-off were higher or lower.":
    "Το όριο που πρέπει να ξεπεράσει πανελλαδικά ένα κόμμα για να κερδίσει έδρες (στην πραγματικότητα 3%). Μετακινήστε το για να δείτε πώς αλλάζει το αποτέλεσμα αν το όριο ήταν υψηλότερο ή χαμηλότερο.",
  "“Reset to Baseline” puts every party back to the scenario’s real numbers.":
    "Η «Επαναφορά στη Βάση» επαναφέρει κάθε κόμμα στους πραγματικούς αριθμούς του σεναρίου.",
  "The Demographics tab moves whole voter blocs instead of single parties: Youth & Senior turnout, Urban/Rural skew, Education, Economic Precarity, and Gender. Pushing one shifts every party at once based on who its voters are — e.g. a youth surge helps youth-leaning parties across all 59 districts simultaneously.":
    "Η καρτέλα Δημογραφικά μετακινεί ολόκληρες ομάδες ψηφοφόρων αντί για μεμονωμένα κόμματα: προσέλευση νέων & ηλικιωμένων, αστική/αγροτική κλίση, εκπαίδευση, οικονομική επισφάλεια, και φύλο. Η μετακίνηση ενός ρυθμιστή μετατοπίζει κάθε κόμμα ταυτόχρονα βάσει του ποιοι είναι οι ψηφοφόροι του — π.χ. μια αύξηση προσέλευσης νέων ενισχύει τα νεανικά κόμματα σε όλες τις 59 περιφέρειες ταυτόχρονα.",
  "See who wins its seats, the local vote shares, and the fight for the final seat.":
    "Δείτε ποιος κερδίζει τις έδρες της, τα τοπικά ποσοστά ψήφων, και τη μάχη για την τελευταία έδρα.",
  "The dropdown above the map changes what the colours mean: Swingometer (who leads), Margin of Victory, and Runner-Up — plus data layers like Age 65+, Tertiary Education, Unemployment, Foreign Citizens, Urbanisation, Primary Economy, and Population (2021).":
    "Το αναπτυσσόμενο μενού πάνω από τον χάρτη αλλάζει τι σημαίνουν τα χρώματα: Σουίνγκομετρο (ποιος προηγείται), Περιθώριο Νίκης, και Δεύτερος — μαζί με στρώματα δεδομένων όπως Ηλικία 65+, Τριτοβάθμια Εκπαίδευση, Ανεργία, Αλλοδαποί, Αστικοποίηση, Πρωτογενής Τομέας, και Πληθυσμός (2021).",
  "Toggle the seat dots and district names on or off, and reset the zoom, with the buttons on the map.":
    "Ενεργοποιήστε ή απενεργοποιήστε τις κουκίδες εδρών και τα ονόματα περιφερειών, και επαναφέρετε το ζουμ, με τα κουμπιά στον χάρτη.",
  "The parliament itself — each dot is one of the 300 seats, coloured by party, with a marker at the 151-seat majority line.":
    "Η ίδια η Βουλή — κάθε κουκίδα είναι μία από τις 300 έδρες, χρωματισμένη ανά κόμμα, με δείκτη στη γραμμή πλειοψηφίας των 151 εδρών.",
  "Every party’s vote %, total seats, and how those split between constituency seats (won in districts) and the 15 nationwide “State” seats.":
    "Το ποσοστό ψήφων κάθε κόμματος, οι συνολικές έδρες, και πώς αυτές μοιράζονται μεταξύ εδρών περιφέρειας (που κερδίζονται στις περιφέρειες) και των 15 πανελλαδικών εδρών «Επικρατείας».",
  "The headlines at a glance: the winner, whether anyone has a majority, the winner’s bonus seats, and turnout.":
    "Τα βασικά μεγέθη με μια ματιά: ο νικητής, αν κάποιος έχει πλειοψηφία, οι έδρες πριμοδότησης του νικητή, και η προσέλευση.",
  "Runs thousands of simulated elections around your numbers, adding realistic polling error, to show each party’s likely seat range and its chance of finishing first — because one fixed prediction hides how uncertain a real forecast is.":
    "Εκτελεί χιλιάδες προσομοιωμένες εκλογές γύρω από τους αριθμούς σας, προσθέτοντας ρεαλιστικό σφάλμα δημοσκόπησης, για να δείξει το πιθανό εύρος εδρών κάθε κόμματος και τις πιθανότητές του να τερματίσει πρώτο — επειδή μία σταθερή πρόβλεψη κρύβει πόσο αβέβαιη είναι μια πραγματική πρόβλεψη.",
  "Tick a set of parties to instantly check whether their combined seats reach the 151 needed to govern.":
    "Επιλέξτε ένα σύνολο κομμάτων για να ελέγξετε αμέσως αν οι συνολικές τους έδρες φτάνουν τις 151 που απαιτούνται για διακυβέρνηση.",
  "The recent published polls the May 2026 baseline is built from.":
    "Οι πρόσφατες δημοσιευμένες δημοσκοπήσεις από τις οποίες χτίζεται η βάση του Μαΐου 2026.",
  "The camera button opens a composer — a 2×2 grid where you drop in any panels you want (the map, the Athens zoom, the parliament makeup, either Monte Carlo forecast view, or a date-ranged poll chart), resize each one, and save the result as one shareable image.":
    "Το κουμπί της κάμερας ανοίγει έναν συνθέτη — ένα πλέγμα 2×2 όπου τοποθετείτε όποια πάνελ θέλετε (τον χάρτη, το ζουμ της Αθήνας, τη σύνθεση της Βουλής, μία από τις δύο προβολές Μόντε Κάρλο, ή ένα γράφημα δημοσκοπήσεων με εύρος ημερομηνιών), αλλάζετε το μέγεθος καθενός, και αποθηκεύετε το αποτέλεσμα ως μία εικόνα έτοιμη για κοινή χρήση.",
  "The Theme button opens an appearance picker — dark, a soft daylight mode, high contrast, and a colour-blind-safe palette that recolours the map, parliament and tables.":
    "Το κουμπί Θέμα ανοίγει έναν επιλογέα εμφάνισης — σκούρο, μια απαλή λειτουργία ημέρας, υψηλή αντίθεση, και μια παλέτα ασφαλή για αχρωματοψία που αλλάζει τα χρώματα του χάρτη, της Βουλής και των πινάκων.",
  "Opens the full step-by-step breakdown of how votes become seats under Greek law — the exact algorithm behind every number.":
    "Ανοίγει την πλήρη βήμα-προς-βήμα ανάλυση του πώς οι ψήφοι γίνονται έδρες σύμφωνα με την ελληνική νομοθεσία — τον ακριβή αλγόριθμο πίσω από κάθε αριθμό.",
};

/* ═══════════════════════════════════════════════════════════════════════════
   ControlPanel.jsx
   ═══════════════════════════════════════════════════════════════════════════ */
const CONTROL_PANEL = {
  "Youth Turnout (18–34)": "Προσέλευση Νέων (18–34)",
  "Negative = youth abstain · Positive = youth mobilised": "Αρνητικό = αποχή νέων · Θετικό = κινητοποίηση νέων",
  "Senior Turnout (55+)": "Προσέλευση Ηλικιωμένων (55+)",
  "Negative = seniors abstain · Positive = seniors mobilised": "Αρνητικό = αποχή ηλικιωμένων · Θετικό = κινητοποίηση ηλικιωμένων",
  "Urban / Rural Skew": "Κλίση Αστικού / Αγροτικού",
  "Negative = rural surge · Positive = urban surge": "Αρνητικό = άνοδος αγροτικών · Θετικό = άνοδος αστικών",
  "Education Gradient": "Κλίμακα Εκπαίδευσης",
  "Negative = low-education turnout · Positive = high-education turnout": "Αρνητικό = προσέλευση χαμηλής εκπαίδευσης · Θετικό = προσέλευση υψηλής εκπαίδευσης",
  "Economic Precarity": "Οικονομική Επισφάλεια",
  "Negative = stable electorate · Positive = precarious/unemployed mobilised": "Αρνητικό = σταθερό εκλογικό σώμα · Θετικό = κινητοποίηση επισφαλών/ανέργων",
  "Gender Representation": "Εκπροσώπηση Φύλου",
  "Negative = higher male turnout · Positive = higher female turnout": "Αρνητικό = υψηλότερη ανδρική προσέλευση · Θετικό = υψηλότερη γυναικεία προσέλευση",
  "Unlock Party": "Ξεκλείδωμα Κόμματος",
  "Lock Party": "Κλείδωμα Κόμματος",
  "Abbr.": "Συντομ.",
  "Full Name": "Πλήρες Όνομα",
  "Delete": "Διαγραφή",
  "Swing Controls": "Χειριστήρια Μετατόπισης",
  "Baseline": "Βάση",
  "May 2026 Polling Average": "Μέσος Όρος Δημοσκοπήσεων Μαΐου 2026",
  "June 2023 Legislative": "Βουλευτικές Εκλογές Ιουνίου 2023",
  "July 2019 Legislative": "Βουλευτικές Εκλογές Ιουλίου 2019",
  "Electoral Threshold (%)": "Εκλογικό Όριο (%)",
  "Parties": "Κόμματα",
  "Demographics": "Δημογραφικά",
  "Reset Demographics": "Επαναφορά Δημογραφικών",
  "Total (normalised)": "Σύνολο (κανονικοποιημένο)",
  "Reset to Baseline": "Επαναφορά στη Βάση",
};

/* ═══════════════════════════════════════════════════════════════════════════
   ResultsTable.jsx
   ═══════════════════════════════════════════════════════════════════════════ */
const RESULTS_TABLE = {
  "First Place": "Πρώτο Κόμμα",
  "None": "Κανένα",
  "No qualifying party": "Κανένα κόμμα δεν πληροί τις προϋποθέσεις",
  "Winner Seats": "Έδρες Νικητή",
  "no bonus seats": "χωρίς έδρες πριμοδότησης",
  "Turnout (est.)": "Προσέλευση (εκτ.)",
  "projected estimate": "προβλεπόμενη εκτίμηση",
  "actual votes cast": "πραγματικές ψήφοι",
  "Majority": "Πλειοψηφία",
  "Seats Short": "Έδρες που Λείπουν",
  "coalition required": "απαιτείται συνασπισμός",
  "Seat Distribution": "Κατανομή Εδρών",
  "Party": "Κόμμα",
  "Vote %": "Ψήφος %",
  "After Threshold": "Μετά το Όριο",
  "Votes": "Ψήφοι",
  "Seats (vs '19)": "Έδρες (vs '19)",
  "Seats (vs '23)": "Έδρες (vs '23)",
  "Bonus": "Πριμοδότηση",
  "Share": "Ποσοστό",
  "FIRST": "ΠΡΩΤΟ",
  "redistributed": "αναδιανέμονται",
};

/* ═══════════════════════════════════════════════════════════════════════════
   Hemicycle.jsx
   ═══════════════════════════════════════════════════════════════════════════ */
const HEMICYCLE = {
  "Coalition Builder": "Δημιουργός Συνασπισμού",
  "Clear": "Καθαρισμός",
  "Hellenic Parliament": "Ελληνική Βουλή",
  "● Majority secured": "● Πλειοψηφία εξασφαλισμένη",
  "○ No majority": "○ Χωρίς πλειοψηφία",
  "Left": "Αριστερά",
  "Center": "Κέντρο",
  "Right": "Δεξιά",
  "party": "κόμμα",
  "parties": "κόμματα",
};

/* ═══════════════════════════════════════════════════════════════════════════
   MonteCarloPanel.jsx
   ═══════════════════════════════════════════════════════════════════════════ */
const MONTE_CARLO = {
  "🎲 Probabilistic Forecast": "🎲 Πιθανοκρατική Πρόβλεψη",
  "runs": "εκτελέσεις",
  "updating…": "ενημέρωση…",
  "📊 Create Detailed Correlation Models": "📊 Δημιουργία Αναλυτικών Στατιστικών Μοντέλων",
  "Hide": "Απόκρυψη",
  "Show": "Εμφάνιση",
  "No qualifying parties to simulate.": "Δεν υπάρχουν κόμματα που πληρούν τις προϋποθέσεις για προσομοίωση.",
  "UNCERTAINTY": "ΑΒΕΒΑΙΟΤΗΤΑ",
  "2k runs": "2χιλ. εκτελέσεις",
  "4k runs": "4χιλ. εκτελέσεις",
  "10k runs": "10χιλ. εκτελέσεις",
  "20k runs": "20χιλ. εκτελέσεις",
  "Odds & seat range per party": "Πιθανότητες & εύρος εδρών ανά κόμμα",
  "bar = 90% range · tick = median seats": "η μπάρα = εύρος 90% · η γραμμή = διάμεσες έδρες",
  "right column = chance of finishing 1st": "δεξιά στήλη = πιθανότητα να τερματίσει 1ο",
  "Coalition arithmetic": "Αριθμητική Συνασπισμού",
  "median": "διάμεσος",
  "seats": "έδρες",
  "seats combined": "συνολικές έδρες",
  "Pick any parties to test if the numbers add up to a majority.": "Επιλέξτε κόμματα για να ελέγξετε αν οι αριθμοί συνθέτουν πλειοψηφία.",
  "Seat distribution": "Κατανομή Εδρών",
  "— how often each seat total comes up across all runs": "— πόσο συχνά εμφανίζεται κάθε σύνολο εδρών σε όλες τις εκτελέσεις",
  "Leading party — always shown": "Επικεφαλής κόμμα — εμφανίζεται πάντα",
  "line": "γραμμή",
  "bars": "στήλες",
  "both": "και τα δύο",
  "A single-party majority is very unlikely.": "Μια αυτοδύναμη πλειοψηφία είναι πολύ απίθανη.",
  "almost certain": "σχεδόν βέβαιο",
  "very unlikely": "πολύ απίθανο",
  "of runs.": "των εκτελέσεων.",
  "of the time.": "των φορών.",
  "Hung parliament:": "Ακυβέρνητη Βουλή:",
};

/* ═══════════════════════════════════════════════════════════════════════════
   OpinionPolls.jsx
   ═══════════════════════════════════════════════════════════════════════════ */
const OPINION_POLLS = {
  "Loading live polls…": "Φόρτωση δημοσκοπήσεων…",
  "Fallback data": "Εφεδρικά δεδομένα",
  "🔄 Refresh": "🔄 Ανανέωση",
  "📉 Trendline": "📉 Γραμμή Τάσης",
  "📊 Raw Polls": "📊 Ανεπεξέργαστες Δημοσκοπήσεις",
  "📈 Smooth": "📈 Ομαλό",
  "📉 Spiky": "📉 Ακανόνιστο",
  "╌╌ Dashed": "╌╌ Διακεκομμένο",
  "── Solid": "── Συνεχόμενο",
  "Toggle dashed lines": "Εναλλαγή διακεκομμένων γραμμών",
  "Fetching latest polls…": "Λήψη πρόσφατων δημοσκοπήσεων…",
  "No poll data available to display": "Δεν υπάρχουν διαθέσιμα δεδομένα δημοσκοπήσεων",
  "Local Regression (LOESS)": "Τοπική Παλινδρόμηση (LOESS)",
  "Unknown Firm": "Άγνωστη Εταιρεία",
  "Unknown firm": "Άγνωστη εταιρεία",
  "📥 Copy for the projection": "📥 Αντιγραφή στην προβολή",
};

/* ═══════════════════════════════════════════════════════════════════════════
   ThemePicker.jsx + GreeceThemes.js labels
   ═══════════════════════════════════════════════════════════════════════════ */
const THEME_PICKER = {
  "Appearance": "Εμφάνιση",
  "Colour-blind palette": "Παλέτα για Αχρωματοψία",
  "Recolours the map, parliament and tables. Red–green deficiency affects ~1 in 12 men, where a red and a green party can read as the same muddy tone — these palettes separate every party by luminance so that can't happen.":
    "Αλλάζει τα χρώματα στον χάρτη, τη Βουλή και τους πίνακες. Η δυσχρωματοψία ερυθρού-πράσινου επηρεάζει περίπου 1 στους 12 άνδρες, όπου ένα κόκκινο και ένα πράσινο κόμμα μπορούν να φαίνονται σαν την ίδια θαμπή απόχρωση — αυτές οι παλέτες ξεχωρίζουν κάθε κόμμα με βάση τη φωτεινότητα ώστε αυτό να μην συμβαίνει.",
  "Done": "Τέλος",
  // THEMES (GreeceThemes.js)
  "Midnight": "Μεσάνυχτα",
  "Default low-glare dark.": "Προεπιλεγμένο σκούρο με χαμηλή λάμψη.",
  "Daylight (dim)": "Ημέρα (απαλό)",
  "Muted warm greige — easy on the eyes.": "Απαλό θερμό γκριζομπέζ — ξεκούραστο για τα μάτια.",
  "High Contrast": "Υψηλή Αντίθεση",
  "Pure-black ground, bold borders.": "Καθαρό μαύρο φόντο, έντονα περιγράμματα.",
  // PALETTES (GreeceThemes.js)
  "Default": "Προεπιλογή",
  "Each party's own colour.": "Το δικό του χρώμα κάθε κόμματος.",
  "Red–Green safe": "Ασφαλές για Ερυθρό–Πράσινο",
  "Deuteranopia / Protanopia — most common CVD.": "Δευτερανωπία / Πρωτανωπία — η πιο συχνή δυσχρωματοψία.",
  "Blue–Yellow safe": "Ασφαλές για Μπλε–Κίτρινο",
  "Tritanopia — rare blue/yellow confusion.": "Τριτανωπία — σπάνια σύγχυση μπλε/κίτρινου.",
  "Monochrome": "Μονόχρωμο",
  "Greyscale by luminance (+ map patterns).": "Κλίμακα του γκρι ανά φωτεινότητα (+ μοτίβα χάρτη).",
};

/* ═══════════════════════════════════════════════════════════════════════════
   Map.jsx
   ═══════════════════════════════════════════════════════════════════════════ */
const MAP = {
  "Electoral Map": "Εκλογικός Χάρτης",
  "🗳️ Swingometer": "🗳️ Σουίνγκομετρο",
  "📊 Margin of Victory": "📊 Περιθώριο Νίκης",
  "🥈 Runner-Up Party": "🥈 Δεύτερο Κόμμα",
  "👴 Age 65+ (%)": "👴 Ηλικία 65+ (%)",
  "🎓 Tertiary Edu (%)": "🎓 Τριτοβάθμια Εκπ. (%)",
  "💼 Unemployment (%)": "💼 Ανεργία (%)",
  "🌐 Foreign Citizens (%)": "🌐 Αλλοδαποί (%)",
  "🏙️ Urbanization (%)": "🏙️ Αστικοποίηση (%)",
  "🚜 Primary Economy": "🚜 Πρωτογενής Τομέας",
  "👥 Population (2021)": "👥 Πληθυσμός (2021)",
  "🏛️ Municipality Breakdown": "🏛️ Ανάλυση Δήμων",
  "LIST": "ΕΠΙΚΡΑΤΕΙΑΣ",
  "Loading municipalities…": "Φόρτωση δήμων…",
  "🏛️ Municipality Breakdown · 2023 · swings with sliders": "🏛️ Ανάλυση Δήμων · 2023 · μετατοπίζεται με τους ρυθμιστές",
  "Margin of Victory": "Περιθώριο Νίκης",
  "Runner-Up Party": "Δεύτερο Κόμμα",
  "Age 65+ (%)": "Ηλικία 65+ (%)",
  "Tertiary Edu (%)": "Τριτοβάθμια Εκπαίδευση (%)",
  "Unemployment Rate (%)": "Ποσοστό Ανεργίας (%)",
  "Foreign Citizens (%)": "Αλλοδαποί Πολίτες (%)",
  "Urbanization (%)": "Αστικοποίηση (%)",
  "Primary Economy": "Πρωτογενής Τομέας",
  "Tight race": "Στενή Κούρσα",
  "Safe seat": "Σίγουρη Έδρα",
  "Color = 2nd place party": "Χρώμα = κόμμα 2ης θέσης",
  "Services (Yellow)": "Υπηρεσίες (Κίτρινο)",
  "Agriculture (Green)": "Γεωργία (Πράσινο)",
  "Industry (Blue)": "Βιομηχανία (Μπλε)",
  "Tourism (Pink)": "Τουρισμός (Ροζ)",
  "Hide names": "Απόκρυψη ονομάτων",
  "District names": "Ονόματα περιφερειών",
  "Hide seats": "Απόκρυψη εδρών",
  "Show seats": "Εμφάνιση εδρών",
  "Unmapped Polygon": "Μη Αντιστοιχισμένο Πολύγωνο",
  "RAW NAME:": "ΑΡΧΙΚΟ ΟΝΟΜΑ:",
  "Agio Oros (Mt. Athos)": "Άγιο Όρος (Άθως)",
  "AUTONOMOUS — NO SEATS": "ΑΥΤΟΝΟΜΟ — ΧΩΡΙΣ ΕΔΡΕΣ",
  "Population (2021):": "Πληθυσμός (2021):",
  "No data entry": "Χωρίς δεδομένα",
  "Age 65+:": "Ηλικία 65+:",
  "Tertiary Edu:": "Τριτοβάθμια Εκπ.:",
  "Unemployment:": "Ανεργία:",
  "Foreign Citizens:": "Αλλοδαποί:",
  "Urbanization:": "Αστικοποίηση:",
  "Primary Econ:": "Πρωτογενής Τομ.:",
  "Value:": "Τιμή:",
  "1st:": "1ο:",
  "2nd:": "2ο:",
  "MARGIN:": "ΠΕΡΙΘΩΡΙΟ:",
  "SEATS": "ΕΔΡΕΣ",
  "≈ estimated from constituency average (no 2023 row)": "≈ εκτίμηση από τον μέσο όρο της περιφέρειας (χωρίς στοιχεία 2023)",
};

/* ═══════════════════════════════════════════════════════════════════════════
   MethodologyModal.jsx — section titles & short labels (long mixed-JSX
   paragraphs are translated inline with <T>, not here)
   ═══════════════════════════════════════════════════════════════════════════ */
const METHODOLOGY = {
  "🇬🇷 METHODOLOGY": "🇬🇷 ΜΕΘΟΔΟΛΟΓΙΑ",
  "Part A · National seat totals": "Μέρος Α · Εθνικά σύνολα εδρών",
  "Part B · Constituency distribution (arts. 99–100)": "Μέρος Β · Κατανομή ανά εκλογική περιφέρεια (άρθρα 99–100)",
  "Part C · How the vote shares are set": "Μέρος Γ · Πώς καθορίζονται τα ποσοστά ψήφων",
  "Part D · Monte Carlo forecast": "Μέρος Δ · Πρόβλεψη Μόντε Κάρλο",
  "Electoral threshold": "Εκλογικό όριο",
  "Winner's bonus (reinforced proportionality)": "Πριμοδότηση νικητή (ενισχυμένη αναλογική)",
  "Proportional allocation — Hare quota + largest remainder": "Αναλογική κατανομή — εκλογικό μέτρο Hare + μέγιστο υπόλοιπο",
  "The 15 State (Επικρατείας) seats": "Οι 15 έδρες Επικρατείας",
  "Single-seat constituencies — plurality": "Μονοεδρικές περιφέρειες — πλειοψηφία",
  "First distribution (πρώτη κατανομή), multi-seat constituencies": "Πρώτη κατανομή, πολυεδρικές περιφέρειες",
  "§100.7 — small constituencies (2- and 3-seat)": "§100.7 — μικρές περιφέρειες (2 και 3 εδρών)",
  "§100.8 — large constituencies (4+ seats), smallest party first": "§100.8 — μεγάλες περιφέρειες (4+ έδρες), πρώτα το μικρότερο κόμμα",
  "Per-district vote weight & the turnout slider": "Βάρος ψήφου ανά περιφέρεια & ο ρυθμιστής προσέλευσης",
  "Demographic swing model": "Μοντέλο δημογραφικής μετατόπισης",
  "District-level logit swing": "Λογιστική μετατόπιση σε επίπεδο περιφέρειας",
  "The error model": "Το μοντέλο σφάλματος",
  "What it reports": "Τι αναφέρει",
  "Scenarios & data sources": "Σενάρια & πηγές δεδομένων",
  "⚠ Known limitations": "⚠ Γνωστοί περιορισμοί",
};

const SEAT_DIFF = {
  "September 2015 Legislative": "Σεπτέμβριος 2015",
  "January 2015 Legislative": "Ιανουάριος 2015",
  "June 2012 Legislative": "Ιούνιος 2012",
  "May 2012 Legislative": "Μάιος 2012",
  "Seats (vs '15)": "Έδρες (έναντι '15)",
  "Seats (vs Jan '15)": "Έδρες (έναντι Ιαν. '15)",
  "Seats (vs '12)": "Έδρες (έναντι '12)",
  "Seats (vs May '12)": "Έδρες (έναντι Μαΐ. '12)",
  "Seat Allocation: 2015 vs Current Map": "Κατανομή Εδρών: 2015 έναντι Τρέχοντος Χάρτη",
  "Constituencies whose seat count differs between the September 2015 map (56 constituencies) and the current post-2018 map (59 constituencies). Athens B and Attica compare against the combined seat totals of their current sub-districts. Only differences are shown.":
    "Εκλογικές περιφέρειες όπου ο αριθμός εδρών διαφέρει μεταξύ του χάρτη του Σεπτεμβρίου 2015 (56 περιφέρειες) και του τρέχοντος χάρτη μετά το 2018 (59 περιφέρειες). Η Β' Αθηνών και η Αττική συγκρίνονται με το άθροισμα εδρών των σημερινών υποπεριφερειών τους. Εμφανίζονται μόνο οι διαφορές.",
  "Region": "Περιφέρεια",
  "2015 Seats": "Έδρες 2015",
  "Current Seats": "Τρέχουσες Έδρες",
  "vs.": "έναντι",
  "No seat allocation differences found.": "Δεν βρέθηκαν διαφορές στην κατανομή εδρών.",
};

export const GR_EL = {
  ...GREECE_APP, ...CONTROL_PANEL, ...RESULTS_TABLE, ...HEMICYCLE,
  ...MONTE_CARLO, ...OPINION_POLLS, ...THEME_PICKER, ...MAP, ...METHODOLOGY, ...SEAT_DIFF,
};

/* ═══════════════════════════════════════════════════════════════════════════
   Parametrized sentences (a number/variable sits inside the sentence, so it
   can't be a flat dictionary key). One small function per template.
   ═══════════════════════════════════════════════════════════════════════════ */

// GreeceApp.jsx (empty hemicycle) + ResultsTable.jsx (empty results table)
export function fmtNoPartiesThreshold(lang, threshold) {
  return lang === "el"
    ? `Κανένα κόμμα δεν ξεπέρασε το όριο του ${threshold}%.`
    : `No parties passed the ${threshold}% threshold.`;
}

// ControlPanel.jsx — National Turnout slider label
export function fmtNationalTurnout(lang, turnoutShift) {
  const sign = turnoutShift > 0 ? "+" : "";
  return lang === "el"
    ? `Εθνική Προσέλευση ${sign}${turnoutShift} μον.`
    : `National Turnout ${sign}${turnoutShift} pts`;
}

// ResultsTable.jsx — metric card subtitles
export function fmtInclBonus(lang, bonusSeats) {
  return lang === "el" ? `συμπ. +${bonusSeats} πριμοδότηση` : `incl. +${bonusSeats} bonus`;
}
export function fmtSeatsOfNeeded(lang, seats, needed) {
  return lang === "el" ? `${seats} από ${needed} απαιτούμενες` : `${seats} of ${needed} needed`;
}
export function fmtTotalVotes(lang, votesShort) {
  return lang === "el" ? `${votesShort} συνολικές ψήφοι` : `${votesShort} total votes`;
}
export function fmtBelowThreshold(lang, threshold) {
  return lang === "el" ? `Κάτω από ${threshold}%:` : `Below ${threshold}%:`;
}

// Hemicycle.jsx — coalition strength line
export function fmtMajorityCoalition(lang, totalSeats, partyCount) {
  const noun = lang === "el"
    ? (partyCount === 1 ? GR_EL["party"] : GR_EL["parties"])
    : (partyCount === 1 ? "party" : "parties");
  return lang === "el"
    ? `✓ Πλειοψηφικός συνασπισμός — ${totalSeats} έδρες με ${partyCount} ${noun}`
    : `✓ Majority coalition — ${totalSeats} seats with ${partyCount} ${noun}`;
}

// MonteCarloPanel.jsx
export function fmtRunsLabel(lang, iterations, computing) {
  return lang === "el"
    ? `${iterations.toLocaleString()} εκτελέσεις${computing ? " · ενημέρωση…" : ""}`
    : `${iterations.toLocaleString()} runs${computing ? " · updating…" : ""}`;
}
export function fmtMajorityLine(lang, majority) {
  return lang === "el" ? `│ πλειοψηφία ${majority}` : `│ ${majority} majority`;
}
export function fmtChanceOfReaching(lang, majority) {
  return lang === "el" ? `Πιθανότητα να φτάσει τις ${majority}:` : `Chance of reaching ${majority}:`;
}
export function fmtMedianSeatsCombined(lang, medianSeats) {
  return lang === "el" ? `διάμεσος ${medianSeats} συνολικές έδρες` : `median ${medianSeats} seats combined`;
}
export function fmtSeatDistFooter(lang, majority) {
  return lang === "el"
    ? `Βασίζεται στις ίδιες εκτελέσεις. Κάθε καμπύλη είναι το πλήρες εύρος συνόλων εδρών για αυτό το κόμμα — ψηλή στη μέση (πιο πιθανό), λεπτή προς τα απίθανα άκρα. Περάστε το ποντίκι πάνω από το γράφημα για να δείτε οποιοδήποτε σύνολο εδρών και πόσες εκτελέσεις κατέληξαν εκεί· εναλλάξτε ανάμεσα στην ομαλή γραμμή, τις ανεπεξέργαστες στήλες, ή και τα δύο. Κάθε καμπύλη κλιμακώνεται στη δική της κορύφωση ώστε τα σχήματα να παραμένουν συγκρίσιμα· η διακεκομμένη κίτρινη γραμμή είναι η πλειοψηφία των ${majority} εδρών.`
    : `Built from the same runs. Each curve is the full spread of seat totals for that party — tall in the middle (most likely), thinning toward the unlikely extremes. Hover the chart to read any seat total and how many runs landed there; switch between the smoothed line, the raw bars, or both. Curves are each scaled to their own peak so shapes stay comparable; the dashed amber line is the ${majority}-seat majority.`;
}
export function fmtMcMethodologyFooter(lang, iterations) {
  return lang === "el"
    ? `Κάθε εκτέλεση αντλεί ένα σφάλμα δημοσκόπησης από μια κατανομή με βαριές ουρές (Student-t), εν μέρει κοινό μεταξύ κομμάτων, και τροφοδοτεί τα διαταραγμένα ποσοστά μέσω του ίδιου μηχανισμού με το αποτέλεσμα παραπάνω. Οι πιθανότητες είναι εκτιμήσεις από ${iterations.toLocaleString()} εκτελέσεις και μετατοπίζονται ελαφρά σε κάθε ενημέρωση — αυξήστε τον αριθμό εκτελέσεων για να σταθεροποιηθούν.`
    : `Each run draws a polling error from a fat-tailed (Student-t) distribution, partly shared across parties, and feeds the perturbed shares through the same engine as the result above. Odds are estimates from ${iterations.toLocaleString()} runs and shift slightly each update — raise the run count to steady them.`;
}
export function fmtLeaderFirst(lang) {
  return lang === "el" ? "τερματίζει πρώτο στο" : "finishes first in";
}
export function fmtOutrightMajority(lang) {
  return lang === "el" ? "κερδίζει αυτοδύναμη πλειοψηφία στο" : "wins an outright majority";
}
export function fmtAboutXIn10(lang, n) {
  return lang === "el" ? `περίπου ${n} στις 10` : `about ${n} in 10`;
}

// Map.jsx
export function fmtMuniLoadError(lang, errMsg) {
  return lang === "el"
    ? `Δεν ήταν δυνατή η φόρτωση του χάρτη δήμων (${errMsg}). Βεβαιωθείτε ότι το GreeceMun.json βρίσκεται στο /public.`
    : `Could not load municipality map (${errMsg}). Ensure GreeceMun.json is in /public.`;
}
export function fmtMinMax(lang, which, value) {
  const label = which === "min" ? (lang === "el" ? "Ελάχ." : "Min") : (lang === "el" ? "Μέγ." : "Max");
  return `${label} (${value.toFixed(1)}%)`;
}
export function fmtLean(lang, avgLean) {
  if (avgLean > 0.2) return lang === "el" ? `ΔΕΞΙΑ (+${avgLean.toFixed(1)})` : `RIGHT (+${avgLean.toFixed(1)})`;
  if (avgLean < -0.2) return lang === "el" ? `ΑΡΙΣΤΕΡΑ (${avgLean.toFixed(1)})` : `LEFT (${avgLean.toFixed(1)})`;
  return lang === "el" ? `ΚΥΜΑΝΣΗ (${avgLean.toFixed(1)})` : `SWING (${avgLean.toFixed(1)})`;
}
