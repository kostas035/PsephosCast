// ─── aus-ui.jsx ───────────────────────────────────────────────────────────────
import { memo } from "react";

// ── Easing constants ───────────────────────────────────────────────────────────
export const EASE_STD    = "cubic-bezier(0.4, 0, 0.2, 1)";
export const EASE_OUT    = "cubic-bezier(0, 0, 0.2, 1)";
export const EASE_SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

// ── Global CSS ─────────────────────────────────────────────────────────────────
export const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,900&display=swap');

  :root {
    --bg-up:          #0c1220;
    --bg-mid:         #141e30;
    --bg-card:        #1a2540;
    --bg-hover:       #1f2d4a;
    --text-main:      #e2e8f0;
    --text-title:     #f8fafc;
    --text-dim:       #94a3b8;
    --text-muted:     #64748b;
    --border:         #263352;
    --border-light:   #2e3d5e;
    --btn-bg:         #1a2540;
    --btn-hover:      #263352;
    --divider:        #263352;
    --map-bg:         #0c1220;
    --map-stroke:     #263352;
    --map-stroke-hov: #60a5fa;
    --shadow:         rgba(0,0,0,0.5);
    --glow-alp:       rgba(225,57,64,0.2);
    --glow-lnp:       rgba(28,79,156,0.2);
    --glow-grn:       rgba(0,156,61,0.2);
    --glow-ind:       rgba(64,192,192,0.2);
    --ff-body:        'DM Sans', system-ui, sans-serif;
    --ff-head:        'DM Sans', system-ui, sans-serif;
    --ff-mono:        'DM Mono', ui-monospace, monospace;
  }
  [data-theme="light"] {
    --bg-up:          #f0f4f9;
    --bg-mid:         #ffffff;
    --bg-card:        #ffffff;
    --bg-hover:       #f8fafc;
    --text-main:      #1e293b;
    --text-title:     #0f172a;
    --text-dim:       #475569;
    --text-muted:     #94a3b8;
    --border:         #e2e8f0;
    --border-light:   #cbd5e1;
    --btn-bg:         #ffffff;
    --btn-hover:      #f8fafc;
    --divider:        #e2e8f0;
    --map-bg:         #f0f4f9;
    --map-stroke:     #94a3b8;
    --map-stroke-hov: #1c4f9c;
    --shadow:         rgba(0,0,0,0.12);
    --glow-alp:       rgba(225,57,64,0.08);
    --glow-lnp:       rgba(28,79,156,0.08);
    --glow-grn:       rgba(0,156,61,0.08);
    --glow-ind:       rgba(64,192,192,0.08);
  }

  html, body, #root, #__next {
    width: 100%; max-width: none !important;
    margin: 0 !important; padding: 0 !important;
    overflow-x: hidden;
  }
  body {
    background: var(--bg-up);
    color: var(--text-main);
    font-family: var(--ff-body);
    font-size: 13px;
    line-height: 1.5;
  }
  * { box-sizing: border-box; }

  /* Scrollbars */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

  /* Range slider */
  input[type="range"] {
    -webkit-appearance: none; appearance: none;
    outline: none; height: 4px;
    background: var(--border); border-radius: 2px;
  }
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none; width: 14px; height: 14px;
    border-radius: 50%; background: #f1f5f9; cursor: grab;
    border: 2.5px solid var(--bg-mid);
    box-shadow: 0 1px 4px rgba(0,0,0,0.4);
    transition: box-shadow 0.2s ${EASE_STD}, transform 0.15s ${EASE_SPRING};
  }
  input[type="range"]::-webkit-slider-thumb:hover {
    box-shadow: 0 0 0 5px rgba(96,165,250,0.22);
    transform: scale(1.18);
  }
  input[type="range"]::-webkit-slider-thumb:active {
    cursor: grabbing; transform: scale(1.3);
  }
  input[type="range"]:disabled { opacity: 0.35; cursor: not-allowed; }
  input[type="range"]:disabled::-webkit-slider-thumb { cursor: not-allowed; }

  /* Interactive elements */
  .icon-btn {
    transition: background 0.15s ${EASE_STD}, border-color 0.15s ${EASE_STD},
                color 0.15s ${EASE_STD}, transform 0.12s ${EASE_SPRING},
                box-shadow 0.15s ${EASE_STD};
  }
  .icon-btn:hover {
    border-color: var(--text-muted) !important;
    color: var(--text-main) !important;
    background: var(--bg-hover) !important;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px var(--shadow);
  }
  .icon-btn:active {
    transform: translateY(0) scale(0.96) !important;
    box-shadow: none !important;
  }

  /* Pending / ready state */
  .results-pending { opacity: 0.5; transition: opacity 0.18s ${EASE_STD}; pointer-events: none; filter: blur(0.4px); }
  .results-ready   { opacity: 1;   transition: opacity 0.22s ${EASE_OUT};  filter: none; }

  /* Scenario tab active state */
  .scenario-tab-active {
    border-color: var(--border-light) !important;
    color: var(--text-title) !important;
    background: var(--bg-card) !important;
  }

  @keyframes tooltipIn {
    from { opacity: 0; transform: scale(0.95) translateY(4px); }
    to   { opacity: 1; transform: scale(1)    translateY(0);   }
  }
  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position:  200% 0; }
  }
