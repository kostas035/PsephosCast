// ─── components.jsx ───────────────────────────────────────────────────────────
import { useState, useEffect, useRef, memo } from "react";
import { S, EASE_STD, EASE_SPRING } from "./styles.jsx";
import { IconGear, IconTrash, IconLock } from "./icons.jsx";
import { IDEOLOGIES } from "./data.js";

// ─── PartyRow ────────────────────────────────────────────────────────────────
export const PartyRow = memo(function PartyRow({
  party, isEditingAllowed, onPctChange, onToggleLock, onEdit, onDelete,
}) {
  const [editing,   setEditing]   = useState(false);
  const [localPct,  setLocalPct]  = useState(party.percent);
  const debounceRef = useRef(null);

  useEffect(() => { setLocalPct(party.percent); }, [party.percent]);
  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const handleSliderChange = (e) => {
    const val = parseFloat(e.target.value);
    setLocalPct(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onPctChange(party.id, val), 120);
  };

  const pctFill = Math.min(100, Math.max(0, localPct));

  return (
    <div style={{
      marginBottom:  10,
      padding:       editing ? 10 : 0,
      background:    editing ? "var(--btn-hover)" : "var(--bg-mid)",
      borderRadius:  10,
      border:        `1px solid ${editing ? "var(--text-muted)" : "var(--border)"}`,
      transition:    `all 0.2s ${EASE_STD}`,
    }}>
      {/* Header row */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: editing ? "0 0 8px 0" : "10px 10px 4px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          {/* Color swatch */}
          <div style={{
            width: 4, height: 18, borderRadius: 3,
            background: party.color, flexShrink: 0,
            boxShadow: `0 0 8px ${party.color}66`,
          }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <span style={{
              fontSize: 12, fontWeight: 700, color: "var(--text-title)",
              fontFamily: "var(--ff-body)", lineHeight: 1.2, letterSpacing: 0.2,
            }}>
              {party.name}
            </span>
            {party.party && (
              <span style={{
                fontSize: 9, color: "var(--text-dim)", fontFamily: "var(--ff-body)",
                letterSpacing: 0.6, lineHeight: 1.2, textTransform: "uppercase",
              }}>
                {party.party}
              </span>
            )}
          </div>

          {isEditingAllowed && (
            <>
              <button
                className="icon-btn"
                onClick={() => onToggleLock(party.id)}
                title={party.isLocked ? "Unlock" : "Lock"}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  padding: "2px 3px", display: "flex", alignItems: "center", borderRadius: 3,
                  color: party.isLocked ? "#F59E0B" : "var(--text-dim)",
                }}
              >
                <IconLock locked={party.isLocked} size={11} />
              </button>
              <button
                className="icon-btn"
                onClick={() => setEditing(!editing)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  padding: "2px 3px", borderRadius: 3,
                  color: editing ? "#60A5FA" : "var(--text-dim)",
                }}
              >
                <IconGear size={11} />
              </button>
            </>
          )}
        </div>

        <span style={{
          fontSize: 13, fontWeight: 700,
          fontFamily: "var(--ff-mono)", color: party.color,
          letterSpacing: -0.5,
          textShadow: `0 0 12px ${party.color}55`,
        }}>
          {localPct.toFixed(1)}%
        </span>
      </div>

      {/* Edit panel */}
      {editing && isEditingAllowed && (
        <div style={{
          display: "grid", gap: 7, marginTop: 2, marginBottom: 10,
          paddingBottom: 10, borderBottom: "1px dashed var(--border)",
        }}>
          <div style={{ display: "flex", gap: 6 }}>
            <input
              type="color" value={party.color}
              onChange={(e) => onEdit(party.id, "color", e.target.value)}
              style={{ width: 26, height: 26, padding: 2, border: "1px solid var(--border)", borderRadius: 4, cursor: "pointer", background: "var(--btn-bg)" }}
            />
            <input
              type="text" value={party.name}
              onChange={(e) => onEdit(party.id, "name", e.target.value)}
              style={{ ...S.editInput, flexGrow: 1 }} placeholder="Name"
            />
            <input
              type="text" value={party.party}
              onChange={(e) => onEdit(party.id, "party", e.target.value)}
              style={{ ...S.editInput, width: 80 }} placeholder="Party"
            />
          </div>
          <select
            value={party.ideology}
            onChange={(e) => onEdit(party.id, "ideology", parseInt(e.target.value))}
            style={{ ...S.editInput, width: "100%" }}
          >
            {IDEOLOGIES.map((i) => <option key={i.val} value={i.val}>{i.name}</option>)}
          </select>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 2 }}>
            <button
              className="icon-btn"
              onClick={() => onDelete(party.id)}
              style={{
                background: "#EF44441A", color: "#EF4444",
                border: "1px solid #EF444430", padding: "4px 10px", borderRadius: 4,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                fontSize: 10, fontFamily: "var(--ff-body)", letterSpacing: 1,
                textTransform: "uppercase", fontWeight: 700,
              }}
            >
              <IconTrash size={11} /> Delete
            </button>
          </div>
        </div>
      )}

      {/* Slider */}
      <div style={{ padding: editing ? 0 : "0 10px 10px" }}>
        <input
          type="range" min={0} max={100} step={0.1} value={localPct}
          disabled={party.isLocked}
          onChange={handleSliderChange}
          style={{
            width: "100%", height: 5, borderRadius: 3, outline: "none",
            cursor: party.isLocked ? "not-allowed" : "pointer",
            opacity: party.isLocked ? 0.4 : 1,
            background: `linear-gradient(to right, ${party.color} 0%, ${party.color} ${pctFill}%, var(--border) ${pctFill}%)`,
          }}
        />
      </div>
    </div>
  );
});

