import { memo } from "react";

/* Easing constants */
export const EASE_STD    = "cubic-bezier(0.4, 0, 0.2, 1)";
export const EASE_OUT    = "cubic-bezier(0, 0, 0.2, 1)";
export const EASE_SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

export const STYLES = `
  :root {
    --bg-up: #ffffff; --bg-mid: #f3f4f6; --text-main: #1f2937; --text-title: #111827; --text-dim: #6b7280; --text-muted: #9ca3af;
    --border: #e5e7eb; --btn-bg: #ffffff; --btn-hover: #f9fafb; --tooltip-bg: #ffffffcc; --tooltip-border: #e5e7eb;
    --ff-body: system-ui, -apple-system, sans-serif; --ff-head: system-ui, -apple-system, sans-serif; --ff-mono: ui-monospace, monospace;
    --tab-active: #eff6ff; --coalition-bg: #f3f4f6; --elim-bg: #fef2f2; --elim-border: #fecaca;
    --table-stripe: #f9fafb; --hemi-stroke: #e5e7eb; --bonus-bg: #fef3c7; --bonus-border: #fde68a; --divider: #e5e7eb;
    --map-bg: #f8fafc; --map-stroke: #cbd5e1; --map-stroke-hover: #1e293b;
  }
  [data-theme="dark"] {
    --bg-up: #0f172a; --bg-mid: #1e293b; --text-main: #f8fafc; --text-title: #ffffff; --text-dim: #94a3b8; --text-muted: #cbd5e1;
    --border: #334155; --btn-bg: #0f172a; --btn-hover: #334155; --tooltip-bg: #1e293bcc; --tooltip-border: #475569;
    --tab-active: #1e3a8a; --coalition-bg: #334155; --elim-bg: #450a0a; --elim-border: #7f1d1d;
    --table-stripe: #1e293b; --hemi-stroke: #334155; --bonus-bg: #78350f; --bonus-border: #b45309; --divider: #334155;
    --map-bg: #0f172a; --map-stroke: #475569; --map-stroke-hover: #f8fafc;
  }
  html, body, #root, #__next { width: 100%; max-width: none !important; margin: 0 !important; padding: 0 !important; overflow-x: hidden; }
  body { background: var(--bg-up); color: var(--text-main); font-family: var(--ff-body); }
  * { box-sizing: border-box; }
  
  /* Advanced Input Range Styling from Greece */
  input[type="range"] { -webkit-appearance: none; appearance: none; outline: none; height: 4px; background: var(--border); border-radius: 2px; }
  input[type="range"]::-webkit-slider-thumb { -webkit-appearance:none; width:15px; height:15px; border-radius:50%; background:#f1f5f9; cursor:grab; border:2.5px solid var(--bg-mid); box-shadow:0 1px 4px rgba(0,0,0,0.4); transition:box-shadow 0.2s ${EASE_STD}, transform 0.15s ${EASE_SPRING}; }
  input[type="range"]::-webkit-slider-thumb:hover { box-shadow:0 0 0 5px rgba(96,165,250,0.22); transform:scale(1.18); }
  input[type="range"]::-webkit-slider-thumb:active { cursor:grabbing; transform:scale(1.3); }
  
  /* Animations */
  .icon-btn { transition: background 0.15s ${EASE_STD}, border-color 0.15s ${EASE_STD}, color 0.15s ${EASE_STD}, transform 0.12s ${EASE_SPRING}, box-shadow 0.15s ${EASE_STD}; }
  .icon-btn:hover { border-color: var(--text-muted) !important; color: var(--text-main) !important; background: rgba(255,255,255,0.07) !important; transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.25); }
  .icon-btn:active { transform: translateY(0) scale(0.96) !important; box-shadow: none !important; }
  .results-pending { opacity: 0.5; transition: opacity 0.18s ${EASE_STD}; pointer-events: none; filter: blur(0.5px); }
  .results-ready { opacity: 1; transition: opacity 0.22s ${EASE_OUT}; filter: none; }
  .coalition-chip { transition: background 0.18s ${EASE_STD}, border-color 0.18s ${EASE_STD}, color 0.18s ${EASE_STD}, transform 0.12s ${EASE_SPRING} !important; }
  .coalition-chip:hover { transform: scale(1.04); }
  .coalition-chip:active { transform: scale(0.97); }
  @keyframes tooltipIn { from { opacity:0; transform:scale(0.96) translateY(3px); } to { opacity:1; transform:scale(1) translateY(0); } }
`;

