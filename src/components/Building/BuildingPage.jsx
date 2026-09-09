import { Fragment, useState, useRef } from "react";
import { Link, useParams } from "react-router";
import { BUILDINGS } from "../Buildings/buildingsData";
import { BUILDING_VIEWS } from "./buildingViewsData";
import FloorPlanOverlay from "./FloorPlanOverlay";
import PanoViewer from "./PanoViewer";
import { getRegionPano } from "./panoData";
import NotandasNMark from "../SvgAnimations/NotandasNMark";
import { BUILDING_LOGOS } from "./buildingLogos";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { BUILDING_AMINITIES } from "./AmenitiesData";
import ImageStage from "./ImageStage";
import { Chrome } from "../DesignStage";
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
/* How far the mark's ink sits above the "AMENITIES" caption, per breakpoint.
   Taken from Notan Terraces at 1920 — the composition the project signed off —
   and held proportional to the mark at every other width, so the spacing stops
   jumping between breakpoints the way the hand-tuned ladders did (Terraces
   itself ran 93px at 1280 and 244px at 1024 for the same relationship).
   Shared by every project; what differs per project is only how much subtitle
   sits inside that gap, which headerGapClass trims off. */
/* How far the address sits under the mark's ink. Shared, and proportional to
   the mark like the gap below it. Each project used to carry its own margin
   here (-mt-15 on Beach House, -mt-12 on Terraces) purely to cancel the
   transparent padding its artboard happened to have; the mark is trimmed to
   its ink now, so those numbers cancel nothing and only pull the address into
   the mark. Stripping them left every project's headerSubClass identical,
   which is the tell that they were never design values. */
const SUB_GAP =
  "mt-[9px] sm:mt-[11px] md:mt-[19px] lg:mt-[12px]";

const HEADER_GAP =
  "mb-[115px] sm:mb-[133px] md:mb-[194px] lg:mb-[140px]";

/* Notan Space is the one project already laid out on the stage, and its
   amenities panel carries none of the padding the other nine put above their
   caption — so the same margin would sit it 17px closer. Its own ladder makes
   up the difference; it is not a different design, just a different box. */
const HEADER_GAP_STAGED =
  "mb-[132px] sm:mb-[150px] md:mb-[211px] lg:mb-[157px]";

