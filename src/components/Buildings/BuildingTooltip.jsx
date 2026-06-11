import { Link } from "react-router";

/**
 * Vintage map-card tooltip that appears when a building is hovered.
 * Looks like a small paper label pinned onto the map: cream paper,
 * ink-blue hairline borders, serif italic name and a hand-dashed divider.
 * Renders above the building by default; pass position="bottom" to flip it.
 */
const BuildingTooltip = ({ name, area, tagline, href, position = "top" }) => {
  const onTop = position === "top";

  return (
    <div
      className={`absolute left-1/2 -translate-x-1/2 w-52 z-50 pointer-events-none
                  opacity-0 scale-95 transition-all duration-300 ease-out
                  group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto
                  ${
                    onTop
                      ? "bottom-full mb-4 translate-y-2 group-hover:translate-y-0"
                      : "top-full mt-4 -translate-y-2 group-hover:translate-y-0"
                  }`}
    >
      {/* arrow pointing at the building (rendered first when card sits below) */}
      {!onTop && (
        <div className="mx-auto -mb-1.5 w-3 h-3 rotate-45 bg-[#fdfaf3] border-l border-t border-[#3b5382]/35" />
      )}

      <div className="relative bg-[#fdfaf3]/95 backdrop-blur-[2px] border border-[#3b5382]/35 rounded-sm px-4 py-3 shadow-[0_12px_30px_rgba(59,83,130,0.25)] -rotate-1 group-hover:rotate-0 transition-transform duration-300">
        {/* inner hairline frame, like an old map legend box */}
        <div className="absolute inset-1 border border-[#3b5382]/15 rounded-[1px] pointer-events-none" />

        <p className="text-[10px] uppercase tracking-[3px] text-[#4E5157]/80">
          ◈ {area}
        </p>

        <h3 className="mt-0.5 font-serif italic text-lg leading-tight text-[#3b5382]">
          {name}
        </h3>

        <p className="mt-1 text-[11px] leading-snug text-[#4E5157]/90">
          {tagline}
        </p>

        <div className="my-2 border-t border-dashed border-[#3b5382]/30" />

        <Link
          to={href}
          className="group/link inline-flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-[#3b5382] transition-colors duration-300 hover:text-[#b8860b]"
        >
          View Project
          <span className="transition-transform duration-300 group-hover/link:translate-x-1">
            →
          </span>
        </Link>
      </div>

      {onTop && (
        <div className="mx-auto -mt-1.5 w-3 h-3 rotate-45 bg-[#fdfaf3] border-r border-b border-[#3b5382]/35" />
      )}
    </div>
  );
};

export default BuildingTooltip;
