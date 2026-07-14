// CookiesModal.jsx
// Single shared cookies policy, used by every simulator (and the welcome screen)
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

export default function CookiesModal({ onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ padding: 32, width: "100%", maxWidth: 680, maxHeight: "85vh", overflowY: "auto", background: "var(--bg-mid)", borderRadius: 12, border: "1px solid var(--border)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", color: "var(--text-main)", fontFamily: "var(--ff-body)", textAlign: "left" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 16 }}>
          <div>
            <div style={{ fontSize: 10, fontFamily: "var(--ff-mono)", color: "var(--text-dim)", letterSpacing: 2, textTransform: "uppercase" }}>PSEPHOSCAST_SYSTEM</div>
            <h2 style={{ margin: "4px 0 0", fontFamily: "var(--ff-head)", fontSize: 24, color: "var(--text-title)", letterSpacing: 1 }}>COOKIES POLICY</h2>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, letterSpacing: 0.5 }}>Last updated: July 2026</div>
          </div>
          <button className="icon-btn" onClick={onClose} style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--text-muted)", borderRadius: 4, cursor: "pointer", fontSize: 20, padding: "5px 10px", lineHeight: 1 }}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22, fontSize: 14, lineHeight: 1.65 }}>

          <p style={{ margin: 0, color: "var(--text-muted)" }}>
            PsephosCast.gr is a free, non-commercial academic web application developed by Konstantinos Davakos (Department of Economics, University of Ioannina, Greece). This page explains, specifically, our use (or non-use) of cookies and similar tracking technologies. It complements our full <strong>Privacy Policy</strong>, available elsewhere on this site.
          </p>

          <Section n="1" title="We Do Not Use Cookies">
            <p style={{ margin: 0 }}>
              PsephosCast.gr does not set or read any cookies — no session cookies, no persistent cookies, no third-party cookies, no tracking pixels, and no advertising or analytics identifiers of any kind. No cookie banner or consent prompt is shown because none is required: nothing is stored on your device that qualifies as a cookie under the EU ePrivacy Directive or GDPR.
            </p>
          </Section>

          <Section n="2" title="Session Storage (Not a Cookie)">
            <p style={{ margin: 0 }}>
              We use your browser's built-in <code>sessionStorage</code> — a mechanism distinct from cookies — exclusively to carry your custom scenario configuration (e.g., slider values) between a simulator and its analytics view. This data never leaves your device, is never transmitted to any server, and is automatically and permanently erased the moment you close the browser tab.
            </p>
          </Section>

          <Section n="3" title="Third-Party Requests">
            <p style={{ margin: 0 }}>
              Loading this site causes your browser to request files from the Tailwind CSS CDN and to fetch public data from the Wikimedia Foundation API, ELSTAT, and CyStat. These are standard one-directional HTTP requests, not cookies, and to the best of our knowledge none of these providers set cookies on this domain in connection with those requests. Full detail is in our Privacy Policy.
            </p>
          </Section>

          <Section n="4" title="If This Changes">
            <p style={{ margin: 0 }}>
              Should we ever introduce analytics, advertising, or any technology that sets cookies, this policy will be updated first, a cookie-consent banner will be added, and the "Last updated" date above will change accordingly. As of the date above, no such technology is in use.
            </p>
          </Section>

          <Section n="5" title="Questions">
            <p style={{ margin: 0 }}>
              For any questions about this policy, please use the Support page of this website.
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
