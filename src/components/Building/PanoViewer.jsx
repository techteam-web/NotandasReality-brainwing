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
 */

// Vertical look range allowed around the configured pitch.
const PITCH_HALF_RANGE = (40 * Math.PI) / 180;
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
  onClose,
}) => {
  const panoRef = useRef(null);
  const viewerRef = useRef(null);
  const viewRef = useRef(null);
  const rafRef = useRef(0);
  const menuRef = useRef(null); // dropdown wrapper, for outside-click detection
  const menuItemRef = useRef(null); // the open floor's row in the dropdown

  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [angles, setAngles] = useState({ yaw: 0, pitch: 0, fov: 0 });
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // ?compass=1 opens the compass-aiming panel (an authoring aid, off in normal
  // visits); the nudges are the trial offsets it applies live.
  const [calibrating] = useState(
    () => new URLSearchParams(window.location.search).get("compass") === "1",
  );
  const [nudge, setNudge] = useState({ north: 0, pin: 0 });

  // Compass aim for this floor/room — straight from panoData, plus whatever the
  // calibration panel is trying out (0 / 0 in a normal visit). `northDeg` is the
  // hand-set calibration; `headingDeg` is that plus the live drag, and is what
  // the compass actually shows.
  const northDeg = wrapDeg((pano?.northDeg ?? 0) + nudge.north);
  const pinDeg = wrapDeg((pano?.pinDeg ?? 0) + nudge.pin);
  const headingDeg = wrapDeg(panoHeadingDeg(pano, angles.yaw) + nudge.north);

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
        const limiter = Marzipano.util.compose(
          limit.traditional(pano.faceSize, (100 * Math.PI) / 180, maxHfov),
          limitYawArc(yaw, half),
          limit.pitch(pitch - PITCH_HALF_RANGE, pitch + PITCH_HALF_RANGE),
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
          setAngles({ yaw: view.yaw(), pitch: view.pitch(), fov: view.fov() });
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

  // Calibration panel's copy: the compass aim you just dialled in. Paste it on
  // the building (every floor), this floor's FLOOR_PANO_MAP entry, or this
  // room's REGION_PANO_MAP entry — whichever scope the direction belongs to.
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
      <div className="absolute top-0 right-0 left-0 z-10 flex items-center justify-between px-6 py-4 md:px-10">
        <div className="text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
          <p className="text-[14px] tracking-[3px] text-white uppercase">
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
                className="custom-scrollbar absolute top-[calc(100%+10px)] left-0 z-30 max-h-[58vh] w-56 overflow-y-auto rounded-md border border-white/15 bg-[#0e1726]/95 p-1.5 shadow-[0_18px_40px_rgba(0,0,0,0.55)] backdrop-blur-md md:w-64"
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

        <button
          onClick={onClose}
          aria-label="Close 360° view"
          className="group absolute top-4 right-6 inline-flex items-center gap-2 border border-[#212C42] bg-[#212C42] px-4 py-2 text-xs tracking-[0.2em] text-white uppercase shadow-[0_10px_24px_rgba(184,134,11,0.22)] transition-colors hover:border-[#767889] hover:bg-[#4E5157] md:top-4 md:right-10"
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

          {/* realtime mini compass and brand mark in small bottom left corner */}
          {!loading && !failed && (
            <div className="pointer-events-none absolute bottom-5 left-5 z-10 flex items-center gap-3 md:bottom-8 md:left-8 md:gap-4">
              <MiniCompass
                heading={headingDeg}
                pinDeg={pinDeg}
                transitionMs={0}
                className="h-16 w-16 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] md:h-24 md:w-24 lg:w-20 xl:w-22 2xl:w-28"
              />
              
            </div>
          )}
          {/* compass aiming panel (?compass=1) — face a landmark you know the
              direction of and nudge northDeg until the compass agrees, park the
              pin where you want it, then Copy into panoData.js */}
          {calibrating && !failed && (
            <div className="absolute bottom-24 left-5 z-20 w-56 rounded-md border border-white/15 bg-[#0e1726]/90 p-3 font-mono text-[11px] text-white/80 shadow-[0_18px_40px_rgba(0,0,0,0.55)] backdrop-blur-md md:bottom-36 md:left-8">
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

          <NotandasNMark
                className="relative left-[95%] top-[80%] h-12 w-18 opacity-90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] md:h-16 md:w-10 lg:h-56 lg:w-25 xl:top-[78%] xl:left-[94%] lg:top-[73%] lg:left-[93%] 2xl:top-[82%] 2xl:left-[94%] 3xl:top-[85%] 3xl:left-[96%] 4xl:top-[88%] 4xl:left-[96%]"
                aria-label={buildingName || "Notandas Realty"}
              />
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
