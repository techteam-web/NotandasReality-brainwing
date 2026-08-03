/**
 * Mini compass — floor-plan compass rose direction indicator.
 *
 * Renders the floorPlan_Compass.svg artwork inside a clean vector canvas with
 * optional background disc and top lubber-line pin marker.
 *
 * Props:
 *   • heading — real compass bearing (0 = N, 90 = E). Card rotates with pano drag.
 *   • pinDeg — pin location on rim (0 = top, 90 = right, etc.).
 *   • transitionMs — easing duration for heading turns.
 *   • backgroundFill — fill color for the background disc (default "#ffffff").
 *   • showMarker — boolean to render the top blue-grey pin marker (default true).
 *   • bgRadius — background circle radius (default 602).
 *   • innerScale — scale factor for the inner compass rose (default 1.0).
 *   • innerScaleX / innerScaleY — optional width/height multipliers for inner rose.
 *   • nOffsetY — vertical nudge offset for N letter.
 */

// Needle/ring pivot taken straight from floorPlan_Compass.svg.
const ROSE_CX = 605.73;
const ROSE_CY = 689.11;
// Centre of the square badge; the artwork is shifted so the rose pivots here.
const C = 627;

const LETTER_FONT = "'Abril Fatface', AbrilFatface-Regular, serif";
const LETTER_SIZE = 75.09;

