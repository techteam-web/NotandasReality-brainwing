import { useState , useRef} from "react";
import { Link, useParams } from "react-router";
import { BUILDINGS } from "../Buildings/buildingsData";
import { BUILDING_VIEWS } from "./buildingViewsData";
import FloorPlanOverlay from "./FloorPlanOverlay";
import PanoViewer from "./PanoViewer";
import { getRegionPano } from "./panoData";
import brandLogo from "../../assets/nuthandasReality.svg";
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

/**
 * The "View Project" destination.
 *
 * Full-bleed building photo (from ViewsBuildings) with the project title set
 * large across the top and the Notandas mark in the corner — a hero shot,
 * like a brochure cover. Every floor cut-out (Building_Floor_SVG) is laid
 * over the photo in the same coordinate space, so the shapes sit exactly on
 * their real floors. Hovering a floor lights it gold and reveals its number
 * on the right-hand readout.
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
  const [active, setActive] = useState(null);
  const [selected, setSelected] = useState(null); // floor whose plan overlay is open
  const [pano, setPano] = useState(null); // { floorNum, regionName } open in 360°

  const headerRef = useRef(null);

  const activeFloor = view?.floors.find((f) => f.num === active) ?? null;
  const selectedFloor = view?.floors.find((f) => f.num === selected) ?? null;
  const panoFloor = pano
    ? view?.floors.find((f) => f.num === pano.floorNum) ?? null
    : null;

  const floorTitleOf = (f) =>
    f
      ? f.isTerrace
        ? "Terrace"
        : f.isGround
          ? "Ground Floor"
          : `Floor ${String(f.num).padStart(2, "0")}`
      : "";

  useGSAP(() => {
    gsap.from("p, h1", {
      x: 50,
      opacity: 0,
      duration: 1.2,
      stagger: 0.15,
      ease: "power4.out",
      delay: 1.6 // wait for the page transition "ink" wave to recede
    });
  }, { scope: headerRef });

  /* ----- building art not added yet ----- */
  if (!view) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-[#f3ede0] text-[#3b5382]">
        <Link
          to="/"
          className="group absolute left-6 top-6 z-20 inline-flex items-center gap-2 text-xl font-medium tracking-wide text-[#3b5382] transition-colors hover:text-[#b8860b] md:left-12 md:top-8"
        >
          <span className="transition-transform duration-300 group-hover:-translate-x-1">
            ←
          </span>
          Back to map
        </Link>

        <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <p className="text-[11px] uppercase tracking-[4px] text-[#4E5157]/70">
            Views coming soon
          </p>
          <h2 className="mt-3 font-serif text-3xl italic text-[#3b5382] md:text-4xl">
            {building ? building.name : "This project"}
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-[#4E5157]/90">
            The floor plates for this building are being prepared. Explore
            Notan DC in the meantime, or head back to the map.
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
    <div className="relative h-screen w-full overflow-hidden bg-[#dfe7ee] text-[#1f2a40]">
      {/* full-bleed building photo */}
      <img
        src={view.viewImg}
        alt={building ? building.name : "Building"}
        draggable="false"
        className="absolute inset-0 h-full w-full select-none object-cover"
      />

      {/* floor overlay — slice matches the photo's object-cover crop */}
      <div className="absolute inset-0 h-full w-full pointer-events-none">
        {view.floors.map((f) => {
          const isActive = f.num === active;
          const common = {
            pointerEvents: "all",
            vectorEffect: "non-scaling-stroke",
            style: {
              cursor: "pointer",
              fill: isActive
                ? "rgba(218,165,32,0.42)"
                : "rgba(59,83,130,0.001)",
              stroke: isActive ? "#DAA520" : "rgba(255,255,255,0.001)",
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
              viewBox={f.shape.viewBox || view.viewBox}
              preserveAspectRatio="xMidYMid slice"
              className="absolute inset-0 h-full w-full"
            >
              {f.shape.type === "polygon" ? (
                <polygon points={f.shape.points} {...common} />
              ) : (
                <path d={f.shape.d} {...common} />
              )}
            </svg>
          );
        })}
      </div>

      {/* back to map */}
      <Link
        to="/"
        className="group absolute left-6 top-6 z-20 inline-flex items-center gap-2 text-xl font-medium tracking-wide text-[#1f2a40] drop-shadow-[0_1px_2px_rgba(255,255,255,0.6)] transition-colors hover:text-[#b8860b] md:left-12 md:top-8"
      >
        <span className="transition-transform duration-300 group-hover:-translate-x-1">
          ←
        </span>
        Back to map
      </Link>

      {/* big centered project title */}
      <header ref={headerRef} className="pointer-events-none absolute left-80 top-36 z-20 flex flex-col items-center text-center md:top-127 ">
        <p className="font-serif text-base italic text-[#1f2a40]/80 md:text-lg">
          Notandas
        </p>
        <h1 className="mt-1 text-3xl font-light uppercase leading-none tracking-[0.18em] text-[#1f2a40] sm:text-4xl md:text-6xl md:tracking-[0.22em]">
          {building ? building.name : "Building"}
        </h1>
        {building && (
          <p className="mt-2 text-[10px] uppercase tracking-[0.45em] text-[#1f2a40]/70 md:text-sm">
            {building.area}, Mumbai
          </p>
        )}
      </header>

      {/* brand mark, top-right */}
      <img
        src={brandLogo}
        alt="Notandas Reality"
        className="absolute right-6 top-6 z-20 h-4 w-auto opacity-90 md:right-12 md:top-8 md:h-35"
      />

      {/* right-side floor readout */}
      <aside className="absolute right-6 top-1/2 z-20 w-36 -translate-y-1/2 md:right-12 md:w-44">
        <div className="rounded-sm border border-white/40 bg-white/55 px-5 py-6 text-center shadow-[0_12px_30px_rgba(31,42,64,0.25)] backdrop-blur-md">
          <p className="text-[10px] uppercase tracking-[3px] text-[#1f2a40]/70">
            {activeFloor ? "Now viewing" : "Hover a floor"}
          </p>

          <div className="mt-3 flex min-h-22 flex-col items-center justify-center">
            {activeFloor ? (
              <>
                <span className="font-serif text-6xl italic leading-none text-[#b8860b]">
                  {activeFloor.isTerrace
                    ? "✦"
                    : activeFloor.isGround
                      ? "G"
                      : String(activeFloor.num).padStart(2, "0")}
                </span>
                <span className="mt-2 text-sm font-medium tracking-wide text-[#1f2a40]">
                  {activeFloor.label}
                </span>
              </>
            ) : (
              <span className="font-serif text-5xl italic leading-none text-[#1f2a40]/25">
                —
              </span>
            )}
          </div>

          <div className="my-4 border-t border-dashed border-[#1f2a40]/25" />

          <p className="text-[11px] leading-snug text-[#1f2a40]/75">
            {activeFloor
              ? "Click to open floor plan"
              : `${view.floors.length} floors · ground to terrace`}
          </p>
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
          buildingName={building ? building.name : "Building"}
          floor={panoFloor}
          floorTitle={floorTitleOf(panoFloor)}
          pano={getRegionPano(id, panoFloor, pano.regionName)}
          regionName={pano.regionName}
          onClose={() => setPano(null)}
        />
      )}
    </div>
  );
};

export default BuildingPage;
