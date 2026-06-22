// ─── aus-map.jsx ──────────────────────────────────────────────────────────────
import {
  useRef, useEffect, useState, useCallback, memo,
} from "react";
import { S, EASE_STD, IconPlus, IconMinus, IconZoomReset } from "./aus-ui.jsx";
import { ausPartyColor, ausFmt2PP, ausPartyLabel } from "./aus-engine.js";

const ZOOM_MIN = 0.4;
const ZOOM_MAX = 10;
function clampZoom(z) { return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z)); }

// ── Main Map Component ────────────────────────────────────────────────────────
export const AusMap = memo(function AusMap({ projected, svgContent, onDivisionSelect, onDivisionClick }) {
  const wrapRef  = useRef(null);
  const mountRef = useRef(null);
  const svgRef   = useRef(null);

  const [zoom,       setZoom]       = useState(1);
  const [pan,        setPan]        = useState({ x: 0, y: 0 });
  const [hovered,    setHovered]    = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [ready,      setReady]      = useState(false);

  const panRef  = useRef(pan);
  const zoomRef = useRef(zoom);
  panRef.current  = pan;
  zoomRef.current = zoom;

  // Keep stable refs to callbacks so event listeners don't stale-close
  const onDivisionSelectRef = useRef(onDivisionSelect);
  const onDivisionClickRef  = useRef(onDivisionClick);
  useEffect(() => { onDivisionSelectRef.current = onDivisionSelect; }, [onDivisionSelect]);
  useEffect(() => { onDivisionClickRef.current  = onDivisionClick;  }, [onDivisionClick]);

  const projectedRef = useRef(projected);
  useEffect(() => { projectedRef.current = projected; }, [projected]);

  const applyColors = useCallback(() => {
    const svg = svgRef.current;
    if (!svg || !projectedRef.current?.length) return;
    const byId = {};
    projectedRef.current.forEach(d => {
      byId[d.id] = d;
      if (d.name) byId[d.name.toLowerCase().replace(/\s+/g, '-')] = d;
    });
    svg.querySelectorAll("[data-division-id]").forEach(el => {
      const id  = el.getAttribute("data-division-id");
      const div = byId[id];
      if (!div) return;
      const targetColor = ausPartyColor(div.winner);
      let vectors = [el];
      if (el.tagName.toLowerCase() === "g") {
        const children = Array.from(el.querySelectorAll("path, polygon, rect, circle"));
        if (children.length > 0) vectors = children;
      }
      vectors.forEach(v => {
        v.style.fill        = targetColor;
        v.style.fillOpacity = "0.85";
        v.style.stroke      = "var(--map-stroke)";
        v.style.strokeWidth = "0.4";
        v.style.cursor      = "pointer";
        v.style.transition  = `fill 0.18s ${EASE_STD}`;
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // stable — reads projectedRef which is always current

  useEffect(() => {
    const sandboxNode = mountRef.current;
    if (!sandboxNode || !svgContent) return;
    sandboxNode.innerHTML = svgContent;
    const svg = sandboxNode.querySelector("svg");
    if (!svg) return;
    svg.style.width    = "100%";
    svg.style.height   = "100%";
    svg.style.position = "absolute";
    svg.style.top = svg.style.left = "0";
    svgRef.current = svg;
    setReady(true);
    return () => { sandboxNode.innerHTML = ""; };
  }, [svgContent]);

  useEffect(() => { if (ready) applyColors(); }, [ready, applyColors]);
  // Re-colour map whenever projections update (slider changes)
  useEffect(() => { if (ready) applyColors(); }, [projected]); // eslint-disable-line

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const g = svg.querySelector("g[data-panzoom]") ?? svg.firstElementChild;
    if (!g) return;
    g.style.transform = `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`;
    g.style.transformOrigin = "0 0";
    g.style.transition = "none";
  }, [pan, zoom]);

  // ── Interaction handlers ────────────────────────────────────────────────────
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !ready) return;

    const getById = () => {
      const byId = {};
      projectedRef.current?.forEach(d => {
        byId[d.id] = d;
        if (d.name) byId[d.name.toLowerCase().replace(/\s+/g, '-')] = d;
      });
      return byId;
    };

    const highlight = (el, on) => {
      let vectors = [el];
      if (el.tagName.toLowerCase() === "g") {
        const ch = Array.from(el.querySelectorAll("path, polygon, rect, circle"));
        if (ch.length > 0) vectors = ch;
      }
      vectors.forEach(v => {
        v.style.fillOpacity = on ? "1"   : "0.85";
        v.style.stroke      = on ? "var(--map-stroke-hov)" : "var(--map-stroke)";
        v.style.strokeWidth = on ? "1.2" : "0.4";
      });
    };

    const onOver = e => {
      const el = e.target.closest("[data-division-id]");
      if (!el) { setHovered(null); return; }
      const id = el.getAttribute("data-division-id");
      const div = getById()[id];
      if (div) {
        highlight(el, true);
        setHovered(div);
        setTooltipPos({ x: e.clientX, y: e.clientY });
        if (onDivisionSelectRef.current) onDivisionSelectRef.current(div);
      }
    };
    const onMove = e => {
      setTooltipPos({ x: e.clientX, y: e.clientY });
    };
    const onOut = e => {
      const el = e.target.closest("[data-division-id]");
      if (el) highlight(el, false);
      setHovered(null);
    };
    const onClick = e => {
      const el = e.target.closest("[data-division-id]");
      if (!el) return;
      const id = el.getAttribute("data-division-id");
      const div = getById()[id];
      if (div && onDivisionClickRef.current) {
        onDivisionClickRef.current(div);
      }
    };

    svg.addEventListener("mouseover",  onOver);
    svg.addEventListener("mousemove",  onMove);
    svg.addEventListener("mouseout",   onOut);
    svg.addEventListener("click",      onClick);
    return () => {
      svg.removeEventListener("mouseover",  onOver);
      svg.removeEventListener("mousemove",  onMove);
      svg.removeEventListener("mouseout",   onOut);
      svg.removeEventListener("click",      onClick);
    };
  }, [ready]); // only re-register when SVG mounts — uses projectedRef for fresh data

  // ── Wheel zoom ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const onWheel = e => {
      e.preventDefault();
      const delta = -e.deltaY * 0.0018;
      const rect  = wrap.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const svgX = (mouseX - panRef.current.x) / zoomRef.current;
      const svgY = (mouseY - panRef.current.y) / zoomRef.current;
      const nextZoom = clampZoom(zoomRef.current * (1 + delta));
      setPan({ x: mouseX - svgX * nextZoom, y: mouseY - svgY * nextZoom });
      setZoom(nextZoom);
    };
    wrap.addEventListener("wheel", onWheel, { passive: false });
    return () => wrap.removeEventListener("wheel", onWheel);
  }, []);

  // ── Drag pan ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    let dragging = false, startX = 0, startY = 0, startPan = { x: 0, y: 0 };
    let hasDragged = false; // true once mouse moved > 4px — suppresses the click

    const onDown = e => {
      if (e.button !== 0) return;
      e.preventDefault();
      dragging   = true;
      hasDragged = false;
      startX = e.clientX; startY = e.clientY;
      startPan = { ...panRef.current };
      wrap.style.cursor = "grabbing";
      document.body.style.userSelect = "none";
    };
    const onMove = e => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (!hasDragged && Math.sqrt(dx * dx + dy * dy) > 4) hasDragged = true;
      setPan({ x: startPan.x + dx * 1.6, y: startPan.y + dy * 1.6 });
    };
    const onUp = () => {
      dragging = false;
      wrap.style.cursor = "grab";
      document.body.style.userSelect = "";
    };
    // Intercept the click event at capture phase — cancel it if we dragged
    const onClickCapture = e => {
      if (hasDragged) {
        e.stopPropagation();
        hasDragged = false;
      }
    };

    wrap.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
    wrap.addEventListener("click", onClickCapture, true); // capture phase
    return () => {
      wrap.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
      wrap.removeEventListener("click", onClickCapture, true);
    };
  }, []);

  const handleZoomBtn = useCallback(delta => { setZoom(z => clampZoom(z * (1 + delta))); }, []);
  const handleReset   = useCallback(() => { setZoom(1); setPan({ x: 0, y: 0 }); }, []);

  return (
    <div ref={wrapRef} style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: "var(--map-bg)", borderRadius: 8, cursor: "grab", userSelect: "none", WebkitUserSelect: "none" }}>
      <div ref={mountRef} style={{ width: "100%", height: "100%", position: "absolute", inset: 0, pointerEvents: "auto", zIndex: 1 }} />

      {/* Zoom controls */}
      <div style={{ position: "absolute", bottom: 12, right: 12, display: "flex", flexDirection: "column", gap: 4, zIndex: 20 }}>
        {[
          { icon: <IconPlus size={11}/>,       cb: () => handleZoomBtn(0.3),  title: "Zoom in"    },
          { icon: <IconMinus size={11}/>,      cb: () => handleZoomBtn(-0.3), title: "Zoom out"   },
          { icon: <IconZoomReset size={11}/>,  cb: handleReset,               title: "Reset view" },
        ].map(({ icon, cb, title }, i) => (
          <button key={i} className="icon-btn" onClick={cb} title={title}
            style={{ ...S.ghostBtn, width: 28, height: 28, padding: 0, justifyContent: "center", alignItems: "center", background: "var(--bg-card)", boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }}>
            {icon}
          </button>
        ))}
      </div>

      {/* Click hint */}
      <div style={{ position: "absolute", bottom: 12, left: 12, zIndex: 20, fontSize: 8, color: "var(--text-dim)", fontFamily: "var(--ff-mono)", letterSpacing: 1, pointerEvents: "none" }}>
        CLICK DIVISION FOR DEMOGRAPHICS
      </div>

      {/* Hover tooltip */}
      {hovered && (
        <div style={{ ...S.tooltip, position: "fixed", left: tooltipPos.x + 14, top: tooltipPos.y - 60, zIndex: 99999, pointerEvents: "none" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-title)", marginBottom: 3 }}>
            {hovered.name} <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 400, color: "var(--text-muted)" }}>{hovered.state}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: ausPartyColor(hovered.winner) }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: ausPartyColor(hovered.winner) }}>{ausPartyLabel(hovered.winner).toUpperCase()} Lead</span>
          </div>
          <div style={{ fontSize: 10.5, color: "var(--text-dim)", fontFamily: "var(--ff-mono)" }}>
            {hovered.finalTwo
              ? `${ausPartyLabel(hovered.finalTwo[0])} ${hovered.proj2PP?.toFixed(1)}% — ${ausPartyLabel(hovered.finalTwo[1])} ${(100 - hovered.proj2PP).toFixed(1)}%`
              : `Projected 2PP: ${ausFmt2PP(hovered.proj2PP)}`
            }
          </div>
          <div style={{ fontSize: 8.5, color: "var(--text-dim)", marginTop: 4, fontFamily: "var(--ff-mono)", letterSpacing: 0.5 }}>
            Click for demographics →
          </div>
        </div>
      )}
    </div>
  );
});

export default AusMap;
