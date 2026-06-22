// GreeceThemes.js
// ─────────────────────────────────────────────────────────────────────────────
//  Two independent axes:
//
//   • THEME    — the UI chrome (backgrounds, borders, text). dark / light / contrast.
//                Applied as CSS custom properties on the app root, so the whole
//                subtree re-themes without per-component changes and regardless of
//                whatever the page shell defines.  Font vars (--ff-*) are left out
//                so they inherit the shell's typography.  `base` ("dark"|"light")
//                is reported up so the shell's own chrome stays in step.
//
//   • PALETTE  — the DATA colours (map fills, hemicycle dots, table swatches).
//                Default keeps each party's authored colour. The colour-blind
//                palettes remap every party to a set chosen for accessibility,
//                separated primarily by LUMINANCE (the one channel every form of
//                colour-vision-deficiency preserves) — the principle behind the
//                contrast requirements in WCAG 2.1 / EN 301 549.
//
//  Decoupling them means you can run, say, Monochrome on a dark chrome, or the
//  Red–Green palette on the soft light chrome, in any combination.
// ─────────────────────────────────────────────────────────────────────────────

/* ───────────────────────── THEMES (chrome) ──────────────────────────────── */

// Default dark theme is a PASS-THROUGH: it sets NO variables, so the app inherits
// the page shell's original dark palette exactly — including the district border
// colour (--map-stroke) the shell already defines. This keeps "Midnight" pixel-
// identical to how the app shipped before any theming changes.
const DARK_VARS = {};

// Muted greige daylight — deliberately dim. The old soft-white still threw a lot
// of light; this drops surface luminance ~20% into warm grey/beige so it reads as
// "paper in shade", not "lightbulb". Text stays dark slate (not black) to soften
// the edge contrast that also causes glare fatigue.
const LIGHT_VARS = {
  "--bg-base": "#cfccc3", "--bg-card": "#dedbd2", "--bg-mid": "#dedbd2", "--bg-up": "#c4c1b8",
  "--border": "#b3afa3", "--divider": "#c7c3b8", "--btn-bg": "#d4d1c8", "--btn-bg-active": "#c2bfb4", "--btn-hover": "#cbc8bd",
  "--text-main": "#2a2e34", "--text-title": "#1d2127", "--text-bright": "#14181d", "--text-muted": "#54595f", "--text-dim": "#797d82",
  "--tab-active": "#c5d2e6", "--table-stripe": "rgba(0,0,0,0.04)",
  "--hemi-stroke": "#b3afa3", "--coalition-bg": "#c4c1b8",
  "--map-bg": "#cfccc3", "--map-stroke": "#b6b2a6", "--map-stroke-hover": "#5b5f64",
  "--tooltip-bg": "#e7e4db", "--tooltip-border": "#b3afa3",
  "--bonus-bg": "#ece0c0", "--bonus-border": "#d9c089",
  "--elim-bg": "#ecd6d6", "--elim-border": "#d9aeae",
};

const CONTRAST_VARS = {
  "--bg-base": "#000000", "--bg-card": "#0a0a0a", "--bg-mid": "#0a0a0a", "--bg-up": "#000000",
  "--border": "#8a8a8a", "--divider": "#5a5a5a", "--btn-bg": "#000000", "--btn-bg-active": "#1f1f1f", "--btn-hover": "#1a1a1a",
  "--text-main": "#ffffff", "--text-title": "#ffffff", "--text-bright": "#ffffff", "--text-muted": "#ededed", "--text-dim": "#bcbcbc",
  "--tab-active": "#1d4ed8", "--table-stripe": "rgba(255,255,255,0.08)",
  "--hemi-stroke": "#9a9a9a", "--coalition-bg": "#000000",
  "--map-bg": "#000000", "--map-stroke": "#ffffff", "--map-stroke-hover": "#ffd400",
  "--tooltip-bg": "#000000", "--tooltip-border": "#ffffff",
  "--bonus-bg": "#1c1500", "--bonus-border": "#ffc400",
  "--elim-bg": "#1c0000", "--elim-border": "#ff6b6b",
};

export const THEMES = {
  dark:     { id: "dark",     label: "Midnight",       desc: "Default low-glare dark.",                base: "dark",  vars: DARK_VARS },
  light:    { id: "light",    label: "Daylight (dim)", desc: "Muted warm greige — easy on the eyes.",  base: "light", vars: LIGHT_VARS },
  contrast: { id: "contrast", label: "High Contrast",  desc: "Pure-black ground, bold borders.",       base: "dark",  vars: CONTRAST_VARS },
};
export const THEME_ORDER = ["dark", "light", "contrast"];
export const DEFAULT_THEME = "dark";
export function resolveTheme(id) { return THEMES[id] || THEMES[DEFAULT_THEME]; }