// ─── SemiCircleChart ──────────────────────────────────────────────────────────
export function SemiCircleChart({ data, totalSeats, majorityReq }) {
  const [hovered, setHovered] = useState(null);
  const activeParties = data.filter((c) => c.seats > 0);

  const segments = activeParties.reduce((acc, c) => {
    const startPct = acc.length ? acc[acc.length - 1].endTotal : 0;
    const rawShare = (c.seats / totalSeats) * 100;
    acc.push({ c, rawShare, startPct, endTotal: startPct + rawShare });
    return acc;
  }, []);

  const paths = segments.map(({ c, rawShare, startPct }) => {
    const visualShare = Math.min(rawShare, 99.99);
    const endPct = startPct + visualShare;

    const toRad  = (pct) => Math.PI + (pct / 100) * Math.PI;
    const sRad   = toRad(startPct);
    const eRad   = toRad(endPct);
    const outerR = 82;
    const innerR = 52;

    const x1 = 100 + outerR * Math.cos(sRad), y1 = 100 + outerR * Math.sin(sRad);
    const x2 = 100 + outerR * Math.cos(eRad), y2 = 100 + outerR * Math.sin(eRad);
    const x3 = 100 + innerR * Math.cos(eRad), y3 = 100 + innerR * Math.sin(eRad);
    const x4 = 100 + innerR * Math.cos(sRad), y4 = 100 + innerR * Math.sin(sRad);

    const d = `M ${x1} ${y1} A ${outerR} ${outerR} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 0 0 ${x4} ${y4} Z`;

    const midRad = (sRad + eRad) / 2;
    const textR  = (outerR + innerR) / 2;
    const textX  = 100 + textR * Math.cos(midRad);
    const textY  = 100 + textR * Math.sin(midRad);

    const isHov = hovered === c.id;

    return (
      <g key={c.id}
         onMouseEnter={() => setHovered(c.id)}
         onMouseLeave={() => setHovered(null)}
      >
        <path
          className="semi-arc"
          d={d}
          fill={c.color}
          stroke="var(--bg-mid)"
          strokeWidth={isHov ? "3" : "1.5"}
          style={{
            opacity:  isHov ? 1 : 0.88,
            filter:   isHov ? `drop-shadow(0 0 6px ${c.color}88)` : "none",
            transform: isHov ? `scale(1.015)` : "scale(1)",
            transformOrigin: "100px 100px",
            transition: "all 0.2s",
          }}
        />
        {rawShare > 9 && (
          <text
            x={textX} y={textY + 3}
            fill="#ffffff" fontSize="7.5" fontWeight="800"
            fontFamily="var(--ff-mono)" textAnchor="middle"
            style={{ pointerEvents: "none", textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}
          >
            {c.seats}
          </text>
        )}
      </g>
    );
  });

  // Majority line
  const majRad = Math.PI + (majorityReq / totalSeats) * Math.PI;
  const mxOut  = 100 + 87  * Math.cos(majRad);
  const myOut  = 100 + 87  * Math.sin(majRad);
  const mxIn   = 100 + 47  * Math.cos(majRad);
  const myIn   = 100 + 47  * Math.sin(majRad);

  const hovParty = hovered ? activeParties.find((c) => c.id === hovered) : null;

  return (
    <div style={{ width: "100%", margin: "0 auto", position: "relative" }}>
      <div style={{ maxWidth: 300, margin: "0 auto", position: "relative" }}>
        <svg viewBox="0 0 200 114" style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}>
          {/* Background arc */}
          <path
            d="M 18 100 A 82 82 0 0 1 182 100"
            fill="none" stroke="var(--border)" strokeWidth="30"
            strokeLinecap="butt" opacity="0.5"
          />

          {paths}

          {/* Majority line */}
          <line x1={mxIn} y1={myIn} x2={mxOut} y2={myOut}
                stroke="var(--text-muted)" strokeWidth="1.2" strokeDasharray="3,2" />
          <circle cx={mxOut} cy={myOut} r="2.5"
                  fill="var(--bg-base)" stroke="var(--text-muted)" strokeWidth="1" />
          <text x={mxOut + 3.5} y={myOut - 5.5}
                fill="var(--text-main)" fontSize="7" fontWeight="800" fontFamily="var(--ff-mono)">
            {majorityReq}
          </text>
          <text x={mxOut + 3.5} y={myOut + 3.5}
                fill="var(--text-dim)" fontSize="4.5" fontFamily="var(--ff-body)" letterSpacing="0.5">
            MAJORITY
          </text>

          {/* Axis labels */}
          {[["Left", 22, "start"], ["Centre", 100, "middle"], ["Right", 178, "end"]].map(([lbl, x, anchor]) => (
            <text key={lbl} x={x} y={112} fontSize="5.5" fill="var(--text-dim)"
                  fontFamily="var(--ff-body)" letterSpacing="0.8" textAnchor={anchor}>
              {lbl}
            </text>
          ))}
        </svg>

        {/* Centre label — total seats or hovered */}
        <div style={{
          position: "absolute", bottom: 8, left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          transition: "all 0.18s",
        }}>
          {hovParty ? (
            <>
              <div style={{ fontSize: 20, fontWeight: 900, fontFamily: "var(--ff-head)", color: hovParty.color, lineHeight: 1 }}>
                {hovParty.seats}
              </div>
              <div style={{ fontSize: 8, color: "var(--text-dim)", fontFamily: "var(--ff-body)", letterSpacing: 1, textTransform: "uppercase", marginTop: 1 }}>
                {hovParty.name}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 22, fontWeight: 900, fontFamily: "var(--ff-head)", color: "var(--text-title)", lineHeight: 1 }}>
              {totalSeats}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: "5px 14px",
        justifyContent: "center", marginTop: 14,
      }}>
        {activeParties.map((c) => (
          <div
            key={c.id}
            onMouseEnter={() => setHovered(c.id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              cursor: "default",
              opacity: hovered && hovered !== c.id ? 0.45 : 1,
              transition: "opacity 0.18s",
            }}
          >
            <div style={{
              width: 9, height: 9, borderRadius: "50%", background: c.color,
              boxShadow: `0 0 6px ${c.color}66`,
            }} />
            <span style={{ fontSize: 11, fontFamily: "var(--ff-body)", color: "var(--text-main)", fontWeight: 500 }}>
              {c.name}
            </span>
            <span style={{ fontSize: 12, fontFamily: "var(--ff-mono)", fontWeight: 700, color: c.color }}>
              {c.seats}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
