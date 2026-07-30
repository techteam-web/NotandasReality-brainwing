/**
 * Mini compass — vintage "compass rose" direction indicator.
 *
 * A small nautical compass for the 360° pano viewer, styled after an old
 * cartographic compass rose: an aged-paper disc, an inked eight-point star,
 * serif cardinal letters, a degree ring with ticks and a dotted rim, plus an
 * ink pin (the lubber line) around the rim.
 *
 * Two inputs:
 *
 *   • heading — the real compass bearing currently being looked at (0 = N,
 *     90 = E). LIVE: the pano viewer feeds it the capture's hand-set north plus
 *     the current drag, so the card turns as the visitor looks around and the
 *     direction they face always reads under the pin.
 *
 *   • pinDeg — where the pin sits on the rim, in degrees clockwise from the top
 *     of the widget. HAND-SET per building / floor / room in panoData.js:
 *     0 = top (the default), 90 = right, 180 = bottom, -90 = left. The card
 *     re-orients to keep the heading under the pin wherever you park it.
 *
 * Both default to 0 — N up, pin at the top, nothing turning.
 *
 * Drawn inline (no external SVG asset) so it stays light and crisp at any size.
 */

// Site-aligned blue-gray palette.
const INK = "#4E5157";
const INK_SOFT = "#6f7f95";
const PAPER_HI = "#c8d2df";
const SERIF = "Georgia, 'Times New Roman', serif";

// North carries the Notandas "n" logo glyph instead of the letter N.
const CARDINALS = [
  { label: "E", x: 90, y: 50 },
  { label: "S", x: 50, y: 90 },
  { label: "W", x: 10, y: 50 },
];

// Notandas "n" glyph, lifted from NuthandasLogoAnimated. Drawn in the logo's
// own coordinate space; LOGO_* below centre and scale it into the north slot.
const LOGO_PATH =
  "M1630 2530 c-55 -11 -123 -47 -179 -95 -74 -63 -91 -58 -91 23 0 61 -7 65 -109 65 -66 0 -96 -4 -106 -14 -12 -12 -14 -133 -15 -774 -1 -714 0 -760 16 -772 23 -17 53 -16 84 2 14 8 46 14 73 15 26 0 48 1 49 3 1 1 5 227 8 502 l6 500 25 65 c36 94 57 128 119 191 43 44 68 61 113 75 54 17 60 17 112 0 130 -41 187 -219 140 -439 -16 -79 -83 -221 -134 -289 -20 -26 -56 -75 -81 -108 -25 -33 -50 -66 -55 -73 -65 -78 -136 -240 -154 -352 -21 -138 -22 -161 -12 -242 19 -147 88 -271 200 -354 80 -60 124 -73 240 -67 77 4 106 10 147 31 62 31 131 100 160 159 28 56 54 164 54 223 0 55 -27 178 -48 220 -27 54 -101 133 -145 154 -61 29 -168 29 -217 0 -42 -26 -52 -38 -93 -114 -30 -56 -32 -66 -32 -160 1 -85 4 -105 23 -135 33 -54 76 -82 129 -83 61 0 94 32 101 102 5 59 -11 92 -57 116 -25 13 -28 18 -22 42 6 23 14 29 43 31 75 6 125 -75 115 -189 -8 -93 -70 -183 -133 -195 -68 -13 -124 4 -171 51 -24 24 -50 59 -57 77 -35 84 -26 316 14 405 55 119 66 141 94 183 16 25 55 79 86 120 84 111 147 206 155 232 4 13 16 42 26 64 10 23 30 90 45 150 22 91 25 123 21 194 -7 102 -31 216 -49 238 -8 10 -20 30 -28 47 -8 16 -41 55 -72 86 -48 47 -69 60 -127 78 -69 21 -145 25 -211 11z";
// Glyph bbox in the logo viewBox is 111.1 × 205 centred at (168.45, 180.82).
const LOGO_CX = 168.45;
const LOGO_CY = 180.82;
const LOGO_SCALE = 11.5 / 205; // ≈11.5 units tall — proud of the old "N" slot

