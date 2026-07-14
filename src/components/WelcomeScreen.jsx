import { useState, useEffect } from "react";
import PrivacyModal from "./PrivacyModal";
import CookiesModal from "./CookiesModal";

const IconClose = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const Modal = ({ onClose, title, maxWidth = 600, children }) => (
  <div
    style={{ position: "fixed", inset: 0, backgroundColor: "rgba(5, 13, 34, 0.85)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 }}
    onClick={onClose}
  >
    <div
      role="dialog" aria-modal="true"
      className="hardware-module text-on-surface"
      style={{ borderRadius: 2, width: "100%", maxWidth, padding: "28px 32px 32px", maxHeight: "85vh", overflowY: "auto" }}
      onClick={e => e.stopPropagation()}
    >
      <div className="screw-head screw-tl"></div>
      <div className="screw-head screw-tr"></div>
      <div className="screw-head screw-bl"></div>
      <div className="screw-head screw-br"></div>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, paddingBottom: 16, borderBottom: "0.5px solid rgba(255, 255, 255, 0.15)" }}>
        <div>
          <div className="mono-data" style={{ fontSize: 10, letterSpacing: 3, color: "#b4c5ff", textTransform: "uppercase", marginBottom: 4 }}>PSEPHOSCAST_SYSTEM</div>
          <h3 style={{ margin: 0, fontFamily: "'Bebas Neue', cursive", fontSize: 32, letterSpacing: 1.5, color: "#ffffff", lineHeight: 1 }}>{title}</h3>
        </div>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.15)", cursor: "pointer", padding: "7px 8px", borderRadius: 2, color: "#dae2ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: 16, transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background="rgba(255,255,255,0.1)"} onMouseOut={e => e.currentTarget.style.background="rgba(255,255,255,0.05)"}>
          <IconClose size={16} />
        </button>
      </div>
      <div style={{ fontFamily: "'Crimson Pro', Georgia, serif", fontSize: 16, lineHeight: 1.75, color: "#dae2ff", display: "flex", flexDirection: "column", gap: 16 }}>
        {children}
      </div>
    </div>
  </div>
);

