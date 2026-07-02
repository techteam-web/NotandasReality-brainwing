import { Link } from "react-router";
import BuildingTooltip from "./BuildingTooltip";

/**
 * One glowing pointer standing on the map.
 *
 * The wrapper is centered on the `top` / `left` percentages from
 * buildingsData.js — they mark exactly where the pointer sits, so
 * adjust those values to reposition it.
 *
 * At rest: a small golden beacon pulses on the map, sending out soft
 * sonar rings like a marked spot on an old chart.
 * Hover: the building pops up out of the pointer on a dashed ink stem,
 * a warm golden glow breathes behind it and the map-card tooltip
 * unfolds with name, area, tagline and a link to its views page.
 * `tooltip: "bottom"` hangs the whole popup below the pointer instead
 * (use it for pointers near the top edge of the screen).
 */
const BuildingMarker = ({ building }) => {
  const { name, area, tagline, img, top, left, width, href, tooltip } = building;
  const popsUp = tooltip !== "bottom";

  return (
    <div
      className="absolute z-10 group pointer-events-none hover:z-50"
      style={{ top, left, transform: "translate(-50%, -50%)" }}
    >
      {/* gsap pops this in on load and floats it gently (see BuildingsLayer) */}
      <div className="bldg-pop relative h-5 w-5">
        {/* ── the pointer: a small golden beacon ── */}
        <Link
          to={href}
          aria-label={`View ${name}`}
          className="pointer-events-auto relative block h-full w-full cursor-pointer"
        >
          {/* expanding sonar rings, fade away while the popup is open */}
          <span className="bldg-ping absolute inset-0 rounded-full border border-[#b8860b]/70 transition-opacity duration-300 group-hover:opacity-0" />
          <span className="bldg-ping absolute inset-0 rounded-full border border-[#b8860b]/70 [animation-delay:1.1s] transition-opacity duration-300 group-hover:opacity-0" />

          {/* soft golden halo, blooms while the popup is open */}
          <span
            className="absolute -inset-3 rounded-full pointer-events-none
                       bg-[radial-gradient(circle,rgba(218,165,32,0.4)_0%,rgba(218,165,32,0)_70%)]
                       transition-transform duration-500 group-hover:scale-150"
          />

          {/* golden core with a paper rim and ink hairline */}
          <span
            className="absolute inset-0 rounded-full border-2 border-[#fdfaf3]
                       bg-[radial-gradient(circle_at_35%_30%,#e8c879_0%,#b8860b_75%)]
                       shadow-[0_0_0_1px_rgba(59,83,130,0.4),0_2px_6px_rgba(59,83,130,0.35)]
                       transition-transform duration-300 group-hover:scale-110"
          />
        </Link>

        {/* ── the popup: building rises out of the pointer on hover ── */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 flex items-center pointer-events-none
                      opacity-0 scale-75 transition-all duration-500 ease-out
                      group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto
                      ${
                        popsUp
                          ? "bottom-full flex-col origin-bottom translate-y-2 group-hover:translate-y-0"
                          : "top-full flex-col-reverse origin-top -translate-y-2 group-hover:translate-y-0"
                      }`}
          style={{ width: `calc(${width} * 2)` }}
        >
          <div className="relative w-full">
            {/* warm golden glow breathing behind the popped-up building */}
            <div
              className="bldg-glow absolute inset-[-25%] rounded-full pointer-events-none
                         bg-[radial-gradient(circle,rgba(218,165,32,0.45)_0%,rgba(218,165,32,0)_70%)]"
            />

            <Link to={href} tabIndex={-1} className="block cursor-pointer">
              <img
                src={img}
                alt={name}
                draggable="false"
                className="relative w-full h-auto select-none
                           drop-shadow-[0_14px_20px_rgba(59,83,130,0.35)]"
              />
            </Link>

            <BuildingTooltip
              name={name}
              area={area}
              tagline={tagline}
              href={href}
              position={tooltip}
            />
          </div>

          {/* dashed ink stem tying the building to its pointer */}
          <div className="h-5 border-l-2 border-dashed border-[#3b5382]/50" />
        </div>
      </div>
    </div>
  );
};

export default BuildingMarker;