// White needle/pin faces carry the artwork's thin black outline.
const outlined = { fill: "#fff", stroke: "#000", strokeMiterlimit: "10" };

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
  bgRadius = 642,       // background fill circle radius (602 matches 1254 canvas)
  innerScale = 1.25,     // overall scale of inner compass
  innerScaleX = 1.0,     // width multiplier for inner compass
  innerScaleY = 1.0,     // height multiplier for inner compass
  nOffsetY = 0,          // N letter vertical nudge offset
}) => {
  const pinTipY = C - bgRadius;
  const pinBaseY = Math.max(10, pinTipY - 75);
  const scaleX = innerScale * innerScaleX;
  const scaleY = innerScale * innerScaleY;

  // Calculate dynamic viewBox so large bgRadius / innerScaleY never clip top or bottom
  const maxRadius = Math.max(bgRadius + 90, scaleY * 550 + 60);
  const vRadius = Math.max(627, maxRadius);
  const vMin = C - vRadius;
  const vSize = 2 * vRadius;

  return (
    <div className={`overflow-visible ${className}`}>
      <svg
        viewBox={`${vMin} ${vMin} ${vSize} ${vSize}`}
        width="100%"
        height="100%"
        className="overflow-visible"
      >
        {/* compass background disc */}
        {backgroundFill !== "none" && (
          <circle cx={C} cy={C} r={bgRadius} fill={backgroundFill} />
        )}

        {/* the card — turned so the current heading lands right under the pin */}
        <g
          transform={`rotate(${pinDeg - heading} ${C} ${C})`}
          style={spin(transitionMs)}
        >
          <g transform={`translate(${C - ROSE_CX} ${C - ROSE_CY})`}>
            {/* Inner compass rose from floorPlan_Compass.svg */}
            <g
              transform={`translate(${ROSE_CX} ${ROSE_CY}) scale(${scaleX} ${scaleY}) translate(${-ROSE_CX} ${-ROSE_CY})`}
            >
              {/* Ring, split needle and direction pins from floorPlan_Compass.svg */}
              <g>
                <ellipse
                  cx="605.73"
                  cy="689.11"
                  rx="222.34"
                  ry="219.97"
                  fill="none"
                  stroke="#000"
                  strokeMiterlimit="10"
                />
                <polygon
                  {...outlined}
                  points="628.22 665.91 797.7 689.3 629.88 688.76 628.22 665.91"
                />
                <polygon points="628.03 708.36 797.7 689.3 629.95 688.01 628.03 708.36" />
                <polygon points="584.12 665.42 411.79 688.76 582.87 687.67 584.12 665.42" />
                <polygon
                  {...outlined}
                  points="585.03 708.55 411.79 688.76 582.87 687.67 585.03 708.55"
                />
                <polygon points="585.03 650.07 503.06 587.02 584.12 665.42 585.03 650.07" />
                <polygon points="646.16 706.32 707.49 786.18 628.03 708.36 646.16 706.32" />
                <polygon
                  {...outlined}
                  points="503.06 587.02 566.51 667.81 584.12 665.42 503.06 587.02"
                />
                <polygon
                  {...outlined}
                  points="628.03 727.41 628.03 708.36 707.49 786.18 628.03 727.41"
                />
                <polygon points="628.03 652.52 707.49 587.02 647.51 668.57 628.22 665.91 628.03 652.52" />
                <path d="M568.46,706.66s-67.32,83.44-65.36,83.44,83.07-63.35,83.07-63.35l-1.15-18.19-16.57-1.89Z" />
                <polygon
                  {...outlined}
                  points="605.4 357.7 582.87 688.76 605.4 947.34 605.4 357.7"
                />
                <polygon points="629.88 688.76 605.4 352.8 605.4 947.34 629.88 688.76" />
              </g>

              {/* Ornate N, side ticks, quarter-arc accents and W / S / E letters from floorPlan_Compass.svg */}
              <g>
                <g transform={`translate(0 ${nOffsetY})`}>
                  <path d="M555.16,314.75c.06-4.96,2.17-9.43,2.34-14.43,1.02-30.27,2.34-71.16-.02-100.78-.5-6.24-1.6-11.16-4.56-16.65h29.06s-1.13,13.38-1.13,13.38c29.79-38.68,82.6-15.37,67.05,33.52-8.1,25.46-53.53,60.39-33.46,87.13,15.56,20.73,56.02-5.23,31.21-24.51l-2.18,17.9c-25.13,21.58-37.76-21.76-12.73-30.6,27.3-9.65,46.83,20.38,30.43,43.81-12.36,17.67-41.92,18.5-55.78,2.45-37.18-43.04,47.24-88.55,24.54-125.12-13.25-21.34-45.02-8.31-49.71,12.65-3.24,14.48-1.37,77.75,2.31,92.86.8,3.28,2.73,5.44,3.92,8.37h-31.29Z" />
                </g>
                <path d="M856.18,683.89l54.67,2.66c2.01.1,2.03,3.07.01,3.18l-54.65,3.13c-2.58.15-4.75-1.9-4.75-4.48h0c0-2.57,2.15-4.61,4.71-4.48Z" />
                <path d="M356.02,684.9l-52,1.64c-1.82.06-1.84,2.75-.02,2.84l52.06,2.46c1.66.08,3.05-1.25,3.05-2.91v-1.03c0-1.7-1.4-3.05-3.1-3Z" />
                <path d="M574.24,425.9c-104.84,21.58-191.24,94.26-219.75,198.87-4.1,14.32-6.92,28.99-8.79,43.8,0,0,.51-5.58.51-5.58,1.37-12.99,3.65-25.94,6.86-38.61,26.41-105.81,114.8-180.67,221.17-198.49h0Z" />
                <path d="M345.7,706.66c2.57,58.2,24.83,115.85,64.21,159.02,33.77,37.68,79.7,63.6,128.89,74.98,15.14,3.63,30.63,5.9,46.22,6.68-31.25-.4-62.4-7.22-91.39-19.14-89.34-36.33-147.57-125.53-147.94-221.54h0Z" />
                <path d="M634.32,425.9c117.51,11.66,213.29,102.4,230.69,219.27,1.18,7.5,1.98,15.06,2.42,22.63-7.34-75.27-46.75-147.03-108.16-191.56-36.68-26.7-80.02-44.06-124.95-50.35h0Z" />
                <path d="M867.43,706.32c-6.52,93.4-63.93,178.07-149.2,217.2-27.81,12.87-57.81,21.23-88.35,23.82,47.24-6,93-24.01,131.24-52.43,20.62-15.3,38.74-33.83,54.16-54.31,28.87-39.04,46.86-86.03,52.15-134.27h0Z" />
                <text
                  fontFamily={LETTER_FONT}
                  fontSize={LETTER_SIZE}
                  transform="translate(219.11 715.66)"
                >
                  W
                </text>
                <text
                  fontFamily={LETTER_FONT}
                  fontSize={LETTER_SIZE}
                  transform="translate(586.76 1025.17) scale(.91 1)"
                >
                  S
                </text>
                <text
                  fontFamily={LETTER_FONT}
                  fontSize={LETTER_SIZE}
                  transform="translate(922.53 714.9)"
                >
                  E
                </text>
              </g>
            </g>
          </g>

          {/* Top pin marker (lubber line) */}
          {showMarker && (
            <g transform={`rotate(${pinDeg} ${C} ${C})`}>
              <polygon
                points={`576.8,${pinBaseY} 677.2,${pinBaseY} 627,${pinTipY + 18}`}
                fill="#6f7f95"
              />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};

export default MiniCompass;