export default function WelcomeScreen({ theme = 'dark', setTheme }) {
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [showCredits, setShowCredits]       = useState(false);
  const [showContact, setShowContact]       = useState(false);
  const [showPrivacy, setShowPrivacy]       = useState(false);
  const [showCookies, setShowCookies]       = useState(false);
  const [isTailwindLoaded, setIsTailwindLoaded] = useState(false);

  // Fallback routing if react-router isn't set up yet
  const handleNavigation = (path) => {
    window.location.href = path;
  };

  // Dynamically inject Tailwind and the custom Config so it works with zero setup
  useEffect(() => {
    if (document.getElementById('psephos-tailwind')) {
      setIsTailwindLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.id = 'psephos-tailwind';
    script.src = 'https://cdn.tailwindcss.com?plugins=forms,container-queries';
    script.onload = () => {
      window.tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              "primary": "#b4c5ff",
              "secondary": "#9ddf2e",
              "tertiary": "#ffb77d",
              "background": "#091328",
              "surface-dark": "rgba(15, 23, 42, 0.8)",
              "on-surface-variant": "#c3c6d7",
              "primary-fixed-dim": "#b4c5ff",
              "status-live": "#dc2626",
              "status-wip": "#D97706",
              "surface-container-lowest": "#050d22"
            },
            spacing: {
              "grid-gutter": "32px",
              "md": "24px",
              "xl": "80px",
              "lg": "48px",
              "sm": "16px",
              "xs": "8px",
              "base": "4px",
              "container-max": "1120px"
            },
            fontFamily: {
              "body-md": ["Crimson Pro"],
              "headline-md": ["Bebas Neue"],
              "headline-lg": ["Bebas Neue"],
              "label-md": ["IBM Plex Mono"],
              "label-sm": ["IBM Plex Mono"],
              "display-lg": ["Bebas Neue"],
              "display-lg-mobile": ["Bebas Neue"]
            },
            fontSize: {
              "headline-md": ["24px", { "lineHeight": "1.1", "letterSpacing": "0.04em" }],
              "headline-lg": ["32px", { "lineHeight": "1.1", "letterSpacing": "0.06em" }],
              "label-md": ["10.5px", { "lineHeight": "1.2", "letterSpacing": "0.05em" }],
              "label-sm": ["9px", { "lineHeight": "1.2", "letterSpacing": "0.05em" }],
              "display-lg": ["96px", { "lineHeight": "1.0", "letterSpacing": "0.1em" }],
              "display-lg-mobile": ["64px", { "lineHeight": "1.0", "letterSpacing": "0.08em" }],
              "body-md": ["15px", { "lineHeight": "1.6" }],
              "body-lg": ["18px", { "lineHeight": "1.75" }]
            },
            boxShadow: {
              'glass': '0 4px 24px -1px rgba(0, 0, 0, 0.3)',
            }
          }
        }
      };
      setIsTailwindLoaded(true);
    };
    document.head.appendChild(script);
  }, []);

  if (!isTailwindLoaded) {
    return <div style={{ minHeight: '100vh', width: '100%', backgroundColor: '#091328' }} />;
  }

  return (
    <div className={`w-full bg-background text-white min-h-screen flex flex-col font-body-md bg-tech-grid ${theme}`}>
      <style>{`
        /* FORCES THE REACT ROOT TO STRETCH TO FULL SCREEN */
        html, body, #root {
            width: 100% !important;
            min-height: 100vh !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow-x: hidden;
            background-color: #091328;
        }

        .bg-tech-grid {
            position: relative;
            z-index: 1;
        }

        .bg-tech-grid::before {
            content: '';
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background-image: 
                linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                linear-gradient(rgba(255, 255, 255, 0.01) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.01) 1px, transparent 1px);
            background-size: 100px 100px, 100px 100px, 20px 20px, 20px 20px;
            background-position: center center;
            z-index: -2;
            pointer-events: none;
        }

        .gauge-container {
            position: absolute;
            top: 15%;
            left: 50%;
            transform: translateX(-50%);
            width: 800px;
            height: 400px;
            overflow: hidden;
            z-index: -1;
            pointer-events: none;
            opacity: 0.8;
        }

        .gauge-arc {
            position: absolute;
            top: 0; left: 0;
            width: 800px; height: 800px;
            border-radius: 50%;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .gauge-ticks {
            position: absolute;
            top: 0; left: 0;
            width: 800px; height: 800px;
            border-radius: 50%;
            background: conic-gradient(
                from -90deg,
                transparent 0deg,
                rgba(255, 255, 255, 0.2) 1deg,
                transparent 2deg
            );
            mask-image: radial-gradient(transparent 390px, black 395px);
            -webkit-mask-image: radial-gradient(transparent 390px, black 395px);
        }
        
        .gauge-labels {
            position: absolute; 
            width: 100%; height: 100%;
        }
        
        .gauge-label {
            position: absolute;
            font-family: 'IBM Plex Mono', monospace;
            font-size: 10px;
            color: rgba(255, 255, 255, 0.3);
            letter-spacing: 0.1em;
            transform-origin: 400px 400px;
        }
        
        .gauge-label-left { top: 380px; left: -20px; }
        .gauge-label-right { top: 380px; right: -20px; text-align: right; }
        .gauge-label-top { top: -20px; left: 50%; transform: translateX(-50%); }

        .hardware-module {
            background: rgba(9, 19, 40, 0.6);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 0.5px solid rgba(255, 255, 255, 0.15);
            box-shadow: inset 0 0 0 0.5px rgba(255, 255, 255, 0.05), 0 4px 24px -1px rgba(0, 0, 0, 0.3);
            position: relative;
        }
        
        .hardware-module::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; height: 1px;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            z-index: 2;
        }

        .divider-x {
            height: 0.5px;
            background: rgba(255, 255, 255, 0.1);
            width: 100%;
        }

        .divider-y {
            width: 0.5px;
            background: rgba(255, 255, 255, 0.1);
            height: 100%;
        }

        .card-hover {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .card-hover:hover {
            transform: translateY(-2px);
            border-color: rgba(255, 255, 255, 0.3);
            box-shadow: inset 0 0 0 0.5px rgba(255, 255, 255, 0.1), 0 12px 32px -4px rgba(0, 0, 0, 0.4);
        }
        
        .indicator-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
        }

        .screw-head {
            position: absolute;
            width: 4px;
            height: 4px;
            border: 0.5px solid rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .screw-head::after {
            content: '';
            width: 2px;
            height: 0.5px;
            background: rgba(255, 255, 255, 0.2);
            transform: rotate(45deg);
        }
        
        .screw-tl { top: 6px; left: 6px; }
        .screw-tr { top: 6px; right: 6px; }
        .screw-bl { bottom: 6px; left: 6px; }
        .screw-br { bottom: 6px; right: 6px; }

        .mono-data {
            font-family: 'IBM Plex Mono', monospace;
        }
      `}</style>

      {/* TopNavBar */}
      <nav className="w-full top-0 sticky backdrop-blur-xl bg-surface-dark/80 border-b border-white/10 shadow-sm z-50">
        <div className="max-w-container-max mx-auto flex justify-between items-center h-20 px-lg">
          <div className="font-headline-lg text-headline-lg text-white cursor-pointer hover:text-primary transition-colors duration-300">
            PsephosCast.gr
          </div>
          <div className="hidden md:flex space-x-md">
            <button onClick={() => setShowQuickStart(true)} className="text-white border-b border-primary pb-1 font-label-md mono-data hover:text-primary transition-colors duration-300">QUICK_START</button>
            <button onClick={() => setShowCredits(true)} className="text-on-surface-variant font-label-md mono-data hover:text-primary transition-colors duration-300">DATA_SOURCES</button>
            <button onClick={() => setShowContact(true)} className="text-on-surface-variant font-label-md mono-data hover:text-primary transition-colors duration-300">CONTACT</button>
          </div>
          <div className="flex items-center space-x-sm text-on-surface-variant">
            <button 
              onClick={() => setTheme && setTheme(t => t === "dark" ? "light" : "dark")}
              className="scale-95 active:scale-90 transition-transform hover:text-white transition-colors duration-300"
            >
              <span className="material-symbols-outlined text-[20px]">{theme === 'dark' ? "light_mode" : "dark_mode"}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Instrument Gauge Background */}
      <div className="gauge-container">
        <div className="gauge-arc"></div>
        <div className="gauge-ticks"></div>
        <div className="gauge-labels">
          <div className="gauge-label gauge-label-left">L -100</div>
          <div className="gauge-label gauge-label-top">0.00</div>
          <div className="gauge-label gauge-label-right">R +100</div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center pt-xl pb-xl px-sm md:px-lg w-full max-w-container-max mx-auto relative z-10">
        
        {/* Hero Section */}
        <section className="text-center mb-xl w-full max-w-3xl relative">
          <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-white mb-sm uppercase tracking-widest">
            PsephosCast.gr
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto italic">
            Logit-swing election modelling — adjust polling, demographics & thresholds
          </p>
        </section>

        {/* Country Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-grid-gutter w-full max-w-4xl">
          
          {/* Greece Card */}
          <div onClick={() => handleNavigation('/greece')} className="hardware-module rounded-sm relative overflow-hidden card-hover group shadow-glass flex flex-col justify-between h-[220px] cursor-pointer">
            <div className="screw-head screw-tl"></div>
            <div className="screw-head screw-tr"></div>
            <div className="screw-head screw-bl"></div>
            <div className="screw-head screw-br"></div>
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary group-hover:w-[4px] transition-all"></div>
            <div className="p-md flex-grow flex flex-col">
              <div className="flex justify-between items-start mb-auto">
                <div>
                  <h2 className="font-headline-md text-headline-md text-white uppercase group-hover:text-primary transition-colors leading-none mb-1">GREECE</h2>
                  <span className="font-label-sm text-label-sm text-on-surface-variant mono-data uppercase">HELLENIC_REPUBLIC</span>
                </div>
                <div className="flex items-center space-x-2 border border-white/10 rounded px-2 py-1 bg-black/20">
                  <span className="indicator-dot bg-status-live shadow-[0_0_8px_rgba(220,38,38,0.6)]"></span>
                  <span className="font-label-sm text-label-sm text-white mono-data uppercase">LIVE_MODEL</span>
                </div>
              </div>
              <div className="divider-x my-md"></div>
              <div className="flex h-12">
                <div className="flex-1 pr-md">
                  <div className="font-label-sm text-label-sm text-on-surface-variant mono-data mb-1">SEATS_TOTAL</div>
                  <div className="font-label-md text-label-md text-white mono-data">300</div>
                </div>
                <div className="divider-y"></div>
                <div className="flex-1 pl-md">
                  <div className="font-label-sm text-label-sm text-on-surface-variant mono-data mb-1">ELEC_SYSTEM</div>
                  <div className="font-label-md text-label-md text-white mono-data">REINFORCED_PR</div>
                </div>
              </div>
            </div>
          </div>

          {/* Cyprus Card */}
          <div onClick={() => handleNavigation('/cyprus')} className="hardware-module rounded-sm relative overflow-hidden card-hover group shadow-glass flex flex-col justify-between h-[220px] cursor-pointer">
            <div className="screw-head screw-tl"></div>
            <div className="screw-head screw-tr"></div>
            <div className="screw-head screw-bl"></div>
            <div className="screw-head screw-br"></div>
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-secondary group-hover:w-[4px] transition-all"></div>
            <div className="p-md flex-grow flex flex-col">
              <div className="flex justify-between items-start mb-auto">
                <div>
                  <h2 className="font-headline-md text-headline-md text-white uppercase group-hover:text-secondary transition-colors leading-none mb-1">CYPRUS</h2>
                  <span className="font-label-sm text-label-sm text-on-surface-variant mono-data uppercase">REPUBLIC_OF_CYPRUS</span>
                </div>
              </div>
              <div className="divider-x my-md"></div>
              <div className="flex h-12">
                <div className="flex-1 pr-md">
                  <div className="font-label-sm text-label-sm text-on-surface-variant mono-data mb-1">SEATS_TOTAL</div>
                  <div className="font-label-md text-label-md text-white mono-data">56</div>
                </div>
                <div className="divider-y"></div>
                <div className="flex-1 pl-md">
                  <div className="font-label-sm text-label-sm text-on-surface-variant mono-data mb-1">ELEC_SYSTEM</div>
                  <div className="font-label-md text-label-md text-white mono-data">OPEN_LIST_PR</div>
                </div>
              </div>
            </div>
          </div>

          {/* Greek Regions Card */}
          <div onClick={() => handleNavigation('/greece-regional')} className="hardware-module rounded-sm relative overflow-hidden card-hover group shadow-glass flex flex-col justify-between h-[220px] cursor-pointer md:col-span-2 md:w-1/2 md:mx-auto">
            <div className="screw-head screw-tl"></div>
            <div className="screw-head screw-tr"></div>
            <div className="screw-head screw-bl"></div>
            <div className="screw-head screw-br"></div>
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-tertiary group-hover:w-[4px] transition-all"></div>
            <div className="p-md flex-grow flex flex-col">
              <div className="flex justify-between items-start mb-auto">
                <div>
                  <h2 className="font-headline-md text-headline-md text-white uppercase group-hover:text-tertiary transition-colors leading-none mb-1">GREEK REGIONS</h2>
                  <span className="font-label-sm text-label-sm text-on-surface-variant mono-data uppercase">REGIONAL_ELECTIONS</span>
                </div>
                <div className="flex items-center space-x-2 border border-white/10 rounded px-2 py-1 bg-black/20">
                  <span className="material-symbols-outlined text-[14px] text-status-wip">construction</span>
                  <span className="font-label-sm text-label-sm text-white mono-data uppercase">IN_DEV</span>
                </div>
              </div>
              <div className="divider-x my-md"></div>
              <div className="flex h-12">
                <div className="flex-1 pr-md">
                  <div className="font-label-sm text-label-sm text-on-surface-variant mono-data mb-1">REGIONS_TOTAL</div>
                  <div className="font-label-md text-label-md text-white mono-data">13</div>
                </div>
                <div className="divider-y"></div>
                <div className="flex-1 pl-md">
                  <div className="font-label-sm text-label-sm text-on-surface-variant mono-data mb-1">ELEC_SYSTEM</div>
                  <div className="font-label-md text-label-md text-white mono-data">TWO_ROUND_SYS</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

     {/* Footer */}
