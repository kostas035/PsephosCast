// ─── styles.jsx ───────────────────────────────────────────────────────────────
import { memo } from "react";

export const EASE_STD    = "cubic-bezier(0.4, 0, 0.2, 1)";
export const EASE_OUT    = "cubic-bezier(0, 0, 0.2, 1)";
export const EASE_IN     = "cubic-bezier(0.4, 0, 1, 1)";
export const EASE_SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

// ── Static style objects ──────────────────────────────────────────────────────
export const S = {
  card: {
    background:   "var(--bg-mid)",
    borderRadius: 10,
    border:       "1px solid var(--border)",
    padding:      14,
  },
  label: {
    fontSize:      9,
    color:         "var(--text-dim)",
    letterSpacing: 2.5,
    fontFamily:    "var(--ff-body)",
    textTransform: "uppercase",
    fontWeight:    700,
  },
  mono: { fontFamily: "var(--ff-mono)" },
  editInput: {
    background:  "var(--btn-bg)",
    border:      "1px solid var(--border)",
    color:       "var(--text-main)",
    fontSize:    11,
    padding:     "4px 7px",
    borderRadius: 4,
    fontFamily:  "var(--ff-body)",
    outline:     "none",
  },
  ghostBtn: {
    background:    "transparent",
    border:        "1px solid var(--border)",
    color:         "var(--text-muted)",
    padding:       "5px 10px",
    borderRadius:  4,
    cursor:        "pointer",
    fontSize:      9,
    fontFamily:    "var(--ff-body)",
    fontWeight:    700,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    display:       "flex",
    alignItems:    "center",
    gap:           5,
    transition:    `all 0.15s ${EASE_STD}`,
  },
  tooltip: {
    position:       "fixed",
    pointerEvents:  "none",
    background:     "var(--tooltip-bg)",
    border:         "1px solid var(--tooltip-border)",
    padding:        "12px 14px",
    borderRadius:   8,
    zIndex:         1000,
    minWidth:       175,
    boxShadow:      "0 16px 40px rgba(0,0,0,0.45)",
    backdropFilter: "blur(10px)",
  },
};