/* ───────────────────────── PALETTES (data colours) ──────────────────────── */

// Red–Green safe (Deuteranopia / Protanopia ≈ 1 in 12 men).
// Reds pushed DARK or toward magenta (which keeps a blue component CVD users can
// see); greens pushed to a LIGHT bright teal/cyan. The point is that the two
// historically-clashing parties (SYRIZA red vs PASOK green) now differ massively
// in luminance, so they never collapse to the same muddy tone.
const REDGREEN = {
  nd: "#0050C8", syriza: "#A4036F", pasok: "#2BC4C0", kke: "#5C001E", el: "#E68A00",
  na: "#5A3FCB", niki: "#8A5A00", pe: "#E84FB0", mera25: "#7A00B8", spartans: "#B58900",
  gd: "#3A3A3A", fl: "#22A2E8", pat: "#0B2B7A", elas: "#B5176E", elpida: "#E6C200",
  dpk: "#C85A00", samaras: "#0A1F5C", other: "#9AA0A6", us_dem: "#0050C8", us_rep: "#A4036F",
};

// Blue–Yellow safe (Tritanopia, rare). Red–green vision is intact here, so we
// lean on reds/greens/pinks and high luminance contrast, and avoid resting any
// distinction on a blue-vs-yellow pairing.
const BLUEYELLOW = {
  nd: "#3B3FAF", syriza: "#D7263D", pasok: "#2E9B3F", kke: "#7A1020", el: "#E8602A",
  na: "#8E2DBD", niki: "#9E5B1F", pe: "#E84FA0", mera25: "#B5179E", spartans: "#C98A00",
  gd: "#3A3A3A", fl: "#1FA0A0", pat: "#13256B", elas: "#B81E54", elpida: "#A86E00",
  dpk: "#E8762A", samaras: "#0E1E55", other: "#9AA0A6", us_dem: "#3B3FAF", us_rep: "#D7263D",
};

// Monochrome / High Contrast. Greyscale only, with the typical co-leaders spread
// across the full black→light-grey range so adjacent districts never share a tone.
// GR_MONO_PATTERNS tags each party with a hatch style so the map can additionally
// texture fills (wired separately in Map.jsx).
const MONO = {
  nd: "#2b2b2b", syriza: "#ededed", pasok: "#7a7a7a", kke: "#111111", el: "#c4c4c4",
  na: "#565656", niki: "#9a9a9a", pe: "#d6d6d6", mera25: "#404040", spartans: "#b0b0b0",
  gd: "#303030", fl: "#868686", pat: "#1c1c1c", elas: "#bdbdbd", elpida: "#cccccc",
  dpk: "#646464", samaras: "#222222", other: "#8e8e8e", us_dem: "#2b2b2b", us_rep: "#ededed",
};
export const GR_MONO_PATTERNS = {
  nd: "solid", syriza: "diagonal", pasok: "cross", kke: "solid", el: "dots",
  na: "horizontal", niki: "vertical", pe: "diagonal2", mera25: "diagonal", spartans: "cross",
  gd: "horizontal", fl: "dots", pat: "vertical", elas: "diagonal2", elpida: "cross",
  dpk: "diagonal", samaras: "solid", other: "dots", us_dem: "solid", us_rep: "diagonal",
};

const PALETTE_FALLBACK = "#9AA0A6";

export const PALETTES = {
  default:    { id: "default",    label: "Default",          desc: "Each party's own colour.",                     colors: null },
  redgreen:   { id: "redgreen",   label: "Red–Green safe",   desc: "Deuteranopia / Protanopia — most common CVD.", colors: REDGREEN },
  blueyellow: { id: "blueyellow", label: "Blue–Yellow safe", desc: "Tritanopia — rare blue/yellow confusion.",     colors: BLUEYELLOW },
  mono:       { id: "mono",       label: "Monochrome",       desc: "Greyscale by luminance (+ map patterns).",     colors: MONO, patterns: GR_MONO_PATTERNS },
};
export const PALETTE_ORDER = ["default", "redgreen", "blueyellow", "mono"];
export const DEFAULT_PALETTE = "default";
export function resolvePalette(id) { return PALETTES[id] || PALETTES[DEFAULT_PALETTE]; }

/* ───────────────────────── helper ───────────────────────────────────────── */

// Remap an array of parties to the active data palette. `default` is a cheap
// no-op that preserves authored/edited colours. Mono additionally attaches a
// `.pattern` tag (ignored by components that don't use it).
export function applyPartyPalette(parties, paletteId) {
  const pal = resolvePalette(paletteId);
  if (!pal.colors || !Array.isArray(parties)) return parties;
  return parties.map(p => ({
    ...p,
    color: pal.colors[p.id] || PALETTE_FALLBACK,
    ...(pal.patterns ? { pattern: pal.patterns[p.id] || "solid" } : {}),
  }));
}