// Degree numbers every 30°, but skip the four cardinal axes (0/90/180/270) —
// those carry the N/E/S/W letters and the long star points instead.
const DEGREES = [30, 60, 120, 150, 210, 240, 300, 330];

// Fine ticks every 5° around the degree ring; every 30° is a long major tick.
const TICKS = Array.from({ length: 72 }, (_, i) => i * 5);

// One arm of the star, pointing up; rotated into the four/eight directions.
const Arm = ({ apex, half, rotate }) => (
  <g transform={`rotate(${rotate} 50 50)`}>
    {/* leading half is inked, trailing half catches the light */}
    <polygon
      points={`50,${apex} 50,50 ${50 - half},50`}
      fill={INK}
      stroke={INK}
      strokeWidth="0.35"
      strokeLinejoin="round"
    />
    <polygon
      points={`50,${apex} 50,50 ${50 + half},50`}
      fill={PAPER_HI}
      stroke={INK}
      strokeWidth="0.35"
      strokeLinejoin="round"
    />
  </g>
);

// Easing for the card as the heading changes; 0 tracks the view frame-for-frame.
const spin = (ms) => ({
  transition: ms ? `transform ${ms}ms ease-out` : "none",
});

const MiniCompass = ({
  heading = 0,
  pinDeg = 0,
  transitionMs = 0,
  className = "",
  backgroundFill = "#ffffff",
  showMarker = true,
}) => (
  <div className={className}>
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      {/* compass background disc */}
      <circle cx="50" cy="50" r="48" fill={backgroundFill} />
      <circle
        cx="50"
        cy="50"
        r="47.4"
        fill="none"
        stroke={INK}
        strokeWidth="0.6"
      />

      {/* the card — turned so the current heading lands right under the pin */}
      <g
        transform={`rotate(${pinDeg - heading} 50 50)`}
        style={spin(transitionMs)}
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
        <circle
          cx="50"
          cy="50"
          r="36"
          fill="none"
          stroke={INK}
          strokeWidth="0.4"
        />
        <circle
          cx="50"
          cy="50"
          r="29"
          fill="none"
          stroke={INK}
          strokeWidth="0.4"
        />
        <circle
          cx="50"
          cy="50"
          r="23.5"
          fill="none"
          stroke={INK}
          strokeWidth="0.35"
        />
        <circle
          cx="50"
          cy="50"
          r="16.5"
          fill="none"
          stroke={INK}
          strokeWidth="0.3"
        />

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
        <Arm apex={32} half={3} rotate={45} />
        <Arm apex={32} half={3} rotate={135} />
        <Arm apex={32} half={3} rotate={225} />
        <Arm apex={32} half={3} rotate={315} />

        {/* centre hub */}
        <circle
          cx="50"
          cy="50"
          r="3"
          fill={PAPER_HI}
          stroke={INK}
          strokeWidth="0.6"
        />
        <circle cx="50" cy="50" r="1.2" fill={INK} />

        {/* Notandas "n" logo glyph at north — enlarged past the tick ring, with
            a parchment halo so it reads cleanly over the lines it crosses */}
        <g
          transform={`translate(50 10.6) scale(${LOGO_SCALE}) translate(${-LOGO_CX} ${-LOGO_CY})`}
        >
          <g transform="translate(0 320) scale(0.1 -0.095)">
            <path
              d={LOGO_PATH}
              fill={INK}
              stroke={PAPER_HI}
              strokeWidth="150"
              strokeLinejoin="round"
              paintOrder="stroke"
            />
          </g>
        </g>

        {/* serif cardinal letters, upright on the card */}
        {CARDINALS.map(({ label, x, y }) => (
          <text
            key={label}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="7.5"
            fontStyle="italic"
            fontFamily={SERIF}
            fontWeight={500}
            fill={INK}
          >
            {label}
          </text>
        ))}
      </g>

      {/* the pin (lubber line) — parked wherever pinDeg puts it, and stays put */}
      {showMarker && (
        <g transform={`rotate(${pinDeg} 50 50)`}>
          <polygon points="46,1.5 54,1.5 50,8" fill="#6f7f95" />
        </g>
      )}
    </svg>
  </div>
);

export default MiniCompass;