// ── Injected global CSS ───────────────────────────────────────────────────────
export const STYLES = `
  /* ─── Design tokens ─────────────────────────────────────────────────────── */
  :root {
    /* Backgrounds */
    --bg-up:   #f8fafc;
    --bg-mid:  #f1f5f9;
    --bg-base: #ffffff;
    --bg-card: #ffffff;

    /* Text */
    --text-main:  #1e293b;
    --text-title: #0f172a;
    --text-dim:   #64748b;
    --text-muted: #94a3b8;

    /* Borders & surfaces */
    --border:          #e2e8f0;
    --divider:         #e2e8f0;
    --btn-bg:          #ffffff;
    --btn-hover:       #f8fafc;

    /* Tooltip */
    --tooltip-bg:     rgba(255,255,255,0.92);
    --tooltip-border: #e2e8f0;

    /* Component tokens */
    --tab-active:    #eff6ff;
    --elim-bg:       #fef2f2;
    --elim-border:   #fecaca;
    --bonus-bg:      #fefce8;
    --bonus-border:  #fde68a;

    /* Map */
    --map-bg:           #f0f4f8;
    --map-stroke:       #cbd5e1;
    --map-stroke-hover: #0f172a;

    /* Typography */
    --ff-body: "DM Sans", system-ui, -apple-system, sans-serif;
    --ff-head: "DM Sans", system-ui, -apple-system, sans-serif;
    --ff-mono: "DM Mono", ui-monospace, monospace;

    /* Shadows */
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
    --shadow-md: 0 4px 16px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04);
    --shadow-lg: 0 20px 48px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.06);
  }

  [data-theme="dark"] {
    --bg-up:   #0b1120;
    --bg-mid:  #131e32;
    --bg-base: #0b1120;
    --bg-card: #131e32;

    --text-main:  #e2e8f0;
    --text-title: #f8fafc;
    --text-dim:   #64748b;
    --text-muted: #475569;

    --border:    #1e2f47;
    --divider:   #1e2f47;
    --btn-bg:    #131e32;
    --btn-hover: #1e2f47;

    --tooltip-bg:     rgba(13, 22, 42, 0.95);
    --tooltip-border: #1e2f47;

    --tab-active:  #172554;
    --elim-bg:     #3b0a0a;
    --elim-border: #7f1d1d;
    --bonus-bg:    #422006;
    --bonus-border:#92400e;

    --map-bg:           #0b1120;
    --map-stroke:       #1e2f47;
    --map-stroke-hover: #f8fafc;

    --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
    --shadow-md: 0 4px 16px rgba(0,0,0,0.4);
    --shadow-lg: 0 20px 48px rgba(0,0,0,0.6);
  }

  /* ─── Global resets ──────────────────────────────────────────────────────── */
  html, body, #root, #__next {
    width: 100%; max-width: none !important;
    margin: 0 !important; padding: 0 !important;
    overflow-x: hidden;
  }
  body {
    background:  var(--bg-up);
    color:       var(--text-main);
    font-family: var(--ff-body);
  }
  * { box-sizing: border-box; }

  /* ─── Range slider ───────────────────────────────────────────────────────── */
  input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    outline: none;
    height: 5px;
    background: var(--border);
    border-radius: 3px;
  }
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 15px; height: 15px;
    border-radius: 50%;
    background: #f1f5f9;
    cursor: grab;
    border: 2.5px solid var(--bg-mid);
    box-shadow: 0 1px 5px rgba(0,0,0,0.35);
    transition: box-shadow 0.18s cubic-bezier(0.4,0,0.2,1),
                transform   0.14s cubic-bezier(0.34,1.56,0.64,1);
  }
  input[type="range"]::-webkit-slider-thumb:hover {
    box-shadow: 0 0 0 5px rgba(96,165,250,0.20);
    transform: scale(1.18);
  }
  input[type="range"]::-webkit-slider-thumb:active {
    cursor: grabbing;
    transform: scale(1.3);
  }
  input[type="range"]:disabled::-webkit-slider-thumb {
    cursor: not-allowed;
    opacity: 0.45;
  }

  /* ─── Map styles ─────────────────────────────────────────────────────────── */
  .map-svg-container svg { width: 100%; height: 100%; }
  .map-svg-container path, .map-svg-container polygon {
    stroke:         var(--map-stroke);
    stroke-width:   0.5px;
    transition:     fill 0.25s cubic-bezier(0.4,0,0.2,1),
                    stroke 0.18s,
                    filter 0.18s;
    cursor:         pointer;
    vector-effect:  non-scaling-stroke;
  }
  .map-svg-container path:hover,
  .map-svg-container polygon:hover {
    stroke:       var(--map-stroke-hover);
    stroke-width: 1.5px;
    filter:       drop-shadow(0 3px 8px rgba(0,0,0,0.35));
  }
  .lake {
    fill: var(--bg-mid) !important;
    stroke: var(--border) !important;
    pointer-events: none;
  }

  /* ─── Semi-circle arcs ───────────────────────────────────────────────────── */
  .semi-arc { transition: opacity 0.3s ease, d 0.25s ease; }
  .semi-arc:hover { opacity: 0.82; filter: brightness(1.12); cursor: pointer; }

  /* ─── Utility buttons ────────────────────────────────────────────────────── */
  .icon-btn {
    transition: background    0.14s cubic-bezier(0.4,0,0.2,1),
                border-color  0.14s cubic-bezier(0.4,0,0.2,1),
                color         0.14s cubic-bezier(0.4,0,0.2,1),
                transform     0.12s cubic-bezier(0.34,1.56,0.64,1),
                box-shadow    0.14s cubic-bezier(0.4,0,0.2,1);
  }
  .icon-btn:hover {
    border-color: var(--text-muted) !important;
    color:        var(--text-main)  !important;
    background:   var(--btn-hover)  !important;
    transform:    translateY(-1px);
    box-shadow:   var(--shadow-sm);
  }
  .icon-btn:active {
    transform:   translateY(0) scale(0.96) !important;
    box-shadow:  none !important;
  }

  /* ─── Results state transitions ──────────────────────────────────────────── */
  .results-pending {
    opacity: 0.52;
    transition: opacity 0.16s cubic-bezier(0.4,0,0.2,1);
    pointer-events: none;
    filter: blur(0.4px);
  }
  .results-ready {
    opacity: 1;
    transition: opacity 0.2s cubic-bezier(0,0,0.2,1);
    filter: none;
  }

  /* ─── Scroll utilities ───────────────────────────────────────────────────── */
  .hide-scroll::-webkit-scrollbar { display: none; }
  .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }

  /* ─── Animations ─────────────────────────────────────────────────────────── */
  @keyframes tooltipIn {
    from { opacity: 0; transform: scale(0.96) translateY(3px); }
    to   { opacity: 1; transform: scale(1)    translateY(0);   }
  }
  @keyframes pulse {
    0%   { box-shadow: 0 0 0 0   rgba(34,197,94,0.45); }
    70%  { box-shadow: 0 0 0 6px rgba(34,197,94,0);    }
    100% { box-shadow: 0 0 0 0   rgba(34,197,94,0);    }
  }
  @keyframes pulseAmber {
    0%   { box-shadow: 0 0 0 0   rgba(245,158,11,0.45); }
    70%  { box-shadow: 0 0 0 6px rgba(245,158,11,0);    }
    100% { box-shadow: 0 0 0 0   rgba(245,158,11,0);    }
  }
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0);    }
  }

  /* ─── Floating card hover ────────────────────────────────────────────────── */
  .floating-card {
    background: var(--bg-mid);
    border-radius: 12px;
    border: 1px solid var(--border);
    transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  }
  .floating-card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
    border-color: var(--map-stroke-hover);
  }

  /* ─── Scenario badge ─────────────────────────────────────────────────────── */
  .scenario-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 9px;
    border-radius: 20px;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    border: 1px solid var(--border);
    color: var(--text-dim);
    background: var(--bg-mid);
    font-family: var(--ff-body);
  }
`;

