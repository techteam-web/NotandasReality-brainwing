import { useEffect, useRef, useState } from "react";
import {
  MARZIPANO_SRC,
  floorKey,
  toDeg,
  wrapDeg,
  panoHeadingDeg,
  getFloorPano,
  getFloorPanoHeight,
} from "./panoData";
import { getFloorPlan } from "./floorPlansData";
import { getFloorPlanCompass } from "./floorPlanCompassData";
import {
  getFloorPlanRadar,
  radarFacingFor,
  resolveRadarTune,
  radarTuneKey,
  buildRadarSnippet,
} from "./floorPlanRadarData";
import useRadarAutoFacing from "./useRadarAutoFacing";
import FloorPlanRadar from "./FloorPlanRadar";
import PanoRadarTuner from "./PanoRadarTuner";
import MiniCompass from "../SvgAnimations/MiniCompass";
import NotandasNMark from "../SvgAnimations/NotandasNMark";

/**
 * Full-screen 360° pano overlay for a single building floor.
 *
 * Loads the Marzipano runtime (once, from /public) and renders the floor's
 * pano with the view *restricted to a horizontal arc* (the "140°" window) so
 * visitors look across the facade rather than spinning a full 360°. The arc,
 * facing (yaw/pitch) and zoom (fov) all come from `pano` — see panoData.js.
 *
 * The toolbar shows the live view angles and a "Copy config" button: drag to
 * the framing you want, copy, and paste the snippet back into panoData.js —
 * FLOOR_PANO_MAP for a whole floor, or REGION_PANO_MAP when opened from a
 * specific floor-plan room (regionName set).
 *
 * The mini compass is calibrated by hand, then runs itself: each pano carries
 * `northDeg` (the real bearing its yaw 0° faces) and `pinDeg` (where the pin
 * sits), set per building / floor / room in panoData.js. The compass shows
 * `northDeg + live yaw`, so it turns as the visitor looks around. Add
 * `?compass=1` to the URL for the overlay used to dial those numbers in.
 *
 * The minimap carries a radar (FloorPlanRadar): a hub at the centre of the
 * floor plan with a cone showing where the visitor is looking ON THAT SHEET.
 * It reads plan north from floorPlanCompassData — the same bearing the big
 * plan's compass uses — so it aims itself. Where a capture sits off-axis from
 * its sheet, floorPlanRadarData.js holds the hand correction per building,
 * floor and room; `?radar=1` opens the panel that dials those in.
 */

// Vertical look range allowed around configured pitch (restricted looking down).
const PITCH_DOWN_LIMIT = (10 * Math.PI) / 180; // max 10° looking down
const PITCH_UP_LIMIT = (35 * Math.PI) / 180;   // max 35° looking up
const HFOV_MIN = (25 * Math.PI) / 180;

const TWO_PI = 2 * Math.PI;
// Wrap an angle into (-π, π] — same normalization Marzipano uses for yaw.
const wrapPi = (a) => {
  let x = a % TWO_PI;
  if (x > Math.PI) x -= TWO_PI;
  if (x <= -Math.PI) x += TWO_PI;
  return x;
};

/**
 * Wrap-aware replacement for Marzipano's `limit.yaw`.
 *
 * The built-in clamps the raw (already wrapped to ±π) yaw, which breaks when the
 * allowed arc straddles the ±180° seam: dragging past -180° wraps yaw to +179°
 * and the clamp snaps it to the far edge, so the view appears to "reset". We
 * instead clamp the offset *from the arc centre* (always within ±half, half<π),
 * which has no seam, then wrap the result back.
 */
const limitYawArc = (center, half) => (params) => {
  const delta = Math.min(Math.max(wrapPi(params.yaw - center), -half), half);
  params.yaw = wrapPi(center + delta);
  return params;
};

/**
 * "minX minY w h" → `{ x, y, w, h }`, or null if the plan has no overlay frame.
 * The floor-plan cut-outs share their viewBox with the plan photo, so this is
 * the paper's own coordinate space — what the minimap radar is drawn into.
 */
const parseViewBox = (viewBox) => {
  if (!viewBox) return null;
  const [x, y, w, h] = viewBox.trim().split(/[\s,]+/).map(Number);
  return [x, y, w, h].every(Number.isFinite) && w > 0 && h > 0
    ? { x, y, w, h }
    : null;
};

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

