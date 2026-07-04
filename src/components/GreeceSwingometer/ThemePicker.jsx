// ThemePicker.jsx
import { S } from "./GreeceStyles";
import { THEMES, THEME_ORDER, PALETTES, PALETTE_ORDER, resolvePalette } from "./GreeceThemes.js";
import { GR_PARTY_DICT } from "./greece-data.js";
import { IconCheck } from "./GreeceIcons";
import { useGreeceT } from "./GreeceTranslations.jsx";

// Parties shown in the little colour previews (the usual map co-leaders).
const PREVIEW_IDS = ["nd", "syriza", "pasok", "kke", "el", "pe"];

function paletteColors(paletteId) {
  const pal = resolvePalette(paletteId);
  return PREVIEW_IDS.map(id => (pal.colors ? (pal.colors[id] || "#9AA0A6") : (GR_PARTY_DICT[id]?.color || "#888")));
}

function ThemeCard({ theme, active, onSelect, t }) {
  const v = theme.vars;
  return (
    <button
      className="icon-btn"
      onClick={() => onSelect(theme.id)}
      style={{
        textAlign: "left", cursor: "pointer", borderRadius: 10, padding: 0, overflow: "hidden",
        background: "var(--btn-bg)",
        border: active ? "2px solid #60A5FA" : "1px solid var(--border)",
        boxShadow: active ? "0 0 0 3px rgba(96,165,250,0.18)" : "none",
        display: "flex", flexDirection: "column",
      }}
    >
      {/* Live mini-preview rendered with the theme's OWN variables */}
      <div style={{ background: v["--bg-base"], padding: 10, borderBottom: `1px solid ${v["--border"]}` }}>
        <div style={{ background: v["--bg-card"], border: `1px solid ${v["--border"]}`, borderRadius: 6, padding: "8px 10px" }}>
          <div style={{ height: 6, width: "55%", borderRadius: 3, background: v["--text-title"], opacity: 0.9, marginBottom: 6 }}/>
          <div style={{ height: 4, width: "80%", borderRadius: 2, background: v["--text-dim"] }}/>
        </div>
      </div>
      <div style={{ padding: "9px 11px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-title)", fontFamily: "var(--ff-body)", letterSpacing: 0.3 }}>{t(theme.label)}</div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--ff-body)", marginTop: 3, lineHeight: 1.4 }}>{t(theme.desc)}</div>
        </div>
        {active && (
          <div style={{ flexShrink: 0, width: 20, height: 20, borderRadius: "50%", background: "#60A5FA", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IconCheck size={12}/>
          </div>
        )}
      </div>
    </button>
  );
}

export default function ThemePicker({ current, onSelect, currentPalette, onSelectPalette, onClose, isMobile, lang }) {
  const t = useGreeceT(lang);
  const pal = resolvePalette(currentPalette);
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? 12 : 24, backdropFilter: "blur(4px)" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ padding: isMobile ? 20 : 28, width: "100%", maxWidth: 560, maxHeight: "85vh", overflowY: "auto", background: "var(--bg-base)", borderRadius: 12, border: "1px solid var(--border)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <h3 style={{ margin: 0, fontFamily: "var(--ff-head)", fontSize: 20, color: "var(--text-title)", letterSpacing: 0.5 }}>{t("Appearance")}</h3>
          <button className="icon-btn" onClick={onClose} style={{ ...S.ghostBtn, border: "none", fontSize: 18 }}>✕</button>
        </div>

        {/* ── THEME (chrome) ─────────────────────────────────────────── */}
        <div style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "var(--ff-body)", margin: "14px 0 10px" }}>{t("Theme")}</div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 10 }}>
          {THEME_ORDER.map(id => (
            <ThemeCard key={id} theme={THEMES[id]} active={current === id} onSelect={onSelect} t={t} />
          ))}
        </div>

        {/* ── PALETTE (data / colour-blind) ──────────────────────────── */}
        <div style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "var(--ff-body)", margin: "22px 0 8px" }}>{t("Colour-blind palette")}</div>
        <p style={{ margin: "0 0 10px", fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--ff-body)", lineHeight: 1.5 }}>
          {t("Recolours the map, parliament and tables. Red–green deficiency affects ~1 in 12 men, where a red and a green party can read as the same muddy tone — these palettes separate every party by luminance so that can't happen.")}
        </p>

        <select
          value={currentPalette}
          onChange={e => onSelectPalette(e.target.value)}
          style={{ ...S.editInput, width: "100%", padding: "8px 10px", fontSize: 12, cursor: "pointer" }}
        >
          {PALETTE_ORDER.map(id => (
            <option key={id} value={id}>{t(PALETTES[id].label)}</option>
          ))}
        </select>

        <div style={{ marginTop: 10, padding: "10px 12px", background: "var(--btn-bg)", border: "1px solid var(--border)", borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--ff-body)", marginBottom: 8, lineHeight: 1.4 }}>{t(pal.desc)}</div>
          <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
            {paletteColors(currentPalette).map((c, i) => (
              <div key={i} style={{ width: 18, height: 18, borderRadius: "50%", background: c, border: "1px solid rgba(128,128,128,0.4)" }}/>
            ))}
            <span style={{ fontSize: 9, color: "var(--text-dim)", fontFamily: "var(--ff-mono)", marginLeft: 4 }}>ND · SYRIZA · PASOK · KKE · EL · PE</span>
          </div>
        </div>

        <div style={{ marginTop: 22, display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{ background: "#2563EB", color: "#fff", border: "none", borderRadius: 6, padding: "8px 24px", cursor: "pointer", fontFamily: "var(--ff-body)", fontWeight: 600 }}
          >
            {t("Done")}
          </button>
        </div>
      </div>
    </div>
  );
}
