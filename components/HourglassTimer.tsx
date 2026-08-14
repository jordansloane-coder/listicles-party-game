'use client';

interface Props {
  remaining: number;
  seconds: number;
  glassColor?: string;
  className?: string;
  style?: React.CSSProperties;
}

// A simple animated hourglass: sand drains from the top bulb into the
// bottom bulb in step with the countdown, as a nod to the physical game's
// sand timer. Geometry: two triangular "glass" bulbs meeting at a neck;
// the sand fill is a smaller similar-triangle (top) / trapezoid (bottom)
// computed from the fraction of time remaining.
export default function HourglassTimer({ remaining, seconds, glassColor = 'currentColor', className = '', style }: Props) {
  const f = seconds > 0 ? Math.max(0, Math.min(1, remaining / seconds)) : 0; // fraction remaining
  const e = 1 - f; // fraction elapsed

  // Top bulb: base y=10 (x 15..85), apex (50,75)
  const topSurfaceY = 75 - f * 65;
  const topLeftX = 15 + (50 - 15) * ((topSurfaceY - 10) / 65);
  const topRightX = 85 + (50 - 85) * ((topSurfaceY - 10) / 65);

  // Bottom bulb: apex (50,85), base y=150 (x 15..85)
  const bottomCutY = 150 - e * 65;
  const bottomLeftX = 50 + (15 - 50) * ((bottomCutY - 85) / 65);
  const bottomRightX = 50 + (85 - 50) * ((bottomCutY - 85) / 65);

  return (
    <svg viewBox="0 0 100 160" className={className} style={style} aria-hidden="true">
      {/* glass frame */}
      <path
        d="M12,8 H88 V16 H12 Z M12,152 H88 V144 H12 Z M17,10 L50,75 L83,10 M17,150 L50,85 L83,150"
        fill="none"
        stroke={glassColor}
        strokeWidth="3"
        strokeLinejoin="round"
        opacity="0.5"
      />

      {/* draining sand (top) */}
      {f > 0.01 && (
        <polygon
          points={`${topLeftX},${topSurfaceY} ${topRightX},${topSurfaceY} 50,75`}
          fill="var(--sun)"
        />
      )}

      {/* accumulated sand (bottom) */}
      {e > 0.01 && (
        <polygon
          points={`${bottomLeftX},${bottomCutY} ${bottomRightX},${bottomCutY} 85,150 15,150`}
          fill="var(--sun)"
        />
      )}

      {/* falling stream */}
      {f > 0.01 && e > 0.01 && <rect x="49" y="77" width="2" height="6" fill="var(--sun)" opacity="0.9" />}
    </svg>
  );
}
