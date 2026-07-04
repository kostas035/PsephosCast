// CyprusThemes.js
// Two independent axes, mirroring the Greek model:
//   • THEME   — UI chrome (dark / dim daylight / high contrast), applied as CSS
//               custom properties on the app root so the whole subtree re-themes.
//               Uses Cyprus's variable names (--bg-up / --bg-mid, no --bg-base).
//   • PALETTE — data colours (map/hemicycle/table). Colour-blind-safe palettes
//               separate every party primarily by LUMINANCE (the channel every
//               form of CVD preserves; the basis of WCAG 2.1 / EN 301 549).
// `base` ("dark"|"light") is reported up so the page shell + data-theme stay in step.

/* THEMES (chrome) */

// Dark is a PASS-THROUGH: the app already ships a dark palette via the
// [data-theme="dark"] block in cyprus-ui STYLES, so we override nothing and
// inherit it exactly.
const DARK_VARS = {};

// Dim warm greige daylight — the shipped light mode is near-white and glary;
// this drops surface luminance into muted beige with dark-slate (not black) text.
const LIGHT_VARS = {
  "--bg-up": "#ddd9cf", "--bg-mid": "#ebe8df", "--bg-base": "#ddd9cf",
  "--border": "#cbc6b9", "--divider": "#d6d1c5", "--btn-bg": "#e4e1d8", "--btn-hover": "#dcd8ce",
  "--text-main": "#2b2f36", "--text-title": "#1d2127", "--text-dim": "#7a7e84", "--text-muted": "#565b62",
  "--tab-active": "#dde6f4", "--coalition-bg": "#d8d4ca", "--table-stripe": "rgba(0,0,0,0.035)",
  "--hemi-stroke": "#cbc6b9", "--tooltip-bg": "#f3f1ebcc", "--tooltip-border": "#cbc6b9",
  "--bonus-bg": "#f0e3c4", "--bonus-border": "#e0c98e", "--elim-bg": "#f3dede", "--elim-border": "#e6bcbc",
  "--map-bg": "#ddd9cf", "--map-stroke": "#b9b4a7", "--map-stroke-hover": "#5b5f64",
};

const CONTRAST_VARS = {
  "--bg-up": "#000000", "--bg-mid": "#0a0a0a", "--bg-base": "#000000",
  "--border": "#8a8a8a", "--divider": "#5a5a5a", "--btn-bg": "#000000", "--btn-hover": "#1a1a1a",
  "--text-main": "#ffffff", "--text-title": "#ffffff", "--text-dim": "#bcbcbc", "--text-muted": "#ededed",
  "--tab-active": "#1d4ed8", "--coalition-bg": "#000000", "--table-stripe": "rgba(255,255,255,0.08)",
  "--hemi-stroke": "#9a9a9a", "--tooltip-bg": "#000000", "--tooltip-border": "#ffffff",
  "--bonus-bg": "#1c1500", "--bonus-border": "#ffc400", "--elim-bg": "#1c0000", "--elim-border": "#ff6b6b",
  "--map-bg": "#000000", "--map-stroke": "#ffffff", "--map-stroke-hover": "#ffd400",
};

export const THEMES = {
  dark:     { id: "dark",     label: "Midnight",       desc: "Default low-glare dark.",               base: "dark",  vars: DARK_VARS },
  light:    { id: "light",    label: "Daylight (dim)", desc: "Muted warm greige — easy on the eyes.", base: "light", vars: LIGHT_VARS },
  contrast: { id: "contrast", label: "High Contrast",  desc: "Pure-black ground, bold borders.",      base: "dark",  vars: CONTRAST_VARS },
};
export const THEME_ORDER = ["dark", "light", "contrast"];
export const DEFAULT_THEME = "dark";
export function resolveTheme(id) { return THEMES[id] || THEMES[DEFAULT_THEME]; }

/* PALETTES (data colours, keyed by Cyprus party id) */

// Red–Green safe (Deuteranopia / Protanopia). AKEL (the "red") pushed to dark
// magenta; greens (ALMA/EDEK/KOSP) to bright teal/cyan with strong luminance gaps.
const REDGREEN = {
  disy: "#0050C8", akel: "#A4036F", elam: "#2B2B2B", diko: "#E68A00", alma: "#2BC4C0",
  adk: "#7A00B8", edek: "#0E7C66", dipa: "#CC79A7", kosp: "#56B4E9", volt: "#5A3FCB",
  neo: "#E84FB0", kekk: "#6699CC", sypol: "#F0A030", solid: "#3B7DD8", others: "#9AA0A6",
};
// Blue–Yellow safe (Tritanopia). Red/green vision intact; lean on reds/greens/pinks.
const BLUEYELLOW = {
  disy: "#3B3FAF", akel: "#D7263D", elam: "#2B2B2B", diko: "#E8602A", alma: "#2E9B3F",
  adk: "#8E2DBD", edek: "#1F8A4C", dipa: "#B5179E", kosp: "#3FA45B", volt: "#6A2DA8",
  neo: "#E84FA0", kekk: "#7FA63F", sypol: "#E8762A", solid: "#2B5FB0", others: "#9AA0A6",
};
// Monochrome — greyscale by luminance, co-leaders spread across the range.
const MONO = {
  disy: "#2b2b2b", akel: "#ededed", elam: "#000000", diko: "#9a9a9a", alma: "#c4c4c4",
  adk: "#565656", edek: "#7a7a7a", dipa: "#404040", kosp: "#b0b0b0", volt: "#333333",
  neo: "#d6d6d6", kekk: "#868686", sypol: "#bdbdbd", solid: "#1c1c1c", others: "#8e8e8e",
};
export const CY_MONO_PATTERNS = {
  disy: "solid", akel: "diagonal", elam: "solid", diko: "cross", alma: "dots",
  adk: "horizontal", edek: "vertical", dipa: "diagonal2", kosp: "cross", volt: "diagonal",
  neo: "dots", kekk: "horizontal", sypol: "diagonal2", solid: "solid", others: "dots",
};

const PALETTE_FALLBACK = "#9AA0A6";

export const PALETTES = {
  default:    { id: "default",    label: "Default",          desc: "Each party's own colour.",                     colors: null },
  redgreen:   { id: "redgreen",   label: "Red–Green safe",   desc: "Deuteranopia / Protanopia — most common CVD.", colors: REDGREEN },
  blueyellow: { id: "blueyellow", label: "Blue–Yellow safe", desc: "Tritanopia — rare blue/yellow confusion.",     colors: BLUEYELLOW },
  mono:       { id: "mono",       label: "Monochrome",       desc: "Greyscale by luminance (+ map patterns).",     colors: MONO, patterns: CY_MONO_PATTERNS },
};
export const PALETTE_ORDER = ["default", "redgreen", "blueyellow", "mono"];
export const DEFAULT_PALETTE = "default";
export function resolvePalette(id) { return PALETTES[id] || PALETTES[DEFAULT_PALETTE]; }

// `default` is a no-op preserving authored/edited colours. Mono attaches a
// `.pattern` tag (ignored by components that don't read it).
export function applyPartyPalette(parties, paletteId) {
  const pal = resolvePalette(paletteId);
  if (!pal.colors || !Array.isArray(parties)) return parties;
  return parties.map(p => ({
    ...p,
    color: pal.colors[p.id] || PALETTE_FALLBACK,
    ...(pal.patterns ? { pattern: pal.patterns[p.id] || "solid" } : {}),
  }));
}