export const S = {
  card:      { background: "var(--bg-mid)", borderRadius: 10, border: "1px solid var(--border)", padding: 14 },
  label:     { fontSize: 9, color: "var(--text-dim)", letterSpacing: 2.5, fontFamily: "var(--ff-body)", textTransform: "uppercase" },
  mono:      { fontFamily: "var(--ff-mono)" },
  editInput: { background: "var(--btn-bg)", border: "1px solid var(--border)", color: "var(--text-main)", fontSize: 10, padding: "4px 7px", borderRadius: 4, fontFamily: "var(--ff-body)", outline: "none" },
  ghostBtn:  { background: "transparent", border: "1px solid var(--border)", color: "var(--text-muted)", padding: "5px 10px", borderRadius: 4, cursor: "pointer", fontSize: 8, fontFamily: "var(--ff-body)", letterSpacing: 1.5, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 5 },
  tooltip:   { position: "fixed", pointerEvents: "none", background: "var(--tooltip-bg)", border: "1px solid var(--tooltip-border)", padding: "12px 14px", borderRadius: 8, zIndex: 1000, minWidth: 170, boxShadow: "0 16px 40px rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }
};

// Icons
export const IconGear      = memo(({ size=12 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>));
export const IconColumns   = memo(({ size=14 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="8" height="18" rx="1"/><rect x="13" y="3" width="8" height="18" rx="1"/></svg>));
export const IconPeople    = memo(({ size=14 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>));
export const IconChevron   = memo(({ dir="up", size=10 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">{dir==="up"?<polyline points="18 15 12 9 6 15"/>:<polyline points="6 9 12 15 18 9"/>}</svg>));
export const IconSun       = memo(({ size=14 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>));
export const IconMoon      = memo(({ size=14 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>));
export const IconTrash     = memo(({ size=12 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>));
export const IconPlus      = memo(({ size=12 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>));
export const IconMinus     = memo(({ size=12 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>));
export const IconArrowLeft = memo(({ size=14 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>));
export const IconZoomReset = memo(({ size=12 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>));
export const IconEye       = memo(({ size=12 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>));
export const IconEyeOff    = memo(({ size=12 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>));
export const IconCamera    = memo(({ size=14 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>));
export const IconPalette   = memo(({ size=14 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>));
export const IconCheck     = memo(({ size=12 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>));
export const IconLock      = memo(({ locked, size = 11 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {locked ? (
      <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>
    ) : (
      <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></>
    )}
  </svg>
));

// Decorative meander divider
export const MeanderBar = memo(() => (
  <svg width="100%" height="6" viewBox="0 0 200 6" preserveAspectRatio="xMidYMid meet" style={{ display: "block" }}>
    <defs>
      <pattern id="meander" x="0" y="0" width="20" height="6" patternUnits="userSpaceOnUse">
        <path d="M0,5 L0,1 L4,1 L4,3 L2,3 L2,5 L6,5 L6,1 L8,1 L8,5 L10,5 L10,1 L14,1 L14,5 L16,5 L16,3 L18,3 L18,1 L20,1 L20,5" fill="none" stroke="var(--border)" strokeWidth="0.8"/>
      </pattern>
    </defs>
    <rect width="100%" height="6" fill="url(#meander)"/>
  </svg>
));

// Reusable range slider with label
export const Slider = memo(function Slider({ label, value, min=-10, max=10, step=0.5, onChange, color }) {
  const pct      = ((value - min) / (max - min)) * 100;
  const valColor = Math.abs(value) < 0.1 ? "var(--text-dim)" : value > 0 ? "#34D399" : "#F87171";
  return (
    <div style={{ marginBottom: 10 }}>
      {label && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--ff-body)", letterSpacing: 0.3 }}>{label}</span>
          <span style={{ fontSize: 10, fontFamily: "var(--ff-mono)", color: valColor, minWidth: 38, textAlign: "right", transition: `color 0.2s ${EASE_STD}` }}>
            {value > 0 ? "+" : ""}{value.toFixed(1)}
          </span>
        </div>
      )}
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", height: 5, background: `linear-gradient(to right,${color} 0%,${color} ${pct}%,var(--border) ${pct}%)`, borderRadius: 3, outline: "none", cursor: "pointer" }}
      />
    </div>
  );
});
