import { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

// ─── Self-hosted fonts ────────────────────────────────
import '@fontsource/barlow-condensed/400.css';
import '@fontsource/barlow-condensed/500.css';
import '@fontsource/barlow-condensed/600.css';
import '@fontsource/barlow-condensed/700.css';
import '@fontsource/barlow-condensed/800.css';
import '@fontsource/barlow-condensed/900.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/400-italic.css';
import '@fontsource/ibm-plex-mono/600.css';
import '@fontsource/bebas-neue';
import '@fontsource/crimson-pro/400.css';
import '@fontsource/crimson-pro/600.css';
import '@fontsource-variable/material-symbols-outlined';

import WelcomeScreen from "./components/WelcomeScreen";
import ErrorBoundary from "./ErrorBoundary";

const GreeceApp          = lazy(() => import("./components/GreeceSwingometer/GreeceApp"));
const CyprusApp          = lazy(() => import("./components/CyprusSwingometer/CyprusApp"));
const GreeceRegionsApp   = lazy(() => import("./components/GreeceRegions/GreeceRegionsApp"));
const GreeceCorrelations = lazy(() => import("./components/GreeceSwingometer/GreeceCorrelations"));

const GLOBAL_CSS = `
  :root { --ff-head:'Barlow Condensed',sans-serif; --ff-body:'Barlow Condensed',sans-serif; --ff-mono:'IBM Plex Mono',monospace; }
  .app-wrapper.dark {
    --bg-deep:#020917;--bg-mid:#06101E;--bg-up:#0C1828;--border:#0F1E36;
    --text-dim:#1E3A5F;--text-muted:#475569;--text-main:#94A3B8;--text-bright:#CBD5E1;--text-title:#F1F5F9;
    --btn-bg:#030610;--btn-hover:#080F1E;--tooltip-bg:rgba(8,15,30,0.97);--tooltip-border:#1E293B;
    --map-bg:radial-gradient(ellipse at 50% 60%,#0D1E38 0%,#03080F 100%);--map-stroke:#07111F;--map-stroke-hover:#93C5FD;
    --hemi-stroke:#0C1828;--table-stripe:rgba(255,255,255,0.01);--coalition-bg:#080F1E;
    --header-icon-bg:linear-gradient(135deg,#0D1B34,#091226);--bonus-bg:#140A00;--bonus-border:#78350F44;
    --elim-bg:#100808;--elim-border:#7F1D1D33;--tab-active:#0D1E38;--divider:#0F1E36;
    --welcome-card-bg:#050D1A;--welcome-card-border:#0D1F3C;--welcome-card-hover:#091426;
  }
  .app-wrapper.light {
    --bg-deep:#F8FAFC;--bg-mid:#FFFFFF;--bg-up:#F1F5F9;--border:#CBD5E1;
    --text-dim:#64748B;--text-muted:#475569;--text-main:#334155;--text-bright:#1E293B;--text-title:#020617;
    --btn-bg:#F1F5F9;--btn-hover:#E2E8F0;--tooltip-bg:rgba(255,255,255,0.97);--tooltip-border:#CBD5E1;
    --map-bg:radial-gradient(ellipse at 50% 60%,#E2E8F0 0%,#F8FAFC 100%);--map-stroke:#94A3B8;--map-stroke-hover:#2563EB;
    --hemi-stroke:#E2E8F0;--table-stripe:rgba(0,0,0,0.02);--coalition-bg:#F1F5F9;
    --header-icon-bg:linear-gradient(135deg,#E0E7FF,#F8FAFC);--bonus-bg:#FEF3C7;--bonus-border:#FDE68A;
    --elim-bg:#FEF2F2;--elim-border:#FECACA;--tab-active:#E2E8F0;--divider:#E2E8F0;
    --welcome-card-bg:#FFFFFF;--welcome-card-border:#E2E8F0;--welcome-card-hover:#F1F5F9;
  }
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{margin:0;padding:0}
  .app-wrapper{background:var(--bg-deep);color:var(--text-main);transition:background 0.3s,color 0.3s;min-height:100vh}
  input[type=range]{-webkit-appearance:none;appearance:none;background:transparent}
  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:var(--bg-mid);border:2.5px solid currentColor;cursor:pointer;box-shadow:0 1px 3px rgba(0,0,0,0.3);transition:transform 0.1s,background 0.15s}
  input[type=range]::-webkit-slider-thumb:hover{transform:scale(1.1);background:currentColor}
  input[type=range]::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:var(--bg-mid);border:2.5px solid currentColor;cursor:pointer;box-shadow:0 1px 3px rgba(0,0,0,0.3)}
  ::-webkit-scrollbar{width:3px;height:3px}::-webkit-scrollbar-track{background:var(--btn-bg)}::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}
  select option{background:var(--btn-bg);color:var(--text-main)}
  input[type=text]:focus,select:focus{border-color:#1E3A8A !important}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
  @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes cardIn{from{opacity:0;transform:translateY(20px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
  .icon-btn:hover{background:var(--btn-hover) !important;color:var(--text-bright) !important}
  .results-pending{opacity:0.65;transition:opacity 0.15s ease;pointer-events:none}
  .results-ready{opacity:1;transition:opacity 0.25s ease}
  .welcome-card{animation:cardIn 0.4s ease both;cursor:pointer;transition:all 0.25s ease;background:var(--welcome-card-bg);border:1px solid var(--welcome-card-border);border-radius:14px;padding:28px 24px;position:relative;overflow:hidden}
  .welcome-card:hover:not(.disabled){transform:translateY(-3px);border-color:#2563EB66;box-shadow:0 8px 32px rgba(37,99,235,0.12)}
  .welcome-card.disabled{opacity:0.5;cursor:not-allowed}
  .welcome-card.active{border-color:#2563EB;box-shadow:0 4px 24px rgba(37,99,235,0.2)}
  .hero-text{animation:fadeIn 0.5s ease both}
  .material-symbols-outlined{font-family:'Material Symbols Outlined Variable';font-weight:normal;font-style:normal;font-size:24px;line-height:1;letter-spacing:normal;text-transform:none;display:inline-block;white-space:nowrap;word-wrap:normal;direction:ltr;-webkit-font-smoothing:antialiased}
`;

function RouteFallback() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-dim)", fontFamily: "var(--ff-mono)", letterSpacing: 1, fontSize: 12 }}>
      Loading…
    </div>
  );
}

