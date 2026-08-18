import { useState } from "react";
import { Link, useParams } from "react-router";
import { BUILDINGS } from "../Buildings/buildingsData";
import { BUILDING_VIEWS } from "./buildingViewsData";
import FloorPlanOverlay from "./FloorPlanOverlay";
import PanoViewer from "./PanoViewer";
import { getRegionPano } from "./panoData";
import NotandasNMark from "../SvgAnimations/NotandasNMark";
import ProjectPlate from "./ProjectPlate";
import { aspectFromViewBox, uiScaleFor, useCoverBox } from "../../lib/coverBox";
import { BUILDING_AMINITIES } from "./AmenitiesData";

/**
 * The "View Project" destination.
 *
 * Full-bleed building photo (from ViewsBuildings) with the project's own
 * logo set large across the top (projects without a dedicated mark fall back
 * to the name as text) and the Notandas mark in the corner — a hero shot,
 * like a brochure cover. Every floor cut-out (Building_Floor_SVG) is laid
 * over the photo in the same coordinate space, so the shapes sit exactly on
 * their real floors. Hovering a floor tints it in the theme's ink
 * (#070B17) and reveals its number on the right-hand readout.
 *
 * The photo uses object-cover and the overlay uses preserveAspectRatio
 * "xMidYMid slice" — both crop the same way, so floors stay aligned on any
 * screen size.
 *
 * Buildings without art yet fall back to a quiet "coming soon" card.
 */
