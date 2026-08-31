import { useId } from "react";

/**
 * View-direction radar drawn on the mini floor plan (PanoViewer's minimap).
 *
 * A hub at the centre of the plan with a cone fanning out of it: where the
 * visitor is standing, and which way they're looking on that paper. Angles are
 * PLAN angles — degrees clockwise from straight up the sheet — so the caller
 * turns the pano's real-world bearing into plan space once (the plan's compass
 * `rotation`, i.e. where north sits on that sheet, plus the `facing` correction
 * from floorPlanRadarData) and everything here lines up with the drawing.
 *
 * Props (degrees, clockwise from up):
 *   • heading      — where the view faces. Drives the cone.
 *   • fov          — the pano's live horizontal field of view; the cone's width,
 *     so zooming in narrows it exactly as the 360° narrows.
 *   • north        — where true north points on this plan; draws the N tick.
 *   • arcDeg       — how wide a swing the pano allows (pano.panRad). 360 draws a
 *     full ring, 0 hides the band.
 *   • arcCenterDeg — the middle of that swing.
 *   • frame        — the plan's own viewBox, `{ x, y, w, h }`. The dial is drawn
 *     in a fixed square canvas and then mapped onto that frame, so it lands on
 *     the plan's centre and scales with the sheet rather than with the widget
 *     box (plan sheets are 16:9, the minimap box isn't — without this the rim
 *     would hang off the top and bottom of the paper). Omit it and the canvas
 *     just fits the box, which is the same centre for an object-contain image.
 *
 * Nothing is animated: the cone re-renders straight from the live yaw, so it
 * tracks a drag frame-for-frame and a floor / room switch repaints it already
 * pointing the right way (same contract as MiniCompass at transitionMs 0).
 */

const C = 120; // centre of the 240×240 canvas the dial is drawn in
const RIM = 94; // guide ring / swing band radius
const CONE = 88; // how far the view cone reaches
const LABEL = 118; // N letter, just inside the canvas edge

// How much of the plan's short side the canvas spans — a little shy of the
// full sheet so the N never sits on the paper's edge.
const FIT = 0.9;

// The gold the viewer accents everything with.
const GOLD = "#e8c879";

// Strokes are given in screen pixels (non-scaling), so the dial reads the same
// whether the minimap is compact or hover-expanded.
const CRISP = { vectorEffect: "non-scaling-stroke" };

// A point `deg` clockwise from straight up, `r` out from the hub (SVG y grows
// down, hence the flipped cosine).
const polar = (deg, r) => [
  C + r * Math.sin((deg * Math.PI) / 180),
  C - r * Math.cos((deg * Math.PI) / 180),
];

