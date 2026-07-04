// PrivacyModal.jsx
// Single shared privacy policy, used by every simulator (and the welcome screen)
// instead of each one keeping its own copy of the same text.
const ACCENT = "#2563EB";

const Section = ({ n, title, children }) => (
  <section>
    <h4 style={{ margin: "0 0 8px", color: "var(--text-title)", fontSize: 15, display: "flex", gap: 8, alignItems: "baseline" }}>
      <span style={{ fontSize: 11, fontFamily: "var(--ff-mono)", color: ACCENT }}>{n}</span>
      {title}
    </h4>
    {children}
  </section>
);

export default function PrivacyModal({ onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ padding: 32, width: "100%", maxWidth: 680, maxHeight: "85vh", overflowY: "auto", background: "var(--bg-mid)", borderRadius: 12, border: "1px solid var(--border)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", color: "var(--text-main)", fontFamily: "var(--ff-body)", textAlign: "left" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 16 }}>
          <div>
            <div style={{ fontSize: 10, fontFamily: "var(--ff-mono)", color: "var(--text-dim)", letterSpacing: 2, textTransform: "uppercase" }}>PSEPHOSCAST_SYSTEM</div>
            <h2 style={{ margin: "4px 0 0", fontFamily: "var(--ff-head)", fontSize: 24, color: "var(--text-title)", letterSpacing: 1 }}>PRIVACY POLICY</h2>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, letterSpacing: 0.5 }}>Last updated: June 2026</div>
          </div>
          <button className="icon-btn" onClick={onClose} style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--text-muted)", borderRadius: 4, cursor: "pointer", fontSize: 20, padding: "5px 10px", lineHeight: 1 }}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22, fontSize: 14, lineHeight: 1.65 }}>

          <p style={{ margin: 0, color: "var(--text-muted)" }}>
            PsephosCast.gr is a free, non-commercial academic web application developed by Konstantinos Davakos (Department of Economics, University of Ioannina, Greece). For any privacy-related enquiries, please use the Support page of this website.
          </p>

          <Section n="1" title="Data Collection & Session Storage">
            <p style={{ margin: 0 }}>
              We do not directly collect, store, process, or share any personal data. The application does not use user accounts, cookies, tracking pixels, analytics scripts, or any form of behavioural profiling. We use temporary browser storage (<code>sessionStorage</code>) exclusively to transfer your custom scenario configurations (e.g., slider values) between simulators and their analytics views. This data remains entirely on your device and is automatically erased when you close your browser tab.
            </p>
          </Section>

          <Section n="2" title="Local Processing & File Downloads">
            <p style={{ margin: 0 }}>
              All statistical analyses, correlation matrices, and file/image downloads (CSV, Excel, Word, PDF, PNG) are generated entirely client-side within your browser. At no point is your custom configuration, analysis output, or selected filename transmitted to or processed by an external server.
            </p>
          </Section>

          <Section n="3" title="Third-Party Infrastructure">
            <p style={{ margin: "0 0 10px" }}>
              Although we collect no data ourselves, certain standard technical operations involve third-party services. The legal basis for each is Legitimate Interests (Article 6(1)(f) GDPR), as they are technically necessary to deliver the application.
            </p>
            <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              <li><strong>Hosting Provider:</strong> The application is hosted as a static site. Our hosting provider may temporarily log standard connection metadata — including IP addresses and request timestamps — strictly for security and infrastructure maintenance. This data is not shared with us and is typically retained for no longer than 30 days.</li>
              <li><strong>Tailwind CSS CDN (cdn.tailwindcss.com):</strong> The welcome screen loads a styling framework from the Tailwind CDN. Your browser contacts their servers to retrieve this file, which may result in your IP address and standard browser headers being logged by Tailwind. This is a one-time request on page load and no user data is transmitted beyond standard HTTP metadata.</li>
              <li><strong>Data APIs — Read-Only:</strong> The application fetches publicly available data from the Wikimedia Foundation API (live polling aggregates), the Hellenic Statistical Authority (ELSTAT), and the Statistical Service of Cyprus (CyStat). These are strictly one-directional requests initiated by the application. No user information of any kind is transmitted to these services.</li>
            </ul>
          </Section>

          <Section n="4" title="Your Rights Under GDPR">
            <p style={{ margin: "0 0 10px" }}>
              As a resident of the European Economic Area, you have the following rights regarding any personal data processed in connection with your use of this site:
            </p>
            <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
              <li><strong>Access</strong> — request confirmation of whether any data about you is held.</li>
              <li><strong>Rectification</strong> — request correction of inaccurate data.</li>
              <li><strong>Erasure</strong> — request deletion of data where legally applicable.</li>
              <li><strong>Restriction</strong> — request that processing be limited in certain circumstances.</li>
              <li><strong>Objection</strong> — object to processing carried out on the basis of legitimate interests.</li>
              <li><strong>Portability</strong> — receive data in a structured, machine-readable format.</li>
            </ul>
            <p style={{ margin: "10px 0 0" }}>
              Because we do not directly hold personal data, most rights must be exercised with the relevant infrastructure provider. We are happy to assist — please contact us via the Support page.
            </p>
          </Section>

          <Section n="5" title="Supervisory Authority">
            <p style={{ margin: 0 }}>
              You have the right to lodge a complaint with the competent data protection authority. For users in Greece, this is the Hellenic Data Protection Authority (HDPA). Website:{" "}
              <a href="https://www.dpa.gr/" target="_blank" rel="noopener noreferrer" style={{ color: ACCENT }}>dpa.gr</a>
              {" "}· Telephone: +30 210 6475 600.
            </p>
          </Section>

          <Section n="6" title="Changes to This Policy">
            <p style={{ margin: 0 }}>
              We may update this policy to reflect technical changes to the application. The date at the top of this page will always reflect the most recent revision.
            </p>
          </Section>

        </div>

        <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ background: ACCENT, color: "#fff", border: "none", borderRadius: 6, padding: "8px 24px", cursor: "pointer", fontFamily: "var(--ff-body)", fontWeight: 600 }}>Close</button>
        </div>
      </div>
    </div>
  );
}
