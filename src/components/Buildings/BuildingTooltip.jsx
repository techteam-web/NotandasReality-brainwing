import { Link } from "react-router";

/**
 * Vintage map-card tooltip that appears when a building is hovered.
 * Looks like a small paper label pinned onto the map: cool paper,
 * slate hairline borders, serif italic name and a hand-dashed divider.
 * Renders above the building by default; pass position="bottom" to flip it.
 *
 * `u` is the map's scale — the card is drawn at artwork size and multiplied by
 * it, so it stays the same size relative to the map on any screen.
 */
const BuildingTooltip = ({
  name,
  area,
  tagline,
  href,
  position = "top",
  u = 1,
}) => {
  const onTop = position === "top";
  const s = (px) => px * u;

  return (
    <div
      className={`pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 scale-95 opacity-0 transition-all duration-300 ease-out group-hover:pointer-events-auto group-hover:scale-100 group-hover:opacity-100 ${
        onTop
          ? "bottom-full translate-y-2 group-hover:translate-y-0"
          : "top-full -translate-y-2 group-hover:translate-y-0"
      }`}
      style={{
        width: s(208),
        fontSize: s(16),
        [onTop ? "paddingBottom" : "paddingTop"]: s(16),
      }}
    >
      {/* arrow pointing at the building (rendered first when card sits below) */}
      {!onTop && (
        <div
          className="mx-auto rotate-45 border-t border-l border-[#4E5157]/35 bg-[#f5f7fb]"
          style={{
            width: "0.75em",
            height: "0.75em",
            marginBottom: "-0.375em",
          }}
        />
      )}

      <div
        className="relative -rotate-1 rounded-sm border border-[#4E5157]/35 bg-[#f5f7fb]/95 shadow-[0_12px_30px_rgba(78,81,87,0.25)] backdrop-blur-[2px] transition-transform duration-300 group-hover:rotate-0"
        style={{ padding: "0.75em 1em" }}
      >
        {/* inner hairline frame, like an old map legend box */}
        <div
          className="pointer-events-none absolute rounded-[1px] border border-[#4E5157]/15"
          style={{ inset: "0.25em" }}
        />

        <p
          className="text-[#4E5157]/80 uppercase"
          style={{ fontSize: "0.625em", letterSpacing: "0.3em" }}
        >
          {area}
        </p>

        <h3
          className="font-serif leading-tight text-[#4E5157] italic"
          style={{ fontSize: "1.125em", marginTop: "0.125em" }}
        >
          {name}
        </h3>

        <p
          className="leading-snug text-[#4E5157]/90"
          style={{ fontSize: "0.6875em", marginTop: "0.25em" }}
        >
          {tagline}
        </p>

        <div
          className="border-t border-dashed border-[#4E5157]/30"
          style={{ margin: "0.5em 0" }}
        />

        <Link
          to={href}
          className="group/link inline-flex items-center font-medium tracking-wide text-[#4E5157] transition-colors duration-300 hover:text-[#6f7f95]"
          style={{ fontSize: "0.6875em", gap: "0.375em" }}
        >
          View Project
        </Link>
      </div>

      {onTop && (
        <div
          className="mx-auto rotate-45 border-r border-b border-[#4E5157]/35 bg-[#f5f7fb]"
          style={{ width: "0.75em", height: "0.75em", marginTop: "-0.375em" }}
        />
      )}
    </div>
  );
};

export default BuildingTooltip;