/** Filled wedge from the hub, spanning `from`→`to` clockwise. */
const sectorPath = (from, to, r) => {
  const [x1, y1] = polar(from, r);
  const [x2, y2] = polar(to, r);
  const large = Math.abs(to - from) > 180 ? 1 : 0;
  return `M ${C} ${C} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
};

/** Just the rim stroke of that span — no hub, no fill. */
const arcPath = (from, to, r) => {
  const [x1, y1] = polar(from, r);
  const [x2, y2] = polar(to, r);
  const large = Math.abs(to - from) > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
};

const FloorPlanRadar = ({
  heading = 0,
  fov = 60,
  north = 0,
  arcDeg = 0,
  arcCenterDeg = 0,
  frame = null,
  center = null,
  className = "",
}) => {
  // Unique per-instance gradient ids, so two radars never share a paint.
  const uid = useId().replace(/:/g, "");
  const fillId = `radar-fill-${uid}`;
  const edgeId = `radar-edge-${uid}`;

  // Canvas → plan mapping. No frame means "just use the canvas", and the same
  // FIT shrink then applies against the widget box.
  const box = frame ?? { x: 0, y: 0, w: 2 * C, h: 2 * C };
  const scale = (Math.min(box.w, box.h) * FIT) / (2 * C);
  const targetX = center?.x ?? (box.x + box.w / 2);
  const targetY = center?.y ?? (box.y + box.h / 2);
  const originX = targetX - C * scale;
  const originY = targetY - C * scale;

  const half = Math.min(179, Math.max(6, fov / 2));
  const [tickX, tickY] = polar(north, RIM + 6);
  const [tickEndX, tickEndY] = polar(north, RIM + 14);
  const [labelX, labelY] = polar(north, LABEL);

  return (
    <svg
      viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
    >
      <defs>
        {/* both gradients radiate from the hub, not the wedge's bounding box */}
        <radialGradient
          id={fillId}
          gradientUnits="userSpaceOnUse"
          cx={C}
          cy={C}
          r={CONE}
        >
          <stop offset="0%" stopColor={GOLD} stopOpacity="0.55" />
          <stop offset="55%" stopColor={GOLD} stopOpacity="0.26" />
          <stop offset="100%" stopColor={GOLD} stopOpacity="0.04" />
        </radialGradient>
        <radialGradient
          id={edgeId}
          gradientUnits="userSpaceOnUse"
          cx={C}
          cy={C}
          r={CONE}
        >
          <stop offset="0%" stopColor={GOLD} stopOpacity="0.95" />
          <stop offset="100%" stopColor={GOLD} stopOpacity="0.45" />
        </radialGradient>
      </defs>

      <g
        transform={`translate(${originX} ${originY}) scale(${scale})`}
        style={{ transition: "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        {/* faint compass ring the cone sweeps inside */}
        <circle
          cx={C}
          cy={C}
          r={RIM}
          fill="none"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth="1"
          strokeDasharray="3 7"
          {...CRISP}
        />

        {/* the swing this pano allows — a full ring on a 360° capture */}
        {arcDeg >= 359.5 ? (
          <circle
            cx={C}
            cy={C}
            r={RIM}
            fill="none"
            stroke="rgba(232,200,121,0.35)"
            strokeWidth="1.5"
            {...CRISP}
          />
        ) : (
          arcDeg > 0 && (
            <path
              d={arcPath(
                arcCenterDeg - arcDeg / 2,
                arcCenterDeg + arcDeg / 2,
                RIM,
              )}
              fill="none"
              stroke="rgba(232,200,121,0.35)"
              strokeWidth="1.5"
              strokeLinecap="round"
              {...CRISP}
            />
          )
        )}

        {/* north tick — the plan's own bearing, so the cone reads against it */}
        <line
          x1={tickX}
          y1={tickY}
          x2={tickEndX}
          y2={tickEndY}
          stroke={GOLD}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.6"
          {...CRISP}
        />
        <text
          x={labelX}
          y={labelY}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="20"
          fill={GOLD}
          opacity="0.6"
        >
          N
        </text>

        {/* the view cone — drawn facing up, then turned to the live heading */}
        <g transform={`rotate(${heading} ${C} ${C})`}>
          <path
            d={sectorPath(-half, half, CONE)}
            fill={`url(#${fillId})`}
            stroke={`url(#${edgeId})`}
            strokeWidth="1.5"
            strokeLinejoin="round"
            style={{ filter: "drop-shadow(0 0 4px rgba(232,200,121,0.45))" }}
            {...CRISP}
          />
          <line
            x1={C}
            y1={C}
            x2={C}
            y2={C - CONE}
            stroke="rgba(232,200,121,0.55)"
            strokeWidth="1"
            strokeDasharray="4 6"
            {...CRISP}
          />
        </g>

        {/* the hub — where the visitor stands */}
        <circle
          cx={C}
          cy={C}
          r="11"
          fill="#070B17"
          stroke={GOLD}
          strokeWidth="2"
          style={{ filter: "drop-shadow(0 0 5px rgba(232,200,121,0.5))" }}
          {...CRISP}
        />
        <circle cx={C} cy={C} r="4.2" fill={GOLD} />
      </g>
    </svg>
  );
};

export default FloorPlanRadar;
