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
import { BUILDING_AMINITIES } from "./AmenitiesData";
import ImageStage from "./ImageStage";
import { ratioFromViewBox } from "./floorGeometry";

/**
 * Type and spacing for the blocks that live on the stage, in cqw — one cqw is
 * one percent of the photo's width, so every number here is a fixed fraction
 * of the building photo and grows with it. Same content on every building
 * (a floor readout is a floor readout), so these are shared; what does differ
 * per building lives in BUILDING_VIEWS.
 *
 * scripts/stage-constraints.mjs re-measures the blocks from these numbers —
 * change one here and change it there, then re-run the script.
 */
const STAGE_TYPE = {
  asideLabel: "text-[0.95cqw] leading-[1.2] tracking-[0.16em]",
  asideGap: "mt-[0.9cqw]",
  asideNumRow: "min-h-[4.4cqw]",
  asideNum: "text-[4cqw] leading-none",
  amenityLabel: "text-[0.75cqw] leading-[1.2] tracking-[0.42em]",
  amenityRule: "mt-[0.6cqw] h-px w-[2.6cqw]",
  amenityList: "mt-[0.7cqw] gap-y-[0.25cqw] leading-[1.35]",
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

  /* The photo's aspect ratio drives the stage. The viewBox already matches the
     photo — that is why the floor cut-outs land on their floors — so it is the
     right first guess and there is no jump on first paint; the <img> then
     reports its true ratio and we keep that, per building, for the rest of the
     session. Navigating between projects swaps `id` without remounting, hence
     the map rather than a single number. */
  const [naturalRatios, setNaturalRatios] = useState({});
  const ar = naturalRatios[id] ?? ratioFromViewBox(view?.viewBox);
  const staged = Boolean(view?.stage);

  const readNaturalRatio = (e) => {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
    if (!w || !h) return;
    setNaturalRatios((prev) =>
      prev[id] === w / h ? prev : { ...prev, [id]: w / h },
    );
  };

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

  /* Both intros are keyed on `id`: /projects/notan-dc → /projects/notan-edge
     swaps the params without remounting this component, so an empty dependency
     list would play the animation for the first building visited and never
     again. The targets are always INSIDE the ref, never the ref itself — the
     scope node is what carries the stage's -translate-x-1/2/-translate-y-1/2,
     and GSAP writing `transform` on it would wipe that out and drop the block
     half its own height. */
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
    { scope: headerRef, dependencies: [id] },
  );

  useGSAP(
    () => {
      if (!amenityRef.current) return undefined;

      const tl = gsap.timeline();
      tl.from(amenityRef.current, {
        y: 20,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out",
        delay: 1.6, // wait for the page transition "ink" wave to recede
      }).from("li", {
        y: 20,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: "power4.out",
      });
      return () => tl.kill();
    },
    { scope: amenityRef, dependencies: [id] },
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

  /* The project's mark over its subtitle. On the stage the logo is sized once,
     in cqw, with negative margins that trim its artboard's transparent padding
     away — one width class instead of a width AND a height fighting it. */
  const headerBlock = (
    <header
      ref={headerRef}
      className={`pointer-events-none absolute z-20 flex flex-col items-center text-center ${
        staged
          ? `-translate-x-1/2 -translate-y-1/2 ${view.headerClass}`
          : view.headerClass ||
            "top-36 left-80 md:top-127 lg:top-70 lg:left-36 xl:top-90 xl:left-40 2xl:top-90 2xl:left-64 3xl:top-127 3xl:left-80 4xl:top-150 4xl:left-137"
      }`}
    >
      {projectLogo ? (
        <h1 className={staged ? "" : "mt-1"}>
          {/* Square marks sit in the middle ~40% of their canvas — the
             negative margins swallow the transparent padding so the logo
             occupies the same slot the text title did. Tight-cropped marks
             (Crown's landscape PNG) have no padding, so they render at a
             smaller box with normal margins. */}
          <img
            src={projectLogo}
            alt={building ? building.name : "Building"}
            draggable="false"
            className={
              staged
                ? `block h-auto select-none ${view.headerLogoClass}`
                : `h-auto max-w-[80vw] select-none lg:h-70 xl:h-50 2xl:h-75 4xl:h-120 ${
                    view.headerLogoClass ||
                    (logoIsTight
                      ? "w-44 sm:w-52 md:w-72 lg:w-56 xl:w-48 2xl:w-56 4xl:w-96"
                      : "my-[-30%] w-64 sm:w-72 md:w-100 lg:w-76 xl:w-68 2xl:w-76 4xl:w-130")
                  }`
            }
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
          className={
            staged
              ? `text-[#1f2a40] uppercase ${view.headerSubClass}`
              : `mt-2 p-2 text-[10px] tracking-[0.45em] text-[#1f2a40] uppercase md:text-sm xl:text-[10px] ${
                  view.headerSubClass || ""
                }`
          }
        >
          {building.subtitle || `${building.area}, Mumbai`}
        </p>
      )}
    </header>
  );

  /* Which floor the cursor is on. Never takes pointer events — it sits over
     the floor cut-outs, and swallowing hover there would kill the hover it is
     reporting on. */
  const asideBlock = (
    <aside
      className={
        staged
          ? `pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 ${view.asideClass}`
          : `absolute z-20 w-36 ${view.asideClass || "top-1/2 left-[65%] -translate-y-1/2 md:right-12 md:w-44"}`
      }
    >
      <div
        className={staged ? "text-center" : "rounded-sm px-5 py-6 text-center"}
      >
        <p
          className={`text-[#1f2a40] uppercase ${
            staged ? STAGE_TYPE.asideLabel : "text-[20px] tracking-[3px]"
          }`}
        >
          {activeFloor ? "Now viewing Floor:" : "Pick a floor"}
        </p>

        <div
          className={`flex flex-col items-center justify-center ${
            staged
              ? `${STAGE_TYPE.asideGap} ${STAGE_TYPE.asideNumRow}`
              : "mt-3 min-h-22"
          }`}
        >
          {activeFloor ? (
            <span
              className={`font-serif text-[#4E5157] italic ${
                staged ? STAGE_TYPE.asideNum : "text-6xl leading-none"
              }`}
            >
              {activeFloor.isTerrace
                ? "T"
                : activeFloor.isGround
                  ? "G"
                  : String(activeFloor.num).padStart(2, "0")}
            </span>
          ) : (
            <span
              className={`font-serif text-[#1f2a40]/25 italic ${
                staged ? STAGE_TYPE.asideNum : "text-5xl leading-none"
              }`}
            >
              —
            </span>
          )}
        </div>
      </div>
    </aside>
  );

  /* The amenity list. `amenityRef` is on an INNER wrapper on purpose: GSAP
     animates `y` on it, which means writing `transform`, and on the positioned
     node that would erase -translate-x-1/2/-translate-y-1/2 and drop the whole
     block half its height the moment the intro plays. */
  const amenityBlock = hasAmenities ? (
    <div
      className={
        staged
          ? `pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 ${view.amenityClass}`
          : `pointer-events-none absolute z-20 ${
              view.amenityClass ||
              "bottom-55 left-75 w-[calc(100%-2.5rem)] max-w-xl sm:max-w-2xl lg:max-w-3xl"
            }`
      }
    >
      <div ref={amenityRef}>
        <section
          className={
            staged
              ? "flex flex-col items-center text-center"
              : "px-5 py-3 text-center"
          }
        >
          <div
            className={
              staged ? "contents" : "inline-flex flex-col items-center"
            }
          >
            <p
              className={`text-[#3a3935] uppercase ${
                staged
                  ? STAGE_TYPE.amenityLabel
                  : "text-[11px] tracking-[0.42em]"
              }`}
            >
              Amenities
            </p>
            <div
              className={`bg-[#595753] ${
                staged ? STAGE_TYPE.amenityRule : "mt-2 h-px w-10"
              }`}
            />
            <ul
              className={
                staged
                  ? `flex flex-wrap items-center justify-center text-black ${STAGE_TYPE.amenityList} ${view.amenityListClass}`
                  : `mt-2.5 flex flex-wrap items-center justify-center gap-y-1 text-base leading-snug text-black sm:text-lg ${
                      view.amenityListClass || "max-w-lg"
                    }`
              }
            >
              {amenities.map((amenity) => (
                <li
                  key={amenity}
                  className={`mix-blend-multiply after:text-black/40 after:content-['|'] last:after:content-none ${
                    staged
                      ? view.amenityItemClass
                      : `after:mx-2 ${
                          view.amenityItemClass ||
                          "lg:text-[16px] xl:text-[15.5px] 2xl:text-[15.2px] 3xl:text-[18px] 4xl:text-[25px]"
                        }`
                  }`}
                >
                  {amenity}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  ) : null;

  /* The same three blocks, stacked instead of staged.
     `flow` fires when the viewport is too narrow a shape, too wide a shape, or
     simply too small for the photo to carry readable type — see index.css,
     where the thresholds are derived rather than picked. Below it the crop is
     eating whole blocks, and no placement value can fix that, so the text
     comes off the photo and reads as a page instead. */
  const flowPanel =
    "mx-auto max-w-lg rounded-sm bg-[#f3ede0]/80 px-6 py-7 text-center shadow-[0_10px_30px_rgba(31,42,64,0.10)] backdrop-blur-[2px]";

  const flowAbove = staged ? (
    <div className="hidden bg-[#dfe7ee] px-6 pt-12 pb-7 flow:block">
      <div className={flowPanel}>
        {projectLogo ? (
          /* The negative margins trim the mark's transparent artboard, same
             idea as on the stage — but as a percentage of this wrapper, which
             IS the logo's width, so one shared pair covers every mark. The
             square marks' padding runs 30–35%; a couple of percent out is a
             few pixels of whitespace in a stacked layout. */
          <div className="mx-auto w-[62%] max-w-[18rem]">
            <img
              src={projectLogo}
              alt={building ? building.name : "Building"}
              draggable="false"
              className="mt-[-33%] mb-[-32%] block h-auto w-full select-none"
            />
          </div>
        ) : (
          <h1 className="text-3xl leading-none font-light tracking-[0.18em] text-[#1f2a40] uppercase">
            {building ? building.name : "Building"}
          </h1>
        )}
        {building && (
          <p className="mt-5 text-[11px] tracking-[0.4em] text-[#1f2a40] uppercase">
            {building.subtitle || `${building.area}, Mumbai`}
          </p>
        )}
      </div>
    </div>
  ) : null;

  const flowBelow = staged ? (
    <div className="hidden bg-[#dfe7ee] px-6 pt-7 pb-12 flow:block">
      <div className={flowPanel}>
        <p className="text-[11px] tracking-[0.42em] text-[#1f2a40] uppercase">
          {activeFloor ? "Now viewing Floor:" : "Pick a floor"}
        </p>
        <p className="mt-2 font-serif text-5xl leading-none text-[#4E5157] italic">
          {activeFloor
            ? activeFloor.isTerrace
              ? "T"
              : activeFloor.isGround
                ? "G"
                : String(activeFloor.num).padStart(2, "0")
            : "—"}
        </p>

        {hasAmenities && (
          <>
            <p className="mt-8 text-[11px] tracking-[0.42em] text-[#3a3935] uppercase">
              Amenities
            </p>
            <div className="mx-auto mt-2 h-px w-10 bg-[#595753]" />
            {/* one per line — the pipe-separated wrap only reads well across
                the width the stage gives it */}
            <ul className="mt-4 flex flex-col gap-1.5 text-[15px] leading-snug text-[#1f2a40]">
              {amenities.map((amenity) => (
                <li key={amenity}>{amenity}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  ) : null;

  return (
    <div className="bg-[#dfe7ee]">
      {flowAbove}

      <div
        /* In flow mode the frame stops being the whole screen and becomes a
           picture on a page: its own aspect ratio, so the crop lets go and the
           whole building shows, floor cut-outs and all. A floor is a minimum
           height, or the photo would be a letterbox strip on a phone — cover
           and slice agree at any box shape, so the cut-outs stay on their
           floors either way. Only staged buildings get this: the other nine
           still position their text against the viewport, and reshaping the
           photo under them would make that worse, not better. */
        className={`relative h-screen w-full overflow-hidden bg-[#dfe7ee] text-[#1f2a40] ${
          staged
            ? "flow:aspect-[var(--photo-ar)] flow:h-auto flow:min-h-[55vh]"
            : ""
        }`}
        style={{
          fontFamily: '"Times New Roman", Times, serif',
          "--photo-ar": String(ar),
        }}
      >
        {/* full-bleed building photo */}
        <img
          src={view.viewImg}
          alt={building ? building.name : "Building"}
          draggable="false"
          onLoad={readNaturalRatio}
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

        {/* Not staged yet: the header keeps its old place in the paint order,
          just under the brand mark. */}
        {!staged && headerBlock}

        {/* brand mark, top-right */}
        <NotandasNMark
          className={
            view.nMarkClass ||
            "absolute top-4 right-5 z-20 h-32 w-20 opacity-95 md:-top-6 md:-right-2 md:h-40 md:w-24 xl:-top-7 xl:-right-2 xl:h-48 xl:w-28 2xl:-top-8 2xl:-right-5 2xl:h-56 2xl:w-32 3xl:-top-8 3xl:-right-3"
          }
          fill={view.nMarkFill || "white"}
          aria-label={building ? building.name : "Notandas Realty"}
        />

        {/* The hero text.

          Staged: laid out inside the photo's own rectangle, so every block is
          welded to a point on the building rather than to a corner of the
          window. The wrapper below is the frame's measuring box — it fills the
          frame exactly and carries `container-type: size`, which is what
          ImageStage measures its 100cqw/100cqh against. Keeping it separate
          from the frame itself matters: `container-type` brings size
          containment with it, and the frame is the containing block the
          floor-plan and 360° overlays position their `fixed inset-0` against.

          Not staged yet: rendered exactly where it always was, against the
          viewport, with the building's existing classes. */}
        {staged ? (
          <div
            className="pointer-events-none absolute inset-0 z-30 flow:hidden"
            style={{ containerType: "size" }}
          >
            <ImageStage ar={ar}>
              {headerBlock}
              {asideBlock}
              {amenityBlock}
            </ImageStage>
          </div>
        ) : (
          <>
            {asideBlock}
            {amenityBlock}
          </>
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

      {flowBelow}
    </div>
  );
};

export default BuildingPage;
