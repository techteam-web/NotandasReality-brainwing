import { useState, useRef } from "react";
import { Link, useParams } from "react-router";
import { BUILDINGS } from "../Buildings/buildingsData";
import { BUILDING_VIEWS } from "./buildingViewsData";
import FloorPlanOverlay from "./FloorPlanOverlay";
import PanoViewer from "./PanoViewer";
import { getRegionPano } from "./panoData";
import NotandasNMark from "../SvgAnimations/NotandasNMark";
import { BUILDING_LOGOS, TIGHT_CROPPED_LOGOS } from "./buildingLogos";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const BUILDING_AMINITIES = {
  "notan-dc": {
    1: "Lobby & Reception",
    2: "Rooftop Pool & Jacuzzi",
    3: "Rooftop Cabana & Sunset Deck",
    4: "Rooftop Bar | Fully Equipped Fitness Centre | Business Centre",
  },

  "notan-space": {
    1: "Grand lobby with reception and lounge",
    2: " Ground-floor café and lounge",
    3: "Private pantry and washroom in every unit",
    4: "3 high-speed elevators",
    5: "Separate service/fire elevator",
  },

  "notan-jewel": {
    1: "Signature Lobby Lounge",
    2: " Dedicated Reception Desks",
    3: "Intelligent Car Tower Parking",
    4: "3 high-speed elevators ",
    5 :"Refuge Zones & Double-Height Deck",
  },
  "notan-terrace": {
    1: "24-Hour Security & Surveillance",
    2: "Hospitality & Concierge Services",
    3: "6-Metre-Wide Access Ramp & Basement Parking",
    4: "High-Speed Passenger Elevators & Dedicated Service Lift ",
    5: "Outdoor Leisure Decks , Coffee Lounge & Bar",
    6 : "Fully Equipped Fitness Centre" ,
    7 : "Spa & Wellness services",
    8 : "Open to Sky Pool"
  },
  "notan-edge": {
    1: "DOUBLE-HEIGHT ENTRANCE LOBBY",
    2: "STATE-OF-THE-ART PARKING & CAR LIFT ACCESS",
    3: "FLEXIBLE WORKSPACES",
    4: "PREMIUM SECURITY & MANAGEMENT",
    5: "ENERGY EFFICIENCY",
    6 : "HIGH-SPEED ELEVATORS" ,
    7 : "DOUBLE-GLAZED FAÇADE SYSTEM",
    8 : "CURATED F&B SPACES",
    9 : "LARGE COLUMNLESS FLOOR PLATE",
  }
};

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
  const projectLogo = BUILDING_LOGOS[id] ?? null;
  const logoIsTight = TIGHT_CROPPED_LOGOS.has(id);
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
                ? "rgba(7,11,23,0.55)"
                : "rgba(59,83,130,0.001)",
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
        className="group absolute top-6 left-6 inline-flex items-center gap-2 border border-[#212C42] bg-[#3a3d43] px-4 py-2 text-xs tracking-[0.2em] text-white uppercase shadow-[0_10px_24px_rgba(184,134,11,0.22)] transition-colors hover:border-[#767889] hover:bg-[#4E5157] md:top-8 md:left-12"
      >
        <span className="transition-transform duration-300 group-hover:-translate-x-1">
          ←
        </span>
        Back
      </Link>

      {/* big centered project logo (name as text when no dedicated mark) */}
      <header
        ref={headerRef}
        className={`pointer-events-none absolute z-20 flex flex-col items-center text-center ${view.headerClass || "top-36 left-80 md:top-127 lg:top-70 lg:left-36 xl:top-90 xl:left-40 2xl:top-90 2xl:left-64 3xl:top-127 3xl:left-80 4xl:top-150 4xl:left-137"}`}
      >
        {projectLogo ? (
          <h1 className="mt-1">
            {/* Square marks sit in the middle ~40% of their canvas — the
               negative margins swallow the transparent padding so the logo
               occupies the same slot the text title did. Tight-cropped marks
               (Crown's landscape PNG) have no padding, so they render at a
               smaller box with normal margins. */}
            <img
              src={projectLogo}
              alt={building ? building.name : "Building"}
              draggable="false"
              className={`h-auto xl:h-50 lg:h-70 2xl:h-75 4xl:h-120 max-w-[80vw] select-none ${
                view.headerLogoClass ||
                (logoIsTight
                  ? "w-44 sm:w-52 md:w-72 lg:w-56 xl:w-48 2xl:w-56 4xl:w-96"
                  : "my-[-30%] w-64 sm:w-72 md:w-100 lg:w-76 xl:w-68 2xl:w-76 4xl:w-130")
              }`}
            />
          </h1>
        ) : (
          <h1
            className={`mt-1 text-3xl leading-none font-light tracking-[0.18em] text-[#1f2a40] uppercase sm:text-4xl md:text-6xl md:tracking-[0.22em] lg:text-4xl xl:text-[30px] 2xl:text-[35px] 4xl:text-[66px] ${
              view.headerTitleClass || ""
            }`}
          >
            {building ? building.name : "Building"}
          </h1>
        )}
        {building && (
          <p
            className={`mt-2 text-[10px] tracking-[0.45em] text-[#1f2a40] border-y p-2 uppercase md:text-sm xl:text-[10px] ${
              view.headerSubClass || ""
            }`}
          >
            {building.subtitle || `${building.area}, Mumbai`}
          </p>
        )}
      </header>

      {/* brand mark, top-right */}
      <NotandasNMark
        className={
          view.nMarkClass ||
          "absolute top-4 right-5 z-20 h-32 w-20 opacity-95 md:-top-6 md:-right-2 md:h-40 md:w-24 xl:-top-7 xl:-right-2 xl:h-48 xl:w-28 2xl:-top-8 2xl:-right-5 2xl:h-56 2xl:w-32 3xl:-top-8 3xl:-right-3 "
        }
        fill={view.nMarkFill || "white"}
        aria-label={building ? building.name : "Notandas Realty"}
      />

      {/* right-side floor readout */}
      <aside
        className={`absolute z-20 w-36 ${view.asideClass || "top-1/2 left-[65%] -translate-y-1/2 md:right-12 md:w-44"}`}
      >
        <div className="rounded-sm px-5 py-6 text-center">
          <p className="text-[20px] tracking-[3px] text-[#1f2a40] uppercase">
            {activeFloor ? "Now viewing Floor:": "Pick a floor"}
          </p>

          <div className="mt-3 flex min-h-22 flex-col items-center justify-center">
            {activeFloor ? (
              <>
                <span className="font-serif text-6xl leading-none text-[#4E5157] italic">
                  {activeFloor.isTerrace
                    ? "T"
                    : activeFloor.isGround
                      ? "G"
                      : String(activeFloor.num).padStart(2, "0")}
                </span>
                
              </>
            ) : (
              <span className="font-serif text-5xl leading-none text-[#1f2a40]/25 italic">
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

      {hasAmenities && (
        <div
          ref={amenityRef}
          className={`pointer-events-none absolute z-20 ${
            view.amenityClass ||
            "bottom-55 left-75 w-[calc(100%-2.5rem)] max-w-xl sm:max-w-2xl lg:max-w-3xl"
          }`}
        >
          <section className="px-5 py-3 text-center">
            <div className="inline-flex flex-col items-center">
              <p className="text-[11px] tracking-[0.42em] text-[#3a3935] uppercase">
                Amenities
              </p>
              <div className="mt-2 h-px w-10 bg-[#595753]" />
              <ul
                className={`mt-2.5 flex flex-wrap items-center justify-center gap-y-1 text-base leading-snug text-black sm:text-lg ${
                  view.amenityListClass || "max-w-lg"
                }`}
              >
                {amenities.map((amenity) => (
                  <li
                    key={amenity}
                    className={` after:mx-2 after:text-black/40 after:content-['|'] last:after:content-none mix-blend-multiply ${
                      view.amenityItemClass ||
                      "lg:text-[16px] xl:text-[15.5px] 2xl:text-[15.2px] 3xl:text-[18px] 4xl:text-[25px]"
                    }`}
                  >
                    {amenity}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
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
