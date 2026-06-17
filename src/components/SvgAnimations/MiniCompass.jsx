/**
 * Realtime mini compass — "heading indicator" dial.
 *
 * A small, clean compass for the 360° pano viewer. A fixed gold marker sits at
 * the very top (the lubber line); the whole cardinal dial — ring, ticks, N/E/S/W
 * letters and needle — rotates so the direction you are currently looking always
 * reads at the top. Pass `yaw` in degrees (the live pano look-direction) and the
 * dial spins to match. North is gold, so you can always find true north as the
 * dial turns.
 *
 * Drawn inline (no external SVG asset) so it stays light and crisp at any size.
 * Flip the sign of `yaw` at the call site if the rotation reads backwards.
 */

const CARDINALS = [
  { label: "N", angle: 0, north: true },
  { label: "E", angle: 90 },
  { label: "S", angle: 180 },
  { label: "W", angle: 270 },
];

// 12 tick marks, one every 30°; the cardinals (every 90°) are longer.
const TICKS = Array.from({ length: 12 }, (_, i) => i);

const MiniCompass = ({ yaw = 0, transitionMs = 0, className = "" }) => (
  <div className={className}>
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      {/* translucent disc — keeps the dial legible over bright or busy panos */}
      <circle
        cx="50"
        cy="50"
        r="46"
        fill="rgba(14,23,38,0.55)"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1.5"
      />

      {/* rotating dial — spins so the current heading reads under the top marker */}
      <g
        transform={`rotate(${-yaw} 50 50)`}
        style={{
          transition: transitionMs ? `transform ${transitionMs}ms ease-out` : "none",
        }}
      >
        {TICKS.map((i) => {
          const major = i % 3 === 0;
          return (
            <line
              key={i}
              x1="50"
              y1="6"
              x2="50"
              y2={major ? "13" : "10"}
              stroke="rgba(255,255,255,0.55)"
              strokeWidth={major ? 1.6 : 0.9}
              transform={`rotate(${i * 30} 50 50)`}
            />
          );
        })}

        {/* needle — gold half points to true north, light half to south */}
        <polygon points="50,29 46.5,50 53.5,50" fill="#e8c879" />
        <polygon points="50,71 46.5,50 53.5,50" fill="rgba(255,255,255,0.5)" />

        {/* cardinal letters — painted on the card, so they turn with the dial */}
        {CARDINALS.map(({ label, angle, north }) => (
          <g key={label} transform={`rotate(${angle} 50 50)`}>
            <text
              x="50"
              y="22"
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="13"
              fontWeight="600"
              fill={north ? "#e8c879" : "rgba(255,255,255,0.9)"}
            >
              {label}
            </text>
          </g>
        ))}

        {/* centre hub */}
        <circle cx="50" cy="50" r="3.4" fill="#0e1726" stroke="#e8c879" strokeWidth="1.2" />
      </g>

      {/* fixed top marker (lubber line) — the current heading sits right below it */}
      <polygon points="44,2 56,2 50,12" fill="#e8c879" />
    </svg>
  </div>
);

export default MiniCompass;
