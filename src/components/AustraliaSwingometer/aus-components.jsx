// ─── aus-components.jsx ───────────────────────────────────────────────────────
import { memo, useState, useCallback } from "react";
import {
  S, EASE_STD, EASE_SPRING,
  MeanderBar, Slider,
  IconLock, IconGear, IconChevron,
} from "./aus-ui.jsx";
import {
  ausPartyColor, ausPartyLabel, ausFmt2PP, ausSwingLabel, ausFmtPrimary,
} from "./aus-engine.js";
import { AUS_PARTIES } from "./aus-data.js";

// ── Seat Tally ─────────────────────────────────────────────────────────────────
export const SeatTally = memo(function SeatTally({ counts, majority = 76 }) {
  if (!counts) return null;
  const { alp = 0, lnp = 0, grn = 0, ind = 0, total = 150 } = counts;
  const parties = [
    { id: "alp", seats: alp },
    { id: "lnp", seats: lnp },
    { id: "grn", seats: grn },
    { id: "ind", seats: ind },
  ].filter(p => p.seats > 0);

  return (
    <div style={{ ...S.card, marginBottom: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ ...S.label }}>House of Representatives</span>
        <span style={{ fontSize: 9, color: "var(--text-muted)", fontFamily: "var(--ff-mono)", background: "var(--bg-mid)", padding: "2px 7px", borderRadius: 4, border: "1px solid var(--border)" }}>
          Majority: {majority} seats
        </span>
      </div>
      <div style={{ display: "flex", height: 28, borderRadius: 6, overflow: "hidden", marginBottom: 8, position: "relative" }}>
        {parties.map(({ id, seats }) => (
          <div key={id} style={{ width: `${(seats / total) * 100}%`, background: ausPartyColor(id), transition: `width 0.4s ${EASE_STD}`, display: "flex", alignItems: "center", justifyContent: "center" }} title={`${ausPartyLabel(id)}: ${seats}`}>
            {seats >= 8 && (<span style={{ fontSize: 10, fontWeight: 700, color: "#fff", fontFamily: "var(--ff-mono)", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>{seats}</span>)}
          </div>
        ))}
        <div style={{ position: "absolute", left: `${(majority / total) * 100}%`, top: 0, width: 2, height: 28, background: "rgba(255,255,255,0.5)", zIndex: 10, pointerEvents: "none" }} />
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {parties.map(({ id, seats }) => (
          <div key={id} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: ausPartyColor(id), flexShrink: 0 }} />
            <span style={{ fontSize: 10, fontFamily: "var(--ff-mono)", color: "var(--text-dim)" }}>{ausPartyLabel(id)} <span style={{ color: "var(--text-title)", fontWeight: 600 }}>{seats}</span></span>
          </div>
        ))}
        <div style={{ marginLeft: "auto", fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--ff-mono)" }}>{total} total</div>
      </div>
      {(alp >= majority || lnp >= majority) && (
        <div style={{ marginTop: 10, padding: "6px 10px", background: ausPartyColor(alp >= majority ? "alp" : "lnp") + "18", border: `1px solid ${ausPartyColor(alp >= majority ? "alp" : "lnp")}40`, borderRadius: 6, fontSize: 11, fontWeight: 700, color: ausPartyColor(alp >= majority ? "alp" : "lnp"), textAlign: "center", letterSpacing: 0.5 }}>
          {ausPartyLabel(alp >= majority ? "alp" : "lnp")} — Majority Government
        </div>
      )}
      {alp < majority && lnp < majority && (
        <div style={{ marginTop: 10, padding: "6px 10px", background: "var(--bg-mid)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 11, color: "var(--text-dim)", textAlign: "center" }}>
          ⚖ Hung Parliament{alp > lnp ? " — ALP largest party" : lnp > alp ? " — LNP largest party" : " — tied"}
        </div>
      )}
    </div>
  );
});

// ── National 2PP display ───────────────────────────────────────────────────────
export const National2PP = memo(function National2PP({ current2PP, base2PP }) {
  if (current2PP == null) return null;
  const swing = current2PP - (base2PP ?? 50);
  const swingDir = swing > 0 ? "ALP" : "LNP";
  const swingColor = swing > 0 ? "#E13940" : "#1C4F9C";
  const swingAbs = Math.abs(swing).toFixed(1);
  return (
    <div style={{ ...S.cardSmall, marginBottom: 10 }}>
      <div style={{ ...S.label, marginBottom: 8 }}>National 2-Party Preferred</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 24, fontWeight: 800, fontFamily: "var(--ff-mono)", color: "#E13940" }}>{current2PP.toFixed(1)}</span>
        <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--ff-mono)" }}>% ALP / {(100 - current2PP).toFixed(1)}% LNP</span>
      </div>
      <div style={{ height: 10, borderRadius: 5, background: "#1C4F9C", overflow: "hidden", marginBottom: 6 }}>
        <div style={{ height: "100%", width: `${current2PP}%`, background: "#E13940", borderRadius: current2PP > 98 ? 5 : "5px 0 0 5px", transition: `width 0.3s ${EASE_STD}` }} />
      </div>
      {base2PP != null && Math.abs(swing) >= 0.05 && (
        <div style={{ fontSize: 10, color: swingColor, fontFamily: "var(--ff-mono)", display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontWeight: 700 }}>{swing > 0 ? "▲" : "▼"} {swingAbs}% swing to {swingDir}</span>
          <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>vs scenario baseline</span>
        </div>
      )}
    </div>
  );
});

