import { useState, useRef } from "react";
import { Link, useParams } from "react-router";
import { BUILDINGS } from "../Buildings/buildingsData";
import { BUILDING_VIEWS } from "./buildingViewsData";
import FloorPlanOverlay from "./FloorPlanOverlay";
import PanoViewer from "./PanoViewer";
import { getRegionPano } from "./panoData";
import brandLogo from "../../assets/notandaslogo.svg";
import dcLogo from "../../assets/Buildings_Logo/notan D.C. logo.svg";
import edgeLogo from "../../assets/Buildings_Logo/notan edge logo.svg";
import jewelLogo from "../../assets/Buildings_Logo/notan jewel logo.svg";
import spaceLogo from "../../assets/Buildings_Logo/notan spaces.svg";
import terraceLogo from "../../assets/Buildings_Logo/notan Terraces logo.svg";
import landsEndLogo from "../../assets/Buildings_Logo/notan Lands End logo.svg";
import viewsLogo from "../../assets/Buildings_Logo/notan Views logo.svg";
import finalLogo from "../../assets/Buildings_Logo/Notandas Final Logo.svg";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const BUILDING_LOGOS = {
  "notan-dc": dcLogo,
  "notan-edge": edgeLogo,
  "notan-jewel": jewelLogo,
  "notan-space": spaceLogo,
  "notan-terrace": terraceLogo,
  "notan-lands-end": landsEndLogo,
  "notan-views": viewsLogo,
  "notan-crown": finalLogo,
};

