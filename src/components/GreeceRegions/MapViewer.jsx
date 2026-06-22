import { useState, useEffect, useRef } from "react";
import { S } from "./styles.jsx";
import { IconZoomIn, IconZoomOut, IconZoomReset } from "./icons.jsx";

const MapViewer = ({ config, municipalData, turnoutDelta, resetKey }) => {
  const wrapperRef = useRef(null);
  const containerRef = useRef(null);
  
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDraggingCursor, setIsDraggingCursor] = useState(false);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, muniName: null });
  const [isExpanded, setIsExpanded] = useState(false);

  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const scaleRef = useRef(1);
  
  // Ref to hold the latest municipalData to prevent stale closures in async callbacks
  const municipalDataRef = useRef(municipalData);

  useEffect(() => { scaleRef.current = scale; }, [scale]);

  // Keep the ref continuously synced with the latest prop
  useEffect(() => { 
    municipalDataRef.current = municipalData; 
  }, [municipalData]);

  useEffect(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, [resetKey]);

  const updateColors = () => {
    if (!containerRef.current) return;
    const shapes = containerRef.current.querySelectorAll("path, polygon");

    // Read from the ref to guarantee fresh data
    const currentData = municipalDataRef.current;

    shapes.forEach((shape) => {
      if (!shape || typeof shape.style === "undefined") return;
      const name = config.svgMap[shape.getAttribute("id")];
      if (name && currentData[name] && currentData[name].length > 0) {
        const winner = currentData[name][0];
        shape.style.fill = winner.color;
        shape.style.fillOpacity = 0.5 + winner.localPercent / 120;
      } else if (!shape.classList.contains("lake")) {
        shape.style.fill = "var(--bg-up)";
      }
    });
  };

  useEffect(() => {
    setTooltip({ show: false, x: 0, y: 0, muniName: null });

    const loadSVG = async () => {
      if (!containerRef.current) return;
      containerRef.current.innerHTML = '<span style="color:var(--text-dim);font-size:10px;font-family:var(--ff-mono)">Loading map...</span>';

      let svgText = "";
      if (config.mapType === "inline") svgText = config.svgContent;
      else {
        try {
          const res = await fetch(config.mapUrl);
          if (!res.ok) throw new Error("Network response was not ok");
          svgText = await res.text();
        } catch (e) {
          containerRef.current.innerHTML = `<div style="color:#EF4444;font-size:10px;">Map load failed</div>`;
          return;
        }
      }

      const parser = new DOMParser();
      const doc = parser.parseFromString(svgText, "image/svg+xml");
      const svg = doc.querySelector("svg");

      if (svg) {
        if (!svg.getAttribute("viewBox") && svg.getAttribute("width")) {
          svg.setAttribute("viewBox", `0 0 ${parseFloat(svg.getAttribute("width"))} ${parseFloat(svg.getAttribute("height"))}`);
        }
        svg.removeAttribute("width");
        svg.removeAttribute("height");
        containerRef.current.innerHTML = "";
        containerRef.current.appendChild(svg);

        const shapes = containerRef.current.querySelectorAll("path, polygon");
        shapes.forEach((shape) => {
          const name = config.svgMap[shape.getAttribute("id")];
          if (name) {
            shape.addEventListener("mouseenter", () => {
              if (!isDragging.current) setTooltip((t) => ({ ...t, show: true, muniName: name }));
            });
            shape.addEventListener("mousemove", (e) => {
              if (!isDragging.current) setTooltip((t) => ({ ...t, x: e.clientX + 20, y: e.clientY + 20 }));
            });
            shape.addEventListener("mouseleave", () => {
              setTooltip((t) => ({ ...t, show: false }));
            });
          }
        });
        updateColors();
      }
    };
    loadSVG();
  }, [config]);

  useEffect(() => {
    updateColors();
  }, [municipalData]);

  // PAN CLAMPING UTILITY - Prevents map from flying off-screen
  const constrainPan = (x, y, currentScale) => {
    const maxX = 300 * currentScale; 
    const maxY = 300 * currentScale; 
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y))
    };
  };

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    
    const handleWheel = (e) => {
      e.preventDefault();
      const rect = wrapper.getBoundingClientRect(); 
      const mouseX = e.clientX - rect.left - rect.width / 2;
      const mouseY = e.clientY - rect.top - rect.height / 2;
      const zoomFactor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      
      const currentScale = scaleRef.current;
      const newScale = Math.min(8, Math.max(0.5, currentScale * zoomFactor));
      const scaleChange = newScale / currentScale;
      
      setTranslate(prev => {
        const newX = mouseX - scaleChange * (mouseX - prev.x);
        const newY = mouseY - scaleChange * (mouseY - prev.y);
        return constrainPan(newX, newY, newScale);
      });
      setScale(newScale);
    };

    wrapper.addEventListener("wheel", handleWheel, { passive: false });
    return () => wrapper.removeEventListener("wheel", handleWheel);
  }, []);

  const handlePointerDown = (e) => {
    if (e.target.closest('button')) return; 
    
    isDragging.current = true;
    setIsDraggingCursor(true);
    setTooltip(t => ({ ...t, show: false })); 
    dragStart.current = {
      x: e.clientX - translate.x,
      y: e.clientY - translate.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;
    setTranslate(constrainPan(newX, newY, scale));
  };

  const handlePointerUp = (e) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    setIsDraggingCursor(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  };

  const ttData = tooltip.muniName ? municipalData[tooltip.muniName] : null;
  let ttDetails = tooltip.muniName ? config.details[tooltip.muniName] : null;

  // Fallback generation for Virtual Districts lacking hardcoded details config
  if (tooltip.muniName && !ttDetails && ttData && config.virtualDistricts) {
    const virtualDistrict = config.virtualDistricts.find((vd) => vd.id === tooltip.muniName);
    if (virtualDistrict) {
      let aggregatedPop = 0;
      let weightedTurnoutSum = 0;

      virtualDistrict.sources.forEach((src) => {
        const srcDetails = config.details[src];
        if (srcDetails) {
          aggregatedPop += srcDetails.pop || 0;
          weightedTurnoutSum += (srcDetails.pop || 0) * (srcDetails.baseTurnout || 0);
        }
      });

      if (aggregatedPop > 0) {
        ttDetails = {
          pop: aggregatedPop,
          baseTurnout: weightedTurnoutSum / aggregatedPop,
        };
      }
    }
  }

  let finalX = tooltip.x;
  let finalY = tooltip.y;
  if (typeof window !== "undefined") {
    if (finalX + 210 > window.innerWidth) finalX = tooltip.x - 210;
    if (finalY + 120 > window.innerHeight) finalY = tooltip.y - 120;
  }

  const outerStyle = isExpanded ? {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    background: "var(--bg-base)",
    display: "flex",
    flexDirection: "column",
    padding: "24px",
    boxSizing: "border-box",
    backdropFilter: "blur(4px)"
  } : { 
    ...S.card, 
    padding: 8 
  };

  return (
    <div style={outerStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 8px 12px" }}>
        <div style={{ ...S.label, fontSize: isExpanded ? 14 : 10 }}>Regional Map {isExpanded ? " - Fullscreen" : ""}</div>
        <div style={{ display: "flex", gap: 4 }}>
          <button style={{ ...S.ghostBtn, padding: "4px" }} onClick={() => setScale((s) => Math.min(8, s + 0.2))}><IconZoomIn size={isExpanded ? 18 : 14} /></button>
          <button style={{ ...S.ghostBtn, padding: "4px" }} onClick={() => setScale((s) => Math.max(0.5, s - 0.2))}><IconZoomOut size={isExpanded ? 18 : 14} /></button>
          <button style={{ ...S.ghostBtn, padding: "4px" }} onClick={() => { setScale(1); setTranslate({ x: 0, y: 0 }); }}><IconZoomReset size={isExpanded ? 18 : 14} /></button>
        </div>
      </div>

      <div 
        ref={wrapperRef}
        style={{ 
          position: "relative", 
          width: "100%", 
          height: isExpanded ? "100%" : 550, 
          background: "var(--map-bg)", 
          borderRadius: 8, 
          border: "1px solid var(--border)", 
          overflow: "hidden", 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center",
          cursor: isDraggingCursor ? "grabbing" : "grab",
          flexGrow: isExpanded ? 1 : 0,
          boxShadow: isExpanded ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)" : "none"
        }}
      >
        <div 
          ref={containerRef} 
          className="map-svg-container" 
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{ 
            width: "100%", 
            height: "100%", 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`, 
            transformOrigin: "center center",
            touchAction: "none"
          }} 
        />
        
        <button 
          onClick={toggleExpand}
          title={isExpanded ? "Collapse Map" : "Expand Map"}
          style={{
            position: "absolute",
            bottom: 16,
            right: 16,
            ...S.ghostBtn,
            background: "var(--bg-mid)",
            padding: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            zIndex: 100,
            borderRadius: "8px"
          }}
        >
          {isExpanded ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
          )}
        </button>
      </div>

      {tooltip.show && ttData && ttDetails && (
        <div style={{ ...S.tooltip, left: finalX, top: finalY }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8, borderBottom: "1px solid var(--tooltip-border)", paddingBottom: 6 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-title)", fontFamily: "var(--ff-head)", textTransform: "uppercase", letterSpacing: 1 }}>{tooltip.muniName}</div>
            <div style={{ textAlign: "right", fontSize: 9, color: "var(--text-dim)", fontFamily: "var(--ff-mono)" }}>
              <div style={{ color: "var(--text-main)", fontWeight: "bold" }}>~{Math.round((ttDetails.pop * (Math.min(100, Math.max(0, ttDetails.baseTurnout + turnoutDelta)) / 100)) / 1000).toFixed(1)}k votes</div>
              <div>{Math.min(100, Math.max(0, ttDetails.baseTurnout + turnoutDelta)).toFixed(1)}% Turnout</div>
            </div>
          </div>
          <div style={{ display: "flex", height: 6, width: "100%", borderRadius: 3, overflow: "hidden", marginBottom: 8, background: "var(--bg-mid)" }}>
            {ttData.map((c) => <div key={c.id} style={{ width: `${c.localPercent}%`, backgroundColor: c.color }} />)}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {ttData.slice(0, 3).map((c) => (
              <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, fontFamily: "var(--ff-mono)", fontWeight: 600 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: c.color }} />
                  <span style={{ color: "var(--text-main)" }}>{c.name}</span>
                </div>
                <span style={{ color: "var(--text-title)" }}>{c.localPercent.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapViewer;
