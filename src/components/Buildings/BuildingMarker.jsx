import { Link } from "react-router";
import BuildingTooltip from "./BuildingTooltip";

/**
 * One glowing pointer standing on the map.
 *
 * `top` / `left` from buildingsData.js are percentages of the MAP ARTWORK, not
 * of the window, and `box` says where that artwork actually landed — so a
 * pointer keeps standing on its own street corner however the map is cropped.
 *
 * Everything here is sized in artwork pixels and multiplied by `u`, the map's
 * own scale. The pointer used to be a flat `h-5 w-5`: 20px whatever the screen,
 * which is why the dots swelled against the coastline on a laptop and shrank to
 * specks on a 5xl display. Now a pointer is the same size relative to the map
 * at every screen size, exactly like the ink already printed on it.
 *
 * At rest: a small blue-gray beacon pulses, sending out soft sonar rings like a
 * marked spot on an old chart. Hover: the building pops up out of the pointer
 * on a dashed ink stem, a cool blue glow breathes behind it and the map-card
 * tooltip unfolds. `tooltip: "bottom"` hangs the whole popup below the pointer
 * instead (use it for pointers near the top edge of the map).
 */
const BuildingMarker = ({ building, box, u }) => {
  const { name, area, tagline, img, top, left, width, href, tooltip } =
    building;
  const popsUp = tooltip !== "bottom";

  // artwork pixels → screen pixels
  const s = (px) => px * u;

  return (
    <div
      className="group pointer-events-none absolute z-10 hover:z-50"
      style={{
        left: box.x + (parseFloat(left) / 100) * box.w,
        top: box.y + (parseFloat(top) / 100) * box.h,
        transform: "translate(-50%, -50%)",
      }}
    >
      {/* gsap pops this in on load (see BuildingsLayer) */}
      <div
        className="bldg-pop relative"
        style={{ width: s(20), height: s(20) }}
      >
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
          <span
            className="pointer-events-none absolute rounded-full bg-[radial-gradient(circle,rgba(94,109,133,0.42)_0%,rgba(94,109,133,0)_70%)] transition-transform duration-500 group-hover:scale-150"
            style={{ inset: -s(12) }}
          />

          {/* cool core with a light rim and ink hairline */}
          <span
            className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,#8ea2bf_0%,#4e667f_75%)] shadow-[0_0_0_1px_rgba(78,81,87,0.42),0_2px_6px_rgba(78,81,87,0.34)] transition-transform duration-300 group-hover:scale-110"
            style={{ border: `${Math.max(1, s(2))}px solid #f5f7fb` }}
          />
        </Link>

        {/* building name inked beneath the pointer, like a place label on an old map */}
        <p
          className={`pointer-events-none absolute top-full left-1/2 -translate-x-1/2 font-serif leading-none tracking-wide whitespace-nowrap text-[#4E5157] italic transition-opacity duration-300 select-none [text-shadow:0_1px_0_rgba(245,247,251,0.9),0_0_6px_rgba(245,247,251,0.8)] ${popsUp ? "" : "group-hover:opacity-0"}`}
          style={{ marginTop: s(8), fontSize: s(12) }}
        >
          {name}
        </p>

        {/* ── the popup: building rises out of the pointer on hover ── */}
        <div
          className={`pointer-events-none absolute left-1/2 flex -translate-x-1/2 scale-75 items-center opacity-0 transition-all duration-500 ease-out group-hover:pointer-events-auto group-hover:scale-100 group-hover:opacity-100 ${
            popsUp
              ? "bottom-full origin-bottom translate-y-2 flex-col group-hover:translate-y-0"
              : "top-full origin-top -translate-y-2 flex-col-reverse group-hover:translate-y-0"
          }`}
          style={{ width: s(width * 2) }}
        >
          <div className="relative w-full">
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

            <BuildingTooltip
              name={name}
              area={area}
              tagline={tagline}
              href={href}
              position={tooltip}
              u={u}
            />
          </div>

          {/* dashed ink stem tying the building to its pointer */}
          <div
            className="border-dashed border-[#4E5157]/50"
            style={{ height: s(20), borderLeftWidth: Math.max(1, s(2)) }}
          />
        </div>
      </div>
    </div>
  );
};

export default BuildingMarker;
