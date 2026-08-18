import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { BUILDING_LOGOS, LOGO_INK, FULL_INK } from "./buildingLogos";
import { uiScaleFor } from "../../lib/coverBox";

const DEFAULT_PLATE = {
  x: 50, // centre of the plate, % across the render
  y: 32, // centre of the plate, % down the render
  w: 480, // plate width in design px
  mark: 240, // width of the visible wordmark in design px
  gap: 1.7, // space between the address and the amenities, in root em
  type: 1, // per-project nudge on the type scale only
};

/**
 * Project mark, address and amenities — one plate, one anchor.
 *
 * These used to be two absolutely-positioned blocks, each carrying its own
 * stack of per-breakpoint offsets (`2xl:left-67 xl:left-55 lg:left-23 …`).
 * Between the widths those offsets were dialled in at, the two drifted apart
 * and the address stopped sitting under its mark. Here they share one box, so
 * "centred under each other" is a fact of the layout rather than something
 * re-tuned at every breakpoint.
 *
 * Two things make it hold at any size:
 *
 *  - the anchor is a point on the PHOTO, not on the viewport (see useCoverBox),
 *    so the plate stays over the same patch of sky however the render crops;
 *  - there are no breakpoints at all. One scale drives the whole plate (see
 *    uiScaleFor), so there is no width at which anything can jump or drift.
 *
 * Nothing is painted behind it — the anchor is picked so the plate sits over
 * open sky, and the render itself is the background.
 */
const ProjectPlate = ({ id, name, subtitle, amenities = [], plate, box }) => {
  const rootRef = useRef(null);

  const cfg = { ...DEFAULT_PLATE, ...(plate || {}) };
  const logo = BUILDING_LOGOS[id] ?? null;
  const ink = LOGO_INK[id] ?? FULL_INK;

  // one scale for the whole plate — shared with the floor readout so the two
  // stay in proportion at every size
  const u = uiScaleFor(box);

  const width = cfg.w * u;
  const root = 16 * u * cfg.type; // px — every size inside the plate is an em of this

  // scale the artwork so its INK is `mark` wide, then slide the padding off
  const markW = cfg.mark * u;
  const artW = markW / ink.w;
  const artH = artW / ink.aspect;

  // keep the plate on screen when a very wide window pushes the anchor out
  const half = width / 2;
  const left = Math.min(
    Math.max(box.x + (cfg.x / 100) * box.w, half + 16),
    Math.max(
      half + 16,
      (typeof window === "undefined" ? 0 : window.innerWidth) - half - 16,
    ),
  );
  const top = box.y + (cfg.y / 100) * box.h;

  useGSAP(
    () => {
      const tl = gsap.timeline({ delay: 1.6 }); // wait out the "ink tide" transition
      tl.from(rootRef.current, {
        y: 18,
        opacity: 0,
        duration: 1.1,
        ease: "power4.out",
      });

      const items = rootRef.current.querySelectorAll("li");
      if (items.length) {
        tl.from(
          items,
          {
            y: 12,
            opacity: 0,
            duration: 0.8,
            stagger: 0.07,
            ease: "power4.out",
          },
          "-=0.7",
        );
      }
      return () => tl.kill();
    },
    { scope: rootRef, dependencies: [id] },
  );

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center"
      style={{ left, top, width, fontSize: `${root}px` }}
    >
      {/* mark + address travel together — this is the pair that has to stay
          centred on each other whatever the screen does */}
      <div className="flex flex-col items-center" style={{ gap: "0.5em" }}>
        <h1
          className="relative"
          style={logo ? { width: markW, height: ink.h * artH } : undefined}
        >
          {logo ? (
            <img
              src={logo}
              alt={name}
              draggable="false"
              className="absolute max-w-none select-none"
              style={{
                width: artW,
                left: -ink.x * artW,
                top: -ink.y * artH,
              }}
            />
          ) : (
            <span
              className="block leading-none font-light text-[#1f2a40] uppercase"
              style={{
                fontSize: "2.1em",
                letterSpacing: "0.18em",
                textIndent: "0.18em",
              }}
            >
              {name}
            </span>
          )}
        </h1>

        {subtitle && (
          <p
            className="font-medium text-[#1f2a40] uppercase"
            style={{
              fontSize: "0.62em",
              // the trailing letter-space would otherwise pull centred
              // tracked-out text half a space to the left
              letterSpacing: "0.42em",
              textIndent: "0.42em",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {amenities.length > 0 && (
        <div
          className="flex w-full flex-col items-center"
          style={{ marginTop: `${cfg.gap}em` }}
        >
          <p
            className="text-[#3a3935] uppercase"
            style={{
              fontSize: "0.56em",
              letterSpacing: "0.42em",
              textIndent: "0.42em",
            }}
          >
            Amenities
          </p>
          <span
            aria-hidden="true"
            className="block bg-[#595753]"
            style={{
              width: "2.6em",
              height: 1,
              marginTop: "0.85em",
              opacity: 0.75,
            }}
          />
          <ul
            className="flex flex-wrap items-center justify-center text-black"
            style={{
              fontSize: "0.9em",
              lineHeight: 1.5,
              marginTop: "0.9em",
              rowGap: "0.2em",
            }}
          >
            {amenities.map((amenity) => (
              <li
                key={amenity}
                className="after:mx-[0.55em] after:text-black/35 after:content-['|'] last:after:content-none"
              >
                {amenity}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProjectPlate;
