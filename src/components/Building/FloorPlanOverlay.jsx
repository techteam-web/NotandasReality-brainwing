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
      className="fixed inset-0 z-50 flex bg-[#0e1726]/92 backdrop-blur-sm"
      style={{ fontFamily: "'Times New Roman', Times, serif" }}
    >
      {/* floor selector aside — switch the plan without leaving the overlay */}
      <aside className="flex w-20 shrink-0 flex-col border-r border-white/10 bg-black/30 md:w-32">
        <p className="px-4 pb-3 pt-5 text-[9px] uppercase tracking-[3px] text-white/45">
          The Collection
        </p>
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {orderedFloors.map((f) => {
            const isCurrent = floor && f.num === floor.num;
            const hasPlan = getFloorPlan(buildingId, f).available;
            return (
              <button
                key={f.num}
                ref={isCurrent ? activeFloorRef : null}
                onClick={() => changeFloor(f.num)}
                aria-current={isCurrent ? "true" : undefined}
                title={hasPlan ? undefined : "Plan coming soon"}
                className={`group flex w-full items-center gap-2 rounded-sm px-2.5 py-2 text-left text-sm transition-colors ${
                  isCurrent
                    ? "bg-white/5 text-[#e8c879]"
                    : hasPlan
                      ? "text-white/65 hover:bg-white/5 hover:text-[#e8c879]"
                      : "text-white/30 hover:text-white/55"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full transition-colors ${
                    isCurrent
                      ? "bg-[#e8c879]"
                      : "bg-transparent group-hover:bg-white/30"
                  }`}
                />
                <span className="tracking-wider">{floorTag(f)}</span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* main column */}
      <div className="flex min-w-0 flex-1 flex-col">
      {/* top bar */}
      <div className="flex items-center justify-between px-6 py-4 md:px-10">
        <div className="text-white">
          <p className="text-[10px] uppercase tracking-[3px] text-white/55">
            {buildingName} · Floor plan · click a unit for 360°
          </p>
          <h2 className="mt-0.5 font-serif text-2xl italic text-[#e8c879] md:text-3xl">
            {floorTitle}
          </h2>
        </div>

        <button
          onClick={onClose}
          aria-label="Close floor plan"
          className="group inline-flex items-center gap-2 rounded-sm border border-white/30 bg-white/5 px-4 py-2 text-sm text-white transition-colors hover:border-[#e8c879] hover:text-[#e8c879]"
        >
          Close
          <span className="text-base leading-none transition-transform group-hover:rotate-90">
            ✕
          </span>
        </button>
      </div>

      {/* stage */}
      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-24"
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
            }}
          >
            <img
              src={planImg}
              alt={`${buildingName} ${floorTitle} plan`}
              draggable="false"
              className="block max-h-[74vh] max-w-[88vw] w-auto select-none rounded-sm shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
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
          <div className="text-center text-white/80">
            <p className="text-[11px] uppercase tracking-[4px] text-white/50">
              {hasPano ? "360° view" : "Plan coming soon"}
            </p>
            <p className="mt-3 font-serif text-2xl italic text-[#e8c879]">
              {floorTitle}
            </p>
            <p className="mt-2 text-sm text-white/60">
              {hasPano
                ? "No detailed plan for this floor yet — step into the 360° view to look around."
                : "The detailed plan for this floor isn’t available yet."}
            </p>
            {hasPano && (
              <button
                onClick={() => onOpenPano?.(null)}
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#e8c879]/60 bg-[#e8c879]/10 px-6 py-2.5 text-xs uppercase tracking-[0.2em] text-[#e8c879] transition-colors hover:border-[#e8c879] hover:bg-[#e8c879]/20"
              >
                360° View
              </button>
            )}
          </div>
        )}

        {/* hovered region label */}
        {available && hovered != null && regions[hovered] && (
          <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-black/65 px-4 py-1.5 text-sm font-medium tracking-wide text-[#e8c879]">
            {regions[hovered].name}
            <span className="ml-2 text-white/60">· click for 360°</span>
          </div>
        )}

        {/* zoom toolbar */}
        {available && (
          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/20 bg-white/10 p-1.5 backdrop-blur-md">
            <button
              onClick={zoomOut}
              aria-label="Zoom out"
              className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-white transition-colors hover:bg-white/15 hover:text-[#e8c879]"
            >
              −
            </button>
            <button
              onClick={reset}
              className="px-3 text-xs uppercase tracking-wider text-white transition-colors hover:text-[#e8c879]"
            >
              {Math.round(zoom * 100)}% · Reset
            </button>
            <button
              onClick={zoomIn}
              aria-label="Zoom in"
              className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-white transition-colors hover:bg-white/15 hover:text-[#e8c879]"
            >
              +
            </button>

            <span className="mx-1 h-5 w-px bg-white/20" />

            <button
              onClick={() => onOpenPano?.(null)}
              className="rounded-full px-3 py-1 text-xs uppercase tracking-wider text-white transition-colors hover:bg-white/15 hover:text-[#e8c879]"
            >
              360° View
            </button>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default FloorPlanOverlay;