const BUILDING_AMINITIES = {
  "notan-dc": {
    1: "Lobby & Reception ",
    2: " Rooftop Pool & Jacuzzi ",
    3: "Rooftop Cabana & Sunset Deck ",
    4: "Rooftop Bar | Fully Equipped Fitness Centre | Business Centre",
  },

  "notan-space": {
    1: "Grand lobby with reception and lounge",
    2: " Ground-floor café and lounge",
    3: "Private pantry and washroom in every unit",
    4: "3 high-speed elevators + separate service/fire elevator",
  },

  "notan-jewel": {
    1: "Signature Lobby Lounge",
    2: " Dedicated Reception Desks",
    3: "Intelligent Car Tower Parking",
    4: "3 high-speed elevators + Refuge Zones & Double-Height Deck",
  },
};

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
  const logoSrc = BUILDING_LOGOS[id] || brandLogo;
  const amenities = Object.values(BUILDING_AMINITIES[id] || {})
    .flatMap((item) => item.split("|"))
    .map((item) => item.trim())
    .filter(Boolean);
  const amenityRef = useRef(null);
  const hasAmenities = amenities.length > 0;
  const [active, setActive] = useState(null);
  const [selected, setSelected] = useState(null); // floor whose plan overlay is open
  const [pano, setPano] = useState(null); // { floorNum, regionName } open in 360°

  const headerRef = useRef(null);

  const activeFloor = view?.floors.find((f) => f.num === active) ?? null;
  const selectedFloor = view?.floors.find((f) => f.num === selected) ?? null;
  const panoFloor = pano
    ? (view?.floors.find((f) => f.num === pano.floorNum) ?? null)
    : null;

  const floorTitleOf = (f) =>
    f
      ? f.isTerrace
        ? "Terrace"
        : f.isGround
          ? "Ground Floor"
          : `Floor ${String(f.num).padStart(2, "0")}`
      : "";

  useGSAP(
    () => {
      gsap.from("p, h1", {
        x: 50,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: "power4.out",
        delay: 1.6, // wait for the page transition "ink" wave to recede
      });
    },
    { scope: headerRef },
     
    
  );

  useGSAP(
   
    () => {
      const tl = gsap.timeline();
      tl.from(amenityRef.current, {
        y: 20,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out",
        delay: 1.6, // wait for the page transition "ink" wave to recede
      })
       .from("li", {
        y: 20,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: "power4.out",
     
      });
      return () =>  tl.kill();

    },
    { scope: amenityRef },
  );

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
      <div className="pointer-events-none absolute inset-0 h-full w-full">
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
        className="group absolute top-6 left-6 inline-flex items-center gap-2 border border-[#212C42] bg-[#212C42] px-4 py-2 text-xs tracking-[0.2em] text-white uppercase shadow-[0_10px_24px_rgba(184,134,11,0.22)] transition-colors hover:border-[#e5ad2b] hover:bg-[#c49833] md:top-8 md:left-12"
      >
        <span className="transition-transform duration-300 group-hover:-translate-x-1">
          ←
        </span>
        Back
      </Link>

      {/* big centered project title */}
      <header
        ref={headerRef}
        className={`pointer-events-none absolute z-20 flex flex-col items-center text-center ${view.headerClass || "top-36 left-80 md:top-127 lg:top-70 lg:left-36 xl:top-90 xl:left-40 2xl:top-90 2xl:left-64 3xl:top-127 3xl:left-80 4xl:top-150 4xl:left-137"}`}
      >
        <h1 className="mt-1 text-3xl leading-none font-light tracking-[0.18em] text-[#1f2a40] uppercase sm:text-4xl md:text-6xl md:tracking-[0.22em] lg:text-4xl xl:text-[30px] 2xl:text-[35px] 4xl:text-[66px]">
          {building ? building.name : "Building"}
        </h1>
        {building && (
          <p className="mt-2 text-[10px] tracking-[0.45em] text-[#1f2a40]/70 uppercase md:text-sm xl:text-[10px]">
            {building.area}, Mumbai
          </p>
        )}
      </header>

      {/* brand mark, top-right */}
      <img
        src={logoSrc}
        alt={building ? building.name : "Notandas Realty"}
        className="absolute top-6 right-6 z-20 h-34 w-35 opacity-90 md:top-8 md:right-12 md:h-25"
      />

      {/* right-side floor readout */}
      <aside
        className={`absolute z-20 w-36 ${view.asideClass || "top-1/2 left-[65%] -translate-y-1/2 md:right-12 md:w-44"}`}
      >
        <div className="rounded-sm px-5 py-6 text-center">
          <p className="text-[20px] tracking-[3px] text-[#1f2a40]/70 uppercase">
            {activeFloor ? "Now viewing" : "Pick a floor"}
          </p>

          <div className="mt-3 flex min-h-22 flex-col items-center justify-center">
            {activeFloor ? (
              <>
                <span className="font-serif text-6xl leading-none text-[#b8860b] italic">
                  {activeFloor.isTerrace
                    ? "T"
                    : activeFloor.isGround
                      ? "G"
                      : String(activeFloor.num).padStart(2, "0")}
                </span>
                <span className="mt-2 text-sm font-medium tracking-wide text-[#1f2a40]">
                  {activeFloor.label}
                </span>
              </>
            ) : (
              <span className="font-serif text-5xl leading-none text-[#1f2a40]/25 italic">
                —
              </span>
            )}
          </div>

          <div className="my-4 border-t border-dashed border-[#1f2a40]/25" />

          <p className="text-[14px] leading-snug text-[#1f2a40]/75">
            {activeFloor
              ? "Click to open floor plan"
              : `${view.floors.length} floors · ground to terrace`}
          </p>
        </div>
      </aside>

      {hasAmenities && (
        <section
          ref={amenityRef}
          className={`pointer-events-none absolute ${view.amenityClass || "bottom-55 left-75 "} sm:w-[min(28rem,44vw) ] z-20 w-[calc(100%-2.5rem)] max-w-md border border-[#1f2a40]/15 bg-[#fdfaf3]/85 px-6 py-5 text-[#1f2a40] shadow-[0_10px_30px_rgba(31,42,64,0.10)] backdrop-blur-sm lg:bottom-15 lg:left-15 lg:h-52 lg:w-90 3xl:bottom-59 3xl:left-87 3xl:h-65`}
        >
          <p className="text-[11px] tracking-[0.42em] text-[#1f2a40]/70 uppercase">
            Amenities
          </p>
          <div className="mt-2 h-px w-10 bg-[#b8860b]/80" />
          <ul className="mt-3 divide-y divide-[#1f2a40]/10 text-sm leading-snug text-[#1f2a40]/85">
            {amenities.map((amenity) => (
              <li key={amenity} className="flex items-baseline gap-3 py-1.5">
                <span className="h-1 w-1 shrink-0 rotate-45 bg-[#b8860b]" />
                <span>{amenity}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

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
