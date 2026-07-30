import { useEffect, useRef, useState } from "react";
import { getFloorPlan } from "./floorPlansData";
import { getFloorPano, getFloorPanoHeight } from "./panoData";
import notanMap from "../../assets/floorplanoverbg.png";
import NotandasNMark from "../SvgAnimations/NotandasNMark";
import { BUILDING_LOGOS, TIGHT_CROPPED_LOGOS } from "./buildingLogos";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

/**
 * Full-screen overlay that opens when a floor is clicked on the BuildingPage.
 *
 * Shows that floor's detailed plan photo with its hover cut-outs laid over it
 * in the same coordinate space (so each room/unit lights up gold on hover).
 * Clicking a unit opens that unit's 360° pano (onOpenPano, framed per region —
 * see REGION_PANO_MAP in panoData.js). A small toolbar zooms the plan in/out
 * and resets it; when zoomed the plan can be dragged to pan around.
 */
const MIN_ZOOM = 0.6;
const MAX_ZOOM = 4;
const STEP = 0.3;

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

const FloorPlanOverlay = ({
  buildingId,
  buildingName,
  floor,
  floors = [],
  onSelectFloor,
  onOpenPano,
  onClose,
}) => {
  const logoSrc = BUILDING_LOGOS[buildingId] ?? null;
  const logoIsTight = TIGHT_CROPPED_LOGOS.has(buildingId);
  const { available, planImg, viewBox, regions } = getFloorPlan(
    buildingId,
    floor,
  );
  // Size the plan box to the largest rectangle that matches the SVG viewBox's
  // aspect ratio while fitting inside 80vw × 80vh. The width must be derived
  // with min() — height:80vh + max-width:80vw distorts the box's ratio when
  // the clamp kicks in (aspect-ratio only resolves the *auto* axis, so the
  // explicit 80vh height never shrinks back), which made the photo letterbox
  // while the overlay kept filling the full box on narrow/scaled screens.
  const [, , vbW, vbH] = viewBox ? viewBox.split(/\s+/).map(Number) : [];
  const planAspect = vbW && vbH ? vbW / vbH : null;
  // Some floors (e.g. Edge's terrace) have a 360° capture but no detailed plan
  // yet — still let the visitor open the pano from the "plan coming soon" state.
  const hasPano = !!getFloorPano(buildingId, floor);

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(null);
  const [dragging, setDragging] = useState(false);
  const imgRef = useRef();

  const drag = useRef(null); // { startX, startY, originX, originY }
  const moved = useRef(false); // true once a drag actually pans, to swallow the click
  const activeFloorRef = useRef(null); // the open floor's button in the aside

  useGSAP(() => {
    if (!imgRef.current) return;
    gsap.from(imgRef.current, { 
      opacity: 0,
      scale: 0.9,
      duration: 0.5,
      ease: "power2.out",
    })
  }, []);

  // close on Escape
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // bring the open floor into view in the aside when the overlay first opens
  useEffect(() => {
    activeFloorRef.current?.scrollIntoView({ block: "nearest" });
  }, []);

  const clamp = (z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));
  const zoomIn = () => setZoom((z) => clamp(z + STEP));
  const zoomOut = () =>
    setZoom((z) => {
      const next = clamp(z - STEP);
      if (next === 1) setOffset({ x: 0, y: 0 });
      return next;
    });
  const reset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const onWheel = (e) => {
    e.preventDefault();
    setZoom((z) => clamp(z + (e.deltaY < 0 ? STEP : -STEP)));
  };

  const onPointerDown = (e) => {
    if (zoom <= 1) return;
    drag.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: offset.x,
      originY: offset.y,
    };
    moved.current = false;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.startX;
    const dy = e.clientY - drag.current.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved.current = true;
    setOffset({
      x: drag.current.originX + dx,
      y: drag.current.originY + dy,
    });
  };

  // open a room's 360° pano, unless the click was really the end of a pan-drag
  const openPano = (regionName) => {
    if (moved.current) return;
    onOpenPano?.(regionName);
  };
  const endDrag = () => {
    drag.current = null;
    setDragging(false);
  };

  const floorTitle = floor
    ? floor.isTerrace
      ? "Terrace"
      : floor.isGround
        ? "Ground Floor"
        : getOrdinalFloor(floor.num)
    : "";

  // floors listed high → low in the aside (terrace on top, ground at the bottom)
  const floorRank = (f) => (f.isTerrace ? 1e9 : f.isGround ? -1 : f.num);
  const orderedFloors = [...floors].sort((a, b) => floorRank(b) - floorRank(a));
  const floorTag = (f) =>
    f.isTerrace
      ? "Terrace"
      : f.isGround
        ? "Ground Floor"
        : getOrdinalFloor(f.num);

  // switch the plan to another floor, resetting the zoom/pan first
  const changeFloor = (num) => {
    if (floor && num === floor.num) return;
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setHovered(null);
    onSelectFloor?.(num);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex bg-[#faf6ed] text-[#1f2a40] backdrop-blur-sm"
      style={{ fontFamily: "'Times New Roman', Times, serif" }}
    >
      {/* full-bleed map background */}
      <img
        src={notanMap}
        alt=""
        aria-hidden="true"
        draggable="false"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-25 select-none"
      />

      {/* floor selector aside — switch the plan without leaving the overlay */}
      <aside className="from-gray relative flex w-36 shrink-0 flex-col overflow-hidden border-r border-[#3d6474]/12 bg-linear-to-b via-[#cad1d6] to-[#c3c7c7] md:w-56 lg:w-60">
        {/* faint blue-gray sheen bleeding down from the top */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-[#4E5157]/18 to-transparent" />

        {/* header */}
        <div className="relative px-4 pt-6 pb-4">
          {logoSrc ? (
            <img
              src={logoSrc}
              alt={buildingName}
              className={`mx-auto w-auto max-w-full opacity-95 ${
                logoIsTight ? "h-10 md:h-12" : "h-20 md:h-24"
              }`}
            />
          ) : (
            <NotandasNMark
              className="mx-auto h-20 w-20 opacity-95 md:h-24 md:w-24"
              aria-label={buildingName}
            />
          )}
          <span className="mt-3 block h-px w-8 bg-linear-to-r from-[#4E5157] to-transparent" />
        </div>

        {/* floor list — stacked as nodes on a vertical "elevator shaft" rail */}
        <div className="custom-scrollbar relative flex-1 overflow-y-auto px-4 pt-1 pb-4">
          <div className="relative">
            {orderedFloors.map((f) => {
              const isCurrent = floor && f.num === floor.num;
              const hasPlan = getFloorPlan(buildingId, f).available;
              // height that floor's 360° was shot at — null on floors with no pano
              const panoHeight = getFloorPanoHeight(buildingId, f);
              return (
                <button
                  key={f.num}
                  ref={isCurrent ? activeFloorRef : null}
                  onClick={() => changeFloor(f.num)}
                  aria-current={isCurrent ? "true" : undefined}
                  title={hasPlan ? undefined : "Plan coming soon"}
                  className={`group relative flex w-full items-center gap-3 rounded-r-md py-2.5 pr-3 pl-2 text-left transition-colors duration-300 ${
                    isCurrent
                      ? "text-[#4E5157]"
                      : hasPlan
                        ? "text-[#4E5157]/75 hover:text-[#4E5157]"
                        : "text-[#6f7f95] hover:text-[#4E5157]"
                  }`}
                >
                  {/* sliding highlight — solid for the open floor, a hint on hover */}
                  <span
                    className={`pointer-events-none absolute inset-y-1 left-0 rounded-r-md bg-linear-to-r transition-all duration-300 ${
                      isCurrent
                        ? "right-1 from-[#4E5157]/28 via-[#6f7f95]/10 to-transparent opacity-100"
                        : "right-4 from-[#4E5157]/12 to-transparent opacity-0 group-hover:right-1 group-hover:opacity-100"
                    }`}
                  />

                  {/* blue-gray accent bar pinned to the active floor */}
                  <span
                    className={`pointer-events-none absolute top-1/2 left-0 h-5 w-0.75 -translate-y-1/2 rounded-full bg-[#e8c879] transition-opacity duration-300 ${
                      isCurrent
                        ? "bg-[#4E5157] opacity-100 shadow-[0_0_10px_rgba(78,81,87,0.35)]"
                        : "opacity-0"
                    }`}
                  />

                  {/* node sitting on the rail */}
                  <span className="relative z-10 grid h-3 w-3 shrink-0 place-items-center">
                    <span
                      className={`rounded-full border transition-all duration-300 ${
                        isCurrent
                          ? "h-2.5 w-2.5 border-[#4E5157] bg-[#4E5157] shadow-[0_0_10px_rgba(78,81,87,0.35)]"
                          : hasPlan
                            ? "h-2 w-2 border-[#4E5157]/30 bg-white group-hover:scale-110 group-hover:border-[#4E5157]/70"
                            : "h-2 w-2 border-[#6f7f95] bg-white"
                      }`}
                    />
                  </span>

                  {/* floor tag */}
                  <span
                    className={`relative z-10 flex items-center gap-1.5 text-sm tracking-[0.08em] whitespace-nowrap transition-transform duration-300 ${
                      isCurrent ? "font-semibold" : "font-normal group-hover:translate-x-0.5"
                    }`}
                  >
                    {floorTag(f)}
                  </span>

                  {/* height that floor's pano was shot at, pinned to the right
                      of the tag — only from md up, where the aside is wide
                      enough for it not to crowd the longer floor names */}
                  {panoHeight && (
                    <span
                      className={`relative z-10 ml-auto hidden shrink-0 pl-1 text-[11px] tracking-[0.04em] tabular-nums transition-colors duration-300 md:inline ${
                        isCurrent
                          ? "text-[#4E5157]"
                          : "text-[#4E5157]/55 group-hover:text-[#4E5157]/80"
                      }`}
                    >
                      {panoHeight}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </aside>

      {/* main column */}
      <div className="relative z-10 flex flex-1 flex-col">
        {/* top bar */}
        <div className="flex w-full items-center justify-center px-6 py-5 md:px-10">
          <div className="text-center text-[#1f2a40]">
            <p className="text-[10px] tracking-[3px] text-[#423e21] uppercase">
              {buildingName} · Floor plan · click a unit to view pano
            </p>
            <h2 className="mt-2 font-serif text-2xl text-[#212C42] md:text-3xl">
              {floorTitle}
            </h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Close floor plan"
            className="absolute group top-4 right-6 inline-flex items-center gap-2 border border-[#212C42] bg-[#212C42] px-4 py-2 text-xs tracking-[0.2em] text-white uppercase shadow-[0_10px_24px_rgba(184,134,11,0.22)] transition-colors hover:border-[#767889] hover:bg-[#4E5157] **:md:top-4 md:right-10"
          >
            Close
            <span className="text-sm leading-none transition-transform group-hover:rotate-90">
              ✕
            </span>
          </button>
        </div>

        {/* stage */}
        <div
          className="relative flex flex-1 items-center justify-center  overflow-hidden px-4 pb-14"
          onWheel={available ? onWheel : undefined}
        >
          {available ? (
            <div
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerLeave={endDrag}
              className="relative select-none"
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                transition: dragging ? "none" : "transform 0.18s ease-out",
                cursor: zoom > 1 ? (dragging ? "grabbing" : "grab") : "default",
                ...(planAspect
                  ? {
                      width: `min(80vw, ${80 * planAspect}vh)`,
                      aspectRatio: planAspect,
                    }
                  : { height: "80vh", maxWidth: "80vw" }),
              }}
            >
              {planImg ? (
                <img
                  ref={imgRef}
                  src={planImg}
                  alt={`${buildingName} ${floorTitle} plan`}
                  draggable="false"
                  className="block h-full w-full rounded-sm border-2 border-[#1f2a40]/20 object-contain shadow-[0_10px_24px_rgba(31,42,64,0.1)] select-none"
                />
              ) : (
                <div
                  ref={imgRef}
                  aria-hidden
                  className="block h-full w-full rounded-sm border-2 border-[#1f2a40]/20 bg-white/60 shadow-[0_10px_24px_rgba(31,42,64,0.06)] select-none"
                />
              )}

              {viewBox && regions.length > 0 && (
                <svg
                  viewBox={viewBox}
                  // "meet" letterboxes exactly like the photo's object-contain,
                  // so the shapes stay glued to the image even if the box's
                  // ratio ever drifts from the viewBox's ("none" would stretch)
                  preserveAspectRatio="xMidYMid meet"
                  className="pointer-events-none absolute inset-0 h-full w-full"
                >
                  {regions.map((r, i) => {
                    const isOn = hovered === i;
                    const common = {
                      pointerEvents: "all",
                      vectorEffect: "non-scaling-stroke",
                      style: {
                        cursor: "pointer",
                        fill: isOn
                          ? "rgba(7,11,23,0.55)"
                          : "rgba(78,81,87,0.26)",
                        stroke: isOn ? "#070B17" : "rgba(78,81,87,0.82)",
                        strokeWidth: isOn ? 2.5 : 1.5,
                        transition: "fill 0.2s ease, stroke 0.2s ease",
                      },
                      onMouseEnter: () => setHovered(i),
                      onMouseLeave: () =>
                        setHovered((cur) => (cur === i ? null : cur)),
                      onClick: () => openPano(r.name),
                    };
                    return r.type === "polygon" ? (
                      <polygon key={i} points={r.points} {...common} />
                    ) : (
                      <path key={i} d={r.d} {...common} />
                    );
                  })}
                </svg>
              )}
            </div>
          ) : (
            <div className="text-center text-[#1f2a40]">
              <p className="text-[11px] tracking-[4px] text-[#4E5157] uppercase">
                {hasPano ? "360° view" : "Plan coming soon"}
              </p>
              <p className="mt-3 font-serif text-2xl text-[#4E5157] italic">
                {floorTitle}
              </p>
              <p className="mt-2 text-sm text-[#4f5b70]">
                {hasPano
                  ? "No detailed plan for this floor yet — step into the 360° view to look around."
                  : "The detailed plan for this floor isn’t available yet."}
              </p>
              {hasPano && (
                <button
                  onClick={() => onOpenPano?.(null)}
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#363d57] bg-[#2d2c27] px-6 py-2.5 text-xs tracking-[0.2em] text-white uppercase shadow-[0_10px_24px_rgba(184,134,11,0.22)] transition-colors hover:border-[#26344c] hover:bg-[#434650]"
                >
                  View Pano
                </button>
              )}
            </div>
          )}

          {/* hovered region label */}
          {available && hovered != null && regions[hovered] && (
            <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 rounded-full border border-[#b8860b]/25 bg-white px-4 py-1.5 text-sm font-medium tracking-wide text-[#4E5157] shadow-[0_10px_24px_rgba(31,42,64,0.12)]">
              {regions[hovered].name}
              <span className="ml-2 text-[#4E5157]">· click to view pano</span>
            </div>
          )}

          {/* zoom toolbar */}
          {available && (
            <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-[#d7bf78]/50 bg-white p-1.5 opacity-90 shadow-[0_12px_30px_rgba(31,42,64,0.12)] backdrop-blur-md hover:opacity-100 xl:h-13 xl:-bottom-px 2xl:bottom-2 3xl:bottom-3">
              <button
                onClick={zoomOut}
                aria-label="Zoom out"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#212C42] text-lg text-white transition-colors hover:bg-[#3d3b37]"
              >
                −
              </button>
              <button
                onClick={reset}
                className="rounded-full px-3 text-xs tracking-wider text-[#1f2a40] uppercase transition-colors hover:text-[#b8860b]"
              >
                {Math.round(zoom * 100)}% · Reset
              </button>
              <button
                onClick={zoomIn}
                aria-label="Zoom in"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#212C42] text-lg text-white transition-colors hover:bg-[#413f3c]"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FloorPlanOverlay;
