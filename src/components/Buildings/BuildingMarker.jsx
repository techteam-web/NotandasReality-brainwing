import { Link } from "react-router";
import BuildingTooltip from "./BuildingTooltip";

/**
 * One glowing pointer standing on the map.
 *
 * The wrapper is centered on the `top` / `left` percentages from
 * buildingsData.js — they mark exactly where the pointer sits, so
 * adjust those values to reposition it.
 *
 * At rest: a small blue-gray beacon pulses on the map, sending out soft
 * sonar rings like a marked spot on an old chart.
 * Hover: the building pops up out of the pointer on a dashed ink stem,
 * a cool blue glow breathes behind it and the map-card tooltip
 * unfolds with name, area, tagline and a link to its views page.
 * `tooltip: "bottom"` hangs the whole popup below the pointer instead
 * (use it for pointers near the top edge of the screen).
 */
const BuildingMarker = ({ building }) => {
  const { name, area, tagline, img, top, left, width, href, tooltip } =
    building;
  const popsUp = tooltip !== "bottom";

  return (
    <div
      className="group pointer-events-none absolute z-10 hover:z-50"
      style={{ top, left, transform: "translate(-50%, -50%)" }}
    >
      {/* gsap pops this in on load and floats it gently (see BuildingsLayer) */}
      <div className="bldg-pop relative h-5 w-5">
        {/* ── the pointer: a small blue-gray beacon ── */}
        <Link
          to={href}
          aria-label={`View ${name}`}
          className="pointer-events-auto relative block h-full w-full cursor-pointer"
        >
          {/* expanding sonar rings, fade away while the popup is open */}
          <span className="bldg-ping absolute inset-0 rounded-full border border-[#6f7f95]/70 transition-opacity duration-300 group-hover:opacity-0" />
          <span className="bldg-ping absolute inset-0 rounded-full border border-[#6f7f95]/70 transition-opacity duration-300 [animation-delay:1.1s] group-hover:opacity-0" />

          {/* soft blue halo, blooms while the popup is open */}
          <span className="pointer-events-none absolute -inset-3 rounded-full bg-[radial-gradient(circle,rgba(94,109,133,0.42)_0%,rgba(94,109,133,0)_70%)] transition-transform duration-500 group-hover:scale-150" />

          {/* cool core with a light rim and ink hairline */}
          <span className="absolute inset-0 rounded-full border-2 border-[#f5f7fb] bg-[radial-gradient(circle_at_35%_30%,#8ea2bf_0%,#4e667f_75%)] shadow-[0_0_0_1px_rgba(78,81,87,0.42),0_2px_6px_rgba(78,81,87,0.34)] transition-transform duration-300 group-hover:scale-110" />
        </Link>

        {/* building name inked beneath the pointer, like a place label on an old map */}
        <p
          className={`pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 font-serif text-xs leading-none tracking-wide whitespace-nowrap text-[#4E5157] italic transition-opacity duration-300 select-none [text-shadow:0_1px_0_rgba(245,247,251,0.9),0_0_6px_rgba(245,247,251,0.8)] ${popsUp ? "" : "group-hover:opacity-0"}`}
        >
          {name}
        </p>

        {/* ── the popup: building rises out of the pointer on hover ── */}
        <div
          className={`pointer-events-none absolute left-1/2 flex -translate-x-1/2 items-center opacity-0 transition-[opacity,translate] duration-500 ease-out group-hover:pointer-events-auto group-hover:opacity-100 ${
            popsUp
              ? "bottom-full translate-y-2 flex-col group-hover:translate-y-0"
              : "top-full -translate-y-2 flex-col-reverse group-hover:translate-y-0"
          }`}
          style={{ width: `calc(${width} * 2)` }}
        >
          <div className="relative w-full">
            {/* Only the building grows out of the pointer. The scale lives here,
                not on the popup wrapper, so the box the tooltip is anchored to
                keeps its final size the whole time — otherwise the tooltip
                rides the growing transform and drifts into place, more so on
                the taller buildings that sit further from the scale origin. */}
            <div
              className={`relative w-full scale-75 transition-transform duration-500 ease-out group-hover:scale-100 ${
                popsUp ? "origin-bottom" : "origin-top"
              }`}
            >
              {/* cool blue glow breathing behind the popped-up building */}
              <div className="bldg-glow pointer-events-none absolute inset-[-25%] rounded-full bg-[radial-gradient(circle,rgba(94,109,133,0.46)_0%,rgba(94,109,133,0)_70%)]" />

              <Link to={href} tabIndex={-1} className="block cursor-pointer">
                <img
                  src={img}
                  alt={name}
                  draggable="false"
                  className="relative h-auto w-full drop-shadow-[0_14px_20px_rgba(78,81,87,0.34)] select-none"
                />
              </Link>
            </div>

            <BuildingTooltip
              name={name}
              area={area}
              tagline={tagline}
              href={href}
              position={tooltip}
            />
          </div>

          {/* dashed ink stem tying the building to its pointer */}
          <div className="h-5 border-l-2 border-dashed border-[#4E5157]/50" />
        </div>
      </div>
    </div>
  );
};

export default BuildingMarker;
