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
      className={`pointer-events-none absolute left-1/2 z-50 w-52 -translate-x-1/2 scale-95 opacity-0 transition-all duration-300 ease-out group-hover:pointer-events-auto group-hover:scale-100 group-hover:opacity-100 ${
        onTop
          ? "bottom-full translate-y-2 pb-4 group-hover:translate-y-0"
          : "top-full -translate-y-2 pt-4 group-hover:translate-y-0"
      }`}
    >
      {/* arrow pointing at the building (rendered first when card sits below) */}
      {!onTop && (
        <div className="mx-auto -mb-1.5 h-3 w-3 rotate-45 border-t border-l border-[#3b5382]/35 bg-[#fdfaf3]" />
      )}

      <div className="relative -rotate-1 rounded-sm border border-[#3b5382]/35 bg-[#fdfaf3]/95 px-4 py-3 shadow-[0_12px_30px_rgba(59,83,130,0.25)] backdrop-blur-[2px] transition-transform duration-300 group-hover:rotate-0">
        {/* inner hairline frame, like an old map legend box */}
        <div className="pointer-events-none absolute inset-1 rounded-[1px] border border-[#3b5382]/15" />

        <p className="text-[10px] tracking-[3px] text-[#4E5157]/80 uppercase">
          ◈ {area}
        </p>

        <h3 className="mt-0.5 font-serif text-lg leading-tight text-[#3b5382] italic">
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
        <div className="mx-auto -mt-1.5 h-3 w-3 rotate-45 border-r border-b border-[#3b5382]/35 bg-[#fdfaf3]" />
      )}
    </div>
  );
};

export default BuildingTooltip;