<footer className="w-full py-xl mt-xl bg-surface-container-lowest/90 border-t border-white/10 relative z-10">
  <div className="max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-2 gap-md px-lg">
    <div className="flex flex-col items-center justify-center gap-1 text-center">
      <p className="font-body-md text-body-md text-on-surface-variant text-center">© 2026 PsephosCast.gr · Konstantinos Davakos</p>
      <a
        href="https://econ.uoi.gr/en/"
        target="_blank"
        rel="noopener noreferrer"
        className="font-body-md text-on-surface-variant hover:text-primary transition-colors text-center"
        style={{ fontSize: 13, textDecoration: "none" }}
      >
        Student in the Department of Economics, University of Ioannina
      </a>
      <p className="font-body-md text-on-surface-variant text-center" style={{ fontSize: 13, margin: 0 }}>
        Εργαστήριο Εφαρμογών Πληροφορικής και Υπολογιστικών Οικονομικών (ΕΕΠΥΟ)
      </p>
    </div>
    <div className="flex flex-col md:flex-row md:justify-end gap-md md:gap-lg font-label-sm text-label-sm mono-data uppercase items-center">
      <button onClick={() => setShowPrivacy(true)} className="text-left text-on-surface-variant hover:text-white transition-all bg-transparent border-none cursor-pointer p-0">PRIVACY_POLICY</button>
      <button onClick={() => setShowCookies(true)} className="text-left text-on-surface-variant hover:text-white transition-all bg-transparent border-none cursor-pointer p-0">COOKIES_POLICY</button>
      <button onClick={() => setShowCredits(true)} className="text-left text-on-surface-variant hover:text-white transition-all bg-transparent border-none cursor-pointer p-0">METHODOLOGY</button>
      <button onClick={() => setShowContact(true)} className="text-left text-on-surface-variant hover:text-white transition-all bg-transparent border-none cursor-pointer p-0">SUPPORT</button>
    </div>
  </div>