`;

// ── Style primitives (JS object) ───────────────────────────────────────────────
export const S = {
  card:      { background: "var(--bg-card)", borderRadius: 10, border: "1px solid var(--border)", padding: 14 },
  cardSmall: { background: "var(--bg-card)", borderRadius: 8,  border: "1px solid var(--border)", padding: 10 },
  label:     { fontSize: 9,  color: "var(--text-dim)", letterSpacing: 2.5, fontFamily: "var(--ff-body)", textTransform: "uppercase", fontWeight: 700 },
  mono:      { fontFamily: "var(--ff-mono)" },
  ghostBtn:  {
    background: "var(--btn-bg)", border: "1px solid var(--border)", color: "var(--text-muted)",
    padding: "5px 11px", borderRadius: 5, cursor: "pointer", fontSize: 9,
    fontFamily: "var(--ff-body)", letterSpacing: 1.5, textTransform: "uppercase",
    display: "flex", alignItems: "center", gap: 5,
  },
  tooltip: {
    position: "fixed", pointerEvents: "none",
    background: "var(--bg-card)", border: "1px solid var(--border-light)",
    padding: "12px 14px", borderRadius: 8, zIndex: 9000, minWidth: 180,
    boxShadow: "0 16px 40px rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
    animation: `tooltipIn 0.18s ${EASE_OUT}`,
  },
};

// ── Icons ──────────────────────────────────────────────────────────────────────
export const IconGear = memo(({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
));

export const IconLock = memo(({ locked, size = 11 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {locked ? (
      <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>
    ) : (
      <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></>
    )}
  </svg>
));

export const IconChevron = memo(({ dir = "down", size = 10 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    {dir === "up" ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}
  </svg>
));

export const IconSun = memo(({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
));

export const IconMoon = memo(({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
));

export const IconPlus = memo(({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
));

export const IconMinus = memo(({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
));

export const IconZoomReset = memo(({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/>
  </svg>
));

export const IconX = memo(({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
));

export const IconSliders = memo(({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/>
    <line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/>
    <line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/>
    <line x1="17" y1="16" x2="23" y2="16"/>
  </svg>
));

export const IconMap = memo(({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
    <line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
  </svg>
));

// ── Meander decorative divider ─────────────────────────────────────────────────
export const MeanderBar = memo(({ margin = "12px 0" }) => (
  <svg width="100%" height="6" viewBox="0 0 200 6" preserveAspectRatio="xMidYMid meet"
    style={{ display: "block", margin }}>
    <defs>
      <pattern id="aus-meander" x="0" y="0" width="20" height="6" patternUnits="userSpaceOnUse">
        <path d="M0,5 L0,1 L4,1 L4,3 L2,3 L2,5 L6,5 L6,1 L8,1 L8,5 L10,5 L10,1 L14,1 L14,5 L16,5 L16,3 L18,3 L18,1 L20,1 L20,5"
          fill="none" stroke="var(--border)" strokeWidth="0.8"/>
      </pattern>
    </defs>
    <rect width="100%" height="6" fill="url(#aus-meander)"/>
  </svg>
));

// ── Reusable labelled slider ───────────────────────────────────────────────────
export const Slider = memo(function Slider({ label, value, min = 0, max = 100, step = 0.1, onChange, color, disabled }) {
  const pct = ((value - min) / (max - min)) * 100;
  const valColor = Math.abs(value) < 0.05 ? "var(--text-dim)" : "var(--text-title)";
  return (
    <div style={{ marginBottom: 10 }}>
      {label && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--ff-body)", letterSpacing: 0.3 }}>{label}</span>
          <span style={{ fontSize: 10, fontFamily: "var(--ff-mono)", color: valColor, minWidth: 42, textAlign: "right" }}>
            {value.toFixed(1)}%
          </span>
        </div>
      )}
      <input
        type="range" min={min} max={max} step={step} value={value}
        disabled={disabled}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{
          width: "100%", height: 5, borderRadius: 3, outline: "none", cursor: disabled ? "not-allowed" : "pointer",
          background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, var(--border) ${pct}%)`,
        }}
      />
    </div>
  );
});
