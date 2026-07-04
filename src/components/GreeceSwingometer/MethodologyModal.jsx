import { S } from "./GreeceStyles";
import { GR } from "./greece-data.js";
import { useGreeceT, T } from "./GreeceTranslations.jsx";

/* Small presentational helpers so the long document stays readable. */
const Mono = ({ children }) => (
  <div style={{ background: "var(--bg-mid)", padding: 12, borderRadius: 6, margin: "10px 0", border: "1px solid var(--border)", fontFamily: "var(--ff-mono, monospace)", fontSize: 12, lineHeight: 1.7, color: "var(--text-main)", overflowX: "auto" }}>
    {children}
  </div>
);

const Section = ({ step, title, children }) => (
  <section>
    <h4 style={{ margin: "0 0 8px", color: "var(--text-title)", fontSize: 16, display: "flex", alignItems: "baseline", gap: 8 }}>
      {step != null && <span style={{ fontSize: 11, fontFamily: "var(--ff-mono)", color: "#60A5FA", letterSpacing: 1 }}>{step}</span>}
      {title}
    </h4>
    {children}
  </section>
);

export default function MethodologyModal({ onClose, lang }) {
  const t = useGreeceT(lang);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backdropFilter: "blur(4px)" }}>
      <div style={{ padding: 32, width: "100%", maxWidth: 720, maxHeight: "85vh", overflowY: "auto", background: "var(--bg-base)", borderRadius: 12, border: "1px solid var(--border)", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)", color: "var(--text-main)", fontFamily: "var(--ff-body)" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0, fontFamily: "var(--ff-head)", fontSize: 24, color: "var(--text-title)", letterSpacing: 1 }}>{t("🇬🇷 METHODOLOGY")}</h2>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, letterSpacing: 1, textTransform: "uppercase" }}>
              <T lang={lang}
                en="How votes become 300 seats — reinforced proportional system (Law 4804/2021), constituency distribution per P.D. 26/2012, arts. 99–100"
                el="Πώς οι ψήφοι γίνονται 300 έδρες — ενισχυμένο αναλογικό σύστημα (Ν. 4804/2021), κατανομή ανά εκλογική περιφέρεια σύμφωνα με το Π.Δ. 26/2012, άρθρα 99–100"
              />
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} style={{ ...S.ghostBtn, border: "none", fontSize: 20 }}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24, fontSize: 14, lineHeight: 1.65 }}>

          {/* Intro */}
          <p style={{ margin: 0, color: "var(--text-muted)" }}>
            <T lang={lang}
              en={<>Every result is produced by the <strong style={{ color: "var(--text-title)" }}>actual legal procedure</strong>, not an optimiser or a curve-fit. Fed exact data it reproduces the official per-constituency seat table. The pipeline has two halves: a <strong>national</strong> calculation that fixes each party's total seats, and a <strong>constituency</strong> distribution that places those seats across the 59 electoral districts. Both run on top of two swing models that decide the vote shares in the first place.</>}
              el={<>Κάθε αποτέλεσμα παράγεται από την <strong style={{ color: "var(--text-title)" }}>πραγματική νομική διαδικασία</strong>, όχι από βελτιστοποίηση ή προσαρμογή καμπύλης. Με τα ακριβή δεδομένα αναπαράγει τον επίσημο πίνακα εδρών ανά περιφέρεια. Η διαδικασία έχει δύο σκέλη: έναν <strong>εθνικό</strong> υπολογισμό που καθορίζει τις συνολικές έδρες κάθε κόμματος, και μια κατανομή ανά <strong>περιφέρεια</strong> που τοποθετεί αυτές τις έδρες στις 59 εκλογικές περιφέρειες. Και τα δύο βασίζονται σε δύο μοντέλα μετατόπισης που καθορίζουν τα ποσοστά ψήφων εξαρχής.</>}
            />
          </p>

          {/* ── PART A — NATIONAL SEAT TOTALS ─────────────────────────── */}
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "var(--text-dim)", borderBottom: "1px solid var(--divider)", paddingBottom: 6 }}>{t("Part A · National seat totals")}</div>

          <Section step="A1" title={t("Electoral threshold")}>
            <p style={{ margin: 0 }}>
              <T lang={lang}
                en={<>A party must clear <strong>{GR.BONUS_TRIGGER >= 0 ? "3%" : ""}3%</strong> of the valid national vote to win any seats (adjustable 0–10% in the panel). Parties below it are removed entirely — their votes are <em>not</em> transferred, they simply leave the denominator. Each surviving party's share is then recomputed against the <strong>qualifying pool</strong> only, which is why the "After Threshold" column always exceeds the raw vote share.</>}
                el={<>Ένα κόμμα πρέπει να ξεπεράσει το <strong>3%</strong> των έγκυρων εθνικών ψήφων για να κερδίσει έδρες (ρυθμίζεται 0–10% στο πάνελ). Τα κόμματα κάτω από αυτό αποκλείονται εντελώς — οι ψήφοι τους <em>δεν</em> μεταφέρονται, απλώς αφαιρούνται από τον παρονομαστή. Το ποσοστό κάθε κόμματος που παραμένει επανυπολογίζεται μόνο ως προς τη <strong>δεξαμενή των πληρούντων τις προϋποθέσεις</strong>, γι' αυτό η στήλη «Μετά το Όριο» είναι πάντα μεγαλύτερη από το ανεπεξέργαστο ποσοστό ψήφων.</>}
              />
            </p>
            <Mono>
              qualifying = {"{"} parties with nationalShare ≥ threshold {"}"}<br/>
              qualifyingPool = Σ nationalShare(qualifying)<br/>
              finalShare(p) = nationalShare(p) / qualifyingPool
            </Mono>
          </Section>

          <Section step="A2" title={t("Winner's bonus (reinforced proportionality)")}>
            <p style={{ margin: 0 }}>
              <T lang={lang}
                en={<>The first-placed party receives a sliding bonus of seats on top of its proportional entitlement, scaled to its vote share. Below {GR.BONUS_TRIGGER}% the bonus is zero (pure proportional); at {GR.BONUS_TRIGGER}% it is {GR.BONUS_BASE} seats and rises by one seat per extra {GR.BONUS_STEP} of a percentage point, capped at {GR.BONUS_CAP}.</>}
                el={<>Το πρώτο κόμμα λαμβάνει μια κλιμακούμενη πριμοδότηση εδρών πάνω από το αναλογικό του δικαίωμα, κλιμακούμενη ανάλογα με το ποσοστό ψήφων του. Κάτω από {GR.BONUS_TRIGGER}% η πριμοδότηση είναι μηδενική (καθαρά αναλογικό)· στο {GR.BONUS_TRIGGER}% είναι {GR.BONUS_BASE} έδρες και αυξάνεται κατά μία έδρα για κάθε επιπλέον {GR.BONUS_STEP} της ποσοστιαίας μονάδας, με ανώτατο όριο τις {GR.BONUS_CAP}.</>}
              />
            </p>
            <Mono>
              bonus = 0&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if winnerShare &lt; {GR.BONUS_TRIGGER}%<br/>
              bonus = min({GR.BONUS_BASE} + ⌊(winnerShare − {GR.BONUS_TRIGGER}) ÷ {GR.BONUS_STEP}⌋, {GR.BONUS_CAP})&nbsp;&nbsp; otherwise<br/>
              <span style={{ color: "var(--text-dim)" }}>→ {GR.BONUS_BASE} seats at {GR.BONUS_TRIGGER}%, {GR.BONUS_CAP} seats at ~40%+</span>
            </Mono>
          </Section>

          <Section step="A3" title={t("Proportional allocation — Hare quota + largest remainder")}>
            <p style={{ margin: "0 0 8px" }}>
              <T lang={lang}
                en={<>The proportional pool — all {GR.TOTAL_SEATS} seats minus the winner's bonus — is shared out by the <strong>Hare quota with the largest-remainder</strong> method (the method named in the law), using each party's share of the qualifying pool.</>}
                el={<>Η αναλογική δεξαμενή — όλες οι {GR.TOTAL_SEATS} έδρες πλην της πριμοδότησης του νικητή — μοιράζεται με τη μέθοδο <strong>εκλογικού μέτρου Hare με μέγιστο υπόλοιπο</strong> (η μέθοδος που ορίζεται στον νόμο), χρησιμοποιώντας το ποσοστό κάθε κόμματος στη δεξαμενή των πληρούντων τις προϋποθέσεις.</>}
              />
            </p>
            <ol style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
              <T lang={lang}
                en={<>
                  <li><strong>Integer seats:</strong> each party takes ⌊ share × poolSeats ⌋.</li>
                  <li><strong>Remainders:</strong> the leftover seats go one-by-one to the largest fractional remainders until the pool is exhausted.</li>
                  <li><strong>Bonus added last:</strong> the winner's bonus seats are added to its proportional total.</li>
                </>}
                el={<>
                  <li><strong>Ακέραιες έδρες:</strong> κάθε κόμμα λαμβάνει ⌊ ποσοστό × δεξαμενή εδρών ⌋.</li>
                  <li><strong>Υπόλοιπα:</strong> οι εδρες που απομένουν δίνονται μία προς μία στα μεγαλύτερα δεκαδικά υπόλοιπα μέχρι να εξαντληθεί η δεξαμενή.</li>
                  <li><strong>Η πριμοδότηση προστίθεται τελευταία:</strong> οι έδρες πριμοδότησης του νικητή προστίθενται στο αναλογικό του σύνολο.</li>
                </>}
              />
            </ol>
            <Mono>
              poolSeats = {GR.TOTAL_SEATS} − bonus<br/>
              rawSeats(p) = finalShare(p) × poolSeats<br/>
              seats(p) = ⌊rawSeats(p)⌋ + largestRemainderTopUp&nbsp;&nbsp;(+ bonus if winner)
            </Mono>
          </Section>

          <Section step="A4" title={t("The 15 State (Επικρατείας) seats")}>
            <p style={{ margin: 0 }}>
              <T lang={lang}
                en={<>Of every party's total, a portion is filled from the nationwide <strong>State list</strong> rather than in a constituency. These {GR.LIST_SEATS} seats are split among qualifying parties by the same Hare quota + largest-remainder rule applied to national shares. A party that filed no State-Deputy ballot is barred from them and its entitlement passes to the next-largest remainder — this is how the model reproduces, for example, the Spartans' exclusion in June 2023 (P.D. 26/2012; AP 174/2023). The State seats are a <em>subset</em> of a party's total, not an addition: the remainder of its total is what it must win across the districts.</>}
                el={<>Από το σύνολο κάθε κόμματος, ένα μέρος καλύπτεται από τον πανελλαδικό <strong>κατάλογο Επικρατείας</strong> αντί από περιφέρεια. Αυτές οι {GR.LIST_SEATS} έδρες μοιράζονται μεταξύ των κομμάτων που πληρούν τις προϋποθέσεις με τον ίδιο κανόνα εκλογικού μέτρου Hare + μέγιστο υπόλοιπο εφαρμοζόμενο στα εθνικά ποσοστά. Ένα κόμμα που δεν κατέθεσε ψηφοδέλτιο Επικρατείας αποκλείεται από αυτές και το δικαίωμά του μεταβιβάζεται στο επόμενο μεγαλύτερο υπόλοιπο — έτσι το μοντέλο αναπαράγει, για παράδειγμα, τον αποκλεισμό των Σπαρτιατών τον Ιούνιο 2023 (Π.Δ. 26/2012· ΑΠ 174/2023). Οι έδρες Επικρατείας είναι <em>υποσύνολο</em> του συνόλου ενός κόμματος, όχι προσθήκη: το υπόλοιπο του συνόλου του είναι αυτό που πρέπει να κερδίσει στις περιφέρειες.</>}
              />
            </p>
            <Mono>
              listQuota = qualifyingPool / {GR.LIST_SEATS}<br/>
              constituencyTarget(p) = totalSeats(p) − listSeats(p)
            </Mono>
          </Section>

          {/* ── PART B — CONSTITUENCY DISTRIBUTION ────────────────────── */}
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "var(--text-dim)", borderBottom: "1px solid var(--divider)", paddingBottom: 6 }}>{t("Part B · Constituency distribution (arts. 99–100)")}</div>

          <p style={{ margin: 0, color: "var(--text-muted)" }}>
            <T lang={lang}
              en={<>Each party now has a national constituency target (total minus State seats). The law places those seats across the 59 districts in a fixed order of operations — reproduced here exactly, with no repair or "fudge" step. Every district fills to its magnitude and every party lands on its national target, so the map always reconciles with the hemicycle.</>}
              el={<>Κάθε κόμμα έχει πλέον έναν εθνικό στόχο εδρών περιφέρειας (σύνολο μείον έδρες Επικρατείας). Ο νόμος τοποθετεί αυτές τις έδρες στις 59 περιφέρειες με μια σταθερή σειρά ενεργειών — αναπαράγεται εδώ ακριβώς, χωρίς κανένα βήμα διόρθωσης. Κάθε περιφέρεια καλύπτεται πλήρως και κάθε κόμμα φτάνει στον εθνικό του στόχο, οπότε ο χάρτης συμφωνεί πάντα με το ημικύκλιο.</>}
            />
          </p>

          <Section step="B1" title={t("Single-seat constituencies — plurality")}>
            <p style={{ margin: 0 }}>
              <T lang={lang} en="The leading qualifying party takes the seat outright, whatever the margin." el="Το επικεφαλής κόμμα που πληροί τις προϋποθέσεις κερδίζει την έδρα απευθείας, όποια κι αν είναι η διαφορά." />
            </p>
          </Section>

          <Section step="B2" title={t("First distribution (πρώτη κατανομή), multi-seat constituencies")}>
            <p style={{ margin: 0 }}>
              <T lang={lang}
                en={<>Each party wins a whole seat for every full <em>electoral measure</em> its local vote contains, where the measure is the constituency's valid votes divided by its seats. Because the model carries vote <em>shares</em>, this is simply:</>}
                el={<>Κάθε κόμμα κερδίζει μία ολόκληρη έδρα για κάθε πλήρες <em>εκλογικό μέτρο</em> που περιέχει η τοπική του ψήφος, όπου το μέτρο είναι οι έγκυρες ψήφοι της περιφέρειας διαιρεμένες με τις έδρες της. Επειδή το μοντέλο διαχειρίζεται <em>ποσοστά</em> ψήφων, αυτό είναι απλά:</>}
              />
            </p>
            <Mono>
              seats₀(p, d) = ⌊ localShare(p, d) × magnitude(d) ⌋<br/>
              <span style={{ color: "var(--text-dim)" }}><T lang={lang} en="e.g. a party needs ≥ 2⁄3 ≈ 66.7% to take 2 of 3 seats here outright" el="π.χ. ένα κόμμα χρειάζεται ≥ 2⁄3 ≈ 66.7% για να κερδίσει απευθείας 2 από τις 3 έδρες εδώ" /></span>
            </Mono>
            <p style={{ margin: 0 }}>
              <T lang={lang} en="Most second and third seats are therefore decided in the remainder steps below, not here." el="Οι περισσότερες δεύτερες και τρίτες έδρες αποφασίζονται επομένως στα βήματα υπολοίπων παρακάτω, όχι εδώ." />
            </p>
          </Section>

          <Section step="B3" title={t("§100.7 — small constituencies (2- and 3-seat)")}>
            <p style={{ margin: 0 }}>
              <T lang={lang}
                en={<>Leftover seats in 2- and 3-seat districts are awarded one-by-one to the largest <strong>local remainders</strong>. If this pushes a party past its national constituency target, the surplus is stripped back — from the 3-seat then the 2-seat districts where that party's remainder is smallest — and those freed seats fall through to the next step.</>}
                el={<>Οι έδρες που απομένουν σε περιφέρειες 2 και 3 εδρών δίνονται μία προς μία στα μεγαλύτερα <strong>τοπικά υπόλοιπα</strong>. Αν αυτό οδηγήσει ένα κόμμα πάνω από τον εθνικό στόχο περιφέρειας, το πλεόνασμα αφαιρείται — πρώτα από τις περιφέρειες 3 εδρών και μετά τις 2 εδρών όπου το υπόλοιπο του κόμματος είναι μικρότερο — και αυτές οι ελεύθερες έδρες μεταφέρονται στο επόμενο βήμα.</>}
              />
            </p>
          </Section>

          <Section step="B4" title={t("§100.8 — large constituencies (4+ seats), smallest party first")}>
            <p style={{ margin: 0 }}>
              <T lang={lang}
                en={<>The remaining seats are filled party-by-party from the <strong>smallest</strong> national vote total up to the <strong>largest</strong>. Each party takes one seat per district in turn, ordered by its <em>absolute</em> remainder, repeating in passes until every party reaches its target and every seat is placed. Because the cross-district comparison is on absolute remainders, it is weighted by each district's valid-vote size (votes ÷ seats).</>}
                el={<>Οι υπόλοιπες έδρες καλύπτονται κόμμα προς κόμμα από το <strong>μικρότερο</strong> εθνικό σύνολο ψήφων προς το <strong>μεγαλύτερο</strong>. Κάθε κόμμα παίρνει μία έδρα ανά περιφέρεια με τη σειρά, ταξινομημένη κατά <em>απόλυτο</em> υπόλοιπο, επαναλαμβάνοντας σε γύρους μέχρι κάθε κόμμα να φτάσει τον στόχο του και κάθε έδρα να τοποθετηθεί. Επειδή η σύγκριση μεταξύ περιφερειών γίνεται σε απόλυτα υπόλοιπα, σταθμίζεται από το μέγεθος έγκυρων ψήφων κάθε περιφέρειας (ψήφοι ÷ έδρες).</>}
              />
            </p>
            <p style={{ margin: "8px 0 0" }}>
              <T lang={lang}
                en={<>The crucial consequence: the largest party is served <em>last</em>, so it sweeps the leftover seats in the districts no smaller party claimed. This is exactly why a dominant party takes all four seats in one district yet only one of three in another — an emergent property of the real law, not a rule we hand-coded.</>}
                el={<>Η κρίσιμη συνέπεια: το μεγαλύτερο κόμμα εξυπηρετείται <em>τελευταίο</em>, οπότε μαζεύει τις έδρες που απέμειναν στις περιφέρειες που δεν διεκδίκησε κανένα μικρότερο κόμμα. Αυτός είναι ακριβώς ο λόγος που ένα κυρίαρχο κόμμα παίρνει όλες τις τέσσερις έδρες σε μία περιφέρεια αλλά μόνο μία από τις τρεις σε μια άλλη — μια αναδυόμενη ιδιότητα του πραγματικού νόμου, όχι κανόνας που κωδικοποιήσαμε εμείς.</>}
              />
            </p>
          </Section>

          <Section step="B5" title={t("Per-district vote weight & the turnout slider")}>
            <p style={{ margin: 0 }}>
              <T lang={lang}
                en={<>The absolute-remainder comparison in B4 needs a real size for each district. Priority: a scenario's exact valid votes if known, else registered voters × turnout, else 2021 census population × turnout. The <strong>National Turnout</strong> slider shifts the national valid-vote rate in <em>logit</em> space, so a change lands non-uniformly across districts (a flat multiplier would cancel out of the seat maths entirely) and reshuffles only the genuinely marginal seats. At a shift of 0 it returns each scenario's real weights, so 2023 reproduces exactly.</>}
                el={<>Η σύγκριση απόλυτων υπολοίπων στο B4 χρειάζεται ένα πραγματικό μέγεθος για κάθε περιφέρεια. Προτεραιότητα: οι ακριβείς έγκυρες ψήφοι ενός σεναρίου αν είναι γνωστές, διαφορετικά εγγεγραμμένοι ψηφοφόροι × προσέλευση, διαφορετικά πληθυσμός απογραφής 2021 × προσέλευση. Ο ρυθμιστής <strong>Εθνικής Προσέλευσης</strong> μετατοπίζει το εθνικό ποσοστό έγκυρων ψήφων σε χώρο <em>logit</em>, οπότε μια αλλαγή προσγειώνεται ανομοιόμορφα στις περιφέρειες (ένας απλός πολλαπλασιαστής θα αναιρούνταν εντελώς από τα μαθηματικά εδρών) και αναδιατάσσει μόνο τις γνησίως οριακές έδρες. Σε μετατόπιση 0 επιστρέφει τα πραγματικά βάρη κάθε σεναρίου, οπότε το 2023 αναπαράγεται ακριβώς.</>}
              />
            </p>
          </Section>

          {/* ── PART C — SWING MODELS ─────────────────────────────────── */}
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "var(--text-dim)", borderBottom: "1px solid var(--divider)", paddingBottom: 6 }}>{t("Part C · How the vote shares are set")}</div>

          <Section step="C1" title={t("Demographic swing model")}>
            <p style={{ margin: 0 }}>
              <T lang={lang}
                en="Instead of moving parties one at a time, the Demographics tab moves whole voter blocs along six axes — youth turnout, senior turnout, urban/rural skew, education, economic precarity and gender. Each party carries a calibrated sensitivity coefficient on each axis; pushing a slider shifts every party at once by an amount proportional to that coefficient, after which the field is renormalised to 100%."
                el="Αντί να μετακινεί κόμματα ένα τη φορά, η καρτέλα Δημογραφικά μετακινεί ολόκληρες ομάδες ψηφοφόρων σε έξι άξονες — προσέλευση νέων, προσέλευση ηλικιωμένων, κλίση αστικού/αγροτικού, εκπαίδευση, οικονομική επισφάλεια και φύλο. Κάθε κόμμα έχει έναν βαθμονομημένο συντελεστή ευαισθησίας σε κάθε άξονα· η μετακίνηση ενός ρυθμιστή μετατοπίζει κάθε κόμμα ταυτόχρονα κατά ένα ποσό ανάλογο με αυτόν τον συντελεστή, μετά το οποίο το πεδίο κανονικοποιείται εκ νέου στο 100%."
              />
            </p>
            <Mono>
              Δ(p) = Σ_axis (slider_axis / 10) × sensitivity(p, axis)<br/>
              effectiveShare(p) = normalise( userShare(p) + Δ(p) )
            </Mono>
            <p style={{ margin: "8px 0 0" }}>
              <T lang={lang}
                en={<>The effect is also <strong>geographic</strong>. Five of the axes map to real per-constituency ELSTAT measures (65+ share, urbanisation, tertiary education, unemployment), standardised into population-weighted z-scores. On top of the uniform national swing, each party gets a local nudge proportional to how over- or under-represented that group is in the district — so a rise in senior turnout lifts senior-leaning parties more in older constituencies (Evrytania, Serres, Arcadia) than in young ones (the Dodecanese, East Attica). Because the z-scores are population-weighted they are nationally mean-zero, so this only redistributes the swing across the map; the national total is unchanged.</>}
                el={<>Η επίδραση είναι επίσης <strong>γεωγραφική</strong>. Πέντε από τους άξονες αντιστοιχούν σε πραγματικά μεγέθη ΕΛΣΤΑΤ ανά περιφέρεια (ποσοστό 65+, αστικοποίηση, τριτοβάθμια εκπαίδευση, ανεργία), τυποποιημένα σε z-scores σταθμισμένα με τον πληθυσμό. Πάνω στην ομοιόμορφη εθνική μετατόπιση, κάθε κόμμα παίρνει μια τοπική προσαρμογή ανάλογη με το πόσο υπερ- ή υπο-εκπροσωπείται αυτή η ομάδα στην περιφέρεια — οπότε μια αύξηση στην προσέλευση ηλικιωμένων ανεβάζει περισσότερο τα κόμματα που τους προσελκύουν σε πιο ηλικιωμένες περιφέρειες (Ευρυτανία, Σέρρες, Αρκαδία) απ' ότι σε νεανικές (Δωδεκάνησα, Ανατολική Αττική). Επειδή τα z-scores είναι σταθμισμένα με τον πληθυσμό, έχουν εθνικό μέσο όρο μηδέν, οπότε αυτό απλώς αναδιανέμει τη μετατόπιση στον χάρτη· το εθνικό σύνολο παραμένει αμετάβλητο.</>}
              />
            </p>
          </Section>

          <Section step="C2" title={t("District-level logit swing")}>
            <p style={{ margin: 0 }}>
              <T lang={lang}
                en={<>The national swing is mapped onto each district in <strong>logit space</strong>, not by adding raw percentage points. This keeps every district between 0% and 100% and correctly compresses swings where a party is already very strong or very weak. A damping factor scales the swing by the party's local baseline:</>}
                el={<>Η εθνική μετατόπιση αντιστοιχίζεται σε κάθε περιφέρεια σε <strong>χώρο logit</strong>, όχι με πρόσθεση ανεπεξέργαστων ποσοστιαίων μονάδων. Αυτό διατηρεί κάθε περιφέρεια μεταξύ 0% και 100% και συμπιέζει σωστά τις μετατοπίσεις όπου ένα κόμμα είναι ήδη πολύ δυνατό ή πολύ αδύναμο. Ένας συντελεστής απόσβεσης κλιμακώνει τη μετατόπιση ανάλογα με την τοπική βάση του κόμματος:</>}
              />
            </p>
            <Mono>
              swing(p) = logit(effectiveShare p) − logit(baseShare p)&nbsp;&nbsp;<span style={{ color: "var(--text-dim)" }}>// national, in logit space</span><br/>
              damping = max(0.25, 1 − ((localBase − 5) ÷ 60) × 0.75)<br/>
              localShare(p, d) = logit⁻¹( logit(localBase) + swing(p) × damping )
            </Mono>
            <p style={{ margin: 0 }}>
              <T lang={lang}
                en={<>For a locally dominant party (base &gt; 65%) the damping floors at 0.25×, preventing absurd ceilings; for a micro-party (base &lt; 5%) it intentionally exceeds 1.0×, so a national surge can realistically push it over 3% in its strongholds. Each district is then renormalised to 100%.</>}
                el={<>Για ένα τοπικά κυρίαρχο κόμμα (βάση &gt; 65%) η απόσβεση φτάνει στο κατώφλι 0.25×, αποτρέποντας παράλογα ανώτατα όρια· για ένα μικρό κόμμα (βάση &lt; 5%) ξεπερνά σκόπιμα το 1.0×, ώστε μια εθνική άνοδος να μπορεί ρεαλιστικά να το πάει πάνω από 3% στα προπύργιά του. Κάθε περιφέρεια κανονικοποιείται εκ νέου στο 100%.</>}
              />
            </p>
            <p style={{ margin: "8px 0 0", color: "var(--text-muted)", fontSize: 13 }}>
              <T lang={lang}
                en="District baselines come from the real 2023 constituency results; other scenarios derive their district shape by applying this same logit swing from 2023 to the new national totals, and successor/new parties inherit a parent party's geography through a lineage map."
                el="Οι βάσεις περιφερειών προέρχονται από τα πραγματικά αποτελέσματα περιφέρειας του 2023· άλλα σενάρια προκύπτουν εφαρμόζοντας την ίδια λογιστική μετατόπιση από το 2023 στα νέα εθνικά σύνολα, και τα διάδοχα/νέα κόμματα κληρονομούν τη γεωγραφία ενός μητρικού κόμματος μέσω χάρτη καταγωγής."
              />
            </p>
          </Section>

          {/* ── PART D — MONTE CARLO ──────────────────────────────────── */}
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "var(--text-dim)", borderBottom: "1px solid var(--divider)", paddingBottom: 6 }}>{t("Part D · Monte Carlo forecast")}</div>

          <p style={{ margin: 0, color: "var(--text-muted)" }}>
            <T lang={lang}
              en={<>A single seat projection hides how much a result can move on a normal polling error. The Monte Carlo layer treats your current numbers as the <em>centre</em> of a distribution, perturbs them thousands of times by a realistic error, and re-runs the full seat engine above on every draw — so each simulated parliament obeys the same threshold, bonus and §99–100 rules.</>}
              el={<>Μία μοναδική πρόβλεψη εδρών κρύβει πόσο μπορεί να μετακινηθεί ένα αποτέλεσμα από ένα κανονικό σφάλμα δημοσκόπησης. Το επίπεδο Μόντε Κάρλο αντιμετωπίζει τους τρέχοντες αριθμούς σας ως το <em>κέντρο</em> μιας κατανομής, τους διαταράσσει χιλιάδες φορές με ένα ρεαλιστικό σφάλμα, και επανεκτελεί τον πλήρη μηχανισμό εδρών παραπάνω σε κάθε δοκιμή — οπότε κάθε προσομοιωμένη Βουλή υπακούει στους ίδιους κανόνες ορίου, πριμοδότησης και §99–100.</>}
            />
          </p>

          <Section step="D1" title={t("The error model")}>
            <p style={{ margin: 0 }}>
              <T lang={lang}
                en={<>On each of ~5,000 iterations every party is shifted by two shocks: a <strong>common</strong> shock shared by all parties (the "all pollsters wrong in the same direction" risk) and a party-specific <strong>idiosyncratic</strong> shock. Both are drawn from a <strong>Student-t</strong> distribution (≈5 degrees of freedom) rather than a normal, so the occasional large miss — the fat tail real forecasters worry about — actually shows up. The split between the two is the correlation parameter (≈0.35), and the error scales mildly with party size, so a 30% party can miss by more points than a 3% party.</>}
                el={<>Σε κάθε μία από τις ~5.000 επαναλήψεις κάθε κόμμα μετατοπίζεται από δύο κλυδωνισμούς: έναν <strong>κοινό</strong> κλυδωνισμό που μοιράζονται όλα τα κόμματα (ο κίνδυνος «όλες οι δημοσκοπήσεις λάθος προς την ίδια κατεύθυνση») και έναν <strong>ιδιοσυγκρασιακό</strong> κλυδωνισμό ανά κόμμα. Και οι δύο αντλούνται από κατανομή <strong>Student-t</strong> (≈5 βαθμοί ελευθερίας) αντί κανονικής, ώστε να εμφανίζεται το περιστασιακό μεγάλο σφάλμα — η βαριά ουρά που ανησυχεί τους πραγματικούς αναλυτές προβλέψεων. Ο διαμοιρασμός μεταξύ των δύο είναι η παράμετρος συσχέτισης (≈0.35), και το σφάλμα κλιμακώνεται ελαφρά με το μέγεθος του κόμματος, οπότε ένα κόμμα 30% μπορεί να αστοχήσει κατά περισσότερες μονάδες από ένα κόμμα 3%.</>}
              />
            </p>
            <Mono>
              sizeScale(p) = 0.5 + min(1.5, share(p) / 20)<br/>
              shared(p)&nbsp;&nbsp;= t₅ × σ × correlation × sizeScale(p)<br/>
              idio(p)&nbsp;&nbsp;&nbsp;&nbsp;= t₅ × σ × (1 − correlation) × sizeScale(p)<br/>
              draw(p)&nbsp;&nbsp;&nbsp;= max(0, share(p) + shared(p) + idio(p))<br/>
              <span style={{ color: "var(--text-dim)" }}>σ ≈ 2.5 pts · correlation ≈ 0.35 · iterations ≈ 5000</span>
            </Mono>
          </Section>

          <Section step="D2" title={t("What it reports")}>
            <p style={{ margin: 0 }}>
              <T lang={lang}
                en={<>For each party the simulation records its full seat distribution and summarises it as a median with 90% and 50% intervals (the p5–p95 and p25–p75 bands), plus the share of simulations in which it finishes first and the share in which it wins an outright 151-seat majority. It also reports how often parliament is hung. The complete seat matrix from every draw is kept, so the <strong>coalition builder</strong> can return the probability that any chosen set of parties reaches 151 instantly, without re-simulating.</>}
                el={<>Για κάθε κόμμα η προσομοίωση καταγράφει την πλήρη κατανομή εδρών του και τη συνοψίζει ως διάμεσο με διαστήματα 90% και 50% (οι ζώνες p5–p95 και p25–p75), μαζί με το ποσοστό προσομοιώσεων στις οποίες τερματίζει πρώτο και το ποσοστό στις οποίες κερδίζει αυτοδύναμη πλειοψηφία 151 εδρών. Αναφέρει επίσης πόσο συχνά η Βουλή είναι ακυβέρνητη. Ο πλήρης πίνακας εδρών από κάθε δοκιμή διατηρείται, οπότε ο <strong>δημιουργός συνασπισμού</strong> μπορεί να επιστρέψει την πιθανότητα οποιουδήποτε επιλεγμένου συνόλου κομμάτων να φτάσει τις 151 ακαριαία, χωρίς νέα προσομοίωση.</>}
              />
            </p>
            <Mono>
              per party → median, p5 · p25 · p75 · p95, min/max, P(first), P(majority)<br/>
              overall&nbsp;&nbsp; → P(hung parliament)<br/>
              coalition → P(Σ seats ≥ {GR.MAJORITY}) from the stored matrix
            </Mono>
          </Section>

          {/* ── Scenarios & sources ───────────────────────────────────── */}
          <Section title={t("Scenarios & data sources")}>
            <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
              <T lang={lang}
                en={<>
                  <li><strong>May 2026 Polling Average:</strong> a live per-party average of the most recent published polls, scraped from Wikipedia.</li>
                  <li><strong>June 2023 Legislative:</strong> official Ministry of the Interior final results (5,273,699 valid votes).</li>
                  <li><strong>July 2019 Legislative:</strong> official Ministry of the Interior final results (5,769,542 valid votes).</li>
                </>}
                el={<>
                  <li><strong>Μέσος Όρος Δημοσκοπήσεων Μαΐου 2026:</strong> ζωντανός μέσος όρος ανά κόμμα από τις πιο πρόσφατες δημοσιευμένες δημοσκοπήσεις, αντλημένος από τη Wikipedia.</li>
                  <li><strong>Βουλευτικές Εκλογές Ιουνίου 2023:</strong> επίσημα τελικά αποτελέσματα Υπουργείου Εσωτερικών (5.273.699 έγκυρες ψήφοι).</li>
                  <li><strong>Βουλευτικές Εκλογές Ιουλίου 2019:</strong> επίσημα τελικά αποτελέσματα Υπουργείου Εσωτερικών (5.769.542 έγκυρες ψήφοι).</li>
                </>}
              />
            </ul>
          </Section>

          {/* ── Limitations (corrected) ───────────────────────────────── */}
          <section style={{ padding: 16, background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: 8 }}>
            <h4 style={{ margin: "0 0 8px", color: "#EF4444", fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }}>{t("⚠ Known limitations")}</h4>
            <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: "var(--text-muted)" }}>
              <T lang={lang}
                en={<>
                  <li>The demographic sensitivities and district swing multipliers are <strong>modelling assumptions</strong> calibrated on 2019 and 2023 patterns, not coefficients estimated from individual-level survey microdata. Brand-new parties without electoral history are approximated through the lineage map and should be read with caution.</li>
                  <li>Seat outputs are point estimates and genuinely sensitive: a ±1-point national polling error can move the winner's seat count by 5–15 seats. The Monte Carlo layer exists precisely to quantify this.</li>
                  <li>The model assumes voters behave identically on the constituency ballot and the State-list ballot; in reality a minority split their vote between the two.</li>
                  <li>The §100.8 cross-district ranking is exact only when fed an election's true per-constituency valid votes; for hypothetical scenarios it uses census/turnout proxies, so a handful of genuinely marginal seats may differ from an official count.</li>
                </>}
                el={<>
                  <li>Οι δημογραφικές ευαισθησίες και οι πολλαπλασιαστές μετατόπισης περιφέρειας είναι <strong>υποθέσεις μοντελοποίησης</strong> βαθμονομημένες στα πρότυπα του 2019 και 2023, όχι συντελεστές εκτιμημένοι από μικροδεδομένα ερευνών σε ατομικό επίπεδο. Ολοκαίνουργια κόμματα χωρίς εκλογικό ιστορικό προσεγγίζονται μέσω του χάρτη καταγωγής και πρέπει να διαβάζονται με προσοχή.</li>
                  <li>Οι έδρες που προκύπτουν είναι σημειακές εκτιμήσεις και πραγματικά ευαίσθητες: ένα εθνικό σφάλμα δημοσκόπησης ±1 μονάδας μπορεί να μετακινήσει τις έδρες του νικητή κατά 5–15 έδρες. Το επίπεδο Μόντε Κάρλο υπάρχει ακριβώς για να το ποσοτικοποιήσει αυτό.</li>
                  <li>Το μοντέλο υποθέτει ότι οι ψηφοφόροι συμπεριφέρονται ταυτόσημα στο ψηφοδέλτιο περιφέρειας και στο ψηφοδέλτιο Επικρατείας· στην πραγματικότητα μια μειοψηφία μοιράζει την ψήφο τους μεταξύ των δύο.</li>
                  <li>Η κατάταξη μεταξύ περιφερειών του §100.8 είναι ακριβής μόνο όταν τροφοδοτείται με τις πραγματικές έγκυρες ψήφους ανά περιφέρεια μιας εκλογής· για υποθετικά σενάρια χρησιμοποιεί υποκατάστατα απογραφής/προσέλευσης, οπότε μερικές γνησίως οριακές έδρες μπορεί να διαφέρουν από μια επίσημη καταμέτρηση.</li>
                </>}
              />
            </ul>
          </section>

          <p style={{ margin: 0, color: "var(--text-dim)", fontSize: 12, fontStyle: "italic" }}>
            <T lang={lang}
              en="The map renders all 59 official electoral constituencies, including the urban splits (Athens A, B1, B2, B3; Thessaloniki A, B; Piraeus A, B), with a dedicated Athens metropolitan inset. Mount Athos carries no parliamentary seat and is excluded from the seat maths."
              el="Ο χάρτης απεικονίζει όλες τις 59 επίσημες εκλογικές περιφέρειες, συμπεριλαμβανομένων των αστικών υποδιαιρέσεων (Αθήνα Α, Β1, Β2, Β3· Θεσσαλονίκη Α, Β· Πειραιάς Α, Β), με ειδικό ένθετο για τη μητροπολιτική περιοχή της Αθήνας. Το Άγιο Όρος δεν έχει βουλευτική έδρα και αποκλείεται από τα μαθηματικά εδρών."
            />
          </p>

        </div>
      </div>
    </div>
  );
}