// THIS CLEARS MEMORY IF YOU LEAVE THE GREECE ECOSYSTEM
function RouteWatcher() {
  const location = useLocation();
  useEffect(() => {
    if (location.pathname !== '/greece' && location.pathname !== '/greece/correlations') {
      sessionStorage.removeItem('gr_state_scenarioId');
      sessionStorage.removeItem('gr_state_parties');
      sessionStorage.removeItem('gr_state_demSliders');
      sessionStorage.removeItem('gr_state_threshold');
      sessionStorage.removeItem('gr_state_turnoutShift');
    }
  }, [location.pathname]);
  return null;
}

export default function App() {
  const [theme, setTheme] = useState("dark");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 860);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <BrowserRouter>
      <RouteWatcher />
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }}/>
      <div className={`app-wrapper ${theme}`}>
        <ErrorBoundary>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<WelcomeScreen theme={theme} setTheme={setTheme} />} />
              <Route path="/greece" element={<GreeceApp isMobile={isMobile} theme={theme} setTheme={setTheme} />} />
              <Route path="/greece/correlations" element={<GreeceCorrelations isMobile={isMobile} theme={theme} setTheme={setTheme} />} />
              <Route path="/cyprus" element={<CyprusApp isMobile={isMobile} theme={theme} setTheme={setTheme} />} />
              <Route path="/greece-regional" element={<GreeceRegionsApp isMobile={isMobile} theme={theme} setTheme={setTheme} onBack={() => window.history.back()} />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </div>
    </BrowserRouter>
  );
}
