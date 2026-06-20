import { useEffect, useRef, useState } from "react";
import { getFloorPlan } from "./floorPlansData";
import { getFloorPano } from "./panoData";

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

const FloorPlanOverlay = ({
  buildingId,
  buildingName,
  floor,
  floors = [],
  onSelectFloor,
  onOpenPano,
  onClose,
}) => {
  const { available, planImg, viewBox, regions } = getFloorPlan(buildingId, floor);
  // Some floors (e.g. Edge's terrace) have a 360° capture but no detailed plan
  // yet — still let the visitor open the pano from the "plan coming soon" state.
  const hasPano = !!getFloorPano(buildingId, floor);

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(null);
  const [dragging, setDragging] = useState(false);

  const drag = useRef(null); // { startX, startY, originX, originY }
  const moved = useRef(false); // true once a drag actually pans, to swallow the click
  const activeFloorRef = useRef(null); // the open floor's button in the aside

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
        : `Floor ${String(floor.num).padStart(2, "0")}`
    : "";

  // floors listed high → low in the aside (terrace on top, ground at the bottom)
  const floorRank = (f) => (f.isTerrace ? 1e9 : f.isGround ? -1 : f.num);
  const orderedFloors = [...floors].sort((a, b) => floorRank(b) - floorRank(a));
  const floorTag = (f) =>
    f.isTerrace ? "TER" : f.isGround ? "GF" : `${String(f.num).padStart(2, "0")}F`;

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
      className="fixed inset-0 z-50 flex bg-[#faf6ed] text-[#1f2a40] backdrop-blur-sm "
      style={{ fontFamily: "'Times New Roman', Times, serif" }}
    >
      {/* floor selector aside — switch the plan without leaving the overlay */}
      <aside className="relative flex w-20 shrink-0 flex-col overflow-hidden border-r border-[#d7bf78]/40 bg-linear-to-b from-white via-[#fbf8f1] to-[#f4ead4] md:w-36">
        {/* faint gold sheen bleeding down from the top */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-[#e8c879]/20 to-transparent" />

        {/* header */}
        <div className="relative px-4 pb-4 pt-6">
          <p className="text-[9px] font-medium uppercase leading-[1.6] tracking-[3px] text-[#7a6230]">
            The<br className="hidden md:block" /> Collection
          </p>
          <span className="mt-3 block h-px w-8 bg-linear-to-r from-[#b8860b] to-transparent" />
        </div>

        {/* floor list — stacked as nodes on a vertical "elevator shaft" rail */}
        <div className="relative flex-1 overflow-y-auto px-3 pb-4 pt-1">
          <div className="relative">
            {/* the rail itself, gold-tipped at the top */}
            <span className="pointer-events-none absolute inset-y-2 left-3 w-px bg-linear-to-brom-[#b8860b]/60 via-[#d7bf78]/20 to-transparent" />

            {orderedFloors.map((f) => {
              const isCurrent = floor && f.num === floor.num;
              const hasPlan = getFloorPlan(buildingId, f).available;
              const isTop = f.isTerrace;
              return (
                <button
                  key={f.num}
                  ref={isCurrent ? activeFloorRef : null}
                  onClick={() => changeFloor(f.num)}
                  aria-current={isCurrent ? "true" : undefined}
                  title={hasPlan ? undefined : "Plan coming soon"}
                  className={`group relative flex w-full items-center gap-4 rounded-r-md py-2 pl-1.5 pr-2 text-left transition-colors duration-300 ${
                    isCurrent
                      ? "text-[#b8860b]"
                      : hasPlan
                        ? "text-[#5f5131] hover:text-[#b8860b]"
                        : "text-[#9b8a62] hover:text-[#7a6230]"
                  }`}
                >
                  {/* sliding highlight — solid for the open floor, a hint on hover */}
                  <span
                    className={`pointer-events-none absolute inset-y-1 left-0 rounded-r-md bg-linear-to-r transition-all duration-300 ${
                      isCurrent
                        ? "right-1 from-[#e8c879]/30 via-[#e8c879]/10 to-transparent opacity-100"
                        : "right-4 from-[#e8c879]/10 to-transparent opacity-0 group-hover:right-1 group-hover:opacity-100"
                    }`}
                  />

                  {/* gold accent bar pinned to the active floor */}
                  <span
                    className={`pointer-events-none absolute left-0 top-1/2 h-5 w-0.75 -translate-y-1/2 rounded-full bg-[#e8c879] transition-opacity duration-300 ${
                      isCurrent
                        ? "opacity-100 shadow-[0_0_10px_rgba(184,134,11,0.45)]"
                        : "opacity-0"
                    }`}
                  />

                  {/* node sitting on the rail */}
                  <span className="relative z-10 grid h-3 w-3 shrink-0 place-items-center">
                    <span
                      className={`rounded-full border transition-all duration-300 ${
                        isCurrent
                          ? "h-2.5 w-2.5 border-[#b8860b] bg-[#b8860b] shadow-[0_0_10px_rgba(184,134,11,0.45)]"
                          : hasPlan
                            ? "h-2 w-2 border-[#b8860b]/30 bg-white group-hover:scale-110 group-hover:border-[#b8860b]/70"
                            : "h-2 w-2 border-[#d9cba9] bg-white"
                      }`}
                    />
                  </span>

                  {/* floor tag */}
                  <span
                    className={`relative z-10 flex items-center gap-1.5 text-sm tracking-[0.18em] transition-transform duration-300 ${
                      isCurrent
                        ? "font-medium"
                        : "group-hover:translate-x-0.5"
                    }`}
                  >
                    {floorTag(f)}
                    {isTop && (
                      <span
                        className={`text-[10px] leading-none transition-colors ${
                          isCurrent ? "text-[#b8860b]" : "text-[#b8860b]/55 group-hover:text-[#b8860b]"
                        }`}
                      >
                        ✦
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* footer — quiet level count */}
        <div className="relative border-t border-white/10 px-4 py-3">
          <p className="text-[8px] uppercase tracking-[2.5px] text-[#7a6230]">
            {floors.length} Levels
          </p>
          <p className="mt-0.5 text-[8px] uppercase tracking-[2.5px] text-[#9b8a62]">
            Ground → Terrace
          </p>
        </div>
      </aside>

      {/* main column */}
      <div className="flex flex-1 flex-col">
      {/* top bar */}
      <div className="flex w-full items-center justify-center px-6 py-5  md:px-10">
        <div className="text-center text-[#1f2a40] ">
          <p className="text-[10px] uppercase tracking-[3px] text-[#7a6230] ">
            {buildingName} · Floor plan · click a unit to view pano
          </p>
          <h2 className="mt-2 font-serif text-2xl italic text-[#e8c879] md:text-3xl">
            {floorTitle}
          </h2>
        </div>

        <button
          onClick={onClose}
          aria-label="Close floor plan"
          className="absolute right-6 top-4 inline-flex items-center gap-2  border border-[#b8860b] bg-[#b8860b] px-4 py-2 text-xs uppercase tracking-[0.2em] text-white shadow-[0_10px_24px_rgba(184,134,11,0.22)] transition-colors hover:bg-[#8f6708] hover:border-[#8f6708] md:right-10 md:top-4"
        >
          Close
          <span className="text-sm leading-none transition-transform group-hover:rotate-90">
            ✕
          </span>
        </button>
      </div>

      {/* stage */}
      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-24 "
        onWheel={available ? onWheel : undefined}
      >
        {available ? (
          <div
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
            className="relative select-none "
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              transition: dragging ? "none" : "transform 0.18s ease-out",
              cursor: zoom > 1 ? (dragging ? "grabbing" : "grab") : "default",
             
            }}
          >
            <img
              src={planImg}
              alt={`${buildingName} ${floorTitle} plan`}
              draggable="false"
              className="block h-[80vh] max-w-[70vw]  select-none rounded-sm shadow-[0_20px_60px_rgba(0,0,0,0.5)] "
            />

            {viewBox && regions.length > 0 && (
              <svg
                viewBox={viewBox}
                preserveAspectRatio="none"
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
                        ? "rgba(184,134,11,0.6)"
                        : "rgba(232,200,121,0.3)",
                      stroke: isOn ? "#b8860b" : "rgba(232,200,121,0.85)",
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
            <p className="text-[11px] uppercase tracking-[4px] text-[#7a6230]">
              {hasPano ? "360° view" : "Plan coming soon"}
            </p>
            <p className="mt-3 font-serif text-2xl italic text-[#e8c879]">
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
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#b8860b] bg-[#b8860b] px-6 py-2.5 text-xs uppercase tracking-[0.2em] text-white shadow-[0_10px_24px_rgba(184,134,11,0.22)] transition-colors hover:bg-[#8f6708] hover:border-[#8f6708]"
              >
                 View Pano
              </button>
            )}
          </div>
        )}

        {/* hovered region label */}
        {available && hovered != null && regions[hovered] && (
          <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 rounded-full border border-[#b8860b]/25 bg-white px-4 py-1.5 text-sm font-medium tracking-wide text-[#b8860b] shadow-[0_10px_24px_rgba(31,42,64,0.12)]">
            {regions[hovered].name}
            <span className="ml-2 text-[#7a6230]">· click to view pano</span>
          </div>
        )}

        {/* zoom toolbar */}
        {available && (
          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-[#d7bf78]/50 bg-white p-1.5 shadow-[0_12px_30px_rgba(31,42,64,0.12)] backdrop-blur-md">
            <button
              onClick={zoomOut}
              aria-label="Zoom out"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#b8860b] text-lg text-white transition-colors hover:bg-[#8f6708]"
            >
              −
            </button>
            <button
              onClick={reset}
              className="rounded-full px-3 text-xs uppercase tracking-wider text-[#1f2a40] transition-colors hover:text-[#b8860b]"
            >
              {Math.round(zoom * 100)}% · Reset
            </button>
            <button
              onClick={zoomIn}
              aria-label="Zoom in"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#b8860b] text-lg text-white transition-colors hover:bg-[#8f6708]"
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