const floorTag = (f) =>
  f.isTerrace ? "Terrace" : f.isGround ? "Ground Floor" : getOrdinalFloor(f.num);

let marzipanoPromise = null;
const loadMarzipano = () => {
  if (window.Marzipano) return Promise.resolve(window.Marzipano);
  if (marzipanoPromise) return marzipanoPromise;
  marzipanoPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = MARZIPANO_SRC;
    s.async = true;
    s.onload = () => resolve(window.Marzipano);
    s.onerror = () => reject(new Error("Failed to load Marzipano"));
    document.head.appendChild(s);
  });
  return marzipanoPromise;
};

const PanoViewer = ({
  buildingId,
  buildingName,
  floor,
  floors = [],
  floorTitle,
  pano,
  regionName,
  onSelectFloor,
  onSelectRegion,
  onClose,
}) => {
  const panoRef = useRef(null);
  const viewerRef = useRef(null);
  const viewRef = useRef(null);
  const rafRef = useRef(0);
  const menuRef = useRef(null); // dropdown wrapper, for outside-click detection
  const menuItemRef = useRef(null); // the open floor's row in the dropdown
  // the minimap's room shapes, by index — measured to aim the radar
  const regionShapes = useRef(new Map());

  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  // `fov` is Marzipano's own (vertical) field of view; `hfov` is the horizontal
  // one the minimap radar's cone spans — see the sync() below.
  const [angles, setAngles] = useState({ yaw: 0, pitch: 0, fov: 0, hfov: 0 });
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [minimapOpen, setMinimapOpen] = useState(true);
  const [miniHovered, setMiniHovered] = useState(null);

  // Fetch floor plan image & interactive SVG overlay for this floor
  const floorPlan = getFloorPlan(buildingId, floor);
  const { available: hasFloorPlan, planImg, viewBox, regions } = floorPlan;

  // ?compass=1 opens the compass-aiming panel (an authoring aid, off in normal
  // visits); the nudges are the trial offsets it applies live.
  const [calibrating] = useState(
    () => new URLSearchParams(window.location.search).get("compass") === "1",
  );
  const [nudge, setNudge] = useState({ north: 0, pin: 0 });

  // ?radar=1 opens the radar-aiming panel — its own tool, since a session there
  // walks floors and rooms collecting dial-ins rather than tuning one number.
  const [aimingRadar] = useState(
    () => new URLSearchParams(window.location.search).get("radar") === "1",
  );
  // key → facing, one entry per scope dialled in this session. Only consulted
  // while the panel is open, so a normal visit always renders the data file.
  const [radarTune, setRadarTune] = useState({});
  const [radarScope, setRadarScope] = useState("floor");

  // Compass aim for this floor/room — straight from panoData, plus whatever the
  // calibration panel is trying out (0 / 0 in a normal visit). `northDeg` is the
  // hand-set calibration; `headingDeg` is that plus the live drag, and is what
  // the compass actually shows.
  const northDeg = wrapDeg((pano?.northDeg ?? 0) + nudge.north);
  const pinDeg = wrapDeg((pano?.pinDeg ?? 0) + nudge.pin);
  const headingDeg = wrapDeg(panoHeadingDeg(pano, angles.yaw) + nudge.north);

  // ── Minimap radar ────────────────────────────────────────────────────────
  // The radar is drawn on the PLAN, so every bearing is turned into plan space
  // first. The plan's own compass says where north points on that sheet
  // (`rotation`, clockwise from up), so a real bearing B sits at rotation + B —
  // one shared number keeps the radar, the plan compass and the mini compass
  // telling the same story. The correction on top of that comes from the room
  // yaws themselves — useRadarAutoFacing measures where each room sits on the
  // paper against the yaw it's framed at — with floorPlanRadarData.js able to
  // overrule it per building / floor / room. Everything else is derived from
  // `angles`, which the Marzipano "change" listener refreshes each frame, so
  // the cone follows a drag live and a floor / room switch repaints it already
  // facing the right way.
  const planFrame = parseViewBox(viewBox);
  const planNorthDeg = getFloorPlanCompass(buildingId, floor).rotation ?? 0;
  const radarCfg = getFloorPlanRadar(buildingId, floor, regionName);
  const autoFacing = useRadarAutoFacing({
    buildingId,
    floor,
    pano,
    regions,
    planFrame,
    planNorthDeg,
    shapes: regionShapes,
    ready: !loading && !failed && hasFloorPlan && minimapOpen,
  });
  const fileFacing = radarFacingFor(radarCfg, autoFacing, regionName);
  const radarDeg = wrapDeg(
    aimingRadar
      ? resolveRadarTune(radarTune, buildingId, floor, regionName, fileFacing)
      : fileFacing,
  );
  const radarHeadingDeg = wrapDeg(planNorthDeg + headingDeg + radarDeg);
  // cone width = the live zoom, so it narrows exactly as the view narrows
  const radarFovDeg = Math.min(150, Math.max(20, toDeg(angles.hfov) || 60));
  // the swing this capture allows, centred on the framing it opens at
  const radarArcDeg = Math.min(360, toDeg(pano?.panRad ?? 0));
  const radarArcCenterDeg = wrapDeg(
    planNorthDeg +
      panoHeadingDeg(pano, pano?.center?.yaw ?? 0) +
      nudge.north +
      radarDeg,
  );

  // Center of the active region (room/balcony) on the floor plan SVG, so the radar hub
  // (yellow dot marker) sits directly on the active room instead of the middle of the plan.
  const activeRegionIndex = regions?.findIndex((r) => r.name === regionName) ?? -1;
  const getRegionCenter = (index) => {
    if (index < 0 || !regions || index >= regions.length) return null;
    const el = regionShapes.current?.get(index);
    if (el) {
      try {
        const b = el.getBBox();
        if (b && b.width > 0 && b.height > 0) {
          return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
        }
      } catch {
        // ignore
      }
    }
    const r = regions[index];
    if (!r) return null;
    if (r.type === "polygon" && r.points) {
      const pts = r.points.trim().split(/[\s,]+/).map(Number);
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (let j = 0; j < pts.length - 1; j += 2) {
        const px = pts[j], py = pts[j + 1];
        if (!isNaN(px) && !isNaN(py)) {
          minX = Math.min(minX, px);
          maxX = Math.max(maxX, px);
          minY = Math.min(minY, py);
          maxY = Math.max(maxY, py);
        }
      }
      if (isFinite(minX) && isFinite(maxX) && isFinite(minY) && isFinite(maxY)) {
        return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
      }
    }
    if (r.type === "path" && r.d && typeof document !== "undefined") {
      try {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.style.position = "fixed";
        svg.style.top = "-99999px";
        svg.style.left = "-99999px";
        svg.style.visibility = "hidden";
        svg.style.pointerEvents = "none";
        const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
        pathEl.setAttribute("d", r.d);
        svg.appendChild(pathEl);
        document.body.appendChild(svg);
        const b = pathEl.getBBox();
        document.body.removeChild(svg);
        if (b && b.width > 0 && b.height > 0) {
          return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
        }
      } catch {
        // ignore
      }
    }
    return null;
  };

  const [activeRegionCenter, setActiveRegionCenter] = useState(() =>
    getRegionCenter(activeRegionIndex),
  );

  useEffect(() => {
    setActiveRegionCenter(getRegionCenter(activeRegionIndex));
  }, [activeRegionIndex, regions, regionName, minimapOpen]);

  const radarCenter = activeRegionCenter ?? getRegionCenter(activeRegionIndex);

  // Write one dial-in at the scope the panel is set to, then Copy takes the
  // whole session's worth away as a paste-ready block.
  const nudgeRadar = (step) =>
    setRadarTune((t) => {
      const key = radarTuneKey(radarScope, buildingId, floor, regionName);
      return { ...t, [key]: wrapDeg((t[key] ?? radarDeg) + step) };
    });
  const resetRadar = () =>
    setRadarTune((t) => {
      const key = radarTuneKey(radarScope, buildingId, floor, regionName);
      if (!(key in t)) return t;
      const next = { ...t };
      delete next[key];
      return next;
    });
  const copyRadar = () => {
    navigator.clipboard?.writeText(buildRadarSnippet(radarTune)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };

  // floors listed high → low, like the plan overlay's aside
  const floorRank = (f) => (f.isTerrace ? 1e9 : f.isGround ? -1 : f.num);
  const orderedFloors = [...floors].sort((a, b) => floorRank(b) - floorRank(a));
  const canSwitchFloor = !!onSelectFloor && orderedFloors.length > 1;
  // the picker's label — the floor you're on, falling back to the capture's name
  const headingTitle =
    floorTitle || (pano ? pano.name.split("·")[0].trim() : "");

  // jump straight to another floor's 360° — the floor dropdown in the header
  const changeFloor = (num) => {
    setMenuOpen(false);
    if (floor && num === floor.num) return;
    onSelectFloor?.(num);
  };

  // Escape closes the floor dropdown first, then the viewer
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (menuOpen) setMenuOpen(false);
      else onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, onClose]);

  // dismiss the floor dropdown on any click outside it
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e) => {
      if (!menuRef.current?.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [menuOpen]);

  // open the list already scrolled to the floor you're standing on
  useEffect(() => {
    if (menuOpen) menuItemRef.current?.scrollIntoView({ block: "nearest" });
  }, [menuOpen]);

  // build the Marzipano viewer for this floor's pano
  useEffect(() => {
    if (!pano || !panoRef.current) return;
    let disposed = false;

    loadMarzipano()
      .then((Marzipano) => {
        if (disposed || !panoRef.current) return;

        const viewer = new Marzipano.Viewer(panoRef.current, {
          controls: { mouseViewMode: "drag" },
        });
        viewerRef.current = viewer;

        const source = Marzipano.ImageUrlSource.fromString(
          `${pano.tilesUrl}/{z}/{f}/{y}/{x}.jpg`,
          { cubeMapPreviewUrl: `${pano.tilesUrl}/preview.jpg` },
        );
        const geometry = new Marzipano.CubeGeometry(pano.levels);

        const { yaw, pitch } = pano.center;
        const half = pano.panRad / 2;
        const maxHfov = Math.min(pano.panRad, (110 * Math.PI) / 180);
        const limit = Marzipano.RectilinearView.limit;

        // Pitch locks: extra tight for lower 1st-8th floors, moderately tight for 9th to top floors
        const floorNum = typeof floor?.num === "number" ? floor.num : (floor?.isGround ? 0 : 999);
        const isLowerFloor = floorNum <= 8;

        const pitchDownLimit = isLowerFloor ? (4 * Math.PI) / 180 : (6 * Math.PI) / 180;
        const pitchUpLimit = isLowerFloor ? (12 * Math.PI) / 180 : (20 * Math.PI) / 180;
        const absoluteMinPitch = isLowerFloor ? -(5 * Math.PI) / 180 : -(8 * Math.PI) / 180;
        const absoluteMaxPitch = isLowerFloor ? (15 * Math.PI) / 180 : (22 * Math.PI) / 180;

        const minPitch = Math.max(absoluteMinPitch, pitch - pitchDownLimit);
        const maxPitch = Math.min(absoluteMaxPitch, pitch + pitchUpLimit);

        const limiter = Marzipano.util.compose(
          limit.traditional(pano.faceSize, (100 * Math.PI) / 180, maxHfov),
          limitYawArc(yaw, half),
          limit.pitch(minPitch, maxPitch),
          limit.hfov(HFOV_MIN, maxHfov),
        );

        const view = new Marzipano.RectilinearView({ ...pano.center }, limiter);
        viewRef.current = view;

        const scene = viewer.createScene({
          source,
          geometry,
          view,
          pinFirstLevel: true,
        });
        scene.switchTo();

        const sync = () => {
          rafRef.current = 0;
          // Marzipano's fov() is the VERTICAL field of view (limit.vfov clamps
          // it directly, limit.hfov converts first). The minimap radar spans the
          // HORIZONTAL one, so derive that from the stage's aspect ratio — the
          // same conversion Marzipano's convertFov does. `fov` itself is left
          // alone: it's what the toolbar reads out and what fovDeg round-trips.
          const w = view.width();
          const h = view.height();
          const hfov =
            w > 0 && h > 0
              ? 2 * Math.atan((w / h) * Math.tan(view.fov() / 2))
              : view.fov();
          setAngles({
            yaw: view.yaw(),
            pitch: view.pitch(),
            fov: view.fov(),
            hfov,
          });
        };
        sync();
        view.addEventListener("change", () => {
          if (!rafRef.current) rafRef.current = requestAnimationFrame(sync);
        });

        setLoading(false);
      })
      .catch(() => !disposed && setFailed(true));

    return () => {
      disposed = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
      viewRef.current = null;
    };
  }, [pano]);

  const zoom = (factor) => {
    const v = viewRef.current;
    if (v) v.setFov(v.fov() * factor);
  };
  const resetView = () => {
    const v = viewRef.current;
    if (v) v.setParameters({ ...pano.center });
  };

  const copyConfig = () => {
    if (!pano) return;
    const key = floorKey(floor);
    const k = typeof key === "string" ? `"${key}"` : String(key);
    const yaw = Math.round(toDeg(angles.yaw));
    const pitch = Math.round(toDeg(angles.pitch));
    const fov = Math.round(toDeg(angles.fov));
    const pan = Math.round(toDeg(pano.panRad));

    // From a floor-plan room → REGION_PANO_MAP entry; otherwise → FLOOR_PANO_MAP.
    const snippet =
      regionName != null
        ? `// REGION_PANO_MAP[${k}]\n` +
          `"${regionName}": { yawDeg: ${yaw}, pitchDeg: ${pitch}, fovDeg: ${fov}, panDeg: ${pan} },`
        : `${key}: { scene: "${pano.id}", yawDeg: ${yaw}, pitchDeg: ${pitch}, fovDeg: ${fov}, panDeg: ${pan} },`;

    navigator.clipboard?.writeText(snippet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };

  // Calibration panel's copy: the compass aim and radar alignment you just
  // dialled in. Paste it on the building (every floor), this floor's
  // FLOOR_PANO_MAP entry, or this room's REGION_PANO_MAP entry — whichever
  // scope the direction belongs to. radarDeg is usually the narrowest of the
  // three: one capture, one plan.
  const copyCompass = () => {
    if (!pano) return;
    const key = floorKey(floor);
    const k = typeof key === "string" ? `"${key}"` : String(key);
    const aim = `northDeg: ${northDeg}, pinDeg: ${pinDeg},`;
    const scope =
      regionName != null
        ? `REGION_PANO_MAP[${k}]["${regionName}"]`
        : `FLOOR_PANO_MAP[${k}]`;
    const snippet =
      `// ${scope} — or drop it in PANO_BUILDINGS["${buildingId}"]\n` +
      `// for the whole building\n${aim}`;

    navigator.clipboard?.writeText(snippet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-[#0e1726]"
      style={{ fontFamily: '"Times New Roman", Times, serif' }}
    >
      {/* top bar */}
      <div className="pointer-events-none absolute top-0 right-0 left-0 z-30 flex items-start justify-between px-6 py-5 md:px-10 md:py-6">
        <div className="pointer-events-auto flex items-center gap-3.5 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)] md:gap-5">
          <NotandasNMark
            className="h-14 w-14 shrink-0 select-none opacity-60 transition-opacity duration-300 hover:opacity-85 sm:h-16 sm:w-16 md:h-20 md:w-20 lg:h-22 lg:w-22"
            fill="black"
            aria-label={buildingName || "Notandas Realty"}
          />
          <div>
            <p className="text-[12px] tracking-[3px] text-white/80 uppercase sm:text-[13px] md:text-[14px]">
              {buildingName} · Pano view
            </p>

          {/* the floor title doubles as the floor picker — open it to step to
              another floor's 360° without going back to the plan */}
          <div ref={menuRef} className="relative mt-0.5">
            <button
              type="button"
              onClick={() => canSwitchFloor && setMenuOpen((o) => !o)}
              aria-haspopup={canSwitchFloor ? "listbox" : undefined}
              aria-expanded={canSwitchFloor ? menuOpen : undefined}
              aria-label={canSwitchFloor ? "Change floor" : undefined}
              className={`group inline-flex items-center gap-2.5 rounded-sm border py-1 transition-colors ${
                canSwitchFloor
                  ? menuOpen
                    ? "border-[#e8c879]/70 bg-white/10 px-3"
                    : "border-white/25 bg-white/5 px-3 hover:border-[#e8c879]/70 hover:bg-white/10"
                  : "cursor-default border-transparent"
              }`}
            >
              <h2 className="text-2xl text-white md:text-[24px]">
                {headingTitle}
              </h2>
              {canSwitchFloor && (
                <svg
                  viewBox="0 0 12 8"
                  aria-hidden="true"
                  className={`h-2.5 w-3 shrink-0 fill-none stroke-[#e8c879] stroke-[1.6] transition-transform duration-300 ${
                    menuOpen ? "rotate-180" : "group-hover:translate-y-0.5"
                  }`}
                >
                  <path
                    d="M1 1.5 6 6.5 11 1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>

            {canSwitchFloor && menuOpen && (
              <div
                role="listbox"
                aria-label="Floors"
                className="no-scrollbar scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden absolute top-[calc(100%+10px)] left-0 z-30 max-h-[58vh] w-56 overflow-y-auto rounded-md border border-white/15 bg-[#0e1726]/95 p-1.5 shadow-[0_18px_40px_rgba(0,0,0,0.55)] backdrop-blur-md md:w-64 "
              >
                {orderedFloors.map((f) => {
                  const isCurrent = floor && f.num === floor.num;
                  // floors with no 360° capture stay listed, but greyed out
                  const hasPano = !!getFloorPano(buildingId, f);
                  const panoHeight = getFloorPanoHeight(buildingId, f);
                  return (
                    <button
                      key={f.num}
                      ref={isCurrent ? menuItemRef : null}
                      role="option"
                      aria-selected={!!isCurrent}
                      disabled={!hasPano}
                      onClick={() => changeFloor(f.num)}
                      title={hasPano ? undefined : "360° view coming soon"}
                      className={`group/row flex w-full items-center gap-2.5 rounded-sm px-2.5 py-2 text-left transition-colors ${
                        isCurrent
                          ? "bg-white/15 text-white"
                          : hasPano
                            ? "text-white/70 hover:bg-white/10 hover:text-white"
                            : "cursor-not-allowed text-white/25"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full transition-colors ${
                          isCurrent
                            ? "bg-[#e8c879] shadow-[0_0_8px_rgba(232,200,121,0.8)]"
                            : hasPano
                              ? "bg-white/30 group-hover/row:bg-[#e8c879]/80"
                              : "bg-white/15"
                        }`}
                      />
                      <span
                        className={`text-sm tracking-[0.06em] whitespace-nowrap ${
                          isCurrent ? "font-semibold" : ""
                        }`}
                      >
                        {floorTag(f)}
                      </span>
                      <span className="ml-auto shrink-0 pl-2 text-[11px] tracking-[0.04em] text-white/40 tabular-nums">
                        {panoHeight ?? "soon"}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

        <button
          onClick={onClose}
          aria-label="Close 360° view"
          className="pointer-events-auto group inline-flex items-center gap-2 border border-[#212C42] bg-[#212C42] px-4 py-2 text-xs tracking-[0.2em] text-white uppercase shadow-[0_10px_24px_rgba(184,134,11,0.22)] transition-colors hover:border-[#767889] hover:bg-[#4E5157]"
        >
          Close
          <span className="text-sm leading-none transition-transform group-hover:rotate-90">
            ✕
          </span>
        </button>
      </div>

      {/* pano stage */}
      {pano ? (
        <>
          <div ref={panoRef} className="absolute inset-0 h-full w-full" />

          {loading && !failed && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-white/70">
              <span className="text-[11px] tracking-[4px] uppercase">
                Loading 360° view…
              </span>
            </div>
          )}
          {failed && (
            <div className="absolute inset-0 flex items-center justify-center text-center text-white/80">
              <p className="text-sm">Couldn’t load the 360° view.</p>
            </div>
          )}

          {/* realtime mini compass in bottom-left corner */}
          {!loading && !failed && (
            <div className="absolute bottom-5 left-5 z-10 flex items-center gap-2 md:bottom-6 md:left-6">
              <MiniCompass
                heading={headingDeg}
                pinDeg={pinDeg}
                transitionMs={0}
                className="h-24 w-24 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] absolute left-3 -bottom-10 lg:-bottom-5 xl:left-1 2xl:-bottom-10 lg:-left-10 md:h-32 md:w-32 lg:h-22 lg:w-32 xl:h-26 xl:w-25 2xl:h-44 2xl:w-30"
              />
            </div>
          )}

          {/* interactive floor plan minimap in bottom-right corner — compact by default, expands on hover */}
          {!loading && !failed && hasFloorPlan && (
            <div className="group absolute bottom-3 right-3 z-20 flex flex-col items-end sm:bottom-4 sm:right-4 md:bottom-5 md:right-6 lg:bottom-6 lg:right-6">
              <div className="relative overflow-hidden rounded-2xl border border-white/25 bg-[#070b17]/90 p-2 shadow-[0_16px_40px_rgba(0,0,0,0.75)] backdrop-blur-md transition-all duration-300 ease-out origin-bottom-right opacity-90 hover:opacity-100 hover:shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
                {/* Minimap Header */}
                <div className="mb-1.5 flex items-center justify-between gap-3 px-1 text-white/90">
                  <div className="flex items-center gap-1.5 text-[#e8c879]">
                    <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    <span className="text-[10px] font-semibold uppercase tracking-wider md:text-xs">
                      {floorTitle} Plan
                    </span>
                  </div>
                  <button
                    onClick={() => setMinimapOpen((v) => !v)}
                    className="rounded bg-white/10 px-2 py-0.5 text-[9px] font-medium text-white/70 hover:bg-white/20 hover:text-white transition-colors"
                  >
                    {minimapOpen ? "Hide" : "Show"}
                  </button>
                </div>

                {/* Interactive Floor Plan Canvas — increased base scale, expands larger on hover */}
                {minimapOpen && (
                  <div className="relative h-32 w-44 overflow-hidden rounded-xl border border-white/10 bg-slate-950/90 transition-all duration-300 ease-out group-hover:h-56 group-hover:w-72 md:h-40 md:w-56 md:group-hover:h-72 md:group-hover:w-96 lg:group-hover:h-80 lg:h-33 lg:w-55  lg:group-hover:w-105">
                    {planImg && (
                      <img
                        src={planImg}
                        alt={floorTitle}
                        className="h-full w-full object-contain pointer-events-none select-none opacity-85 transition-opacity duration-300 group-hover:opacity-100"
                      />
                    )}
                    {viewBox && regions.length > 0 && (
                      <svg
                        viewBox={viewBox}
                        preserveAspectRatio="xMidYMid meet"
                        className="absolute inset-0 h-full w-full"
                      >
                        {regions.map((r, i) => {
                          const isActive = regionName === r.name;
                          const isHovered = miniHovered === i;
                          const isOn = isActive || isHovered;
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
                            onMouseEnter: () => setMiniHovered(i),
                            onMouseLeave: () => setMiniHovered(null),
                            onClick: () => {
                              if (onSelectRegion) {
                                onSelectRegion(r.name);
                              }
                            },
                          };
                          // the shape doubles as the radar's ruler: its bbox
                          // centre is where this room sits on the plan
                          const hold = (el) => {
                            if (el) regionShapes.current.set(i, el);
                            else regionShapes.current.delete(i);
                          };
                          return r.type === "polygon" ? (
                            <polygon
                              key={i}
                              ref={hold}
                              points={r.points}
                              {...common}
                            />
                          ) : (
                            <path key={i} ref={hold} d={r.d} {...common} />
                          );
                        })}
                      </svg>
                    )}

                    {/* View-direction radar — its hub sits dead centre of the
                        plan (the image is object-contain, so the box centre is
                        the plan's centre) and the cone turns with the live yaw.
                        pointer-events-none, so room hover/click still works. */}
                    {radarCfg.visible && (
                      <FloorPlanRadar
                        heading={radarHeadingDeg}
                        fov={radarFovDeg}
                        north={planNorthDeg}
                        arcDeg={radarArcDeg}
                        arcCenterDeg={radarArcCenterDeg}
                        frame={planFrame}
                        center={radarCenter}
                        className="absolute inset-0 h-full w-full"
                      />
                    )}

                    {/* Room/Region Name Tooltip */}
                    {miniHovered !== null && regions[miniHovered] && (
                      <div className="pointer-events-none absolute bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/20 bg-black/90 px-2.5 py-0.5 text-[10px] font-medium text-white shadow-lg backdrop-blur-sm">
                        {regions[miniHovered].name}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          {/* radar aiming panel (?radar=1) — look at a room you can point to on
              the plan, nudge until the cone covers it, pick the scope the
              correction belongs to, then Copy the session's dial-ins into
              floorPlanRadarData.js */}
          {aimingRadar && !failed && (
            <PanoRadarTuner
              scope={radarScope}
              onScope={setRadarScope}
              facing={radarDeg}
              fileFacing={fileFacing}
              derived={autoFacing}
              headingDeg={radarHeadingDeg}
              buildingId={buildingId}
              floorLabel={String(floorKey(floor))}
              regionName={regionName}
              count={Object.keys(radarTune).length}
              copied={copied}
              onNudge={nudgeRadar}
              onReset={resetRadar}
              onClear={() => setRadarTune({})}
              onCopy={copyRadar}
            />
          )}

          {/* compass aiming panel (?compass=1) — face a landmark you know the
              direction of and nudge northDeg until the compass agrees, park the
              pin where you want it, then Copy into panoData.js */}
          {calibrating && !failed && (
            <div
              className={`absolute bottom-24 z-20 w-56 rounded-md border border-white/15 bg-[#0e1726]/90 p-3 font-mono text-[11px] text-white/80 shadow-[0_18px_40px_rgba(0,0,0,0.55)] backdrop-blur-md md:bottom-36 ${
                // step aside when the radar panel has the corner
                aimingRadar ? "left-68 md:left-72" : "left-5 md:left-8"
              }`}
            >
              <p className="mb-2 text-[10px] tracking-[0.18em] text-[#e8c879] uppercase">
                Compass aim
              </p>
              <p className="truncate text-white/45">
                {buildingId} · {String(floorKey(floor))}
                {regionName ? ` · ${regionName}` : ""}
              </p>
              <p className="text-white/45">
                yaw {Math.round(toDeg(angles.yaw))}° → facing{" "}
                <span className="text-white/70">{Math.round(headingDeg)}°</span>
              </p>

              {[
                { label: "northDeg", value: northDeg, axis: "north" },
                { label: "pinDeg", value: pinDeg, axis: "pin" },
              ].map(({ label, value, axis }) => (
                <div key={axis} className="mt-2">
                  <p className="text-white">
                    {label} <span className="text-[#e8c879]">{value}°</span>
                  </p>
                  <div className="mt-1 flex items-center gap-1">
                    {[-15, -5, -1, 1, 5, 15].map((step) => (
                      <button
                        key={step}
                        onClick={() =>
                          setNudge((n) => ({ ...n, [axis]: n[axis] + step }))
                        }
                        className="flex-1 rounded-sm border border-white/20 py-1 text-[10px] transition-colors hover:border-[#e8c879]/70 hover:text-[#e8c879]"
                      >
                        {step > 0 ? `+${step}` : step}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="mt-2 flex items-center gap-1">
                <button
                  onClick={() => setNudge({ north: 0, pin: 0 })}
                  className="flex-1 rounded-sm border border-white/20 py-1 transition-colors hover:border-[#e8c879]/70 hover:text-[#e8c879]"
                >
                  Reset
                </button>
                <button
                  onClick={copyCompass}
                  className="flex-1 rounded-sm border border-white/20 py-1 transition-colors hover:border-[#e8c879]/70 hover:text-[#e8c879]"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          )}

 
          {/* bottom toolbar */}
          {!failed && (
            <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-[#d7bf78]/50 bg-white p-1.5 opacity-90 shadow-[0_12px_30px_rgba(31,42,64,0.12)] backdrop-blur-md hover:opacity-100 xl:h-13 xl:-bottom-px 2xl:bottom-2 3xl:bottom-3 xl:mb-5">
              <button
                onClick={() => zoom(1.15)}
                aria-label="Zoom out"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#212C42] text-lg text-white transition-colors hover:bg-[#3e3b33]"
              >
                −
              </button>
              <button
                onClick={resetView}
                className="p-2 text-xs tracking-wider  uppercase transition-colors hover:border-[#767889] hover:text-[#c3b947] text-[#302f2a]"
              >
                Reset
              </button>
              <button
                onClick={() => zoom(0.87)}
                aria-label="Zoom in"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#212C42] text-lg text-white transition-colors hover:bg-[#444036]"
              >
                +
              </button>
              

              {/* <span className="mx-1 hidden h-5 w-px bg-white/20 sm:block" /> */}

              {/* live angles — read these off to tune FLOOR_PANO_MAP */}
              {/* <span className="hidden px-2 font-mono text-[11px] tracking-wide text-[#212C42] sm:inline">
                yaw {Math.round(toDeg(angles.yaw))}° · pitch{" "}
                {Math.round(toDeg(angles.pitch))}° · fov{" "}
                {Math.round(toDeg(angles.fov))}°
              </span>
              <button
                onClick={copyConfig}
                className="rounded-full px-3 py-1 text-xs tracking-wider uppercase transition-colors bg-white/15 hover:text-[#e8c879]"
              >
                {copied ? "Copied!" : "Copy config"}
              </button> */}
            </div>
          )}
        </>
      ) : (
        /* floor has no pano yet */
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center text-white/80">
          <p className="text-[11px] tracking-[4px] text-white/50 uppercase">
            360° view coming soon
          </p>
          <p className="mt-3 font-serif text-2xl text-[#e8c879] italic">
            {floorTitle}
          </p>
          <p className="mt-2 text-sm text-white/60">
            No exterior 360° capture exists for this floor yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default PanoViewer;
