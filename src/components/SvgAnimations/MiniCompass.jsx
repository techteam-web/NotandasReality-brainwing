/**
 * Realtime mini compass — vintage "compass rose" heading indicator.
 *
 * A small nautical compass for the 360° pano viewer, styled after an old
 * cartographic compass rose: an aged-paper disc, an inked eight-point star,
 * serif cardinal letters, a degree ring with ticks and a dotted rim. A fixed
 * ink marker sits at the very top (the lubber line); the whole card — star,
 * letters, ticks and degree numbers — rotates so the direction you are
 * currently looking always reads under that marker. Pass `yaw` in degrees
 * (the live pano look-direction) and the card spins to match.
 *
 * Drawn inline (no external SVG asset) so it stays light and crisp at any size.
 * Flip the sign of `yaw` at the call site if the rotation reads backwards.
 */

// Ink / paper palette — engraved black on warm aged parchment.
const INK = "#2a2620";
const INK_SOFT = "#6b6353";
const PAPER_HI = "#f3eddd";
const SERIF = "Georgia, 'Times New Roman', serif";

const CARDINALS = [
  { label: "N", x: 50, y: 10, bold: true },
  { label: "E", x: 90, y: 50 },
  { label: "S", x: 50, y: 90 },
  { label: "W", x: 10, y: 50 },
];

// Degree numbers every 30°, but skip the four cardinal axes (0/90/180/270) —
// those carry the N/E/S/W letters and the long star points instead.
const DEGREES = [30, 60, 120, 150, 210, 240, 300, 330];

// Fine ticks every 5° around the degree ring; every 30° is a long major tick.
const TICKS = Array.from({ length: 72 }, (_, i) => i * 5);

// One arm of the star, pointing up; rotated into the four/eight directions.
const Arm = ({ apex, half, rotate }) => (
  <g transform={`rotate(${rotate} 50 50)`}>
    {/* leading half catches the light, trailing half is inked */}
    <polygon
      points={`50,${apex} 50,50 ${50 - half},50`}
      fill={PAPER_HI}
      stroke={INK}
      strokeWidth="0.35"
      strokeLinejoin="round"
    />
    <polygon
      points={`50,${apex} 50,50 ${50 + half},50`}
      fill={INK}
      stroke={INK}
      strokeWidth="0.35"
      strokeLinejoin="round"
    />
  </g>
);

const MiniCompass = ({ yaw = 0, transitionMs = 0, className = "" }) => (
  <div className={className}>
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <radialGradient id="mc-paper" cx="42%" cy="38%" r="68%">
          <stop offset="0%" stopColor="#efe7d4" />
          <stop offset="62%" stopColor="#e3d8bf" />
          <stop offset="100%" stopColor="#cabd9d" />
        </radialGradient>
      </defs>

      {/* aged-paper disc (fixed) */}
      <circle cx="50" cy="50" r="48" fill="url(#mc-paper)" />
      <circle cx="50" cy="50" r="47.4" fill="none" stroke={INK} strokeWidth="0.6" />

      {/* rotating card — spins so the current heading reads under the top marker */}
      <g
        transform={`rotate(${-yaw} 50 50)`}
        style={{
          transition: transitionMs ? `transform ${transitionMs}ms ease-out` : "none",
        }}
      >
        {/* dotted outer rim */}
        <circle
          cx="50"
          cy="50"
          r="45.5"
          fill="none"
          stroke={INK}
          strokeWidth="0.9"
          strokeDasharray="0.2 2.2"
          strokeLinecap="round"
        />

        {/* degree band */}
        <circle cx="50" cy="50" r="36" fill="none" stroke={INK} strokeWidth="0.4" />
        <circle cx="50" cy="50" r="29" fill="none" stroke={INK} strokeWidth="0.4" />

        {TICKS.map((a) => {
          const major = a % 30 === 0;
          const mid = a % 10 === 0;
          return (
            <line
              key={a}
              x1="50"
              y1={14}
              x2="50"
              y2={major ? 21 : mid ? 18 : 16}
              stroke={INK}
              strokeWidth={major ? 0.8 : 0.4}
              transform={`rotate(${a} 50 50)`}
            />
          );
        })}

        {/* degree numbers, oriented radially around the ring */}
        {DEGREES.map((a) => (
          <g key={a} transform={`rotate(${a} 50 50)`}>
            <text
              x="50"
              y="25.5"
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="4"
              fontStyle="italic"
              fontFamily={SERIF}
              fill={INK_SOFT}
            >
              {a}
            </text>
          </g>
        ))}

        {/* eight-point compass rose — four long main arms, four short diagonals */}
        <Arm apex={24} half={3.3} rotate={0} />
        <Arm apex={24} half={3.3} rotate={90} />
        <Arm apex={24} half={3.3} rotate={180} />
        <Arm apex={24} half={3.3} rotate={270} />
        <Arm apex={35} half={3.8} rotate={45} />
        <Arm apex={35} half={3.8} rotate={135} />
        <Arm apex={35} half={3.8} rotate={225} />
        <Arm apex={35} half={3.8} rotate={315} />

        {/* centre hub */}
        <circle cx="50" cy="50" r="3" fill={PAPER_HI} stroke={INK} strokeWidth="0.6" />
        <circle cx="50" cy="50" r="1.2" fill={INK} />

        {/* serif cardinal letters, upright on the card */}
        {CARDINALS.map(({ label, x, y, bold }) => (
          <text
            key={label}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="7.5"
            fontStyle="italic"
            fontFamily={SERIF}
            fontWeight={bold ? 700 : 500}
            fill={INK}
          >
            {label}
          </text>
        ))}
      </g>

      {/* fixed top marker (lubber line) — the current heading sits right below it */}
      <polygon points="46,1.5 54,1.5 50,8" fill={INK} />
    </svg>
  </div>
);

export default MiniCompass;