// ── Hemicycle ──────────────────────────────────────────────────────────────────
// Simple, clean seat bar — like the original. No arc nonsense.
export const AusHemicycle = memo(function AusHemicycle({ projected, counts, majority = 76 }) {
  if (!projected?.length) return null;
  const { alp = 0, lnp = 0, grn = 0, ind = 0, total = 150 } = counts;

  const parties = [
    { id: "alp", seats: alp },
    { id: "grn", seats: grn },
    { id: "ind", seats: ind },
    { id: "lnp", seats: lnp },
  ].filter(p => p.seats > 0);

  const alpSide = alp + grn + ind;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ ...S.label }}>Seat Projection</span>
        <span style={{ fontSize: 9, color: "var(--text-muted)", fontFamily: "var(--ff-mono)", background: "var(--bg-mid)", padding: "2px 7px", borderRadius: 4, border: "1px solid var(--border)" }}>
          {majority} for majority
        </span>
      </div>

      {/* Seat bar */}
      <div style={{ position: "relative", height: 32, borderRadius: 6, overflow: "hidden", marginBottom: 10, display: "flex" }}>
        {parties.map(({ id, seats }) => (
          <div key={id} style={{
            width: `${(seats / total) * 100}%`,
            background: ausPartyColor(id),
            transition: `width 0.4s ${EASE_STD}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative",
          }}>
            {seats >= 6 && (
              <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", fontFamily: "var(--ff-mono)", textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>
                {seats}
              </span>
            )}
          </div>
        ))}
        {/* Majority line */}
        <div style={{
          position: "absolute",
          left: `${(majority / total) * 100}%`,
          top: 0, bottom: 0, width: 2,
          background: "rgba(255,255,255,0.7)",
          zIndex: 5,
        }} />
      </div>

      {/* Majority line label */}
      <div style={{ position: "relative", marginBottom: 8, height: 12 }}>
        <div style={{
          position: "absolute",
          left: `${(majority / total) * 100}%`,
          transform: "translateX(-50%)",
          fontSize: 8, color: "var(--text-dim)", fontFamily: "var(--ff-mono)",
          whiteSpace: "nowrap",
        }}>
          ▲ {majority} seats
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px" }}>
        {parties.map(({ id, seats }) => (
          <div key={id} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: ausPartyColor(id) }} />
            <span style={{ fontSize: 10, fontFamily: "var(--ff-mono)", color: "var(--text-dim)" }}>
              {ausPartyLabel(id)} <span style={{ color: ausPartyColor(id), fontWeight: 700 }}>{seats}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

// ── Metrics Cards ──────────────────────────────────────────────────────────────
export const AusMetricsCards = memo(function AusMetricsCards({ counts, national2PP, scenario, base2PP }) {
  const { alp = 0, lnp = 0, grn = 0, ind = 0 } = counts || {};
  const majority = scenario?.majority ?? 76;
  const swing = national2PP - (base2PP ?? 50);
  const swingDir = swing >= 0 ? "ALP" : "LNP";

  const cards = [
    { label: "ALP Seats",  value: alp,  color: ausPartyColor("alp"), extra: alp >= majority ? "★ Majority" : alp >= majority - 6 ? "Near majority" : "" },
    { label: "LNP Seats",  value: lnp,  color: ausPartyColor("lnp"), extra: lnp >= majority ? "★ Majority" : "" },
    { label: "GRN + IND",  value: grn + ind, color: "#40C0C0", extra: "" },
    { label: "ALP 2PP",    value: national2PP?.toFixed(1) + "%", color: swing >= 0 ? "#E13940" : "#1C4F9C", extra: `${swing >= 0 ? "▲" : "▼"} ${Math.abs(swing).toFixed(1)}pp to ${swingDir}` },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
      {cards.map(c => (
        <div key={c.label} style={{ ...S.card, padding: "10px 12px" }}>
          <div style={{ fontSize: 8, color: "var(--text-dim)", letterSpacing: 2, textTransform: "uppercase", fontFamily: "var(--ff-body)", marginBottom: 4 }}>{c.label}</div>
          <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--ff-mono)", color: c.color, lineHeight: 1 }}>{c.value}</div>
          {c.extra && <div style={{ fontSize: 8.5, color: "var(--text-muted)", marginTop: 3 }}>{c.extra}</div>}
        </div>
      ))}
    </div>
  );
});

// ── Results Table ──────────────────────────────────────────────────────────────
export const AusResultsTable = memo(function AusResultsTable({ counts, primaries, scenario }) {
  const { alp = 0, lnp = 0, grn = 0, ind = 0, total = 150 } = counts || {};
  const majority = scenario?.majority ?? 76;
  const known = scenario?.knownResult;

  const rows = [
    { id: "alp", seats: alp, pct: primaries?.alp },
    { id: "lnp", seats: lnp, pct: primaries?.lnp },
    { id: "grn", seats: grn, pct: primaries?.grn },
    { id: "ind", seats: ind, pct: (primaries?.ind ?? 0) + (primaries?.uap ?? 0) + (primaries?.onp ?? 0) },
  ];

  return (
    <div style={{ padding: "4px 0" }}>
      {/* Seat bar */}
      <div style={{ display: "flex", height: 20, borderRadius: 4, overflow: "hidden", marginBottom: 12, position: "relative" }}>
        {rows.filter(r => r.seats > 0).map(r => (
          <div key={r.id} style={{ width: `${(r.seats / total) * 100}%`, background: ausPartyColor(r.id), transition: `width 0.4s ${EASE_STD}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {r.seats >= 6 && <span style={{ fontSize: 9, fontWeight: 700, color: "#fff", fontFamily: "var(--ff-mono)" }}>{r.seats}</span>}
          </div>
        ))}
        <div style={{ position: "absolute", left: `${(majority / total) * 100}%`, top: 0, width: 2, height: 20, background: "rgba(255,255,255,0.5)", zIndex: 10 }} />
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
        <thead>
          <tr>
            {["Party", "Primary %", "Projected", known ? "2025 Actual" : null, "% Seats"].filter(Boolean).map(h => (
              <th key={h} style={{ textAlign: h === "Party" ? "left" : "right", padding: "2px 6px 6px", fontSize: 8, color: "var(--text-muted)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", borderBottom: "1px solid var(--border)" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id} style={{ borderBottom: "1px solid var(--border)" }}>
              <td style={{ padding: "5px 6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 7, height: 7, borderRadius: 2, background: ausPartyColor(row.id), flexShrink: 0 }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-dim)", fontFamily: "var(--ff-mono)" }}>{ausPartyLabel(row.id)}</span>
                </div>
              </td>
              <td style={{ textAlign: "right", padding: "5px 6px", fontFamily: "var(--ff-mono)", fontSize: 10, color: "var(--text-muted)" }}>{row.pct?.toFixed(1) ?? "—"}%</td>
              <td style={{ textAlign: "right", padding: "5px 6px", fontFamily: "var(--ff-mono)", fontSize: 11, fontWeight: 700, color: ausPartyColor(row.id) }}>{row.seats}</td>
              {known && <td style={{ textAlign: "right", padding: "5px 6px", fontFamily: "var(--ff-mono)", fontSize: 10, color: "var(--text-muted)" }}>{known[row.id] ?? "—"}</td>}
              <td style={{ textAlign: "right", padding: "5px 6px", fontFamily: "var(--ff-mono)", fontSize: 10, color: "var(--text-dim)" }}>{total > 0 ? ((row.seats / total) * 100).toFixed(1) : "0.0"}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      {scenario && (
        <div style={{ marginTop: 10, padding: "6px 8px", background: "var(--bg-mid)", borderRadius: 5, border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 8.5, color: "var(--text-muted)", fontFamily: "var(--ff-mono)", letterSpacing: 0.5 }}>
            {scenario.fullLabel} · {scenario.sublabel}
          </div>
        </div>
      )}
    </div>
  );
});

// ── State Breakdown ────────────────────────────────────────────────────────────
export const AusStateBreakdown = memo(function AusStateBreakdown({ stateData }) {
  if (!stateData?.length) return null;
  return (
    <div style={{ padding: "4px 0" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
        <thead>
          <tr>
            {["State", "ALP", "LNP", "GRN", "IND", "Total"].map(h => (
              <th key={h} style={{ textAlign: h === "State" ? "left" : "right", padding: "2px 4px 6px", fontSize: 8, color: "var(--text-muted)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", borderBottom: "1px solid var(--border)" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {stateData.map(row => (
            <tr key={row.state} style={{ borderBottom: "1px solid var(--border)" }}>
              <td style={{ padding: "4px 4px", fontWeight: 700, color: "var(--text-dim)", fontFamily: "var(--ff-mono)", fontSize: 10 }}>{row.state}</td>
              {["alp", "lnp", "grn", "ind"].map(p => (
                <td key={p} style={{ textAlign: "right", padding: "4px 4px", fontFamily: "var(--ff-mono)", fontSize: 10, color: row[p] > 0 ? ausPartyColor(p) : "var(--text-dim)", fontWeight: row[p] > 0 ? 600 : 400 }}>
                  {row[p] > 0 ? row[p] : "—"}
                </td>
              ))}
              <td style={{ textAlign: "right", padding: "4px 4px", fontFamily: "var(--ff-mono)", fontSize: 10, color: "var(--text-muted)" }}>{row.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

// ── Sliders Panel ──────────────────────────────────────────────────────────────
export const AusSlidersPanel = memo(function AusSlidersPanel({
  primaries, lockedParties, onPrimaryChange, onToggleLock,
  prefFlows, onPrefChange, national2PP, base2PP, scenario,
}) {
  const [showPrefs, setShowPrefs] = useState(false);
  const total = Object.values(primaries).reduce((s, v) => s + Math.max(0, v), 0);
  const MINOR = AUS_PARTIES.filter(p => p.id !== "alp" && p.id !== "lnp");
  const swing = national2PP - (base2PP ?? 50);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* 2PP Card */}
      <div style={{ ...S.card }}>
        <div style={{ ...S.label, marginBottom: 6 }}>National 2-Party Preferred</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--ff-mono)", color: "#E13940" }}>{national2PP?.toFixed(1)}%</span>
          <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--ff-mono)" }}>ALP / {(100 - (national2PP ?? 50)).toFixed(1)}% LNP</span>
        </div>
        <div style={{ height: 8, borderRadius: 4, background: "#1C4F9C", overflow: "hidden", marginBottom: 4 }}>
          <div style={{ height: "100%", width: `${national2PP ?? 50}%`, background: "#E13940", borderRadius: "4px 0 0 4px", transition: `width 0.3s ${EASE_STD}` }} />
        </div>
        {Math.abs(swing) >= 0.05 && (
          <div style={{ fontSize: 9.5, color: swing > 0 ? "#E13940" : "#1C4F9C", fontFamily: "var(--ff-mono)" }}>
            {swing > 0 ? "▲" : "▼"} {Math.abs(swing).toFixed(1)}pp swing to {swing >= 0 ? "ALP" : "LNP"}
          </div>
        )}
      </div>

      {/* Primary Vote Sliders */}
      <div style={{ ...S.card }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ ...S.label }}>Primary Vote</span>
          <span style={{ fontSize: 9, fontFamily: "var(--ff-mono)", color: Math.abs(total - 100) < 0.2 ? "#34d399" : "#f87171", background: "var(--bg-mid)", padding: "2px 7px", borderRadius: 4, border: "1px solid var(--border)" }}>Σ {total.toFixed(1)}%</span>
        </div>
        {AUS_PARTIES.map(party => (
          <div key={party.id} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0, width: 54 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: ausPartyColor(party.id), flexShrink: 0 }} />
              <span style={{ fontSize: 9, color: "var(--text-muted)", fontFamily: "var(--ff-mono)", letterSpacing: 0.5 }}>{ausPartyLabel(party.id)}</span>
            </div>
            <div style={{ flex: 1 }}>
              <Slider value={primaries[party.id] ?? 0} min={0}
                max={party.maxPrimary ?? (party.id === "alp" || party.id === "lnp" ? 60 : 25)}
                step={0.1}
                onChange={v => onPrimaryChange(party.id, v)} color={ausPartyColor(party.id)}
                disabled={lockedParties?.has(party.id)} />
            </div>
            {onToggleLock && (
              <button className="icon-btn" onClick={() => onToggleLock(party.id)}
                style={{ ...S.ghostBtn, width: 22, height: 22, padding: 0, justifyContent: "center", alignItems: "center", flexShrink: 0,
                  borderColor: lockedParties?.has(party.id) ? "var(--text-muted)" : "var(--border)",
                  color: lockedParties?.has(party.id) ? "var(--text-title)" : "var(--text-dim)" }}>
                <IconLock locked={lockedParties?.has(party.id)} size={9} />
              </button>
            )}
          </div>
        ))}
        <MeanderBar margin="8px 0 0" />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ fontSize: 9, color: "var(--text-muted)" }}>Informal / uncounted</span>
          <span style={{ fontSize: 9, fontFamily: "var(--ff-mono)", color: "var(--text-dim)" }}>{Math.max(0, 100 - total).toFixed(1)}%</span>
        </div>
      </div>

      {/* Preference Flows (collapsible) */}
      <div style={{ ...S.card }}>
        <button onClick={() => setShowPrefs(e => !e)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: 0 }}>
          <span style={{ ...S.label, fontSize: 9 }}>Preference Flows</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 9, color: "var(--text-muted)" }}>{showPrefs ? "Collapse" : "Expand"}</span>
            <div style={{ transform: showPrefs ? "rotate(180deg)" : "rotate(0deg)", transition: `transform 0.2s ${EASE_STD}`, color: "var(--text-dim)" }}>
              <IconChevron dir="down" size={10} />
            </div>
          </div>
        </button>
        {showPrefs && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 9, color: "var(--text-muted)", marginBottom: 10, lineHeight: 1.5 }}>
              Adjust where each minor party's preferences flow. Slider shows % flowing to ALP.
            </div>
            {MINOR.map(party => {
              const override = prefFlows?.[party.id];
              const defaultAlp = Math.round(party.prefToAlp * 100);
              const current = override?.toAlp ?? defaultAlp;
              return (
                <div key={party.id} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: ausPartyColor(party.id), flexShrink: 0 }} />
                    <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-dim)", fontFamily: "var(--ff-mono)" }}>{ausPartyLabel(party.id)} preferences</span>
                    {override != null && (
                      <button onClick={() => onPrefChange(party.id, null)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: 8, color: "var(--text-muted)", padding: "1px 4px" }} title="Reset to default">Reset</button>
                    )}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontSize: 9, color: "#E13940", fontFamily: "var(--ff-mono)" }}>ALP {current}%</span>
                    <span style={{ fontSize: 9, color: "#1C4F9C", fontFamily: "var(--ff-mono)" }}>{100 - current}% LNP</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 3, background: "#1C4F9C", overflow: "hidden", marginBottom: 4 }}>
                    <div style={{ height: "100%", width: `${current}%`, background: "#E13940", borderRadius: current > 98 ? 3 : "3px 0 0 3px", transition: `width 0.15s ${EASE_STD}` }} />
                  </div>
                  <input type="range" min={0} max={100} step={1} value={current}
                    onChange={e => onPrefChange(party.id, { toAlp: parseInt(e.target.value), toLnp: 100 - parseInt(e.target.value) })}
                    style={{ width: "100%", height: 4, borderRadius: 2, background: `linear-gradient(to right, #E13940 0%, #E13940 ${current}%, #1C4F9C ${current}%)`, WebkitAppearance: "none", outline: "none", cursor: "pointer" }} />
                  <div style={{ fontSize: 8, color: "var(--text-dim)", marginTop: 2 }}>
                    Historical default: {defaultAlp}% → ALP {override != null && <span style={{ color: "#fbbf24" }}>(modified)</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
});

// ── Seats on a Line ────────────────────────────────────────────────────────────
export const AusSeatsOnLine = memo(function AusSeatsOnLine({ marginals }) {
  const [showAll, setShowAll] = useState(false);
  if (!marginals?.length) return null;
  const displayed = showAll ? marginals : marginals.slice(0, 15);

  return (
    <div style={{ padding: "4px 0" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {displayed.map((div, i) => {
          const color = ausPartyColor(div.winner);
          const margin = div.flipDistance?.toFixed(1) ?? "—";
          return (
            <div key={div.id ?? i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 8px", background: "var(--bg-mid)", borderRadius: 5, border: "1px solid var(--border)" }}>
              <span style={{ fontSize: 8, color: "var(--text-dim)", fontFamily: "var(--ff-mono)", width: 14, flexShrink: 0 }}>{i + 1}</span>
              <div style={{ width: 7, height: 7, borderRadius: 2, background: color, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-title)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{div.name}</div>
                <div style={{ fontSize: 8, color: "var(--text-muted)" }}>{div.state}</div>
              </div>
              <span style={{ fontSize: 8, fontWeight: 700, color, fontFamily: "var(--ff-mono)", letterSpacing: 1, flexShrink: 0 }}>{ausPartyLabel(div.winner)}</span>
              <span style={{ fontSize: 9, fontFamily: "var(--ff-mono)", color: parseFloat(margin) < 1 ? "#f87171" : parseFloat(margin) < 3 ? "#fbbf24" : "var(--text-dim)", minWidth: 34, textAlign: "right", fontWeight: 600, flexShrink: 0 }}>
                {margin}%
              </span>
            </div>
          );
        })}
      </div>
      {marginals.length > 15 && (
        <button onClick={() => setShowAll(s => !s)} style={{ ...S.ghostBtn, width: "100%", justifyContent: "center", marginTop: 8, fontSize: 9 }} className="icon-btn">
          {showAll ? "Show less" : `Show all ${marginals.length}`}
        </button>
      )}
    </div>
  );
});

// ── Legacy named exports (keep backward compat) ─────────────────────────────────
export const StateBreakdown = AusStateBreakdown;
export const MarginalSeats = AusSeatsOnLine;
export const PrimarySliders = AusSlidersPanel;
export const PrefFlows = AusSlidersPanel;
