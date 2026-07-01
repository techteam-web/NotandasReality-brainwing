import { Link } from "react-router";
import BuildingTooltip from "./BuildingTooltip";

/**
 * One building standing on the map.
 *
 * The wrapper is anchored at bottom-center, so the `top` / `left`
 * percentages from buildingsData.js mark exactly where the building's
 * base touches the ground — adjust those values to reposition it.
 *
 * At rest: a warm golden glow pulses gently behind the building.
 * Hover: the building lifts and scales up from its small resting size,
 * the glow stops pulsing and blooms bigger, an ink ring pulses at its
 * feet and the map-card tooltip unfolds with name, area, tagline and
 * a link to its views page.
 */
const BuildingMarker = ({ building }) => {
  const { name, area, tagline, img, top, left, width, href, tooltip } = building;

  return (
    <div
      className="absolute z-10 group pointer-events-auto hover:z-50"
      style={{ top, left, width, transform: "translate(-50%, -100%)" }}
    >
      {/* gsap pops this in from the ground on page load (see BuildingsLayer) */}
      <div className="bldg-pop relative">
        {/* warm golden glow: pulses gently at rest, blooms bigger and holds on hover */}
        <div
          className="bldg-glow absolute inset-[-20%] rounded-full pointer-events-none
                     bg-[radial-gradient(circle,rgba(218,165,32,0.45)_0%,rgba(218,165,32,0)_70%)]
                     transition-all duration-500 ease-out
                     group-hover:[animation:none] group-hover:opacity-100 group-hover:scale-135"
        />

        {/* pulsing hand-dashed ink ring at the building's feet */}
        <div className="absolute bottom-0 left-1/2 w-3/4 -translate-x-1/2 translate-y-1/3 pointer-events-none opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="bldg-ring w-full aspect-3/1 rounded-[50%] border border-dashed border-[#3b5382]/70" />
        </div>

        {/* soft ground shadow so the building feels planted on the map */}
        <div
          className="absolute bottom-0 left-1/2 h-2.5 w-2/3 -translate-x-1/2 translate-y-1/2
                     rounded-[50%] bg-[#3b5382]/20 blur-[3px] pointer-events-none
                     transition-all duration-500 group-hover:w-3/4 group-hover:bg-[#3b5382]/30"
        />

        <Link to={href} aria-label={`View ${name}`} className="block cursor-pointer">
          <img
            src={img}
            alt={name}
            draggable="false"
            className="relative w-full h-auto select-none
                       drop-shadow-[0_5px_8px_rgba(59,83,130,0.25)]
                       transition-all duration-500 ease-out
                       group-hover:-translate-y-3 group-hover:scale-150 group-hover:saturate-125
                       group-hover:drop-shadow-[0_18px_24px_rgba(59,83,130,0.45)]"
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
    </div>
  );
};

export default BuildingMarker;
