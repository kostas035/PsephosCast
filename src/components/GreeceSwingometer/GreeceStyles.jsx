import { memo, useEffect } from "react";

/* ─── Easing constants ──────────────────────────────────────── */
export const EASE_STD    = "cubic-bezier(0.4, 0, 0.2, 1)";
export const EASE_OUT    = "cubic-bezier(0, 0, 0.2, 1)";
export const EASE_SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

export const S = {
  card: { background: "var(--bg-mid, #1e293b)", borderRadius: 10, border: "1px solid var(--border, #334155)", padding: 14 },
  label: { fontSize: 9, color: "var(--text-dim, #94a3b8)", letterSpacing: 2.5, fontFamily: "var(--ff-body, sans-serif)", textTransform: "uppercase" },
  mono: { fontFamily: "var(--ff-mono, monospace)" },
  editInput: { background: "var(--btn-bg, #0f172a)", border: "1px solid var(--border, #334155)", color: "var(--text-main, #f8fafc)", fontSize: 10, padding: "4px 7px", borderRadius: 4, fontFamily: "var(--ff-body, sans-serif)", outline: "none" },
  ghostBtn: { background: "transparent", border: "1px solid var(--border, #334155)", color: "var(--text-muted, #cbd5e1)", padding: "5px 10px", borderRadius: 4, cursor: "pointer", fontSize: 8, fontFamily: "var(--ff-body, sans-serif)", letterSpacing: 1.5, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 5 },
  tooltip: { position: "fixed", pointerEvents: "none", background: "var(--tooltip-bg, #1e293b)", border: "1px solid var(--tooltip-border, #475569)", padding: "12px 14px", borderRadius: 8, zIndex: 1000, minWidth: 170, boxShadow: "0 16px 40px rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" },
};

const GLOBAL_CSS = `
  /* ── Widescreen Stretching Reset ────────────────────────── */
  html, body, #root, #__next {
    width: 100% !important;
    max-width: none !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow-x: hidden;
  }

  input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    outline: none;
    height: 4px;
    background: var(--border);
    border-radius: 2px;
  }
  input[type="range"]::-webkit-slider-thumb { -webkit-appearance:none; width:15px; height:15px; border-radius:50%; background:#f1f5f9; cursor:grab; border:2.5px solid var(--bg-mid); box-shadow:0 1px 4px rgba(0,0,0,0.4); transition:box-shadow 0.2s ${EASE_STD}, transform 0.15s ${EASE_SPRING}; }
  input[type="range"]::-webkit-slider-thumb:hover { box-shadow:0 0 0 5px rgba(96,165,250,0.22); transform:scale(1.18); }
  input[type="range"]::-webkit-slider-thumb:active { cursor:grabbing; transform:scale(1.3); }
  .icon-btn { transition: background 0.15s ${EASE_STD}, border-color 0.15s ${EASE_STD}, color 0.15s ${EASE_STD}, transform 0.12s ${EASE_SPRING}, box-shadow 0.15s ${EASE_STD}; }
  .icon-btn:hover { border-color: var(--text-muted) !important; color: var(--text-main) !important; background: rgba(255,255,255,0.07) !important; transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.25); }
  .icon-btn:active { transform: translateY(0) scale(0.96) !important; box-shadow: none !important; }
  .party-row { transition: background 0.18s ${EASE_STD}, padding 0.18s ${EASE_STD}, border-color 0.18s ${EASE_STD}; }
  .tab-btn { transition: background 0.18s ${EASE_STD}, color 0.18s ${EASE_STD}, border-color 0.18s ${EASE_STD} !important; }
  .results-pending { opacity: 0.5; transition: opacity 0.18s ${EASE_STD}; pointer-events: none; filter: blur(0.5px); }
  .results-ready { opacity: 1; transition: opacity 0.22s ${EASE_OUT}; filter: none; }
  .seat-dot { will-change: opacity; }
  .coalition-chip { transition: background 0.18s ${EASE_STD}, border-color 0.18s ${EASE_STD}, color 0.18s ${EASE_STD}, transform 0.12s ${EASE_SPRING} !important; }
  .coalition-chip:hover { transform: scale(1.04); }
  .coalition-chip:active { transform: scale(0.97); }
  .gr-tooltip { animation: tooltipIn 0.12s ${EASE_OUT} both; }
  @keyframes tooltipIn { from { opacity:0; transform:scale(0.96) translateY(3px); } to { opacity:1; transform:scale(1) translateY(0); } }
`;

export const GlobalStyles = memo(function GlobalStyles() {
  useEffect(() => {
    const id = "gr-swingometer-styles";
    if (document.getElementById(id)) return;
    const el = Object.assign(document.createElement("style"), { id, textContent: GLOBAL_CSS });
    document.head.appendChild(el);
    return () => el.remove();
  }, []);
  return null;
});

export const MeanderBar = memo(() => (
  <svg width="100%" height="6" viewBox="0 0 200 6" preserveAspectRatio="xMidYMid meet" style={{ display: "block" }}>
    <defs>
      <pattern id="meander" x="0" y="0" width="20" height="6" patternUnits="userSpaceOnUse">
        <path d="M0,5 L0,1 L4,1 L4,3 L2,3 L2,5 L6,5 L6,1 L8,1 L8,5 L10,5 L10,1 L14,1 L14,5 L16,5 L16,3 L18,3 L18,1 L20,1 L20,5" fill="none" stroke="var(--border, #334155)" strokeWidth="0.8"/>
      </pattern>
    </defs>
    <rect width="100%" height="6" fill="url(#meander)"/>
  </svg>
));

export const Slider = memo(function Slider({ label, value, min = -10, max = 10, step = 0.5, onChange, color }) {
  const pct = ((value - min) / (max - min)) * 100;
  const valColor = Math.abs(value) < 0.1 ? "var(--text-dim)" : value > 0 ? "#34D399" : "#F87171";
  const trackBg = `linear-gradient(to right,${color} 0%,${color} ${pct}%,var(--border) ${pct}%)`;

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
        style={{ width: "100%", height: 5, background: trackBg, borderRadius: 3, outline: "none", cursor: "pointer" }}
      />
    </div>
  );
});