</footer>

      {/* Modals */}
      {showQuickStart && (
        <Modal onClose={() => setShowQuickStart(false)} title="QUICK START">
          <p><strong>1. The Logit-Swing Model:</strong> Distributes national polling shifts dynamically and safely across local electoral districts.</p>
          <p><strong>2. Demographic Sliders:</strong> Manipulate voter turnout based on age, location, and education.</p>
          <p><strong>3. Thresholds:</strong> Play with the electoral law to see how wasted votes redistribute.</p>
        </Modal>
      )}

      {showCredits && (
        <Modal onClose={() => setShowCredits(false)} title="DATA SOURCES">
          <section>
            <h4 className="mono-data" style={{ fontSize: 11, letterSpacing: 2.5, textTransform: "uppercase", color: "#b4c5ff", margin: "0 0 8px" }}>Historical Data</h4>
            <p style={{ margin: 0 }}>
              Baseline scenarios are compiled from official governmental sources including the Hellenic Ministry of Interior, ELSTAT, and the Cyprus Ministry of Interior.
            </p>
          </section>
          <section>
            <h4 className="mono-data" style={{ fontSize: 11, letterSpacing: 2.5, textTransform: "uppercase", color: "#b4c5ff", margin: "0 0 8px" }}>Live Polling</h4>
            <p style={{ margin: 0 }}>
              Live opinion polling averages are retrieved dynamically via the Wikimedia Foundation REST API. The data falls under the Creative Commons Attribution-ShareAlike License.
            </p>
          </section>
          <section style={{ background: "rgba(255,255,255,0.03)", padding: "16px 20px", borderRadius: 2, border: "0.5px solid rgba(255,255,255,0.15)" }}>
            <h4 className="mono-data" style={{ fontSize: 11, letterSpacing: 2.5, textTransform: "uppercase", color: "#b4c5ff", margin: "0 0 8px" }}>Legal Disclaimer</h4>
            <p style={{ margin: 0, fontSize: 14 }}>
              This interactive PsephosCast.gr is an independent, non-commercial academic project created by Konstantinos Davakos (Department of Economics, University of Ioannina). It is strictly for educational, illustrative, and research purposes. The mathematical models simulate hypothetical outcomes and should not be treated as official predictive forecasts.
            </p>
          </section>
        </Modal>
      )}

      {showContact && (
        <Modal onClose={() => setShowContact(false)} title="CONTACT" maxWidth={450}>
          <div style={{ background: "rgba(255,255,255,0.03)", padding: "18px 20px", borderRadius: 2, border: "0.5px solid rgba(255,255,255,0.15)" }}>
            <p style={{ margin: 0 }}>
              For technical feedback, methodology inquiries, or support, please email:<br />
              <a href="mailto:kostasdabakos@gmail.com" className="mono-data" style={{ fontSize: 14, color: "#b4c5ff", textDecoration: "none", fontWeight: 600, display: "inline-block", marginTop: 12 }}>
                kostasdabakos@gmail.com
              </a>
            </p>
          </div>
        </Modal>
      )}

      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
      {showCookies && <CookiesModal onClose={() => setShowCookies(false)} />}
    </div>
  );
}