const STAGE_TYPE = {
  asideLabel: "text-[0.95cqw] leading-[1.2] tracking-[0.16em]",
  asideGap: "mt-[0.9cqw]",
  asideNumRow: "min-h-[4.4cqw]",
  asideNum: "text-[4cqw] leading-none",
  /* The one size here that is not cqw. This caption is the same word on every
     building, so it holds the same 11px the unstaged ones set below rather
     than growing with the photo and reading larger than all of them. */
  amenityLabel: "text-[11px] leading-[1.2] tracking-[0.42em]",
  amenityRule: "mt-[0.6cqw] h-px w-[2.6cqw]",
  amenityList: "mt-[0.7cqw] leading-[1.35]",
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
  const rawAmenityEntries = Object.values(BUILDING_AMINITIES[id] || {}).filter(
    Boolean,
  );
  const amenityLines = rawAmenityEntries.map((line) => {
    const hasTrailingPipe = line.trim().endsWith("|");
    const items = line
      .split("|")
      .map((item) => item.trim())
      .filter(Boolean);
    return { items, hasTrailingPipe };
  });
  const amenities = amenityLines.flatMap((line) => line.items);
  const amenityRef = useRef(null);
  const hasAmenities = amenityLines.length > 0;
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
      }).from(".amenity-line", {
        y: 15,
        opacity: 0,
        duration: 1.0,
        stagger: 0.12,
        ease: "power4.out",
      });
      return () => tl.kill();
    },
    { scope: amenityRef, dependencies: [id] },
  );

  /* ----- building art not added yet ----- */
  if (!view) {
    return (
      <div className="relative min-h-stage w-full overflow-hidden bg-[#f3ede0] text-[#3b5382]">
        <Link
          to="/"
          className="group absolute top-6 left-6 z-20 inline-flex items-center gap-2 text-xl font-medium tracking-wide text-[#3b5382] transition-colors hover:text-[#b8860b] md:top-8 md:left-12"
        >
          <span className="transition-transform duration-300 group-hover:-translate-x-1">
            ←
          </span>
          Back to map
        </Link>

        <div className="flex min-h-stage flex-col items-center justify-center px-6 text-center">
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
      className="pointer-events-none relative flex flex-col items-center text-center"
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
            className={`block h-auto max-w-[calc(80*var(--dvw))] select-none ${view.headerLogoClass} ${view.headerLogoTrim ?? ""} ${view.headerLogoNudge ?? ""}`}
          />
        </h1>
      ) : (
        <h1
          className={`mt-1 text-3xl leading-none font-light tracking-[0.18em] text-[#1f2a40] uppercase sm:text-4xl md:text-6xl md:tracking-[0.22em] lg:text-[35px] ${ view.headerTitleClass || "" }`}
        >
          {building ? building.name : "Building"}
        </h1>
      )}
      {building && (
        <p
          /* Out of flow on purpose. The header's height is then the mark's
             ink and nothing else, so the gap down to the amenities is exactly
             the wrapper's margin — the same on every project — instead of
             each project's own address line silently setting it. The address
             keeps its own per-project size and offset and lands where it
             always did, inside that gap. */
          className={`absolute top-full left-1/2 w-max -translate-x-1/2 p-2 text-[10px] tracking-[0.45em] text-[#1f2a40] uppercase md:text-sm lg:text-[10px] portrait:static! portrait:mx-auto! portrait:translate-x-0! portrait:text-[10px]! ${SUB_GAP} ${ view.headerSubClass || "" }`}
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
            staged
              ? STAGE_TYPE.asideLabel
              : "text-[20px] tracking-[3px] portrait:text-[13px]! portrait:tracking-[2px]!"
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
                staged
                  ? STAGE_TYPE.asideNum
                  : "text-6xl leading-none portrait:text-[38px]!"
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
                staged
                  ? STAGE_TYPE.asideNum
                  : "text-5xl leading-none portrait:text-[32px]!"
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
          : /* Upright the per-project placement is dropped wholesale — it
               places this block against a 1920×1080 picture that is not on
               screen any more. `!` because those values arrive at `lg:`, and a
               plain utility would lose to them on an iPad Pro's 1024px.

               `h-auto` is in there for a specific reason: several projects
               carry a fixed `lg:h-35` from the per-breakpoint days. Absolutely
               positioned that is harmless — the text simply overflows the box
               and still draws. In this column the block is a real flex item,
               so a 140px height had its `my-auto` margins centre a box less
               than a third of the content's height and pushed the last rows
               clean off the bottom of the screen on Views and Lands End. */
            `pointer-events-none absolute z-20 portrait:static! portrait:mx-auto! portrait:my-auto! portrait:h-auto! portrait:w-full! portrait:max-w-none! portrait:translate-x-0! portrait:translate-y-0! ${
              view.amenityClass ||
              "bottom-55 left-75 w-[calc(100%-2.5rem)] max-w-xl sm:max-w-2xl lg:max-w-3xl"
            }`
      }
    >
      {/* The mark sits a fixed distance ABOVE the amenities, anchored to them
          rather than positioned on its own. The amenities are the fixed point
          on every one of these pages, and their placement is hand-tuned per
          project and per breakpoint; hanging the mark off `bottom-full` means
          it inherits all of that for free and the gap stays put at every
          width, without a single amenity class being touched. */}
      <div
        className={`absolute bottom-full left-1/2 w-max -translate-x-1/2 portrait:static! portrait:mx-auto! portrait:mb-[54px]! portrait:translate-x-0! ${staged ? HEADER_GAP_STAGED : HEADER_GAP}`}
      >
        {headerBlock}
      </div>
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
            <div
              className={
                staged
                  ? `flex flex-col items-center justify-center text-black ${STAGE_TYPE.amenityList} ${view.amenityListClass}`
                  : `mt-2.5 flex flex-col items-center justify-center text-center leading-snug text-black ${
                      view.amenityListClass || "max-w-2xl"
                    }`
              }
            >
              {amenityLines.map(({ items, hasTrailingPipe }, lineIdx) => (
                <div key={lineIdx} className="amenity-line text-center">
                  {items.map((amenity, itemIdx) => {
                    const isLast = itemIdx === items.length - 1;
                    /* A separator that lands at the end of a ROW is
                       punctuation hanging off it, not content. Left in the
                       flow it made that row ~23px wider on the right, so
                       `text-center` set its words 11.7px left of every other
                       row's — which is what made the mark above them read as
                       off-centre, on every project.

                       So the separator is its own element whose whole width is
                       ONE REAL SPACE, widened with word-spacing, with the bar
                       drawn over it out of flow. A space is the one thing a
                       browser drops at the end of a row, so mid-row it is the
                       gap between two items and at a row's end it is nothing
                       at all — every row then centres on its words. Whether
                       the last item carries one is the data's call: a line
                       written ending in "|" means it. */
                    const showSep = !isLast || hasTrailingPipe;
                    const sizeClass = staged
                      ? view.amenityItemClass
                      : view.amenityItemClass || "lg:text-[18px]";
                    return (
                      <Fragment key={itemIdx}>
                        <span
                          className={`whitespace-nowrap mix-blend-multiply portrait:text-[17px]! portrait:leading-relaxed! ${sizeClass}`}
                        >
                          {amenity}
                        </span>
                        {showSep && (
                          <span
                            aria-hidden="true"
                            className={`amenity-sep portrait:text-[17px]! ${sizeClass}`}
                          >
                            {" "}
                          </span>
                        )}
                        {/* the items never break internally, so this zero-width
                          opportunity is where a long line is allowed to wrap */}
                        {!isLast && <wbr />}
                      </Fragment>
                    );
                  })}
                </div>
              ))}
            </div>
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
        className={`relative h-stage w-full overflow-hidden bg-[#dfe7ee] text-[#1f2a40] portrait:flex portrait:flex-col ${
          staged
            ? "flow:aspect-[var(--photo-ar)] flow:h-auto flow:min-h-[55vh]"
            : ""
        }`}
        style={{
          fontFamily: '"Times New Roman", Times, serif',
          "--photo-ar": String(ar),
        }}
      >
        {/* The picture: the photo, the floor cut-outs laid over it, and the
            floor readout that stands in its sky. One box, because those three
            only make sense together — across, it fills the frame and the photo
            covers; upright, it keeps the photo's own ratio at the top of the
            column so the whole building shows and there is a sky to put the
            readout in. `cover` and `slice` agree at either shape, so the
            cut-outs stay on their floors.

            Upright it may also SHRINK, which is what `min-h-0` and the absence
            of `shrink-0` buy: flex only shrinks a row when the column would
            otherwise overflow, so projects whose text fits are untouched, and
            the one with the tallest mark and the longest list — Views, 308px of
            mark over eight rows — gives back the difference from the photo
            instead of pushing its last two rows off the bottom of the screen.
            The photo's width is fixed at full, so shrinking crops a little off
            its top and bottom rather than leaving gaps at its sides. */}
        <div className="absolute inset-0 portrait:relative portrait:aspect-[var(--photo-ar)] portrait:h-auto portrait:w-full portrait:min-h-0">
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
        {!staged && asideBlock}
        </div>

        {/* back to map — pinned to the window's corner, not the photo's, so it
            is never cropped away with the picture (see DesignStage) */}
        <Chrome>
        <Link
          to="/"
          className="group pointer-events-auto absolute top-6 left-6 z-50 inline-flex items-center gap-2 border border-[#212C42] bg-[#3a3d43] px-4 py-2 text-xs tracking-[0.2em] text-white uppercase shadow-[0_10px_24px_rgba(184,134,11,0.22)] transition-colors hover:border-[#767889] hover:bg-[#4E5157] md:top-8 md:left-12"
        >
          <span className="transition-transform duration-300 group-hover:-translate-x-1">
            ←
          </span>
          Back
        </Link>
        </Chrome>

        {/* No amenities to hang the mark on, so it stands on its own
            placement — `headerClass`, in the same design pixels and the same
            centre-anchoring the amenities use, and released into the column
            upright exactly as the group would be. A project's mark therefore
            keeps its spot whether its list is written yet or not: put the list
            in and it appears underneath, and nothing above it moves. */}
        {!hasAmenities && (
          <div
            className={`pointer-events-none absolute z-20 portrait:static! portrait:mx-auto! portrait:my-auto! portrait:translate-x-0! portrait:translate-y-0! ${
              view.headerClass || "top-[18%] left-1/2 -translate-x-1/2"
            }`}
          >
            {headerBlock}
          </div>
        )}

        {/* brand mark, top-right — a corner of the SCREEN, so chrome */}
        <Chrome>
        <NotandasNMark
          className={
            view.nMarkClass ||
            "absolute top-4 right-5 z-20 h-32 w-20 opacity-95 md:-top-6 md:-right-2 md:h-40 md:w-24 lg:h-56 lg:w-32 lg:-top-8 lg:-right-3"
          }
          fill={view.nMarkFill || "white"}
          aria-label={building ? building.name : "Notandas Realty"}
        />
        </Chrome>

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
              {asideBlock}
              {amenityBlock}
            </ImageStage>
          </div>
        ) : (
          amenityBlock
        )}

        {/* floor-plan overlay — opens when a floor is clicked. Chrome: it
            covers the WINDOW, and its controls sit on the window's edges. */}
        {selectedFloor && (
          <Chrome><FloorPlanOverlay
            buildingId={id}
            buildingName={building ? building.name : "Building"}
            floor={selectedFloor}
            floors={view.floors}
            onSelectFloor={setSelected}
            onOpenPano={(regionName) =>
              setPano({ floorNum: selected, regionName })
            }
            onClose={() => setSelected(null)}
          /></Chrome>
        )}

        {/* 360° pano overlay — stacks on top of the plan when a room is clicked */}
        {panoFloor && (
          <Chrome><PanoViewer
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
          /></Chrome>
        )}

        {/* {!selectedFloor && !panoFloor && (
        <img
          src="/Brainwing-logo.webp"
          alt="Brainwing logo"
          className="pointer-events-none fixed top-18 left-3 z-50 w-9 opacity-70 sm:top-20 sm:left-4 sm:w-10 md:top-auto md:right-5 md:bottom-6 md:left-auto md:w-14 md:opacity-80 lg:right-7 lg:w-50"
        />
      )} */}
      </div>

      {flowBelow}
    </div>
  );
};

export default BuildingPage;
