// CyprusThemePicker.jsx
import { S, IconCheck } from "./cyprus-ui.jsx";
import { THEMES, THEME_ORDER, PALETTES, PALETTE_ORDER, resolvePalette } from "./CyprusThemes.js";
import { CY_PARTY_DICT } from "./cyprus-data.js";

const PREVIEW_IDS = ["disy", "akel", "diko", "elam", "edek", "kosp"];

function paletteColors(paletteId) {
  const pal = resolvePalette(paletteId);
  return PREVIEW_IDS.map(id => (pal.colors ? (pal.colors[id] || "#9AA0A6") : (CY_PARTY_DICT[id]?.color || "#888")));
}

function ThemeCard({ theme, active, onSelect }) {
  const v = theme.vars || {};
  // Dark is a pass-through (no vars); fall back to a representative dark preview.
  const bg = v["--bg-up"] || "#0f172a";
  const card = v["--bg-mid"] || "#1e293b";
  const border = v["--border"] || "#334155";
  const title = v["--text-title"] || "#ffffff";
  const dim = v["--text-dim"] || "#94a3b8";
  return (
    <button className="icon-btn" onClick={() => onSelect(theme.id)}
      style={{ textAlign: "left", cursor: "pointer", borderRadius: 10, padding: 0, overflow: "hidden",
        background: "var(--btn-bg)", border: active ? "2px solid #2563EB" : "1px solid var(--border)",
        boxShadow: active ? "0 0 0 3px rgba(37,99,235,0.18)" : "none", display: "flex", flexDirection: "column" }}>
      <div style={{ background: bg, padding: 10, borderBottom: `1px solid ${border}` }}>
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 6, padding: "8px 10px" }}>
          <div style={{ height: 6, width: "55%", borderRadius: 3, background: title, opacity: 0.9, marginBottom: 6 }}/>
          <div style={{ height: 4, width: "80%", borderRadius: 2, background: dim }}/>
        </div>
      </div>
      <div style={{ padding: "9px 11px", display: "flex", justifyContent: "space-between", gap: 8 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-title)", fontFamily: "var(--ff-body)" }}>{theme.label}</div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--ff-body)", marginTop: 3, lineHeight: 1.4 }}>{theme.desc}</div>
        </div>
        {active && <div style={{ flexShrink: 0, width: 20, height: 20, borderRadius: "50%", background: "#2563EB", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}><IconCheck size={12}/></div>}
      </div>
    </button>
  );
}

export default function CyprusThemePicker({ current, onSelect, currentPalette, onSelectPalette, onClose, isMobile }) {
  const pal = resolvePalette(currentPalette);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? 12 : 24, backdropFilter: "blur(4px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ padding: isMobile ? 20 : 28, width: "100%", maxWidth: 560, maxHeight: "85vh", overflowY: "auto", background: "var(--bg-base, var(--bg-up))", borderRadius: 12, border: "1px solid var(--border)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <h3 style={{ margin: 0, fontFamily: "var(--ff-head)", fontSize: 20, color: "var(--text-title)", letterSpacing: 0.5 }}>Appearance</h3>
          <button className="icon-btn" onClick={onClose} style={{ ...S.ghostBtn, border: "none", fontSize: 18 }}>✕</button>
        </div>

        <div style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "var(--ff-body)", margin: "14px 0 10px" }}>Theme</div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 10 }}>
          {THEME_ORDER.map(id => <ThemeCard key={id} theme={THEMES[id]} active={current === id} onSelect={onSelect} />)}
        </div>

        <div style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "var(--ff-body)", margin: "22px 0 8px" }}>Colour-blind palette</div>
        <p style={{ margin: "0 0 10px", fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--ff-body)", lineHeight: 1.5 }}>
          Recolours the map, parliament and tables. Red–green deficiency affects ~1 in 12 men, where a red and a green party can read as the same muddy tone — these palettes separate every party by luminance so that can't happen.
        </p>
        <select value={currentPalette} onChange={e => onSelectPalette(e.target.value)} style={{ ...S.editInput, width: "100%", padding: "8px 10px", fontSize: 12, cursor: "pointer" }}>
          {PALETTE_ORDER.map(id => <option key={id} value={id}>{PALETTES[id].label}</option>)}
        </select>
        <div style={{ marginTop: 10, padding: "10px 12px", background: "var(--btn-bg)", border: "1px solid var(--border)", borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--ff-body)", marginBottom: 8 }}>{pal.desc}</div>
          <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
            {paletteColors(currentPalette).map((c, i) => <div key={i} style={{ width: 18, height: 18, borderRadius: "50%", background: c, border: "1px solid rgba(128,128,128,0.4)" }}/>)}
            <span style={{ fontSize: 9, color: "var(--text-dim)", fontFamily: "var(--ff-mono)", marginLeft: 4 }}>DISY · AKEL · DIKO · ELAM · EDEK · KOSP</span>
          </div>
        </div>

        <div style={{ marginTop: 22, display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ background: "#2563EB", color: "#fff", border: "none", borderRadius: 6, padding: "8px 24px", cursor: "pointer", fontFamily: "var(--ff-body)", fontWeight: 600 }}>Done</button>
        </div>
      </div>
    </div>
  );
}
