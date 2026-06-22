
export default function GreeceScatter({ points, ols, xLabel, yLabel, height = 200, zeroLine = false }) {
  if (!points || points.length === 0) return null;

  const padLeft = 40, padRight = 20, padTop = 20, padBottom = 30;
  const width = 400; // SVG viewBox width

  const xVals = points.map(p => p.x);
  const yVals = points.map(p => p.y);
  
  // Pad the domains by 5% so dots don't hit the edges
  const xMin = Math.min(...xVals), xMax = Math.max(...xVals);
  const yMin = Math.min(...yVals), yMax = Math.max(...yVals);
  const xRange = xMax - xMin || 1;
  const yRange = yMax - yMin || 1;
  
  const xDomain = [xMin - xRange * 0.05, xMax + xRange * 0.05];
  const yDomain = [yMin - yRange * 0.05, yMax + yRange * 0.05];

  const sx = (val) => padLeft + ((val - xDomain[0]) / (xDomain[1] - xDomain[0])) * (width - padLeft - padRight);
  const sy = (val) => height - padBottom - ((val - yDomain[0]) / (yDomain[1] - yDomain[0])) * (height - padTop - padBottom);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "100%", display: "block" }}>
        
        {/* Axes */}
        <line x1={padLeft} x2={padLeft} y1={padTop} y2={height - padBottom} stroke="var(--border)" />
        <line x1={padLeft} x2={width - padRight} y1={height - padBottom} y2={height - padBottom} stroke="var(--border)" />
        
        {/* Zero Line Guardrail */}
        {zeroLine && 0 >= yDomain[0] && 0 <= yDomain[1] && (
          <line x1={padLeft} x2={width - padRight} y1={sy(0)} y2={sy(0)} stroke="var(--text-dim)" strokeDasharray="4 4" opacity="0.5" />
        )}

        {/* OLS Trendline */}
        {ols && (
          <line 
            x1={sx(xDomain[0])} y1={sy(ols.slope * xDomain[0] + ols.intercept)}
            x2={sx(xDomain[1])} y2={sy(ols.slope * xDomain[1] + ols.intercept)}
            stroke="#3B82F6" strokeWidth="2" opacity="0.6" strokeDasharray="4 4"
          />
        )}

        {/* Data Points with Permanent, PDF-Friendly Static Labels */}
        {points.map((p, i) => (
          <g key={i}>
            <circle 
              cx={sx(p.x)} 
              cy={sy(p.y)} 
              r={4} 
              fill="#8B5CF6" 
              opacity={0.6}
            />
            <text 
              x={sx(p.x) + 6} 
              y={sy(p.y) + 3} 
              fontSize="8" 
              fontFamily="var(--ff-body), sans-serif" 
              fill="var(--text-dim)"
              opacity={0.8}
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