// ── Reusable Slider component ─────────────────────────────────────────────────
export const Slider = memo(function Slider({
  label, value, min = -10, max = 10, step = 0.5, onChange, color, isPct = false,
}) {
  const pct      = ((value - min) / (max - min)) * 100;
  const neutral  = Math.abs(value) < 0.05;
  const valColor = neutral ? "var(--text-dim)" : (isPct ? color : value > 0 ? "#34D399" : "#F87171");

  return (
    <div style={{ marginBottom: 10 }}>
      {label && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, alignItems: "baseline" }}>
          <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--ff-body)", fontWeight: 500, letterSpacing: 0.3 }}>
            {label}
          </span>
          <span style={{ fontSize: 11, fontFamily: "var(--ff-mono)", fontWeight: 700, color: valColor, minWidth: 38, textAlign: "right", transition: `color 0.2s ${EASE_STD}` }}>
            {!isPct && value > 0 ? "+" : ""}{value.toFixed(1)}{isPct ? "%" : ""}
          </span>
        </div>
      )}
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          width: "100%", height: 5, borderRadius: 3, outline: "none", cursor: "pointer",
          background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, var(--border) ${pct}%)`,
        }}
      />
    </div>
  );
});

// ── Greek meander divider ─────────────────────────────────────────────────────
export const MeanderBar = memo(() => (
  <svg width="100%" height="6" viewBox="0 0 200 6" preserveAspectRatio="xMidYMid meet"
       style={{ display: "block", opacity: 0.6 }}>
    <defs>
      <pattern id="meander-gr" x="0" y="0" width="20" height="6" patternUnits="userSpaceOnUse">
        <path
          d="M0,5 L0,1 L4,1 L4,3 L2,3 L2,5 L6,5 L6,1 L8,1 L8,5 L10,5 L10,1 L14,1 L14,5 L16,5 L16,3 L18,3 L18,1 L20,1 L20,5"
          fill="none" stroke="var(--border)" strokeWidth="0.9"
        />
      </pattern>
    </defs>
    <rect width="100%" height="6" fill="url(#meander-gr)" />
  </svg>
));