const BuildingPage = () => {
  const { id } = useParams();
  const building = BUILDINGS.find((b) => b.id === id);
  const view = BUILDING_VIEWS[id];
  const amenities = Object.values(BUILDING_AMINITIES[id] || {})
    .flatMap((item) => item.split("|"))
    .map((item) => item.trim())
    .filter(Boolean);
  const [active, setActive] = useState(null);
  const [selected, setSelected] = useState(null); // floor whose plan overlay is open
  const [pano, setPano] = useState(null); // { floorNum, regionName } open in 360°

  // the project plate hangs off the photo's own crop, not off the viewport —
  // measured here so the hook order stays stable for the "coming soon" branch
  const coverBox = useCoverBox(aspectFromViewBox(view?.viewBox));
  const plateScale = uiScaleFor(coverBox);

  const activeFloor = view?.floors.find((f) => f.num === active) ?? null;
  const selectedFloor = view?.floors.find((f) => f.num === selected) ?? null;
  const panoFloor = pano
    ? (view?.floors.find((f) => f.num === pano.floorNum) ?? null)
    : null;

  const getOrdinalFloor = (num) => {
    if (num === null || num === undefined) return "";
    const mod100 = num % 100;
    let suffix = "th";
    if (mod100 < 11 || mod100 > 13) {
      switch (num % 10) {
        case 1:
          suffix = "st";
          break;
        case 2:
          suffix = "nd";
          break;
        case 3:
          suffix = "rd";
          break;
        default:
          suffix = "th";
          break;
      }
    }
    return `${num}${suffix} Floor`;
  };

  const floorTitleOf = (f) =>
    f
      ? f.isTerrace
        ? "Terrace"
        : f.isGround
          ? "Ground Floor"
          : getOrdinalFloor(f.num)
      : "";

  /* ----- building art not added yet ----- */
  if (!view) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-[#f3ede0] text-[#3b5382]">
        <Link
          to="/"
          className="group absolute top-6 left-6 z-20 inline-flex items-center gap-2 text-xl font-medium tracking-wide text-[#3b5382] transition-colors hover:text-[#b8860b] md:top-8 md:left-12"
        >
          <span className="transition-transform duration-300 group-hover:-translate-x-1">
            ←
          </span>
          Back to map
        </Link>

        <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <p className="text-[11px] tracking-[4px] text-[#4E5157]/70 uppercase">
            Views coming soon
          </p>
          <h2 className="mt-3 font-serif text-3xl text-[#3b5382] italic md:text-4xl">
            {building ? building.name : "This project"}
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-[#4E5157]/90">
            The floor plates for this building are being prepared. Explore Notan
            DC in the meantime, or head back to the map.
          </p>
          <Link
            to="/projects/notan-dc"
            className="mt-6 inline-flex items-center gap-1.5 rounded-sm border border-[#3b5382]/35 bg-[#fdfaf3]/80 px-5 py-2.5 text-sm font-medium text-[#3b5382] transition-colors hover:border-[#b8860b] hover:text-[#b8860b]"
          >
            View Notan DC →
          </Link>
        </div>
      </div>
    );
  }

  /* ----- interactive full-screen building view ----- */
  return (
    <div
      className="relative h-screen w-full overflow-hidden bg-[#dfe7ee] text-[#1f2a40]"
      style={{ fontFamily: '"Times New Roman", Times, serif' }}
    >
      {/* full-bleed building photo */}
      <img
        src={view.viewImg}
        alt={building ? building.name : "Building"}
        draggable="false"
        className="absolute inset-0 h-full w-full object-cover select-none"
      />

      {/* floor overlay — slice matches the photo's object-cover crop */}
      <div className="pointer-events-none absolute inset-0 z-20 h-full w-full">
        {view.floors.map((f) => {
          const isActive = f.num === active;
          const common = {
            pointerEvents: "all",
            vectorEffect: "non-scaling-stroke",
            style: {
              cursor: "pointer",
              fill: isActive ? "rgba(7,11,23,0.55)" : "rgba(59,83,130,0.001)",
              stroke: isActive ? "#070B17" : "rgba(255,255,255,0.001)",
              strokeWidth: isActive ? 2.5 : 1,
              transition: "fill 0.25s ease, stroke 0.25s ease",
            },
            onMouseEnter: () => setActive(f.num),
            onMouseLeave: () =>
              setActive((cur) => (cur === f.num ? null : cur)),
            onClick: () => setSelected(f.num),
          };

          return (
            <svg
              key={f.num}
              viewBox={f.shapes[0].viewBox || view.viewBox}
              preserveAspectRatio="xMidYMid slice"
              className="absolute inset-0 h-full w-full"
            >
              {/* a floor drawn in several pieces (Tides' L-shaped plan) shares
                  one hover state, so all of it lights at once */}
              {f.shapes.map((s, i) =>
                s.type === "polygon" ? (
                  <polygon key={i} points={s.points} {...common} />
                ) : (
                  <path key={i} d={s.d} {...common} />
                ),
              )}
            </svg>
          );
        })}
      </div>

      {/* back to map */}
      <Link
        to="/"
        className="group absolute top-6 left-6 inline-flex items-center gap-2 border border-[#212C42] bg-[#3a3d43] px-4 py-2 text-xs tracking-[0.2em] text-white uppercase shadow-[0_10px_24px_rgba(184,134,11,0.22)] transition-colors hover:border-[#767889] hover:bg-[#4E5157] md:top-8 md:left-12"
      >
        <span className="transition-transform duration-300 group-hover:-translate-x-1">
          ←
        </span>
        Back
      </Link>

      {/* project mark, address and amenities — one centred plate anchored to
          the photo itself, so they stay together at every size (ProjectPlate) */}
      <ProjectPlate
        id={id}
        name={building ? building.name : "Building"}
        subtitle={
          building ? building.subtitle || `${building.area}, Mumbai` : null
        }
        amenities={amenities}
        plate={view.plate}
        box={coverBox}
      />

      {/* brand mark, top-right */}
      <NotandasNMark
        className={
          view.nMarkClass ||
          "absolute top-4 right-5 z-20 h-32 w-20 opacity-95 md:-top-6 md:-right-2 md:h-40 md:w-24 xl:-top-7 xl:-right-2 xl:h-48 xl:w-28 2xl:-top-8 2xl:-right-5 2xl:h-56 2xl:w-32 3xl:-top-8 3xl:-right-3 3xl:h-64 3xl:w-36 4xl:-top-10 4xl:-right-6 4xl:h-80 4xl:w-46 5xl:-top-14 5xl:-right-8 5xl:h-112 5xl:w-64"
        }
        fill={view.nMarkFill || "white"}
        aria-label={building ? building.name : "Notandas Realty"}
      />

      {/* right-side floor readout — its placement is still per-project, but it
          takes the plate's type scale so the two stay in proportion once the
          screen runs past 1920 */}
      <aside
        className={`absolute z-20 ${view.asideClass || "top-1/2 left-[65%] -translate-y-1/2 md:right-12"}`}
        style={{ fontSize: `${plateScale * 16}px`, width: "11em" }}
      >
        <div
          className="rounded-sm text-center"
          style={{ padding: "1.5em 1.25em" }}
        >
          <p
            className="text-[#1f2a40] uppercase"
            style={{ fontSize: "1.25em", letterSpacing: "0.15em" }}
          >
            {activeFloor ? "Now viewing Floor:" : "Pick a floor"}
          </p>

          <div
            className="flex flex-col items-center justify-center"
            style={{ marginTop: "0.75em", minHeight: "5.5em" }}
          >
            {activeFloor ? (
              <span
                className="font-serif leading-none text-[#4E5157] italic"
                style={{ fontSize: "3.75em" }}
              >
                {activeFloor.isTerrace
                  ? "T"
                  : activeFloor.isGround
                    ? "G"
                    : String(activeFloor.num).padStart(2, "0")}
              </span>
            ) : (
              <span
                className="font-serif leading-none text-[#1f2a40]/25 italic"
                style={{ fontSize: "3em" }}
              >
                —
              </span>
            )}
          </div>

          {/* <div className="my-4 border-t border-dashed border-[#1f2a40]/25" /> */}

          {/* <p className="text-[14px] leading-snug text-[#1f2a40]/75">
            {activeFloor
              ? "Click to open floor plan"
              : `${view.floors.length} floors `}
          </p> */}
        </div>
      </aside>

      {/* floor-plan overlay — opens when a floor is clicked */}
      {selectedFloor && (
        <FloorPlanOverlay
          buildingId={id}
          buildingName={building ? building.name : "Building"}
          floor={selectedFloor}
          floors={view.floors}
          onSelectFloor={setSelected}
          onOpenPano={(regionName) =>
            setPano({ floorNum: selected, regionName })
          }
          onClose={() => setSelected(null)}
        />
      )}

      {/* 360° pano overlay — stacks on top of the plan when a room is clicked */}
      {panoFloor && (
        <PanoViewer
          key={`${pano.floorNum}-${pano.regionName ?? "floor"}`}
          buildingId={id}
          buildingName={building ? building.name : "Building"}
          floor={panoFloor}
          floors={view.floors}
          floorTitle={floorTitleOf(panoFloor)}
          pano={getRegionPano(id, panoFloor, pano.regionName)}
          regionName={pano.regionName}
          /* switching floors from inside the 360° opens that floor's default
             framing (a room's angles don't carry over) and moves the plan
             underneath along with it */
          onSelectFloor={(num) => {
            setSelected(num);
            setPano({ floorNum: num, regionName: null });
          }}
          onSelectRegion={(regionName) => {
            setPano({ floorNum: panoFloor.num, regionName });
          }}
          onClose={() => setPano(null)}
        />
      )}

      {/* {!selectedFloor && !panoFloor && (
        <img
          src="/Brainwing-logo.webp"
          alt="Brainwing logo"
          className="pointer-events-none fixed top-18 left-3 z-50 w-9 opacity-70 sm:top-20 sm:left-4 sm:w-10 md:top-auto md:right-5 md:bottom-6 md:left-auto md:w-14 md:opacity-80 lg:right-6 lg:w-46 xl:right-7 xl:w-50"
        />
      )} */}
    </div>
  );
};

export default BuildingPage;
